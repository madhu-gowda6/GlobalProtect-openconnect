import { Box, Button, Typography } from "@mui/material";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

type Props = {
  version: string;
  onFeedback?: () => void;
  onLicense?: () => void;
};

export function Footer({ version, onFeedback, onLicense }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<BugReportOutlinedIcon />}
          onClick={onFeedback}
          sx={{
            textTransform: "none",
            color: "rgba(255,255,255,0.85)",
            borderColor: "rgba(255,255,255,0.2)",
            borderRadius: 5,
            px: 1.75,
            py: 0.25,
            fontSize: 12,
            "&:hover": {
              borderColor: "rgba(255,255,255,0.4)",
              bgcolor: "rgba(255,255,255,0.04)",
            },
          }}
        >
          Feedback
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<WarningAmberOutlinedIcon />}
          onClick={onLicense}
          sx={{
            textTransform: "none",
            color: "#ffa726",
            borderColor: "rgba(255,167,38,0.5)",
            borderRadius: 5,
            px: 1.75,
            py: 0.25,
            fontSize: 12,
            "&:hover": {
              borderColor: "#ffa726",
              bgcolor: "rgba(255,167,38,0.08)",
            },
          }}
        >
          License
        </Button>
      </Box>
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}
      >
        {version}
      </Typography>
    </Box>
  );
}
