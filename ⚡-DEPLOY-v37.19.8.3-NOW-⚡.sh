#!/bin/bash

# ⚡ QUICK DEPLOY v37.19.8.3 - TWO CRITICAL BUGS FIXED ⚡
# Password: YNWA1892LFC

echo "🚀 Starting deployment of v37.19.8.3..."
echo ""
echo "This will fix TWO critical bugs:"
echo "  1. getCacheStats import error (crashes article scraper)"
echo "  2. relevanceScore 50→100 (sources filtered out)"
echo ""

# Change to backend directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend" || {
    echo "❌ ERROR: Could not find backend directory"
    echo "Please check the path:"
    echo "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend"
    exit 1
}

echo "✅ Found backend directory"
echo ""

# Upload ai-service.js
echo "📤 Uploading ai-service.js..."
scp ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js || {
    echo "❌ Failed to upload ai-service.js"
    exit 1
}
echo "✅ ai-service.js uploaded"
echo ""

# Upload article-search-service.js
echo "📤 Uploading article-search-service.js..."
scp services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-search-service.js || {
    echo "❌ Failed to upload article-search-service.js"
    exit 1
}
echo "✅ article-search-service.js uploaded"
echo ""

# Restart service
echo "🔄 Restarting workforce-backend-b.service..."
ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service' || {
    echo "❌ Failed to restart service"
    exit 1
}
echo "✅ Service restarted"
echo ""

# Verify deployment
echo "🔍 Verifying deployment..."
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log | grep "v37.19.8.3"'

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Expected in logs:"
echo "  - AI-SERVICE.JS v37.19.8.3 LOADED"
echo "  - SCRAPER FIX - Import getCacheStats"
echo ""
echo "Next: Test with 'What are Mamdani's policies?'"
echo "Expected: 10 sources (not 3) + detailed analysis"
