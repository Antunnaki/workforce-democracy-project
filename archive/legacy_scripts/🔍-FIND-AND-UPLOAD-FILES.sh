#!/bin/bash
# =============================================================================
# 🔍 FIND AND UPLOAD FILES - Run on Your Local Mac
# =============================================================================

echo "🔍 Searching for downloaded files..."
echo ""

# Find the files (they're likely in Downloads or Desktop)
KEYWORD_FILE=$(find ~/Downloads ~/Desktop ~/Documents -name "keyword-extraction.js" -type f 2>/dev/null | head -1)
MERGED_FILE=$(find ~/Downloads ~/Desktop ~/Documents -name "rss-service-MERGED-v37.4.0.js" -type f 2>/dev/null | head -1)

if [ -z "$KEYWORD_FILE" ]; then
    echo "❌ Cannot find keyword-extraction.js"
    echo ""
    echo "Please download it from the AI assistant's response above."
    echo "It should be in the 'backend/' folder in the conversation."
    echo ""
    exit 1
fi

if [ -z "$MERGED_FILE" ]; then
    echo "❌ Cannot find rss-service-MERGED-v37.4.0.js"
    echo ""
    echo "Please download it from the AI assistant's response above."
    echo "It should be in the 'backend/' folder in the conversation."
    echo ""
    exit 1
fi

echo "✅ Found files:"
echo "   📄 $KEYWORD_FILE"
echo "   📄 $MERGED_FILE"
echo ""

# Upload files
echo "📤 Uploading keyword-extraction.js..."
scp "$KEYWORD_FILE" root@185.193.126.13:/var/www/workforce-democracy/backend/ || {
    echo "❌ Upload failed!"
    exit 1
}

echo "✅ keyword-extraction.js uploaded"
echo ""

echo "📤 Uploading rss-service-MERGED-v37.4.0.js..."
scp "$MERGED_FILE" root@185.193.126.13:/var/www/workforce-democracy/backend/ || {
    echo "❌ Upload failed!"
    exit 1
}

echo "✅ rss-service-MERGED-v37.4.0.js uploaded"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 UPLOAD COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next step: SSH to VPS and run deployment script"
echo ""
