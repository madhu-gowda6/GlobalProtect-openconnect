import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  latestVersion: string;
  releaseUrl: string;
  onDismiss: () => void;
  onOpenRelease: () => void;
};

export function UpdateBanner({ latestVersion, onDismiss, onOpenRelease }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "100%",
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(96,165,250,0.1)"
            : "rgba(37,99,235,0.07)",
        border: "1px solid",
        borderColor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(96,165,250,0.3)"
            : "rgba(37,99,235,0.25)",
        borderRadius: "10px",
        px: 1.5,
        py: 0.75,
      }}
    >
      <SystemUpdateAltIcon sx={{ color: "primary.main", fontSize: 16, flexShrink: 0 }} />

      <Typography sx={{ flex: 1, fontSize: 12, color: "text.primary", lineHeight: 1.4 }}>
        Update available:{" "}
        <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
          v{latestVersion}
        </Box>
      </Typography>

      <Tooltip title="View release">
        <IconButton size="small" onClick={onOpenRelease} sx={{ p: 0.4 }}>
          <OpenInNewIcon sx={{ fontSize: 13, color: "primary.main" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Dismiss">
        <IconButton
          size="small"
          onClick={onDismiss}
          sx={{ p: 0.4, color: "text.secondary", "&:hover": { color: "text.primary" } }}
        >
          <CloseIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
