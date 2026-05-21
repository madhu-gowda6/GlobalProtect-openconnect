import { Box, Typography } from "@mui/material";

export function LicenseTab() {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontSize: 16, mb: 2 }}>
        License
      </Typography>
      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)", mb: 1.5 }}>
        This is an open-source GlobalProtect VPN client by Atharv. All
        features are enabled — no license key required.
      </Typography>
      <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
        Licensed under GPL-3.0, matching the rest of the workspace.
      </Typography>
    </Box>
  );
}
