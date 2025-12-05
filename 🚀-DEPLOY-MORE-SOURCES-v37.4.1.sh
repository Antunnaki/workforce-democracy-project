#!/bin/bash

# ============================================================================
# DEPLOYMENT SCRIPT - MORE SOURCES FIX v37.4.1
# ============================================================================
# 
# What this fixes:
# 1. Only 1 source showing (was filtering out 19 of 20 articles)
# 2. Wrong source showing (Trump article instead of DeSantis)
# 3. Citations [2]-[12] being removed (user wants ALL sources clickable)
#
# Changes:
# - Lowered relevance threshold: 15 → 5 (get more sources)
# - Increased maxSources: 5 → 10 (show more sources)
# - Removed citation validator (keep ALL citations)
# - Improved keyword extraction (capture "ron" and names)
#
# ============================================================================

echo "🚀 Deploying More Sources Fix v37.4.1..."
echo ""

# Create backup
BACKUP_DIR="/var/www/workforce-democracy/backend-backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp /var/www/workforce-democracy/backend/ai-service.js "$BACKUP_DIR/"
cp /var/www/workforce-democracy/backend/rss-service-MERGED-v37.4.0.js "$BACKUP_DIR/"
cp /var/www/workforce-democracy/backend/keyword-extraction.js "$BACKUP_DIR/"
echo "✅ Backup created"
echo ""

# Copy new files
echo "📁 Copying updated files..."
cp ~/ai-service.js /var/www/workforce-democracy/backend/
cp ~/rss-service-MERGED-v37.4.0.js /var/www/workforce-democracy/backend/
cp ~/keyword-extraction.js /var/www/workforce-democracy/backend/
echo "✅ Files copied"
echo ""

# Restart backend (delete + start to clear Node.js cache)
echo "🔄 Restarting backend (delete + start to clear cache)..."
pm2 delete civic-backend
echo "✅ civic-backend deleted"
echo ""

cd /var/www/workforce-democracy/backend
pm2 start server.js --name civic-backend
pm2 save
echo "✅ civic-backend started"
echo ""

# Show logs
echo "📋 Recent logs:"
pm2 logs civic-backend --lines 20 --nostream
echo ""

echo "════════════════════════════════════════════════════════════════════"
echo "🎉 More Sources Fix v37.4.1 deployed successfully!"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Test with: 'Can you tell me about Ron DeSantis?'"
echo "   Expected: 5-10 sources about DeSantis (not Trump)"
echo "   Expected: ALL citations [1]-[10] clickable"
echo "   Expected: Backend logs show 'RSS: 5/20 articles passed' (not 1/20)"
echo ""
echo "📊 What changed:"
echo "   ✅ Relevance threshold: 15 → 5 (more sources pass)"
echo "   ✅ Max sources: 5 → 10 (show more sources)"
echo "   ✅ Citation validator: REMOVED (all sources clickable)"
echo "   ✅ Keyword extraction: Improved (captures 'ron' + 'desalts')"
echo ""
echo "🔍 Monitor logs:"
echo "   pm2 logs civic-backend --lines 50"
echo ""
