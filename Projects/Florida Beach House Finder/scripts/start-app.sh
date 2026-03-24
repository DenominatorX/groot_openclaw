#!/usr/bin/env bash
# start-app.sh — Start the Florida Beach House Finder Next.js app on port 3001
#
# Run this before starting the tunnel.
# The app will be accessible at http://localhost:3001/apps/beach

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT=3001

echo "Starting Florida Beach House Finder on port $PORT..."
echo "App dir: $APP_DIR"
echo ""

cd "$APP_DIR"

# Load .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Build if .next doesn't exist or is stale
if [ ! -d ".next" ]; then
  echo "No .next build found — building first..."
  npm run build
fi

exec npm run start -- -p $PORT
