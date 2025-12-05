#!/bin/bash
# Find where "passed relevance threshold" message comes from

echo "=========================================="
echo "FINDING INITIAL RSS FILTER"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ Searching for 'passed relevance threshold' log:"
echo ""
grep -rn "passed relevance threshold" . --include="*.js" | grep -v node_modules | grep -v BACKUP
echo ""

echo "2️⃣ Searching for RSS filtering logic:"
echo ""
grep -rn "RSS.*relevance\|relevance.*threshold\|filterArticles" . --include="*.js" | grep -v node_modules | grep -v BACKUP | head -20
echo ""

echo "3️⃣ Looking for the searchGlobalNews or similar function:"
echo ""
grep -n "searchGlobalNews\|searchAdditionalSources" ai-service.js | head -10
echo ""

echo "=========================================="
