#!/bin/bash
set -e
echo "=== Stopping PM2 services ==="
cd /mnt/c/Users/Sandeep/.gemini/antigravity/playground/ultraviolet-tyson/ganesh-bns
npx pm2 stop all || true
echo "=== Deleting .next cache ==="
rm -rf .next
echo "=== Rebuilding project ==="
npm run build
echo "=== Starting PM2 services ==="
npx pm2 start ecosystem.config.js
npx pm2 save
echo "=== Done! ==="
npx pm2 list
