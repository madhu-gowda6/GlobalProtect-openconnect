import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Header } from "./components/Header";
import { StatusShield } from "./components/StatusShield";
import { PortalInput } from "./components/PortalInput";
import { ConnectButton } from "./components/ConnectButton";
import { Footer } from "./components/Footer";
import { HamburgerMenu, HamburgerAction } from "./components/HamburgerMenu";
import { ConnectionStatus, statusLabel } from "./types/connection";
import { openSettings, quitApp } from "./tauri/commands";

const APP_VERSION = "v2.5.4";

export function App() {
  const [portal, setPortal] = useState("go.sg.de.o2.com");
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleConnectClick = () => {
    setStatus((s) => {
      switch (s) {
        case "disconnected":
          return "connecting";
        case "connecting":
          return "disconnected";
        case "connected":
          return "disconnecting";
        case "disconnecting":
          return "disconnecting";
      }
    });
  };

  const handleMenuAction = (action: HamburgerAction) => {
    switch (action) {
      case "settings":
        openSettings().catch((err) => console.error("open_settings failed:", err));
        return;
      case "quit":
        quitApp().catch((err) => console.error("quit_app failed:", err));
        return;
      case "switchGateway":
      case "clearCredentials":
        // Milestone 5+: wire to gpservice/cookie store.
        console.info("menu action (stub):", action);
        return;
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        color: "text.primary",
        userSelect: "none",
      }}
    >
      <Header onMenuClick={setMenuAnchor} />
      <HamburgerMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onAction={handleMenuAction}
        canSwitchGateway={status === "connected"}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 2.5,
          pb: 1.5,
          gap: 1.25,
        }}
      >
        <StatusShield status={status} portal={portal} />

        <Typography
          variant="body1"
          sx={{ fontSize: 15, fontWeight: 500, mt: 0.5 }}
        >
          {statusLabel(status)}
        </Typography>

        <Box sx={{ width: "100%", mt: 0.5 }}>
          <PortalInput
            value={portal}
            onChange={setPortal}
            disabled={status !== "disconnected"}
          />
        </Box>

        <Box sx={{ width: "100%" }}>
          <ConnectButton status={status} onClick={handleConnectClick} />
        </Box>

        <Box sx={{ flex: 1 }} />

        <Footer version={APP_VERSION} />
      </Box>
    </Box>
  );
}
