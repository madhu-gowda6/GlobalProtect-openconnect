use std::sync::{Arc, Mutex};
use std::time::Duration;

use anyhow::{Context, Result};
use futures_util::{SinkExt, StreamExt};
use gpapi::{
  service::{
    event::WsEvent,
    request::{DisconnectRequest, WsRequest},
    vpn_env::VpnEnv,
  },
  utils::{crypto::Crypto, endpoint::ws_endpoint},
};
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::{mpsc, oneshot};
use tokio_tungstenite::tungstenite::Message;

/// Channel + shared env exposed to Tauri commands.
pub struct IpcHandle {
  tx: mpsc::Sender<WsRequest>,
  vpn_env: Arc<Mutex<Option<VpnEnv>>>,
  /// Sender for the OTP the user types when a gateway issues an MFA challenge.
  mfa_tx: Arc<Mutex<Option<oneshot::Sender<String>>>>,
  /// Sender for (username, password) when a portal uses standard login.
  creds_tx: Arc<Mutex<Option<oneshot::Sender<(String, String)>>>>,
  /// Whether the WS to gpservice is currently up (for initial-state sync).
  connected: Arc<Mutex<bool>>,
}

impl IpcHandle {
  pub async fn send(&self, req: WsRequest) -> Result<()> {
    self
      .tx
      .send(req)
      .await
      .context("ipc channel closed; ws task not running")
  }

  /// Latest VpnEnv reported by gpservice (vpnc_script, auth_executable, ...).
  pub fn vpn_env(&self) -> Option<VpnEnv> {
    self.vpn_env.lock().unwrap().clone()
  }

  pub fn set_mfa_sender(&self, tx: oneshot::Sender<String>) {
    *self.mfa_tx.lock().unwrap() = Some(tx);
  }

  /// Take the pending MFA sender, if any (used by submit_mfa / cancel_mfa).
  pub fn take_mfa_sender(&self) -> Option<oneshot::Sender<String>> {
    self.mfa_tx.lock().unwrap().take()
  }

  pub fn set_creds_sender(&self, tx: oneshot::Sender<(String, String)>) {
    *self.creds_tx.lock().unwrap() = Some(tx);
  }

  pub fn take_creds_sender(&self) -> Option<oneshot::Sender<(String, String)>> {
    self.creds_tx.lock().unwrap().take()
  }

  pub fn is_connected(&self) -> bool {
    *self.connected.lock().unwrap()
  }
}

/// Spawn the background WS task. Returns an [`IpcHandle`] for Tauri-managed
/// state. Reconnects forever with a 2-second backoff.
pub fn spawn(app: AppHandle, api_key: Vec<u8>) -> IpcHandle {
  let (tx, rx) = mpsc::channel::<WsRequest>(32);
  let vpn_env = Arc::new(Mutex::new(None));
  let connected = Arc::new(Mutex::new(false));
  let vpn_env_task = Arc::clone(&vpn_env);
  let connected_task = Arc::clone(&connected);

  tokio::spawn(async move {
    run_forever(app, api_key, rx, vpn_env_task, connected_task).await;
  });

  IpcHandle {
    tx,
    vpn_env,
    mfa_tx: Arc::new(Mutex::new(None)),
    creds_tx: Arc::new(Mutex::new(None)),
    connected,
  }
}

async fn run_forever(
  app: AppHandle,
  api_key: Vec<u8>,
  mut rx: mpsc::Receiver<WsRequest>,
  vpn_env: Arc<Mutex<Option<VpnEnv>>>,
  connected: Arc<Mutex<bool>>,
) {
  loop {
    match connect_and_loop(&app, &api_key, &mut rx, &vpn_env, &connected).await {
      Ok(()) => log::info!("ws: connection closed cleanly"),
      Err(err) => log::warn!("ws: {err:#}"),
    }

    *connected.lock().unwrap() = false;
    let _ = app.emit("vpn-service-status", "disconnected");
    tokio::time::sleep(Duration::from_secs(2)).await;
  }
}

async fn connect_and_loop(
  app: &AppHandle,
  api_key: &[u8],
  rx: &mut mpsc::Receiver<WsRequest>,
  vpn_env: &Arc<Mutex<Option<VpnEnv>>>,
  connected: &Arc<Mutex<bool>>,
) -> Result<()> {
  let url = ws_endpoint().await.context("read gpservice port")?;
  log::info!("ws: connecting to {url}");

  let (ws, _resp) = tokio_tungstenite::connect_async(&url)
    .await
    .context("ws connect")?;
  log::info!("ws: connected");
  *connected.lock().unwrap() = true;
  let _ = app.emit("vpn-service-status", "connected");

  let (mut write, mut read) = ws.split();
  let crypto = Crypto::new(api_key.to_vec());

  loop {
    tokio::select! {
      maybe_req = rx.recv() => {
        let Some(req) = maybe_req else { break };
        let encrypted = crypto.encrypt(&req).context("encrypt outbound")?;
        write
          .send(Message::Binary(encrypted.into()))
          .await
          .context("ws send")?;
      }
      maybe_msg = read.next() => {
        let Some(msg) = maybe_msg else { break };
        let msg = msg.context("ws recv")?;
        match msg {
          Message::Binary(data) => match crypto.decrypt::<WsEvent>(data.to_vec()) {
            Ok(event) => dispatch_event(app, event, vpn_env),
            Err(err) => log::warn!("ws: failed to decrypt event: {err:#}"),
          },
          Message::Close(_) => {
            log::info!("ws: server sent close");
            break;
          }
          _ => {}
        }
      }
    }
  }

  Ok(())
}

fn dispatch_event(app: &AppHandle, event: WsEvent, vpn_env: &Arc<Mutex<Option<VpnEnv>>>) {
  match event {
    WsEvent::VpnState(state) => {
      if let Err(err) = app.emit("vpn-state", &state) {
        log::warn!("emit vpn-state: {err}");
      }
    }
    WsEvent::VpnEnv(env) => {
      *vpn_env.lock().unwrap() = Some(env.clone());
      // Re-emit the embedded state so the UI reflects current status on connect.
      if let Err(err) = app.emit("vpn-state", &env.vpn_state) {
        log::warn!("emit vpn-state (from env): {err}");
      }
    }
    WsEvent::ActiveGui => {
      if let Some(win) = app.get_webview_window("main") {
        let _ = win.unminimize();
        let _ = win.show();
        let _ = win.set_focus();
      }
    }
    WsEvent::ResumeConnection => {
      let _ = app.emit("resume-connection", ());
    }
  }
}

pub async fn send_disconnect(handle: &IpcHandle) -> Result<()> {
  handle.send(WsRequest::Disconnect(DisconnectRequest)).await
}
