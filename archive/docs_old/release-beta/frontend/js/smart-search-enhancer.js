/**
 * WORKFORCE DEMOCRACY PROJECT - Smart Search Enhancer
 * Version: 37.17.0-SMART-STATIC
 * 
 * Purpose: Provide intelligent search enhancement WITHOUT AI costs
 * Method: Pattern matching, rule-based logic, client-side processing
 * Cost: $0 (no API calls)
 * 
 * Philosophy: 80% of intelligence at 0% of the cost
 */

class SmartSearchEnhancer {
    constructor() {
        this.queryPatterns = this.initializePatterns();
        this.userContext = this.loadUserContext();
    }
    
    /**
     * Initialize common query patterns
     * Covers ~80% of user search intents
     */
    initializePatterns() {
        return {
            // Voting-related queries
            voting: {
                keywords: ['vote', 'voting', 'voted', 'ballot', 'election'],
                enhancements: {
                    focus: 'voting-records',
                    filters: ['votes', 'bills'],
                    sort: 'date-desc',
                    suggest: 'View voting history timeline'
                }
            },
            
            // Bill-related queries
            bills: {
                keywords: ['bill', 'legislation', 'law', 'hr', 's.'],
                enhancements: {
                    focus: 'bills',
                    filters: ['federal', 'state'],
                    sort: 'relevance',
                    suggest: 'Analyze bill impacts'
                }
            },
            
            // Comparison queries
            comparison: {
                keywords: ['compare', 'vs', 'versus', 'difference between'],
                enhancements: {
                    focus: 'comparison',
                    view: 'side-by-side',
                    filters: ['voting-records', 'party-affiliation'],
                    suggest: 'Compare voting patterns'
                }
            },
            
            // Contact queries
            contact: {
                keywords: ['contact', 'email', 'phone', 'office', 'reach'],
                enhancements: {
                    focus: 'contact-info',
                    highlight: ['phone', 'email', 'district-office'],
                    suggest: 'View all contact methods'
                }
            },
            
            // District/local queries
            local: {
                keywords: ['district', 'local', 'my area', 'near me'],
                enhancements: {
                    focus: 'local-representatives',
                    filters: ['state', 'district'],
                    suggest: 'Find local representatives'
                }
            }
        };
    }
    
    /**
     * Enhance user query with smart suggestions
     * NO AI CALLS - pure pattern matching
     */
    enhanceQuery(query, context = {}) {
        const lowerQuery = query.toLowerCase();
        const enhancements = {
            originalQuery: query,
            detected: [],
            suggestions: [],
            filters: [],
            focus: null,
            confidence: 0
        };
        
        // Check each pattern
        for (const [type, pattern] of Object.entries(this.queryPatterns)) {
            const matched = pattern.keywords.some(kw => lowerQuery.includes(kw));
            
            if (matched) {
                enhancements.detected.push(type);
                enhancements.filters.push(...(pattern.enhancements.filters || []));
                enhancements.focus = pattern.enhancements.focus;
                enhancements.suggestions.push(pattern.enhancements.suggest);
                enhancements.confidence += 0.3;
            }
        }
        
        // Detect comparison intent
        if (this.detectComparisonIntent(query)) {
            const names = this.extractNames(query);
            if (names.length >= 2) {
                enhancements.comparison = {
                    representatives: names,
                    view: 'side-by-side'
                };
                enhancements.confidence += 0.4;
            }
        }
        
        // Add contextual suggestions based on user history
        if (context.viewedBills > 5 && !context.viewedVotingRecords) {
            enhancements.suggestions.push('Explore voting records for these bills');
        }
        
        // Deduplicate
        enhancements.filters = [...new Set(enhancements.filters)];
        enhancements.confidence = Math.min(enhancements.confidence, 1.0);
        
        return enhancements;
    }
    
    /**
     * Detect if query is asking for comparison
     */
    detectComparisonIntent(query) {
        const comparisonWords = [
            'compare', 'vs', 'versus', 'difference',
            'better than', 'worse than', 'against'
        ];
        return comparisonWords.some(word => query.toLowerCase().includes(word));
    }
    
    /**
     * Extract representative names from query
     * Simple pattern: Capitalized words that aren't common words
     */
    extractNames(query) {
        const words = query.split(/\s+/);
        const commonWords = new Set([
            'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at',
            'to', 'for', 'of', 'with', 'by', 'from', 'as',
            'compare', 'versus', 'vs', 'between', 'vote', 'bill'
        ]);
        
        const names = words.filter(word => {
            const cleaned = word.replace(/[^a-zA-Z]/g, '');
            return cleaned.length > 2 && 
                   cleaned[0] === cleaned[0].toUpperCase() &&
                   !commonWords.has(cleaned.toLowerCase());
        });
        
        return names;
    }
    
    /**
     * Load user context from localStorage (privacy-preserving)
     */
    loadUserContext() {
        try {
            const stored = localStorage.getItem('wdp_user_context');
            return stored ? JSON.parse(stored) : {
                viewedBills: 0,
                viewedVotingRecords: 0,
                searchHistory: [],
                preferences: {}
            };
        } catch (e) {
            return {};
        }
    }
    
    /**
     * Update user context (client-side only)
     */
    updateContext(activity) {
        Object.assign(this.userContext, activity);
        try {
            localStorage.setItem('wdp_user_context', JSON.stringify(this.userContext));
        } catch (e) {
            console.warn('Could not save user context');
        }
    }
    
    /**
     * Generate smart filter suggestions based on query
     */
    suggestFilters(query, currentFilters = []) {
        const enhancements = this.enhanceQuery(query);
        const suggested = enhancements.filters.filter(f => !currentFilters.includes(f));
        
        return suggested.map(filter => ({
            filter: filter,
            reason: `Based on your search for "${query}"`,
            confidence: enhancements.confidence
        }));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartSearchEnhancer;
}
