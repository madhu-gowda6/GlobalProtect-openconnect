import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Header } from "./components/Header";
import { StatusShield } from "./components/StatusShield";
import { PortalInput } from "./components/PortalInput";
import { ConnectButton } from "./components/ConnectButton";
import { Footer } from "./components/Footer";
import { HamburgerMenu, HamburgerAction } from "./components/HamburgerMenu";
import { ConnectionStatus, statusLabel } from "./types/connection";
import { vpnStateToStatus, vpnStatePortal } from "./types/vpn";
import { onServiceStatus, onVpnState } from "./tauri/events";
import { disconnectVpn, openSettings, quitApp } from "./tauri/commands";

const APP_VERSION = "v2.5.4";

export function App() {
  const [portal, setPortal] = useState("");
  const [activePortal, setActivePortal] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [serviceUp, setServiceUp] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // Subscribe to gpservice events once.
  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    onVpnState((s) => {
      setStatus(vpnStateToStatus(s));
      setActivePortal(vpnStatePortal(s));
    }).then((u) => unlisteners.push(u));

    onServiceStatus((s) => {
      setServiceUp(s === "connected");
      if (s === "disconnected") {
        // gpservice gone → assume nothing is connected.
        setStatus("disconnected");
        setActivePortal(undefined);
      }
    }).then((u) => unlisteners.push(u));

    return () => unlisteners.forEach((u) => u());
  }, []);

  const handleConnectClick = () => {
    if (status === "connected" || status === "connecting") {
      disconnectVpn().catch((err) => console.error("disconnect_vpn failed:", err));
      return;
    }
    // Milestone 5 wires real connect (portal pre-login + gpauth + ConnectRequest).
    // For now do nothing on click when disconnected.
    console.info("connect: portal pre-login not yet implemented (milestone 5)");
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
        console.info("menu action (stub):", action);
        return;
    }
  };

  const shieldPortal = activePortal ?? (portal || undefined);

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
        <StatusShield status={status} portal={shieldPortal} />

        <Typography
          variant="body1"
          sx={{ fontSize: 15, fontWeight: 500, mt: 0.5 }}
        >
          {statusLabel(status)}
        </Typography>

        {!serviceUp && (
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: "#ffa726",
              mt: -0.75,
            }}
          >
            gpservice unreachable — retrying...
          </Typography>
        )}

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
