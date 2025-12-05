#!/bin/bash
# TEST ARTICLE SCRAPER
# Purpose: Verify article scraping is working correctly

echo "🧪 ARTICLE SCRAPER TEST SCRIPT"
echo "==============================="
echo ""

# Check if article-scraper.js exists
if [ -f "/var/www/workforce-democracy/backend/article-scraper.js" ]; then
    echo "✅ article-scraper.js exists"
else
    echo "❌ article-scraper.js NOT FOUND"
    exit 1
fi

# Check if cheerio is installed
echo ""
echo "📦 Checking dependencies..."
cd /var/www/workforce-democracy/backend
if npm list cheerio > /dev/null 2>&1; then
    echo "✅ cheerio installed"
else
    echo "❌ cheerio NOT installed - run: npm install cheerio --save"
    exit 1
fi

# Check if integration was successful
echo ""
echo "🔍 Checking ai-service.js integration..."
if grep -q "article-scraper" /var/www/workforce-democracy/backend/ai-service.js; then
    echo "✅ article-scraper import found"
else
    echo "❌ article-scraper import NOT FOUND"
    exit 1
fi

if grep -q "scrapeMultipleArticles" /var/www/workforce-democracy/backend/ai-service.js; then
    echo "✅ scrapeMultipleArticles call found"
else
    echo "❌ scrapeMultipleArticles call NOT FOUND"
    exit 1
fi

# Check PM2 status
echo ""
echo "🔄 Checking PM2 status..."
pm2 list | grep backend
if [ $? -eq 0 ]; then
    echo "✅ Backend process running"
else
    echo "❌ Backend process NOT running"
    exit 1
fi

echo ""
echo "✅ ALL CHECKS PASSED!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Watch the logs in real-time:"
echo "   pm2 logs backend --lines 50"
echo ""
echo "2. Make a test query (via your frontend):"
echo "   'What are the latest developments with SNAP benefits?'"
echo ""
echo "3. Look for these log messages:"
echo "   🔍 Pre-searching for sources before LLM call..."
echo "   📚 Found X sources - adding to context for LLM"
echo "   📄 Scraping full article content..."
echo "   🔍 Starting article scraping for 5 sources..."
echo "   ✅ Scraped 2000+ chars from truthout.org"
echo "   ✅ Scraping complete: 3/5 succeeded"
echo ""
echo "4. On subsequent requests (within 24 hours):"
echo "   💾 Cache HIT: [article title]"
echo ""
echo "5. Verify the LLM response includes:"
echo "   • Specific dollar amounts (e.g., '$23 billion cut')"
echo "   • Direct quotes from articles"
echo "   • Detailed statistics and data"
echo "   • Multiple paragraphs with varied information"
echo ""
echo "🐛 If scraping fails:"
echo "   • Check: pm2 logs backend --err --lines 100"
echo "   • Look for: '❌ Scraping error for...'"
echo "   • Verify the source URLs are accessible"
echo ""
echo "📊 Cache Performance:"
echo "   • First request: Scrapes 5 articles (~10-15 seconds)"
echo "   • Cached requests: Instant (< 1 second)"
echo "   • Cache duration: 24 hours per article"
echo ""
