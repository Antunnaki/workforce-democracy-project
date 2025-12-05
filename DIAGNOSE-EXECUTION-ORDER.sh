#!/bin/bash
# Check the execution order in the LLM chat endpoint

echo "=========================================="
echo "CHECKING EXECUTION ORDER"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ Finding the LLM chat endpoint (POST /api/llm/chat):"
echo ""
grep -n "router.post('/chat'" *.js routes/*.js 2>/dev/null | head -5
echo ""

echo "2️⃣ Searching for where AI is called vs where sources are fetched:"
echo ""
grep -n "analyzeWithAI\|searchGlobalNews\|needsCurrentInfo" *.js | grep -v "function\|//" | head -30
echo ""

echo "3️⃣ Showing the main chat handler (around line with POST /chat):"
echo ""
# Find the line number of the chat endpoint
LINE=$(grep -n "router.post('/chat'" routes/llm.js | cut -d: -f1 | head -1)
if [ ! -z "$LINE" ]; then
    START=$((LINE - 5))
    END=$((LINE + 150))
    echo "   Found at line $LINE, showing lines $START-$END:"
    sed -n "${START},${END}p" routes/llm.js | cat -n
else
    echo "   ⚠️ Chat endpoint not found in routes/llm.js"
    echo "   Searching all files..."
    grep -A 100 "router.post('/chat'" *.js routes/*.js 2>/dev/null | head -120 | cat -n
fi
echo ""

echo "=========================================="
