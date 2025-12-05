#!/bin/bash
###########################################
# NUCLEAR RESTART - Complete PM2 reset
# Then verify the changes are loaded
###########################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💣 NUCLEAR PM2 RESTART"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /var/www/workforce-democracy

# 1. VERIFY CHANGES ARE IN THE FILE
echo ""
echo "1️⃣ VERIFYING CHANGES IN ai-service.js:"
echo ""
if grep -q "look at the BRACKETED name and use EXACTLY that name" backend/ai-service.js; then
    echo "   ✅ Extreme citation rules FOUND in ai-service.js"
else
    echo "   ❌ ERROR: Extreme citation rules NOT found!"
    echo "   The aggressive fix may not have been applied correctly."
    exit 1
fi

if grep -q '\[${result.source}\]' backend/ai-service.js; then
    echo "   ✅ Publication name [source] FOUND in ai-service.js"
else
    echo "   ❌ ERROR: Publication name NOT in prompt!"
    exit 1
fi

if grep -q "If analyzing progressive vs establishment: Prioritize independent progressive sources" backend/ai-service.js; then
    echo "   ✅ Generic source references (removed specific publication names)"
else
    echo "   ⚠️  WARNING: May still have Democracy Now, The Intercept in prompt"
fi

# 2. KILL EVERYTHING
echo ""
echo "2️⃣ KILLING PM2 DAEMON:"
echo ""
pm2 kill
sleep 2

# 3. DELETE LOGS
echo ""
echo "3️⃣ DELETING ALL PM2 LOGS:"
echo ""
rm -rf /root/.pm2/logs/*
rm -rf /root/.pm2/pids/*
rm -rf /root/.pm2/*.log
echo "   ✅ Logs deleted"

# 4. CLEAR NODE CACHE
echo ""
echo "4️⃣ CLEARING NODE CACHE:"
echo ""
cd backend
rm -rf node_modules/.cache 2>/dev/null || true
echo "   ✅ Node cache cleared"
cd ..

# 5. START FRESH
echo ""
echo "5️⃣ STARTING BACKEND (FRESH):"
echo ""
pm2 start backend/server.js --name backend
sleep 5

# 6. VERIFY IT'S RUNNING
echo ""
echo "6️⃣ VERIFYING BACKEND STATUS:"
echo ""
pm2 status

# 7. SHOW STARTUP LOGS
echo ""
echo "7️⃣ SHOWING STARTUP LOGS:"
echo ""
pm2 logs backend --lines 30 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NUCLEAR RESTART COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 NOW TEST:"
echo "   1. Go to your chat interface"
echo "   2. Ask: 'What are the latest attacks on SNAP benefits?'"
echo "   3. Watch for publication names in the response"
echo ""
echo "🔍 EXPECTED:"
echo "   • LLM should say 'Truthout reports...' (NOT Democracy Now)"
echo "   • LLM should say 'Common Dreams...' (NOT The Intercept)"
echo "   • NO ProPublica, Jacobin, The Nation, OpenSecrets"
echo ""
echo "📋 VERIFY CHANGES LOADED:"
echo "   Run this to see the actual prompt being sent to LLM:"
echo "   pm2 logs backend --lines 200 | grep -A 50 'Web Search Results'"
echo ""
