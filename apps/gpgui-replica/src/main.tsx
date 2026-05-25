import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { App } from "./App";
import { SettingsApp } from "./pages/settings/SettingsApp";

function useAppTheme() {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    invoke<{ theme: string }>("get_settings")
      .then((s) => {
        if (s.theme === "light") setMode("light");
        else if (s.theme === "dark") setMode("dark");
        else {
          // system
          setMode(
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
          );
        }
      })
      .catch(() => {});

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Only respond if theme is "system"; re-check is cheap.
      invoke<{ theme: string }>("get_settings")
        .then((s) => {
          if (s.theme === "system") setMode(e.matches ? "dark" : "light");
        })
        .catch(() => {});
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background:
            mode === "dark"
              ? { default: "#13131f", paper: "#1e1e30" }
              : { default: "#f4f6f9", paper: "#ffffff" },
          primary: { main: mode === "dark" ? "#60a5fa" : "#2563EB" },
          error:   { main: "#ef4444" },
          warning: { main: "#f59e0b" },
        },
        typography: {
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 13,
        },
        shape: { borderRadius: 6 },
      }),
    [mode]
  );

  return theme;
}

// Same bundle is loaded into the main window and the settings window. Pick
// which root to render based on the Tauri window label.
function Root() {
  const isSettings = getCurrentWindow().label === "settings";
  const theme = useAppTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isSettings ? <SettingsApp /> : <App />}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
