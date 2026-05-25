import { Box, keyframes } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { ConnectionStatus } from "../types/connection";

const pulseFade = keyframes`
  0%   { opacity: 0.55; transform: scale(1);    }
  100% { opacity: 0;    transform: scale(1.55); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const CONNECTED = "#10B981";
const CONNECTING_COLOR = "primary.main";
const SIZE = 100;

type Props = { status: ConnectionStatus };

export function StatusShield({ status }: Props) {
  const isConnected   = status === "connected";
  const isConnecting  = status === "connecting";
  const isDisconnecting = status === "disconnecting";
  const isTransitioning = isConnecting || isDisconnecting;

  const shieldColor = isConnected
    ? CONNECTED
    : isTransitioning
    ? undefined          // handled via sx color below
    : "text.disabled";

  return (
    <Box
      sx={{
        position: "relative",
        width: SIZE + 36,
        height: SIZE + 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mt: 0.5,
      }}
    >
      {/* Pulse rings — connected only */}
      {isConnected && [0, 600].map((delay) => (
        <Box
          key={delay}
          sx={{
            position: "absolute",
            width: SIZE + 8,
            height: SIZE + 8,
            borderRadius: "50%",
            bgcolor: "rgba(16,185,129,0.2)",
            animation: `${pulseFade} 2.4s ease-out infinite`,
            animationDelay: `${delay}ms`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Spinner arc — connecting / disconnecting */}
      {isTransitioning && (
        <Box
          sx={{
            position: "absolute",
            width: SIZE + 14,
            height: SIZE + 14,
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTopColor: isConnecting ? "primary.main" : "error.main",
            animation: `${spin} 0.75s linear infinite`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Circle */}
      <Box
        sx={{
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          bgcolor: isConnected
            ? "rgba(16,185,129,0.1)"
            : "action.selected",
          border: "1.5px solid",
          borderColor: isConnected
            ? "rgba(16,185,129,0.25)"
            : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease",
          boxShadow: isConnected
            ? "0 0 32px rgba(16,185,129,0.18), inset 0 0 20px rgba(16,185,129,0.06)"
            : "none",
        }}
      >
        <ShieldIcon
          sx={{
            fontSize: 58,
            color: shieldColor,
            ...(isTransitioning && {
              color: isConnecting ? CONNECTING_COLOR : "error.main",
            }),
            transition: "color 0.4s ease, filter 0.4s ease",
            filter: isConnected
              ? "drop-shadow(0 2px 10px rgba(16,185,129,0.5))"
              : "none",
          }}
        />
      </Box>
    </Box>
  );
}
