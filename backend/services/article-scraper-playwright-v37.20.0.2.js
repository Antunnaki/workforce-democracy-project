/**
 * ARTICLE SCRAPER SERVICE v37.20.0.2 (Playwright-based)
 * 
 * FIXES:
 * - Better selector fallbacks (try generic selectors if site-specific fail)
 * - Extract ALL paragraph text, not just container
 * - Return error object instead of null (prevents crash)
 * - More detailed logging
 * 
 * Ethical, JavaScript-capable article scraper using Playwright
 * Handles dynamic content and respects rate limits
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
        content: '.transcript__body, article .content, .article-body, article, main',
        author: '.byline, .author',
        date: 'time, .date'
    },
    'The Intercept': {
        title: 'h1.Post-headline, h1',
        content: '.Post-content, article .content, article, main',
        author: '.Author-name, .byline',
        date: 'time.datetime, time'
    },
    'Drop Site News': {
        title: 'h1.post-title, h1.entry-title, h1',
        content: '.post-content, .entry-content, article .content, article, main',
        author: '.author-name, .byline, .author',
        date: 'time, .published, .post-date'
    },
    'Jacobin': {
        title: 'h1.post-title, h1',
        content: '.post-content, article .content, article, main',
        author: '.author-name, .byline',
        date: '.post-date, time'
    },
    'ProPublica': {
        title: 'h1.article-title, h1',
        content: '.article-body, .post-content, article, main',
        author: '.byline, .author',
        date: 'time.timestamp, time'
    },
    'Common Dreams': {
        title: 'h1.headline, h1',
        content: '.field-body, article .content, article, main',
        author: '.author, .byline',
        date: 'time, .date'
    },
    'Truthout': {
        title: 'h1.title, h1',
        content: '.article-body, .content, article, main',
        author: '.author, .byline',
        date: 'time.published, time'
    },
    'The Nation': {
        title: 'h1.article__title, h1',
        content: '.article__body, .content, article, main',
        author: '.author-name, .byline',
        date: 'time.datetime, time'
    }
};

/**
 * Scrape a single article using Playwright
 * @param {string} url - Article URL
 * @param {string} sourceName - Source outlet name
 * @returns {Object} Scraped article data or error object
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
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
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
            
            // Helper to get all paragraph text from a container
            const getParagraphText = (selector) => {
                const container = document.querySelector(selector);
                if (!container) return '';
                
                // Get all paragraphs within container
                const paragraphs = container.querySelectorAll('p');
                if (paragraphs.length === 0) {
                    // No paragraphs found, return container text
                    return container.textContent.trim();
                }
                
                // Join all paragraph text
                return Array.from(paragraphs)
                    .map(p => p.textContent.trim())
                    .filter(text => text.length > 0)
                    .join('\n\n');
            };
            
            // Try multiple selectors (fallback chain)
            const trySelectors = (selectorString, useParagraphs = false) => {
                const selectors = selectorString.split(', ');
                for (const selector of selectors) {
                    const text = useParagraphs ? getParagraphText(selector) : getText(selector);
                    if (text && text.length > 100) return text; // Need at least 100 chars
                }
                return '';
            };
            
            // Extract title
            const title = trySelectors(selectors.title);
            
            // Extract main content (use paragraph extraction)
            let content = trySelectors(selectors.content, true);
            
            // If specific selector didn't work, try generic article selectors
            if (!content || content.length < 200) {
                console.log('Trying generic selectors...');
                content = getParagraphText('article') || 
                          getParagraphText('main') || 
                          getParagraphText('.post') ||
                          getParagraphText('body');
            }
            
            // Extract author
            const author = trySelectors(selectors.author);
            
            // Extract date
            const dateElement = document.querySelector(selectors.date.split(', ')[0]);
            const date = dateElement ? 
                (dateElement.getAttribute('datetime') || dateElement.textContent.trim()) : 
                '';
            
            return {
                title: title || 'Untitled',
                fullText: content || '',
                author: author || 'Unknown',
                date: date || '',
                contentLength: content.length
            };
        }, selectors);
        
        await browser.close();
        
        console.log(`  📊 Scraped: ${articleData.contentLength} chars, Title: "${articleData.title.substring(0, 50)}..."`);
        
        // Validate scraped content
        if (!articleData.fullText || articleData.fullText.length < 200) {
            console.log(`  ⚠️  Insufficient content scraped (${articleData.contentLength} chars)`);
            
            // Return error object instead of null (prevents crashes)
            const errorResult = {
                title: articleData.title || 'Scraping Failed',
                fullText: `[Scraping failed: insufficient content (${articleData.contentLength} chars)]`,
                author: '',
                date: '',
                url,
                source: sourceName,
                scrapedAt: new Date(),
                error: true
            };
            
            articleCache.set(url, errorResult);
            return errorResult;
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
            scrapedAt: new Date(),
            error: false
        };
        
        articleCache.set(url, result);
        
        return result;
        
    } catch (error) {
        console.error(`  ❌ Scraping error for ${url}:`, error.message);
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                // Ignore close errors
            }
        }
        
        // Return error object instead of null
        const errorResult = {
            title: 'Scraping Error',
            fullText: `[Scraping error: ${error.message}]`,
            author: '',
            date: '',
            url,
            source: sourceName,
            scrapedAt: new Date(),
            error: true
        };
        
        articleCache.set(url, errorResult);
        return errorResult;
    }
}

/**
 * Scrape multiple articles in batch
 * @param {Array} articles - Array of {url, source} objects
 * @returns {Array} Array of scraped article data
 */
async function scrapeMultipleArticles(articles) {
    console.log(`\n📚 Scraping ${articles.length} articles...`);
    
    const results = [];
    
    for (let i = 0; i < articles.length; i++) {
        const { url, source } = articles[i];
        console.log(`\n[${i + 1}/${articles.length}]`);
        
        const result = await scrapeArticle(url, source);
        if (result && !result.error) {
            results.push(result);
        }
        
        // Ethical delay (2-3 seconds between requests)
        if (i < articles.length - 1) {
            const delay = 2000 + Math.random() * 1000; // 2-3 seconds
            console.log(`  ⏳ Waiting ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    console.log(`\n✅ Successfully scraped ${results.length}/${articles.length} articles`);
    return results;
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getCacheStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    let recent = 0;
    let old = 0;
    
    for (const [url, data] of articleCache.entries()) {
        const age = now - new Date(data.scrapedAt).getTime();
        if (age < oneHour) {
            recent++;
        } else {
            old++;
        }
    }
    
    return {
        totalCached: articleCache.size,
        recent,
        old
    };
}

/**
 * Clear old cache entries (called automatically)
 */
function clearOldCache() {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    let cleared = 0;
    for (const [url, data] of articleCache.entries()) {
        const age = now - new Date(data.scrapedAt).getTime();
        if (age > oneWeek) {
            articleCache.delete(url);
            cleared++;
        }
    }
    
    if (cleared > 0) {
        console.log(`🧹 Cleared ${cleared} old cache entries`);
    }
}

// Clean cache every hour
setInterval(clearOldCache, 60 * 60 * 1000);

module.exports = {
    scrapeArticle,
    scrapeMultipleArticles,
    getCacheStats,
    clearOldCache
};
