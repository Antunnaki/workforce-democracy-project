#!/bin/bash

###############################################################################
# 🚀 WORKFORCE DEMOCRACY - V37.16.4 DEPLOYMENT SCRIPT
# 
# FIXES:
#   1. Duplicate senators (Schumer & Gillibrand appearing twice)
#   2. Unreadable header text on purple gradient
# 
# USAGE:
#   Run this script ON THE VPS after uploading files
#   
#   bash DEPLOY-NOW-V37.16.4.sh
#
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "🚀 DEPLOYING V37.16.4 - DUPLICATE SENATORS FIX + CONTRAST BOOST"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Navigate to backend directory
echo "📂 Navigating to backend directory..."
cd /var/www/workforce-democracy/backend

echo ""
echo "🛑 Stopping backend process..."
/opt/nodejs/bin/pm2 stop backend

echo ""
echo "🗑️  Deleting backend process (clears module cache)..."
/opt/nodejs/bin/pm2 delete backend

echo ""
echo "🧹 Flushing PM2 logs..."
/opt/nodejs/bin/pm2 flush

echo ""
echo "🚀 Starting backend with NODE_ENV=production..."
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1

echo ""
echo "⏳ Waiting 3 seconds for backend to initialize..."
sleep 3

echo ""
echo "📊 PM2 Status:"
/opt/nodejs/bin/pm2 status

echo ""
echo "📋 Recent logs (look for deduplication messages):"
/opt/nodejs/bin/pm2 logs backend --lines 30 --nostream

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "🔍 WHAT TO LOOK FOR IN LOGS ABOVE:"
echo "   ✅ '🔄 [DEDUP] Removing duplicate: Charles E. Schumer'"
echo "   ✅ '🔄 [DEDUP] Removing duplicate: Kirsten E. Gillibrand'"
echo "   ✅ 'Found 15 total representatives (after deduplication)'"
echo "   ✅ 'Duplicates removed: 2'"
echo "   ✅ 'Backend server running on port 3001'"
echo ""
echo "🧪 TEST THE API:"
echo "   curl \"https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061\" | grep '\"name\"' | wc -l"
echo "   Expected: 15 (not 17)"
echo ""
echo "📱 NEXT STEPS:"
echo "   1. Publish frontend in GenSpark"
echo "   2. Hard refresh browser (Cmd+Shift+R)"
echo "   3. Test at: https://sxcrlfyt.gensparkspace.com/"
echo ""
