import { Box, Typography } from "@mui/material";

type Props = {
  version: string;
  onFeedback?: () => void;
  onLicense?: () => void;
};

const pillSx = {
  fontSize: 12,
  color: "text.secondary",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: "20px",
  px: 1.5,
  py: 0.4,
  cursor: "pointer",
  background: "none",
  fontFamily: "inherit",
  "&:hover": { borderColor: "text.secondary", color: "text.primary" },
  transition: "border-color 0.2s, color 0.2s",
} as const;

export function Footer({ version, onFeedback, onLicense }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        px: 1,
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box component="button" onClick={onFeedback} sx={pillSx}>
          Feedback
        </Box>
        <Box component="button" onClick={onLicense} sx={pillSx}>
          License
        </Box>
      </Box>

      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {version}
      </Typography>
    </Box>
  );
}
