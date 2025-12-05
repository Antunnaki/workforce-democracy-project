#!/bin/bash
# =============================================================================
# COPY & PASTE DEPLOYMENT - Enhanced RSS Service v37.4.0
# =============================================================================
#
# INSTRUCTIONS:
# 1. Upload files to VPS first (see FILE-UPLOAD.txt below)
# 2. SSH to VPS: ssh root@185.193.126.13
# 3. Copy this entire script
# 4. Paste into terminal and hit Enter
#
# =============================================================================

echo "🚀 Starting Enhanced RSS Service v37.4.0 Deployment..."
echo ""

# Navigate to backend directory
cd /var/www/advocacyunion.com/backend || { echo "❌ Failed to navigate to backend directory"; exit 1; }
echo "✅ Navigated to backend directory"

# Create backup
BACKUP_FILE="rss-service-BACKUP-$(date +%Y%m%d-%H%M%S).js"
cp rss-service.js "$BACKUP_FILE"
echo "✅ Created backup: $BACKUP_FILE"

# Verify backup exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup failed! Aborting deployment."
    exit 1
fi
echo "✅ Backup verified"

# Check if new files exist
if [ ! -f "keyword-extraction.js" ]; then
    echo "❌ keyword-extraction.js not found! Did you upload it?"
    echo "   Upload it first, then run this script again."
    exit 1
fi
echo "✅ keyword-extraction.js found"

if [ ! -f "rss-service-MERGED-v37.4.0.js" ]; then
    echo "❌ rss-service-MERGED-v37.4.0.js not found! Did you upload it?"
    echo "   Upload it first, then run this script again."
    exit 1
fi
echo "✅ rss-service-MERGED-v37.4.0.js found"

# Replace old with new
mv rss-service.js rss-service-OLD.js
echo "✅ Moved old file to rss-service-OLD.js"

mv rss-service-MERGED-v37.4.0.js rss-service.js
echo "✅ Renamed merged file to rss-service.js"

# Verify new file exists
if [ ! -f "rss-service.js" ]; then
    echo "❌ New rss-service.js not found! Restoring backup..."
    cp "$BACKUP_FILE" rss-service.js
    exit 1
fi
echo "✅ New rss-service.js verified"

# Show file sizes
echo ""
echo "📊 File sizes:"
ls -lh rss-service.js keyword-extraction.js

# Restart PM2
echo ""
echo "♻️  Restarting PM2 service..."
pm2 delete universal-chat-service
pm2 start server.js --name universal-chat-service

# Wait a moment for startup
sleep 2

# Check status
echo ""
echo "📊 PM2 Status:"
pm2 status

# Show recent logs
echo ""
echo "📋 Recent logs (last 20 lines):"
pm2 logs universal-chat-service --lines 20 --nostream

# Success message
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Files deployed:"
echo "   - keyword-extraction.js (NEW)"
echo "   - rss-service.js (ENHANCED v37.4.0)"
echo ""
echo "💾 Backups created:"
echo "   - $BACKUP_FILE"
echo "   - rss-service-OLD.js"
echo ""
echo "🧪 NEXT STEP: Test it!"
echo "   1. Open Universal Chat on your website"
echo "   2. Ask: 'What would be societal implications if the 19th amendment is repealed?'"
echo "   3. Check sources are relevant (NOT Oasis/Thames Water!)"
echo ""
echo "📊 Monitor logs:"
echo "   pm2 logs universal-chat-service"
echo ""
echo "🔎 Look for these log entries:"
echo "   🔎 Extracted search query:"
echo "   📌 Keywords: [...]"
echo "   [Score: XX] Source: Title..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
