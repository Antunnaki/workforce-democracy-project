#!/bin/bash

# ============================================================================
# UPLOAD SCRIPT - MORE SOURCES FIX v37.4.1
# ============================================================================
# Uploads the 3 modified files to your VPS
# ============================================================================

echo "📤 Uploading More Sources Fix v37.4.1 to VPS..."
echo ""

# Your local project path
LOCAL_PATH="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.4.0"

# VPS details
VPS_USER="root"
VPS_HOST="185.193.126.13"

echo "📁 Uploading from: $LOCAL_PATH"
echo "🌐 Uploading to: $VPS_USER@$VPS_HOST"
echo ""

# Upload the 3 modified files
echo "📄 Uploading ai-service.js..."
scp "$LOCAL_PATH/backend/ai-service.js" "$VPS_USER@$VPS_HOST:~/"

echo "📄 Uploading rss-service-MERGED-v37.4.0.js..."
scp "$LOCAL_PATH/backend/rss-service-MERGED-v37.4.0.js" "$VPS_USER@$VPS_HOST:~/"

echo "📄 Uploading keyword-extraction.js..."
scp "$LOCAL_PATH/backend/keyword-extraction.js" "$VPS_USER@$VPS_HOST:~/"

echo "📄 Uploading deployment script..."
scp "$LOCAL_PATH/🚀-DEPLOY-MORE-SOURCES-v37.4.1.sh" "$VPS_USER@$VPS_HOST:~/"

echo ""
echo "✅ Upload complete!"
echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "📋 Next Steps:"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "1. SSH to VPS:"
echo "   ssh $VPS_USER@$VPS_HOST"
echo ""
echo "2. Run deployment script:"
echo "   bash ~/🚀-DEPLOY-MORE-SOURCES-v37.4.1.sh"
echo ""
echo "3. Test with:"
echo "   Ask chat: 'Can you tell me about Ron DeSantis?'"
echo ""
echo "Expected results:"
echo "  ✅ 5-10 sources about DeSantis (not just 1 Trump article)"
echo "  ✅ ALL citations [1]-[10] clickable"
echo "  ✅ Backend logs: 'RSS: 5/20 articles passed' (not 1/20)"
echo ""
