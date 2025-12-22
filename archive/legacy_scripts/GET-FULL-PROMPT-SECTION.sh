#!/bin/bash
# Show the full prompt construction section to identify how sources are formatted

echo "=========================================="
echo "SHOWING PROMPT CONSTRUCTION SECTION"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

# Find where sources are added to the prompt
echo "1️⃣ Searching for where sources are formatted in the prompt..."
echo ""
grep -n "sources.forEach\|sources.map\|Source \[" ai-service.js | head -20

echo ""
echo "=========================================="
echo ""

# Show the buildSystemPrompt function (around lines 1250-1450)
echo "2️⃣ Showing buildSystemPrompt function (lines 1200-1500)..."
echo ""
sed -n '1200,1500p' ai-service.js | cat -n

echo ""
echo "=========================================="
echo ""

# Find analyzeWithAI function
echo "3️⃣ Searching for analyzeWithAI function..."
echo ""
grep -n "async function analyzeWithAI\|function analyzeWithAI" ai-service.js

echo ""
echo "=========================================="
echo ""
