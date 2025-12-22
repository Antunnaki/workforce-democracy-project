#!/bin/bash
# Show the civic LLM chat endpoint

echo "=========================================="
echo "CIVIC LLM CHAT ENDPOINT"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "📋 Showing lines 100-170 (civic LLM chat handler):"
echo ""
sed -n '100,170p' routes/civic-routes.js | cat -n
echo ""

echo "=========================================="
