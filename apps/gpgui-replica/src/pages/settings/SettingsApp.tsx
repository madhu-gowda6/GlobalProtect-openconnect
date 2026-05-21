import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Sidebar } from "./Sidebar";
import { SettingsFooter } from "./SettingsFooter";
import { GeneralTab } from "./tabs/GeneralTab";
import { ConnectionTab } from "./tabs/ConnectionTab";
import { AuthenticationTab } from "./tabs/AuthenticationTab";
import { SslTlsTab } from "./tabs/SslTlsTab";
import { LicenseTab } from "./tabs/LicenseTab";
import { AboutTab } from "./tabs/AboutTab";
import { SettingsTabKey } from "./types";
import { getSettings, saveSettings, Settings } from "../../tauri/commands";

export function SettingsApp() {
  const [active, setActive] = useState<SettingsTabKey>("general");
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const closeWindow = () => {
    getCurrentWindow().close().catch(console.error);
  };

  const handleSave = () => {
    if (settings) {
      saveSettings(settings).then(closeWindow).catch(console.error);
    }
  };

  if (!settings) return null;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar active={active} onSelect={setActive} />
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3.5,
            py: 3,
          }}
        >
          {active === "general" && <GeneralTab settings={settings} onChange={update} />}
          {active === "connection" && <ConnectionTab settings={settings} onChange={update} />}
          {active === "authentication" && <AuthenticationTab settings={settings} onChange={update} />}
          {active === "ssltls" && <SslTlsTab settings={settings} onChange={update} />}
          {active === "license" && <LicenseTab />}
          {active === "about" && <AboutTab />}
        </Box>
      </Box>
      <SettingsFooter onCancel={closeWindow} onSave={handleSave} />
    </Box>
  );
}
