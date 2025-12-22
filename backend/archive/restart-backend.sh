#!/bin/bash
# Script to restart the backend service and verify it's running

set -e

echo "🔄 Restarting backend service..."

# Restart the PM2 process
cd /srv/wdp/current-beta
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

# Wait a moment for the service to start
sleep 3

# Check the status
echo "🔍 Checking service status..."
pm2 list

# Check health endpoint
echo "🩺 Checking health endpoint..."
curl -fsS http://localhost:3001/health || echo "❌ Health check failed"

echo "✅ Backend restart process completed"