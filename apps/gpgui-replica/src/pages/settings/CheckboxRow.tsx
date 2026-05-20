import React from "react";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";

type Props = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
};

export function CheckboxRow({ label, description, checked, onChange, children }: Props) {
  return (
    <Box sx={{ mb: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(_, v) => onChange(v)}
            size="small"
          />
        }
        label={<Typography sx={{ fontSize: 14 }}>{label}</Typography>}
      />
      {description && (
        <Typography
          sx={{
            ml: 4,
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
            mt: -0.5,
          }}
        >
          {description}
        </Typography>
      )}
      {children && <Box sx={{ ml: 4, mt: 1 }}>{children}</Box>}
    </Box>
  );
}
