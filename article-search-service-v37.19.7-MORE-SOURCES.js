/**
 * ARTICLE SEARCH SERVICE
 * v37.19.0 - Fast local article search (replaces DuckDuckGo)
 * 
 * PERFORMANCE:
 * - DuckDuckGo: 160+ seconds, 100% timeout rate
 * - Local search: <1 second, 100% success rate
 * 
 * SOURCES:
 * - DuckDuckGo: 0-1 sources (due to timeouts)
 * - Local search: 10-20+ sources (from archive)
 */

const Article = require('../models/Article');

class ArticleSearchService {
    constructor() {
        this.cacheStats = {
            hits: 0,
            misses: 0,
            searches: 0
        };
    }
    
    /**
     * Search for articles matching keywords
     * @param {string|string[]} keywords - Search keywords
     * @param {object} options - Search options
     * @returns {Promise<Array>} - Array of article sources
     */
    async searchArticles(keywords, options = {}) {
        const {
            source = null,
            limit = 10,
            minDate = null,
            prioritizeSources = [] // e.g., ['Democracy Now', 'The Intercept']
        } = options;
        
        this.cacheStats.searches++;
        
        try {
            // Convert keywords array to string
            const searchQuery = Array.isArray(keywords) 
                ? keywords.join(' ') 
                : keywords;
            
            console.log(`🔍 Searching local article database for: "${searchQuery}"`);
            
            // Search using MongoDB text index
            const articles = await Article.searchByKeywords(searchQuery, {
                source,
                limit: limit * 2, // Get more results for filtering
                minDate
            });
            
            console.log(`  📊 Found ${articles.length} matching articles`);
            
            // Convert to source format for ai-service.js
            // V37.19.2: SMART RELEVANCE SCORING based on WHERE keywords appear
            // V37.19.5: PERSON-NAME BONUS - Major boost if person's name appears in title/excerpt
            let sources = articles.map(article => {
                let relevanceScore = article.score ? article.score * 100 : 50;
                
                // Extract keywords from search query (person names, topics)
                const keywords = searchQuery.toLowerCase().split(' ').filter(w => w.length > 3);
                
                const titleLower = (article.title || '').toLowerCase();
                const excerptLower = (article.excerpt || '').toLowerCase();
                
                // V37.19.5: DETECT PERSON NAMES (proper nouns, likely names)
                // V37.19.7: Improved to exclude more topic words, not just question words
                // Common person name patterns: "Mamdani", "Biden", "AOC", etc.
                const excludeWords = ['what', 'when', 'where', 'which', 'policy', 'policies', 'voting', 'record', 'campaign', 'election', 'candidate', 'representative', 'senator', 'congressman', 'mayor', 'governor', 'president'];
                const personKeywords = keywords.filter(k => 
                    k.length > 3 && // Must be > 3 chars
                    !excludeWords.includes(k) // Not question/topic words
                );
                
                // V37.19.5: PERSON-NAME BONUS (if query is about a person)
                if (personKeywords.length > 0) {
                    personKeywords.forEach(personName => {
                        // MAJOR BOOST if person's name in TITLE
                        if (titleLower.includes(personName)) {
                            relevanceScore += 200; // Massive boost - this article is ABOUT this person
                        }
                        // LARGE BOOST if person's name in EXCERPT
                        else if (excerptLower.includes(personName)) {
                            relevanceScore += 100; // Large boost - person mentioned in summary
                        }
                        // If person's name is NOT in title/excerpt, this article is NOT about them
                        else {
                            relevanceScore -= 50; // Penalty for not mentioning the person we're searching for
                        }
                    });
                }
                
                // BOOST score if keywords appear in TITLE (most relevant)
                const titleMatches = keywords.filter(keyword => titleLower.includes(keyword)).length;
                if (titleMatches > 0) {
                    relevanceScore += (titleMatches * 30); // Big boost for title matches
                }
                
                // MEDIUM boost if keywords in EXCERPT (relevant)
                const excerptMatches = keywords.filter(keyword => excerptLower.includes(keyword)).length;
                if (excerptMatches > 0 && titleMatches === 0) {
                    relevanceScore += (excerptMatches * 15); // Medium boost for excerpt only
                }
                
                // PENALIZE if keywords ONLY in full text (barely relevant)
                // This catches articles like "Quiet Piggy" where Mamdani is mentioned in passing
                if (titleMatches === 0 && excerptMatches === 0) {
                    relevanceScore -= 20; // Penalty for "mentioned in passing only"
                }
                
                // Cap score at 200 (increased from 100 to accommodate person-name bonuses)
                relevanceScore = Math.min(200, Math.max(0, relevanceScore));
                
                return {
                    title: article.title,
                    url: article.url,
                    snippet: article.excerpt || article.fullText.substring(0, 200),
                    source: article.source,
                    date: article.publishedDate ? article.publishedDate.toISOString() : null,
                    relevanceScore: relevanceScore,
                    topics: article.topics || []
                };
            });
            
            // Prioritize specific sources if requested
            if (prioritizeSources.length > 0) {
                sources.sort((a, b) => {
                    const aIndex = prioritizeSources.indexOf(a.source);
                    const bIndex = prioritizeSources.indexOf(b.source);
                    
                    if (aIndex !== -1 && bIndex === -1) return -1;
                    if (bIndex !== -1 && aIndex === -1) return 1;
                    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                    
                    return b.relevanceScore - a.relevanceScore;
                });
            }
            
            // Limit to requested number
            sources = sources.slice(0, limit);
            
            console.log(`  ✅ Returning ${sources.length} sources`);
            
            this.cacheStats.hits++;
            
            return sources;
            
        } catch (error) {
            console.error(`❌ Article search failed:`, error.message);
            this.cacheStats.misses++;
            return [];
        }
    }
    
    /**
     * Search for articles about a specific person/candidate
     * @param {string} personName - Name of person (e.g., "Mamdani", "AOC")
     * @param {string} topic - Topic to search for (e.g., "policies", "campaign")
     * @returns {Promise<Array>}
     */
    async searchCandidate(personName, topic = '') {
        const searchQuery = `${personName} ${topic}`.trim();
        
        console.log(`👤 Searching for candidate: "${personName}" topic: "${topic}"`);
        
        // Prioritize progressive sources for candidate searches
        const prioritySources = [
            'Democracy Now',
            'The Intercept',
            'Jacobin',
            'ProPublica',
            'Common Dreams',
            'Truthout'
        ];
        
        return this.searchArticles(searchQuery, {
            limit: 50, // v37.19.7: Increased from 15 to get more comprehensive coverage
            minDate: new Date('2020-01-01'), // Articles from 2020+
            prioritizeSources: prioritySources
        });
    }
    
    /**
     * Get database statistics
     * @returns {Promise<object>}
     */
    async getStats() {
        try {
            const totalArticles = await Article.countDocuments();
            const sourceStats = await Article.aggregate([
                {
                    $group: {
                        _id: '$source',
                        count: { $sum: 1 },
                        latest: { $max: '$publishedDate' }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);
            
            return {
                totalArticles,
                bySource: sourceStats,
                cacheStats: this.cacheStats
            };
        } catch (error) {
            console.error('❌ Failed to get stats:', error.message);
            return null;
        }
    }
    
    /**
     * Clear cache stats
     */
    resetCacheStats() {
        this.cacheStats = {
            hits: 0,
            misses: 0,
            searches: 0
        };
    }
}

// Export singleton instance
module.exports = new ArticleSearchService();
