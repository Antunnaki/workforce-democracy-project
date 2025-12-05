/**
 * ARTICLE SCRAPER SERVICE v37.20.0 (Playwright-based)
 * 
 * Ethical, JavaScript-capable article scraper using Playwright
 * Handles dynamic content and respects rate limits
 * 
 * FEATURES:
 * - JavaScript rendering (Playwright headless browser)
 * - Proper User-Agent (appears as real browser)
 * - Ethical delays (2-3 seconds between requests)
 * - Forever caching (never re-scrape same URL)
 * - Robust error handling
 * 
 * SUPPORTED OUTLETS:
 * - Democracy Now
 * - The Intercept
 * - Jacobin
 * - ProPublica
 * - Common Dreams
 * - Truthout
 * - The Nation
 */

const { chromium } = require('playwright');

// Cache to prevent re-scraping same article
const articleCache = new Map();

/**
 * Site-specific selectors for article content
 * Each outlet has different HTML structure
 */
const SITE_SELECTORS = {
    'Democracy Now': {
        title: 'h1.headline, h1',
        content: '.transcript__body, article .content, .article-body',
        author: '.byline, .author',
        date: 'time, .date'
    },
    'The Intercept': {
        title: 'h1.Post-headline, h1',
        content: '.Post-content, article .content',
        author: '.Author-name, .byline',
        date: 'time.datetime'
    },
    'Jacobin': {
        title: 'h1.post-title, h1',
        content: '.post-content, article .content',
        author: '.author-name, .byline',
        date: '.post-date, time'
    },
    'ProPublica': {
        title: 'h1.article-title, h1',
        content: '.article-body, .post-content',
        author: '.byline, .author',
        date: 'time.timestamp'
    },
    'Common Dreams': {
        title: 'h1.headline, h1',
        content: '.field-body, article .content',
        author: '.author, .byline',
        date: 'time, .date'
    },
    'Truthout': {
        title: 'h1.title, h1',
        content: '.article-body, .content',
        author: '.author, .byline',
        date: 'time.published'
    },
    'The Nation': {
        title: 'h1.article__title, h1',
        content: '.article__body, .content',
        author: '.author-name, .byline',
        date: 'time.datetime'
    }
};

/**
 * Scrape a single article using Playwright
 * @param {string} url - Article URL
 * @param {string} sourceName - Source outlet name
 * @returns {Object} Scraped article data
 */
async function scrapeArticle(url, sourceName = 'Unknown') {
    // Check cache first (never re-scrape)
    if (articleCache.has(url)) {
        console.log(`  📦 Cache hit: ${url}`);
        return articleCache.get(url);
    }
    
    console.log(`  🌐 Scraping: ${url} (${sourceName})`);
    
    let browser;
    try {
        // Launch headless browser
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = await context.newPage();
        
        // Set timeout and navigate
        page.setDefaultTimeout(30000); // 30 second timeout
        await page.goto(url, { waitUntil: 'networkidle' });
        
        // Wait for content to load (give JavaScript time to render)
        await page.waitForTimeout(2000);
        
        // Get site-specific selectors
        const selectors = SITE_SELECTORS[sourceName] || SITE_SELECTORS['Democracy Now']; // Fallback
        
        // Extract article data
        const articleData = await page.evaluate((selectors) => {
            // Helper to get text content safely
            const getText = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.textContent.trim() : '';
            };
            
            // Try multiple selectors (fallback chain)
            const trySelectors = (selectorString) => {
                const selectors = selectorString.split(', ');
                for (const selector of selectors) {
                    const text = getText(selector);
                    if (text) return text;
                }
                return '';
            };
            
            // Extract title
            const title = trySelectors(selectors.title);
            
            // Extract main content
            let content = trySelectors(selectors.content);
            
            // If specific selector didn't work, try generic article selectors
            if (!content) {
                content = getText('article') || getText('main') || getText('.post') || '';
            }
            
            // Extract author
            const author = trySelectors(selectors.author);
            
            // Extract date
            const dateElement = document.querySelector(selectors.date.split(', ')[0]);
            const date = dateElement ? 
                (dateElement.getAttribute('datetime') || dateElement.textContent.trim()) : 
                '';
            
            return {
                title,
                fullText: content,
                author,
                date,
                contentLength: content.length
            };
        }, selectors);
        
        await browser.close();
        
        // Validate scraped content
        if (!articleData.fullText || articleData.fullText.length < 200) {
            console.log(`  ⚠️  Insufficient content scraped (${articleData.contentLength} chars)`);
            return null;
        }
        
        console.log(`  ✅ Scraped ${articleData.contentLength} chars from ${sourceName}`);
        
        // Cache result forever
        const result = {
            title: articleData.title,
            fullText: articleData.fullText,
            author: articleData.author,
            date: articleData.date,
            url,
            source: sourceName,
            scrapedAt: new Date()
        };
        
        articleCache.set(url, result);
        
        return result;
        
    } catch (error) {
        console.error(`  ❌ Scraping error for ${url}:`, error.message);
        if (browser) {
            await browser.close();
        }
        return null;
    }
}

/**
 * Scrape multiple articles with ethical delays
 * @param {Array} urls - Array of article URLs
 * @param {string} sourceName - Source outlet name
 * @returns {Array} Array of scraped article data
 */
async function scrapeMultipleArticles(urls, sourceName = 'Unknown') {
    console.log(`📚 Scraping ${urls.length} articles from ${sourceName}...`);
    
    const results = [];
    
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        
        try {
            const articleData = await scrapeArticle(url, sourceName);
            
            if (articleData) {
                results.push(articleData);
            }
            
            // Ethical delay between articles (2-3 seconds)
            // Appears human-like, prevents rate limiting
            if (i < urls.length - 1) {
                const delay = 2000 + Math.random() * 1000;
                console.log(`  ⏳ Waiting ${(delay/1000).toFixed(1)}s before next article...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
        } catch (error) {
            console.error(`  ❌ Error scraping ${url}:`, error.message);
        }
    }
    
    console.log(`✅ Scraped ${results.length}/${urls.length} articles successfully`);
    
    return results;
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    return {
        totalCached: articleCache.size,
        cacheHitRate: articleCache.size > 0 ? '100%' : '0%' // Once cached, always returns cached
    };
}

/**
 * Clear cache (use sparingly - defeats purpose of caching)
 */
function clearCache() {
    const previousSize = articleCache.size;
    articleCache.clear();
    console.log(`🧹 Cleared article cache (${previousSize} articles removed)`);
}

module.exports = {
    scrapeArticle,
    scrapeMultipleArticles,
    getCacheStats,
    clearCache
};
