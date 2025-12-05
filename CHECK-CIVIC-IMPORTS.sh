#!/bin/bash
# Check what civic-routes.js is importing

echo "=========================================="
echo "CIVIC ROUTES IMPORTS"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "📋 Showing top 50 lines of civic-routes.js (imports):"
echo ""
sed -n '1,50p' routes/civic-routes.js | cat -n
echo ""

echo "🔍 Searching for analyzeWithAI import:"
echo ""
grep -n "analyzeWithAI\|require.*ai-service\|from.*ai-service" routes/civic-routes.js
echo ""

echo "🔍 Checking if there's a DIFFERENT ai-service in civic/backend:"
echo ""
ls -la civic/backend/ 2>/dev/null
echo ""

echo "=========================================="
