import { useEffect, useRef, useState } from "react";
import { Box, Collapse, IconButton, keyframes, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
`;

function StatusDot({ status, busy }: { status: ConnectionStatus; busy: boolean }) {
  const effective = busy ? "connecting" : status;
  const color =
    effective === "connected"
      ? "#10B981"
      : effective === "connecting" || effective === "disconnecting"
      ? "primary.main"
      : "text.disabled";

  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: color,
        flexShrink: 0,
        transition: "background-color 0.4s",
        animation:
          effective === "connecting" || effective === "disconnecting"
            ? `${blink} 1.1s ease-in-out infinite`
            : "none",
      }}
    />
  );
}

export function App() {
  const [portal, setPortal] = useState("");
  const [activePortal, setActivePortal] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [serviceUp, setServiceUp] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [recentPortals, setRecentPortals] = useState<string[]>([]);
  const settingsRef = useRef<Settings | null>(null);

  const [authPhase, setAuthPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mfa, setMfa] = useState<string | null>(null);
  const [creds, setCreds] = useState<CredentialPrompt | null>(null);
  const authBusy = authPhase !== null;
  const authBusyRef = useRef(false);
  authBusyRef.current = authBusy;

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    getSettings()
      .then((s) => {
        settingsRef.current = s;
        setRecentPortals(s.recentPortals);
        if (s.recentPortals.length > 0 && !portal) setPortal(s.recentPortals[0]);
      })
      .catch(console.error);

    onVpnState((s) => {
      const next = vpnStateToStatus(s);
      setStatus(next);
      setActivePortal(vpnStatePortal(s));
      if (next !== "disconnected") setAuthPhase(null);
      if (next === "connected") setError(null);
    }).then((u) => unlisteners.push(u));

    onServiceStatus((s) => {
      setServiceUp(s === "connected");
      if (s === "disconnected") { setStatus("disconnected"); setActivePortal(undefined); }
    }).then((u) => unlisteners.push(u));

    onConnectProgress((msg) => {
      if (authBusyRef.current) setAuthPhase(msg);
    }).then((u) => unlisteners.push(u));

    onMfaRequired((message) => {
      setMfa(message || "Enter your verification code.");
    }).then((u) => unlisteners.push(u));

    onCredentialsRequired((prompt) => {
      setCreds(prompt);
    }).then((u) => unlisteners.push(u));

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
    if (authBusy) { setAuthPhase(null); return; }
    if (!portal.trim()) { setError("Enter a portal address first."); return; }
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

  const effectiveStatus: ConnectionStatus = authBusy ? "connecting" : status;
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
        overflow: "hidden",
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
          pb: 2,
          gap: 1,
        }}
      >
        {/* Shield */}
        <StatusShield status={effectiveStatus} />

        {/* Status line */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
          <StatusDot status={status} busy={authBusy} />
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: status === "connected" ? "#10B981" : "text.primary",
              transition: "color 0.4s",
              letterSpacing: 0.1,
            }}
          >
            {mainLine}
          </Typography>
        </Box>

        {/* Portal sub-label when connected */}
        {status === "connected" && shieldPortal && (
          <Typography
            variant="caption"
            sx={{ fontSize: 12, color: "text.secondary", mt: -0.5, textAlign: "center" }}
          >
            {shieldPortal}
          </Typography>
        )}

        {/* Error banner — dismissible */}
        <Collapse in={!!error} sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "10px",
              px: 1.5,
              py: 0.75,
            }}
          >
            <Typography
              sx={{ flex: 1, fontSize: 12, color: "error.main", lineHeight: 1.4 }}
            >
              {error}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setError(null)}
              sx={{ p: 0.25, color: "error.main", opacity: 0.7, "&:hover": { opacity: 1 } }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Collapse>

        {/* Service warning */}
        {!serviceUp && !error && (
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: "warning.main",
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(245,158,11,0.1)"
                  : "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "8px",
              px: 1.5,
              py: 0.5,
              width: "100%",
              textAlign: "center",
            }}
          >
            gpservice unreachable — retrying...
          </Typography>
        )}

        {/* Bottom group — portal input + button + footer */}
        <Box
          sx={{
            mt: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <PortalInput
            value={portal}
            onChange={setPortal}
            onEnter={handleConnectClick}
            disabled={status !== "disconnected" || authBusy}
            recentPortals={recentPortals}
            onSelectRecent={(p) => setPortal(p)}
          />
          <ConnectButton status={status} busy={authBusy} onClick={handleConnectClick} />
          <Footer
            version={APP_VERSION}
            onFeedback={() =>
              open("https://github.com/madhu-gowda6/GlobalProtect-openconnect/issues")
            }
          />
        </Box>
      </Box>
    </Box>
  );
}
