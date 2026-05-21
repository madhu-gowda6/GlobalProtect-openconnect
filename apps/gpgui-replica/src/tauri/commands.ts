import { invoke } from "@tauri-apps/api/core";

export const openSettings = () => invoke<void>("open_settings");
export const quitApp = () => invoke<void>("quit_app");
export const disconnectVpn = () => invoke<void>("disconnect_vpn");
