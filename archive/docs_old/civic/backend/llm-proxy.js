/**
 * LLM Assistant Proxy - v37.4.5b
 * 
 * Secure backend proxy for Groq API calls.
 * Keeps GROQ_API_KEY server-side, never exposed to frontend.
 * 
 * CHANGELOG v37.4.5b:
 * - Added source counting before LLM call
 * - Forbid LLM from generating fake "Sources:" sections
 * - Enhanced logging with [v37.4.5] markers
 * 
 * Endpoints:
 * - POST /api/civic/llm-chat - Send message to LLM
 * - GET /api/civic/llm-health - Check LLM service health
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

console.log('🔧 [v37.4.5b] Loading llm-proxy.js module...');

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const MODEL = 'llama3-70b-8192'; // 70B for best quality

// =============================================================================
// PHASE 2: SOURCE SEARCH & CACHING
// =============================================================================

// Smart caches with appropriate expiry times
const financeCache = new Map(); // OpenSecrets: Cache for 90 days (quarterly updates)
const newsCache = new Map();    // DuckDuckGo: Cache for 7 days (news updates weekly)

// Trusted news sources configuration
const NEWS_SOURCES = {
    independent: [
        { name: 'Zeteo', domain: 'zeteo.com', type: 'independent' },
        { name: 'Breaking Points', domain: 'breakingpoints.com', type: 'independent' },
        { name: 'The Intercept', domain: 'theintercept.com', type: 'independent' },
        { name: 'Democracy Now', domain: 'democracynow.org', type: 'independent' },
        { name: 'ProPublica', domain: 'propublica.org', type: 'independent' }
    ],
    factCheckers: [
        { name: 'PolitiFact', domain: 'politifact.com', type: 'factcheck' },
        { name: 'FactCheck.org', domain: 'factcheck.org', type: 'factcheck' },
        { name: 'AP Fact Check', domain: 'apnews.com/ap-fact-check', type: 'factcheck' },
        { name: 'Reuters Fact Check', domain: 'reuters.com/fact-check', type: 'factcheck' },
        { name: 'Snopes', domain: 'snopes.com', type: 'factcheck' }
    ],
    mainstream: [
        { name: 'AP News', domain: 'apnews.com', type: 'news', excludePaths: ['/commentary', '/opinion'] },
        { name: 'Reuters', domain: 'reuters.com', type: 'news', excludePaths: ['/opinion', '/breakingviews'] },
        { name: 'BBC News', domain: 'bbc.com/news', type: 'news' },
        { name: 'NPR News', domain: 'npr.org', type: 'news', excludePaths: ['/opinion'] }
    ]
};

// System prompts for different contexts - UPDATED v37.4.5 with source counting
const CITATION_RULES = `
CITATION RULES (v37.4.5 - SOURCE COUNTING):
• Count available sources BEFORE adding citations
• ONLY use [1], [2], [3] if corresponding sources exist in context
• If you see 2 sources listed, use ONLY [1] and [2]
• If NO sources are listed in context, use NO citations at all
• Every [N] must have a matching source
• Place citation immediately after the fact: "Gaza deaths exceed 30,000 [1]."

CRITICAL: Look for "WEB SEARCH RESULTS" in the message context. Count them. Use [1] through [N] ONLY where N = source count.

❌ DO NOT CREATE A "Sources:" SECTION AT THE END OF YOUR RESPONSE
❌ DO NOT LIST SOURCE NAMES/URLS IN YOUR RESPONSE TEXT
❌ DO NOT INVENT FAKE SOURCES
The backend will handle providing source links to the user automatically.
Your job is ONLY to add citation numbers [1] [2] [3] in the text where appropriate.
`;

const SYSTEM_PROMPTS = {
    factChecking: `You are a neutral, non-partisan fact-checking assistant helping citizens understand political claims. Your role is to:
1. Present facts objectively without political bias
2. Cite multiple sources when available
3. Explain context and nuance
4. Help users think critically about information
5. Never tell users what to think, only provide facts

${CITATION_RULES}

Always be transparent about uncertainty and acknowledge when information is contested.`,
    
    billExplanation: `You are a civic education assistant helping citizens understand legislation. Your role is to:
1. Explain bills in plain language
2. Highlight key provisions and impacts
3. Present multiple perspectives fairly
4. Connect to real-world implications
5. Avoid partisan framing

${CITATION_RULES}

Make complex policy accessible without dumbing it down.`,
    
    representativeAnalysis: `You are a non-partisan analyst helping citizens understand their representatives. Your role is to:
1. Present voting records objectively
2. Explain campaign finance data neutrally
3. Highlight alignment with various interest groups
4. Compare positions to constituent preferences
5. Avoid judgment or endorsement

${CITATION_RULES}

Help users make informed decisions based on facts.`,
    
    general: `You are a helpful civic engagement assistant. Answer questions about democracy, voting, legislation, and civic participation with accuracy and non-partisan neutrality. Help users understand how government works and how they can participate effectively.

${CITATION_RULES}`
};

/**
 * POST /api/civic/llm-chat
 * Send message to LLM and get response
 */
router.post('/llm-chat', async (req, res) => {
    console.log('🎯 [v37.4.5b] /api/civic/llm-chat ENDPOINT HIT!');
    console.log('🎯 [v37.4.5b] Request body:', JSON.stringify(req.body).substring(0, 200));
    
    try {
        const { message, context = 'general', conversationHistory = [] } = req.body;
        
        console.log('🔧 [v37.4.5b] /api/civic/llm-chat endpoint called');
        console.log(`   → Message: "${message?.substring(0, 50)}..."`);
        console.log(`   → Context type: ${typeof context}`);
        console.log(`   → Context value:`, context);
        console.log(`   → Conversation history length: ${conversationHistory.length}`);
        
        // Validate request
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a string'
            });
        }
        
        if (!GROQ_API_KEY) {
            console.error('❌ GROQ_API_KEY not configured in environment');
            return res.status(500).json({
                success: false,
                error: 'LLM service not configured. Please contact administrator.'
            });
        }
        
        // Get system prompt for context
        const systemPrompt = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.general;
        
        // =============================================================================
        // V37.4.5: PHASE 1 - Search for sources BEFORE calling LLM
        // This allows us to tell LLM exactly how many sources are available
        // =============================================================================
        let sources = [];
        
        try {
            console.log('🔍 [v37.4.5] Starting source pre-search...');
            // Pre-search for sources (lightweight check)
            sources = await searchAdditionalSources(message, '');
            console.log(`📚 [v37.4.5] Pre-search found ${sources.length} sources`);
            if (sources.length > 0) {
                console.log(`   → Source titles: ${sources.map(s => s.title?.substring(0, 30) + '...').join(', ')}`);
            }
        } catch (error) {
            console.error('⚠️ [v37.4.5] Source pre-search failed (non-fatal):', error.message);
            console.error('   → Stack:', error.stack);
            // Continue without sources - not a critical failure
        }
        
        // =============================================================================
        // V37.4.5: Build enriched message with source count
        // =============================================================================
        const sourceCount = sources.length;
        let enrichedMessage = message;
        
        if (sourceCount > 0) {
            enrichedMessage += `\n\n--- WEB SEARCH RESULTS (${sourceCount} sources found) ---\n`;
            sources.forEach((source, index) => {
                enrichedMessage += `${index + 1}. ${source.source || 'Source'}: "${source.title}"\n`;
                enrichedMessage += `   URL: ${source.url}\n`;
                if (source.excerpt) {
                    enrichedMessage += `   Excerpt: ${source.excerpt.substring(0, 150)}...\n`;
                }
                enrichedMessage += `\n`;
            });
            enrichedMessage += `\n⚠️ IMPORTANT: You have ${sourceCount} sources available.\n`;
            enrichedMessage += `Use citations [1] through [${sourceCount}] ONLY.\n`;
            enrichedMessage += `DO NOT use [${sourceCount + 1}] or higher - no source exists!\n`;
        } else {
            enrichedMessage += `\n\n--- NO WEB SEARCH RESULTS FOUND ---\n`;
            enrichedMessage += `⚠️ IMPORTANT: Do NOT use any citation numbers [1], [2], etc.\n`;
            enrichedMessage += `Present information from general knowledge without citations.\n`;
        }
        
        console.log(`📊 [v37.4.5] Source count: ${sourceCount} | Citations allowed: ${sourceCount > 0 ? `[1] through [${sourceCount}]` : 'NONE'}`);
        console.log(`📝 [v37.4.5] Enriched message preview: "${enrichedMessage.substring(0, 200)}..."`);
        
        // Build messages array with enriched message
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            {
                role: 'user',
                content: enrichedMessage
            }
        ];
        
        console.log(`🤖 LLM Chat request: "${message.substring(0, 50)}..." (context: ${context})`);
        
        // Call Groq API
        const groqResponse = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: messages,
                temperature: 0.3, // Low for factual accuracy
                max_tokens: 1000,
                stream: false
            })
        });
        
        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.error('❌ Groq API error:', groqResponse.status, errorText);
            throw new Error(`Groq API error: ${groqResponse.status}`);
        }
        
        const data = await groqResponse.json();
        const assistantMessage = data.choices[0].message.content;
        
        console.log(`✅ LLM response: "${assistantMessage.substring(0, 50)}..."`);
        
        // V37.4.5: Sources already found in Phase 1 (above), no need to search again
        
        console.log(`📤 [v37.4.5b] Sending response with ${sources.length} sources`);
        console.log(`📤 [v37.4.5b] Response preview: "${assistantMessage.substring(0, 100)}..."`);
        
        // Return response with sources
        res.json({
            success: true,
            message: assistantMessage,
            sources: sources, // NEW: Array of source objects
            context: context,
            model: MODEL,
            usage: data.usage
        });
        
    } catch (error) {
        console.error('Error in LLM chat:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process LLM request'
        });
    }
});

/**
 * GET /api/civic/llm-health
 * Check if LLM service is available
 */
router.get('/llm-health', (req, res) => {
    const hasApiKey = !!GROQ_API_KEY;
    
    res.json({
        success: true,
        available: hasApiKey,
        model: MODEL,
        provider: 'Groq',
        message: hasApiKey 
            ? 'LLM service is available' 
            : 'GROQ_API_KEY not configured'
    });
});

/**
 * POST /api/civic/llm-explain-bill
 * Specialized endpoint for bill explanations
 */
router.post('/llm-explain-bill', async (req, res) => {
    try {
        const { billTitle, billNumber, billSummary } = req.body;
        
        if (!billTitle) {
            return res.status(400).json({
                success: false,
                error: 'Bill title is required'
            });
        }
        
        const message = `Can you explain this bill to me in simple terms?

Title: ${billTitle}
Bill Number: ${billNumber || 'Unknown'}
Summary: ${billSummary || 'No summary available'}

What does this bill do? Who would it affect? What are the potential impacts?`;
        
        // Forward to main chat endpoint with bill context
        req.body = {
            message,
            context: 'billExplanation'
        };
        
        // Call the main chat handler
        return router.handle(req, res);
        
    } catch (error) {
        console.error('Error explaining bill:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/civic/llm-fact-check
 * Specialized endpoint for fact-checking explanations
 */
router.post('/llm-fact-check', async (req, res) => {
    try {
        const { claim, factCheckResults } = req.body;
        
        if (!claim) {
            return res.status(400).json({
                success: false,
                error: 'Claim is required'
            });
        }
        
        const sourceSummary = factCheckResults?.sources
            ? factCheckResults.sources.map(s => `- ${s.source}: "${s.title}"`).join('\n')
            : 'No sources provided';
        
        const message = `I'm trying to verify this claim: "${claim}"

${factCheckResults ? `
The fact-checkers found:
Status: ${factCheckResults.status}
Confidence: ${factCheckResults.confidence}%

Sources checked:
${sourceSummary}
` : ''}

Can you help me understand what this means in plain language? What should I know about this claim?`;
        
        // Forward to main chat endpoint with fact-checking context
        req.body = {
            message,
            context: 'factChecking'
        };
        
        // Call the main chat handler
        return router.handle(req, res);
        
    } catch (error) {
        console.error('Error in fact-check explanation:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// HELPER FUNCTIONS: SOURCE SEARCH
// =============================================================================

/**
 * Check if query needs current/real-time information
 */
function needsCurrentInfo(userMessage, llmResponse) {
    // Temporal indicators
    const temporalWords = ['2024', '2025', 'current', 'recent', 'latest', 'now', 'today', 'this year'];
    const hasTemporalIndicator = temporalWords.some(word => 
        userMessage.toLowerCase().includes(word) || 
        llmResponse.toLowerCase().includes(word)
    );
    
    // LLM admits not knowing or mentions knowledge cutoff
    const admitsUnknown = llmResponse.toLowerCase().match(
        /don't have|not available|cannot find|no information|as of my knowledge cutoff|i don't know|unable to provide/
    );
    
    // Campaign finance queries (always need current data)
    const isCampaignFinance = userMessage.toLowerCase().match(
        /donor|contribution|campaign finance|pac|funding|money|finance/
    );
    
    // Queries about specific current events
    const isCurrentEvent = userMessage.toLowerCase().match(
        /election|vote|bill|legislation|congress|senate|house/
    );
    
    return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent;
}

/**
 * Search DuckDuckGo for news articles
 * Rate limit: 2 seconds between requests (ethical)
 * Cache: 7 days (news updates regularly but not hourly)
 */
async function searchDuckDuckGo(query, maxResults = 3) {
    const cacheKey = `news_${query.toLowerCase().trim()}`;
    
    // Check cache (7-day expiry for news)
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
        console.log(`📰 Using cached news for: "${query}"`);
        return cached.sources;
    }
    
    const sources = [];
    
    try {
        console.log(`🔍 Searching news sources for: "${query}"`);
        
        // Search independent journalists first (priority)
        for (const source of NEWS_SOURCES.independent) {
            if (sources.length >= maxResults) break;
            
            try {
                // Add ethical delay (2 seconds between requests)
                if (sources.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
                const searchUrl = `https://duckduckgo.com/html/?q=site:${source.domain}+${encodeURIComponent(query)}`;
                
                const response = await axios.get(searchUrl, {
                    headers: {
                        'User-Agent': 'WorkforceDemocracyBot/1.0 (Educational; contact@workforcedemocracyproject.org)',
                        'Accept': 'text/html'
                    },
                    timeout: 5000
                });
                
                // Parse HTML for results
                const $ = cheerio.load(response.data);
                const results = $('.result');
                
                if (results.length > 0) {
                    const firstResult = results.first();
                    const title = firstResult.find('.result__title').text().trim();
                    const snippet = firstResult.find('.result__snippet').text().trim();
                    const link = firstResult.find('.result__url').attr('href');
                    
                    if (title && link) {
                        sources.push({
                            title: title || `${source.name} coverage of ${query}`,
                            url: link || `https://${source.domain}/search?q=${encodeURIComponent(query)}`,
                            source: source.name,
                            type: source.type,
                            excerpt: snippet || `Search results from ${source.name}`,
                            date: new Date().toISOString()
                        });
                        console.log(`  ✅ Found: ${source.name}`);
                    }
                }
            } catch (error) {
                console.log(`  ⚠️ ${source.name}: ${error.message}`);
            }
        }
        
        // If not enough sources, search fact-checkers
        if (sources.length < 2) {
            for (const source of NEWS_SOURCES.factCheckers.slice(0, 2)) {
                if (sources.length >= maxResults) break;
                
                try {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    sources.push({
                        title: `${source.name} on "${query}"`,
                        url: `https://${source.domain}/search?q=${encodeURIComponent(query)}`,
                        source: source.name,
                        type: source.type,
                        excerpt: `Fact-checking coverage from ${source.name}`,
                        date: new Date().toISOString()
                    });
                    console.log(`  ✅ Found: ${source.name}`);
                } catch (error) {
                    console.log(`  ⚠️ ${source.name}: ${error.message}`);
                }
            }
        }
        
        // Cache results for 7 days
        if (sources.length > 0) {
            newsCache.set(cacheKey, {
                sources: sources,
                timestamp: Date.now()
            });
            console.log(`💾 Cached ${sources.length} news sources`);
        }
        
    } catch (error) {
        console.error('❌ DuckDuckGo search error:', error.message);
    }
    
    return sources;
}

/**
 * Search OpenSecrets for campaign finance data
 * Rate limit: 5 seconds before request (ethical)
 * Cache: 90 days (OpenSecrets updates quarterly)
 */
async function searchCampaignFinance(query) {
    // Extract person name from query
    const nameMatch = query.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (!nameMatch) {
        console.log('💰 No person name found in finance query');
        return null;
    }
    
    const name = nameMatch[1];
    const cacheKey = `finance_${name.toLowerCase().trim()}`;
    
    // Check cache (90-day expiry - quarterly updates)
    const cached = financeCache.get(cacheKey);
    if (cached) {
        const ageInDays = Math.floor((Date.now() - cached.timestamp) / (24 * 60 * 60 * 1000));
        const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days
        
        if (Date.now() - cached.timestamp < maxAge) {
            console.log(`💰 Using cached finance data for ${name} (${ageInDays} days old, refreshes quarterly)`);
            return cached.data;
        } else {
            console.log(`💰 Cache expired for ${name} (${ageInDays} days old), refreshing...`);
        }
    }
    
    try {
        console.log(`💰 Searching OpenSecrets for: ${name}`);
        
        // Add ethical delay (5 seconds before request)
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const searchUrl = `https://www.opensecrets.org/search?q=${encodeURIComponent(name)}`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'WorkforceDemocracyBot/1.0 (Educational; contact@workforcedemocracyproject.org)',
                'Accept': 'text/html'
            },
            timeout: 10000
        });
        
        // Parse HTML for finance data
        const $ = cheerio.load(response.data);
        
        // Try to find politician profile link
        let profileUrl = searchUrl;
        const profileLink = $('a[href*="/members-of-congress/"]').first();
        if (profileLink.length > 0) {
            profileUrl = 'https://www.opensecrets.org' + profileLink.attr('href');
        }
        
        // Extract any summary text
        const summaryText = $('.search-results').first().text().trim() || 
                           `Campaign finance information for ${name}`;
        
        const result = {
            title: `Campaign Finance: ${name}`,
            url: profileUrl,
            source: 'OpenSecrets.org',
            type: 'finance',
            excerpt: summaryText.substring(0, 200),
            date: new Date().toISOString()
        };
        
        // Cache for 90 days (quarterly refresh cycle)
        financeCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        console.log(`  ✅ Found finance data for ${name}`);
        console.log(`  💾 Cached for 90 days (will refresh quarterly)`);
        
        return result;
        
    } catch (error) {
        console.error(`❌ OpenSecrets search error: ${error.message}`);
        return null;
    }
}

/**
 * Search for sources based on query context
 */
async function searchAdditionalSources(userMessage, llmResponse) {
    // Check if we need sources
    if (!needsCurrentInfo(userMessage, llmResponse)) {
        console.log('ℹ️ Query does not need current sources');
        return [];
    }
    
    const sources = [];
    
    try {
        // Determine if this is a finance query
        const isCampaignFinance = userMessage.toLowerCase().match(
            /donor|contribution|campaign finance|pac|funding/
        );
        
        // Search in parallel for speed
        const searchPromises = [];
        
        // Always search news
        searchPromises.push(searchDuckDuckGo(userMessage, 3));
        
        // Add finance search if relevant
        if (isCampaignFinance) {
            searchPromises.push(searchCampaignFinance(userMessage));
        }
        
        const results = await Promise.all(searchPromises);
        
        // Combine results
        const newsResults = results[0] || [];
        sources.push(...newsResults);
        
        if (isCampaignFinance && results[1]) {
            sources.push(results[1]);
        }
        
        console.log(`✅ Found ${sources.length} total sources`);
        
    } catch (error) {
        console.error('❌ Source search error:', error.message);
    }
    
    return sources;
}

// Cleanup old cache entries periodically
setInterval(() => {
    const now = Date.now();
    const newsMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const financeMaxAge = 90 * 24 * 60 * 60 * 1000; // 90 days (quarterly)
    let cleanedNews = 0;
    let cleanedFinance = 0;
    
    // Clean old news cache
    for (const [key, value] of newsCache.entries()) {
        if (now - value.timestamp > newsMaxAge) {
            newsCache.delete(key);
            cleanedNews++;
        }
    }
    
    // Clean old finance cache
    for (const [key, value] of financeCache.entries()) {
        if (now - value.timestamp > financeMaxAge) {
            financeCache.delete(key);
            cleanedFinance++;
        }
    }
    
    if (cleanedNews > 0 || cleanedFinance > 0) {
        console.log(`🧹 Cleaned ${cleanedNews} news, ${cleanedFinance} finance cache entries`);
    }
    
    console.log(`📊 Cache stats: ${newsCache.size} news (7d), ${financeCache.size} finance (90d)`);
}, 60 * 60 * 1000); // Every hour

console.log('✅ [v37.4.5b] llm-proxy.js module loaded successfully');
console.log('   → POST /api/civic/llm-chat endpoint registered');
console.log('   → Source counting enabled: Pre-search before LLM call');
console.log('   → Fake sources prevention: LLM forbidden from creating Sources section');

module.exports = router;
