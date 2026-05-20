# gpgui-replica

Open-source replica of the proprietary `gpgui` v2.5.4 GUI shipped with
GlobalProtect-openconnect. Drives the existing `gpservice` daemon over its
local WebSocket IPC, so it is fully interoperable with the rest of the
workspace (`gpclient`, `gpservice`, `gpauth`).

## Status

Milestone 1 of 8: project scaffold + empty dark window.

See conversation history / commit messages for the remaining milestones:
2. Connect-screen UI (static)
3. Hamburger menu + Settings window with 6 tabs (UI only)
4. WS client + api_key-on-stdin + VpnState events
5. Portal pre-login + gpauth spawn → real connect
6. Settings persistence + recent-portals dropdown
7. System tray
8. Theming + HiDPI

## Build

```sh
cd apps/gpgui-replica
pnpm install
pnpm tauri dev      # development
pnpm tauri build    # release bundle (.deb + AppImage)
```

## IPC contract

`gpgui-replica` follows the conventions established by the existing `gpgui`
binary in this repo:

- gpservice's WebSocket port is read from `/var/run/gpservice.lock` via
  `gpapi::utils::endpoint::ws_endpoint()`.
- The encryption api_key is delivered to the GUI on stdin (base64) when the
  service spawns it, per `crates/gpapi/src/process/gui_launcher.rs`.
- Frames on the wire are `gpapi::service::request::WsRequest` (sent) and
  `gpapi::service::event::WsEvent` (received), encrypted with
  `gpapi::utils::crypto::Crypto`.

## Drop-in replacement

To make `gpclient launch-gui` use this GUI instead of the proprietary
`gpgui`, symlink the built binary at the path defined in
`crates/common/src/constants.rs` (`GP_GUI_BINARY`, default `/usr/bin/gpgui`).
