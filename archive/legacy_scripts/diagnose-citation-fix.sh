#!/bin/bash

# 🔍 Deep Diagnostic for v37.5.0 Citation Fix
# Run this if Phase 1 pre-search is NOT working

echo "========================================="
echo "🔍 Deep Diagnostic - v37.5.0 Citation Fix"
echo "========================================="
echo ""

cd /var/www/workforce-democracy/backend || exit 1

echo "1️⃣  Checking ai-service.js file integrity..."
echo "-------------------------------------------"

echo "File size:"
ls -lh ai-service.js | awk '{print $5, $9}'
echo ""

echo "Last modified:"
ls -l ai-service.js | awk '{print $6, $7, $8, $9}'
echo ""

echo "Checking for v37.5.0 startup markers (lines 20-22):"
sed -n '20,22p' ai-service.js
echo ""

echo "2️⃣  Verifying Phase 1 Pre-Search Code..."
echo "-------------------------------------------"

echo "Checking for Phase 1 comment (should exist):"
if grep -n "PHASE 1: Search for sources FIRST" ai-service.js; then
    echo "✅ Phase 1 comment found"
else
    echo "❌ Phase 1 comment NOT found"
fi
echo ""

echo "Checking for pre-search function call (should exist):"
if grep -n "Pre-searching sources before LLM call" ai-service.js; then
    echo "✅ Pre-search log statement found"
    grep -n "Pre-searching sources before LLM call" ai-service.js
else
    echo "❌ Pre-search log statement NOT found"
fi
echo ""

echo "3️⃣  Checking buildContextualPrompt parameters..."
echo "-------------------------------------------"

echo "Looking for preFetchedSources parameter:"
if grep -n "function buildContextualPrompt.*preFetchedSources" ai-service.js; then
    echo "✅ preFetchedSources parameter found"
else
    echo "❌ preFetchedSources parameter NOT found"
fi
echo ""

echo "Looking for source injection in prompt:"
if grep -n "V37.5.0: Inject pre-fetched sources" ai-service.js; then
    echo "✅ Source injection code found"
else
    echo "❌ Source injection code NOT found"
fi
echo ""

echo "4️⃣  Checking for OLD Phase 2 code (should be REMOVED)..."
echo "-------------------------------------------"

if grep -n "PHASE 2" ai-service.js | grep -v "PHASE 1"; then
    echo "❌ Found PHASE 2 references (should be removed):"
    grep -n "PHASE 2" ai-service.js | grep -v "PHASE 1"
else
    echo "✅ No PHASE 2 references found (good)"
fi
echo ""

if grep -n "Added.*sources to response" ai-service.js; then
    echo "❌ Found old Phase 2 log statement:"
    grep -n "Added.*sources to response" ai-service.js
else
    echo "✅ No old Phase 2 log statements found (good)"
fi
echo ""

echo "5️⃣  Checking PM2 process..."
echo "-------------------------------------------"

echo "PM2 status:"
pm2 describe backend | grep -E "status|uptime|exec cwd|script path"
echo ""

echo "PM2 working directory:"
pm2 info backend | grep "exec cwd"
echo ""

echo "Checking if PM2 is running the correct file:"
PM2_CWD=$(pm2 info backend | grep "exec cwd" | awk -F': ' '{print $2}')
if [ "$PM2_CWD" = "/var/www/workforce-democracy/backend" ]; then
    echo "✅ PM2 working directory is correct"
else
    echo "❌ PM2 working directory is WRONG: $PM2_CWD"
    echo "   Expected: /var/www/workforce-democracy/backend"
fi
echo ""

echo "6️⃣  Checking server.js module cache clearing..."
echo "-------------------------------------------"

echo "Looking for module cache clearing in server.js:"
if grep -n "delete require.cache" server.js; then
    echo "✅ Module cache clearing found in server.js"
else
    echo "❌ Module cache clearing NOT found in server.js"
fi
echo ""

echo "7️⃣  Recent backend logs (last 50 lines)..."
echo "-------------------------------------------"
pm2 logs backend --lines 50 --nostream
echo ""

echo "========================================="
echo "🎯 Diagnostic Summary"
echo "========================================="
echo ""

# Count issues
ISSUES=0

if ! grep -q "v37.5.0" ai-service.js; then
    echo "❌ v37.5.0 startup markers missing in ai-service.js"
    ((ISSUES++))
fi

if ! grep -q "Pre-searching sources before LLM call" ai-service.js; then
    echo "❌ Phase 1 pre-search code missing"
    ((ISSUES++))
fi

if grep -q "Added.*sources to response" ai-service.js; then
    echo "❌ Old Phase 2 code still present"
    ((ISSUES++))
fi

if ! grep -q "delete require.cache" server.js; then
    echo "❌ Module cache clearing missing in server.js"
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ All code checks passed!"
    echo ""
    echo "If citation fix is still not working, try:"
    echo "1. Nuclear PM2 restart:"
    echo "   pm2 stop backend && pm2 delete backend && pm2 cleardump && pm2 start server.js --name backend"
    echo ""
    echo "2. Test the chat and watch logs in real-time:"
    echo "   pm2 logs backend --lines 0"
else
    echo "⚠️  Found $ISSUES issue(s) - v37.5.0 code may be incomplete or overwritten"
    echo ""
    echo "Recommended action: Re-apply v37.5.0 fix"
fi
echo ""
