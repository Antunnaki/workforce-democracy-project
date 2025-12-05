#!/bin/bash
# Show the RSS relevance scoring logic

echo "=========================================="
echo "RSS RELEVANCE SCORING"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ Looking for minRelevanceScore definition:"
echo ""
grep -n "minRelevanceScore\|MIN_RELEVANCE" rss-service.js | head -10
echo ""

echo "2️⃣ Showing lines 700-750 (RSS scoring section):"
echo ""
sed -n '700,750p' rss-service.js | cat -n
echo ""

echo "3️⃣ Finding where RSS articles are scored:"
echo ""
grep -n "relevanceScore\|scoreArticle" rss-service.js | head -20
echo ""

echo "=========================================="
