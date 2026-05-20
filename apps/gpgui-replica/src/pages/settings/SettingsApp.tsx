import { useState } from "react";
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

export function SettingsApp() {
  const [active, setActive] = useState<SettingsTabKey>("general");

  const closeWindow = () => {
    getCurrentWindow().close().catch(console.error);
  };

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
          {active === "general" && <GeneralTab />}
          {active === "connection" && <ConnectionTab />}
          {active === "authentication" && <AuthenticationTab />}
          {active === "ssltls" && <SslTlsTab />}
          {active === "license" && <LicenseTab />}
          {active === "about" && <AboutTab />}
        </Box>
      </Box>
      <SettingsFooter onCancel={closeWindow} onSave={closeWindow} />
    </Box>
  );
}
