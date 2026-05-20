use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

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

pub fn run() {
  env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![open_settings, quit_app])
    .setup(|app| {
      log::info!("gpgui-replica starting");
      let _ = app.get_webview_window("main");
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
