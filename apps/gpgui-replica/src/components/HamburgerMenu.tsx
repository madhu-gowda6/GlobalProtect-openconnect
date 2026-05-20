import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

export type HamburgerAction =
  | "switchGateway"
  | "clearCredentials"
  | "settings"
  | "quit";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onAction: (action: HamburgerAction) => void;
  canSwitchGateway?: boolean;
};

export function HamburgerMenu({
  anchorEl,
  open,
  onClose,
  onAction,
  canSwitchGateway = false,
}: Props) {
  const handle = (action: HamburgerAction) => () => {
    onClose();
    onAction(action);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 200,
            bgcolor: "#2a2a2a",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        },
      }}
    >
      <MenuItem
        onClick={handle("switchGateway")}
        disabled={!canSwitchGateway}
        dense
      >
        <ListItemIcon>
          <SwapHorizIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Switch Gateway" />
      </MenuItem>
      <MenuItem onClick={handle("clearCredentials")} dense>
        <ListItemIcon>
          <HistoryIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Clear Credentials" />
      </MenuItem>
      <MenuItem onClick={handle("settings")} dense>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </MenuItem>
      <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.08)" }} />
      <MenuItem onClick={handle("quit")} dense>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Quit" />
      </MenuItem>
    </Menu>
  );
}
