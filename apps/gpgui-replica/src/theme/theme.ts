import { createTheme } from "@mui/material/styles";

// Matches the dark theme shown in the gpgui v2.5.4 screenshots.
export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1e1e1e",
      paper: "#262626",
    },
    primary: {
      main: "#7eb8ff",
    },
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 13,
  },
  shape: {
    borderRadius: 6,
  },
});
