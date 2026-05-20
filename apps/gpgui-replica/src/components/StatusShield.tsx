import { Box, Typography, CircularProgress } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { ConnectionStatus } from "../types/connection";

type Props = {
  status: ConnectionStatus;
  portal?: string;
};

const SIZE = 132;

export function StatusShield({ status, portal }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 1,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ShieldOutlinedIcon
          sx={{
            fontSize: 76,
            color: "rgba(255,255,255,0.55)",
          }}
        />
        <StatusBadge status={status} />
        {portal && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 14,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "primary.main",
              fontSize: 11,
              fontWeight: 500,
              px: 1.5,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {portal}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  if (status === "connecting" || status === "disconnecting") {
    return (
      <CircularProgress
        size={28}
        thickness={4}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          mt: "-14px",
          ml: "-14px",
          color: "primary.main",
        }}
      />
    );
  }

  const iconSx = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -45%)",
    fontSize: 28,
  };

  if (status === "connected") {
    return <CheckIcon sx={{ ...iconSx, color: "#4caf50" }} />;
  }
  return <CloseIcon sx={{ ...iconSx, color: "rgba(255,255,255,0.7)" }} />;
}
