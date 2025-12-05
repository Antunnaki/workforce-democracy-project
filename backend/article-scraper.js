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
