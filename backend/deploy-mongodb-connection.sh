#!/bin/bash
# =============================================================================
# MONGODB CONNECTION FIX DEPLOYMENT
# Version: 37.11.6-MONGODB-FIX
# Date: January 19, 2025
# =============================================================================
#
# ISSUE FIXED:
# - Personalization routes were loaded but MongoDB wasn't connected
# - Caused "buffering timed out" errors on registration (500 error)
# 
# SOLUTION:
# - Added mongoose require to imports
# - Added MongoDB connection with error handling
# - Routes can now access MongoDB successfully
#
# FILES UPDATED:
# - backend/server.js (added MongoDB connection)
#
# =============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "  🔧 DEPLOYING MONGODB CONNECTION FIX"
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

# Step 2: Verify MongoDB is running
echo "🔍 Checking MongoDB status..."
if systemctl is-active --quiet mongod; then
    echo "✅ MongoDB is running"
else
    echo "❌ ERROR: MongoDB is not running!"
    echo "   Start MongoDB with: systemctl start mongod"
    exit 1
fi
echo ""

# Step 3: Verify updated server.js contains MongoDB connection
echo "🔍 Verifying updated server.js..."
if grep -q "mongoose.connect" "$BACKEND_DIR/server.js"; then
    echo "✅ server.js contains MongoDB connection"
else
    echo "❌ ERROR: server.js does not contain MongoDB connection!"
    echo "   Please verify the file was uploaded correctly."
    exit 1
fi
echo ""

# Step 4: Verify mongoose is in package.json
echo "🔍 Checking if mongoose is installed..."
if grep -q "\"mongoose\"" "$BACKEND_DIR/package.json"; then
    echo "✅ mongoose found in package.json"
    
    # Check if it's actually installed
    if [ -d "$BACKEND_DIR/node_modules/mongoose" ]; then
        echo "✅ mongoose is installed in node_modules"
    else
        echo "⚠️  mongoose in package.json but not in node_modules"
        echo "📦 Installing mongoose..."
        cd "$BACKEND_DIR"
        npm install mongoose
        if [ $? -eq 0 ]; then
            echo "✅ mongoose installed successfully"
        else
            echo "❌ Failed to install mongoose"
            exit 1
        fi
    fi
else
    echo "⚠️  mongoose not in package.json - installing..."
    cd "$BACKEND_DIR"
    npm install mongoose
    if [ $? -eq 0 ]; then
        echo "✅ mongoose installed successfully"
    else
        echo "❌ Failed to install mongoose"
        exit 1
    fi
fi
echo ""

# Step 5: Test syntax
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

# Step 6: Restart PM2 process
echo "🔄 Restarting backend via PM2..."
$PM2_BIN restart $PM2_PROCESS

if [ $? -eq 0 ]; then
    echo "✅ PM2 restart successful"
else
    echo "❌ PM2 restart failed!"
    exit 1
fi
echo ""

# Step 7: Wait for server to start
echo "⏳ Waiting for server to initialize (5 seconds)..."
sleep 5
echo ""

# Step 8: Check PM2 status
echo "📊 PM2 Status:"
$PM2_BIN list | grep $PM2_PROCESS
echo ""

# Step 9: Check for MongoDB connection in logs
echo "📜 Checking MongoDB connection..."
sleep 2  # Wait a bit more for connection

LOG_OUTPUT=$($PM2_BIN logs $PM2_PROCESS --lines 50 --nostream 2>&1)

if echo "$LOG_OUTPUT" | grep -q "MongoDB connected successfully"; then
    echo "✅ SUCCESS! MongoDB connected"
    echo "$LOG_OUTPUT" | grep "MongoDB connected" -A 1
elif echo "$LOG_OUTPUT" | grep -q "MongoDB connection error"; then
    echo "❌ WARNING: MongoDB connection failed"
    echo "$LOG_OUTPUT" | grep "MongoDB connection error" -A 2
    echo ""
    echo "💡 Check MongoDB URI in .env file or default connection"
else
    echo "⚠️  Could not confirm MongoDB connection in logs"
    echo "   Showing recent logs:"
    $PM2_BIN logs $PM2_PROCESS --lines 20 --nostream
fi
echo ""

# Step 10: Show recent logs
echo "📜 Recent logs (last 30 lines):"
$PM2_BIN logs $PM2_PROCESS --lines 30 --nostream
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Verify MongoDB connection in logs above"
echo "   Look for: ✅ MongoDB connected successfully"
echo ""
echo "2. Test registration on GenSpark:"
echo "   https://sxcrlfyt.gensparkspace.com/"
echo ""
echo "3. Test registration on production:"
echo "   https://workforcedemocracyproject.org/"
echo ""
echo "4. Should see successful registration (no 500 error)"
echo ""
echo "📊 Monitor logs with:"
echo "   $PM2_BIN logs $PM2_PROCESS --lines 50"
echo ""
echo "🔙 Rollback if needed:"
echo "   cp $BACKUP_DIR/server.js.backup-$TIMESTAMP $BACKEND_DIR/server.js"
echo "   $PM2_BIN restart $PM2_PROCESS"
echo ""
