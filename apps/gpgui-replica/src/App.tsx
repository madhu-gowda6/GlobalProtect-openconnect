import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { open } from "@tauri-apps/plugin-shell";
import { Header } from "./components/Header";
import { StatusShield } from "./components/StatusShield";
import { PortalInput } from "./components/PortalInput";
import { ConnectButton } from "./components/ConnectButton";
import { Footer } from "./components/Footer";
import { HamburgerMenu, HamburgerAction } from "./components/HamburgerMenu";
import { MfaDialog } from "./components/MfaDialog";
import { CredentialsDialog } from "./components/CredentialsDialog";
import { ConnectionStatus, statusLabel } from "./types/connection";
import { vpnStateToStatus, vpnStatePortal } from "./types/vpn";
import {
  CredentialPrompt,
  onConnectProgress,
  onCredentialsRequired,
  onMfaRequired,
  onServiceStatus,
  onVpnState,
} from "./tauri/events";
import {
  cancelCredentials,
  cancelMfa,
  connectPortal,
  disconnectVpn,
  getSettings,
  getStatus,
  openSettings,
  quitApp,
  Settings,
  submitCredentials,
  submitMfa,
} from "./tauri/commands";

const APP_VERSION = "v1.0.0";

export function App() {
  const [portal, setPortal] = useState("");
  const [activePortal, setActivePortal] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [serviceUp, setServiceUp] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [recentPortals, setRecentPortals] = useState<string[]>([]);
  const settingsRef = useRef<Settings | null>(null);

  // Auth phase runs in our process before gpservice takes over the state.
  const [authPhase, setAuthPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mfa, setMfa] = useState<string | null>(null);
  const [creds, setCreds] = useState<CredentialPrompt | null>(null);
  const authBusy = authPhase !== null;
  const authBusyRef = useRef(false);
  authBusyRef.current = authBusy;

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    // Load saved settings (for connect options + recent portals)
    getSettings()
      .then((s) => {
        settingsRef.current = s;
        setRecentPortals(s.recentPortals);
        if (s.recentPortals.length > 0 && !portal) {
          setPortal(s.recentPortals[0]);
        }
      })
      .catch(console.error);

    onVpnState((s) => {
      const next = vpnStateToStatus(s);
      setStatus(next);
      setActivePortal(vpnStatePortal(s));
      // Once gpservice owns the state, clear our local auth phase.
      if (next !== "disconnected") setAuthPhase(null);
    }).then((u) => unlisteners.push(u));

    onServiceStatus((s) => {
      setServiceUp(s === "connected");
      if (s === "disconnected") {
        setStatus("disconnected");
        setActivePortal(undefined);
      }
    }).then((u) => unlisteners.push(u));

    onConnectProgress((msg) => {
      // Ignore stale progress if we already cancelled locally.
      if (authBusyRef.current) setAuthPhase(msg);
    }).then((u) => unlisteners.push(u));

    onMfaRequired((message) => {
      setMfa(message || "Enter your verification code.");
    }).then((u) => unlisteners.push(u));

    onCredentialsRequired((prompt) => {
      setCreds(prompt);
    }).then((u) => unlisteners.push(u));

    // Sync initial state — the WS may have connected before we subscribed.
    getStatus()
      .then((s) => {
        setServiceUp(s.serviceUp);
        if (s.vpnState) {
          setStatus(vpnStateToStatus(s.vpnState));
          setActivePortal(vpnStatePortal(s.vpnState));
        }
      })
      .catch((err) => console.error("get_status failed:", err));

    return () => unlisteners.forEach((u) => u());
  }, []);

  const handleCredsSubmit = (username: string, password: string) => {
    setCreds(null);
    setAuthPhase("Signing in...");
    submitCredentials(username, password).catch((err) => setError(String(err)));
  };

  const handleCredsCancel = () => {
    setCreds(null);
    setAuthPhase(null);
    cancelCredentials().catch(() => {});
  };

  const handleMfaSubmit = (otp: string) => {
    setMfa(null);
    setAuthPhase("Verifying code...");
    submitMfa(otp).catch((err) => setError(String(err)));
  };

  const handleMfaCancel = () => {
    setMfa(null);
    setAuthPhase(null);
    cancelMfa().catch(() => {});
  };

  const startConnect = async () => {
    setError(null);
    setAuthPhase("Starting...");
    try {
      const s = settingsRef.current;
      await connectPortal(portal, {
        ignoreTlsErrors: s?.ignoreTlsErrors,
        hip: s?.hipEnabled,
        os: s?.os,
        osVersion: s?.osVersion || undefined,
        clientVersion: s?.clientVersion || undefined,
        userAgent: s?.userAgent || undefined,
      });
      // Success path: gpservice now emits VpnState; auth phase clears on the
      // first non-disconnected state event.
    } catch (e) {
      setAuthPhase(null);
      setError(String(e));
    }
  };

  const handleConnectClick = () => {
    if (status === "connected" || status === "connecting") {
      disconnectVpn().catch((err) => setError(String(err)));
      return;
    }
    if (authBusy) {
      // Local cancel: stop showing progress. The gpauth window (if open)
      // must still be closed by the user; full cancel lands in a later pass.
      setAuthPhase(null);
      return;
    }
    if (!portal.trim()) {
      setError("Enter a portal address first.");
      return;
    }
    startConnect();
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
  const mainLine = authPhase ?? statusLabel(status);

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
      <Header
        onMenuClick={setMenuAnchor}
        onGitHubClick={() => open("https://github.com/madhu-gowda6/GlobalProtect-openconnect")}
      />
      <HamburgerMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onAction={handleMenuAction}
        canSwitchGateway={status === "connected"}
      />
      <MfaDialog
        open={mfa !== null}
        message={mfa ?? ""}
        onSubmit={handleMfaSubmit}
        onCancel={handleMfaCancel}
      />
      <CredentialsDialog
        prompt={creds}
        onSubmit={handleCredsSubmit}
        onCancel={handleCredsCancel}
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
        <StatusShield status={authBusy ? "connecting" : status} />

        <Typography
          variant="body1"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
            color: status === "connected" ? "#10B981" : "text.primary",
            transition: "color 0.3s",
          }}
        >
          {mainLine}
        </Typography>

        {shieldPortal && status === "connected" && (
          <Typography
            variant="caption"
            sx={{ fontSize: 12, color: "text.secondary", textAlign: "center", mt: -0.75 }}
          >
            {shieldPortal}
          </Typography>
        )}

        {error && (
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: "#ef5350",
              textAlign: "center",
              px: 1,
              maxHeight: 48,
              overflow: "auto",
            }}
          >
            {error}
          </Typography>
        )}

        {!serviceUp && !error && (
          <Typography
            variant="caption"
            sx={{ fontSize: 11, color: "#ffa726", mt: -0.75 }}
          >
            gpservice unreachable — retrying...
          </Typography>
        )}

        <Box sx={{ width: "100%", mt: 0.5 }}>
          <PortalInput
            value={portal}
            onChange={setPortal}
            disabled={status !== "disconnected" || authBusy}
            recentPortals={recentPortals}
            onSelectRecent={(p) => setPortal(p)}
          />
        </Box>

        <Box sx={{ width: "100%" }}>
          <ConnectButton
            status={status}
            busy={authBusy}
            onClick={handleConnectClick}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        <Footer
          version={APP_VERSION}
          onFeedback={() => open("https://github.com/madhu-gowda6/GlobalProtect-openconnect/issues")}
        />
      </Box>
    </Box>
  );
}
