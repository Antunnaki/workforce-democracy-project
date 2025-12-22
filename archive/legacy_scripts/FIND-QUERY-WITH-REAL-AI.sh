#!/bin/bash
# Find the queryWithRealAI function

echo "=========================================="
echo "FINDING queryWithRealAI FUNCTION"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ Finding where queryWithRealAI is defined:"
echo ""
grep -n "function queryWithRealAI\|async function queryWithRealAI\|const queryWithRealAI" server.js
echo ""

echo "2️⃣ Showing the full queryWithRealAI function:"
echo ""
LINE=$(grep -n "async function queryWithRealAI" server.js | cut -d: -f1)
if [ ! -z "$LINE" ]; then
    START=$LINE
    END=$((LINE + 200))
    echo "   Found at line $LINE, showing lines $START-$END:"
    sed -n "${START},${END}p" server.js | cat -n
else
    echo "   Not found as async function, searching for const..."
    LINE=$(grep -n "const queryWithRealAI" server.js | cut -d: -f1)
    if [ ! -z "$LINE" ]; then
        START=$LINE
        END=$((LINE + 200))
        sed -n "${START},${END}p" server.js | cat -n
    fi
fi
echo ""

echo "=========================================="
