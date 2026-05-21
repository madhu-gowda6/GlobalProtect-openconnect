mod ipc;

use anyhow::{Context, Result};
use base64::{Engine, engine::general_purpose::STANDARD as B64};
use clap::Parser;
use ipc::IpcHandle;
use tauri::{AppHandle, Manager, State, WebviewUrl, WebviewWindowBuilder};
use tokio::io::AsyncReadExt;

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
fn quit_app(app: AppHandle) {
  app.exit(0);
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
    .invoke_handler(tauri::generate_handler![
      open_settings,
      quit_app,
      disconnect_vpn,
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
