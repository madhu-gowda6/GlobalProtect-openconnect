mod connect;
mod ipc;
mod settings;

use anyhow::{Context, Result};
use base64::{Engine, engine::general_purpose::STANDARD as B64};
use clap::Parser;
use gpapi::service::vpn_state::VpnState;
use ipc::IpcHandle;
use serde::Serialize;
use settings::Settings;
use tauri::{AppHandle, Manager, State, WebviewUrl, WebviewWindowBuilder};
use tokio::io::AsyncReadExt;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct StatusSnapshot {
  service_up: bool,
  vpn_state: Option<VpnState>,
}

/// Frontend calls this once on mount to sync initial state, since the WS may
/// connect before the webview has subscribed to events.
#[tauri::command]
fn get_status(handle: State<'_, IpcHandle>) -> StatusSnapshot {
  StatusSnapshot {
    service_up: handle.is_connected(),
    vpn_state: handle.vpn_env().map(|e| e.vpn_state),
  }
}

#[derive(Parser, Debug)]
#[command(version, about)]
struct Cli {
  /// Read the base64-encoded gpservice api_key from stdin. Set by
  /// `gpapi::process::gui_launcher::GuiLauncher` when gpservice spawns us.
  #[arg(long)]
  api_key_on_stdin: bool,

  /// Start the window minimized to the tray.
  #[arg(long)]
  minimized: bool,
}

#[tauri::command]
async fn disconnect_vpn(handle: State<'_, IpcHandle>) -> Result<(), String> {
  ipc::send_disconnect(&handle).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn connect_portal(
  app: AppHandle,
  handle: State<'_, IpcHandle>,
  portal: String,
  options: connect::ConnectOptions,
) -> Result<(), String> {
  connect::connect_portal(app, &handle, portal, options)
    .await
    .map_err(|e| format!("{e:#}"))
}

#[tauri::command]
async fn open_settings(app: AppHandle) -> Result<(), String> {
  if let Some(win) = app.get_webview_window("settings") {
    let _ = win.set_focus();
    return Ok(());
  }

  WebviewWindowBuilder::new(&app, "settings", WebviewUrl::App("index.html".into()))
    .title("GP Connect Settings")
    .inner_size(900.0, 700.0)
    .min_inner_size(800.0, 600.0)
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
fn submit_mfa(handle: State<'_, IpcHandle>, otp: String) -> Result<(), String> {
  match handle.take_mfa_sender() {
    Some(tx) => tx.send(otp).map_err(|_| "MFA request is no longer active".to_string()),
    None => Err("No pending MFA request".to_string()),
  }
}

#[tauri::command]
fn cancel_mfa(handle: State<'_, IpcHandle>) {
  // Dropping the sender makes the awaiting connect flow abort with "cancelled".
  let _ = handle.take_mfa_sender();
}

#[tauri::command]
fn submit_credentials(
  handle: State<'_, IpcHandle>,
  username: String,
  password: String,
) -> Result<(), String> {
  match handle.take_creds_sender() {
    Some(tx) => tx
      .send((username, password))
      .map_err(|_| "Login request is no longer active".to_string()),
    None => Err("No pending login request".to_string()),
  }
}

#[tauri::command]
fn cancel_credentials(handle: State<'_, IpcHandle>) {
  let _ = handle.take_creds_sender();
}

#[tauri::command]
fn quit_app(app: AppHandle) {
  app.exit(0);
}

#[tauri::command]
async fn get_settings() -> Result<Settings, String> {
  Ok(settings::load_settings().await)
}

#[tauri::command]
async fn save_settings(settings: Settings) -> Result<(), String> {
  settings::save_settings_to_disk(&settings)
    .await
    .map_err(|e| e.to_string())
}

async fn read_api_key(cli: &Cli) -> Result<Vec<u8>> {
  if cli.api_key_on_stdin {
    let mut buf = String::new();
    tokio::io::stdin()
      .read_to_string(&mut buf)
      .await
      .context("read api_key from stdin")?;
    let decoded = B64.decode(buf.trim()).context("base64-decode api_key")?;
    return Ok(decoded);
  }

  #[cfg(debug_assertions)]
  {
    log::warn!("no --api-key-on-stdin; using debug GP_API_KEY (zeros)");
    Ok(gpapi::GP_API_KEY.to_vec())
  }
  #[cfg(not(debug_assertions))]
  {
    anyhow::bail!("--api-key-on-stdin is required in release builds");
  }
}

pub async fn run() {
  env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

  let cli = Cli::parse();
  let api_key = read_api_key(&cli).await.expect("read api key");

  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      open_settings,
      quit_app,
      disconnect_vpn,
      connect_portal,
      submit_mfa,
      cancel_mfa,
      submit_credentials,
      cancel_credentials,
      get_status,
      get_settings,
      save_settings,
    ])
    .setup(move |app| {
      log::info!("gpgui-replica starting");
      let handle = ipc::spawn(app.handle().clone(), api_key.clone());
      app.manage(handle);
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
