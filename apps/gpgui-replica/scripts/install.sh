#!/usr/bin/env bash
#
# install.sh — install the open-source GlobalProtect stack (gpgui-replica GUI +
# gpclient/gpservice/gpauth) system-wide, including the polkit policy, desktop
# entry, icons, vpnc-script and NetworkManager hooks.
#
# Usage:
#   1. Build the binaries first (as your normal user, NOT root):
#        cd <repo-root>
#        export CARGO_TARGET_DIR="$HOME/gp-target"        # if your path has spaces
#        cargo build --release -p gpservice -p gpauth -p gpclient -p gpgui-replica
#        (cd apps/gpgui-replica && pnpm install && pnpm build && \
#           cd - && cargo build --release -p gpgui-replica)
#   2. Install:
#        sudo apps/gpgui-replica/scripts/install.sh
#
# Optional: override where the built binaries live:
#        sudo BIN_DIR=/path/to/release apps/gpgui-replica/scripts/install.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
FILES="$REPO_ROOT/packaging/files"

if [ "$(id -u)" -ne 0 ]; then
  echo "error: run with sudo (installs to /usr/bin, /usr/share, ...)." >&2
  echo "       sudo $0" >&2
  exit 1
fi

# Locate the built binaries. Checks $BIN_DIR, $CARGO_TARGET_DIR, the repo's
# target/, and the invoking user's ~/gp-target (the space-in-path workaround).
USER_HOME="$(getent passwd "${SUDO_USER:-root}" | cut -d: -f6)"
find_bin_dir() {
  local d
  for d in \
    "${BIN_DIR:-}" \
    "${CARGO_TARGET_DIR:-}/release" \
    "$REPO_ROOT/target/release" \
    "$USER_HOME/gp-target/release"; do
    [ -n "$d" ] && [ -x "$d/gpservice" ] && [ -x "$d/gpgui-replica" ] && { echo "$d"; return 0; }
  done
  return 1
}

if ! SRC="$(find_bin_dir)"; then
  echo "error: built binaries not found." >&2
  echo "       Build them first, then re-run. See the header of this script." >&2
  exit 1
fi

echo "Installing from: $SRC"

install -Dm755 "$SRC/gpclient"       /usr/bin/gpclient
install -Dm755 "$SRC/gpauth"         /usr/bin/gpauth
install -Dm755 "$SRC/gpservice"      /usr/bin/gpservice
# The replica GUI is installed as /usr/bin/gpgui so gpservice spawns it.
install -Dm755 "$SRC/gpgui-replica"  /usr/bin/gpgui

# Support files (shared with the upstream packaging).
install -Dm755 "$FILES/usr/libexec/gpclient/vpnc-script" /usr/libexec/gpclient/vpnc-script
install -Dm755 "$FILES/usr/libexec/gpclient/hipreport.sh" /usr/libexec/gpclient/hipreport.sh

install -Dm755 "$FILES/usr/lib/NetworkManager/dispatcher.d/pre-down.d/gpclient.down" \
  /usr/lib/NetworkManager/dispatcher.d/pre-down.d/gpclient.down
install -Dm755 "$FILES/usr/lib/NetworkManager/dispatcher.d/gpclient-nm-hook" \
  /usr/lib/NetworkManager/dispatcher.d/gpclient-nm-hook

install -Dm644 "$FILES/usr/share/applications/gpgui.desktop" /usr/share/applications/gpgui.desktop
install -Dm644 "$FILES/usr/share/icons/hicolor/scalable/apps/gpgui.svg" \
  /usr/share/icons/hicolor/scalable/apps/gpgui.svg
install -Dm644 "$FILES/usr/share/icons/hicolor/32x32/apps/gpgui.png" \
  /usr/share/icons/hicolor/32x32/apps/gpgui.png
install -Dm644 "$FILES/usr/share/icons/hicolor/128x128/apps/gpgui.png" \
  /usr/share/icons/hicolor/128x128/apps/gpgui.png
install -Dm644 "$FILES/usr/share/icons/hicolor/256x256@2/apps/gpgui.png" \
  /usr/share/icons/hicolor/256x256@2/apps/gpgui.png
install -Dm644 "$FILES/usr/share/polkit-1/actions/com.atharv.gpgui.policy" \
  /usr/share/polkit-1/actions/com.atharv.gpgui.policy

# Refresh desktop/icon caches (best-effort).
update-desktop-database -q /usr/share/applications 2>/dev/null || true
gtk-update-icon-cache -q -t /usr/share/icons/hicolor 2>/dev/null || true

echo
echo "Installed. Launch with:  gpclient launch-gui"
echo "(or find 'GP Connect' in your application menu)"
