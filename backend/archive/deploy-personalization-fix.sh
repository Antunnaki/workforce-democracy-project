#!/bin/bash
# =============================================================================
# PERSONALIZATION ROUTES FIX DEPLOYMENT
# Version: 37.11.5-FIRE-BUTTON
# Date: January 18, 2025
# =============================================================================
#
# ISSUE FIXED:
# - Personalization routes file exists but not registered in server.js
# - Backend returns 404 on /api/personalization/* endpoints
# 
# SOLUTION:
# - Added personalization routes registration to server.js
# - Routes will be loaded at server startup
#
# FILES UPDATED:
# - backend/server.js (added personalization routes registration)
#
# DEPLOYMENT STEPS:
# 1. Upload this script to VPS
# 2. Upload updated server.js to VPS
# 3. Run this script on VPS
# 4. PM2 will restart backend automatically
# 5. Test registration on both live sites
#
# =============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "  🔧 DEPLOYING PERSONALIZATION ROUTES FIX"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Configuration
BACKEND_DIR="/var/www/workforce-democracy/backend"
PM2_BIN="/opt/nodejs/bin/pm2"
PM2_PROCESS="backend"

echo "📂 Backend directory: $BACKEND_DIR"
echo "🔧 PM2 binary: $PM2_BIN"
echo "📋 PM2 process: $PM2_PROCESS"
echo ""

# Step 1: Backup current server.js
echo "📦 Creating backup of current server.js..."
BACKUP_DIR="$BACKEND_DIR/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp "$BACKEND_DIR/server.js" "$BACKUP_DIR/server.js.backup-$TIMESTAMP"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: server.js.backup-$TIMESTAMP"
else
    echo "❌ Backup failed! Aborting deployment."
    exit 1
fi
echo ""

# Step 2: Verify personalization routes file exists
echo "🔍 Verifying personalization routes file..."
if [ -f "$BACKEND_DIR/routes/personalization.js" ]; then
    FILE_SIZE=$(stat -c%s "$BACKEND_DIR/routes/personalization.js")
    echo "✅ personalization.js found ($FILE_SIZE bytes)"
else
    echo "❌ ERROR: personalization.js not found!"
    echo "   Expected location: $BACKEND_DIR/routes/personalization.js"
    exit 1
fi
echo ""

# Step 3: Verify new server.js contains personalization routes
echo "🔍 Verifying updated server.js..."
if grep -q "personalizationRoutes" "$BACKEND_DIR/server.js"; then
    echo "✅ server.js contains personalization routes registration"
else
    echo "❌ ERROR: server.js does not contain personalization routes!"
    echo "   Please verify the file was uploaded correctly."
    exit 1
fi
echo ""

# Step 4: Test syntax (basic check)
echo "🧪 Testing Node.js syntax..."
cd "$BACKEND_DIR"
node -c server.js 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Syntax check passed"
else
    echo "❌ Syntax error detected! Restoring backup..."
    cp "$BACKUP_DIR/server.js.backup-$TIMESTAMP" "$BACKEND_DIR/server.js"
    echo "⚠️  Backup restored. Deployment aborted."
    exit 1
fi
echo ""

# Step 5: Restart PM2 process
echo "🔄 Restarting backend via PM2..."
$PM2_BIN restart $PM2_PROCESS

if [ $? -eq 0 ]; then
    echo "✅ PM2 restart successful"
else
    echo "❌ PM2 restart failed!"
    exit 1
fi
echo ""

# Step 6: Wait for server to start
echo "⏳ Waiting for server to initialize (5 seconds)..."
sleep 5
echo ""

# Step 7: Check PM2 status
echo "📊 PM2 Status:"
$PM2_BIN list | grep $PM2_PROCESS
echo ""

# Step 8: Check recent logs
echo "📜 Recent logs (last 20 lines):"
$PM2_BIN logs $PM2_PROCESS --lines 20 --nostream
echo ""

# Step 9: Verify personalization routes loaded
echo "🔍 Checking if personalization routes loaded..."
LOG_OUTPUT=$($PM2_BIN logs $PM2_PROCESS --lines 50 --nostream 2>&1)

if echo "$LOG_OUTPUT" | grep -q "Personalization API loaded"; then
    echo "✅ SUCCESS! Personalization API loaded successfully"
else
    echo "⚠️  WARNING: Cannot confirm personalization API loaded in logs"
    echo "   Please verify manually with: $PM2_BIN logs $PM2_PROCESS"
fi
echo ""

# Step 10: Test endpoint
echo "🧪 Testing personalization endpoint..."
echo "   Attempting OPTIONS request to registration endpoint..."
curl -X OPTIONS \
  -H "Origin: https://workforcedemocracyproject.org" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  https://api.workforcedemocracyproject.org/api/personalization/register \
  2>&1 | grep -E "(HTTP|Access-Control|404|200|204)"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Test registration on production:"
echo "   https://workforcedemocracyproject.org/"
echo ""
echo "2. Test registration on GenSpark:"
echo "   https://sxcrlfyt.gensparkspace.com/"
echo ""
echo "3. Verify registration creates session cookie:"
echo "   - Open browser DevTools → Application → Cookies"
echo "   - Look for 'wdp_session' cookie after registration"
echo ""
echo "4. Test Fire button recovery:"
echo "   - Register new account"
echo "   - Note your username (write it down)"
echo "   - Click DuckDuckGo Fire button"
echo "   - Reload page"
echo "   - Login with same username"
echo "   - Verify data restored"
echo ""
echo "📊 Monitor logs with:"
echo "   $PM2_BIN logs $PM2_PROCESS --lines 50"
echo ""
echo "🔙 Rollback if needed:"
echo "   cp $BACKUP_DIR/server.js.backup-$TIMESTAMP $BACKEND_DIR/server.js"
echo "   $PM2_BIN restart $PM2_PROCESS"
echo ""
