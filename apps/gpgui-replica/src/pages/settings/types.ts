export type SettingsTabKey =
  | "general"
  | "connection"
  | "authentication"
  | "ssltls"
  | "license"
  | "about";

export const SETTINGS_TABS: { key: SettingsTabKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "connection", label: "Connection" },
  { key: "authentication", label: "Authentication" },
  { key: "ssltls", label: "SSL/TLS" },
  { key: "license", label: "License" },
  { key: "about", label: "About" },
];
