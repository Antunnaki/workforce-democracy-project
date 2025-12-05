#!/bin/bash
set -e

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🚀 Deploying v37.8.2 - RSS Expansion + Guardian API Update"
echo "═══════════════════════════════════════════════════════════════════════════════"

BACKEND_DIR="/var/www/workforce-democracy/backend"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Navigate to backend
cd "$BACKEND_DIR"

echo ""
echo "📦 Creating backups..."
cp rss-service.js "rss-service.js.backup-$TIMESTAMP"
cp ai-service.js "ai-service.js.backup-$TIMESTAMP"
echo "✅ Backups created:"
echo "   - rss-service.js.backup-$TIMESTAMP"
echo "   - ai-service.js.backup-$TIMESTAMP"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🔧 PART 1: Updating Guardian API Key"
echo "═══════════════════════════════════════════════════════════════════════════════"

# Update Guardian API key
sed -i "s/const GUARDIAN_API_KEY = process\.env\.GUARDIAN_API_KEY || '[REDACTED_GUARDIAN_API_KEY]';/const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || 'c38c6351-3dab-4d74-a1c4-061e9479a11b'; \/\/ Updated Nov 9, 2025/" rss-service.js

echo "✅ Guardian API key updated"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🔧 PART 2: Adding New RSS Feeds"
echo "═══════════════════════════════════════════════════════════════════════════════"

# Add Mother Jones after In These Times
sed -i "/name: 'In These Times',/,/topics: \['labor', 'politics'\]/a\\
        },\\
        {\\
            name: 'Mother Jones',\\
            url: 'https://www.motherjones.com/feed/',\\
            bias: 'independent_progressive',\\
            region: 'us',\\
            language: 'en',\\
            topics: ['politics', 'investigative', 'environment']\\
        },\\
        {\\
            name: 'The American Prospect',\\
            url: 'https://prospect.org/feed/',\\
            bias: 'independent_progressive',\\
            region: 'us',\\
            language: 'en',\\
            topics: ['politics', 'economy', 'labor']\\
        },\\
        {\\
            name: 'Current Affairs',\\
            url: 'https://www.currentaffairs.org/feed',\\
            bias: 'independent_progressive',\\
            region: 'us',\\
            language: 'en',\\
            topics: ['politics', 'culture', 'socialism']\\
        },\\
        {\\
            name: 'Counterpunch',\\
            url: 'https://www.counterpunch.org/feed/',\\
            bias: 'independent_progressive',\\
            region: 'us',\\
            language: 'en',\\
            topics: ['politics', 'foreign_policy', 'economics']\\
        },\\
        {\\
            name: 'The Progressive',\\
            url: 'https://progressive.org/feed/',\\
            bias: 'independent_progressive',\\
            region: 'us',\\
            language: 'en',\\
            topics: ['politics', 'social_justice', 'labor']" rss-service.js

# Add specialized feeds after Human Rights Watch
sed -i "/name: 'Human Rights Watch',/,/notes: 'US-funded, verify claims on US adversaries'/a\\
        },\\
        {\\
            name: 'IPS News',\\
            url: 'https://www.ipsnews.net/feed/',\\
            bias: 'independent_progressive',\\
            region: 'global',\\
            language: 'en',\\
            topics: ['global_south', 'development', 'human_rights']\\
        },\\
        {\\
            name: 'Dissent Magazine',\\
            url: 'https://www.dissentmagazine.org/feed',\\
            bias: 'independent_progressive',\\
            region: 'us',\\
            language: 'en',\\
            topics: ['politics', 'culture', 'democratic_socialism']\\
        },\\
        {\\
            name: 'New Republic',\\
            url: 'https://newrepublic.com/rss.xml',\\
            bias: 'establishment_liberal',\\
            region: 'us',\\
            language: 'en',\\
            topics: ['politics', 'culture']" rss-service.js

echo "✅ Added 8 new RSS feeds"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🔧 PART 3: Updating Thresholds in ai-service.js"
echo "═══════════════════════════════════════════════════════════════════════════════"

# Update SOURCE_THRESHOLD from 25 to 15
sed -i 's/const SOURCE_THRESHOLD = 25; \/\/ Increased to allow more sources/const SOURCE_THRESHOLD = 15; \/\/ Realistic target with current feed count/' ai-service.js

# Update MAX_SEARCH_ITERATIONS from 4 to 5
sed -i 's/const MAX_SEARCH_ITERATIONS = 4; \/\/ Maximum iteration loops/const MAX_SEARCH_ITERATIONS = 5; \/\/ Maximum iteration loops/' ai-service.js

# Update filterAndSortSources default from 25 to 20
sed -i 's/function filterAndSortSources(sources, query, maxResults = 25) {/function filterAndSortSources(sources, query, maxResults = 20) {/' ai-service.js

# Update filterAndSortSources call from 25 to 20
sed -i 's/const filteredSources = filterAndSortSources(sources, userMessage, 25);/const filteredSources = filterAndSortSources(sources, userMessage, 20);/' ai-service.js

echo "✅ SOURCE_THRESHOLD: 25 → 15"
echo "✅ MAX_SEARCH_ITERATIONS: 4 → 5"
echo "✅ Filter limits: 25 → 20"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════════════════"

echo ""
echo "Guardian API Key:"
grep "GUARDIAN_API_KEY" rss-service.js | head -1

echo ""
echo "New RSS Feeds:"
grep -E "Mother Jones|American Prospect|Current Affairs|Counterpunch|The Progressive|IPS News|Dissent Magazine|New Republic" rss-service.js | grep "name:" | wc -l
echo "feeds added (expected: 8)"

echo ""
echo "Thresholds:"
grep "SOURCE_THRESHOLD" ai-service.js | head -2

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🔄 Restarting PM2 Backend"
echo "═══════════════════════════════════════════════════════════════════════════════"

pm2 stop backend || true
pm2 flush backend || true
pm2 delete backend || true
pkill -9 node || true
sleep 2

pm2 start server.js --name backend
pm2 save

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Check logs:"
echo "   pm2 logs backend --lines 50"
echo ""
echo "🧪 Test with:"
echo '   Query: "climate change policy 2025"'
echo ""
echo "🔍 Verify in browser console:"
echo "   document.querySelectorAll('.citation-link').length"
echo "   (Expected: 10-20 sources)"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
