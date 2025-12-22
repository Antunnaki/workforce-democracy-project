#!/bin/bash
# Find the actual chat frontend files

echo "=========================================="
echo "FINDING CHAT FRONTEND"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy

echo "1️⃣ Looking for chat-related files:"
echo ""
find . -name "*chat*.js" -o -name "*chat*.html" | grep -v node_modules | grep -v BACKUP
echo ""

echo "2️⃣ Checking backend logs - what endpoint is being hit:"
echo ""
echo "Looking at PM2 logs for the actual endpoint..."
pm2 logs backend --lines 50 --nostream | grep "POST\|GET\|Query from" | tail -20
echo ""

echo "3️⃣ Looking for LLM proxy (civic backend):"
echo ""
ls -la backend/civic/ 2>/dev/null
echo ""

echo "4️⃣ Checking civic routes for LLM endpoint:"
echo ""
grep -n "llm\|chat" backend/routes/civic-routes.js 2>/dev/null | head -20
echo ""

echo "=========================================="
