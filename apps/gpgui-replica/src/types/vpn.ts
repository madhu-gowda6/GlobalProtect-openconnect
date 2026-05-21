// Mirrors gpapi::service::vpn_state::VpnState (externally tagged, camelCase).
//
// Unit variants serialize as bare strings ("disconnected" / "disconnecting"),
// data variants as { connecting: ConnectInfo } / { connected: ConnectedInfo }.

export type Gateway = { name: string; address: string };
export type ConnectInfo = {
  portal: string;
  gateway: Gateway;
  gateways: Gateway[];
};

export type SessionInfo = {
  lifetimeSecs?: number;
  allowExtendSession?: boolean;
  // Other fields exist on the Rust side; only declared what we use.
};

export type ConnectedInfo = {
  info: ConnectInfo;
  sessionInfo?: SessionInfo;
};

export type VpnState =
  | "disconnected"
  | "disconnecting"
  | { connecting: ConnectInfo }
  | { connected: ConnectedInfo };

import { ConnectionStatus } from "./connection";

export function vpnStateToStatus(s: VpnState): ConnectionStatus {
  if (s === "disconnected") return "disconnected";
  if (s === "disconnecting") return "disconnecting";
  if ("connecting" in s) return "connecting";
  return "connected";
}

export function vpnStatePortal(s: VpnState): string | undefined {
  if (typeof s === "string") return undefined;
  if ("connecting" in s) return s.connecting.portal;
  return s.connected.info.portal;
}
