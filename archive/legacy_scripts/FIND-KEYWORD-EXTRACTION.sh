#!/bin/bash
# Find the calculateRelevanceScore function

echo "=========================================="
echo "FINDING RELEVANCE SCORE CALCULATION"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ Finding where keywordExtraction is imported:"
echo ""
grep -n "keywordExtraction\|require.*keyword" rss-service.js | head -5
echo ""

echo "2️⃣ Looking for keyword extraction file:"
echo ""
find . -name "*keyword*" -o -name "*extraction*" | grep -v node_modules | grep -v BACKUP
echo ""

echo "3️⃣ Searching for calculateRelevanceScore in all files:"
echo ""
grep -rn "calculateRelevanceScore\|function calculateRelevanceScore" . --include="*.js" | grep -v node_modules | grep -v BACKUP | head -10
echo ""

echo "=========================================="
