#!/usr/bin/env bash
# deploy-tunnel.sh — Set up the Cloudflare Tunnel for the Florida Beach House Finder
#
# Run once to configure the tunnel. After that, use start-tunnel.sh to run it.
#
# Prerequisites:
#   1. cloudflared installed (brew install cloudflared)
#   2. Cloudflare account with denominatorx.com zone
#
# Usage:
#   chmod +x scripts/deploy-tunnel.sh
#   ./scripts/deploy-tunnel.sh

set -euo pipefail

TUNNEL_NAME="denominatorx-beach"
HOSTNAME="denominatorx.com"
SUBDOMAIN_PATH="/apps/beach"
LOCAL_PORT=3001

echo "=== Florida Beach House Finder — Cloudflare Tunnel Setup ==="
echo ""

# Step 1: Authenticate with Cloudflare (opens browser)
echo "Step 1: Authenticating with Cloudflare..."
echo "This will open your browser. Log in with the Cloudflare account that manages $HOSTNAME."
echo ""
cloudflared tunnel login

# Step 2: Create named tunnel
echo ""
echo "Step 2: Creating tunnel '$TUNNEL_NAME'..."
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
  echo "Tunnel '$TUNNEL_NAME' already exists — skipping creation."
  TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
else
  cloudflared tunnel create "$TUNNEL_NAME"
  TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
fi
echo "Tunnel ID: $TUNNEL_ID"

# Step 3: Write tunnel config
CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/${TUNNEL_NAME}.yml"

echo ""
echo "Step 3: Writing tunnel config to $CONFIG_FILE..."
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/$TUNNEL_ID.json

ingress:
  # Route /apps/beach/* to the local Next.js app
  - hostname: $HOSTNAME
    path: /apps/beach
    service: http://localhost:$LOCAL_PORT
  - service: http_status:404
EOF
echo "Config written."

# Step 4: Create DNS route
echo ""
echo "Step 4: Routing $HOSTNAME$SUBDOMAIN_PATH → tunnel..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME"
echo "DNS route created."

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "  1. Start the Next.js app:  npm run start -- -p $LOCAL_PORT"
echo "     (or install the launchd service: scripts/install-launchd.sh)"
echo "  2. Start the tunnel:       cloudflared tunnel --config $CONFIG_FILE run $TUNNEL_NAME"
echo "     (or install the launchd service: scripts/install-launchd.sh)"
echo ""
echo "The app will be live at: https://$HOSTNAME$SUBDOMAIN_PATH"
