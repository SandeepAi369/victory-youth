#!/bin/bash
echo 'Stopping Ganesh BNS Background Services...'
cd /mnt/c/Users/Sandeep/.gemini/antigravity/playground/ultraviolet-tyson/ganesh-bns
npx pm2 stop ecosystem.config.js
echo 'Services stopped.'
