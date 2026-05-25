import { useState } from "react";
import { TextField, InputAdornment, IconButton, Menu, MenuItem } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  recentPortals?: string[];
  onSelectRecent?: (portal: string) => void;
};

export function PortalInput({ value, onChange, onEnter, disabled, recentPortals, onSelectRecent }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasRecent = recentPortals && recentPortals.length > 0;

  return (
    <>
      <TextField
        label="Portal address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled && value.trim()) onEnter?.();
        }}
        fullWidth
        size="small"
        disabled={disabled}
        autoComplete="off"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PublicIcon
                  fontSize="small"
                  sx={{ color: disabled ? "action.disabled" : "text.secondary" }}
                />
              </InputAdornment>
            ),
            endAdornment: hasRecent ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  aria-label="recent portals"
                  disabled={disabled}
                  edge="end"
                >
                  <ArrowDropDownIcon
                    sx={{ color: disabled ? "action.disabled" : "text.secondary" }}
                  />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
          inputLabel: {
            sx: { color: "text.secondary" },
          },
        }}
        sx={{
          "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& fieldset": { borderColor: "divider" },
            "&:hover fieldset": { borderColor: "text.disabled" },
            "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { maxHeight: 200, minWidth: 240, borderRadius: 2 } } }}
      >
        {recentPortals?.map((p) => (
          <MenuItem
            key={p}
            onClick={() => { onSelectRecent?.(p); setAnchorEl(null); }}
            sx={{ fontSize: 13 }}
          >
            {p}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
