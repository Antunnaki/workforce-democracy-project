#!/bin/bash
# =============================================================================
# DEPLOY QWEN CHANGES TO VPS
# Version: 37.20.1-QWEN-UPDATE
# Date: December 6, 2025
# =============================================================================
#
# ISSUE FIXED:
# - Updated backend to use Qwen (Alibaba DashScope) instead of Groq
# - Updated frontend configuration to reference Qwen endpoints
# 
# SOLUTION:
# - Deploy updated ai-service-qwen.js to backend
# - Restart PM2 process to apply changes
#
# FILES UPDATED:
# - backend/ai-service-qwen.js (Qwen API integration)
# - js/config.js (frontend configuration)
#
# DEPLOYMENT STEPS:
# 1. Upload this script to VPS
# 2. Upload updated ai-service-qwen.js to VPS
# 3. Run this script on VPS
# 4. PM2 will restart backend automatically
# 5. Test Qwen integration
#
# =============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "  🔧 DEPLOYING QWEN CHANGES"
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

# Step 1: Backup current ai-service-qwen.js
echo "📦 Creating backup of current ai-service-qwen.js..."
BACKUP_DIR="$BACKEND_DIR/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp "$BACKEND_DIR/ai-service-qwen.js" "$BACKUP_DIR/ai-service-qwen.js.backup-$TIMESTAMP"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: ai-service-qwen.js.backup-$TIMESTAMP"
else
    echo "❌ Backup failed! Aborting deployment."
    exit 1
fi
echo ""

# Step 2: Verify new ai-service-qwen.js contains Qwen configuration
echo "🔍 Verifying updated ai-service-qwen.js..."
if grep -q "DASHSCOPE_API_KEY" "$BACKEND_DIR/ai-service-qwen.js"; then
    echo "✅ ai-service-qwen.js contains Qwen configuration"
else
    echo "❌ ERROR: ai-service-qwen.js does not contain Qwen configuration!"
    echo "   Please verify the file was uploaded correctly."
    exit 1
fi
echo ""

# Step 3: Test syntax (basic check)
echo "🧪 Testing Node.js syntax..."
cd "$BACKEND_DIR"
node -c ai-service-qwen.js 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Syntax check passed"
else
    echo "❌ Syntax error detected! Restoring backup..."
    cp "$BACKUP_DIR/ai-service-qwen.js.backup-$TIMESTAMP" "$BACKEND_DIR/ai-service-qwen.js"
    echo "⚠️  Backup restored. Deployment aborted."
    exit 1
fi
echo ""

# Step 4: Restart PM2 process
echo "🔄 Restarting backend via PM2..."
$PM2_BIN restart $PM2_PROCESS

if [ $? -eq 0 ]; then
    echo "✅ PM2 restart successful"
else
    echo "❌ PM2 restart failed!"
    exit 1
fi
echo ""

# Step 5: Wait for server to start
echo "⏳ Waiting for server to initialize (5 seconds)..."
sleep 5
echo ""

# Step 6: Check PM2 status
echo "📊 PM2 Status:"
$PM2_BIN list | grep $PM2_PROCESS
echo ""

# Step 7: Check recent logs
echo "📜 Recent logs (last 20 lines):"
$PM2_BIN logs $PM2_PROCESS --lines 20 --nostream
echo ""

# Step 8: Verify Qwen service loaded
echo "🔍 Checking if Qwen service loaded..."
LOG_OUTPUT=$($PM2_BIN logs $PM2_PROCESS --lines 50 --nostream 2>&1)

if echo "$LOG_OUTPUT" | grep -q "Qwen"; then
    echo "✅ SUCCESS! Qwen service appears to be loaded"
else
    echo "⚠️  WARNING: Cannot confirm Qwen service loaded in logs"
    echo "   Please verify manually with: $PM2_BIN logs $PM2_PROCESS"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  ✅ QWEN DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Test AI features on production site:"
echo "   https://workforcedemocracyproject.org/"
echo ""
echo "2. Check browser console for any errors"
echo ""
echo "3. Try asking a question to the AI assistant"
echo ""
echo "📊 Monitor logs with:"
echo "   $PM2_BIN logs $PM2_PROCESS --lines 50"
echo ""
echo "🔙 Rollback if needed:"
echo "   cp $BACKUP_DIR/ai-service-qwen.js.backup-$TIMESTAMP $BACKEND_DIR/ai-service-qwen.js"
echo "   $PM2_BIN restart $PM2_PROCESS"
echo ""