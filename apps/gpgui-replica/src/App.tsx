import { Box, Typography } from "@mui/material";

export function App() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        userSelect: "none",
      }}
    >
      <Typography variant="h6" sx={{ opacity: 0.7 }}>
        GP Connect
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.4, mt: 1 }}>
        milestone 1 — empty shell
      </Typography>
    </Box>
  );
}
