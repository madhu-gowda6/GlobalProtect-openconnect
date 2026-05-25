import { Box, Typography } from "@mui/material";

export function LicenseTab() {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontSize: 16, mb: 2 }}>
        License
      </Typography>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.5 }}>
        This is an open-source GlobalProtect VPN client by Atharv. All
        features are enabled — no license key required.
      </Typography>
    </Box>
  );
}
