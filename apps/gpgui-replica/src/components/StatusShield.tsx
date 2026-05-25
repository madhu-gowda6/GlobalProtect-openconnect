import { Box, CircularProgress } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { ConnectionStatus } from "../types/connection";

type Props = {
  status: ConnectionStatus;
};

const SIZE = 120;
const CONNECTED_COLOR = "#10B981";

export function StatusShield({ status }: Props) {
  const isConnected = status === "connected";
  const isTransitioning = status === "connecting" || status === "disconnecting";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 2,
        mb: 0.5,
      }}
    >
      <Box
        sx={{
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          bgcolor: "action.hover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isTransitioning ? (
          <CircularProgress
            size={52}
            thickness={3}
            sx={{ color: isConnected ? CONNECTED_COLOR : "primary.main" }}
          />
        ) : (
          <ShieldIcon
            sx={{
              fontSize: 60,
              color: isConnected ? CONNECTED_COLOR : "text.disabled",
              transition: "color 0.3s ease",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
