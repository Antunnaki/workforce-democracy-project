#!/bin/bash

# 🧪 Test v37.5.0 Citation Fix - Workforce Democracy Project
# This script checks if Phase 1 pre-search is working correctly

echo "========================================="
echo "🧪 Testing v37.5.0 Citation Fix"
echo "========================================="
echo ""

# Check if we're on the VPS
if [ "$(hostname)" != "vps-185.193.126.13" ]; then
    echo "⚠️  This script should be run on the VPS (185.193.126.13)"
    echo ""
    echo "📋 Copy and paste this into your SSH terminal:"
    echo ""
    echo "ssh root@185.193.126.13 << 'ENDSSH'"
    echo "cd /var/www/workforce-democracy/backend"
    echo ""
    echo "# Check current PM2 status"
    echo "pm2 list"
    echo ""
    echo "# Check for v37.5.0 startup markers in logs"
    echo "pm2 logs backend --lines 100 | grep -E '🚀🚀🚀|v37.5.0|CITATION FIX'"
    echo ""
    echo "# Check for Phase 1 pre-search logs (should appear when chat is used)"
    echo "pm2 logs backend --lines 200 | grep -E '🔍 Pre-searching|📚 Found.*sources to provide|✅ Providing.*validated sources'"
    echo ""
    echo "# If no Phase 1 logs found, check for old Phase 2 logs (should NOT appear)"
    echo "pm2 logs backend --lines 200 | grep '📚 Added.*sources to response'"
    echo ""
    echo "ENDSSH"
    echo ""
    exit 0
fi

cd /var/www/workforce-democracy/backend || exit 1

echo "1️⃣  Checking PM2 Status..."
echo "-------------------------------------------"
pm2 list
echo ""

echo "2️⃣  Checking for v37.5.0 Startup Markers..."
echo "-------------------------------------------"
if pm2 logs backend --lines 100 | grep -q "v37.5.0"; then
    echo "✅ v37.5.0 startup marker FOUND:"
    pm2 logs backend --lines 100 | grep -E "🚀🚀🚀|v37.5.0|CITATION FIX"
else
    echo "❌ v37.5.0 startup marker NOT FOUND"
    echo ""
    echo "🔍 Showing recent startup logs:"
    pm2 logs backend --lines 50 | grep -E "LOADED|loaded at"
fi
echo ""

echo "3️⃣  Checking for Phase 1 Pre-Search Logs..."
echo "-------------------------------------------"
if pm2 logs backend --lines 200 | grep -q "Pre-searching sources"; then
    echo "✅ Phase 1 pre-search IS ACTIVE:"
    pm2 logs backend --lines 200 | grep -E "🔍 Pre-searching|📚 Found.*sources to provide|✅ Providing.*validated sources"
else
    echo "⚠️  No Phase 1 pre-search logs found yet"
    echo ""
    echo "💡 This is normal if you haven't tested the chat yet."
    echo "   Send a chat message like 'What happens if SNAP benefits are cut?'"
    echo "   Then run this script again to see Phase 1 logs appear."
fi
echo ""

echo "4️⃣  Checking for OLD Phase 2 Logs (should NOT appear)..."
echo "-------------------------------------------"
if pm2 logs backend --lines 200 | grep -q "Added.*sources to response"; then
    echo "❌ OLD Phase 2 logs STILL APPEARING:"
    pm2 logs backend --lines 200 | grep "Added.*sources to response"
    echo ""
    echo "🚨 This means v37.5.0 is NOT running correctly!"
else
    echo "✅ No old Phase 2 logs found (good)"
fi
echo ""

echo "5️⃣  Verifying ai-service.js Code..."
echo "-------------------------------------------"
echo "Checking for Phase 1 pre-search code in ai-service.js:"
if grep -q "Pre-searching sources before LLM call" ai-service.js; then
    echo "✅ Phase 1 code EXISTS in file"
else
    echo "❌ Phase 1 code NOT FOUND in file"
fi
echo ""

echo "Checking for old Phase 2 code (should be REMOVED):"
if grep -q "// PHASE 2: Post-search validation" ai-service.js; then
    echo "❌ OLD Phase 2 code still exists"
else
    echo "✅ Old Phase 2 code has been removed (good)"
fi
echo ""

echo "========================================="
echo "📊 Test Summary"
echo "========================================="
echo ""
echo "To verify v37.5.0 is working:"
echo "1. Open your site: https://workforcedemocracy.org"
echo "2. Open browser console (F12)"
echo "3. Ask chat: 'What happens if SNAP benefits are cut?'"
echo "4. Check backend logs in real-time:"
echo "   pm2 logs backend --lines 0"
echo ""
echo "Expected logs (Phase 1 working correctly):"
echo "  🔍 Pre-searching sources before LLM call..."
echo "  📚 Found 3 sources to provide to LLM"
echo "  ✅ Providing 3 validated sources to LLM"
echo "  🤖 AI Query: '...' (context: general, sources: 3)"
echo ""
echo "Expected browser console (citation fix working):"
echo "  citationCount === sources.length  (e.g., 3 === 3)"
echo ""
echo "❌ Should NOT see:"
echo "  📚 Added 2 sources to response  (old Phase 2 format)"
echo ""
