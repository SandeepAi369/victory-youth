#!/bin/bash
echo "Starting Ganesh BNS Background Services..."
cd /mnt/c/Users/Sandeep/.gemini/antigravity/playground/ultraviolet-tyson/ganesh-bns
npx pm2 start ecosystem.config.js
npx pm2 save
echo "Services started! Waiting for tunnel to establish..."
sleep 4
./get-url.sh
