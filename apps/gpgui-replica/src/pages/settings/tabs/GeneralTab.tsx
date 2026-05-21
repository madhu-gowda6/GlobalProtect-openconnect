import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import { InfoBanner } from "../InfoBanner";
import { CheckboxRow } from "../CheckboxRow";
import { Settings } from "../../../tauri/commands";

type Theme = "light" | "system" | "dark";

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
};

export function GeneralTab({ settings, onChange }: Props) {
  return (
    <Box>
      <InfoBanner variant="warning">
        You need to restart the client after changing this setting.
      </InfoBanner>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: 14, minWidth: 60 }}>Theme</Typography>
        <ToggleButtonGroup
          value={settings.theme}
          exclusive
          size="small"
          onChange={(_, v: Theme | null) => v && onChange({ theme: v })}
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              color: "rgba(255,255,255,0.7)",
              borderColor: "rgba(255,255,255,0.12)",
              px: 1.75,
              py: 0.5,
              fontSize: 13,
              gap: 0.75,
              "&.Mui-selected": {
                bgcolor: "rgba(255,255,255,0.08)",
                color: "white",
              },
            },
          }}
        >
          <ToggleButton value="light">
            <LightModeIcon fontSize="small" />
            Light
          </ToggleButton>
          <ToggleButton value="system">
            <SettingsBrightnessIcon fontSize="small" />
            System
          </ToggleButton>
          <ToggleButton value="dark">
            <DarkModeIcon fontSize="small" />
            Dark
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <CheckboxRow
        label="HiDPI Screen Compatibility"
        description="Enable this option if you're experiencing display issues on your 4K screen."
        checked={settings.hidpi}
        onChange={(v) => onChange({ hidpi: v })}
      />
      <CheckboxRow
        label="Start Minimized"
        description="Start the client minimized in the system tray."
        checked={settings.startMinimized}
        onChange={(v) => onChange({ startMinimized: v })}
      />
      <CheckboxRow
        label="Auto Connect On Launch"
        description="Automatically connect to the last connected gateway when the client is launched."
        checked={settings.autoConnect}
        onChange={(v) => onChange({ autoConnect: v })}
      />
      <CheckboxRow
        label="Resume on Wake Up"
        description="Automatically resume the connection when the system wakes up from sleep."
        checked={settings.resumeOnWake}
        onChange={(v) => onChange({ resumeOnWake: v })}
      />
      <CheckboxRow
        label="Use Symbolic Tray Icon"
        description="You can customize the symbolic icon by placing gpgui-connected-symbolic.png in the icons directory."
        checked={settings.symbolicTrayIcon}
        onChange={(v) => onChange({ symbolicTrayIcon: v })}
      />
    </Box>
  );
}
