#!/bin/bash
# WORKFORCE DEMOCRACY PROJECT - Bills API Deployment
# Version: 37.12.5-BILLS-API
# Date: November 20, 2025

echo "🚀 DEPLOYING BILLS API v37.12.5 TO VPS..."
echo ""
echo "📁 Files to deploy:"
echo "  - backend/routes/bills-routes.js"
echo "  - backend/server.js (already has Bills routes registered)"
echo ""
echo "⚙️  VPS: root@185.193.126.13"
echo "📂 Path: /var/www/workforce-democracy/backend/"
echo ""

# ============================================================================
# STEP 1: Upload Bills Routes File
# ============================================================================

echo "📤 [1/3] Uploading bills-routes.js..."
scp backend/routes/bills-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/

if [ $? -eq 0 ]; then
    echo "✅ bills-routes.js uploaded successfully"
else
    echo "❌ Failed to upload bills-routes.js"
    exit 1
fi

echo ""

# ============================================================================
# STEP 2: Restart PM2 Backend
# ============================================================================

echo "🔄 [2/3] Restarting PM2 backend process..."
ssh root@185.193.126.13 "/opt/nodejs/bin/pm2 restart backend"

if [ $? -eq 0 ]; then
    echo "✅ PM2 backend restarted successfully"
else
    echo "❌ Failed to restart PM2 backend"
    exit 1
fi

echo ""

# ============================================================================
# STEP 3: Verify Deployment
# ============================================================================

echo "🔍 [3/3] Checking PM2 logs for Bills API initialization..."
echo ""
ssh root@185.193.126.13 "/opt/nodejs/bin/pm2 logs backend --lines 20 --nostream" | grep -i "bills"

echo ""
echo "============================================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================================================"
echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Test Bills API health endpoint:"
echo "   curl https://api.workforcedemocracyproject.org/api/bills/health"
echo ""
echo "2. Check full PM2 logs:"
echo "   ssh root@185.193.126.13"
echo "   /opt/nodejs/bin/pm2 logs backend --lines 50"
echo ""
echo "3. Test Bills API with a ZIP code:"
echo "   curl 'https://api.workforcedemocracyproject.org/api/bills/location?zip=12061'"
echo ""
echo "4. Deploy frontend to GenSparkSpace for testing"
echo ""
echo "5. Deploy frontend to production Netlify"
echo ""
echo "🎉 Bills API v37.12.5 is now live on your VPS!"
echo ""
