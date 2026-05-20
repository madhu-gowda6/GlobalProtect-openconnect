import { Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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
        px: 1,
        pt: 1,
      }}
    >
      <IconButton
        size="small"
        onClick={(e) => onMenuClick?.(e.currentTarget)}
        aria-label="menu"
      >
        <MenuIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.85)" }} />
      </IconButton>
      <IconButton size="small" onClick={onGitHubClick} aria-label="github">
        <GitHubIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.85)" }} />
      </IconButton>
    </Box>
  );
}
