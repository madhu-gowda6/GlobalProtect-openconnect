import React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import PublicIcon from "@mui/icons-material/Public";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { SettingsTabKey, SETTINGS_TABS } from "./types";

const ICONS: Record<SettingsTabKey, React.ReactNode> = {
  general: <SettingsBrightnessIcon fontSize="small" />,
  connection: <PublicIcon fontSize="small" />,
  authentication: <BadgeOutlinedIcon fontSize="small" />,
  ssltls: <LockOutlinedIcon fontSize="small" />,
  license: <DesktopWindowsOutlinedIcon fontSize="small" />,
  about: <InfoOutlinedIcon fontSize="small" />,
};

type Props = {
  active: SettingsTabKey;
  onSelect: (key: SettingsTabKey) => void;
};

export function Sidebar({ active, onSelect }: Props) {
  return (
    <Box
      sx={{
        width: 180,
        bgcolor: "#1a1a1a",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        py: 1,
        flexShrink: 0,
      }}
    >
      <List dense disablePadding>
        {SETTINGS_TABS.map((tab) => {
          const selected = tab.key === active;
          return (
            <ListItemButton
              key={tab.key}
              selected={selected}
              onClick={() => onSelect(tab.key)}
              sx={{
                px: 2,
                py: 1,
                borderLeft: "3px solid transparent",
                borderLeftColor: selected ? "primary.main" : "transparent",
                "&.Mui-selected": {
                  bgcolor: "transparent",
                  "& .MuiListItemText-primary": { color: "primary.main" },
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
                "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {ICONS[tab.key]}
              </ListItemIcon>
              <ListItemText
                primary={tab.label}
                primaryTypographyProps={{ fontSize: 14 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
