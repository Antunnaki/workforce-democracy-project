#!/bin/bash
# Verify v37.19.8 deployment on server

echo "🔍 VERIFYING v37.19.8 DEPLOYMENT ON SERVER"
echo "=========================================="
echo ""

echo "1️⃣ Checking article-search-service.js version..."
ssh root@185.193.126.13 'grep -n "v37.19.8" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js | head -5'
echo ""

echo "2️⃣ Checking searchCandidate function signature..."
ssh root@185.193.126.13 'grep -A 3 "async searchCandidate" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js | head -10'
echo ""

echo "3️⃣ Checking if searchWithDuckDuckGo exists..."
ssh root@185.193.126.13 'grep -n "searchWithDuckDuckGo" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js | head -3'
echo ""

echo "4️⃣ Checking if indexArticles exists..."
ssh root@185.193.126.13 'grep -n "indexArticles" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js | head -3'
echo ""

echo "5️⃣ Checking Article.js model (should allow all sources)..."
ssh root@185.193.126.13 'grep -A 5 "source:" /var/www/workforce-democracy/version-b/backend/models/Article.js | head -10'
echo ""

echo "6️⃣ Checking if DuckDuckGo fallback logic exists..."
ssh root@185.193.126.13 'grep -B 2 -A 5 "if (useFallback" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js | head -15'
echo ""

echo "7️⃣ Checking file upload timestamps..."
ssh root@185.193.126.13 'ls -lh /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
ssh root@185.193.126.13 'ls -lh /var/www/workforce-democracy/version-b/backend/models/Article.js'
ssh root@185.193.126.13 'ls -lh /var/www/workforce-democracy/version-b/backend/ai-service.js'
echo ""

echo "✅ Verification complete!"
