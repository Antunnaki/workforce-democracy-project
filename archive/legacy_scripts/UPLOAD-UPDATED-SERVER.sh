#!/bin/bash

# ==============================================================================
# UPLOAD UPDATED SERVER.JS TO VPS
# ==============================================================================
# This script uploads the personalization-enabled server.js to your VPS
# and creates the personalization route file
# ==============================================================================

echo "🚀 Uploading updated server.js with personalization support..."
echo ""

# Upload the updated server.js
echo "📤 Step 1: Uploading server.js..."
scp -P 22 backend/server-UPDATED-WITH-PERSONALIZATION.js root@185.193.126.13:/var/www/workforce-democracy/backend/server.js

if [ $? -eq 0 ]; then
    echo "✅ server.js uploaded successfully!"
else
    echo "❌ Failed to upload server.js"
    exit 1
fi

echo ""
echo "✅ Upload complete!"
echo ""
echo "📋 NEXT STEPS (run these on VPS):"
echo ""
echo "1. SSH into VPS:"
echo "   ssh root@185.193.126.13 -p 22"
echo ""
echo "2. Create personalization route:"
echo "   cd /var/www/workforce-democracy/backend"
echo "   mkdir -p routes"
echo "   nano routes/personalization.js"
echo "   (Copy code from GOOD-MORNING-SETUP-GUIDE.md)"
echo ""
echo "3. Restart backend:"
echo "   /opt/nodejs/bin/pm2 restart 0"
echo ""
echo "4. Check logs:"
echo "   /opt/nodejs/bin/pm2 logs 0 --lines 30"
echo ""
echo "Look for: ✅ Personalization API loaded (v37.11.4)"
echo ""
