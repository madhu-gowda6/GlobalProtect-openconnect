use std::time::Duration;

use anyhow::{Context, Result};
use futures_util::{SinkExt, StreamExt};
use gpapi::{
  service::{
    event::WsEvent,
    request::{DisconnectRequest, WsRequest},
  },
  utils::{crypto::Crypto, endpoint::ws_endpoint},
};
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;

/// Channel handle exposed to Tauri commands so they can push outbound
/// WsRequests into the WebSocket task.
pub struct IpcHandle {
  pub tx: mpsc::Sender<WsRequest>,
}

impl IpcHandle {
  pub async fn send(&self, req: WsRequest) -> Result<()> {
    self
      .tx
      .send(req)
      .await
      .context("ipc channel closed; ws task not running")
  }
}

/// Spawn the background WS task. Returns an [`IpcHandle`] that lives in
/// Tauri-managed state. Reconnects forever with a 2-second backoff.
pub fn spawn(app: AppHandle, api_key: Vec<u8>) -> IpcHandle {
  let (tx, rx) = mpsc::channel::<WsRequest>(32);

  tokio::spawn(async move {
    run_forever(app, api_key, rx).await;
  });

  IpcHandle { tx }
}

async fn run_forever(app: AppHandle, api_key: Vec<u8>, mut rx: mpsc::Receiver<WsRequest>) {
  loop {
    match connect_and_loop(&app, &api_key, &mut rx).await {
      Ok(()) => log::info!("ws: connection closed cleanly"),
      Err(err) => log::warn!("ws: {err:#}"),
    }

    // While we are disconnected from gpservice, surface that to the UI so
    // the button doesn't get stuck on "Disconnecting...".
    let _ = app.emit("vpn-service-status", "disconnected");

    tokio::time::sleep(Duration::from_secs(2)).await;
  }
}

async fn connect_and_loop(
  app: &AppHandle,
  api_key: &[u8],
  rx: &mut mpsc::Receiver<WsRequest>,
) -> Result<()> {
  let url = ws_endpoint().await.context("read gpservice port")?;
  log::info!("ws: connecting to {url}");

  let (ws, _resp) = tokio_tungstenite::connect_async(&url)
    .await
    .context("ws connect")?;
  log::info!("ws: connected");
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
            Ok(event) => dispatch_event(app, event),
            Err(err) => log::warn!("ws: failed to decrypt event: {err:#}"),
          },
          Message::Close(_) => {
            log::info!("ws: server sent close");
            break;
          }
          // tokio-tungstenite handles Ping/Pong automatically.
          _ => {}
        }
      }
    }
  }

  Ok(())
}

fn dispatch_event(app: &AppHandle, event: WsEvent) {
  match event {
    WsEvent::VpnState(state) => {
      if let Err(err) = app.emit("vpn-state", &state) {
        log::warn!("emit vpn-state: {err}");
      }
    }
    WsEvent::VpnEnv(env) => {
      if let Err(err) = app.emit("vpn-env", &env) {
        log::warn!("emit vpn-env: {err}");
      }
    }
    WsEvent::ActiveGui => {
      // gpservice received `/active-gui` (another launch attempt). Surface
      // our main window like the proprietary client does.
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

/// Convenience helper used by the disconnect Tauri command.
pub async fn send_disconnect(handle: &IpcHandle) -> Result<()> {
  handle.send(WsRequest::Disconnect(DisconnectRequest)).await
}
