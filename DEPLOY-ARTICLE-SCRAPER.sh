#!/bin/bash
# DEPLOY ARTICLE SCRAPER - Complete Deployment
# Purpose: Deploy article-scraper.js and integrate with ai-service.js
# Method: Heredoc deployment (user's preferred method)

set -e

BACKEND_DIR="/var/www/workforce-democracy/backend"

echo "🚀 ARTICLE SCRAPER DEPLOYMENT"
echo "=============================="
echo ""

# Step 1: Deploy article-scraper.js module
echo "📝 Step 1: Creating article-scraper.js..."

cat > "${BACKEND_DIR}/article-scraper.js" << 'EOFSCRAPER'
/**
 * ARTICLE SCRAPER MODULE
 * Version: 1.0.0
 * Purpose: Fetch full article content from progressive news sources
 * 
 * Features:
 * - Full article text extraction from Truthout, Common Dreams, Democracy Now
 * - 24-hour caching to reduce costs and API calls
 * - Intelligent content extraction (article body, quotes, statistics)
 * - Rate limiting and retry logic
 * - Graceful degradation (returns excerpt if scraping fails)
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Article cache: { url: { content, scrapedAt, expiresAt } }
const articleCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Main scraping function - attempts to fetch full article content
 * @param {Object} source - Source object with url, title, excerpt, source
 * @returns {Object} Enhanced source with fullContent field
 */
async function scrapeArticle(source) {
    try {
        // Check cache first
        const cached = articleCache.get(source.url);
        if (cached && cached.expiresAt > Date.now()) {
            console.log(`  💾 Cache HIT: ${source.title.substring(0, 60)}...`);
            return { ...source, fullContent: cached.content, cached: true };
        }

        // Determine scraper based on domain
        const domain = new URL(source.url).hostname;
        let fullContent = null;

        if (domain.includes('truthout.org')) {
            fullContent = await scrapeTruthout(source.url);
        } else if (domain.includes('commondreams.org')) {
            fullContent = await scrapeCommonDreams(source.url);
        } else if (domain.includes('democracynow.org')) {
            fullContent = await scrapeDemocracyNow(source.url);
        } else if (domain.includes('jacobin.com')) {
            fullContent = await scrapeJacobin(source.url);
        } else if (domain.includes('theintercept.com')) {
            fullContent = await scrapeTheIntercept(source.url);
        } else if (domain.includes('propublica.org')) {
            fullContent = await scrapeProPublica(source.url);
        } else {
            // Generic scraper fallback
            fullContent = await scrapeGeneric(source.url);
        }

        if (fullContent && fullContent.length > 200) {
            // Cache the result
            articleCache.set(source.url, {
                content: fullContent,
                scrapedAt: Date.now(),
                expiresAt: Date.now() + CACHE_TTL_MS
            });

            console.log(`  ✅ Scraped ${fullContent.length} chars from ${domain}`);
            return { ...source, fullContent, cached: false };
        } else {
            console.log(`  ⚠️ Scraping failed or insufficient content for ${domain}`);
            return { ...source, fullContent: source.excerpt, scrapingFailed: true };
        }

    } catch (error) {
        console.error(`  ❌ Scraping error for ${source.url}:`, error.message);
        return { ...source, fullContent: source.excerpt, scrapingFailed: true };
    }
}

/**
 * Scrape multiple articles in parallel with rate limiting
 * @param {Array} sources - Array of source objects
 * @param {Number} maxConcurrent - Maximum concurrent requests (default: 3)
 * @returns {Array} Enhanced sources with fullContent
 */
async function scrapeMultipleArticles(sources, maxConcurrent = 3) {
    console.log(`\n🔍 Starting article scraping for ${sources.length} sources (max ${maxConcurrent} concurrent)...`);

    const results = [];
    
    // Process in batches to avoid overwhelming servers
    for (let i = 0; i < sources.length; i += maxConcurrent) {
        const batch = sources.slice(i, i + maxConcurrent);
        console.log(`  📦 Processing batch ${Math.floor(i / maxConcurrent) + 1} (${batch.length} articles)...`);
        
        const batchResults = await Promise.all(
            batch.map(source => scrapeArticle(source))
        );
        
        results.push(...batchResults);
        
        // Small delay between batches (respectful scraping)
        if (i + maxConcurrent < sources.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    const scraped = results.filter(r => !r.scrapingFailed).length;
    const cached = results.filter(r => r.cached).length;
    console.log(`  ✅ Scraping complete: ${scraped}/${sources.length} succeeded (${cached} from cache)\n`);

    return results;
}

/**
 * Truthout.org scraper
 */
async function scrapeTruthout(url) {
    const response = await axios.get(url, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    
    // Truthout article content is in .article-body or .content-body
    let content = '';
    
    // Try multiple selectors
    const selectors = [
        '.article-body p',
        '.content-body p',
        'article p',
        '.entry-content p'
    ];

    for (const selector of selectors) {
        const paragraphs = $(selector);
        if (paragraphs.length > 0) {
            paragraphs.each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 50) { // Filter out short fragments
                    content += text + '\n\n';
                }
            });
            break;
        }
    }

    return content.trim();
}

/**
 * CommonDreams.org scraper
 */
async function scrapeCommonDreams(url) {
    const response = await axios.get(url, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    
    let content = '';
    
    // Common Dreams article selectors
    const selectors = [
        '.field-name-body p',
        '.article-body p',
        'article .content p',
        '.node-article p'
    ];

    for (const selector of selectors) {
        const paragraphs = $(selector);
        if (paragraphs.length > 0) {
            paragraphs.each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 50) {
                    content += text + '\n\n';
                }
            });
            break;
        }
    }

    return content.trim();
}

/**
 * DemocracyNow.org scraper
 */
async function scrapeDemocracyNow(url) {
    const response = await axios.get(url, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    
    let content = '';
    
    // Democracy Now transcript/article selectors
    const selectors = [
        '.story_transcript p',
        '.news_body p',
        'article .content p',
        '.story_content p'
    ];

    for (const selector of selectors) {
        const paragraphs = $(selector);
        if (paragraphs.length > 0) {
            paragraphs.each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 50 && !text.startsWith('AMY GOODMAN:') && !text.startsWith('JUAN GONZÁLEZ:')) {
                    content += text + '\n\n';
                }
            });
            break;
        }
    }

    return content.trim();
}

/**
 * Jacobin.com scraper
 */
async function scrapeJacobin(url) {
    const response = await axios.get(url, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    
    let content = '';
    
    const selectors = [
        '.post-content p',
        'article .entry-content p',
        '.article-content p'
    ];

    for (const selector of selectors) {
        const paragraphs = $(selector);
        if (paragraphs.length > 0) {
            paragraphs.each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 50) {
                    content += text + '\n\n';
                }
            });
            break;
        }
    }

    return content.trim();
}

/**
 * TheIntercept.com scraper
 */
async function scrapeTheIntercept(url) {
    const response = await axios.get(url, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    
    let content = '';
    
    const selectors = [
        '.PostContent p',
        'article .content p',
        '.post-content p'
    ];

    for (const selector of selectors) {
        const paragraphs = $(selector);
        if (paragraphs.length > 0) {
            paragraphs.each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 50) {
                    content += text + '\n\n';
                }
            });
            break;
        }
    }

    return content.trim();
}

/**
 * ProPublica.org scraper
 */
async function scrapeProPublica(url) {
    const response = await axios.get(url, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    
    let content = '';
    
    const selectors = [
        '.article-body p',
        '.story-body p',
        'article .body p'
    ];

    for (const selector of selectors) {
        const paragraphs = $(selector);
        if (paragraphs.length > 0) {
            paragraphs.each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 50) {
                    content += text + '\n\n';
                }
            });
            break;
        }
    }

    return content.trim();
}

/**
 * Generic scraper for unknown domains
 */
async function scrapeGeneric(url) {
    const response = await axios.get(url, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    
    let content = '';
    
    // Try common article selectors
    const selectors = [
        'article p',
        '.article-content p',
        '.post-content p',
        '.entry-content p',
        'main p'
    ];

    for (const selector of selectors) {
        const paragraphs = $(selector);
        if (paragraphs.length > 3) { // At least 3 paragraphs
            paragraphs.each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 50) {
                    content += text + '\n\n';
                }
            });
            break;
        }
    }

    return content.trim();
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    const now = Date.now();
    const entries = Array.from(articleCache.values());
    const active = entries.filter(e => e.expiresAt > now).length;
    const expired = entries.filter(e => e.expiresAt <= now).length;
    
    return {
        total: articleCache.size,
        active,
        expired,
        hitRate: entries.length > 0 ? (active / entries.length * 100).toFixed(1) + '%' : '0%'
    };
}

/**
 * Clear expired cache entries
 */
function cleanCache() {
    const now = Date.now();
    let removed = 0;
    
    for (const [url, entry] of articleCache.entries()) {
        if (entry.expiresAt <= now) {
            articleCache.delete(url);
            removed++;
        }
    }
    
    console.log(`🧹 Cache cleanup: removed ${removed} expired entries`);
    return removed;
}

// Auto-cleanup every hour
setInterval(cleanCache, 60 * 60 * 1000);

module.exports = {
    scrapeArticle,
    scrapeMultipleArticles,
    getCacheStats,
    cleanCache
};
EOFSCRAPER

echo "  ✅ article-scraper.js created"

# Step 2: Run integration script
echo ""
echo "📝 Step 2: Integrating scraper with ai-service.js..."
echo ""

# Create integration script inline
cat > /tmp/integrate-scraper.sh << 'EOFINTEGRATE'
#!/bin/bash
set -e

BACKUP_DIR="/var/www/workforce-democracy/backups"
AI_SERVICE="/var/www/workforce-democracy/backend/ai-service.js"

# Create backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ai-service_pre-scraper_${TIMESTAMP}.js"
mkdir -p "$BACKUP_DIR"
cp "$AI_SERVICE" "$BACKUP_FILE"
echo "✅ Backup: $BACKUP_FILE"

# Add import
python3 << 'EOFPYTHON1'
import re
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

if 'article-scraper' not in content:
    last_require = re.findall(r"const .+ = require\(.+\);", content)
    if last_require:
        insert_after = last_require[-1]
        new_import = insert_after + "\nconst { scrapeMultipleArticles, getCacheStats } = require('./article-scraper');"
        content = content.replace(insert_after, new_import, 1)
        with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
            f.write(content)
        print("✅ Added import")
    else:
        print("❌ Import failed")
        exit(1)
else:
    print("⚠️  Import exists")
EOFPYTHON1

# Add scraping logic
python3 << 'EOFPYTHON2'
import re
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

pattern = r"(if \(sources\.length > 0\) \{\s+console\.log\(`📚 Found \$\{sources\.length\} sources - adding to context for LLM`\);\s+context\.webSearchResults = sources;\s+\})"

if re.search(pattern, content) and 'scrapeMultipleArticles' not in content:
    replacement = r'''\1
    
    // PHASE 1.5: Scrape full article content for top sources (v1.0.0)
    console.log('📄 Scraping full article content...');
    try {
        const topSources = sources.slice(0, 5);
        const scrapedSources = await scrapeMultipleArticles(topSources, 3);
        
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
    
    content = re.sub(pattern, replacement, content)
    with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
        f.write(content)
    print("✅ Added scraping")
else:
    if 'scrapeMultipleArticles' in content:
        print("⚠️  Scraping exists")
    else:
        print("❌ Scraping failed")
        exit(1)
EOFPYTHON2

# Verify
if grep -q "scrapeMultipleArticles" "$AI_SERVICE"; then
    echo "✅ Integration verified"
else
    echo "❌ Verification failed"
    exit 1
fi

# Syntax check
node -c "$AI_SERVICE" 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Syntax check passed"
else
    echo "❌ Syntax errors"
    exit 1
fi
EOFINTEGRATE

chmod +x /tmp/integrate-scraper.sh
bash /tmp/integrate-scraper.sh

if [ $? -ne 0 ]; then
    echo "❌ Integration failed"
    exit 1
fi

# Step 3: Install cheerio if not already installed
echo ""
echo "📦 Step 3: Installing cheerio dependency..."
cd "$BACKEND_DIR"
npm list cheerio > /dev/null 2>&1
if [ $? -ne 0 ]; then
    npm install cheerio --save
    echo "  ✅ cheerio installed"
else
    echo "  ✅ cheerio already installed"
fi

# Step 4: Restart PM2
echo ""
echo "🔄 Step 4: Restarting PM2..."
pm2 stop all
pm2 flush
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ ARTICLE SCRAPER DEPLOYED SUCCESSFULLY!"
echo ""
echo "📊 What was deployed:"
echo "  • article-scraper.js - Full article scraping module"
echo "  • Modified ai-service.js - Now scrapes top 5 sources"
echo "  • 24-hour caching enabled"
echo "  • Supports: Truthout, Common Dreams, Democracy Now,"
echo "    Jacobin, The Intercept, ProPublica, + generic fallback"
echo ""
echo "🧪 Test with:"
echo "  'What are the latest developments with SNAP benefits?'"
echo ""
echo "📈 Monitor with:"
echo "  pm2 logs backend --lines 100"
echo ""
echo "Look for:"
echo "  🔍 Starting article scraping..."
echo "  ✅ Scraped 2000+ chars from truthout.org"
echo "  💾 Cache HIT: (for subsequent requests)"
echo ""
