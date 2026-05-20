import React from "react";
import { Box, Typography } from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type Variant = "warning" | "info";

type Props = {
  variant: Variant;
  children: React.ReactNode;
};

export function InfoBanner({ variant, children }: Props) {
  const isWarning = variant === "warning";
  const Icon = isWarning ? WarningAmberOutlinedIcon : InfoOutlinedIcon;
  const color = isWarning ? "#ffa726" : "#7eb8ff";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        alignItems: "center",
        bgcolor: isWarning ? "rgba(255,167,38,0.08)" : "rgba(126,184,255,0.08)",
        border: `1px solid ${isWarning ? "rgba(255,167,38,0.2)" : "rgba(126,184,255,0.2)"}`,
        borderRadius: 1,
        px: 1.75,
        py: 1.25,
        mb: 2.5,
      }}
    >
      <Icon sx={{ color, fontSize: 22 }} />
      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
        {children}
      </Typography>
    </Box>
  );
}
