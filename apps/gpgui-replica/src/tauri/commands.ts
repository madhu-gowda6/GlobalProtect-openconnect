import { invoke } from "@tauri-apps/api/core";
import { VpnState } from "../types/vpn";

export type StatusSnapshot = {
  serviceUp: boolean;
  vpnState: VpnState | null;
};

export const getStatus = () => invoke<StatusSnapshot>("get_status");

export type ConnectOptions = {
  ignoreTlsErrors?: boolean;
  hip?: boolean;
  os?: string;
  osVersion?: string;
  clientVersion?: string;
  userAgent?: string;
  gateway?: string;
};

export const openSettings = () => invoke<void>("open_settings");
export const quitApp = () => invoke<void>("quit_app");
export const disconnectVpn = () => invoke<void>("disconnect_vpn");
export const connectPortal = (portal: string, options: ConnectOptions = {}) =>
  invoke<void>("connect_portal", { portal, options });
export const submitMfa = (otp: string) => invoke<void>("submit_mfa", { otp });
export const cancelMfa = () => invoke<void>("cancel_mfa");
export const submitCredentials = (username: string, password: string) =>
  invoke<void>("submit_credentials", { username, password });
export const cancelCredentials = () => invoke<void>("cancel_credentials");
