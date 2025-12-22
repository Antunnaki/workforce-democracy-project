/**
 * WORKFORCE DEMOCRACY PROJECT - AI Service (CONSOLIDATED v37.19.6)
 * 
 * MERGED FEATURES:
 * - Original: Current date injection, latest Llama model, core philosophy
 * - From llm-proxy.js: Smart caching, NEWS_SOURCES, searchAdditionalSources
 * - v37.5.0: Pre-search sources BEFORE LLM call to fix citation mismatches
 * - v37.9.4: Policy research patterns, SOURCE_THRESHOLD = 25
 * - v37.9.6: Hallucination prevention (explicit citation limits + post-processing filter)
 * - v37.9.13: Fixed duplicate source injection + relevance filtering
 * - v37.9.14: OPTION A - Enhanced deduplication (removes duplicate citations like [4][4][4])
 * - v37.18.12: CHAT FORMATTING FIX - Lower relevance threshold (30→15), no fake sources, clean punctuation
 * - v37.19.0: MongoDB article archive for instant historical searches (pre-indexing system)
 * - v37.19.1: CITATION FIX - Enforce citing ALL sources (prompt was disabling citations, now fixed)
 * - v37.19.2: SMART RELEVANCE SCORING - Title match high, mention-only low; cite only relevant sources
 * - v37.19.3: ANTI-HALLUCINATION - Strict rules against inventing facts/dates/positions; MIN_RELEVANCE 40→50
 * - v37.19.4: CITATION VERIFICATION - Verify EVERY citation; snippet must mention person/topic; MIN_RELEVANCE 50→60
 * - v37.19.5: PERSON-NAME BONUS + ANTI-CONTRADICTION - Name bonus scoring; forbid self-contradictory citations
 * - v37.19.6: PROMPT OPTIMIZATION - Condensed anti-contradiction rules to fix 413 Payload Too Large error
 * - v37.19.7: COMPREHENSIVE POLICY SCRAPING - Limit 50→100 articles; all reps/candidates; state+local; trusted sources
 * - v37.19.8: DUCKDUCKGO FALLBACK + AUTO-INDEXING - Fallback when <10 sources; auto-index results; detailed analysis prompt
 * 
 * 🚨 CRITICAL: Real AI integration with Alibaba Cloud Qwen 2.5 (NOT US big tech)
 * Embodies the project's philosophy: compassion, empathy, patience, and factual information
 * 
 * Core Values:
 * - Meet anger with patience and understanding
 * - Provide factual, well-sourced information
 * - Help people leave conversations better than they entered
 * - Believe in people's capacity to change
 * - Promote independent journalism and transparency
 */

console.log('🚀🚀🚀 AI-SERVICE.JS v37.19.8 LOADED - DUCKDUCKGO FALLBACK + AUTO-INDEXING + DETAILED ANALYSIS 🚀🚀🚀');
console.log('🤖 AI MODEL: Alibaba Cloud Qwen 2.5-72B (NOT US big tech Llama/GPT)');
console.log('📅 File loaded at:', new Date().toISOString());
console.log('✨ Features: Pre-indexed article database + Fast local search (<1s vs 160s DuckDuckGo)');
console.log('🎯 v37.18.17 FIX: Extract individual words (Mamdani) not phrases (What Are Mamdani)');
console.log('📊 Now correctly handles ALL CAPS → extracts proper nouns only');
console.log('🗄️  v37.19.0: MongoDB article archive for instant historical searches');
console.log('🔗 v37.19.1: CITATION FIX - Enforce citing ALL sources (was disabled, now fixed)');
console.log('🎯 v37.19.2: SMART RELEVANCE - Title match=high, mention only=low, cite only relevant');
console.log('🛡️  v37.19.3: ANTI-HALLUCINATION - No inventing facts/dates/positions; MIN_RELEVANCE 40→50');
console.log('✅ v37.19.4: CITATION VERIFICATION - Snippet must mention person/topic; MIN_RELEVANCE 50→60');
console.log('🎯 v37.19.5: PERSON-NAME BONUS - Name in title +200, excerpt +100; forbid self-contradictions');
console.log('⚙️  v37.19.6: PROMPT OPTIMIZED - Condensed rules to fix 413 Payload Too Large error');
console.log('🌍 v37.19.7: COMPREHENSIVE POLICY SCRAPING - Limit 50→100; all reps/candidates; state+local; trusted investigative sources');
console.log('🦆 v37.19.8: DUCKDUCKGO FALLBACK - Auto-activates if <10 sources; auto-indexes results; organically grows database');
console.log('📝 v37.19.8: DETAILED ANALYSIS PROMPT - Extract specific numbers/quotes/mechanisms; no weak endings');

const axios = require('axios');
const cheerio = require('cheerio');

// V37.3.0: Global RSS & News API service
const rssService = require('./rss-service');

// V37.18.24: Article scraper for full content (was missing!)
const { scrapeMultipleArticles } = require('./article-scraper');

// V37.19.0: Local article search service (replaces DuckDuckGo)
const articleSearchService = require('./services/article-search-service');

// V37.4.1: Citation validator REMOVED - user wants ALL sources shown
// const citationValidator = require('./citation-validator-v37.4.0');

// =============================================================================
// CONFIGURATION
// =============================================================================

// 🚨 CRITICAL: Use Alibaba Cloud Qwen (NOT Groq/Llama - US big tech)
// Policy: Avoid all US big tech AI providers (Meta, OpenAI, Google, Anthropic)
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Variable name kept for backward compatibility
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'qwen2.5-72b-instruct'; // Alibaba Cloud Qwen - NEVER use llama models

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
• **START DIRECTLY WITH THE ANSWER** - No meta-commentary about your process

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
• NEVER say: "To answer your question, I need to..." - just answer
• START with facts immediately - first sentence should be the answer

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

🎯 CRITICAL ANALYSIS REQUIREMENT (v37.18.8):
ALWAYS include a "Key Contradictions" section for politicians:
- Highlight voting record inconsistencies vs. public statements
- Compare campaign promises vs. actual votes on specific bills
- Note conflicts between constituent interests and donor alignment
- Use specific bills/votes as evidence (cite actual bill numbers/dates)
- Example format: "Voted for Bill X (benefiting corporations) while publicly advocating for workers in Bill Y"
- Connect campaign finance to voting patterns where documented
- Show gaps between rhetoric and legislative action

🔍 DETAILED POLICY EXTRACTION (v37.19.8):
EXTRACT SPECIFIC DETAILS FROM EVERY SOURCE:
- ❌ Generic: "Mamdani supports affordability"
- ✅ Specific: "Mamdani's affordability agenda includes expanding rent control [1] and implementing a 'pied-à-terre' tax on luxury real estate [2]"

- ❌ Vague: "addressing housing costs"
- ✅ Specific: "building 25,000 units of public housing over 5 years [1]"

- ❌ Superficial: "focuses on economic justice"
- ✅ Detailed: "proposes a marginal tax rate of 75% on incomes over $1 million [2] and mandatory employee ownership stakes in companies over 100 workers [3]"

REQUIREMENTS FOR EVERY POLICY ANALYSIS:
1. Extract EXACT proposals (numbers, timelines, specifics)
2. Quote key phrases directly from sources
3. Explain HOW policies would work
4. Identify WHO is affected
5. Note implementation timeline if mentioned

NEVER USE WEAK ENDINGS:
❌ "For deeper analysis of specific proposals, direct references to his voting record or legislative actions would be necessary."
❌ "More information would be needed to provide a comprehensive analysis."
❌ "Additional sources would help clarify..."

INSTEAD, WORK WITH WHAT YOU HAVE:
✅ "Based on available sources, [candidate]'s platform prioritizes [specific policy 1], [specific policy 2], and [specific policy 3]."
✅ "The provided sources highlight [specific details]. While additional legislative details weren't available in these sources, [candidate]'s public statements emphasize [specific quote]."

SPECIFICITY CHECKLIST - For each policy mentioned, ask:
☐ Did I include exact numbers/percentages/timelines?
☐ Did I explain HOW it would work (mechanism)?
☐ Did I identify WHO benefits/pays?
☐ Did I use direct quotes when possible?
☐ Did I avoid generic terms like "affordability" without specifics?

Help users make informed decisions based on facts and documented contradictions.`
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
    
    // Queries about specific current events - ENHANCED for local races + constitutional questions
    const isCurrentEvent = messageLower.match(
        /election|vote|voting|poll|ballot|bill|legislation|congress|senate|house|mayor|mayoral|city council|governor|race|primary|runoff|amendment|constitution|constitutional|repeal|repealed|supreme court|scotus|ruling|decision|right|rights/
    );
    
    // Local government queries (NYC, local races, etc.)
    const isLocalGov = messageLower.match(
        /nyc|new york city|manhattan|brooklyn|queens|bronx|staten island|local|city|municipal|borough/
    );
    
    // v37.8.2 FIX: Political figures and general political queries (Nov 9, 2025)
    // Trigger source search for politicians, political topics, and policy questions
    // v37.18.14: Added more NYC/progressive politicians (Mamdani, Bowman, AOC, etc.)
    const isPoliticalQuery = messageLower.match(
        /mamdani|zohran|bowman|jamaal|bernie sanders|aoc|ocasio-cortez|lindsey graham|biden|trump|pelosi|mcconnell|schumer|harris|senator|representative|congressman|congresswoman|politician|political|policy|policies|welfare|healthcare|medicare|medicaid|social security|snap|food stamps|climate|environment|labor|union|workers|immigration|border|tax|taxes|wealthy|rich|corporation|corporate|war|military|foreign policy|middle east|ukraine|israel|palestine|china|russia|candidate|progressive|establishment/
    );
    
    return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov || isPoliticalQuery;
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
                // V37.18.33: Increased delay (2s → 5s) to avoid DuckDuckGo rate limits
                if (sources.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                
                const searchUrl = `https://duckduckgo.com/html/?q=site:${source.domain}+${encodeURIComponent(query)}`;
                
                // V37.18.33: Increased timeout (5s → 15s) - DuckDuckGo can be slow
                const response = await axios.get(searchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; WorkforceDemocracyBot/1.0; +https://workforcedemocracy.org)',
                        'Accept': 'text/html',
                        'Accept-Language': 'en-US,en;q=0.9'
                    },
                    timeout: 15000
                });
                
                // Parse HTML for results
                const $ = cheerio.load(response.data);
                const results = $('.result');
                
                if (results.length > 0) {
                    const firstResult = results.first();
                    const title = firstResult.find('.result__title').text().trim();
                    const snippet = firstResult.find('.result__snippet').text().trim();
                    const link = firstResult.find('.result__url').attr('href');
                    
                    // CRITICAL FIX: Only add if we have a REAL article URL (not a search page)
                    if (title && link && !link.includes('/search?q=')) {
                        sources.push({
                            title: title,
                            url: link,
                            source: source.name,
                            type: source.type,
                            excerpt: snippet || `Article from ${source.name}`,
                            date: new Date().toISOString()
                        });
                        console.log(`  ✅ Found: ${source.name} - ${link}`);
                    } else {
                        console.log(`  ⚠️ ${source.name}: Skipped search page or invalid link`);
                    }
                }
            } catch (error) {
                console.log(`  ⚠️ ${source.name}: ${error.message}`);
            }
        }
        
        // If not enough sources, search fact-checkers (with REAL scraping, not search pages)
        if (sources.length < 2) {
            for (const source of NEWS_SOURCES.factCheckers.slice(0, 2)) {
                if (sources.length >= maxResults) break;
                
                try {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    // CRITICAL FIX: Actually scrape fact-checker articles, don't just link to search
                    const searchUrl = `https://duckduckgo.com/html/?q=site:${source.domain}+${encodeURIComponent(query)}`;
                    
                    const response = await axios.get(searchUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible; WorkforceDemocracyBot/1.0; +https://workforcedemocracy.org)',
                            'Accept': 'text/html',
                            'Accept-Language': 'en-US,en;q=0.9'
                        },
                        timeout: 15000
                    });
                    
                    const $ = cheerio.load(response.data);
                    const results = $('.result');
                    
                    if (results.length > 0) {
                        const firstResult = results.first();
                        const title = firstResult.find('.result__title').text().trim();
                        const snippet = firstResult.find('.result__snippet').text().trim();
                        const link = firstResult.find('.result__url').attr('href');
                        
                        // Only add if we have a REAL article URL
                        if (title && link && !link.includes('/search?q=')) {
                            sources.push({
                                title: title,
                                url: link,
                                source: source.name,
                                type: source.type,
                                excerpt: snippet || `Fact-check from ${source.name}`,
                                date: new Date().toISOString()
                            });
                            console.log(`  ✅ Found: ${source.name} - ${link}`);
                        } else {
                            console.log(`  ⚠️ ${source.name}: Skipped - no valid article found`);
                        }
                    } else {
                        console.log(`  ⚠️ ${source.name}: No results found`);
                    }
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
 * V37.2.0: Search Wikipedia for candidate information
 * Wikimedia Foundation - non-profit, NOT Big Tech
 * Rate limit: Respectful (1 request per candidate query)
 * Cache: 30 days (candidate info relatively stable)
 */
async function searchWikipedia(candidateName) {
    const cacheKey = `wikipedia_${candidateName.toLowerCase().trim()}`;
    
    // Check cache (30-day expiry)
    const cached = newsCache.get(cacheKey);
    if (cached) {
        const ageInDays = Math.floor((Date.now() - cached.timestamp) / (24 * 60 * 60 * 1000));
        if (Date.now() - cached.timestamp < 30 * 24 * 60 * 60 * 1000) {
            console.log(`📖 Using cached Wikipedia data for ${candidateName} (${ageInDays} days old)`);
            return cached.data;
        }
    }
    
    try {
        console.log(`📖 Searching Wikipedia for: ${candidateName}`);
        
        const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidateName)}`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'WorkforceDemocracyBot/1.0 (Educational; contact@workforcedemocracyproject.org)',
                'Accept': 'application/json'
            },
            timeout: 10000
        });
        
        // Only return if it's a real article (not disambiguation or missing)
        if (response.data.type === 'standard') {
            const result = {
                title: response.data.title,
                url: response.data.content_urls.desktop.page,
                source: 'Wikipedia',
                type: 'candidate_profile',
                excerpt: response.data.extract,
                date: new Date().toISOString()
            };
            
            // Cache for 30 days
            newsCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            console.log(`  ✅ Found Wikipedia article: ${response.data.title}`);
            return result;
        } else {
            console.log(`  ⚠️ Wikipedia: Not a standard article (type: ${response.data.type})`);
            return null;
        }
        
    } catch (error) {
        console.log(`  ⚠️ Wikipedia: ${error.message}`);
        return null;
    }
}

/**
 * V37.2.0: Search Ballotpedia for local candidate information
 * Independent political encyclopedia - non-profit
 * Rate limit: Respectful (ethical delay)
 * Cache: 14 days (election info updates frequently)
 */
async function searchBallotpedia(query) {
    // Extract candidate name or location from query
    const cacheKey = `ballotpedia_${query.toLowerCase().trim()}`;
    
    // Check cache (14-day expiry for election info)
    const cached = newsCache.get(cacheKey);
    if (cached) {
        const ageInDays = Math.floor((Date.now() - cached.timestamp) / (24 * 60 * 60 * 1000));
        if (Date.now() - cached.timestamp < 14 * 24 * 60 * 60 * 1000) {
            console.log(`🗳️  Using cached Ballotpedia data (${ageInDays} days old)`);
            return cached.data;
        }
    }
    
    try {
        console.log(`🗳️  Searching Ballotpedia for: ${query}`);
        
        // Ethical delay (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try candidate name search (convert spaces to underscores)
        const candidateUrl = `https://ballotpedia.org/${query.replace(/ /g, '_')}`;
        
        const response = await axios.get(candidateUrl, {
            headers: {
                'User-Agent': 'WorkforceDemocracyBot/1.0 (Educational; contact@workforcedemocracyproject.org)',
                'Accept': 'text/html'
            },
            timeout: 15000,
            validateStatus: status => status === 200 || status === 404
        });
        
        if (response.status === 404) {
            console.log(`  ⚠️ Ballotpedia: Page not found`);
            return null;
        }
        
        // Parse HTML
        const $ = cheerio.load(response.data);
        
        // Extract summary
        const summary = $('.bptl-infobox-text').first().text().trim() || 
                       $('p').first().text().trim() ||
                       'Candidate profile and election information';
        
        const result = {
            title: $('h1').first().text().trim() || query,
            url: candidateUrl,
            source: 'Ballotpedia',
            type: 'candidate_profile',
            excerpt: summary.substring(0, 200),
            date: new Date().toISOString()
        };
        
        // Cache for 14 days
        newsCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        console.log(`  ✅ Found Ballotpedia profile`);
        return result;
        
    } catch (error) {
        console.log(`  ⚠️ Ballotpedia: ${error.message}`);
        return null;
    }
}

/**
 * V37.2.0: Search local independent news sources
 * Bypasses Big Tech - goes directly to community journalism
 * Rate limit: Respectful (ethical delay between requests)
 * Cache: 3 days (local news updates frequently)
 */
async function searchLocalNews(query, region = 'new_york') {
    const sources = [];
    
    // V37.18.14: LOCAL_NEWS_SOURCES not defined - skip local news search for now
    // TODO: Define LOCAL_NEWS_SOURCES or remove this function
    console.log(`⚠️  searchLocalNews() called but LOCAL_NEWS_SOURCES not defined - skipping`);
    return sources;
    
    // ORIGINAL CODE (commented out until LOCAL_NEWS_SOURCES is defined):
    // const localSources = LOCAL_NEWS_SOURCES[region] || LOCAL_NEWS_SOURCES['default'];
    
    console.log(`📰 Searching ${localSources.length} local news sources for: "${query}"`);
    
    for (const newsSource of localSources) {
        const cacheKey = `local_${newsSource.name}_${query}`.toLowerCase().replace(/\s/g, '_');
        
        // Check cache (3-day expiry)
        const cached = newsCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < 3 * 24 * 60 * 60 * 1000)) {
            console.log(`  ✅ ${newsSource.name}: Using cached result`);
            sources.push(cached.data);
            continue;
        }
        
        try {
            // Ethical delay (1 second between requests)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const searchUrl = `${newsSource.url}${newsSource.searchPath}${encodeURIComponent(query)}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'WorkforceDemocracyBot/1.0 (Educational; contact@workforcedemocracyproject.org)',
                    'Accept': 'text/html'
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(response.data);
            
            // Try multiple selectors for article links
            let articleLink = null;
            let articleTitle = null;
            let articleExcerpt = null;
            
            // Strategy 1: Look for article elements
            const article = $('article').first();
            if (article.length > 0) {
                articleLink = article.find('a[href*="/"]').first().attr('href');
                articleTitle = article.find('h1, h2, h3, h4').first().text().trim();
                articleExcerpt = article.find('p').first().text().trim();
            }
            
            // Strategy 2: Look for result/story classes
            if (!articleLink) {
                const result = $('.story, .result, .article-item, .post').first();
                articleLink = result.find('a').first().attr('href');
                articleTitle = result.find('h1, h2, h3, h4').first().text().trim();
                articleExcerpt = result.find('p').first().text().trim();
            }
            
            // Validate the link
            if (articleLink && articleTitle) {
                // Make absolute URL if needed
                const fullUrl = articleLink.startsWith('http') ? 
                    articleLink : 
                    `${newsSource.url}${articleLink.startsWith('/') ? '' : '/'}${articleLink}`;
                
                // Skip if it's a search page
                if (fullUrl.includes('/search') || fullUrl.includes('?s=') || fullUrl.includes('?q=')) {
                    console.log(`  ⚠️ ${newsSource.name}: Skipped search page`);
                    continue;
                }
                
                const result = {
                    title: articleTitle,
                    url: fullUrl,
                    source: newsSource.name,
                    type: newsSource.type,
                    excerpt: articleExcerpt || `Article from ${newsSource.name}`,
                    date: new Date().toISOString()
                };
                
                // Cache for 3 days
                newsCache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
                
                sources.push(result);
                console.log(`  ✅ ${newsSource.name}: Found article - ${articleTitle.substring(0, 50)}...`);
            } else {
                console.log(`  ⚠️ ${newsSource.name}: No articles found`);
            }
            
        } catch (error) {
            console.log(`  ⚠️ ${newsSource.name}: ${error.message}`);
        }
    }
    
    return sources;
}

/**
 * V37.2.0: Manual source curation for known local races
 * Hand-curated links for important local elections
 * Updated manually when new races are identified
 */
function getKnownLocalRaceSources(query) {
    const sources = [];
    const lowerQuery = query.toLowerCase();
    
    // Albany Mayor 2025 - Dorcey Applyrs
    if (lowerQuery.includes('dorcey') || 
        lowerQuery.includes('applyrs') || 
        (lowerQuery.includes('albany') && lowerQuery.includes('mayor'))) {
        
        sources.push({
            title: 'Dorcey Applyrs - Ballotpedia',
            url: 'https://ballotpedia.org/Dorcey_Applyrs',
            source: 'Ballotpedia',
            type: 'candidate_profile',
            excerpt: 'Dorcey Applyrs is the mayor-elect of Albany, New York. Profile includes background, policies, and election results.',
            date: new Date().toISOString()
        });
        
        sources.push({
            title: 'Albany, New York mayoral election, 2025 - Ballotpedia',
            url: 'https://ballotpedia.org/Albany,_New_York_mayoral_election,_2025',
            source: 'Ballotpedia',
            type: 'election',
            excerpt: 'Complete coverage of the 2025 Albany mayoral race including candidates, results, and analysis.',
            date: new Date().toISOString()
        });
    }
    
    // Add more known races here as they're identified
    // Template:
    // if (lowerQuery.includes('candidate_name') || 
    //     (lowerQuery.includes('city') && lowerQuery.includes('position'))) {
    //     sources.push({...});
    // }
    
    if (sources.length > 0) {
        console.log(`📌 Found ${sources.length} curated sources for local race`);
    }
    
    return sources;
}

/**
 * Search for sources based on query context
 */
/**
 * V37.7.0: Score source relevance based on query topic
 * Filters out irrelevant articles (e.g., Boeing for SNAP queries)
 */
function scoreSourceRelevance(source, query) {
    const queryLower = query.toLowerCase();
    const titleLower = (source.title || '').toLowerCase();
    const excerptLower = (source.excerpt || '').toLowerCase();
    const combined = `${titleLower} ${excerptLower}`;
    
    // ==================================================================
    // MUSIC/ENTERTAINMENT FILTER (v37.8.0)
    // ==================================================================
    // Filter out music/entertainment articles BEFORE scoring
    // Check TITLE ONLY first (more specific)
    if (titleLower.match(/turn it up|hero with a hero|icing on the cake/i)) {
        console.log(`  🚫 MUSIC FILTERED (title): "${source.title.substring(0, 60)}..."`);
        return -1000; // Immediate rejection
    }
    // Then check combined for generic music content
    if (combined.match(/music review|album review|concert review|song of the week/i)) {
        console.log(`  🚫 MUSIC FILTERED (content): "${source.title.substring(0, 60)}..."`);
        return -1000; // Immediate rejection
    }
    
    // Filter out generic entertainment that's clearly not policy-related
    if (titleLower.match(/^(song|album|music|concert|artist|band):/i) && !combined.match(/policy|worker|labor|benefit|union|strike/i)) {
        console.log(`  🚫 ENTERTAINMENT FILTERED: "${source.title.substring(0, 60)}..."`);
        return -1000;
    }
    
    let score = 100; // Base score
    
    // ==================================================================
    // TOPIC-SPECIFIC FILTERING
    // ==================================================================
    
    // SNAP / Food Benefits Queries
    if (queryLower.match(/snap|food stamp|food benefit|food assistance|hunger|food insecurity/)) {
        // Must mention SNAP/food in title or excerpt
        if (!combined.match(/snap|food stamp|food benefit|hunger|food insecurity|nutrition|meal|feeding|ebt/)) {
            score -= 200; // Heavy penalty for completely off-topic
            console.log(`  ⚠️  "${source.title.substring(0, 50)}..." - Not SNAP-related (-200)`);
        }
        
        // Bonus for SNAP-specific content
        if (titleLower.includes('snap') || titleLower.includes('food stamp')) {
            score += 50;
        }
        
        // Penalty for unrelated industries (Boeing, tech, etc.)
        if (combined.match(/boeing|aircraft|airline|aerospace|manufacturing|tech company|silicon valley/)) {
            score -= 150;
            console.log(`  ⚠️  "${source.title.substring(0, 50)}..." - Unrelated industry (-150)`);
        }
    }
    
    // Welfare / Social Programs
    if (queryLower.match(/welfare|medicaid|medicare|social security|housing assistance|tanf|wic/)) {
        const programs = ['medicaid', 'medicare', 'social security', 'housing', 'tanf', 'wic', 'welfare', 'benefit'];
        const hasProgramMention = programs.some(p => combined.includes(p));
        
        if (!hasProgramMention) {
            score -= 150;
            console.log(`  ⚠️  "${source.title.substring(0, 50)}..." - Not welfare-related (-150)`);
        }
    }
    
    // Labor / Union Queries
    if (queryLower.match(/union|strike|worker|labor|wage|overtime|workplace|osha/)) {
        if (!combined.match(/union|strike|worker|labor|wage|overtime|workplace|osha|employment|job/)) {
            score -= 150;
        }
    }
    
    // Workforce Democracy / Cooperatives Queries
    if (queryLower.match(/workforce democracy|worker cooperative|worker-owned|employee-owned|co-op|esop|democratic workplace|solidarity economy/)) {
        // Must mention cooperatives, worker ownership, or democratic workplace concepts
        if (!combined.match(/cooperative|co-op|worker-owned|employee-owned|esop|democratic workplace|worker control|participatory|solidarity economy|mondragon|credit union/)) {
            score -= 300; // VERY heavy penalty - this is a specialized topic
            console.log(`  🚫 "${source.title.substring(0, 50)}..." - Not cooperative/workforce democracy related (-300)`);
        }
        
        // Bonus for direct cooperative mentions
        if (titleLower.match(/cooperative|worker-owned|co-op|esop/)) {
            score += 100; // Major boost for on-topic content
        }
    }
    
    // Healthcare Queries
    if (queryLower.match(/healthcare|health care|insurance|hospital|medical|doctor|prescription/)) {
        if (!combined.match(/health|hospital|medical|doctor|insurance|prescription|patient|care/)) {
            score -= 150;
        }
    }
    
    // ==================================================================
    // DOMAIN REPUTATION BOOST
    // ==================================================================
    
    const trustedDomains = [
        'democracynow.org',
        'truthout.org',
        'commondreams.org',
        'jacobin.com',
        'theintercept.com',
        'propublica.org',
        'thenation.com',
        'inthesetimes.com',
        'labornotes.org'
    ];
    
    const sourceUrl = source.url || '';
    const isTrusted = trustedDomains.some(domain => sourceUrl.includes(domain));
    
    if (isTrusted) {
        score += 75; // Significant boost for independent progressive media
        source.trusted = true; // Mark as trusted
    }
    
    // ==================================================================
    // FRESHNESS BOOST
    // ==================================================================
    
    if (source.date) {
        try {
            const articleDate = new Date(source.date);
            const ageInDays = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (ageInDays < 7) score += 30;      // Last week
            else if (ageInDays < 30) score += 15; // Last month
            else if (ageInDays < 90) score += 5;  // Last 3 months
        } catch (e) {
            // Ignore date parsing errors
        }
    }
    
    return score;
}

// V37.8.2: Source gathering thresholds (Updated Nov 9, 2025)
// With 40+ RSS feeds + Guardian API, we can realistically gather 15-20 sources
const SOURCE_THRESHOLD = 25; // Increased for comprehensive policy research (v37.9.4)
const MAX_SEARCH_ITERATIONS = 5; // Maximum iteration loops

/**
 * Analyze source gaps and suggest follow-up queries
 */
function analyzeSourceGaps(sources, originalQuery) {
    if (!originalQuery || typeof originalQuery !== 'string') {
        return { needsMoreData: false, followUpQueries: [] };
    }
    
    const queryLower = originalQuery.toLowerCase();
    const followUpQueries = [];
    
    // =============================================================================
    // POLICY RESEARCH PATTERNS (v37.9.4)
    // =============================================================================
    
    // Pattern 1: Housing & Homelessness Policy
    if (queryLower.match(/housing|homelessness|unhoused|homeless|affordable housing|rent control|eviction/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' budget allocation spending');
            followUpQueries.push(originalQuery + ' audit report accountability');
            followUpQueries.push(originalQuery + ' results outcomes data');
            followUpQueries.push(originalQuery + ' state funding breakdown');
        }
    }
    
    // Pattern 2: State Budget & Spending
    if (queryLower.match(/allocated|spending|budget|appropriation|funding|billion|million/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' audit findings');
            followUpQueries.push(originalQuery + ' where money went');
            followUpQueries.push(originalQuery + ' accountability results');
            followUpQueries.push(originalQuery + ' impact evaluation');
        }
    }
    
    // Pattern 3: Governor/Political Figure Records
    if (queryLower.match(/governor|mayor|senator|representative|congressman|politician/i) && 
        queryLower.match(/record|policy|track record|results|achievement/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' policy analysis investigation');
            followUpQueries.push(originalQuery + ' spending accountability audit');
            followUpQueries.push(originalQuery + ' legislative history bills');
            followUpQueries.push(originalQuery + ' expert analysis evaluation');
        }
    }
    
    // Pattern 4: California-specific queries
    if (queryLower.match(/california|newsom|gavin newsom|ca gov|sacramento/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' CalMatters investigation');
            followUpQueries.push(originalQuery + ' state auditor report');
            followUpQueries.push(originalQuery + ' LAO analysis');
        }
    }
    
    // =============================================================================
    // EXISTING PATTERNS (Preserved)
    // =============================================================================
    
    // Pattern: SNAP & Benefits
    if (queryLower.match(/snap|food stamp|welfare|benefit/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push('SNAP benefits cuts 2025 statistics');
            followUpQueries.push('SNAP benefits economic impact data');
            followUpQueries.push('SNAP benefits Supreme Court ruling details');
        }
    }
    
    // Pattern: Healthcare Policy
    if (queryLower.match(/healthcare|medicare|medicaid|social security|insurance/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' policy analysis');
            followUpQueries.push(originalQuery + ' economic impact');
        }
    }
    
    // Pattern: Climate & Environment
    if (queryLower.match(/climate|environment|emissions|renewable|fossil fuel/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' policy legislation');
            followUpQueries.push(originalQuery + ' environmental impact');
        }
    }
    
    // Pattern: Labor & Workers Rights
    if (queryLower.match(/labor|union|workers|wage|employment|strike/i)) {
        if (sources.length < SOURCE_THRESHOLD) {
            followUpQueries.push(originalQuery + ' labor statistics');
            followUpQueries.push(originalQuery + ' worker impact analysis');
        }
    }
    
    // Detect music articles - this is a gap that needs more relevant sources
    const hasMusicArticle = sources.some(s => 
        (s.title || '').toLowerCase().match(/turn it up|song|album|concert|music/i)
    );
    
    if (hasMusicArticle || sources.length < SOURCE_THRESHOLD) {
        followUpQueries.push(originalQuery + ' news analysis');
    }
    
    return {
        needsMoreData: followUpQueries.length > 0,
        followUpQueries: followUpQueries.slice(0, 4) // Max 4 follow-ups (increased from 3 for v37.9.4)
    };
}

/**
 * V37.8.2: Filter and sort sources by relevance (Updated Nov 9, 2025)
 * V37.9.12: Added minimum relevance threshold of 30 (user requirement for better source filtering)
 */
function filterAndSortSources(sources, query, maxResults = 20) {
    console.log(`📊 Scoring ${sources.length} sources for relevance...`);
    
    // V37.9.12: Minimum relevance threshold - sources must score at least 30 to be shown
    // V37.18.15: Lowered from 30 to 15 to match MIN_RELEVANCE_FOR_LLM
    const MIN_RELEVANCE_SCORE = 15;
    
    // Score all sources
    const scoredSources = sources.map(source => {
        const score = scoreSourceRelevance(source, query);
        return { source, score };
    });
    
    // V37.9.12: Filter by minimum threshold (not just > 0)
    const filtered = scoredSources.filter(s => s.score >= MIN_RELEVANCE_SCORE);
    
    console.log(`  ✅ Kept ${filtered.length}/${sources.length} sources (removed ${sources.length - filtered.length} with score < ${MIN_RELEVANCE_SCORE})`);
    
    // Log what was filtered out (for debugging)
    if (sources.length - filtered.length > 0) {
        const rejected = scoredSources.filter(s => s.score < MIN_RELEVANCE_SCORE);
        console.log(`  🚫 Filtered out (too low relevance):`);
        rejected.slice(0, 3).forEach(({source, score}) => {
            console.log(`     [Score: ${score}] ${source.source}: "${source.title.substring(0, 50)}..."`);
        });
    }
    
    // Sort by score (highest first)
    filtered.sort((a, b) => b.score - a.score);
    
    // Return top results
    const topSources = filtered.slice(0, maxResults).map(s => s.source);
    
    // Log top sources
    if (topSources.length > 0) {
        console.log(`  🏆 Top sources (score ≥ ${MIN_RELEVANCE_SCORE}):`);
        topSources.slice(0, 5).forEach((source, i) => {
            const score = scoredSources.find(s => s.source === source)?.score || 0;
            const trusted = source.trusted ? ' [TRUSTED]' : '';
            console.log(`     ${i + 1}. [${score}] ${source.source}${trusted}: "${source.title.substring(0, 60)}..."`);
        });
    } else {
        console.log(`  ⚠️ No sources met minimum relevance threshold of ${MIN_RELEVANCE_SCORE}`);
    }
    
    return topSources;
}

async function searchAdditionalSources(userMessage, llmResponse) {
    // Check if we need sources
    if (!needsCurrentInfo(userMessage, llmResponse)) {
        console.log('ℹ️ Query does not need current sources');
        return [];
    }
    
    const sources = [];
    
    try {
        // V37.2.0: Check for known local races FIRST (instant, curated)
        const knownSources = getKnownLocalRaceSources(userMessage);
        sources.push(...knownSources);
        
        // Determine query type
        const isCampaignFinance = userMessage.toLowerCase().match(
            /donor|contribution|campaign finance|pac|funding/
        );
        
        const isLocalElection = userMessage.toLowerCase().match(
            /mayor|mayoral|city council|county|local|albany|buffalo|syracuse|rochester|dorcey|applyrs/
        );
        
        const isCandidateQuery = userMessage.toLowerCase().match(
            /candidate|running for|who is|tell me about/
        );
        
        // V37.3.0: Multi-source strategy with GLOBAL RSS + APIs
        const searchPromises = [];
        
        // V37.18.28: FIX for progressive mayoral candidates
        // Problem: "mamdani policies" triggered isLocalElection, skipped global RSS
        // Solution: ALWAYS use global RSS for progressive candidates (Democracy Now coverage)
        const isProgressiveCandidate = userMessage.toLowerCase().match(
            /mamdani|aoc|ocasio-cortez|bernie|sanders|progressive|democratic socialist/
        );
        
        // Strategy 1: Global RSS + Guardian API (NEW!)
        // This replaces DuckDuckGo as primary source
        // V37.18.28: Use global sources for ALL progressive candidates (even local races)
        const isGlobalNews = !isLocalElection || isProgressiveCandidate;
        if (isGlobalNews) {
            console.log('🌍 Using global RSS/API sources');
            if (isProgressiveCandidate) {
                console.log('  📌 Progressive candidate detected - prioritizing Democracy Now, Intercept, Drop Site');
            }
            searchPromises.push(
                rssService.getGlobalNewsSources(userMessage, {
                    maxSources: 10,  // v37.4.1: Increased from 5 to show more sources
                    prioritizeIndependent: true
                })
            );
        }
        
        // Strategy 2: Local news for regional coverage
        // V37.18.28: Skip if LOCAL_NEWS_SOURCES undefined (avoid empty searches)
        if (isLocalElection && typeof LOCAL_NEWS_SOURCES !== 'undefined') {
            searchPromises.push(searchLocalNews(userMessage, 'new_york'));
        }
        
        // Strategy 3: Campaign finance if relevant
        if (isCampaignFinance) {
            searchPromises.push(searchCampaignFinance(userMessage));
        }
        
        // Strategy 4: Wikipedia for candidate backgrounds
        if (isCandidateQuery) {
            // Extract potential candidate name
            const nameMatch = userMessage.match(/(?:about|is|tell me about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
            if (nameMatch) {
                searchPromises.push(searchWikipedia(nameMatch[1]));
            }
        }
        
        // Strategy 5: Ballotpedia for elections and candidates
        if (isLocalElection || isCandidateQuery) {
            const nameMatch = userMessage.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
            if (nameMatch) {
                searchPromises.push(searchBallotpedia(nameMatch[1]));
            }
        }
        
        // Strategy 6: LOCAL ARTICLE DATABASE (v37.19.0)
        // REPLACES: DuckDuckGo (was timing out at 15s × 8 sources = 120s+)
        // BENEFIT: <1 second search, 10-20+ sources from historical archives
        if (isProgressiveCandidate) {
            console.log('  🗄️  Searching local article database for progressive candidate');
            try {
                const archiveResults = await articleSearchService.searchCandidate(
                    userMessage.match(/mamdani|aoc|ocasio-cortez|bernie|sanders/i)?.[0] || 'progressive',
                    'policies campaign election'
                );
                if (archiveResults.length > 0) {
                    console.log(`  ✅ Found ${archiveResults.length} articles from local database`);
                    sources.push(...archiveResults);
                } else {
                    console.log('  ⚠️  No articles found in local database (may need to run scraper)');
                }
            } catch (error) {
                console.error('  ❌ Local article search failed:', error.message);
            }
        }
        
        // Strategy 7: DuckDuckGo general fallback
        // Only used if global RSS doesn't find enough
        if (!isGlobalNews && !isLocalElection) {
            searchPromises.push(searchDuckDuckGo(userMessage, 2));
        }
        
        // Execute all searches in parallel
        const results = await Promise.all(searchPromises);
        
        // Combine results (filter out nulls)
        results.forEach(result => {
            if (result) {
                if (Array.isArray(result)) {
                    sources.push(...result);
                } else {
                    sources.push(result);
                }
            }
        });
        
        console.log(`✅ Found ${sources.length} total sources (${knownSources.length} curated, ${sources.length - knownSources.length} searched)`);
        
    } catch (error) {
        console.error('❌ Source search error:', error.message);
    }
    
    // V37.8.2: Filter and sort by relevance (Updated Nov 9, 2025)
    if (sources.length > 0) {
        const filteredSources = filterAndSortSources(sources, userMessage, 20);
        console.log(`🎯 Returning ${filteredSources.length} relevant sources`);
        return filteredSources;
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
        // Get current date for LLM context (with client timezone support)
        const clientTimezone = context.timezone || 'America/New_York'; // Default to US Eastern
        const currentDate = new Date();
        const dateString = currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: clientTimezone
        });
        const timeString = currentDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: clientTimezone
        });
        
        // Get appropriate system prompt with current date and time
        const basePrompt = SYSTEM_PROMPTS[chatType] || CORE_PHILOSOPHY;
        const systemPrompt = `CRITICAL - CURRENT DATE & TIME: ${dateString} at ${timeString} (${clientTimezone})

REMEMBER: Today is ${dateString} and the current time is ${timeString}. If someone asks about "today's election" or "tonight's results", they mean ${dateString}. Always use this date and time for temporal context.

${basePrompt}

IMPORTANT CAPABILITIES YOU HAVE:
• You have access to current information through web search
• When users ask about recent events, elections (especially local races like NYC mayor), or current affairs happening TODAY (${dateString}), you WILL receive up-to-date sources
• NEVER say "my training data ends in April 2023" - you have real-time search access
• If asked about events happening "tonight" or "today" (${dateString}), acknowledge this and wait for sources to be provided
• For NYC mayoral race or other local elections happening ${dateString}, sources will be automatically searched and provided to you`;
        
        // =============================================================================
        // PHASE 1: Search for sources FIRST (v37.5.0 FIX)
        // =============================================================================
        // This ensures LLM knows exactly which sources exist before generating citations
        let sources = [];
        
        try {
            // Preliminary check: does this query need sources?
            if (needsCurrentInfo(query, '')) {
                console.log(`🔍 Pre-searching sources before LLM call...`);
                sources = await searchAdditionalSources(query, query); // Use query twice since no LLM response yet
                console.log(`📚 Found ${sources.length} sources to provide to LLM`);
            } else {
                console.log(`ℹ️  Query doesn't need current sources, proceeding without pre-search`);
            }
        } catch (error) {
            console.error('⚠️ Pre-search failed (non-fatal):', error.message);
            sources = [];
        }
        
        // PHASE 1.25: Iterative search - analyze gaps and search until threshold met
        console.log('🔍 Starting iterative source search...');
        let iteration = 0;
        
        while (sources.length < SOURCE_THRESHOLD && iteration < MAX_SEARCH_ITERATIONS) {
            iteration++;
            console.log(`  🔄 Iteration ${iteration}: Have ${sources.length}/${SOURCE_THRESHOLD} sources`);
            
            const gaps = analyzeSourceGaps(sources, query);
            
            if (!gaps.needsMoreData || gaps.followUpQueries.length === 0) {
                console.log(`  ⏹️  No more follow-ups available (iteration ${iteration})`);
                break;
            }
            
            console.log(`  📊 Generated ${gaps.followUpQueries.length} follow-up queries`);
            
            const followUpSources = [];
            for (const followUpQuery of gaps.followUpQueries) {
                console.log(`  🔎 Follow-up: "${followUpQuery}"`);
                try {
                    const additional = await searchAdditionalSources(followUpQuery, '');
                    followUpSources.push(...additional);
                } catch (error) {
                    console.error(`  ⚠️ Follow-up search failed: ${error.message}`);
                }
            }
            
            // Remove duplicates and merge
            const existingUrls = new Set(sources.map(s => s.url));
            const newSources = followUpSources.filter(s => !existingUrls.has(s.url));
            
            if (newSources.length === 0) {
                console.log(`  ⏹️  No new unique sources found, stopping iteration`);
                break;
            }
            
            sources.push(...newSources);
            console.log(`  📚 Total sources after iteration ${iteration}: ${sources.length}`);
        }
        
        console.log(`  ✅ Iterative search complete: ${sources.length} total sources (${iteration} iterations)`)
        
        // Also extract sources from context
        const contextSources = extractSources('', context);
        sources.push(...contextSources);
        
        // Deduplicate sources before passing to LLM
        const uniqueSources = [];
        const seenUrls = new Set();
        sources.forEach(source => {
            if (source.url && !seenUrls.has(source.url)) {
                // Validate URL (no search pages)
                if (!source.url.includes('/search?q=') && 
                    !source.url.includes('duckduckgo.com') && 
                    !source.url.includes('google.com/search')) {
                    seenUrls.add(source.url);
                    uniqueSources.push(source);
                }
            }
        });
        
        // V37.9.13: CRITICAL FIX - Filter by relevance score BEFORE showing to LLM
        // This prevents the LLM from seeing low-relevance sources that won't be returned
        // V37.18.12: Lowered from 30 to 15 - threshold was too strict, filtering ALL sources
        // V37.19.2: Raised from 15 to 40 - smart scoring now penalizes "mentioned in passing" articles
        // V37.19.3: Raised from 40 to 50 - stricter filtering to prevent weak sources causing hallucinations
        // V37.19.4: Raised from 50 to 60 - CRITICAL: Only title/excerpt matches, NO full-text-only sources
        const MIN_RELEVANCE_FOR_LLM = 60; // Filter out articles where keywords only mentioned in passing (v37.19.4: 50→60)
        
        // Log ALL sources with their scores BEFORE filtering
        console.log(`  📊 Source relevance scores:`);
        uniqueSources.forEach((s, i) => {
            console.log(`     [${i+1}] ${s.source} - "${s.title.substring(0, 50)}..." (score: ${s.relevanceScore || 0})`);
        });
        
        const relevantSources = uniqueSources.filter(source => {
            const score = source.relevanceScore || 0;
            return score >= MIN_RELEVANCE_FOR_LLM;
        });
        
        const filteredCount = uniqueSources.length - relevantSources.length;
        if (filteredCount > 0) {
            console.log(`  🚫 Filtered out ${filteredCount} low-relevance sources (score < ${MIN_RELEVANCE_FOR_LLM})`);
            console.log(`     Removed sources: ${uniqueSources.filter(s => (s.relevanceScore || 0) < MIN_RELEVANCE_FOR_LLM).map(s => `"${s.title.substring(0, 30)}..." (${s.relevanceScore || 0})`).join(', ')}`);
        }
        
        console.log(`✅ Providing ${relevantSources.length} validated sources to LLM (min score: ${MIN_RELEVANCE_FOR_LLM})`);
        
        // PHASE 1.5: Scrape full article content for top sources (v37.8.0)
        if (relevantSources.length > 0) {
            console.log('📄 Scraping full article content...');
            try {
                const topSources = relevantSources.slice(0, 5); // Scrape top 5 sources
                const scrapedSources = await scrapeMultipleArticles(topSources, 3); // Max 3 concurrent
                
                // Replace short excerpts with full content
                scrapedSources.forEach(scraped => {
                    if (scraped.fullContent) {
                        const original = relevantSources.find(s => s.url === scraped.url);
                        if (original) {
                            original.fullContent = scraped.fullContent;
                            original.excerpt = scraped.fullContent.substring(0, 500) + '...';
                            console.log(`  ✅ Scraped: ${scraped.source} (${scraped.fullContent.length} chars)`);
                        }
                    }
                });
                
                // Log cache stats
                const cacheStats = getCacheStats();
                console.log(`  📊 Scraper cache: ${cacheStats.size} articles, ${cacheStats.hits} hits, ${cacheStats.misses} misses`);
            } catch (error) {
                console.error('  ⚠️ Article scraping failed (non-fatal):', error.message);
            }
        }
        
        // Build user message with context AND pre-searched sources
        // V37.9.13: Use relevantSources (filtered by relevance score) instead of uniqueSources
        const userMessage = buildContextualPrompt(query, context, chatType, relevantSources);
        
        console.log(`🤖 AI Query: "${query.substring(0, 50)}..." (context: ${chatType}, sources: ${uniqueSources.length})`);
        
        // =============================================================================
        // PHASE 2: Call LLM with sources already available
        // =============================================================================
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
        
        let aiText = response.data.choices[0].message.content;
        const usage = response.data.usage;
        
        console.log(`✅ AI response: "${aiText.substring(0, 50)}..."`);
        
        // V37.18.8: FIX #1 - Remove thinking blocks from AI response
        // Some AI models (Mistral, Llama) output internal reasoning in <think> tags
        // This should NOT be visible to users
        if (typeof aiText === 'string' && aiText.includes('<think>')) {
            const beforeLength = aiText.length;
            aiText = aiText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            const afterLength = aiText.length;
            if (beforeLength !== afterLength) {
                console.log(`🧹 Removed thinking blocks (${beforeLength - afterLength} chars removed)`);
            }
        }
        
        // V37.18.12 / V37.18.23: Clean up formatting issues
        // Remove fake "Sources:" paragraphs that AI might generate
        if (typeof aiText === 'string') {
            // Remove "Sources:" paragraph at end (AI shouldn't generate this)
            aiText = aiText.replace(/\n\nSources:.*$/s, '');
            
            // Fix space-before-fullstop issue (e.g., "text ." → "text.")
            aiText = aiText.replace(/\s+\./g, '.');
            
            // Fix double fullstops (..) - more aggressive patterns
            aiText = aiText.replace(/\.{2,}/g, '.'); // Multiple dots
            aiText = aiText.replace(/\.\s*\.+/g, '.'); // Dots with spaces between
            
            // V37.18.27: COMPREHENSIVE LIST FORMATTING FIX
            // Handle BOTH bullet lists AND bold section headers
            const beforeCleanup = aiText;
            
            // Pattern 1: Remove blank lines between bullet/numbered items
            // Before: "- Item\n\n- Item"  After: "- Item\n- Item"
            aiText = aiText.replace(/(-\s+[^\n]+)\n\n(?=-\s+)/g, '$1\n');
            aiText = aiText.replace(/(\*\s+[^\n]+)\n\n(?=\*\s+)/g, '$1\n');
            aiText = aiText.replace(/(\d+\.\s+[^\n]+)\n\n(?=\d+\.\s+)/g, '$1\n');
            
            // Pattern 2: Remove blank lines after bold headers (common AI formatting)
            // Before: "**Header**\n\nText"  After: "**Header**\nText"
            aiText = aiText.replace(/(\*\*[^*]+\*\*)\n\n/g, '$1\n');
            
            if (beforeCleanup !== aiText) {
                const removed = (beforeCleanup.match(/\n\n/g) || []).length - (aiText.match(/\n\n/g) || []).length;
                console.log(`🧹 LIST FORMATTING: Removed ${removed} blank line(s)`);
            }
            
            // Clean up trailing punctuation issues
            aiText = aiText.trim();
            
            console.log('🧹 Applied formatting cleanup (Sources paragraph, spacing, punctuation, list formatting)');
        }
        
        // V37.5.0: Sources already validated and deduplicated before LLM call
        // LLM was given exactly these sources, so citations should match
        // V37.9.13: Use relevantSources (filtered by relevance score)
        // V37.18.12: Lowered threshold from 30 to 15 to allow more sources through
        const validSources = relevantSources; // Use the same sources we gave to LLM
        
        // V37.9.14: OPTION A - Enhanced POST-PROCESSING
        // 1. Remove hallucinated citations (N > max)
        // 2. Remove duplicate citations (keep first occurrence only)
        const maxCitation = validSources.length;
        if (maxCitation > 0) {
            // Find all citations in response
            const citationPattern = /\[(\d+)\]/g;
            const foundCitations = [...aiText.matchAll(citationPattern)];
            
            // Check for hallucinated citations (beyond max)
            const hallucinatedCitations = foundCitations.filter(match => {
                const num = parseInt(match[1]);
                return num > maxCitation;
            });
            
            if (hallucinatedCitations.length > 0) {
                console.warn(`🚨 HALLUCINATED CITATIONS DETECTED: ${hallucinatedCitations.map(m => m[0]).join(', ')}`);
                console.warn(`   Maximum valid citation: [${maxCitation}], but LLM used: ${hallucinatedCitations.map(m => m[0]).join(', ')}`);
                
                // Remove hallucinated citations from text
                hallucinatedCitations.forEach(match => {
                    const hallucinatedCitation = match[0]; // e.g., "[7]"
                    aiText = aiText.replace(new RegExp(`\\${hallucinatedCitation}`, 'g'), '');
                });
                
                console.log(`   ✅ Removed ${hallucinatedCitations.length} hallucinated citations from response`);
            }
            
            // V37.9.14: NEW - Remove duplicate citations
            // Problem: LLM sometimes repeats citations like [4][4][4][4][4]
            // Solution: Track seen citations and remove duplicates
            const seenCitations = new Set();
            let duplicateCount = 0;
            
            aiText = aiText.replace(citationPattern, (match, num) => {
                const citationNum = parseInt(num);
                
                // Skip if already seen (duplicate)
                if (seenCitations.has(citationNum)) {
                    duplicateCount++;
                    return ''; // Remove duplicate
                }
                
                // First occurrence - keep it
                seenCitations.add(citationNum);
                return match;
            });
            
            if (duplicateCount > 0) {
                console.warn(`🔄 DUPLICATE CITATIONS REMOVED: ${duplicateCount} duplicate(s) stripped`);
                console.log(`   📊 Unique citations kept: ${seenCitations.size} (from ${foundCitations.length} total)`);
            }
        }
        
        console.log(`✅ Returning ${validSources.length} sources (same as provided to LLM)`);
        
        // Calculate cost (Groq is very affordable)
        const cost = calculateCost(usage);
        
        return {
            success: true,
            response: aiText, // V37.4.1: Original response with ALL citations intact
            sources: validSources, // V37.1.4: ALL validated sources (no limit)
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
 * V37.5.0: Now includes pre-searched sources so LLM knows what to cite
 */
function buildContextualPrompt(query, context, chatType, preFetchedSources = []) {
    let prompt = `User Question: ${query}\n\n`;
    
    // Add government data if available
    if (context.governmentData) {
        prompt += `Official Data:\n${JSON.stringify(context.governmentData, null, 2)}\n\n`;
    }
    
    // V37.5.0: Add pre-fetched sources (NEW!)
    // V37.9.12: Added "no relevant sources found" message
    // V37.19.0: CITATION FIX - ENFORCE citing ALL sources (was temporarily disabled)
    // This is the critical fix - LLM now sees sources BEFORE generating response
    if (preFetchedSources && preFetchedSources.length > 0) {
        prompt += `📚 Web Search Results - EXACTLY ${preFetchedSources.length} Sources Available:\n\n`;
        
        // List all sources with numbers
        preFetchedSources.forEach((result, i) => {
            const sourceNum = i + 1;
            prompt += `[${sourceNum}] ${result.source || result.title}${result.trusted ? ' [TRUSTED]' : ''}\n`;
            prompt += `    Title: ${result.title}\n`;
            prompt += `    URL: ${result.url}\n`;
            if (result.excerpt) {
                prompt += `    Excerpt: ${result.excerpt.substring(0, 300)}\n`;
            }
            if (result.fullContent) {
                prompt += `    Full Content: ${result.fullContent.substring(0, 800)}...\n`;
            }
            prompt += `\n`;
        });
        
        // V37.19.2: SMART CITATION ENFORCEMENT (cite only RELEVANT sources)
        prompt += `\n🚨🚨🚨 CRITICAL CITATION REQUIREMENTS 🚨🚨🚨\n`;
        prompt += `\n`;
        prompt += `YOU HAVE BEEN PROVIDED WITH ${preFetchedSources.length} SOURCES ABOVE.\n`;
        prompt += `Maximum citation number: [${preFetchedSources.length}]\n`;
        prompt += `\n`;
        prompt += `MANDATORY RULES:\n`;
        prompt += `1. ✅ ONLY CITE SOURCES THAT ARE DIRECTLY RELEVANT TO YOUR CLAIMS\n`;
        prompt += `2. ✅ READ EACH SOURCE CAREFULLY - Does it support what you're saying?\n`;
        prompt += `3. ✅ IF A SOURCE IS ABOUT A DIFFERENT TOPIC - DON'T CITE IT\n`;
        prompt += `4. ✅ CITE SOURCES THROUGHOUT YOUR RESPONSE (not just at the end)\n`;
        prompt += `5. ❌ NEVER cite numbers higher than [${preFetchedSources.length}] - those are hallucinations\n`;
        prompt += `6. ❌ NEVER fabricate connections - if a source doesn't support your claim, DON'T use it\n`;
        prompt += `\n`;
        prompt += `⚠️ CRITICAL: Some sources may mention the topic in PASSING but not be ABOUT the topic.\n`;
        prompt += `EXAMPLE: If the question is "What are Mamdani's policies?" and source [4] is about Trump\n`;
        prompt += `calling a reporter "piggy" but MENTIONS Mamdani once → DON'T cite [4] for Mamdani's policies!\n`;
        prompt += `That would be fabricating a connection that doesn't exist.\n`;
        prompt += `\n`;
        prompt += `GOOD EXAMPLE (6 sources, 4 relevant):\n`;
        prompt += `Question: "What are Mamdani's policies?"\n`;
        prompt += `[1] Mamdani's Affordability Agenda - Democracy Now ← RELEVANT\n`;
        prompt += `[2] Historic Rise of Mamdani - Democracy Now ← RELEVANT\n`;
        prompt += `[3] Trump Calls Reporter Piggy (mentions Mamdani once) ← NOT RELEVANT\n`;
        prompt += `[4] Mamdani Transition Team - Democracy Now ← RELEVANT\n`;
        prompt += `[5] Gaza Ceasefire Headlines (doesn't mention Mamdani) ← NOT RELEVANT\n`;
        prompt += `[6] Grassroots Base Warning (mentions Mamdani) ← RELEVANT\n`;
        prompt += `\n`;
        prompt += `CORRECT RESPONSE: "Mamdani's agenda focuses on affordability [1]. His historic rise [2]\n`;
        prompt += `was aided by a grassroots coalition [6]. His transition team [4] is implementing these policies."\n`;
        prompt += `→ Notice: ONLY cited [1], [2], [4], [6] (the RELEVANT sources)\n`;
        prompt += `→ Skipped [3] and [5] because they're not about Mamdani's policies\n`;
        prompt += `\n`;
        prompt += `WRONG RESPONSE: "Mamdani's 'Quiet Piggy' initiative [3] limits anonymous donations..."\n`;
        prompt += `→ This is FABRICATED! Source [3] is about Trump, NOT Mamdani's policies.\n`;
        prompt += `→ NEVER invent policies or initiatives not in the sources.\n`;
        prompt += `\n`;
        prompt += `WHY THIS MATTERS:\n`;
        prompt += `• Users CLICK citations to verify information\n`;
        prompt += `• Wrong citations = broken trust\n`;
        prompt += `• Fabricated connections = misinformation\n`;
        prompt += `\n`;
        prompt += `BEFORE YOU SUBMIT YOUR RESPONSE:\n`;
        prompt += `✅ For EACH citation [N], ask: "Does source [N] DIRECTLY support this claim?"\n`;
        prompt += `✅ If NO → Remove the citation or change the claim\n`;
        prompt += `✅ No citations > [${preFetchedSources.length}]? If YES → DELETE THEM (hallucinations)\n`;
        prompt += `✅ Did you fabricate any connections? If YES → REMOVE THEM\n`;
        prompt += `\n`;
        prompt += `REMEMBER: Quality over quantity. Better to cite 3 relevant sources than 6 irrelevant ones!\n`;
        prompt += `\n`;
        prompt += `🚨🚨🚨 ANTI-HALLUCINATION RULES 🚨🚨🚨\n`;
        prompt += `\n`;
        prompt += `❌ DO NOT INVENT FACTS NOT IN THE SOURCES:\n`;
        prompt += `• ❌ "Mamdani was elected in 2021" (unless source EXPLICITLY says this)\n`;
        prompt += `• ❌ "as a state senator" (unless source says this exact position)\n`;
        prompt += `• ❌ "Mamdani said..." (if it was actually someone ELSE talking ABOUT Mamdani)\n`;
        prompt += `• ❌ "According to Mamdani..." (if the source is someone discussing Mamdani, not quoting him)\n`;
        prompt += `\n`;
        prompt += `✅ CORRECTLY ATTRIBUTE WHO SAID WHAT:\n`;
        prompt += `• If source is "Dean Fuleihan discusses Mamdani's agenda" → Say: "Fuleihan outlined Mamdani's agenda [1]" NOT "Mamdani outlined..."\n`;
        prompt += `• If source is "Interview with AOC about Bernie Sanders" → Say: "AOC said Sanders supports [1]" NOT "Sanders said..."\n`;
        prompt += `• If source is "Analysis of Biden's policies" → Say: "Analysts note Biden's approach [1]" NOT "Biden said..."\n`;
        prompt += `\n`;
        prompt += `✅ ONLY STATE FACTS EXPLICITLY IN THE SOURCES:\n`;
        prompt += `• If source says "2021 hunger strike" → You can say "2021 hunger strike [1]"\n`;
        prompt += `• If source says "election night" → You can say "election night [1]"\n`;
        prompt += `• If source DOESN'T say when elected → DO NOT invent a date\n`;
        prompt += `• If source DOESN'T say the position → DO NOT invent a title\n`;
        prompt += `\n`;
        prompt += `✅ WHEN IN DOUBT, USE EXACT QUOTES:\n`;
        prompt += `• Instead of: "Mamdani supports rent control"\n`;
        prompt += `• Better: "Mamdani's agenda 'emphasizes rent control expansion' [1]"\n`;
        prompt += `• This makes it clear you're reporting what the SOURCE says, not inventing facts\n`;
        prompt += `\n`;
        prompt += `SELF-CHECK BEFORE SUBMITTING:\n`;
        prompt += `1. Did I invent any dates not in the sources? → DELETE THEM\n`;
        prompt += `2. Did I invent any positions/titles not in the sources? → DELETE THEM\n`;
        prompt += `3. Did I attribute quotes to the wrong person? → FIX THE ATTRIBUTION\n`;
        prompt += `4. Did I cite sources that don't support my claims? → REMOVE THE CITATIONS\n`;
        prompt += `5. Did I make ANY claim not directly supported by the sources? → DELETE OR REPHRASE\n`;
        prompt += `\n`;
        prompt += `🚨🚨🚨 STRICT CITATION VERIFICATION (v37.19.4) 🚨🚨🚨\n`;
        prompt += `\n`;
        prompt += `ABSOLUTE REQUIREMENTS - EVERY CITATION MUST PASS ALL 3 TESTS:\n`;
        prompt += `\n`;
        prompt += `TEST 1: NAME VERIFICATION\n`;
        prompt += `❌ The person's EXACT NAME must appear in the source title OR snippet\n`;
        prompt += `• Example: If question is about "Mamdani", the word "Mamdani" MUST be visible\n`;
        prompt += `• If the name is NOT there → DON'T CITE THIS SOURCE (even if topic seems related)\n`;
        prompt += `\n`;
        prompt += `TEST 2: TOPIC VERIFICATION\n`;
        prompt += `❌ The specific TOPIC must be EXPLICITLY stated in the source\n`;
        prompt += `• Example: If claiming "supports rent control", source must say "rent control"\n`;
        prompt += `• General topics ("affordability", "housing") don't count for specific claims\n`;
        prompt += `• If the exact topic is NOT stated → DON'T CITE THIS SOURCE\n`;
        prompt += `\n`;
        prompt += `TEST 3: CLAIM VERIFICATION\n`;
        prompt += `❌ Your EXACT claim must be directly supported by the source text\n`;
        prompt += `• Don't make inferences or connections the source doesn't explicitly make\n`;
        prompt += `• Don't cite source A for a claim only supported by source B\n`;
        prompt += `• If you're not 100% certain the source supports your claim → DON'T CITE\n`;
        prompt += `\n`;
        prompt += `REAL EXAMPLE OF FABRICATED CITATION (DO NOT DO THIS):\n`;
        prompt += `❌ WRONG: "Post-election surveys confirm grassroots support for Mamdani [4]"\n`;
        prompt += `   Source [4]: "Grassroots Democratic Base Sends Post-Election Warning"\n`;
        prompt += `   Snippet: "Survey of 2,500 voters shows progressive base frustrated..."\n`;
        prompt += `   ↓\n`;
        prompt += `   FAILS TEST 1: "Mamdani" does NOT appear in title or snippet\n`;
        prompt += `   FAILS TEST 2: Source is about general "Democratic base", not Mamdani specifically\n`;
        prompt += `   FAILS TEST 3: No evidence this survey is about Mamdani at all\n`;
        prompt += `   ↓\n`;
        prompt += `   RESULT: This citation is FABRICATED. Source [4] says NOTHING about Mamdani.\n`;
        prompt += `\n`;
        prompt += `✅ CORRECT: "Post-election surveys show progressive base frustrated [4]"\n`;
        prompt += `   (Generic claim the source actually supports - but NOT connected to Mamdani)\n`;
        prompt += `   OR BETTER: Don't cite [4] at all for a Mamdani query - it's not relevant.\n`;
        prompt += `\n`;
        prompt += `CITATION DECISION TREE:\n`;
        prompt += `For each source [N] you consider citing:\n`;
        prompt += `\n`;
        prompt += `┌─ Does [N]'s title/snippet contain the person's name?\n`;
        prompt += `│  ├─ NO → ❌ STOP. Don't cite [N] for claims about that person.\n`;
        prompt += `│  └─ YES → Continue to next test\n`;
        prompt += `│\n`;
        prompt += `└─ Does [N]'s title/snippet contain your specific claim/topic?\n`;
        prompt += `   ├─ NO → ❌ STOP. Don't cite [N] for that claim.\n`;
        prompt += `   └─ YES → Continue to next test\n`;
        prompt += `   \n`;
        prompt += `   └─ Does [N] EXPLICITLY support your exact claim (no inference needed)?\n`;
        prompt += `      ├─ NO → ❌ STOP. Don't cite [N].\n`;
        prompt += `      └─ YES → ✅ SAFE TO CITE [N]\n`;
        prompt += `\n`;
        prompt += `🚨 ZERO-TOLERANCE POLICY 🚨\n`;
        prompt += `• If source fails ANY of the 3 tests → Don't cite it\n`;
        prompt += `• If you have ANY doubt → Don't cite it\n`;
        prompt += `• Better to cite 1 perfect source than 4 questionable ones\n`;
        prompt += `• Quality > Quantity for citations\n`;
        prompt += `\n`;
        prompt += `🚨 FORBIDDEN: SELF-CONTRADICTORY CITATIONS 🚨\n`;
        prompt += `❌ NEVER cite [N] then say "doesn't mention" or "not related"\n`;
        prompt += `❌ Wrong: "Source [4] doesn't mention Mamdani [4]"\n`;
        prompt += `✅ Right: Don't cite [4] at all - just use [1] [2] [3]\n`;
        prompt += `Rule: If irrelevant → Don't cite, don't mention, skip entirely\n`;
        prompt += `\n`;
        prompt += `MANDATORY SELF-CHECK BEFORE SUBMITTING RESPONSE:\n`;
        prompt += `For EVERY citation [N] in your response:\n`;
        prompt += `☐ Does source [N]'s title or snippet contain the person's name? (Must be YES)\n`;
        prompt += `☐ Does source [N]'s content directly state my claim? (Must be YES)\n`;
        prompt += `☐ Am I making any inference the source doesn't explicitly make? (Must be NO)\n`;
        prompt += `☐ Would a user clicking [N] find evidence for my exact claim? (Must be YES)\n`;
        prompt += `☐ Did I cite [N] and then say it's irrelevant/doesn't mention the subject? (Must be NO)\n`;
        prompt += `\n`;
        prompt += `If you answered incorrectly to ANY question above → DELETE THAT CITATION\n`;
        prompt += `\n\n`;
    } else if (preFetchedSources && preFetchedSources.length === 0) {
        // V37.9.12: No relevant sources found - tell AI to respond from training data
        // V37.18.8: FIX #2 - Simplified message (removed contradictory ending note)
        // V37.19.0: UPDATED - Clarified no citations rule
        prompt += `📚 Source Search Status: NO RELEVANT SOURCES FOUND\n`;
        prompt += `The source search did not find articles relevant to this query.\n`;
        prompt += `\n`;
        prompt += `🚨 CRITICAL: DO NOT USE CITATIONS [1] [2] [3] - there are ZERO sources to cite.\n`;
        prompt += `Please respond using your training data without any citation numbers.\n`;
        prompt += `Users will NOT see a sources section below your response.\n\n`;
    }
    
    // V37.9.13: REMOVED context.webSearchResults to prevent duplicate sources
    // This was causing citation/source mismatch: LLM saw both preFetchedSources AND webSearchResults
    // Result: LLM generated 13 citations but backend only returned 8 sources (the deduplicated ones)
    // Fix: Only use preFetchedSources (which are already deduplicated and validated)
    
    // Legacy code removed (was causing citation mismatch):
    // if (context.webSearchResults && context.webSearchResults.length > 0) {
    //     prompt += `Additional Context (prioritize TRUSTED sources):\n`;
    //     context.webSearchResults.forEach((result, i) => {
    //         prompt += `${i+1}. ${result.title} ${result.trusted ? '[TRUSTED]' : ''}\n`;
    //         prompt += `   URL: ${result.url}\n`;
    //         prompt += `   Snippet: ${result.snippet}\n\n`;
    //     });
    // }
    
    // Add Ballotpedia data if available
    if (context.ballotpediaData && context.ballotpediaData.success) {
        prompt += `Ballotpedia Profile:\n${JSON.stringify(context.ballotpediaData.data, null, 2)}\n\n`;
    }
    
    // V37.1.4: Enhanced conversation history with context awareness
    if (context.conversationHistory && context.conversationHistory.length > 0) {
        prompt += `Recent Conversation (USE THIS CONTEXT):\n`;
        context.conversationHistory.slice(-3).forEach(msg => {
            prompt += `${msg.role}: ${msg.content}\n`;
        });
        prompt += `\nIMPORTANT: This is a continuing conversation. Use context from above.\n`;
        prompt += `If user asks brief follow-up (1-3 words), give concise direct answer based on context.\n\n`;
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

**BANNED PHRASES - NEVER USE THESE:**
• "I want to start by acknowledging..."
• "To answer your question about X, I need to..."
• "Let me search for..."
• "I need to find the most recent information..."
• "My training data ends April 2023..."
• "It can be frustrating and concerning..."
• "It's important to note that..."
• "I want to emphasize that..."
• "I hope this helps..."
• "According to my search..." (just cite the source directly)
• "Based on the information I found..." (just present the facts)

**V37.1.4 - NEVER INCLUDE SEARCH PAGE URLs IN YOUR RESPONSE:**
• NEVER include URLs containing "/search?q="
• NEVER include URLs from duckduckgo.com, google.com/search, bing.com/search
• Only cite actual article/source URLs that directly link to content
• If you don't have a real article URL, use the publication name only without URL

CONVERSATION FLOW RULES:
• **Short follow-ups (1-3 words)**: Give direct, concise answer using conversation context
  - Example: User: "What about Cuomo?" → "Cuomo received $2.4M from real estate [1]."
  - Example: User: "Which candidate?" → "Based on our discussion, Mamdani supports universal healthcare [1]."
• **Unclear questions**: Ask for clarification with specific options
  - Example: User: "What do you think?" → "I can help with voting records, policy positions, or campaign finance. Which interests you?"
• **Long detailed questions**: Provide comprehensive analysis with citations
• **Context awareness**: Reference previous conversation naturally

WRONG: "To answer your question about NYC polling, I need to find the most recent information. According to the Board..."
RIGHT: "Polling places in New York City are open from 6 AM to 9 PM on election day [1]."

WRONG (follow-up): User asks "Which candidate?" → 6 paragraphs without naming anyone
RIGHT (follow-up): User asks "Which candidate?" → "Mamdani has stronger worker protections in his platform [1]."

Just start with the facts. End with the facts.

SOURCES AND CITATIONS - HOW TO USE THEM (v37.8.0):

• **RULE 1: MATCH CITATIONS TO SOURCES** - Each [N] must correspond to a source in "Web Search Results"
• **RULE 2: USE CITATIONS LIBERALLY** - Reference sources throughout your response
• **RULE 3: NO SOURCES = NO CITATIONS** - If 0 sources provided, don't use ANY [N] numbers
• **RULE 4: VERIFY BEFORE CITING** - Make sure the source you're citing actually supports your claim

EXAMPLES:

EXAMPLE 1 - Multiple sources provided:
✅ CORRECT: "Casualties in Gaza reached 30,000 [1]. UN called for ceasefire [2]. Aid blocked at borders [3]."
   → Each [N] references a specific source
❌ WRONG: "Casualties reached 30,000 [999]." 
   → [999] doesn't match any source number

EXAMPLE 2 - Four sources provided:
Context shows: "EXACTLY 4 sources are available. Use ONLY [1] through [4]"
Context shows: "Web Search Results: [1] Truthout, [2] Common Dreams, [3] Democracy Now, [4] The Intercept"
✅ CORRECT: "Republicans propose SNAP cuts [1]. This affects 42M people [2]. All Democrats opposed [3]. Corporate donors gave $2.1M [4]."
   → Uses all 4 sources, maximum is [4]
❌ WRONG: "Republicans propose cuts [1]. Affects 42M [2]. Democrats opposed [3]. Donors gave $2.1M [4]. The bill passed [5]."
   → Uses [5] but only 4 sources exist! [5] is HALLUCINATED - DELETE IT.
❌ WRONG: "Policy analysis shows problems [7]. Expert opinions confirm [12]."
   → Uses [7] and [12] but maximum is [4]! These are HALLUCINATED - DELETE THEM.

🚨 RULE: If you see "EXACTLY N sources available", then [N+1], [N+2], [N+3]... are ALL HALLUCINATED and MUST BE DELETED.

EXAMPLE 3 - No sources provided:
Context shows: "User Question: What is a worker cooperative?" (No "Web Search Results" section)
✅ CORRECT: "A worker cooperative is a business owned and democratically controlled by its workers."
   → No sources, so NO citations used
❌ WRONG: "A worker cooperative is a business owned by its workers [1]."
   → No sources to cite! [1] is HALLUCINATED.

🚨 CRITICAL: Frontend users CLICK citations to see sources. Every [N] without a matching source = BROKEN LINK = BAD UX!
🚨 If you hallucinate citations, users click and nothing happens. This breaks trust.
🚨 Before submitting: Count your [N] citations and verify each has a matching source in "Web Search Results" above.

• **SOURCE FILTERING FOR PROGRESSIVE vs ESTABLISHMENT:**
  - If analyzing Mamdani/AOC/Bernie vs establishment: Use Democracy Now, Drop Site News, The Intercept, Jacobin
  - IGNORE: The Hill, Politico, Vital City NYC, CNN analysis
  - If only corporate sources available: Note this and present facts only, not their framing
• **GENERAL PRIORITIES:**
  1. Democracy Now, Drop Site News, The Intercept (independent analysis)
  2. Court docs, OpenSecrets (primary sources)
  3. ProPublica, Jacobin (investigative)
  4. Corporate media (basic facts only)

FORMATTING RULES (CRITICAL):
• Use PLAIN TEXT only - NO HTML tags
• Use double line breaks (\\n\\n) to separate PARAGRAPHS only
• Use single line breaks (\\n) within paragraphs
• **FOR LISTS:** You can use bullets (-) OR bold headers (**Header**) - either is fine
• Use [1], [2], [3] for superscript citations ONLY when sources provided in context
• ❌ DO NOT create a "Sources:" section at the end
• ❌ DO NOT list source names/URLs in your response
• ❌ DO NOT invent fake sources or write "Sources: Analysis based on..."
• ❌ DO NOT write explanatory notes about sources at the end
• The backend provides source links automatically - you only add citation numbers [1] [2] [3]

🚨 CRITICAL - CITATIONS AND SOURCES:
• IF you see "Web Search Results - X Sources Available" in the context: USE citations [1] through [X]
• IF you see "NO RELEVANT SOURCES FOUND" in the context: DO NOT use ANY citations at all
• NEVER write [1] [2] [3] without matching sources in the context
• NEVER create a "Sources:" paragraph - the frontend handles this automatically

CURRENT INFORMATION (CRITICAL):
• **READ SOURCES CAREFULLY:** If a source says "prepares to become mayor on January 1" → This means MAYOR-ELECT, not "running for mayor"
• If source says "election results show X won" → X is the WINNER/ELECT, not still "running"
• Use web search results provided above for up-to-date information
• Cite sources clearly with publication names and dates when available
• Base responses on the search results and official data provided
• If information is limited, acknowledge this clearly
• If no sources were found, respond from training data WITHOUT citations
• **VERIFY DATES:** Today is November 28, 2025. If a source is from today and says "prepares to become mayor in January 2026", this is FUTURE TENSE for an ALREADY-WON election

Write as one flowing analytical response that presents facts clearly and helps users discover truth. DO NOT add a Sources section - the system handles this automatically.`;
    
    return prompt;
}

/**
 * Extract source citations from AI response
 * V37.1.4 FIX: Filter out search page URLs that AI might include
 */
function extractSources(aiText, context) {
    const sources = [];
    
    // Add government sources from context
    if (context.governmentData && context.governmentData.sourceUrl) {
        // V37.1.4: Validate government source URL
        const govUrl = context.governmentData.sourceUrl;
        if (!govUrl.includes('/search?q=') && !govUrl.includes('duckduckgo.com')) {
            sources.push({
                type: 'government',
                title: context.governmentData.title || 'Official Government Document',
                url: govUrl
            });
        }
    }
    
    // Look for URLs in AI response
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = aiText.match(urlRegex) || [];
    
    urls.forEach(url => {
        // V37.1.4 CRITICAL FIX: Skip search pages and search engines
        // This prevents search URLs from being added as sources
        if (url.includes('/search?q=') || 
            url.includes('duckduckgo.com') || 
            url.includes('google.com/search') || 
            url.includes('bing.com/search')) {
            console.log(`  ⚠️ Filtered out search URL: ${url}`);
            return; // Skip this URL
        }
        
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
    searchCampaignFinance,
    // V37.2.0: New independent source functions
    searchWikipedia,
    searchBallotpedia,
    searchLocalNews,
    getKnownLocalRaceSources,
    // V37.3.0: Global RSS service
    rssService
};
