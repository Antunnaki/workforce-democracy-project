#!/bin/bash

cd /var/www/workforce-democracy/backend

echo "🔍 Diagnosing the issue..."
echo ""

# Show lines 350-365 to see what's happening
echo "Current code around line 350-365:"
echo "═══════════════════════════════════════"
sed -n '350,365p' ai-service.js | cat -n
echo "═══════════════════════════════════════"
echo ""

# The issue is that the code was inserted OUTSIDE the function
# We need to find the EXACT location INSIDE needsCurrentInfo()

echo "🔧 Let me find the correct insertion point..."
echo ""

# Find the function start
FUNC_START=$(grep -n "function needsCurrentInfo" ai-service.js | cut -d: -f1)
echo "needsCurrentInfo() starts at line $FUNC_START"

# Find the closing brace of the function
FUNC_END=$(awk "/function needsCurrentInfo/,/^}$/ {if (/^}$/) print NR; exit}" ai-service.js)
echo "needsCurrentInfo() ends at line $FUNC_END"

# Find the return statement INSIDE the function
RETURN_LINE=$(awk "/function needsCurrentInfo/,/^}$/ {if (/return hasTemporalIndicator/) print NR}" ai-service.js)
echo "return statement is at line $RETURN_LINE"

echo ""
echo "The problem: Code was inserted at the wrong line!"
echo "We need to insert it BEFORE line $RETURN_LINE, INSIDE the function"
