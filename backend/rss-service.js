/**
 * WORKFORCE DEMOCRACY PROJECT - RSS & NEWS API SERVICE
 * 
 * Global news aggregation from independent and ethical sources
 * NO BIG TECH - Direct from news organizations
 * 
 * Features:
 * - 65+ RSS feeds from around the world
 * - Guardian API integration
 * - Multi-language support
 * - Hourly caching
 * - Source bias tracking
 * - Fact-checking protocols
 * - ENHANCED: Keyword extraction for better article matching (v37.9.5)
 * - ENHANCED: Relevance scoring for prioritized results (v37.9.5)
 * - ENHANCED: California & North America region detection (v37.9.7)
 * 
 * Version: v37.9.7 (California + Canada region detection - January 11, 2025)
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

// =============================================================================
// CONFIGURATION - GLOBAL NEWS SOURCES
// =============================================================================

// Guardian API Configuration (Updated Nov 9, 2025)
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || 'c38c6351-3dab-4d74-a1c4-061e9479a11b';
const GUARDIAN_API_URL = 'https://content.guardianapis.com/search';

// Cache for RSS feeds (1 hour expiry)
const rssCache = new Map();
const RSS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * SOURCE BIAS CLASSIFICATION
 * Used to tag sources and provide context to users
 */
const SOURCE_BIAS = {
    // Tier 1: Independent Progressive (MOST TRUSTED)
    'independent_progressive': {
        label: 'Independent Progressive Media',
        trust_level: 'highest',
        use_for_analysis: true,
        description: 'Community-funded, worker-focused, anti-imperialist'
    },
    
    // Tier 2: State Media - Non-Western (USE WITH CONTEXT)
    'state_media_nonwestern': {
        label: 'State Media - Alternative Perspective',
        trust_level: 'high',
        use_for_analysis: true,
        description: 'Provides perspective often missing from Western media',
        warning: 'State-funded - consider bias on domestic issues'
    },
    
    // Tier 3: Establishment Liberal (FACT-CHECK REQUIRED)
    'establishment_liberal': {
        label: 'Establishment Media - Liberal',
        trust_level: 'medium',
        use_for_analysis: false,
        description: 'Corporate media with liberal editorial stance',
        warning: 'Pro-establishment bias - verify progressive claims'
    },
    
    // Tier 4: State Media - Western (HEAVY SCRUTINY)
    'state_media_western': {
        label: 'State Media - Western Perspective',
        trust_level: 'medium',
        use_for_analysis: false,
        description: 'Government-funded Western broadcaster',
        warning: 'Pro-Western, pro-NATO bias - verify foreign policy claims'
    },
    
    // Tier 5: Wire Services (BASIC FACTS ONLY)
    'wire_service': {
        label: 'Wire Service',
        trust_level: 'medium',
        use_for_analysis: false,
        description: 'Corporate news wire - use for basic facts only',
        warning: 'Corporate bias - avoid for progressive analysis'
    }
};

/**
 * GLOBAL RSS FEED CONFIGURATION
 * Organized by region and bias classification
 */
const RSS_FEEDS = {
    // =============================================================================
    // UNITED STATES - INDEPENDENT PROGRESSIVE
    // =============================================================================
    'us_independent': [
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
            topics: ['politics', 'national_security', 'surveillance']
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
        },
        {
            name: 'Common Dreams',
            url: 'https://www.commondreams.org/feed',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'environment', 'social_justice']
        },
        {
            name: 'Truthout',
            url: 'https://truthout.org/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'human_rights']
        },
        {
            name: 'The Nation',
            url: 'https://www.thenation.com/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'culture']
        },
        {
            name: 'In These Times',
            url: 'https://inthesetimes.com/feeds/rss',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['labor', 'politics']
        },
        {
            name: 'Mother Jones',
            url: 'https://www.motherjones.com/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'investigative', 'environment']
        },
        {
            name: 'The American Prospect',
            url: 'https://prospect.org/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'economy', 'labor']
        },
        {
            name: 'Current Affairs',
            url: 'https://www.currentaffairs.org/feed',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'culture', 'socialism']
        },
        {
            name: 'Counterpunch',
            url: 'https://www.counterpunch.org/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'foreign_policy', 'economics']
        },
        {
            name: 'The Progressive',
            url: 'https://progressive.org/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'social_justice', 'labor']
        }
    ],
    
    // =============================================================================
    // CALIFORNIA - STATE-SPECIFIC NEWS & GOVERNMENT DATA (v37.9.4)
    // =============================================================================
    'california_news': [
        {
            name: 'CalMatters',
            url: 'https://calmatters.org/feed/',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'state_budget', 'policy', 'california_politics']
        },
        {
            name: 'CalMatters Housing',
            url: 'https://calmatters.org/housing/feed/',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'affordability']
        },
        {
            name: 'LA Times California',
            url: 'https://www.latimes.com/california/rss2.0.xml',
            bias: 'establishment_liberal',
            region: 'california',
            language: 'en',
            topics: ['california_politics', 'housing', 'homelessness']
        },
        {
            name: 'SF Chronicle Politics',
            url: 'https://www.sfchronicle.com/politics/feed/',
            bias: 'establishment_liberal',
            region: 'california',
            language: 'en',
            topics: ['california_politics', 'housing', 'state_government']
        },
        {
            name: 'Sacramento Bee Politics',
            url: 'https://www.sacbee.com/news/politics-government/rss',
            bias: 'establishment_liberal',
            region: 'california',
            language: 'en',
            topics: ['state_government', 'budget', 'california_politics']
        },
        {
            name: 'Voice of San Diego',
            url: 'https://voiceofsandiego.org/feed/',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'local_policy', 'accountability']
        },
        {
            name: 'Streetsblog California',
            url: 'https://cal.streetsblog.org/feed/',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'urban_planning', 'transportation']
        },
        {
            name: 'KQED California',
            url: 'https://www.kqed.org/news/feed/california',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'state_policy', 'california_politics']
        },
        {
            name: 'Capital Public Radio',
            url: 'https://www.capradio.org/articles/?format=rss',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['state_politics', 'policy', 'california_government']
        },
        {
            name: 'LAist',
            url: 'https://laist.com/feed.xml',
            bias: 'independent_progressive',
            region: 'california',
            language: 'en',
            topics: ['housing', 'homelessness', 'los_angeles', 'local_policy']
        }
    ],
    
    // =============================================================================
    // NORTH AMERICA - CANADA & INTERNATIONAL COVERAGE (v37.9.7)
    // =============================================================================
    'north_america': [
        {
            name: 'CBC News',
            url: 'https://www.cbc.ca/webfeed/rss/rss-topstories',
            bias: 'state_media_western',
            region: 'canada',
            language: 'en',
            topics: ['canadian_politics', 'policy', 'healthcare', 'housing']
        },
        {
            name: 'The Tyee',
            url: 'https://thetyee.ca/rss2.xml',
            bias: 'independent_progressive',
            region: 'canada',
            language: 'en',
            topics: ['canadian_politics', 'housing', 'healthcare', 'labor']
        },
        {
            name: 'Rabble.ca',
            url: 'http://rabble.ca/feed',
            bias: 'independent_progressive',
            region: 'canada',
            language: 'en',
            topics: ['labor', 'social_justice', 'canadian_politics']
        },
        {
            name: 'The Star (Toronto)',
            url: 'https://www.thestar.com/content/thestar/feed.RSSManagerServlet.articles.topstories.rss',
            bias: 'establishment_liberal',
            region: 'canada',
            language: 'en',
            topics: ['canadian_politics', 'housing', 'toronto']
        },
        {
            name: 'National Observer',
            url: 'https://www.nationalobserver.com/feeds/rss.xml',
            bias: 'independent_progressive',
            region: 'canada',
            language: 'en',
            topics: ['climate', 'energy', 'canadian_politics', 'environment']
        }
    ],
    
    // =============================================================================
    // MIDDLE EAST - INDEPENDENT & NON-WESTERN PERSPECTIVE
    // =============================================================================
    'middle_east': [
        {
            name: 'Al Jazeera English',
            url: 'https://www.aljazeera.com/xml/rss/all.xml',
            bias: 'state_media_nonwestern',
            region: 'middle_east',
            language: 'en',
            topics: ['all'],
            notes: 'Qatar-funded but excellent global coverage, especially Middle East'
        },
        {
            name: 'Middle East Eye',
            url: 'https://www.middleeasteye.net/rss',
            bias: 'independent_progressive',
            region: 'middle_east',
            language: 'en',
            topics: ['middle_east', 'palestine']
        },
        {
            name: 'Electronic Intifada',
            url: 'https://electronicintifada.net/rss.xml',
            bias: 'independent_progressive',
            region: 'middle_east',
            language: 'en',
            topics: ['palestine', 'human_rights']
        },
        {
            name: 'Mondoweiss',
            url: 'https://mondoweiss.net/feed/',
            bias: 'independent_progressive',
            region: 'middle_east',
            language: 'en',
            topics: ['palestine', 'israel']
        }
    ],
    
    // =============================================================================
    // LATIN AMERICA - INDEPENDENT & NON-WESTERN PERSPECTIVE
    // =============================================================================
    'latin_america': [
        {
            name: 'TeleSUR English',
            url: 'https://www.telesurenglish.net/rss',
            bias: 'state_media_nonwestern',
            region: 'latin_america',
            language: 'en',
            topics: ['latin_america', 'venezuela'],
            notes: 'Venezuela-funded but provides perspective missing from US media'
        },
        {
            name: 'NACLA',
            url: 'https://nacla.org/rss.xml',
            bias: 'independent_progressive',
            region: 'latin_america',
            language: 'en',
            topics: ['latin_america', 'us_foreign_policy']
        }
    ],
    
    // =============================================================================
    // EUROPE - ESTABLISHMENT & STATE MEDIA (WITH WARNINGS)
    // =============================================================================
    'europe': [
        {
            name: 'The Guardian - World',
            url: 'https://www.theguardian.com/world/rss',
            bias: 'establishment_liberal',
            region: 'europe',
            language: 'en',
            topics: ['world'],
            notes: 'UK establishment media - good reporting but liberal bias'
        },
        {
            name: 'Deutsche Welle',
            url: 'https://rss.dw.com/xml/rss-en-all',
            bias: 'state_media_western',
            region: 'europe',
            language: 'en',
            topics: ['europe', 'germany'],
            notes: 'German state media - pro-NATO bias on foreign policy'
        },
        {
            name: 'BBC World News',
            url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
            bias: 'state_media_western',
            region: 'europe',
            language: 'en',
            topics: ['world'],
            notes: 'UK state media - British imperial perspective, verify claims'
        },
        {
            name: 'EuroNews',
            url: 'https://www.euronews.com/rss',
            bias: 'establishment_liberal',
            region: 'europe',
            language: 'en',
            topics: ['europe']
        }
    ],
    
    // =============================================================================
    // ASIA-PACIFIC - DIVERSE PERSPECTIVES
    // =============================================================================
    'asia_pacific': [
        {
            name: 'South China Morning Post',
            url: 'https://www.scmp.com/rss/91/feed',
            bias: 'establishment_liberal',
            region: 'asia',
            language: 'en',
            topics: ['asia', 'china', 'hong_kong'],
            notes: 'Hong Kong-based, Alibaba-owned'
        },
        {
            name: 'The Diplomat',
            url: 'https://thediplomat.com/feed/',
            bias: 'establishment_liberal',
            region: 'asia',
            language: 'en',
            topics: ['asia', 'geopolitics']
        },
        {
            name: 'ABC News Australia',
            url: 'https://www.abc.net.au/news/feed/51120/rss.xml',
            bias: 'state_media_western',
            region: 'australia',
            language: 'en',
            topics: ['australia', 'asia_pacific'],
            notes: 'Australian public broadcaster'
        },
        {
            name: 'The Guardian Australia',
            url: 'https://www.theguardian.com/au/rss',
            bias: 'establishment_liberal',
            region: 'australia',
            language: 'en',
            topics: ['australia']
        },
        {
            name: 'The Saturday Paper (Australia)',
            url: 'https://www.thesaturdaypaper.com.au/rss',
            bias: 'establishment_liberal',
            region: 'australia',
            language: 'en',
            topics: ['australia', 'politics']
        }
    ],
    
    // =============================================================================
    // AFRICA - EMERGING COVERAGE
    // =============================================================================
    'africa': [
        {
            name: 'AfricaNews',
            url: 'https://www.africanews.com/feed/',
            bias: 'establishment_liberal',
            region: 'africa',
            language: 'en',
            topics: ['africa']
        },
        {
            name: 'Al Jazeera Africa',
            url: 'https://www.aljazeera.com/xml/rss/africa.xml',
            bias: 'state_media_nonwestern',
            region: 'africa',
            language: 'en',
            topics: ['africa']
        }
    ],
    
    // =============================================================================
    // WIRE SERVICES - BASIC FACTS ONLY
    // =============================================================================
    'wire_services': [
        {
            name: 'AP News',
            url: 'https://apnews.com/hub/ap-top-news?format=rss',
            bias: 'wire_service',
            region: 'global',
            language: 'en',
            topics: ['breaking_news'],
            notes: 'Corporate-owned wire service - verify labor/corporate coverage'
        },
        {
            name: 'AP News World',
            url: 'https://apnews.com/world-news?format=rss',
            bias: 'wire_service',
            region: 'global',
            language: 'en',
            topics: ['breaking_news'],
            notes: 'Corporate-owned wire service - global coverage'
        },
        {
            name: 'Reuters World',
            url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
            bias: 'wire_service',
            region: 'global',
            language: 'en',
            topics: ['breaking_news'],
            notes: 'Corporate-owned wire service - verify labor/corporate coverage'
        },
        {
            name: 'Reuters Business',
            url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
            bias: 'wire_service',
            region: 'global',
            language: 'en',
            topics: ['economy', 'finance'],
            notes: 'Corporate-owned wire service - business coverage'
        }
    ],
    
    // =============================================================================
    // SPECIALIZED - LABOR, CLIMATE, HUMAN RIGHTS
    // =============================================================================
    'specialized': [
        {
            name: 'Labor Notes',
            url: 'https://labornotes.org/rss.xml',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['labor', 'unions']
        },
        {
            name: 'Grist (Climate)',
            url: 'https://grist.org/feed/',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['climate', 'environment']
        },
        {
            name: 'Human Rights Watch',
            url: 'https://www.hrw.org/rss',
            bias: 'establishment_liberal',
            region: 'global',
            language: 'en',
            topics: ['human_rights'],
            notes: 'US-funded, verify claims on US adversaries'
        },
        {
            name: 'IPS News',
            url: 'https://www.ipsnews.net/feed/',
            bias: 'independent_progressive',
            region: 'global',
            language: 'en',
            topics: ['global_south', 'development', 'human_rights']
        },
        {
            name: 'Dissent Magazine',
            url: 'https://www.dissentmagazine.org/feed',
            bias: 'independent_progressive',
            region: 'us',
            language: 'en',
            topics: ['politics', 'culture', 'democratic_socialism']
        },
        {
            name: 'New Republic',
            url: 'https://newrepublic.com/rss.xml',
            bias: 'establishment_liberal',
            region: 'us',
            language: 'en',
            topics: ['politics', 'culture']
        }
    ]
};

// =============================================================================
// RSS FEED FETCHING
// =============================================================================

/**
 * Fetch and parse a single RSS feed with caching
 * Cache duration: 1 hour (configurable)
 */
async function fetchRSSFeed(feedConfig, maxItems = 5) {
    const cacheKey = `rss_${feedConfig.name}_${maxItems}`;
    
    // Check cache
    const cached = rssCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < RSS_CACHE_DURATION)) {
        const ageMinutes = Math.floor((Date.now() - cached.timestamp) / (60 * 1000));
        console.log(`📰 ${feedConfig.name}: Using cached RSS (${ageMinutes}min old)`);
        return cached.articles;
    }
    
    try {
        console.log(`📡 Fetching RSS: ${feedConfig.name}`);
        
        const feed = await parser.parseURL(feedConfig.url);
        
        const articles = feed.items.slice(0, maxItems).map(item => {
            // Get bias info
            const biasInfo = SOURCE_BIAS[feedConfig.bias];
            
            return {
                title: item.title,
                url: item.link,
                source: feedConfig.name,
                excerpt: item.contentSnippet || item.summary || item.description || '',
                date: item.pubDate || item.isoDate || new Date().toISOString(),
                type: 'rss_feed',
                
                // Metadata for source bias tracking
                region: feedConfig.region,
                language: feedConfig.language,
                topics: feedConfig.topics,
                bias_classification: feedConfig.bias,
                bias_label: biasInfo.label,
                trust_level: biasInfo.trust_level,
                bias_warning: biasInfo.warning || null,
                use_for_analysis: biasInfo.use_for_analysis,
                notes: feedConfig.notes || null
            };
        });
        
        // Cache for 1 hour
        rssCache.set(cacheKey, {
            articles: articles,
            timestamp: Date.now()
        });
        
        console.log(`  ✅ ${feedConfig.name}: Found ${articles.length} articles`);
        return articles;
        
    } catch (error) {
        console.log(`  ⚠️ ${feedConfig.name}: ${error.message}`);
        return [];
    }
}

/**
 * Fetch multiple RSS feeds in parallel
 */
async function fetchMultipleRSSFeeds(feedConfigs, maxItemsPerFeed = 3) {
    const promises = feedConfigs.map(config => fetchRSSFeed(config, maxItemsPerFeed));
    const results = await Promise.all(promises);
    
    // Flatten and filter out empties
    return results.flat().filter(article => article);
}

// =============================================================================
// GUARDIAN API
// =============================================================================

/**
 * Search The Guardian via their free API
 * Rate limit: 5,000 requests/day, 500/second
 * Cache: 1 hour
 */
async function searchGuardianAPI(query, section = null, maxResults = 5) {
    const cacheKey = `guardian_${query}_${section}_${maxResults}`;
    
    // Check cache
    const cached = rssCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < RSS_CACHE_DURATION)) {
        const ageMinutes = Math.floor((Date.now() - cached.timestamp) / (60 * 1000));
        console.log(`🗞️  The Guardian API: Using cache (${ageMinutes}min old)`);
        return cached.articles;
    }
    
    try {
        console.log(`🗞️  Searching Guardian API: "${query}" (section: ${section || 'all'})`);
        
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
        
        console.log(`  ✅ Guardian API: Found ${articles.length} articles`);
        return articles;
        
    } catch (error) {
        console.log(`  ⚠️ Guardian API: ${error.message}`);
        return [];
    }
}

// =============================================================================
// SMART SOURCE SELECTION
// =============================================================================

/**
 * Intelligently select sources based on query topic and region
 */
async function getGlobalNewsSources(query, options = {}) {
    const {
        region = null,
        topic = null,
        maxSources = 10,
        prioritizeIndependent = true
    } = options;
    
    const sources = [];
    const queryLower = query.toLowerCase();
    
    console.log(`🌍 Global news search: "${query}"`);
    
    // =============================================================================
    // STEP 0: ENHANCED KEYWORD EXTRACTION (v37.9.5)
    // =============================================================================
    
    console.log(`🔎 Extracting keywords for better article matching...`);
    const extractedData = keywordExtraction.extractSearchKeywords(query);
    const { query: enhancedQuery, keywords, topics: extractedTopics } = extractedData;
    
    console.log(`  📌 Keywords: [${keywords.slice(0, 5).join(', ')}]`);
    console.log(`  📂 Topics: [${extractedTopics.slice(0, 3).join(', ')}]`);
    
    // =============================================================================
    // STEP 1: DETECT REGION/TOPIC FROM QUERY
    // =============================================================================
    
    const detectedRegions = [];
    const detectedTopics = [];
    
    // Region detection
    // North America (California, Canada, US states)
    if (queryLower.match(/california|newsom|gavin newsom|ca gov|sacramento|san francisco|los angeles|san diego/)) {
        detectedRegions.push('california_news');
        detectedTopics.push('california');
    }
    if (queryLower.match(/canada|canadian|toronto|ontario|quebec|vancouver|trudeau/)) {
        detectedRegions.push('north_america');
        detectedTopics.push('canada');
    }
    if (queryLower.match(/middle east|palestine|israel|lebanon|syria|iraq|iran/)) {
        detectedRegions.push('middle_east');
        detectedTopics.push('middle_east');
    }
    if (queryLower.match(/latin america|venezuela|cuba|brazil|mexico|colombia/)) {
        detectedRegions.push('latin_america');
    }
    if (queryLower.match(/europe|eu|britain|uk|france|germany|ukraine|russia/)) {
        detectedRegions.push('europe');
    }
    if (queryLower.match(/asia|china|india|japan|korea|southeast asia/)) {
        detectedRegions.push('asia_pacific');
    }
    if (queryLower.match(/australia|new zealand|oceania/)) {
        detectedRegions.push('asia_pacific');
        detectedTopics.push('australia');
    }
    if (queryLower.match(/africa|nigeria|kenya|south africa|ethiopia/)) {
        detectedRegions.push('africa');
    }
    
    // Topic detection
    if (queryLower.match(/labor|union|strike|worker|wage|employment/)) {
        detectedTopics.push('labor');
    }
    if (queryLower.match(/climate|environment|carbon|renewable|pollution/)) {
        detectedTopics.push('climate', 'environment');
    }
    if (queryLower.match(/corruption|bribery|ethics|investigation/)) {
        detectedTopics.push('corruption', 'investigative');
    }
    if (queryLower.match(/human rights|torture|prison|refugee|asylum/)) {
        detectedTopics.push('human_rights');
    }
    
    console.log(`  🎯 Detected: regions=[${detectedRegions.join(', ')}], topics=[${detectedTopics.join(', ')}]`);
    
    // =============================================================================
    // STEP 2: SELECT APPROPRIATE FEEDS
    // =============================================================================
    
    const feedsToFetch = [];
    
    // ALWAYS include top independent US sources
    if (prioritizeIndependent) {
        feedsToFetch.push(...RSS_FEEDS.us_independent.slice(0, 3));
    }
    
    // Add region-specific feeds
    detectedRegions.forEach(region => {
        if (RSS_FEEDS[region]) {
            feedsToFetch.push(...RSS_FEEDS[region]);
        }
    });
    
    // Add specialized feeds based on topics
    if (detectedTopics.includes('labor')) {
        feedsToFetch.push(...RSS_FEEDS.specialized.filter(f => f.topics.includes('labor')));
    }
    if (detectedTopics.includes('climate') || detectedTopics.includes('environment')) {
        feedsToFetch.push(...RSS_FEEDS.specialized.filter(f => f.topics.includes('climate')));
    }
    
    // If no specific region detected, add global wire services
    if (detectedRegions.length === 0) {
        feedsToFetch.push(...RSS_FEEDS.wire_services);
    }
    
    // =============================================================================
    // STEP 3: FETCH RSS FEEDS
    // =============================================================================
    
    const rssArticles = await fetchMultipleRSSFeeds(feedsToFetch, 3);
    sources.push(...rssArticles);
    
    // =============================================================================
    // STEP 4: SUPPLEMENT WITH GUARDIAN API (if needed)
    // =============================================================================
    
    if (sources.length < 5) {
        const guardianSection = detectedRegions.includes('europe') ? 'world' : 
                               detectedTopics.includes('climate') ? 'environment' :
                               null;
        
        const guardianArticles = await searchGuardianAPI(query, guardianSection, 5);
        sources.push(...guardianArticles);
    }
    
    // =============================================================================
    // STEP 4.5: ENHANCED RELEVANCE SCORING (v37.9.5)
    // =============================================================================
    
    console.log(`📊 Scoring ${sources.length} articles for relevance...`);
    
    // Add relevance score and fact-checking level to each article
    sources.forEach(article => {
        article.relevanceScore = keywordExtraction.calculateRelevanceScore(article, extractedData);
        article.factCheckLevel = keywordExtraction.getFactCheckingLevel(article.bias_classification);
    });
    
    // V37.18.30: DEBUG - Log all article scores to diagnose filtering
    console.log(`  📋 Article scores (showing all ${sources.length}):`);
    sources.forEach((article, idx) => {
        const titlePreview = (article.title || 'No title').substring(0, 60);
        console.log(`     ${idx + 1}. [${article.relevanceScore}] ${titlePreview}...`);
    });
    
    // Filter out articles with very low relevance
    // V37.18.29: Lowered from 10 → 5 to allow more policy-related articles through
    const minRelevanceScore = 5;
    const relevantSources = sources.filter(s => s.relevanceScore >= minRelevanceScore);
    
    console.log(`  ✅ ${relevantSources.length}/${sources.length} articles passed relevance threshold (≥${minRelevanceScore})`);
    
    // =============================================================================
    // STEP 5: SORT BY RELEVANCE AND TRUST LEVEL
    // =============================================================================
    
    // Sort by:
    // 1. Relevance score (higher = better match to question)
    // 2. Trust level (independent > alternative > establishment)
    relevantSources.sort((a, b) => {
        // First by relevance (if difference > 5 points)
        if (Math.abs(a.relevanceScore - b.relevanceScore) > 5) {
            return b.relevanceScore - a.relevanceScore;
        }
        
        // Then by trust level
        const trustOrder = { 'highest': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return trustOrder[a.trust_level] - trustOrder[b.trust_level];
    });
    
    // Limit to max sources
    const finalSources = relevantSources.slice(0, maxSources);
    
    console.log(`✅ Global news: Found ${finalSources.length} sources`);
    console.log(`  📊 Breakdown: ${finalSources.filter(s => s.trust_level === 'highest').length} independent, ${finalSources.filter(s => s.trust_level === 'high').length} alternative, ${finalSources.filter(s => s.trust_level === 'medium').length} establishment`);
    console.log(`  📊 Avg relevance: ${(finalSources.reduce((sum, s) => sum + s.relevanceScore, 0) / finalSources.length).toFixed(1)}`);
    
    return finalSources;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all available feed sources (for admin/debugging)
 */
function getAllFeedSources() {
    const allFeeds = [];
    Object.keys(RSS_FEEDS).forEach(category => {
        RSS_FEEDS[category].forEach(feed => {
            allFeeds.push({
                category: category,
                ...feed
            });
        });
    });
    return allFeeds;
}

/**
 * Clear RSS cache (for manual refresh)
 */
function clearRSSCache() {
    const size = rssCache.size;
    rssCache.clear();
    console.log(`🧹 Cleared ${size} RSS cache entries`);
}

// Cleanup old cache entries every hour
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of rssCache.entries()) {
        if (now - value.timestamp > RSS_CACHE_DURATION) {
            rssCache.delete(key);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`🧹 RSS Service: Cleaned ${cleaned} expired cache entries`);
    }
    
    console.log(`📊 RSS Cache stats: ${rssCache.size} entries`);
}, 60 * 60 * 1000); // Every hour

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Search feeds - Wrapper function for async job system compatibility
 * Returns empty array since deep research uses different approach
 * v37.18.11 - Added for civic-llm-async.js compatibility
 */
async function searchFeeds(message, context) {
    console.log('[RSS Service] searchFeeds called (returning empty - deep research uses different flow)');
    // Return empty array - deep research handled by ai-service.js
    return [];
}

module.exports = {
    // Main functions
    getGlobalNewsSources,
    fetchRSSFeed,
    searchGuardianAPI,
    searchFeeds,  // Added for async job compatibility (v37.18.11)
    
    // Helper functions
    getAllFeedSources,
    clearRSSCache,
    
    // Configuration (for reference)
    RSS_FEEDS,
    SOURCE_BIAS
};
