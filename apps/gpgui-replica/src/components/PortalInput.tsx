import { TextField, InputAdornment, IconButton } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onOpenRecent?: () => void;
  disabled?: boolean;
};

export function PortalInput({ value, onChange, onOpenRecent, disabled }: Props) {
  return (
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
                onClick={onOpenRecent}
                aria-label="recent portals"
                disabled={disabled}
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
  );
}
