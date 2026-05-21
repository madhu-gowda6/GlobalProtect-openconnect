# Changelog

## 1.0.0 - 2026-05-21

Initial release of GP Connect — an open-source fork of [yuezk/GlobalProtect-openconnect](https://github.com/yuezk/GlobalProtect-openconnect).

### New in this fork

- **Open-source GUI** — Fully open-source Tauri 2 + React GUI replacing the proprietary gpgui
- **Settings persistence** — All preferences (OS spoof, HIP, TLS, theme) saved to `~/.config/gpgui/settings.json`
- **Light / Dark / System theme** — Respects `prefers-color-scheme` and saved preference
- **Recent portals dropdown** — Quick reconnect to previously used portals
- **HIP toggle wired** — Settings → Connection → Submit HIP now actually affects connections
- **Multi-round MFA** — Full support for gateway MFA challenge loops
- **Portal/Gateway fallback** — Automatically retries direct gateway auth when portal cookie is rejected
- **Credentials dialog** — Clean username/password dialog when portal uses standard login
- **Real-time status** — WebSocket-driven live connection state from gpservice
- **Auto-reconnect** — Reconnects to gpservice after daemon restarts
- **.deb packaging** — GitHub Actions workflow builds amd64 + arm64 .deb packages on every push to main

### Inherited from upstream (v2.5.4)

- CLI client (`gpclient`) with full SSO, cookie, and browser auth support
- Background VPN service (`gpservice`) with encrypted WebSocket IPC
- SAML/SSO authentication helper (`gpauth`)
- OpenConnect integration with GlobalProtect patches (app-version, OS-version, user-agent)
- NetworkManager dispatcher hooks
- Polkit policy for passwordless GUI launch
- HIP report generation
