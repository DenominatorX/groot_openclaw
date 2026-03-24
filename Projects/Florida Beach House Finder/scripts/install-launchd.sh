#!/usr/bin/env bash
# install-launchd.sh — Install launchd services for the beach finder app and tunnel
#
# This will keep both the Next.js app AND the Cloudflare tunnel running persistently
# on this Mac, auto-starting on login.
#
# Prerequisites: Run scripts/deploy-tunnel.sh first to create and configure the tunnel.
#
# Usage:
#   chmod +x scripts/install-launchd.sh
#   ./scripts/install-launchd.sh

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TUNNEL_NAME="denominatorx-beach"
PORT=3001
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
LOG_DIR="$HOME/Library/Logs"

mkdir -p "$LAUNCH_AGENTS_DIR"

# ── 1. Next.js App Service ────────────────────────────────────────────────────
APP_PLIST="$LAUNCH_AGENTS_DIR/com.denominatorx.beach-app.plist"

echo "Writing app plist: $APP_PLIST"
cat > "$APP_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.denominatorx.beach-app</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>node_modules/.bin/next</string>
        <string>start</string>
        <string>-p</string>
        <string>$PORT</string>
    </array>

    <key>WorkingDirectory</key>
    <string>$APP_DIR</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
        <key>NEXT_PUBLIC_BASE_PATH</key>
        <string>/apps/beach</string>
        <key>NEXT_PUBLIC_APP_URL</key>
        <string>https://denominatorx.com/apps/beach</string>
    </dict>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>StandardOutPath</key>
    <string>$LOG_DIR/beach-app.log</string>

    <key>StandardErrorPath</key>
    <string>$LOG_DIR/beach-app.error.log</string>
</dict>
</plist>
EOF

# ── 2. Cloudflare Tunnel Service ──────────────────────────────────────────────
TUNNEL_PLIST="$LAUNCH_AGENTS_DIR/com.denominatorx.beach-tunnel.plist"
CONFIG_FILE="$HOME/.cloudflared/${TUNNEL_NAME}.yml"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "WARNING: Tunnel config not found at $CONFIG_FILE"
  echo "Run scripts/deploy-tunnel.sh first, then re-run this script."
  exit 1
fi

echo "Writing tunnel plist: $TUNNEL_PLIST"
cat > "$TUNNEL_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.denominatorx.beach-tunnel</string>

    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>--config</string>
        <string>$CONFIG_FILE</string>
        <string>run</string>
        <string>$TUNNEL_NAME</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>StandardOutPath</key>
    <string>$LOG_DIR/beach-tunnel.log</string>

    <key>StandardErrorPath</key>
    <string>$LOG_DIR/beach-tunnel.error.log</string>
</dict>
</plist>
EOF

# ── 3. Load the services ──────────────────────────────────────────────────────
echo ""
echo "Loading launchd services..."

# Build the app first if needed
if [ ! -d "$APP_DIR/.next" ]; then
  echo "Building Next.js app..."
  (cd "$APP_DIR" && npm run build)
fi

launchctl load "$APP_PLIST" 2>/dev/null && echo "App service loaded." || echo "App service already loaded (or error — check logs)."
launchctl load "$TUNNEL_PLIST" 2>/dev/null && echo "Tunnel service loaded." || echo "Tunnel service already loaded."

echo ""
echo "=== Services installed ==="
echo ""
echo "App log:    $LOG_DIR/beach-app.log"
echo "Tunnel log: $LOG_DIR/beach-tunnel.log"
echo ""
echo "To unload:"
echo "  launchctl unload $APP_PLIST"
echo "  launchctl unload $TUNNEL_PLIST"
echo ""
echo "Live URL: https://denominatorx.com/apps/beach"
