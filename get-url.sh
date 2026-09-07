#!/bin/bash
npx pm2 logs ganesh-bns-tunnel --nostream --lines 20 > /tmp/tunnel.log
URL=$(grep -o 'https://.*pinggy.net' /tmp/tunnel.log | tail -n 1)
echo "----------------------------------------"
echo "🌐 YOUR SECURE LIVE PREVIEW URL IS:"
echo "$URL"
echo "----------------------------------------"
