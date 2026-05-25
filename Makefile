.SHELLFLAGS += -e

CARGO             ?= cargo
RUST_VERSION      ?= 1.89
IGNORE_RUST_VERSION ?= 0
DISABLE_RUST_TOOLCHAIN ?= 0
OFFLINE           ?= 0

VERSION = $(shell grep '^version' Cargo.toml | head -1 | sed 's/version *= *"\(.*\)"/\1/')
PKG_NAME = globalprotect-openconnect

CARGO_BUILD_ARGS = --release

ifeq ($(OFFLINE), 1)
	CARGO_BUILD_ARGS += --frozen
endif

ifeq ($(IGNORE_RUST_VERSION), 1)
	CARGO_BUILD_ARGS += --ignore-rust-version
endif

default: build

version:
	@echo $(VERSION)

build: build-rs

build-rs:
	if [ $(DISABLE_RUST_TOOLCHAIN) -eq 1 ]; then rm -vf rust-toolchain.toml; fi
	$(CARGO) build $(CARGO_BUILD_ARGS) -p gpclient -p gpservice -p gpauth

clean:
	$(CARGO) clean
	rm -rf .build

install:
	@echo "Installing $(PKG_NAME) $(VERSION)..."

	install -Dm755 target/release/gpclient    $(DESTDIR)/usr/bin/gpclient
	install -Dm755 target/release/gpauth      $(DESTDIR)/usr/bin/gpauth
	install -Dm755 target/release/gpservice   $(DESTDIR)/usr/bin/gpservice
	install -Dm755 target/release/gpgui-replica $(DESTDIR)/usr/bin/gpgui

	install -Dm755 packaging/files/usr/libexec/gpclient/vpnc-script  $(DESTDIR)/usr/libexec/gpclient/vpnc-script
	install -Dm755 packaging/files/usr/libexec/gpclient/hipreport.sh $(DESTDIR)/usr/libexec/gpclient/hipreport.sh

	install -Dm755 packaging/files/usr/lib/NetworkManager/dispatcher.d/pre-down.d/gpclient.down \
		$(DESTDIR)/usr/lib/NetworkManager/dispatcher.d/pre-down.d/gpclient.down
	install -Dm755 packaging/files/usr/lib/NetworkManager/dispatcher.d/gpclient-nm-hook \
		$(DESTDIR)/usr/lib/NetworkManager/dispatcher.d/gpclient-nm-hook

	install -Dm644 packaging/files/usr/share/applications/gpgui.desktop \
		$(DESTDIR)/usr/share/applications/gpgui.desktop
	install -Dm644 packaging/files/usr/share/icons/hicolor/scalable/apps/gpgui.svg \
		$(DESTDIR)/usr/share/icons/hicolor/scalable/apps/gpgui.svg
	install -Dm644 packaging/files/usr/share/icons/hicolor/32x32/apps/gpgui.png \
		$(DESTDIR)/usr/share/icons/hicolor/32x32/apps/gpgui.png
	install -Dm644 packaging/files/usr/share/icons/hicolor/128x128/apps/gpgui.png \
		$(DESTDIR)/usr/share/icons/hicolor/128x128/apps/gpgui.png
	install -Dm644 packaging/files/usr/share/icons/hicolor/256x256@2/apps/gpgui.png \
		$(DESTDIR)/usr/share/icons/hicolor/256x256@2/apps/gpgui.png
	install -Dm644 packaging/files/usr/share/polkit-1/actions/com.atharv.gpgui.policy \
		$(DESTDIR)/usr/share/polkit-1/actions/com.atharv.gpgui.policy

	gtk-update-icon-cache -f -t $(DESTDIR)/usr/share/icons/hicolor 2>/dev/null || true
	update-desktop-database -q $(DESTDIR)/usr/share/applications 2>/dev/null || true

uninstall:
	@echo "Uninstalling $(PKG_NAME)..."

	rm -f $(DESTDIR)/usr/bin/gpclient
	rm -f $(DESTDIR)/usr/bin/gpauth
	rm -f $(DESTDIR)/usr/bin/gpservice
	rm -f $(DESTDIR)/usr/bin/gpgui

	rm -f $(DESTDIR)/usr/libexec/gpclient/vpnc-script
	rm -f $(DESTDIR)/usr/libexec/gpclient/hipreport.sh

	rm -f $(DESTDIR)/usr/lib/NetworkManager/dispatcher.d/pre-down.d/gpclient.down
	rm -f $(DESTDIR)/usr/lib/NetworkManager/dispatcher.d/gpclient-nm-hook

	rm -f $(DESTDIR)/usr/share/applications/gpgui.desktop
	rm -f $(DESTDIR)/usr/share/icons/hicolor/scalable/apps/gpgui.svg
	rm -f $(DESTDIR)/usr/share/icons/hicolor/32x32/apps/gpgui.png
	rm -f $(DESTDIR)/usr/share/icons/hicolor/128x128/apps/gpgui.png
	rm -f $(DESTDIR)/usr/share/icons/hicolor/256x256@2/apps/gpgui.png
	rm -f $(DESTDIR)/usr/share/polkit-1/actions/com.atharv.gpgui.policy

	gtk-update-icon-cache -f -t $(DESTDIR)/usr/share/icons/hicolor 2>/dev/null || true
	update-desktop-database -q $(DESTDIR)/usr/share/applications 2>/dev/null || true

.PHONY: default version build build-rs clean install uninstall
