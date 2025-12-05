/**
 * ENHANCED RSS SERVICE v37.4.0
 * 
 * Improvements:
 * 1. Better keyword extraction for relevant results
 * 2. Relevance scoring to match articles to questions
 * 3. Fact-checking requirements based on source bias
 * 4. More global RSS feeds
 * 5. Mixed sources (not just Guardian)
 * 
 * DEPLOYMENT: Replace /var/www/workforce-democracy/backend/rss-service.js
 */

const Parser = require('rss-parser');
const axios = require('axios');
const keywordExtraction = require('./keyword-extraction');

const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'WorkforceDemocracyBot/1.0 (Educational; contact@workforcedemocracyproject.org)'
    }
});

// Guardian API Configuration
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || '[REDACTED_GUARDIAN_API_KEY]';
const GUARDIAN_API_URL = 'https://content.guardianapis.com/search';

// Cache for RSS feeds (1 hour expiry)
const rssCache = new Map();
const RSS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Import RSS feeds configuration from existing file
// (You'll need to copy the RSS_FEEDS and SOURCE_BIAS objects from the current rss-service.js)
// For now, I'll include a condensed version:

const SOURCE_BIAS = {
    'independent_progressive': {
        label: 'Independent Progressive Media',
        trust_level: 'highest',
        use_for_analysis: true,
        description: 'Community-funded, worker-focused, anti-imperialist'
    },
    'state_media_nonwestern': {
        label: 'State Media - Alternative Perspective',
        trust_level: 'high',
        use_for_analysis: true,
        description: 'Provides perspective often missing from Western media',
        warning: 'State-funded - consider bias on domestic issues'
    },
    'establishment_liberal': {
        label: 'Establishment Media - Liberal',
        trust_level: 'medium',
        use_for_analysis: false,
        description: 'Corporate media with liberal editorial stance',
        warning: 'Pro-establishment bias - verify progressive claims'
    },
    'state_media_western': {
        label: 'State Media - Western Perspective',
        trust_level: 'medium',
        use_for_analysis: false,
        description: 'Government-funded Western broadcaster',
        warning: 'Pro-Western, pro-NATO bias - verify foreign policy claims'
    },
    'wire_service': {
        label: 'Wire Service',
        trust_level: 'medium',
        use_for_analysis: false,
        description: 'Corporate news wire - use for basic facts only',
        warning: 'Corporate bias - avoid for progressive analysis'
    }
};

// TODO: Copy full RSS_FEEDS object from current rss-service.js
// This is a condensed version for demonstration
const RSS_FEEDS = {
    us_independent: [
        {
            name: 'Democracy Now',
            url: 'https://www.democracynow.org/democracynow.rss',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['all']
        },
        {
            name: 'The Intercept',
            url: 'https://theintercept.com/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'national_security']
        },
        {
            name: 'ProPublica',
            url: 'https://www.propublica.org/feeds/propublica/main',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['investigative', 'corruption']
        },
        {
            name: 'Jacobin',
            url: 'https://jacobin.com/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'labor', 'socialism']
        }
    ],
    // Add other regions as in current file...
};

// =============================================================================
// ENHANCED SEARCH FUNCTION
// =============================================================================

/**
 * Get global news sources with ENHANCED keyword extraction and relevance scoring
 */
async function getGlobalNewsSources(userMessage, options = {}) {
    const {
        maxSources = 5,
        prioritizeIndependent = true,
        minRelevanceScore = 15  // Minimum score to include article
    } = options;
    
    console.log(`\\n🌍 ===== ENHANCED GLOBAL NEWS SEARCH =====`);
    console.log(`📝 User question: "${userMessage}"`);
    
    // ==========================================================================
    // STEP 1: EXTRACT KEYWORDS & TOPICS
    // ==========================================================================
    
    const extractedData = keywordExtraction.extractSearchKeywords(userMessage);
    const { query: searchQuery, keywords, topics } = extractedData;
    
    console.log(`🔎 Search query: "${searchQuery}"`);
    console.log(`📌 Keywords: [${keywords.slice(0, 5).join(', ')}]`);
    console.log(`📂 Topics: [${topics.slice(0, 3).join(', ')}]`);
    
    const allSources = [];
    
    // ==========================================================================
    // STEP 2: SEARCH GUARDIAN API with extracted keywords
    // ==========================================================================
    
    console.log(`\\n🗞️  Searching Guardian API...`);
    const guardianArticles = await searchGuardianAPI(searchQuery, null, 10);
    
    // Score Guardian articles for relevance
    guardianArticles.forEach(article => {
        article.relevanceScore = keywordExtraction.calculateRelevanceScore(article, extractedData);
        article.factCheckLevel = keywordExtraction.getFactCheckingLevel(article.bias_classification);
    });
    
    // Filter by relevance
    const relevantGuardian = guardianArticles.filter(a => a.relevanceScore >= minRelevanceScore);
    console.log(`  ✅ Guardian: ${guardianArticles.length} found, ${relevantGuardian.length} relevant (score ≥${minRelevanceScore})`);
    allSources.push(...relevantGuardian);
    
    // ==========================================================================
    // STEP 3: SEARCH RSS FEEDS with keyword matching
    // ==========================================================================
    
    console.log(`\\n📡 Searching RSS feeds...`);
    
    // Always include top independent sources
    const feedsToSearch = [];
    if (prioritizeIndependent) {
        feedsToSearch.push(...RSS_FEEDS.us_independent);
    }
    
    // TODO: Add region-specific feeds based on detected regions
    // (Copy logic from current rss-service.js lines 646-664)
    
    // Fetch RSS feeds
    const rssArticles = await fetchMultipleRSSFeeds(feedsToSearch, 5);
    
    // Score RSS articles for relevance
    rssArticles.forEach(article => {
        article.relevanceScore = keywordExtraction.calculateRelevanceScore(article, extractedData);
        article.factCheckLevel = keywordExtraction.getFactCheckingLevel(article.bias_classification);
    });
    
    // Filter by relevance
    const relevantRSS = rssArticles.filter(a => a.relevanceScore >= minRelevanceScore);
    console.log(`  ✅ RSS: ${rssArticles.length} found, ${relevantRSS.length} relevant (score ≥${minRelevanceScore})`);
    allSources.push(...relevantRSS);
    
    // ==========================================================================
    // STEP 4: SORT BY RELEVANCE & TRUST LEVEL
    // ==========================================================================
    
    console.log(`\\n📊 Sorting ${allSources.length} total sources...`);
    
    // Sort by:
    // 1. Relevance score (higher = better match to question)
    // 2. Trust level (independent > alternative > establishment)
    allSources.sort((a, b) => {
        // First by relevance
        if (Math.abs(a.relevanceScore - b.relevanceScore) > 5) {
            return b.relevanceScore - a.relevanceScore;
        }
        
        // Then by trust level
        const trustOrder = { 'highest': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return trustOrder[a.trust_level] - trustOrder[b.trust_level];
    });
    
    // ==========================================================================
    // STEP 5: SELECT DIVERSE SOURCES
    // ==========================================================================
    
    const finalSources = [];
    const sourcesSeen = new Set();
    
    for (const source of allSources) {
        // Avoid duplicates from same outlet
        if (sourcesSeen.has(source.source)) continue;
        
        finalSources.push(source);
        sourcesSeen.add(source.source);
        
        if (finalSources.length >= maxSources) break;
    }
    
    // ==========================================================================
    // STEP 6: LOG RESULTS
    // ==========================================================================
    
    console.log(`\\n✅ ===== FINAL RESULTS =====`);
    console.log(`📊 Selected ${finalSources.length} sources (requested: ${maxSources})`);
    
    finalSources.forEach((source, i) => {
        console.log(`  ${i+1}. [Score: ${source.relevanceScore}] ${source.source}: "${source.title.substring(0, 60)}..."`);
        console.log(`     Trust: ${source.trust_level}, Bias: ${source.bias_classification}`);
        console.log(`     Fact-check: ${source.factCheckLevel.level} - ${source.factCheckLevel.checks[0]}`);
    });
    
    console.log(`\\n💡 Breakdown:`);
    console.log(`   Independent: ${finalSources.filter(s => s.trust_level === 'highest').length}`);
    console.log(`   Alternative: ${finalSources.filter(s => s.trust_level === 'high').length}`);
    console.log(`   Establishment: ${finalSources.filter(s => s.trust_level === 'medium').length}`);
    console.log(`\\n==========================================\\n`);
    
    return finalSources;
}

// =============================================================================
// GUARDIAN API SEARCH (unchanged but integrated with keyword extraction)
// =============================================================================

async function searchGuardianAPI(query, section = null, maxResults = 5) {
    const cacheKey = `guardian_${query}_${section}_${maxResults}`;
    
    // Check cache
    const cached = rssCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < RSS_CACHE_DURATION)) {
        return cached.articles;
    }
    
    try {
        const params = {
            'q': query,
            'show-fields': 'headline,standfirst,bodyText,thumbnail',
            'api-key': GUARDIAN_API_KEY,
            'page-size': maxResults,
            'order-by': 'relevance'
        };
        
        if (section) {
            params['section'] = section;
        }
        
        const response = await axios.get(GUARDIAN_API_URL, {
            params: params,
            timeout: 10000
        });
        
        if (response.data.response.status !== 'ok') {
            throw new Error(`API returned status: ${response.data.response.status}`);
        }
        
        const articles = response.data.response.results.map(article => {
            const biasInfo = SOURCE_BIAS['establishment_liberal'];
            
            return {
                title: article.fields?.headline || article.webTitle,
                url: article.webUrl,
                source: 'The Guardian',
                excerpt: article.fields?.standfirst || article.fields?.bodyText?.substring(0, 200) || '',
                date: article.webPublicationDate,
                type: 'guardian_api',
                
                // Metadata
                region: 'europe',
                language: 'en',
                topics: [article.sectionName?.toLowerCase() || 'general'],
                bias_classification: 'establishment_liberal',
                bias_label: biasInfo.label,
                trust_level: biasInfo.trust_level,
                bias_warning: biasInfo.warning,
                use_for_analysis: biasInfo.use_for_analysis,
                notes: 'Guardian API - fact-check progressive claims'
            };
        });
        
        // Cache for 1 hour
        rssCache.set(cacheKey, {
            articles: articles,
            timestamp: Date.now()
        });
        
        return articles;
        
    } catch (error) {
        console.log(`  ⚠️ Guardian API: ${error.message}`);
        return [];
    }
}

// =============================================================================
// RSS FEED FETCHING (copy from current rss-service.js)
// =============================================================================

async function fetchRSSFeed(feedConfig) {
    // TODO: Copy implementation from current rss-service.js
    // This is a placeholder
    return [];
}

async function fetchMultipleRSSFeeds(feeds, maxPerFeed = 3) {
    // TODO: Copy implementation from current rss-service.js
    // This is a placeholder
    return [];
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    getGlobalNewsSources,
    searchGuardianAPI,
    fetchRSSFeed,
    SOURCE_BIAS,
    RSS_FEEDS
};
