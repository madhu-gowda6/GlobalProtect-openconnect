import { Box, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

export type HamburgerAction =
  | "switchGateway"
  | "clearCredentials"
  | "settings"
  | "update"
  | "quit";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onAction: (action: HamburgerAction) => void;
  canSwitchGateway?: boolean;
  hasUpdate?: boolean;
};

export function HamburgerMenu({
  anchorEl,
  open,
  onClose,
  onAction,
  canSwitchGateway = false,
  hasUpdate = false,
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
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      {hasUpdate && (
        <MenuItem onClick={handle("update")} dense>
          <ListItemIcon>
            <SystemUpdateAltIcon fontSize="small" sx={{ color: "primary.main" }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Update Available
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    flexShrink: 0,
                  }}
                />
              </Box>
            }
            slotProps={{ primary: { style: { color: "inherit", fontWeight: 600 } } }}
          />
        </MenuItem>
      )}
      {hasUpdate && <Divider sx={{ my: 0.5 }} />}
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
      <Divider sx={{ my: 0.5 }} />
      <MenuItem onClick={handle("quit")} dense>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Quit" />
      </MenuItem>
    </Menu>
  );
}
