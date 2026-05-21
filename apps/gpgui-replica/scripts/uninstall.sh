#!/usr/bin/env bash
#
# uninstall.sh — remove the GlobalProtect open-source stack installed by install.sh.
#
# Usage:
#   sudo apps/gpgui-replica/scripts/uninstall.sh
#
# This removes:
#   /usr/bin/{gpclient,gpauth,gpservice,gpgui}
#   /usr/libexec/gpclient/{vpnc-script,hipreport.sh}
#   /usr/lib/NetworkManager/dispatcher.d/pre-down.d/gpclient.down
#   /usr/lib/NetworkManager/dispatcher.d/gpclient-nm-hook
#   /usr/share/applications/gpgui.desktop
#   /usr/share/icons/hicolor/{scalable,32x32,128x128,256x256@2}/apps/gpgui.*
#   /usr/share/polkit-1/actions/com.yuezk.gpgui.policy
#
# It does NOT touch the proprietary *.proprietary.bak files in /usr/bin/.
# To restore the proprietary binaries, run:
#   sudo mv /usr/bin/gpgui.proprietary.bak    /usr/bin/gpgui
#   sudo mv /usr/bin/gpclient.proprietary.bak /usr/bin/gpclient
#   sudo mv /usr/bin/gpauth.proprietary.bak   /usr/bin/gpauth
#   sudo mv /usr/bin/gpservice.proprietary.bak /usr/bin/gpservice
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "error: run with sudo (removes from /usr/bin, /usr/share, ...)." >&2
  echo "       sudo $0" >&2
  exit 1
fi

# Stop any running VPN session and daemons before removing binaries.
if pgrep -x gpgui >/dev/null 2>&1; then
  echo "Stopping running gpgui / gpservice..."
  pkill -x gpgui 2>/dev/null || true
  # Give gpservice a moment to shut down cleanly.
  sleep 1
fi
pkill -x gpservice 2>/dev/null || true
sleep 0.5
rm -f /var/run/gpservice.lock

echo "Removing binaries..."
rm -f /usr/bin/gpclient
rm -f /usr/bin/gpauth
rm -f /usr/bin/gpservice
rm -f /usr/bin/gpgui

echo "Removing support files..."
rm -f /usr/libexec/gpclient/vpnc-script
rm -f /usr/libexec/gpclient/hipreport.sh
rmdir --ignore-fail-on-non-empty /usr/libexec/gpclient 2>/dev/null || true

rm -f /usr/lib/NetworkManager/dispatcher.d/pre-down.d/gpclient.down
rm -f /usr/lib/NetworkManager/dispatcher.d/gpclient-nm-hook

echo "Removing desktop entry and icons..."
rm -f /usr/share/applications/gpgui.desktop
rm -f /usr/share/icons/hicolor/scalable/apps/gpgui.svg
rm -f /usr/share/icons/hicolor/32x32/apps/gpgui.png
rm -f /usr/share/icons/hicolor/128x128/apps/gpgui.png
rm -f /usr/share/icons/hicolor/256x256@2/apps/gpgui.png

echo "Removing polkit policy..."
rm -f /usr/share/polkit-1/actions/com.yuezk.gpgui.policy

# Refresh caches (best-effort).
update-desktop-database -q /usr/share/applications 2>/dev/null || true
gtk-update-icon-cache -q -t /usr/share/icons/hicolor 2>/dev/null || true

echo
echo "Uninstalled successfully."
echo
echo "Proprietary backup binaries (if any) are NOT removed:"
ls /usr/bin/*.proprietary.bak 2>/dev/null | sed 's/^/  /' || echo "  (none found)"
echo
echo "To restore proprietary binaries:"
echo "  sudo mv /usr/bin/gpgui.proprietary.bak    /usr/bin/gpgui"
echo "  sudo mv /usr/bin/gpclient.proprietary.bak /usr/bin/gpclient"
echo "  sudo mv /usr/bin/gpauth.proprietary.bak   /usr/bin/gpauth"
echo "  sudo mv /usr/bin/gpservice.proprietary.bak /usr/bin/gpservice"
