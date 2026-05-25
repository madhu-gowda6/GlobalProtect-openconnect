import { Badge, Box, IconButton, Tooltip, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShieldIcon from "@mui/icons-material/Shield";
import GitHubIcon from "@mui/icons-material/GitHub";

type Props = {
  onMenuClick?: (anchor: HTMLElement) => void;
  onGitHubClick?: () => void;
  hasUpdate?: boolean;
};

export function Header({ onMenuClick, onGitHubClick, hasUpdate = false }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        py: 1.25,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <ShieldIcon sx={{ color: "primary.main", fontSize: 22 }} />
        <Typography
          sx={{ fontSize: 16, fontWeight: 700, color: "primary.main", letterSpacing: 0.2 }}
        >
          GP Connect
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        <Tooltip title="View on GitHub" placement="bottom">
          <IconButton size="small" onClick={onGitHubClick} aria-label="github">
            <GitHubIcon sx={{ fontSize: 19, color: "text.secondary" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={hasUpdate ? "Menu — update available" : "Menu"} placement="bottom">
          <IconButton
            size="small"
            onClick={(e) => onMenuClick?.(e.currentTarget)}
            aria-label="menu"
          >
            <Badge
              variant="dot"
              color="primary"
              invisible={!hasUpdate}
              sx={{ "& .MuiBadge-dot": { width: 7, height: 7, minWidth: 7 } }}
            >
              <MenuIcon sx={{ fontSize: 21, color: "text.secondary" }} />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
