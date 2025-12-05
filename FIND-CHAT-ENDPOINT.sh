#!/bin/bash
# Find where the chat endpoint is defined

echo "=========================================="
echo "FINDING CHAT ENDPOINT"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ Searching for chat endpoint in all files:"
echo ""
find . -name "*.js" -type f ! -path "*/node_modules/*" ! -path "*BACKUP*" -exec grep -l "POST.*chat\|router.post.*chat\|app.post.*chat" {} \; 2>/dev/null
echo ""

echo "2️⃣ Showing server.js structure:"
echo ""
grep -n "app.post\|router.use\|require.*route\|/api/llm" server.js | head -20
echo ""

echo "3️⃣ Looking for LLM-related routes:"
echo ""
ls -la routes/ 2>/dev/null || echo "No routes directory"
echo ""

echo "4️⃣ Checking if endpoints are in server.js directly:"
echo ""
grep -n "/chat" server.js | head -10
echo ""

echo "5️⃣ Finding where analyzeWithAI is CALLED (not defined):"
echo ""
grep -n "await analyzeWithAI\|= analyzeWithAI" server.js ai-service.js 2>/dev/null | grep -v "function\|module.exports" | head -20
echo ""

echo "=========================================="
