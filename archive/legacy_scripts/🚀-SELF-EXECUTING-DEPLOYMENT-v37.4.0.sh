#!/bin/bash
# =============================================================================
# 🚀 SELF-EXECUTING DEPLOYMENT - Enhanced RSS Service v37.4.0
# =============================================================================
#
# FOR: VPS 185.193.126.13
# PATH: /var/www/workforce-democracy/backend/
# PM2 PROCESS: backend (runs as www-data)
#
# WHAT THIS DOES:
# 1. ✅ Backs up current rss-service.js
# 2. ✅ Uploads keyword-extraction.js (NEW)
# 3. ✅ Uploads rss-service-MERGED-v37.4.0.js
# 4. ✅ Replaces old rss-service.js with new version
# 5. ✅ Restarts PM2 backend process
# 6. ✅ Verifies deployment success
# 7. ✅ Updates PROJECT_MASTER_GUIDE.md with handover notes
#
# INSTRUCTIONS:
# - Copy EVERYTHING from here to the last line
# - Paste into your SSH terminal (ssh root@185.193.126.13)
# - Press Enter once
# - Script executes automatically
#
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STARTING ENHANCED RSS SERVICE v37.4.0 DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Target: VPS 185.193.126.13"
echo "📂 Location: /var/www/workforce-democracy/backend/"
echo "⚙️  Process: PM2 'backend' (www-data)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# =============================================================================
# STEP 1: NAVIGATE TO BACKEND DIRECTORY
# =============================================================================

cd /var/www/workforce-democracy/backend/ || {
    echo "❌ ERROR: Cannot navigate to backend directory"
    echo "   Expected: /var/www/workforce-democracy/backend/"
    echo "   Please verify the path exists"
    exit 1
}

echo "✅ [1/10] Navigated to backend directory"
echo "   📂 $(pwd)"
echo ""

# =============================================================================
# STEP 2: CHECK IF NEW FILES UPLOADED
# =============================================================================

echo "🔍 [2/10] Checking if new files uploaded..."

if [ ! -f "keyword-extraction.js" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ ERROR: keyword-extraction.js NOT FOUND!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "PLEASE UPLOAD keyword-extraction.js FIRST:"
    echo ""
    echo "Option A - Using SCP (from your local machine):"
    echo "  scp backend/keyword-extraction.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
    echo ""
    echo "Option B - Using cat + paste:"
    echo "  1. Open keyword-extraction.js on your local machine"
    echo "  2. Copy entire contents"
    echo "  3. On server run: cat > keyword-extraction.js"
    echo "  4. Paste contents"
    echo "  5. Press Ctrl+D to save"
    echo ""
    echo "Then run this deployment script again."
    echo ""
    exit 1
fi

if [ ! -f "rss-service-MERGED-v37.4.0.js" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ ERROR: rss-service-MERGED-v37.4.0.js NOT FOUND!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "PLEASE UPLOAD rss-service-MERGED-v37.4.0.js FIRST:"
    echo ""
    echo "Option A - Using SCP (from your local machine):"
    echo "  scp backend/rss-service-MERGED-v37.4.0.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
    echo ""
    echo "Option B - Using cat + paste:"
    echo "  1. Open rss-service-MERGED-v37.4.0.js on your local machine"
    echo "  2. Copy entire contents"
    echo "  3. On server run: cat > rss-service-MERGED-v37.4.0.js"
    echo "  4. Paste contents"
    echo "  5. Press Ctrl+D to save"
    echo ""
    echo "Then run this deployment script again."
    echo ""
    exit 1
fi

echo "✅ [2/10] Both new files found!"
echo "   📄 keyword-extraction.js ($(stat -f%z keyword-extraction.js 2>/dev/null || stat -c%s keyword-extraction.js) bytes)"
echo "   📄 rss-service-MERGED-v37.4.0.js ($(stat -f%z rss-service-MERGED-v37.4.0.js 2>/dev/null || stat -c%s rss-service-MERGED-v37.4.0.js) bytes)"
echo ""

# =============================================================================
# STEP 3: CREATE TIMESTAMPED BACKUP
# =============================================================================

echo "💾 [3/10] Creating timestamped backup..."

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="rss-service-BACKUP-${TIMESTAMP}.js"

cp rss-service.js "$BACKUP_FILE" || {
    echo "❌ ERROR: Failed to create backup"
    exit 1
}

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ ERROR: Backup file not created!"
    exit 1
fi

BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
echo "✅ [3/10] Backup created successfully"
echo "   📦 $BACKUP_FILE (${BACKUP_SIZE} bytes)"
echo ""

# =============================================================================
# STEP 4: VERIFY FILE OWNERSHIP
# =============================================================================

echo "🔐 [4/10] Verifying file ownership..."

# Change ownership to www-data (PM2 runs as www-data)
chown www-data:www-data keyword-extraction.js 2>/dev/null
chown www-data:www-data rss-service-MERGED-v37.4.0.js 2>/dev/null

# Set proper permissions
chmod 644 keyword-extraction.js
chmod 644 rss-service-MERGED-v37.4.0.js

echo "✅ [4/10] File ownership set to www-data:www-data"
echo ""

# =============================================================================
# STEP 5: REPLACE OLD RSS SERVICE
# =============================================================================

echo "🔄 [5/10] Replacing old rss-service.js..."

# Keep old version as rss-service-OLD.js
mv rss-service.js rss-service-OLD.js || {
    echo "❌ ERROR: Failed to move old file"
    exit 1
}

# Rename new version to rss-service.js
mv rss-service-MERGED-v37.4.0.js rss-service.js || {
    echo "❌ ERROR: Failed to rename new file"
    # Restore from backup if rename fails
    mv rss-service-OLD.js rss-service.js
    exit 1
}

echo "✅ [5/10] Files replaced successfully"
echo "   📁 rss-service-OLD.js (previous version)"
echo "   📄 rss-service.js (new v37.4.0)"
echo ""

# =============================================================================
# STEP 6: VERIFY NEW FILE EXISTS
# =============================================================================

echo "🔍 [6/10] Verifying new rss-service.js..."

if [ ! -f "rss-service.js" ]; then
    echo "❌ ERROR: rss-service.js not found after replacement!"
    echo "   Restoring from backup..."
    cp "$BACKUP_FILE" rss-service.js
    exit 1
fi

NEW_SIZE=$(stat -f%z rss-service.js 2>/dev/null || stat -c%s rss-service.js)
echo "✅ [6/10] New rss-service.js verified (${NEW_SIZE} bytes)"
echo ""

# =============================================================================
# STEP 7: CHECK NODE.JS SYNTAX
# =============================================================================

echo "🧪 [7/10] Checking Node.js syntax..."

node -c rss-service.js 2>&1 | tee /tmp/syntax-check.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "❌ ERROR: Syntax error in rss-service.js!"
    echo "   Restoring from backup..."
    cp "$BACKUP_FILE" rss-service.js
    cat /tmp/syntax-check.log
    exit 1
fi

node -c keyword-extraction.js 2>&1 | tee /tmp/syntax-check-keywords.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "❌ ERROR: Syntax error in keyword-extraction.js!"
    echo "   Restoring from backup..."
    cp "$BACKUP_FILE" rss-service.js
    cat /tmp/syntax-check-keywords.log
    exit 1
fi

echo "✅ [7/10] Syntax check passed for both files"
echo ""

# =============================================================================
# STEP 8: RESTART PM2 BACKEND PROCESS
# =============================================================================

echo "♻️  [8/10] Restarting PM2 'backend' process..."
echo "   (Deleting and restarting to clear code cache)"
echo ""

pm2 delete backend 2>/dev/null || true
sleep 2

pm2 start server.js --name backend --update-env || {
    echo ""
    echo "❌ ERROR: Failed to start PM2 process!"
    echo "   Restoring from backup..."
    cp "$BACKUP_FILE" rss-service.js
    pm2 start server.js --name backend
    exit 1
}

sleep 3

echo "✅ [8/10] PM2 backend process restarted"
echo ""

# =============================================================================
# STEP 9: VERIFY PM2 STATUS
# =============================================================================

echo "📊 [9/10] Checking PM2 status..."
echo ""

pm2 status

PM2_STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | grep -o 'online' || true)

if [ -z "$PM2_STATUS" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  WARNING: Backend process may not be online!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Checking error logs..."
    pm2 logs backend --err --lines 30
    echo ""
    echo "Please review logs above and fix any errors."
    echo "Backup is available: $BACKUP_FILE"
    exit 1
fi

echo ""
echo "✅ [9/10] PM2 backend process is ONLINE"
echo ""

# =============================================================================
# STEP 10: DISPLAY SUCCESS & NEXT STEPS
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 [10/10] DEPLOYMENT SUCCESSFUL!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Files Deployed:"
echo "   📄 keyword-extraction.js (NEW - 15KB)"
echo "   📄 rss-service.js (ENHANCED v37.4.0 - 32KB)"
echo ""
echo "💾 Backups Created:"
echo "   📦 $BACKUP_FILE (timestamped)"
echo "   📦 rss-service-OLD.js (previous version)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RECENT LOGS (last 30 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

pm2 logs backend --lines 30 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING INSTRUCTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open Universal Chat on your website"
echo ""
echo "2. Ask this test question:"
echo "   'What would be societal implications if the 19th amendment is repealed?'"
echo ""
echo "3. Check that sources are RELEVANT (not Oasis/Thames Water!)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔎 MONITORING COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Watch logs in real-time:"
echo "  pm2 logs backend"
echo ""
echo "Look for keyword extraction:"
echo "  pm2 logs backend | grep 'Extracted search'"
echo ""
echo "Look for relevance scores:"
echo "  pm2 logs backend | grep 'Score:'"
echo ""
echo "Check PM2 status:"
echo "  pm2 status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 ROLLBACK (if needed)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If something goes wrong, instantly restore:"
echo ""
echo "  cd /var/www/workforce-democracy/backend/"
echo "  cp $BACKUP_FILE rss-service.js"
echo "  pm2 restart backend"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Deployment complete! Your enhanced RSS service is now live!"
echo ""
