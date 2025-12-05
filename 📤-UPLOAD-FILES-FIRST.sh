#!/bin/bash
# =============================================================================
# 📤 UPLOAD FILES TO VPS - Run This On Your LOCAL Machine First
# =============================================================================
#
# IMPORTANT: Run this script on your LOCAL computer (NOT on the VPS!)
# This will upload both required files to the VPS automatically.
#
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 UPLOADING FILES TO VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Run this on your LOCAL machine (not on VPS!)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if files exist locally
if [ ! -f "backend/keyword-extraction.js" ]; then
    echo "❌ ERROR: backend/keyword-extraction.js not found!"
    echo "   Please make sure you're in the project root directory."
    exit 1
fi

if [ ! -f "backend/rss-service-MERGED-v37.4.0.js" ]; then
    echo "❌ ERROR: backend/rss-service-MERGED-v37.4.0.js not found!"
    echo "   Please make sure you're in the project root directory."
    exit 1
fi

echo "✅ Both files found locally"
echo ""

# Upload files using SCP
echo "📤 Uploading keyword-extraction.js..."
scp backend/keyword-extraction.js root@185.193.126.13:/var/www/workforce-democracy/backend/ || {
    echo "❌ Upload failed!"
    echo "   Please check:"
    echo "   1. SSH access to 185.193.126.13"
    echo "   2. Password is correct"
    echo "   3. Target directory exists"
    exit 1
}

echo "✅ keyword-extraction.js uploaded"
echo ""

echo "📤 Uploading rss-service-MERGED-v37.4.0.js..."
scp backend/rss-service-MERGED-v37.4.0.js root@185.193.126.13:/var/www/workforce-democracy/backend/ || {
    echo "❌ Upload failed!"
    exit 1
}

echo "✅ rss-service-MERGED-v37.4.0.js uploaded"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 UPLOAD COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Both files successfully uploaded to VPS"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 NEXT STEP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. SSH to your VPS:"
echo "   ssh root@185.193.126.13"
echo ""
echo "2. Copy and paste the ENTIRE 🚀-SELF-EXECUTING-DEPLOYMENT-v37.4.0.sh"
echo "   script into your SSH terminal"
echo ""
echo "3. Press Enter and let it run automatically"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
