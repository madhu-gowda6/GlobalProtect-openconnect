use std::path::PathBuf;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tokio::fs;

/// All persisted user settings for gpgui.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    // General
    pub theme: String,
    pub hidpi: bool,
    pub start_minimized: bool,
    pub auto_connect: bool,
    pub resume_on_wake: bool,
    pub symbolic_tray_icon: bool,

    // Connection
    pub os: String,
    pub os_version: String,
    pub client_version: String,
    pub user_agent: String,
    pub vpnc_script: String,
    pub local_hostname: String,
    pub reconnect_timeout: String,
    pub mtu: String,
    pub force_dpd: String,
    pub hip_enabled: bool,
    pub hip_script: String,
    pub disable_ipv6: bool,

    // Authentication
    pub reuse_cookies: bool,
    pub external_browser: bool,
    pub client_cert: bool,

    // SSL/TLS
    pub openssl_legacy: bool,
    pub ignore_tls_errors: bool,

    // State
    pub recent_portals: Vec<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            hidpi: false,
            start_minimized: false,
            auto_connect: false,
            resume_on_wake: false,
            symbolic_tray_icon: false,

            os: "Linux".to_string(),
            os_version: "Linux Ubuntu 24.04.4 LTS".to_string(),
            client_version: "6.3.0-33".to_string(),
            user_agent: String::new(),
            vpnc_script: "/usr/libexec/gpclient/vpnc-script".to_string(),
            local_hostname: String::new(),
            reconnect_timeout: String::new(),
            mtu: String::new(),
            force_dpd: String::new(),
            hip_enabled: true,
            hip_script: "/usr/libexec/gpclient/hipreport.sh".to_string(),
            disable_ipv6: false,

            reuse_cookies: true,
            external_browser: false,
            client_cert: false,

            openssl_legacy: false,
            ignore_tls_errors: false,

            recent_portals: Vec::new(),
        }
    }
}

fn settings_path() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("/tmp"))
        .join("gpgui")
        .join("settings.json")
}

pub async fn load_settings() -> Settings {
    let path = settings_path();
    match fs::read_to_string(&path).await {
        Ok(contents) => serde_json::from_str(&contents).unwrap_or_default(),
        Err(_) => Settings::default(),
    }
}

pub async fn save_settings_to_disk(settings: &Settings) -> Result<()> {
    let path = settings_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .await
            .context("create settings directory")?;
    }
    let json = serde_json::to_string_pretty(settings).context("serialize settings")?;
    fs::write(&path, json).await.context("write settings file")?;
    Ok(())
}

pub async fn add_recent_portal(portal: &str) -> Result<()> {
    let mut settings = load_settings().await;
    let portal = portal.to_string();
    settings.recent_portals.retain(|p| p != &portal);
    settings.recent_portals.insert(0, portal);
    settings.recent_portals.truncate(10);
    save_settings_to_disk(&settings).await
}
