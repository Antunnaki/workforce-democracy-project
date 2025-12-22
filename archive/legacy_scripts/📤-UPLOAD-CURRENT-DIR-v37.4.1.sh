#!/bin/bash

# ============================================================================
# UPLOAD SCRIPT - MORE SOURCES FIX v37.4.1
# Uses CURRENT directory (wherever you run it from)
# ============================================================================

echo "📤 Uploading More Sources Fix v37.4.1 to VPS..."
echo ""

# Get current directory
CURRENT_DIR="$(pwd)"

# VPS details
VPS_USER="root"
VPS_HOST="185.193.126.13"

echo "📁 Uploading from: $CURRENT_DIR"
echo "🌐 Uploading to: $VPS_USER@$VPS_HOST"
echo ""

# Check if files exist first
echo "🔍 Checking for required files..."

if [ ! -f "backend/ai-service.js" ]; then
    echo "❌ ERROR: backend/ai-service.js not found in current directory"
    echo "   Current directory: $CURRENT_DIR"
    echo "   Please run this script from the project root directory"
    exit 1
fi

if [ ! -f "backend/rss-service-MERGED-v37.4.0.js" ]; then
    echo "❌ ERROR: backend/rss-service-MERGED-v37.4.0.js not found"
    exit 1
fi

if [ ! -f "backend/keyword-extraction.js" ]; then
    echo "❌ ERROR: backend/keyword-extraction.js not found"
    exit 1
fi

echo "✅ All files found!"
echo ""

# Upload the 3 modified files
echo "📄 Uploading ai-service.js..."
scp "$CURRENT_DIR/backend/ai-service.js" "$VPS_USER@$VPS_HOST:~/"

echo "📄 Uploading rss-service-MERGED-v37.4.0.js..."
scp "$CURRENT_DIR/backend/rss-service-MERGED-v37.4.0.js" "$VPS_USER@$VPS_HOST:~/"

echo "📄 Uploading keyword-extraction.js..."
scp "$CURRENT_DIR/backend/keyword-extraction.js" "$VPS_USER@$VPS_HOST:~/"

echo "📄 Uploading deployment script..."
scp "$CURRENT_DIR/🚀-DEPLOY-MORE-SOURCES-v37.4.1.sh" "$VPS_USER@$VPS_HOST:~/"

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
