/**
 * News Feed Manager
 * Aggregates RSS feeds from vetted independent news sources
 * Privacy-first: All processing client-side, zero tracking
 * 
 * Version: 1.0.0
 * Last Updated: 2026-01-13
 */

class NewsFeed {
    constructor() {
        this.version = '1.0.0';
        this.sources = [];
        this.articles = [];
        this.categories = {};
        this.cache = this.loadCache();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        
        console.log(`[NewsFeed v${this.version}] Initializing...`);
    }

    /**
     * Load news sources from JSON database
     */
    async loadSources() {
        try {
            const response = await fetch('data/news-sources.json');
            const data = await response.json();
            
            this.sources = data.sources;
            this.categories = data.categories;
            
            console.log(`[NewsFeed] ✅ Loaded ${this.sources.length} vetted sources`);
            return true;
        } catch (error) {
            console.error('[NewsFeed] ❌ Failed to load sources:', error);
            return false;
        }
    }

    /**
     * Fetch RSS feeds from sources
     * @param {Object} filters - Category, country, language filters
     */
    async fetchArticles(filters = {}) {
        console.log('[NewsFeed] 🔄 Fetching articles with filters:', filters);
        
        // Check cache first
        const cacheKey = JSON.stringify(filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('[NewsFeed] ✅ Using cached articles');
            this.articles = cached;
            return cached;
        }

        // Filter sources based on criteria
        let filteredSources = this.sources;
        
        if (filters.country) {
            filteredSources = filteredSources.filter(s => s.country === filters.country);
        }
        
        if (filters.language) {
            filteredSources = filteredSources.filter(s => s.language === filters.language);
        }
        
        if (filters.category) {
            filteredSources = filteredSources.filter(s => 
                s.category.includes(filters.category)
            );
        }
        
        console.log(`[NewsFeed] 📡 Fetching from ${filteredSources.length} sources...`);

        // Fetch RSS feeds in parallel
        const fetchPromises = filteredSources.map(source => 
            this.fetchRSS(source)
        );

        const results = await Promise.allSettled(fetchPromises);
        
        // Combine all articles
        const allArticles = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                allArticles.push(...result.value);
            } else {
                console.warn(`[NewsFeed] ⚠️ Failed to fetch: ${filteredSources[index].name}`);
            }
        });

        // Sort by date (newest first)
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Cache results
        this.saveToCache(cacheKey, allArticles);
        
        this.articles = allArticles;
        console.log(`[NewsFeed] ✅ Fetched ${allArticles.length} articles`);
        
        return allArticles;
    }

    /**
     * Fetch single RSS feed via VPS CORS proxy
     * @param {Object} source - Source configuration
     */
    async fetchRSS(source) {
        try {
            // Use VPS API endpoint as CORS proxy
            const proxyUrl = `https://api.workforcedemocracyproject.org/api/rss/proxy?url=${encodeURIComponent(source.rss)}`;
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/rss+xml, application/xml, text/xml'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const xmlText = await response.text();
            const articles = this.parseRSS(xmlText, source);
            
            console.log(`[NewsFeed] ✅ ${source.name}: ${articles.length} articles`);
            return articles;
            
        } catch (error) {
            console.error(`[NewsFeed] ❌ ${source.name}:`, error.message);
            return [];
        }
    }

    /**
     * Parse RSS XML into article objects
     * @param {string} xmlText - RSS XML content
     * @param {Object} source - Source metadata
     */
    parseRSS(xmlText, source) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('XML parsing failed');
        }

        const items = xmlDoc.querySelectorAll('item');
        const articles = [];

        items.forEach((item, index) => {
            // Limit to 10 most recent articles per source
            if (index >= 10) return;

            const article = {
                id: this.generateArticleId(source.id, index),
                source: {
                    id: source.id,
                    name: source.name,
                    country: source.country,
                    bias: source.bias.rating,
                    factualAccuracy: source.bias.factualAccuracy,
                    website: source.website
                },
                title: this.getTextContent(item, 'title'),
                link: this.getTextContent(item, 'link'),
                description: this.cleanDescription(this.getTextContent(item, 'description')),
                pubDate: this.getTextContent(item, 'pubDate'),
                category: source.category,
                image: this.extractImage(item)
            };

            if (article.title && article.link) {
                articles.push(article);
            }
        });

        return articles;
    }

    /**
     * Helper: Get text content from XML element
     */
    getTextContent(item, tagName) {
        const element = item.querySelector(tagName);
        return element ? element.textContent.trim() : '';
    }

    /**
     * Helper: Clean HTML from description
     */
    cleanDescription(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        let text = temp.textContent || temp.innerText || '';
        
        // Limit to 200 characters
        if (text.length > 200) {
            text = text.substring(0, 197) + '...';
        }
        
        return text;
    }

    /**
     * Helper: Extract image from RSS item
     */
    extractImage(item) {
        // Try media:content first
        let img = item.querySelector('content');
        if (img && img.getAttribute('url')) {
            return img.getAttribute('url');
        }
        
        // Try enclosure
        img = item.querySelector('enclosure');
        if (img && img.getAttribute('url')) {
            return img.getAttribute('url');
        }
        
        // Try description for img tag
        const desc = item.querySelector('description');
        if (desc) {
            const match = desc.textContent.match(/<img[^>]+src="([^">]+)"/);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }

    /**
     * Helper: Generate unique article ID
     */
    generateArticleId(sourceId, index) {
        return `${sourceId}-${Date.now()}-${index}`;
    }

    /**
     * Cache management
     */
    loadCache() {
        try {
            const cached = localStorage.getItem('newsFeedCache');
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            console.warn('[NewsFeed] Cache load failed:', error);
            return {};
        }
    }

    saveToCache(key, data) {
        try {
            this.cache[key] = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem('newsFeedCache', JSON.stringify(this.cache));
        } catch (error) {
            console.warn('[NewsFeed] Cache save failed:', error);
        }
    }

    getFromCache(key) {
        const cached = this.cache[key];
        if (!cached) return null;
        
        // Check if expired
        if (Date.now() - cached.timestamp > this.cacheExpiry) {
            delete this.cache[key];
            return null;
        }
        
        return cached.data;
    }

    clearCache() {
        this.cache = {};
        localStorage.removeItem('newsFeedCache');
        console.log('[NewsFeed] ✅ Cache cleared');
    }

    /**
     * Get articles filtered by category
     */
    filterByCategory(category) {
        return this.articles.filter(article => 
            article.category.includes(category)
        );
    }

    /**
     * Get articles from specific country
     */
    filterByCountry(country) {
        return this.articles.filter(article => 
            article.source.country === country
        );
    }

    /**
     * Get articles by bias rating
     */
    filterByBias(biasRating) {
        return this.articles.filter(article => 
            article.source.bias === biasRating
        );
    }

    /**
     * Get statistics about loaded articles
     */
    getStats() {
        const stats = {
            totalArticles: this.articles.length,
            bySources: {},
            byCategory: {},
            byCountry: {},
            byBias: {}
        };

        this.articles.forEach(article => {
            // Count by source
            const sourceName = article.source.name;
            stats.bySources[sourceName] = (stats.bySources[sourceName] || 0) + 1;

            // Count by category
            article.category.forEach(cat => {
                stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
            });

            // Count by country
            const country = article.source.country;
            stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;

            // Count by bias
            const bias = article.source.bias;
            stats.byBias[bias] = (stats.byBias[bias] || 0) + 1;
        });

        return stats;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsFeed;
}
