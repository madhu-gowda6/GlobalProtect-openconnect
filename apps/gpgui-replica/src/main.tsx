import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { App } from "./App";
import { SettingsApp } from "./pages/settings/SettingsApp";
import { theme } from "./theme/theme";

// Same bundle is loaded into the main window and the settings window. Pick
// which root to render based on the Tauri window label.
function Root() {
  const isSettings = getCurrentWindow().label === "settings";
  return isSettings ? <SettingsApp /> : <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root />
    </ThemeProvider>
  </React.StrictMode>
);
