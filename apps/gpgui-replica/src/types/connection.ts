export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting";

export function statusLabel(status: ConnectionStatus): string {
  switch (status) {
    case "disconnected":
      return "Not Connected";
    case "connecting":
      return "Connecting...";
    case "connected":
      return "Connected";
    case "disconnecting":
      return "Disconnecting...";
  }
}
