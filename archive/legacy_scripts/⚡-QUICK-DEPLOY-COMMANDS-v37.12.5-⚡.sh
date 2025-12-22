#!/bin/bash

# ============================================================================
# BILLS API DEPLOYMENT - v37.12.5
# Quick deployment script for VPS backend
# ============================================================================

echo "🚀 Starting Bills API Deployment (v37.12.5)"
echo ""

# Change to project directory
echo "📂 Navigating to project directory..."
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.12.5-BILLS-API"

echo ""
echo "📤 Uploading backend files to VPS..."
echo ""

# Upload Bills API routes
echo "  ✅ Uploading bills-routes.js..."
scp backend/routes/bills-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/

# Upload updated server.js
echo "  ✅ Uploading server.js..."
scp backend/server.js root@185.193.126.13:/var/www/workforce-democracy/backend/

echo ""
echo "✅ Files uploaded successfully!"
echo ""
echo "🔄 Now SSH into VPS and restart PM2..."
echo ""
echo "Run these commands on VPS:"
echo "  ssh root@185.193.126.13"
echo "  /opt/nodejs/bin/pm2 restart backend"
echo "  /opt/nodejs/bin/pm2 logs backend --lines 30"
echo ""
echo "🧪 Test backend with:"
echo "  curl https://api.workforcedemocracyproject.org/api/bills/health"
echo ""
echo "🎉 Backend deployment complete!"
