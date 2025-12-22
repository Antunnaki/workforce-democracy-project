#!/bin/bash
# Check what endpoint the frontend is actually calling

echo "=========================================="
echo "CHECKING FRONTEND API CALLS"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy

echo "1️⃣ Finding frontend files:"
echo ""
find . -name "*.js" -type f ! -path "*/node_modules/*" ! -path "*/backend/*" ! -path "*BACKUP*" | head -10
echo ""

echo "2️⃣ Searching for API endpoints in frontend:"
echo ""
grep -r "api/llm\|api/chat" --include="*.js" --include="*.html" . 2>/dev/null | grep -v node_modules | grep -v backend | grep -v BACKUP | head -20
echo ""

echo "3️⃣ Checking for /api/llm/chat endpoint in backend:"
echo ""
grep -rn "api/llm/chat\|/llm/chat" backend/*.js backend/civic/*.js 2>/dev/null | head -10
echo ""

echo "=========================================="
