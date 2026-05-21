import { useState } from "react";
import { TextField, InputAdornment, IconButton, Menu, MenuItem } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onOpenRecent?: () => void;
  disabled?: boolean;
  recentPortals?: string[];
  onSelectRecent?: (portal: string) => void;
};

export function PortalInput({ value, onChange, disabled, recentPortals, onSelectRecent }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasRecent = recentPortals && recentPortals.length > 0;

  return (
    <>
      <TextField
        label="Portal address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        size="small"
        disabled={disabled}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PublicIcon
                  fontSize="small"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={(e) => hasRecent && setAnchorEl(e.currentTarget)}
                  aria-label="recent portals"
                  disabled={disabled || !hasRecent}
                >
                  <ArrowDropDownIcon
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
          inputLabel: {
            sx: { color: "primary.main" },
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "primary.main" },
            "&:hover fieldset": { borderColor: "primary.main" },
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { maxHeight: 240, minWidth: 200 } } }}
      >
        {recentPortals?.map((p) => (
          <MenuItem
            key={p}
            onClick={() => {
              onSelectRecent?.(p);
              setAnchorEl(null);
            }}
            sx={{ fontSize: 13 }}
          >
            {p}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
