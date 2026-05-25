import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShieldIcon from "@mui/icons-material/Shield";
import GitHubIcon from "@mui/icons-material/GitHub";

type Props = {
  onMenuClick?: (anchor: HTMLElement) => void;
  onGitHubClick?: () => void;
};

export function Header({ onMenuClick, onGitHubClick }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        pt: 1.5,
        pb: 0.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <ShieldIcon sx={{ color: "primary.main", fontSize: 22 }} />
        <Typography
          sx={{ fontSize: 16, fontWeight: 700, color: "primary.main", lineHeight: 1 }}
        >
          GP Connect
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton size="small" onClick={onGitHubClick} aria-label="github">
          <GitHubIcon sx={{ color: "text.secondary", fontSize: 20 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => onMenuClick?.(e.currentTarget)}
          aria-label="menu"
        >
          <MenuIcon sx={{ color: "text.secondary" }} />
        </IconButton>
      </Box>
    </Box>
  );
}
