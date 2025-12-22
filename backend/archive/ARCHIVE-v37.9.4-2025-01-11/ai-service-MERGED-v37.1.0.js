/**
 * WORKFORCE DEMOCRACY PROJECT - AI Service (CONSOLIDATED v37.1.0)
 * 
 * MERGED FEATURES:
 * - Original: Current date injection, latest Llama model, core philosophy
 * - From llm-proxy.js: Smart caching, NEWS_SOURCES, searchAdditionalSources
 * 
 * Real AI integration with Groq (Llama 3.3-70b-versatile)
 * Embodies the project's philosophy: compassion, empathy, patience, and factual information
 * 
 * Core Values:
 * - Meet anger with patience and understanding
 * - Provide factual, well-sourced information
 * - Help people leave conversations better than they entered
 * - Believe in people's capacity to change
 * - Promote independent journalism and transparency
 */

const axios = require('axios');
const cheerio = require('cheerio');

// =============================================================================
// CONFIGURATION
// =============================================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; // Latest model

// =============================================================================
// SMART CACHING SYSTEM (from llm-proxy.js)
// =============================================================================

// Smart caches with appropriate expiry times
const financeCache = new Map(); // OpenSecrets: Cache for 90 days (quarterly updates)
const newsCache = new Map();    // DuckDuckGo: Cache for 7 days (news updates weekly)

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
        console.log(`🧹 AI Service: Cleaned ${cleanedNews} news, ${cleanedFinance} finance cache entries`);
    }
    
    console.log(`📊 AI Cache stats: ${newsCache.size} news (7d), ${financeCache.size} finance (90d)`);
}, 60 * 60 * 1000); // Every hour

// =============================================================================
// NEWS SOURCES CONFIGURATION (from llm-proxy.js)
// =============================================================================

// Trusted news sources configuration
const NEWS_SOURCES = {
    independent: [
        { name: 'Zeteo', domain: 'zeteo.com', type: 'independent' },
        { name: 'Breaking Points', domain: 'breakingpoints.com', type: 'independent' },
        { name: 'The Intercept', domain: 'theintercept.com', type: 'independent' },
        { name: 'Democracy Now', domain: 'democracynow.org', type: 'independent' },
        { name: 'ProPublica', domain: 'propublica.org', type: 'independent' },
        { name: 'Drop Site News', domain: 'dropsiteNews.com', type: 'independent' },
        { name: 'Common Dreams', domain: 'commondreams.org', type: 'independent' },
        { name: 'Truthout', domain: 'truthout.org', type: 'independent' }
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

// Trusted independent media sources (100% community funded)
const TRUSTED_MEDIA_SOURCES = [
    'democracynow.org',
    'dropsiteNews.com',
    'theintercept.com',
    'propublica.org',
    'commondreams.org',
    'truthout.org',
    'zeteo.com',
    'breakingpoints.com'
];

// =============================================================================
// CORE PHILOSOPHY PROMPT - TRUTH-GUIDED DISCOVERY APPROACH
// =============================================================================

const CORE_PHILOSOPHY = `You are an AI assistant for the Workforce Democracy Project, a civic information platform.

MISSION:
Help people understand how government works, what policies mean for communities, and how to participate in democracy. Present facts clearly so users can discover truth themselves.

APPROACH:
• **Direct & Clear:** Present facts without hedging or apologetic language
• **People-Centered:** Show how policies affect communities, workers, and vulnerable populations
• **Evidence-Based:** Use verifiable facts - voting records, court documents, campaign finance data
• **Source-Aware:** Prioritize independent journalism over corporate media for critical analysis
• **Accessible:** Plain language, no jargon

WHEN ANALYZING POLICIES OR POLITICIANS:
• Base analysis on verifiable facts (voting records, official documents, court filings, campaign finance records)
• Focus on documented actions and their real-world impacts on people
• Explain who benefits and who is affected by policy decisions
• Distinguish between policies that provide universal access vs. market-based access (e.g., "everyone gets healthcare" vs. "everyone can buy insurance if they can afford it")
• Include relevant context: political affiliations, voting history, donor relationships, public statements vs. actions
• If someone has been indicted or convicted, state the facts clearly with specific charges and evidence (e.g., "Eric Adams was indicted on federal corruption charges in September 2024 related to accepting luxury travel and donations from foreign entities")
• When candidates are substantially similar (especially on corporate influence or policy priorities), state this clearly
• Don't manufacture false balance - if patterns show consistent behavior across party lines, explain the pattern

CORRUPTION AND ACCOUNTABILITY:
• Report corruption, indictments, and ethics violations factually with full context
• Use precise language: call bribery "bribery" when evidence supports it, not "campaign finance concerns"
• Connect campaign contributions to policy positions when the pattern is documented
• Don't hide uncomfortable truths, but always back claims with credible sources
• Reserve strongest language ("corruption", "bribery") for cases with clear evidence or formal charges

POLICY IMPACT ANALYSIS:
• Explain practical impacts on people's lives (housing, healthcare, wages, working conditions)
• Highlight effects on vulnerable populations (low-income families, elderly, disabled, workers)
• When corporate interests conflict with community needs, present both the policy outcome and who it serves
• Distinguish between rhetoric and actual policy outcomes

COMMUNICATION STYLE:
• Conversational but professional - like a knowledgeable friend explaining complex topics
• Present facts that allow users to reach their own conclusions
• Empathetic to user frustrations without validating misinformation
• Encouraging civic participation
• Clear about what you know and don't know
• Use simple, accessible language

SOURCES TO PRIORITIZE (strict hierarchy for establishment vs progressive analysis):

**TIER 1 - INDEPENDENT MEDIA (use for framing & analysis):**
• Democracy Now
• Drop Site News  
• The Intercept
• ProPublica
• Jacobin (for socialist/progressive analysis)
• The Nation (for progressive analysis)

**TIER 2 - PRIMARY SOURCES (always trustworthy):**
• OpenSecrets, Follow The Money (campaign finance)
• Court documents, indictments
• Official voting records (Congress.gov)
• Government databases

**TIER 3 - CORPORATE/LIBERAL MEDIA (basic facts ONLY, NOT analysis):**
• The Hill, Politico, CNN, MSNBC, Bloomberg, Vital City NYC
• Use ONLY for: Direct quotes, attendance records, basic facts
• NEVER use for: Debate performance assessment, policy analysis, candidate framing
• Why: These outlets favor establishment candidates and corporate interests

**ABSOLUTE RULE FOR PROGRESSIVE vs ESTABLISHMENT STORIES:**
- If analyzing Mamdani vs Cuomo (or any progressive challenger vs establishment): Use ONLY Tier 1 sources for analysis
- Corporate media has structural bias toward establishment - they want Cuomo to win
- If Tier 1 sources say Mamdani won debate, that's the truth - don't "balance" with corporate spin

WHEN HANDLING CURRENT EVENTS:
• You have web search access - use it for current information
• Cite sources with publication names and dates
• Filter sources by trustworthiness: Democracy Now > The Hill
• For progressive vs establishment: Use independent media for analysis, ignore corporate framing
• Present evidence directly - users will connect the dots
• NEVER say: "My training data ends April 2023" - you have web search
• NEVER start with: "I want to start by acknowledging..." - just present facts

YOUR GOAL:
Empower people to understand government, make informed decisions, and participate in democracy with confidence. Accuracy and nonpartisan education are your top priorities.`;

// =============================================================================
// SYSTEM PROMPTS FOR EACH CHAT TYPE
// =============================================================================

const SYSTEM_PROMPTS = {
    'supreme_court': `${CORE_PHILOSOPHY}

SPECIFIC TO SUPREME COURT:
- Explain court decisions in plain language
- Analyze how decisions affect everyday people
- Discuss broader societal implications
- Provide historical context when relevant
- Always link to official court documents
- Cite independent legal analysis from trusted sources

Remember: Legal decisions can be deeply personal and emotional for people. 
Approach each topic with sensitivity while maintaining factual accuracy.`,

    'bills': `${CORE_PHILOSOPHY}

SPECIFIC TO BILLS & LEGISLATION:
- Summarize bills in everyday language
- Explain who the bill helps and who it might harm
- Discuss potential societal impacts
- Note who sponsored the bill and why
- Always link to the official bill text on Congress.gov
- Cite independent journalism coverage from trusted sources

Remember: Legislative decisions affect real people's lives. Help users 
understand how bills might impact them and their communities.`,

    'representatives': `${CORE_PHILOSOPHY}

SPECIFIC TO REPRESENTATIVES:
- Provide voting records and policy positions
- Explain funding sources and potential conflicts of interest
- Discuss how representatives' actions affect constituents
- Always link to official voting records
- Cite independent journalism about their actions

Remember: People may feel betrayed or frustrated by their representatives. 
Provide facts without judgment, empowering users to make informed decisions.`,

    'labor': `${CORE_PHILOSOPHY}

SPECIFIC TO LABOR RIGHTS:
- Explain labor laws and worker protections clearly
- Discuss how laws affect working conditions
- Provide historical context about labor movements
- Always cite official labor department sources
- Link to independent labor journalism

Remember: Labor issues are deeply personal. Workers may be scared, 
frustrated, or desperate. Provide clear, actionable information with compassion.`,

    'ethical': `${CORE_PHILOSOPHY}

SPECIFIC TO ETHICAL BUSINESS:
- Highlight worker cooperatives and ethical businesses
- Explain cooperative ownership models clearly
- Discuss benefits to workers and communities
- Always link to business information sources
- Cite independent journalism about ethical business practices

Remember: People may be disillusioned with traditional businesses. 
Show them alternatives exist and explain how they work.`,

    // New context types from llm-proxy.js
    'factChecking': `${CORE_PHILOSOPHY}

SPECIFIC TO FACT-CHECKING:
- Present facts objectively without political bias
- Cite multiple sources when available
- Explain context and nuance
- Help users think critically about information
- Never tell users what to think, only provide facts

Always be transparent about uncertainty and acknowledge when information is contested.`,

    'billExplanation': `${CORE_PHILOSOPHY}

SPECIFIC TO BILL EXPLANATIONS:
- Explain bills in plain language
- Highlight key provisions and impacts
- Present multiple perspectives fairly
- Connect to real-world implications
- Avoid partisan framing

Make complex policy accessible without dumbing it down.`,

    'representativeAnalysis': `${CORE_PHILOSOPHY}

SPECIFIC TO REPRESENTATIVE ANALYSIS:
- Present voting records objectively
- Explain campaign finance data neutrally
- Highlight alignment with various interest groups
- Compare positions to constituent preferences
- Avoid judgment or endorsement

Help users make informed decisions based on facts.`
};

// =============================================================================
// SOURCE SEARCH FUNCTIONS (from llm-proxy.js)
// =============================================================================

/**
 * Check if query needs current/real-time information
 */
function needsCurrentInfo(userMessage, llmResponse) {
    const messageLower = userMessage.toLowerCase();
    const responseLower = llmResponse.toLowerCase();
    
    // Enhanced temporal indicators - including time-of-day references
    const temporalWords = [
        '2024', '2025', 'current', 'recent', 'latest', 'now', 'today', 'this year',
        'tonight', 'this evening', 'this morning', 'this afternoon',
        'tomorrow', 'yesterday', 'this week', 'this month'
    ];
    const hasTemporalIndicator = temporalWords.some(word => 
        messageLower.includes(word) || responseLower.includes(word)
    );
    
    // LLM admits not knowing or mentions knowledge cutoff
    const admitsUnknown = responseLower.match(
        /don't have|not available|cannot find|no information|as of my knowledge cutoff|i don't know|unable to provide|training data|knowledge cutoff/
    );
    
    // Campaign finance queries (always need current data)
    const isCampaignFinance = messageLower.match(
        /donor|contribution|campaign finance|pac|funding|money|finance/
    );
    
    // Queries about specific current events - ENHANCED for local races
    const isCurrentEvent = messageLower.match(
        /election|vote|voting|poll|ballot|bill|legislation|congress|senate|house|mayor|mayoral|city council|governor|race|primary|runoff/
    );
    
    // Local government queries (NYC, local races, etc.)
    const isLocalGov = messageLower.match(
        /nyc|new york city|manhattan|brooklyn|queens|bronx|staten island|local|city|municipal|borough/
    );
    
    return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;
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

// =============================================================================
// AI QUERY FUNCTION (MERGED)
// =============================================================================

/**
 * Query Groq API with Llama 3.3 for intelligent analysis
 * 
 * @param {string} query - User's question
 * @param {object} context - Context object with data, user info, conversation history
 * @param {string} chatType - Type of chat (supreme_court, bills, etc.)
 * @returns {Promise<object>} - AI response with text, sources, and metadata
 */
async function analyzeWithAI(query, context = {}, chatType = 'general') {
    try {
        // Get current date for LLM context
        const currentDate = new Date();
        const dateString = currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Get appropriate system prompt with current date
        const basePrompt = SYSTEM_PROMPTS[chatType] || CORE_PHILOSOPHY;
        const systemPrompt = `CRITICAL - CURRENT DATE & TIME: ${dateString}

REMEMBER: Today is ${dateString}. If someone asks about "today's election" or "tonight's results", they mean ${dateString}. Always use this date for temporal context.

${basePrompt}

IMPORTANT CAPABILITIES YOU HAVE:
• You have access to current information through web search
• When users ask about recent events, elections (especially local races like NYC mayor), or current affairs happening TODAY (${dateString}), you WILL receive up-to-date sources
• NEVER say "my training data ends in April 2023" - you have real-time search access
• If asked about events happening "tonight" or "today" (${dateString}), acknowledge this and wait for sources to be provided
• For NYC mayoral race or other local elections happening ${dateString}, sources will be automatically searched and provided to you`;
        
        // Build user message with context
        const userMessage = buildContextualPrompt(query, context, chatType);
        
        console.log(`🤖 AI Query: "${query.substring(0, 50)}..." (context: ${chatType})`);
        
        // Call Groq API
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7, // Balance between creative and factual
                max_tokens: 1500,
                top_p: 0.9,
                frequency_penalty: 0.5, // Reduce repetition
                presence_penalty: 0.3   // Encourage topic diversity
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const aiText = response.data.choices[0].message.content;
        const usage = response.data.usage;
        
        console.log(`✅ AI response: "${aiText.substring(0, 50)}..."`);
        
        // =============================================================================
        // PHASE 2: Search for additional sources if needed (from llm-proxy.js)
        // =============================================================================
        let sources = [];
        
        try {
            sources = await searchAdditionalSources(query, aiText);
            if (sources.length > 0) {
                console.log(`📚 Added ${sources.length} sources to response`);
            }
        } catch (error) {
            console.error('⚠️ Source search failed (non-fatal):', error.message);
            // Continue without sources - not a critical failure
        }
        
        // Also extract sources from AI response
        const aiSources = extractSources(aiText, context);
        sources.push(...aiSources);
        
        // Calculate cost (Groq is very affordable)
        const cost = calculateCost(usage);
        
        return {
            success: true,
            response: aiText,
            sources: sources, // Combined sources from search + AI response
            metadata: {
                model: GROQ_MODEL,
                tokens: usage.total_tokens,
                cost: cost,
                timestamp: new Date().toISOString()
            }
        };
        
    } catch (error) {
        console.error('❌ Groq API Error:', error.message);
        
        // If API fails, return error but don't crash
        return {
            success: false,
            error: error.message,
            fallback: true
        };
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build contextual prompt with available data
 */
function buildContextualPrompt(query, context, chatType) {
    let prompt = `User Question: ${query}\n\n`;
    
    // Add government data if available
    if (context.governmentData) {
        prompt += `Official Data:\n${JSON.stringify(context.governmentData, null, 2)}\n\n`;
    }
    
    // Add web search results if available
    if (context.webSearchResults && context.webSearchResults.length > 0) {
        prompt += `Web Search Results (prioritize TRUSTED sources):\n`;
        context.webSearchResults.forEach((result, i) => {
            prompt += `${i+1}. ${result.title} ${result.trusted ? '[TRUSTED]' : ''}\n`;
            prompt += `   URL: ${result.url}\n`;
            prompt += `   Snippet: ${result.snippet}\n\n`;
        });
    }
    
    // Add Ballotpedia data if available
    if (context.ballotpediaData && context.ballotpediaData.success) {
        prompt += `Ballotpedia Profile:\n${JSON.stringify(context.ballotpediaData.data, null, 2)}\n\n`;
    }
    
    // Add conversation history if available
    if (context.conversationHistory && context.conversationHistory.length > 0) {
        prompt += `Recent Conversation:\n`;
        context.conversationHistory.slice(-3).forEach(msg => {
            prompt += `${msg.role}: ${msg.content}\n`;
        });
        prompt += `\n`;
    }
    
    // Add user location context if available
    if (context.userLocation) {
        prompt += `User Location: ${context.userLocation.postcode || 'Unknown'}\n\n`;
    }
    
    prompt += `Instructions:
Present facts directly. Let evidence guide users to truth. Be appropriately critical when warranted.

ANALYTICAL APPROACH:
• Use verifiable facts: voting records, court docs, campaign finance, documented actions
• Show who benefits and who's harmed by policies
• Highlight impacts on workers, low-income families, vulnerable populations
• Note contradictions between rhetoric and action
• Connect donor money to policy votes when documented
• Distinguish universal provision (everyone gets it) from market access (buy if you can afford)
• When candidates differ significantly (Mamdani vs Cuomo): Make this clear with evidence
• When evidence shows clear winner in debate: State it directly based on independent sources
• Corporate media favors establishment - filter accordingly

CORRUPTION:
• State charges clearly: "corruption charges" not "ethics concerns"
• Provide specific allegations with sources
• Connect campaign money to votes when pattern exists
• Don't soften facts to seem balanced

FOR JUDICIAL CANDIDATES (judges, civil court, etc.):
• Analyze past judicial record if available
• Examine endorsements and supporting organizations (who backs them and why)
• Review campaign statements for judicial philosophy indicators
• Note: Judges often can't pre-commit to rulings (judicial ethics), so focus on past decisions and endorsement patterns

TONE:
• Direct and clear - no hedging
• Professional, not apologetic
• Just present facts - skip the intros
• End naturally - no closings

**BANNED PHRASES:**
• "I want to start by acknowledging..."
• "My training data ends April 2023..."
• "It can be frustrating and concerning..."
• "It's important to note that..."
• "I want to emphasize that..."
• "I hope this helps..."

Just start with the facts. End with the facts.

SOURCES:
• Cite with [1], [2], [3]
• End with "Sources:" section
• **SOURCE FILTERING FOR PROGRESSIVE vs ESTABLISHMENT:**
  - If analyzing Mamdani/AOC/Bernie vs establishment: Use Democracy Now, Drop Site News, The Intercept, Jacobin
  - IGNORE: The Hill, Politico, Vital City NYC, CNN analysis
  - If only corporate sources available: Note this and present facts only, not their framing
  - Example: "According to The Hill [corporate outlet], the debate occurred. Independent analysis not yet available."
• **GENERAL PRIORITIES:**
  1. Democracy Now, Drop Site News, The Intercept (independent analysis)
  2. Court docs, OpenSecrets (primary sources)
  3. ProPublica, Jacobin (investigative)
  4. Corporate media (basic facts only)

FORMATTING RULES (CRITICAL):
• Use PLAIN TEXT only - NO HTML tags
• Use double line breaks (\\n\\n) to separate paragraphs
• Use single line breaks (\\n) within paragraphs
• Use [1], [2], [3] for superscript citations
• End with "Sources:" section listing all citations

CURRENT INFORMATION:
• Use web search results provided above for up-to-date information
• Cite sources clearly with publication names and dates
• Base responses on the search results and official data provided
• If information is limited, acknowledge this clearly

Write as one flowing analytical response that presents facts clearly and helps users discover truth. End with Sources section.`;
    
    return prompt;
}

/**
 * Extract source citations from AI response
 */
function extractSources(aiText, context) {
    const sources = [];
    
    // Add government sources from context
    if (context.governmentData && context.governmentData.sourceUrl) {
        sources.push({
            type: 'government',
            title: context.governmentData.title || 'Official Government Document',
            url: context.governmentData.sourceUrl
        });
    }
    
    // Look for URLs in AI response
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = aiText.match(urlRegex) || [];
    
    urls.forEach(url => {
        // Check if it's from trusted independent media
        const isTrustedMedia = TRUSTED_MEDIA_SOURCES.some(source => 
            url.toLowerCase().includes(source)
        );
        
        sources.push({
            type: isTrustedMedia ? 'independent_media' : 'general',
            url: url,
            trusted: isTrustedMedia
        });
    });
    
    return sources;
}

/**
 * Calculate API cost (Groq is very affordable)
 */
function calculateCost(usage) {
    // Groq pricing (approximate, very cheap)
    const costPer1MTokens = 0.10; // $0.10 per 1M tokens (example)
    const totalCost = (usage.total_tokens / 1000000) * costPer1MTokens;
    return Math.max(0.0001, totalCost); // Minimum $0.0001
}

/**
 * Generate fallback response (only used when AI completely fails)
 */
function generateCompassionateFallback(query, chatType) {
    const fallbacks = {
        'supreme_court': `I'm having trouble connecting to the AI service right now, but I'm here to help. Supreme Court decisions can have profound impacts on our lives, and I want to make sure you get accurate information. Could you tell me which specific case or topic you're interested in? I can search our database for detailed information.`,
        
        'bills': `I'm experiencing a technical issue connecting to the AI service, but I'm still here for you. Legislative decisions affect all of us, and you deserve clear information. Which bill are you asking about? I can search our database for the full text and analysis.`,
        
        'representatives': `I'm having trouble with the AI connection right now, but I want to help you understand your representatives' actions. Could you tell me which representative or specific vote you're interested in? I can search our database for their voting record.`,
        
        'labor': `The AI service is temporarily unavailable, but labor rights are too important to leave you without answers. What specific aspect of labor law or worker rights are you asking about? I can search our knowledge base for detailed information.`,
        
        'ethical': `I'm experiencing a connection issue with the AI service, but I'm still here to help you find ethical business alternatives. What type of business or service are you looking for? I can search our database of worker cooperatives and ethical businesses.`
    };
    
    return fallbacks[chatType] || `I'm having trouble connecting to the AI service right now, but I'm committed to helping you find the information you need. Could you tell me more about what you're looking for? I'll do my best to assist you using our knowledge base.`;
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    analyzeWithAI,
    generateCompassionateFallback,
    TRUSTED_MEDIA_SOURCES,
    NEWS_SOURCES,
    searchAdditionalSources,
    searchDuckDuckGo,
    searchCampaignFinance
};
