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
        bgcolor: "primary.main",
        color: "primary.contrastText",
        textTransform: "none",
        fontWeight: 600,
        fontSize: 14,
        py: 1,
        borderRadius: "24px",
        "&:hover": { bgcolor: "primary.dark" },
        "&.Mui-disabled": {
          bgcolor: "action.disabledBackground",
          color: "action.disabled",
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
