use anyhow::{Result, bail};
use common::constants::{GP_CLIENT_VERSION, GP_USER_AGENT};
use gpapi::{
  credential::{Credential, PasswordCredential},
  gateway::{Gateway, GatewayLogin, gateway_login},
  gp_params::{ClientOs, GpParams},
  portal::{Prelogin, SamlPrelogin, StandardPrelogin, prelogin, retrieve_config},
  process::auth_launcher::SamlAuthLauncher,
  service::{request::{ConnectRequest, WsRequest}, vpn_state::ConnectInfo},
  utils::host_utils,
};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

use crate::ipc::IpcHandle;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CredentialPrompt {
  message: String,
  username_label: String,
  password_label: String,
}

#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ConnectOptions {
  #[serde(default)]
  pub ignore_tls_errors: bool,
  #[serde(default)]
  pub hip: bool,
  /// "Linux" | "Windows" | "Mac"
  #[serde(default)]
  pub os: Option<String>,
  #[serde(default)]
  pub os_version: Option<String>,
  #[serde(default)]
  pub client_version: Option<String>,
  #[serde(default)]
  pub user_agent: Option<String>,
  /// Specific gateway name or address; if absent, the preferred one is used.
  #[serde(default)]
  pub gateway: Option<String>,
}

fn progress(app: &AppHandle, msg: &str) {
  log::info!("connect: {msg}");
  let _ = app.emit("connect-progress", msg);
}

fn default_os_version(os: &ClientOs) -> String {
  match os {
    ClientOs::Linux => host_utils::get_linux_os_string().to_string(),
    ClientOs::Windows => host_utils::get_windows_os_string().to_string(),
    ClientOs::Mac => host_utils::get_macos_os_string().to_string(),
  }
}

/// Emit `mfa-required` and await the OTP from `submit_mfa`. Errors if cancelled.
async fn request_mfa(app: &AppHandle, handle: &IpcHandle, message: &str) -> Result<String> {
  let (tx, rx) = tokio::sync::oneshot::channel::<String>();
  handle.set_mfa_sender(tx);

  app
    .emit("mfa-required", message)
    .map_err(|e| anyhow::anyhow!("failed to prompt for MFA: {e}"))?;

  rx.await.map_err(|_| anyhow::anyhow!("MFA was cancelled"))
}

/// Emit `credentials-required` and await (username, password) from
/// `submit_credentials`. Errors if cancelled.
async fn request_credentials(
  app: &AppHandle,
  handle: &IpcHandle,
  prelogin: &StandardPrelogin,
) -> Result<(String, String)> {
  let (tx, rx) = tokio::sync::oneshot::channel::<(String, String)>();
  handle.set_creds_sender(tx);

  app
    .emit(
      "credentials-required",
      CredentialPrompt {
        message: prelogin.auth_message().to_string(),
        username_label: prelogin.label_username().to_string(),
        password_label: prelogin.label_password().to_string(),
      },
    )
    .map_err(|e| anyhow::anyhow!("failed to prompt for credentials: {e}"))?;

  rx.await.map_err(|_| anyhow::anyhow!("Login was cancelled"))
}

#[allow(clippy::too_many_arguments)]
async fn saml_auth(
  app: &AppHandle,
  server: &str,
  is_gateway: bool,
  saml: &SamlPrelogin,
  user_agent: &str,
  os: &ClientOs,
  os_version: &str,
  ignore_tls_errors: bool,
  auth_executable: Option<&str>,
) -> Result<Credential> {
  progress(app, "Waiting for single sign-on...");
  SamlAuthLauncher::new(server)
    .auth_executable(auth_executable)
    .gateway(is_gateway)
    .saml_request(saml.saml_request())
    .user_agent(user_agent)
    .os(os.as_str())
    .os_version(Some(os_version))
    .ignore_tls_errors(ignore_tls_errors)
    .launch()
    .await
}

/// Run gateway login, prompting for MFA on each challenge until a cookie is
/// obtained. Propagates non-MFA errors (so the caller can fall back).
async fn login_gateway(
  app: &AppHandle,
  handle: &IpcHandle,
  gateway: &str,
  cred: &Credential,
  gp_params: &GpParams,
) -> Result<String> {
  let mut params = gp_params.clone();
  loop {
    match gateway_login(gateway, cred, &params).await? {
      GatewayLogin::Cookie(cookie) => return Ok(cookie),
      GatewayLogin::Mfa(message, input_str) => {
        progress(app, "Multi-factor authentication required...");
        let otp = request_mfa(app, handle, &message).await?;
        params.set_input_str(&input_str);
        params.set_otp(&otp);
      }
    }
  }
}

pub async fn connect_portal(
  app: AppHandle,
  handle: &IpcHandle,
  portal: String,
  opts: ConnectOptions,
) -> Result<()> {
  let portal = portal.trim().to_string();
  if portal.is_empty() {
    bail!("Portal address is empty");
  }

  let os = opts.os.as_deref().map(ClientOs::from).unwrap_or(ClientOs::Linux);
  let os_version = opts
    .os_version
    .clone()
    .unwrap_or_else(|| default_os_version(&os));
  let client_version = opts
    .client_version
    .clone()
    .unwrap_or_else(|| GP_CLIENT_VERSION.to_string());
  let user_agent = opts
    .user_agent
    .clone()
    .unwrap_or_else(|| format!("{}/{} ({})", GP_USER_AGENT, client_version, os_version));

  let gp_params = GpParams::builder()
    .user_agent(&user_agent)
    .client_os(os.clone())
    .os_version(Some(os_version.clone()))
    .client_version(Some(client_version.clone()))
    .ignore_tls_errors(opts.ignore_tls_errors)
    .build();

  let env = handle.vpn_env();
  let auth_executable = env.as_ref().map(|e| e.auth_executable.clone());
  let vpnc_script = env.as_ref().and_then(|e| e.vpnc_script.clone());

  // ---- Phase 1: portal authentication ----
  progress(&app, "Authenticating with portal...");
  let portal_prelogin = prelogin(&portal, &gp_params).await?;

  // Remember a typed password so the gateway fallback doesn't re-prompt.
  let mut saved_password: Option<(String, String)> = None;
  let cred: Credential = match &portal_prelogin {
    Prelogin::Saml(saml) => {
      saml_auth(
        &app,
        &portal,
        false,
        saml,
        &user_agent,
        &os,
        &os_version,
        opts.ignore_tls_errors,
        auth_executable.as_deref(),
      )
      .await?
    }
    Prelogin::Standard(standard) => {
      progress(&app, "Waiting for credentials...");
      let (username, password) = request_credentials(&app, handle, standard).await?;
      saved_password = Some((username.clone(), password.clone()));
      PasswordCredential::new(&username, &password).into()
    }
  };

  progress(&app, "Retrieving portal configuration...");
  let mut portal_config = retrieve_config(&portal, &cred, &gp_params).await?;
  portal_config.sort_gateways(portal_prelogin.region());

  let all_gateways: Vec<Gateway> = portal_config.gateways().into_iter().cloned().collect();
  if all_gateways.is_empty() {
    bail!("Portal returned no gateways");
  }

  let gateway = match &opts.gateway {
    Some(g) => all_gateways
      .iter()
      .find(|x| x.name() == g || x.server() == g)
      .cloned()
      .ok_or_else(|| anyhow::anyhow!("Gateway not found: {g}"))?,
    None => all_gateways[0].clone(),
  };

  // ---- Phase 2: gateway login ----
  // First try the portal's auth cookie. If the gateway rejects it (common
  // when portal and gateway authenticate separately), authenticate directly
  // against the gateway, reusing the typed credentials.
  progress(&app, &format!("Logging in to gateway {}...", gateway.name()));
  let auth_cookie_cred: Credential = portal_config.auth_cookie().into();

  let cookie = match login_gateway(&app, handle, gateway.server(), &auth_cookie_cred, &gp_params).await
  {
    Ok(cookie) => cookie,
    Err(cookie_err) => {
      log::warn!("gateway cookie login failed: {cookie_err:#}; trying direct gateway auth");
      progress(&app, "Authenticating with gateway...");

      let mut gw_params = gp_params.clone();
      gw_params.set_is_gateway(true);

      let gw_prelogin = prelogin(gateway.server(), &gw_params).await?;
      let gw_cred: Credential = match &gw_prelogin {
        Prelogin::Saml(saml) => {
          saml_auth(
            &app,
            gateway.server(),
            true,
            saml,
            &user_agent,
            &os,
            &os_version,
            opts.ignore_tls_errors,
            auth_executable.as_deref(),
          )
          .await?
        }
        Prelogin::Standard(standard) => match &saved_password {
          Some((username, password)) => PasswordCredential::new(username, password).into(),
          None => {
            progress(&app, "Waiting for credentials...");
            let (username, password) = request_credentials(&app, handle, standard).await?;
            PasswordCredential::new(&username, &password).into()
          }
        },
      };

      login_gateway(&app, handle, gateway.server(), &gw_cred, &gw_params).await?
    }
  };

  // ---- Phase 3: hand the tunnel to gpservice ----
  progress(&app, "Establishing tunnel...");
  let cfg_version = portal_config
    .version()
    .map(|s| s.to_string())
    .unwrap_or_else(|| client_version.clone());
  let allow_extend = portal_config.allow_extend_session().unwrap_or(false);

  let info = ConnectInfo::new(portal.clone(), gateway, all_gateways);
  let mut req = ConnectRequest::new(info, cookie)
    .with_user_agent(user_agent)
    .with_os(os)
    .with_os_version(os_version)
    .with_client_version(&cfg_version)
    .with_allow_extend_session(allow_extend)
    .with_hip(opts.hip);

  if let Some(script) = vpnc_script {
    req = req.with_vpnc_script(script);
  }

  handle.send(WsRequest::Connect(Box::new(req))).await?;

  // Persist portal in recent list (best-effort, don't fail the connect).
  let _ = crate::settings::add_recent_portal(&portal).await;

  Ok(())
}
