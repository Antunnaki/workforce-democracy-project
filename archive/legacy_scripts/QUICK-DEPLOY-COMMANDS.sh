#!/bin/bash
# =============================================================================
# QUICK DEPLOY: Enhanced RSS Service v37.4.0
# =============================================================================
# 
# Run these commands on your VPS (185.193.126.13) after uploading files
# 
# Files to upload first:
# 1. backend/keyword-extraction.js
# 2. backend/rss-service-MERGED-v37.4.0.js
# 
# =============================================================================

echo "🚀 Starting deployment of Enhanced RSS Service v37.4.0..."

# Navigate to backend directory
cd /var/www/advocacyunion.com/backend

# Backup current RSS service
echo "📦 Creating backup..."
cp rss-service.js rss-service-BACKUP-$(date +%Y%m%d-%H%M%S).js
echo "✅ Backup created"

# Replace old with new
echo "🔄 Installing new version..."
mv rss-service.js rss-service-OLD.js
mv rss-service-MERGED-v37.4.0.js rss-service.js

# Verify files exist
echo "🔍 Verifying files..."
ls -lh rss-service.js keyword-extraction.js

# Restart PM2 service (MUST DELETE FIRST to clear code cache)
echo "♻️  Restarting service..."
pm2 delete universal-chat-service
pm2 start server.js --name universal-chat-service

# Check status
echo "✅ Deployment complete! Checking status..."
pm2 status

echo ""
echo "📊 Watch logs in real-time:"
echo "   pm2 logs universal-chat-service"
echo ""
echo "🧪 Test with this question:"
echo "   'What would be societal implications if the 19th amendment is repealed?'"
echo ""
echo "🔎 Look for these log entries:"
echo "   🔎 Extracted search query:"
echo "   📌 Keywords: [...]"
echo "   [Score: XX] Source: Title..."
echo ""

# Optional: Show last 20 log lines
echo "📋 Last 20 log lines:"
pm2 logs universal-chat-service --lines 20 --nostream
