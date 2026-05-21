import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { VpnState } from "../types/vpn";

export type ServiceStatus = "connected" | "disconnected";

export const onVpnState = (handler: (state: VpnState) => void): Promise<UnlistenFn> =>
  listen<VpnState>("vpn-state", (e) => handler(e.payload));

export const onServiceStatus = (
  handler: (status: ServiceStatus) => void
): Promise<UnlistenFn> =>
  listen<ServiceStatus>("vpn-service-status", (e) => handler(e.payload));

export const onConnectProgress = (
  handler: (message: string) => void
): Promise<UnlistenFn> =>
  listen<string>("connect-progress", (e) => handler(e.payload));

export const onMfaRequired = (
  handler: (message: string) => void
): Promise<UnlistenFn> =>
  listen<string>("mfa-required", (e) => handler(e.payload));

export type CredentialPrompt = {
  message: string;
  usernameLabel: string;
  passwordLabel: string;
};

export const onCredentialsRequired = (
  handler: (prompt: CredentialPrompt) => void
): Promise<UnlistenFn> =>
  listen<CredentialPrompt>("credentials-required", (e) => handler(e.payload));
