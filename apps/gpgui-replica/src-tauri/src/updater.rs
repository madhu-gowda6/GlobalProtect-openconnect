use serde::Serialize;

const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");
const RELEASES_API: &str =
    "https://api.github.com/repos/madhu-gowda6/GlobalProtect-openconnect/releases/latest";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub available: bool,
    pub current_version: String,
    pub latest_version: String,
    pub release_url: String,
    pub release_notes: String,
}

#[tauri::command]
pub async fn check_for_updates() -> Result<UpdateInfo, String> {
    let client = reqwest::Client::builder()
        .user_agent(format!("gpgui-replica/{CURRENT_VERSION}"))
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let resp: serde_json::Value = client
        .get(RELEASES_API)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let latest_tag = resp["tag_name"]
        .as_str()
        .unwrap_or("")
        .trim_start_matches('v')
        .to_string();

    let release_url = resp["html_url"]
        .as_str()
        .unwrap_or(RELEASES_API)
        .to_string();

    let release_notes = resp["body"]
        .as_str()
        .unwrap_or("")
        .lines()
        .take(6)
        .collect::<Vec<_>>()
        .join("\n");

    let available = !latest_tag.is_empty()
        && semver_newer(latest_tag.as_str(), CURRENT_VERSION);

    Ok(UpdateInfo {
        available,
        current_version: CURRENT_VERSION.to_string(),
        latest_version: latest_tag,
        release_url,
        release_notes,
    })
}

/// Returns true if `candidate` is strictly newer than `current` (simple semver).
fn semver_newer(candidate: &str, current: &str) -> bool {
    let parse = |s: &str| -> (u32, u32, u32) {
        let parts: Vec<u32> = s.split('.').filter_map(|p| p.parse().ok()).collect();
        (
            parts.first().copied().unwrap_or(0),
            parts.get(1).copied().unwrap_or(0),
            parts.get(2).copied().unwrap_or(0),
        )
    };
    parse(candidate) > parse(current)
}
