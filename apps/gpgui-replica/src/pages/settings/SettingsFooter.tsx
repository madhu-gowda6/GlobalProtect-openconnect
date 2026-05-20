import { Box, Button, Link } from "@mui/material";

type Props = {
  onViewLogs?: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export function SettingsFooter({ onViewLogs, onCancel, onSave }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2.5,
        py: 1.5,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "#1a1a1a",
      }}
    >
      <Link
        component="button"
        onClick={onViewLogs}
        underline="hover"
        sx={{ color: "primary.main", fontSize: 13 }}
      >
        View Logs
      </Link>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          onClick={onCancel}
          sx={{
            color: "primary.main",
            textTransform: "none",
            fontSize: 13,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          sx={{
            color: "primary.main",
            textTransform: "none",
            fontSize: 13,
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}
