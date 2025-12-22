#!/bin/bash

# ✅ Complete Verification Script for v37.5.0 Citation Fix
# Copy and paste this entire script into SSH terminal

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        v37.5.0 Citation Fix - Complete Verification          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd /var/www/workforce-democracy/backend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. PM2 Status Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pm2 list | grep -q "backend.*online"; then
    echo -e "${GREEN}✅ PM2 backend is running${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ PM2 backend is NOT running${NC}"
    ((FAIL++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. v37.5.0 Startup Markers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pm2 logs backend --lines 100 --nostream | grep -q "v37.5.0"; then
    echo -e "${GREEN}✅ v37.5.0 startup marker found in logs${NC}"
    pm2 logs backend --lines 100 --nostream | grep "v37.5.0" | tail -1
    ((PASS++))
else
    echo -e "${RED}❌ v37.5.0 startup marker NOT found${NC}"
    echo "   Showing recent startup logs:"
    pm2 logs backend --lines 20 --nostream | grep "LOADED" | tail -3
    ((FAIL++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Phase 1 Pre-Search Code Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "Pre-searching sources before LLM call" ai-service.js; then
    echo -e "${GREEN}✅ Phase 1 pre-search code EXISTS in ai-service.js${NC}"
    echo "   Location:"
    grep -n "Pre-searching sources before LLM call" ai-service.js | head -1
    ((PASS++))
else
    echo -e "${RED}❌ Phase 1 pre-search code NOT FOUND${NC}"
    ((FAIL++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Source Injection Code"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "V37.5.0: Inject pre-fetched sources" ai-service.js; then
    echo -e "${GREEN}✅ Source injection code EXISTS in buildContextualPrompt${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Source injection code NOT FOUND${NC}"
    ((FAIL++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Old Phase 2 Code Check (should be REMOVED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "Added.*sources to response" ai-service.js; then
    echo -e "${RED}❌ OLD Phase 2 code still exists (should be removed)${NC}"
    grep -n "Added.*sources to response" ai-service.js
    ((FAIL++))
else
    echo -e "${GREEN}✅ Old Phase 2 code has been removed${NC}"
    ((PASS++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Runtime Logs Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pm2 logs backend --lines 200 --nostream | grep -q "Pre-searching sources"; then
    echo -e "${GREEN}✅ Phase 1 pre-search IS RUNNING (logs found)${NC}"
    echo "   Recent Phase 1 logs:"
    pm2 logs backend --lines 200 --nostream | grep -E "Pre-searching|Found.*sources to provide|Providing.*validated" | tail -5
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  No Phase 1 runtime logs found yet${NC}"
    echo "   This is normal if you haven't tested the chat yet."
    echo "   Send a chat message to generate logs."
    echo ""
    echo "   Testing command:"
    echo "   Open https://workforcedemocracy.org and ask:"
    echo "   'What happens if SNAP benefits are cut?'"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Module Cache Clearing in server.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "delete require.cache" server.js; then
    echo -e "${GREEN}✅ Module cache clearing code EXISTS in server.js${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Module cache clearing code NOT FOUND${NC}"
    ((FAIL++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Checks Passed: $PASS"
echo "Checks Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ v37.5.0 CODE IS COMPLETE AND DEPLOYED CORRECTLY  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Test the chat at https://workforcedemocracy.org"
    echo "2. Watch logs in real-time:"
    echo "   pm2 logs backend --lines 0"
    echo "3. Expected logs when you send a chat message:"
    echo "   🔍 Pre-searching sources before LLM call..."
    echo "   📚 Found 3 sources to provide to LLM"
    echo "   ✅ Providing 3 validated sources to LLM"
    echo ""
elif [ $FAIL -le 2 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  v37.5.0 PARTIALLY DEPLOYED - MINOR ISSUES FOUND  ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Recommended: Try nuclear PM2 restart"
    echo ""
    echo "pm2 stop backend && pm2 delete backend && pm2 cleardump && pm2 start server.js --name backend"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ v37.5.0 NOT PROPERLY DEPLOYED - CRITICAL ISSUES   ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Code may have been overwritten or not saved correctly."
    echo "Recommended: Re-apply v37.5.0 fix"
fi
echo ""
