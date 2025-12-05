#!/bin/bash

##############################################################################
# ⚡ NUCLEAR PM2 RESTART - CLEAR ALL CACHES
##############################################################################
#
# This script performs a complete PM2 restart that clears ALL caches:
# - Stops PM2 process
# - Flushes PM2 logs
# - Deletes PM2 process completely
# - Kills ALL Node.js processes (clears Node.js module cache)
# - Starts fresh PM2 process
#
# Use this when normal 'pm2 restart' doesn't load new code changes
#
##############################################################################

echo ""
echo "⚡⚡⚡ NUCLEAR PM2 RESTART - CLEAR ALL CACHES ⚡⚡⚡"
echo ""
echo "📅 Started: $(date)"
echo ""

# Navigate to backend directory
cd /var/www/workforce-democracy/backend/

echo "🛑 Step 1: Stopping PM2 backend process..."
pm2 stop backend 2>/dev/null || echo "   (Process already stopped)"
sleep 2

echo "🗑️  Step 2: Flushing PM2 logs..."
pm2 flush 2>/dev/null || echo "   (Logs already flushed)"

echo "❌ Step 3: Deleting PM2 backend process..."
pm2 delete backend 2>/dev/null || echo "   (Process already deleted)"
sleep 2

echo "💥 Step 4: NUCLEAR - Killing ALL Node.js processes..."
echo "   This clears the Node.js module cache completely"
pkill -9 node 2>/dev/null || echo "   (No Node.js processes found)"
sleep 3

echo "🔧 Step 5: Starting fresh PM2 process..."
cd /var/www/workforce-democracy/backend/
pm2 start server.js --name backend

sleep 3

echo "💾 Step 6: Saving PM2 configuration..."
pm2 save

echo ""
echo "✅ Step 7: Verifying backend status..."
pm2 list | grep backend

echo ""
echo "📋 Step 8: Recent logs (last 30 lines):"
echo ""
pm2 logs backend --lines 30 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NUCLEAR PM2 RESTART COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Backend should now be running with NEW code loaded"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask in frontend: 'What is Gavin Newsom's record on homelessness?'"
echo "   Expected: 18-25 sources including CalMatters, state audits"
echo ""
echo "📊 If still getting same answer:"
echo "   1. Clear browser cache (Ctrl+Shift+Delete)"
echo "   2. Wait 5 minutes for RSS cache to refresh"
echo "   3. Check logs: pm2 logs backend --lines 50 | grep CalMatters"
echo ""
echo "📅 Completed: $(date)"
echo ""
