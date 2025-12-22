#!/bin/bash

# Deploy beta frontend to VPS
echo "Deploying beta frontend to VPS..."

# Create a timestamp for this release
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
echo "Release timestamp: $STAMP"

# Create the release directory on the VPS
ssh deploy@185.193.126.13 "mkdir -p /srv/wdp/beta/releases/$STAMP/frontend /srv/wdp/beta/releases/$STAMP/backend"

# Deploy files to the VPS
rsync -avz --delete release-beta/frontend/ deploy@185.193.126.13:/srv/wdp/beta/releases/$STAMP/frontend/
rsync -avz --delete release-beta/backend/ deploy@185.193.126.13:/srv/wdp/beta/releases/$STAMP/backend/

# Update the symlink to point to the new release
ssh deploy@185.193.126.13 "sudo ln -sfn /srv/wdp/beta/releases/$STAMP /srv/wdp/beta/current"

# Restart the backend service on the VPS
ssh deploy@185.193.126.13 "cd /srv/wdp/beta/current/backend && npm install --production && pm2 restart wdp-beta-api || pm2 start server.js --name wdp-beta-api"

echo "Deployment completed!"
echo "To verify, run: ssh deploy@185.193.126.13 'ls -la /srv/wdp/beta/current/frontend'"