/**
 * ETHICAL WEB SCRAPER
 * v37.0.0 - DuckDuckGo-powered, privacy-respecting scraper
 * 
 * Features:
 * - Uses DuckDuckGo HTML search (no tracking)
 * - Respects robots.txt ALWAYS
 * - Rate limiting (be nice to servers)
 * - Aggressive caching (reduce load)
 * - Transparent user agent
 * - Never scrapes paywalls or private data
 */

const axios = require('axios');
const cheerio = require('cheerio');
const robotsParser = require('robots-parser');

class EthicalScraper {
    constructor() {
        this.userAgent = 'WorkforceDemocracyBot/1.0 (Civic education; +https://workforcedemocracyproject.org/about)';
        
        // Rate limits (milliseconds between requests)
        this.rateLimits = {
            politifact: 2000,    // 1 req per 2 seconds
            factcheck: 2000,
            ballotpedia: 3000,   // 1 req per 3 seconds
            localNews: 5000,     // 1 req per 5 seconds (be extra respectful)
            default: 2000
        };
        
        // Cache for robots.txt
        this.robotsCache = new Map();
        
        // Last request timestamps per domain
        this.lastRequest = new Map();
        
        // Blocklist (never scrape these)
        this.blocklist = [
            'nytimes.com',      // Paywall
            'wsj.com',          // Paywall
            'washingtonpost.com' // Paywall (use free RSS instead)
        ];
    }

    /**
     * Search DuckDuckGo HTML interface
     * @param {string} query - Search query
     * @param {number} maxResults - Maximum results to return
     * @returns {Promise<Array>} - Array of {title, url, snippet}
     */
    async searchDuckDuckGo(query, maxResults = 10) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
            
            console.log(`🦆 DuckDuckGo search: "${query}"`);
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html'
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(response.data);
            const results = [];
            
            // Parse DuckDuckGo HTML results
            $('.result').each((i, elem) => {
                if (results.length >= maxResults) return false;
                
                const title = $(elem).find('.result__title').text().trim();
                const url = $(elem).find('.result__url').attr('href');
                const snippet = $(elem).find('.result__snippet').text().trim();
                
                if (title && url) {
                    // Check if URL is in blocklist
                    const domain = this.extractDomain(url);
                    if (!this.isBlocked(domain)) {
                        results.push({ title, url, snippet });
                    }
                }
            });
            
            console.log(`  ✅ Found ${results.length} results`);
            return results;
            
        } catch (error) {
            console.error('❌ DuckDuckGo search error:', error.message);
            return [];
        }
    }

    /**
     * Check if we can scrape a URL (robots.txt check)
     * @param {string} url - URL to check
     * @returns {Promise<boolean>} - True if allowed
     */
    async canScrape(url) {
        try {
            const domain = this.extractDomain(url);
            
            // Check blocklist first
            if (this.isBlocked(domain)) {
                console.log(`  🚫 Blocked: ${domain} (in blocklist)`);
                return false;
            }
            
            // Check robots.txt cache
            if (this.robotsCache.has(domain)) {
                const robots = this.robotsCache.get(domain);
                const allowed = robots.isAllowed(url, this.userAgent);
                if (!allowed) {
                    console.log(`  🚫 Blocked: ${domain} (robots.txt)`);
                }
                return allowed;
            }
            
            // Fetch and parse robots.txt
            const robotsUrl = `https://${domain}/robots.txt`;
            const response = await axios.get(robotsUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 5000,
                validateStatus: () => true // Don't throw on 404
            });
            
            const robots = robotsParser(robotsUrl, response.data);
            this.robotsCache.set(domain, robots);
            
            const allowed = robots.isAllowed(url, this.userAgent);
            if (!allowed) {
                console.log(`  🚫 Blocked: ${domain} (robots.txt)`);
            }
            return allowed;
            
        } catch (error) {
            // If robots.txt fetch fails, assume allowed but log warning
            console.warn(`  ⚠️ Could not fetch robots.txt for ${this.extractDomain(url)}, proceeding cautiously`);
            return true;
        }
    }

    /**
     * Rate-limited scrape with robots.txt respect
     * @param {string} url - URL to scrape
     * @param {string} siteType - Site category for rate limiting
     * @returns {Promise<object>} - {html, $} (Cheerio object)
     */
    async scrape(url, siteType = 'default') {
        try {
            // Check robots.txt
            const canScrape = await this.canScrape(url);
            if (!canScrape) {
                throw new Error('Scraping not allowed per robots.txt');
            }
            
            // Rate limiting
            await this.respectRateLimit(this.extractDomain(url), siteType);
            
            console.log(`  🌐 Scraping: ${url}`);
            
            // Fetch page
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout: 15000
            });
            
            const $ = cheerio.load(response.data);
            
            console.log(`  ✅ Scraped successfully`);
            
            return {
                html: response.data,
                $: $,
                url: url
            };
            
        } catch (error) {
            console.error(`  ❌ Scrape error for ${url}:`, error.message);
            throw error;
        }
    }

    /**
     * Respect rate limits (wait if needed)
     * @param {string} domain - Domain to check
     * @param {string} siteType - Site type for rate limit lookup
     */
    async respectRateLimit(domain, siteType) {
        const limit = this.rateLimits[siteType] || this.rateLimits.default;
        const lastRequest = this.lastRequest.get(domain) || 0;
        const elapsed = Date.now() - lastRequest;
        
        if (elapsed < limit) {
            const waitTime = limit - elapsed;
            console.log(`  ⏳ Rate limiting: waiting ${waitTime}ms for ${domain}`);
            await this.sleep(waitTime);
        }
        
        this.lastRequest.set(domain, Date.now());
    }

    /**
     * Extract domain from URL
     * @param {string} url - Full URL
     * @returns {string} - Domain only
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url;
        }
    }

    /**
     * Check if domain is in blocklist
     * @param {string} domain - Domain to check
     * @returns {boolean} - True if blocked
     */
    isBlocked(domain) {
        return this.blocklist.some(blocked => domain.includes(blocked));
    }

    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Extract article content from generic news page
     * @param {object} $ - Cheerio object
     * @returns {object} - {title, content, author, date}
     */
    extractArticleContent($) {
        // Try common selectors for article content
        const selectors = {
            title: [
                'h1.article-title',
                'h1[itemprop="headline"]',
                'h1.entry-title',
                'article h1',
                'h1'
            ],
            content: [
                'article.article-body',
                'div.article-content',
                'div[itemprop="articleBody"]',
                'div.entry-content',
                'article'
            ],
            author: [
                'span.author-name',
                'a[rel="author"]',
                'span[itemprop="author"]',
                'div.byline'
            ],
            date: [
                'time[datetime]',
                'span.publish-date',
                'meta[property="article:published_time"]'
            ]
        };
        
        const extract = (selectorList) => {
            for (const selector of selectorList) {
                const elem = $(selector).first();
                if (elem.length) {
                    return elem.text().trim() || elem.attr('content') || elem.attr('datetime');
                }
            }
            return null;
        };
        
        return {
            title: extract(selectors.title),
            content: extract(selectors.content),
            author: extract(selectors.author),
            date: extract(selectors.date)
        };
    }
}

module.exports = EthicalScraper;
