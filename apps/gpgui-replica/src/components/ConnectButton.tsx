import { Button } from "@mui/material";
import { ConnectionStatus } from "../types/connection";

type Props = {
  status: ConnectionStatus;
  onClick: () => void;
  busy?: boolean;
};

export function ConnectButton({ status, onClick, busy }: Props) {
  const { label, disabled } = buttonState(status, busy);

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      fullWidth
      disableElevation
      sx={{
        bgcolor: "#9ec5ff",
        color: "#0d1b2a",
        textTransform: "none",
        fontWeight: 500,
        py: 0.9,
        "&:hover": { bgcolor: "#b3d2ff" },
        "&.Mui-disabled": {
          bgcolor: "rgba(158,197,255,0.4)",
          color: "rgba(13,27,42,0.6)",
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
): { label: string; disabled: boolean } {
  if (busy && status === "disconnected") {
    return { label: "Cancel", disabled: false };
  }
  switch (status) {
    case "disconnected":
      return { label: "Connect", disabled: false };
    case "connecting":
      return { label: "Cancel", disabled: false };
    case "connected":
      return { label: "Disconnect", disabled: false };
    case "disconnecting":
      return { label: "Disconnecting...", disabled: true };
  }
}
