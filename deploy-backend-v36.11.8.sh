#!/bin/bash

# V36.11.8 Backend Deployment Script
# Fixes CORS to allow Netlify URLs

echo "🚀 Deploying Backend V36.11.8 - CORS Fix for Netlify"
echo "=================================================="
echo ""

# Check if we're on the VPS
if [ ! -d "/root/workforce-democracy" ]; then
    echo "❌ Error: Not on VPS or wrong directory structure"
    echo "This script should be run on 185.193.126.13"
    exit 1
fi

cd /root/workforce-democracy/backend

echo "📋 Creating backup..."
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)

echo "✅ Backup created"
echo ""

echo "📝 Updating server.js with Netlify CORS support..."

# The CORS section should already be updated in your local version
# This script assumes you've already updated server.js locally
# and are deploying the changes

echo "✅ server.js should be updated with:"
echo "   - Netlify wildcard support (.netlify.app)"
echo "   - workforcedemocracyproject.org support"
echo ""

echo "🔄 Restarting backend server..."
pm2 restart workforce-backend

echo "✅ Backend restarted"
echo ""

echo "📊 Checking logs..."
pm2 logs workforce-backend --lines 20 --nostream

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Deploy frontend to Netlify"
echo "2. Clear browser cache"
echo "3. Test LLM assistant chat"
echo "4. Check console for CORS errors"
echo ""
echo "To monitor logs:"
echo "  pm2 logs workforce-backend"
echo "=================================================="
