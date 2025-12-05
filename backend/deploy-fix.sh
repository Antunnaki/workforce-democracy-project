#!/bin/bash

# Backend Fix Deployment Script - V36.11.9
# Fixes CORS crash causing 129 restarts

echo "🔧 Deploying Backend Fix V36.11.9..."
echo ""

# Step 1: Check current status
echo "📊 Current PM2 Status:"
pm2 status
echo ""

# Step 2: Restart backend
echo "🔄 Restarting workforce-backend..."
pm2 restart workforce-backend
echo ""

# Step 3: Wait a moment
echo "⏳ Waiting 5 seconds for server to start..."
sleep 5
echo ""

# Step 4: Check new status
echo "📊 New PM2 Status:"
pm2 status
echo ""

# Step 5: Show recent logs
echo "📋 Recent Logs (checking for errors):"
pm2 logs workforce-backend --lines 20 --nostream
echo ""

# Step 6: Instructions
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Check that 'restarts' count is 0 (not 129)"
echo "  2. Watch logs for 1 minute: pm2 logs workforce-backend"
echo "  3. Test chat from frontend: https://sxcrlfyt.gensparkspace.com"
echo ""
echo "🔍 Monitor for 5 minutes with:"
echo "  watch -n 10 'pm2 status'"
echo ""
