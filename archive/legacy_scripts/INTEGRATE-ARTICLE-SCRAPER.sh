#!/bin/bash
# INTEGRATE ARTICLE SCRAPER v1.0.0
# Purpose: Add article scraping to ai-service.js
# Method: Insert scraper import and modify analyzeWithAI to scrape top sources

set -e

BACKUP_DIR="/var/www/workforce-democracy/backups"
AI_SERVICE="/var/www/workforce-democracy/backend/ai-service.js"
SCRAPER_FILE="/var/www/workforce-democracy/backend/article-scraper.js"

echo "🔧 ARTICLE SCRAPER INTEGRATION"
echo "================================"

# Check files exist
if [ ! -f "$AI_SERVICE" ]; then
    echo "❌ ERROR: ai-service.js not found"
    exit 1
fi

if [ ! -f "$SCRAPER_FILE" ]; then
    echo "❌ ERROR: article-scraper.js not found - copy from project directory first"
    exit 1
fi

# Create backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ai-service_pre-scraper_${TIMESTAMP}.js"
mkdir -p "$BACKUP_DIR"
cp "$AI_SERVICE" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Step 1: Add scraper import at top of file (after existing requires)
echo ""
echo "📝 Step 1: Adding article-scraper import..."

python3 << 'EOFPYTHON'
import re

with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Check if import already exists
if 'article-scraper' in content:
    print("  ⚠️  Scraper import already exists - skipping")
else:
    # Find the last require() statement
    last_require = re.findall(r"const .+ = require\(.+\);", content)
    if last_require:
        insert_after = last_require[-1]
        new_import = insert_after + "\nconst { scrapeMultipleArticles, getCacheStats } = require('./article-scraper');"
        content = content.replace(insert_after, new_import, 1)
        print("  ✅ Added scraper import after last require()")
    else:
        print("  ❌ Could not find require() statements")
        exit(1)

with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)
EOFPYTHON

if [ $? -ne 0 ]; then
    echo "❌ Failed to add import - restoring backup"
    cp "$BACKUP_FILE" "$AI_SERVICE"
    exit 1
fi

# Step 2: Modify analyzeWithAI to scrape articles after source search
echo ""
echo "📝 Step 2: Adding article scraping to analyzeWithAI()..."

python3 << 'EOFPYTHON'
import re

with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find the section after sources are searched but before buildContextualPrompt
# Look for: if (sources.length > 0) { ... context.webSearchResults = sources; }

search_pattern = r"(if \(sources\.length > 0\) \{\s+console\.log\(`📚 Found \$\{sources\.length\} sources - adding to context for LLM`\);\s+context\.webSearchResults = sources;\s+\})"

if re.search(search_pattern, content):
    # Add scraping right after context.webSearchResults = sources;
    replacement = r'''\1
    
    // PHASE 1.5: Scrape full article content for top sources (v1.0.0)
    console.log('📄 Scraping full article content...');
    try {
        const topSources = sources.slice(0, 5); // Scrape top 5 sources
        const scrapedSources = await scrapeMultipleArticles(topSources, 3); // 3 concurrent max
        
        // Replace excerpts with full content
        scrapedSources.forEach((scraped, idx) => {
            if (scraped.fullContent && !scraped.scrapingFailed) {
                context.webSearchResults[idx].excerpt = scraped.fullContent;
                context.webSearchResults[idx].scraped = true;
            }
        });
        
        const scraped = scrapedSources.filter(s => !s.scrapingFailed).length;
        console.log(`  ✅ Scraped ${scraped}/${topSources.length} articles successfully`);
        
    } catch (error) {
        console.error('⚠️ Article scraping failed (non-fatal):', error.message);
    }'''
    
    content = re.sub(search_pattern, replacement, content)
    print("  ✅ Added article scraping after source search")
    
    with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
        f.write(content)
else:
    print("  ❌ Could not find insertion point in analyzeWithAI()")
    exit(1)
EOFPYTHON

if [ $? -ne 0 ]; then
    echo "❌ Failed to add scraping logic - restoring backup"
    cp "$BACKUP_FILE" "$AI_SERVICE"
    exit 1
fi

# Step 3: Verify the changes
echo ""
echo "🔍 Step 3: Verifying changes..."

if grep -q "article-scraper" "$AI_SERVICE" && \
   grep -q "scrapeMultipleArticles" "$AI_SERVICE"; then
    echo "  ✅ All changes verified"
else
    echo "  ❌ Verification failed - changes not found"
    cp "$BACKUP_FILE" "$AI_SERVICE"
    exit 1
fi

# Step 4: Check syntax
echo ""
echo "🧪 Step 4: Checking JavaScript syntax..."
node -c "$AI_SERVICE" 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Syntax check passed"
else
    echo "  ❌ Syntax errors found - restoring backup"
    cp "$BACKUP_FILE" "$AI_SERVICE"
    exit 1
fi

# Step 5: Restart PM2
echo ""
echo "🔄 Step 5: Restarting PM2 with cache clear..."
cd /var/www/workforce-democracy/backend

pm2 stop all
pm2 flush
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ ARTICLE SCRAPER INTEGRATION COMPLETE!"
echo ""
echo "📊 Changes Applied:"
echo "  • Added article-scraper.js import"
echo "  • Modified analyzeWithAI() to scrape top 5 sources"
echo "  • Full article content replaces excerpts"
echo "  • 24-hour caching enabled"
echo ""
echo "🧪 Test with:"
echo "  Ask: 'What are the latest developments with SNAP benefits?'"
echo "  Watch logs: pm2 logs backend --lines 100"
echo ""
echo "📈 Monitor cache:"
echo "  The scraper caches articles for 24 hours"
echo "  Check pm2 logs for: '💾 Cache HIT' messages"
echo ""
