import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { VpnState } from "../types/vpn";

export type ServiceStatus = "connected" | "disconnected";

export const onVpnState = (handler: (state: VpnState) => void): Promise<UnlistenFn> =>
  listen<VpnState>("vpn-state", (e) => handler(e.payload));

export const onServiceStatus = (
  handler: (status: ServiceStatus) => void
): Promise<UnlistenFn> =>
  listen<ServiceStatus>("vpn-service-status", (e) => handler(e.payload));
