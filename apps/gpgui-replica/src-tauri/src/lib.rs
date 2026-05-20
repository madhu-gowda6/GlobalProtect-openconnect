use tauri::Manager;

pub fn run() {
  env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

  tauri::Builder::default()
    .setup(|app| {
      log::info!("gpgui-replica starting (milestone 1: empty shell)");
      let _ = app.get_webview_window("main");
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
