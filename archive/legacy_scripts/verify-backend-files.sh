#!/bin/bash
# File Verification Script for Backend
# Version: 1.0
# Date: November 8, 2025

cd /var/www/workforce-democracy/backend

echo "🔍 Backend File Verification - v37.6.1+"
echo "═══════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test 1: Policy keywords present
echo -n "Checking policy keywords... "
if grep -q "isPolicyQuery" ai-service.js; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
    
    # Count occurrences
    COUNT=$(grep -c "isPolicyQuery" ai-service.js)
    echo -n "  Reference count: "
    if [ "$COUNT" -eq 2 ]; then
        echo -e "${GREEN}✅ $COUNT (correct)${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️  $COUNT (expected 2)${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Policy keywords missing!"
    ((FAIL++))
fi

# Test 2: No orphaned code
echo -n "Checking for orphaned code... "
ORPHANED=$(awk '/^}$/,/^function/ {if (/isPolicyQuery/) print NR": "$0}' ai-service.js)
if [ -z "$ORPHANED" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "  Found code between functions:"
    echo "$ORPHANED"
    ((FAIL++))
fi

# Test 3: Syntax validation
echo -n "Testing JavaScript syntax... "
if node -c ai-service.js 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Syntax errors found:"
    node -c ai-service.js
    ((FAIL++))
fi

# Test 4: Function scope check
echo -n "Verifying function scope... "
# Check that isPolicyQuery is declared inside needsCurrentInfo
FUNC_START=$(grep -n "function needsCurrentInfo" ai-service.js | cut -d: -f1)
FUNC_END=$(awk "/function needsCurrentInfo/,/^}$/ {if (/^}$/) {print NR; exit}}" ai-service.js)
POLICY_LINE=$(grep -n "const isPolicyQuery" ai-service.js | cut -d: -f1)

if [ "$POLICY_LINE" -gt "$FUNC_START" ] && [ "$POLICY_LINE" -lt "$FUNC_END" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  isPolicyQuery is inside needsCurrentInfo() (lines $FUNC_START-$FUNC_END)"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  isPolicyQuery at line $POLICY_LINE is OUTSIDE function ($FUNC_START-$FUNC_END)"
    ((FAIL++))
fi

# Test 5: File size sanity check
echo -n "File size check... "
FILE_SIZE=$(wc -c < ai-service.js)
if [ "$FILE_SIZE" -gt 50000 ] && [ "$FILE_SIZE" -lt 100000 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  File size: $FILE_SIZE bytes (reasonable)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "  File size: $FILE_SIZE bytes (expected ~58KB)"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════"
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "File checksum: $(md5sum ai-service.js | cut -d' ' -f1)"
    exit 0
else
    echo -e "${RED}❌ Some checks failed!${NC}"
    echo ""
    echo "Please review issues above before deploying."
    exit 1
fi
