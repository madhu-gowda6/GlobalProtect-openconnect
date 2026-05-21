import { Box, Link, Typography } from "@mui/material";

export function AboutTab() {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontSize: 16, mb: 1.5 }}>
        About
      </Typography>
      <Typography sx={{ fontSize: 13, mb: 0.5 }}>
        <strong>GP Connect</strong> (gpgui-replica)
      </Typography>
      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)", mb: 1.5 }}>
        Version v2.5.4
      </Typography>
      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)", mb: 0.5 }}>
        Developed by{" "}
        <Link
          href="https://github.com/madhu-gowda6"
          target="_blank"
          rel="noreferrer"
          sx={{ color: "primary.main" }}
        >
          Atharv
        </Link>
        .
      </Typography>
      <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)", mt: 2 }}>
        Built with Tauri 2, React 19, and MUI 7. Talks to the gpservice daemon
        over its local WebSocket IPC.
      </Typography>
    </Box>
  );
}
