import { Button } from "@mui/material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { ConnectionStatus } from "../types/connection";

type Props = {
  status: ConnectionStatus;
  onClick: () => void;
  busy?: boolean;
};

export function ConnectButton({ status, onClick, busy }: Props) {
  const { label, disabled, variant } = buttonState(status, busy);

  const isDestructive = variant === "disconnect";
  const isNeutral     = variant === "cancel";

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      fullWidth
      disableElevation
      startIcon={<PowerSettingsNewIcon sx={{ fontSize: "18px !important" }} />}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        fontSize: 14,
        py: 1.1,
        borderRadius: "24px",
        letterSpacing: 0.3,
        transition: "all 0.2s ease",

        ...(isDestructive && {
          bgcolor: "error.main",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
        }),
        ...(isNeutral && {
          bgcolor: "action.selected",
          color: "text.secondary",
          boxShadow: "none",
        }),
        ...(!isDestructive && !isNeutral && {
          bgcolor: "primary.main",
          color: "primary.contrastText",
          boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
        }),
        "&:hover": { filter: "brightness(0.88)" },

        "&.Mui-disabled": {
          bgcolor: "action.disabledBackground",
          color: "action.disabled",
          boxShadow: "none",
        },
      }}
    >
      {label}
    </Button>
  );
}

function buttonState(
  status: ConnectionStatus,
  busy?: boolean
): { label: string; disabled: boolean; variant: "connect" | "disconnect" | "cancel" } {
  if (busy && status === "disconnected") {
    return { label: "Cancel", disabled: false, variant: "cancel" };
  }
  switch (status) {
    case "disconnected":
      return { label: "Connect", disabled: false, variant: "connect" };
    case "connecting":
      return { label: "Cancel", disabled: false, variant: "cancel" };
    case "connected":
      return { label: "Disconnect", disabled: false, variant: "disconnect" };
    case "disconnecting":
      return { label: "Disconnecting...", disabled: true, variant: "cancel" };
  }
}
