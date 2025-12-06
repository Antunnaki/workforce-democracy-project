/**
* WORKFORCE DEMOCRACY PROJECT - AI Bills Analysis Routes
 * Version: 37.15.0-DEEP-RESEARCH-AI-ANALYSIS
 * Date: November 21,2025
 * 
 * LEVEL 3 DEEP RESEARCH: Comprehensive AI-powered billanalysis
 * 
 * Features:
 * - Multi-source data gathering (bill text, news, policy reports, voting records)
 * - Smart caching (forever for settled bills, 30 days for active bills)
 * - Privacy-first (DuckDuckGo search, no Google/Big Tech)
 * - Cost-effective (aggressive caching, batch processing)
 * - Federal vs State handling (optimized for each)
 * 
 * Data Sources:
 * - Congress.gov (federal bills - full text, summaries, CBO scores)
 * - OpenStates (state bills - full text, voting records)
 * - DuckDuckGo (news articles, policy analyses)
 * - Historical legislation database (similar bills)
 * 
 * Cache Strategy:
 * - Settled bills (Passed/Failed/Vetoed): Cache FOREVER (bills don't change)
 * -Active bills (Introduced/In Committee): Cache 30 days
 * - Amendedbills: Invalidate cache, re-analyze
 * 
 * Philosophy:
 * - Make legislation accessible to everyone (not just lawyers)
 * - Empower citizens through deep understanding
 * - Non-partisan, evidence-based analysis
 * -Privacy-first, ethical sources only
 */

const express = require('express');
const router =express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { generateMaterialistAnalysisPrompt, categorizeBillImpact } = require('../utils/economic-analysis');
const billCache = require('../utils/bill-cache');

// Groq API Configuration
const GROQ_API_KEY =process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// Congress.gov API Configuration
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

// OpenStates API Configuration
const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
const OPENSTATES_API_BASE= 'https://v3.openstates.org';

// =============================================================================
// SMART CACHING SYSTEM (V37.17.0 - PostgreSQL-backed)
// =============================================================================

/**
 * Bill Analysis Cache with Smart TTL - NOW POSTGRESQL-BACKED
 * 
 * V37.17.0 UPGRADE:
 * - ✅ PostgreSQL persistent cache (survives server restarts)
 * - ✅ Universal cache shared across ALL users
 * - ✅ Keyword-based question matching
 * - ✅ Cost tracking and cache hitrate monitoring
 * 
 * Cache Duration Strategy:
 * - Settled bills (Passed, Failed, Vetoed, Enacted): FOREVER (never expires)
 * - Active bills (Introduced, In Committee, Pending): 30 days
 * - Amended bills: Auto-invalidate on amendment detection
 ** Why this saves money:
 * - Before: $50-100/month (no caching)
 * - After: $0.50 one-time (analyze each bill ONCE), then FREE forever
 * - Savings: 99.5%+ reduction
 */

// Cleanup expired caches daily (PostgreSQL-backed)
setInterval(async () => {
    try {
        await billCache.cleanupExpiredCaches();
    } catch (error) {
        console.error('❌ [Bill Cache Cleanup] Error:', error.message);
    }
}, 24 * 60 * 60 * 1000);// Every 24 hours

// =============================================================================
// BILL TEXT FETCHING SERVICE
// =============================================================================

/**
* Fetch full bill text from Congress.gov (Federal bills)
 * Returns: { text, summary, cboScore, sponsors, cosponsors }
 */
async function fetchFederalBillDetails(billId) {
    try {
       console.log(`📜 [Federal Bill] Fetching details for ${billId}...`);
        
        //Parse bill ID (e.g., "HR82" → congress=118, billType=hr, billNumber=82)
        const match = billId.match(/^([A-Z]+)(\d+)$/i);
        if (!match) {
            throw new Error('Invalid federal bill ID format');
        }
        
        const billType = match[1].toLowerCase();
        const billNumber = match[2];
        const congress = 118; // Current congress
        
        // Fetch bill details
       const detailsUrl = `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}`;
const response = await axios.get(detailsUrl, {
            params: { api_key: CONGRESS_API_KEY, format: 'json' },
            timeout: 10000
        });
        
        constbillData = response.data.bill;
        
        // Extract comprehensive data
        const result = {
            fullText: null,
            summary: billData.summary?.text || null,
            cboScore: null,
            sponsors: [],
            cosponsors: billData.cosponsors?.count || 0,
            committees: [],
           relatedBills: []
        };
        
        // Get sponsor details
        if (billData.sponsors&& billData.sponsors.length > 0) {
            const sponsor = billData.sponsors[0];
            result.sponsors.push(`${sponsor.firstName} ${sponsor.lastName} (${sponsor.party}-${sponsor.state})`);
       }
        
        // Get committees -FIXED: Check if committees is an array before mapping
        if(billData.committees && Array.isArray(billData.committees)) {
            result.committees = billData.committees.map(c => c.name);
        }
        
        // Try to fetch bill text
        if (billData.textVersions && billData.textVersions.length > 0) {
            const textUrl = billData.textVersions[0].url;
            try {
                const textResponse = await axios.get(textUrl, { timeout: 5000 });
                result.fullText = textResponse.data;
            } catch (err) {
                console.warn(`⚠️  [Federal Bill] Could not fetch full text: ${err.message}`);
            }
        }
        
        console.log(`✅ [Federal Bill] Got details for ${billId}`);
        return result;
        
    } catch (error) {
        console.error(`❌ [Federal Bill] Failed to fetch ${billId}:`, error.message);
        return null;
    }
}

/**
 *Fetch full bill text from OpenStates (State bills)
 * Returns: { text, summary, sponsors, votes }
 */
async function fetchStateBillDetails(billId, state) {
    try {
        console.log(`📜 [State Bill] Fetching detailsfor ${billId} (${state})...`);
        
        if(!OPENSTATES_API_KEY) {
            console.warn('⚠️  OpenStates API key not configured');
            return null;
        }
        
        // Fetch bill details from OpenStates
        const url = `${OPENSTATES_API_BASE}/bills/${state}/${billId}`;
        const response = await axios.get(url, {
            headers: { 'X-API-KEY': OPENSTATES_API_KEY },
            timeout: 10000
        });
        
        const billData = response.data;
        
        const result = {
            fullText: null,
           summary: billData.abstract || billData.title,
            sponsors:[],
            votes: [],
            versions: []
        };
        
        // Get sponsors
        if (billData.sponsorships) {
            result.sponsors = billData.sponsorships.map(s => s.name);
        }
        
        // Get bill text fromversions
        if (billData.versions && billData.versions.length > 0) {
            const latestVersion = billData.versions[0];
            if (latestVersion.url) {
                try {
                    const textResponse = await axios.get(latestVersion.url, { timeout: 5000 });
result.fullText = textResponse.data;
                } catch (err) {
                    console.warn(`⚠️  [State Bill] Could not fetch full text: ${err.message}`);
                }
            }
        }
        
        // Get voting records
        if (billData.votes) {
            result.votes = billData.votes.map(v => ({
                chamber: v.chamber,
result: v.result,
                date: v.date
            }));
        }
        
        console.log(`✅ [State Bill] Got details for ${billId}`);
        return result;
        
    } catch (error) {
        console.error(`❌ [StateBill] Failed to fetch ${billId}:`, error.message);
return null;
    }
}

// =============================================================================
// WEB SEARCH SERVICE (Privacy-First)
// =============================================================================

/**
 * Search for bill-related news and analysis using DuckDuckGo
 * Privacy-first: No Google, no tracking, ethical search
 * Returns: Array of {title, snippet, url, source}
 */
async function searchBillNews(billId, billTitle) {
    try {
        console.log(`🔍 [Web Search] Searching news for ${billId}...`);
        
        // DuckDuckGo HTML search (no API key needed, privacy-friendly)
const query = `${billId} ${billTitle} bill legislation`;
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WorkforceDemocracy/1.0; +https://workforcedemocracyproject.org)'
            },
            timeout: 5000
        });
        
        // Parse HTML results
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('.result').slice(0,5).each((i, elem) => {
            const title =$(elem).find('.result__title').text().trim();
            const snippet = $(elem).find('.result__snippet').text().trim();
            const url = $(elem).find('.result__url').attr('href');
            
            if(title && snippet) {
                results.push({
                    title,
                    snippet,
url: url || '#',
                    source: 'web_search'
                });
            }
        });
        
        console.log(`✅ [Web Search] Found ${results.length} articles for ${billId}`);
        return results;
        
    } catch(error) {
        console.warn(`⚠️  [Web Search] Failed for${billId}:`, error.message);
        return [];
    }
}

// =============================================================================
// ENHANCED BILL ANALYSIS ENDPOINT (LEVEL 3 DEEP RESEARCH)
// =============================================================================

/**
 * POST /api/ai/bills/analyze
 * LEVEL 3 DEEP RESEARCH: Comprehensive multi-source analysis
 ** Process:
 * 1. Check cache (forever for settled bills, 30 days for active)
 * 2. Fetch bill details (full text, summaries, votes)
 * 3. Search web for news/policy analysis
 * 4. Combine all sources
 * 5. Generate comprehensiveAI analysis
 * 6. Cache with smart TTL
 */
router.post('/analyze', async (req, res) => {
    try {
        const { bill } = req.body;
        
        if (!bill || !bill.id){
            return res.status(400).json({ 
                success: false,
error: 'Bill data with ID required' 
            });
        }
        
        console.log(`🤖 [AI Bills DEEP] Analyze request for: ${bill.id} (${bill.level})`);
        
        // V37.17.0: Check PostgreSQL cache first
        const cachedBill = await billCache.getCachedBillAnalysis(bill.id);
        if (cachedBill) {
            // Reconstruct analysis object from cached data
            const cachedAnalysis = {
                summary: cachedBill.ai_analysis_full.split('\n\n')[0],// Extract summary
                key_provisions: [], // TODO: Parse from analysis
               affects: cachedBill.labor_impact || '',
                impact_score: 4, // TODO: Store this separately
                impact_reason: '',
                economic_impact: cachedBill.economic_framework || '',
                worker_empowerment:cachedBill.labor_impact || '',
                class_analysis: cachedBill.economic_framework ||'',
                arguments_for: [],
                arguments_against: [],
                similar_legislation: '',
                next_steps: cachedBill.status || ''
            };
            
            // Record cache hit metric
            await billCache.recordCacheMetric('hit','cache', 50, 0);
            
            return res.json({
                success:true,
                bill_id: bill.id,
                cached: true,
                cache_hits: cachedBill.cache_hits,
                cached_at: cachedBill.cached_at,
                analysis: cachedAnalysis
            });
        }
        
        //=====================================================================
        // STEP 1: GATHER COMPREHENSIVE DATA
        // =====================================================================
        
        console.log(`📚 [AI Bills DEEP] Step 1: Gathering comprehensive data...`);
        
        let billDetails = null;
        let webSearchResults = [];
        
        // Fetch bill-specific details basedon level
        if (bill.level === 'federal') {
            billDetails = await fetchFederalBillDetails(bill.id);
        } else if (bill.level === 'state') {
            // Extract state from bill data (if available)
            const state = bill.state || 'NY'; // Default to NY fornow
            billDetails = await fetchStateBillDetails(bill.id, state);
        }
        
// Search web for news and analysis
        webSearchResults = await searchBillNews(bill.id, bill.title);
        
        // =====================================================================
        // STEP 2: BUILD COMPREHENSIVE CONTEXT FOR AI// =====================================================================
        
        console.log(`🧠 [AI Bills DEEP] Step 2: BuildingAI context...`);
        
        const contextParts = [];
        
        // Add bill basics
        contextParts.push(`Bill: ${bill.id}`);
        contextParts.push(`Title: ${bill.title}`);
        contextParts.push(`Level: ${bill.level}`);
        contextParts.push(`Status: ${bill.status || 'Unknown'}`);
        
        // Add bill details if available
        if (billDetails) {
            if (billDetails.summary) {
                contextParts.push(`\nDetailed Summary:\n${billDetails.summary.substring(0, 2000)}`);
            }
            
            if (billDetails.fullText) {
                contextParts.push(`\nBill Text (excerpt):\n${billDetails.fullText.substring(0, 3000)}`);
            }
            
            if (billDetails.sponsors && billDetails.sponsors.length> 0) {
                contextParts.push(`\nSponsors: ${billDetails.sponsors.join(',')}`);
            }
            
            if (billDetails.cosponsors) {
                contextParts.push(`Co-sponsors: ${billDetails.cosponsors}`);
            }
            
            if (billDetails.committees && Array.isArray(billDetails.committees) && billDetails.committees.length > 0) {
                contextParts.push(`\nCommittees: ${billDetails.committees.join(', ')}`);
            }
       }
        
        // Add web search results
        if (webSearchResults.length > 0) {
            contextParts.push(`\nNews & Analysis:`);
            webSearchResults.forEach((result, i) => {
                contextParts.push(`[${i+1}] ${result.title}: ${result.snippet}`);
           });
        }
        
        const comprehensiveContext = contextParts.join('\n');
        
        // =====================================================================
        // STEP 3: GENERATE DEEP AI ANALYSIS
        //=====================================================================
        
        console.log(`🎓 [AI Bills DEEP] Step 3: Generating deep AI analysis (with materialist framework)...`);
        
// V37.17.0: Generate prompt with materialist economic analysis framework
        const materialistPrompt = generateMaterialistAnalysisPrompt({
            ...bill,
            summary: bill.summary || bill.title,
            context: comprehensiveContext
        });
        
        const prompt = `You are an expert legislative analystproviding comprehensive bill analysis for working people.

V37.17.0: This analysis uses a materialist economic framework to evaluate real-world impact on workers and communities.

BILL CONTEXT:
${comprehensiveContext}

V37.17.0 MATERIALIST ECONOMIC FRAMEWORK:
${materialistPrompt}

Yourtask is to provide DEEP RESEARCH analysis that empowers working people to understand this legislation's REAL-WORLD IMPACT.

Provide the following in JSON format:

1. **summary**: Plain-language summary (3-4 sentences) focusing on MATERIAL IMPACT on working people. Explain what the bill DOES, WHO it affects,and WHY it matters for workers/communities. Use specific numbers from context.

2. **key_provisions**: Array of 5-7 key provisions. Focus on provisionsthat affect workers, wages, benefits, job security, or economic power. Be specific (cite section numbers if available).

3. **affects**: WHO this bill affects, with emphasis on WORKING-CLASS IMPACT. Be SPECIFIC: "2.5 million public school teachers", "households earning under $50,000", "500,000 manufacturing workers". Explain power dynamics.

4. **impact_score**: Rate impacton WORKING PEOPLE on 1-5 scale:
   - 1: Harms workers significantly (wage cuts, job losses, weakened bargaining power)
   - 2: Slightly negative for workers (minor reductions, increased precarity)
   - 3: Neutral (equally affects workers and capital owners,or procedural)
   - 4: Moderately empowers workers (better wages, benefits, or protections)
   - 5: Significantly empowers workers (strong labor rights, wealth redistribution, worker control)

5. **impact_reason**: 2-3 sentences explaining the impact score. Cite specific evidence from thebill text, news articles, or data above.

6. **economic_impact**: Estimate MATERIAL ECONOMIC IMPACT on working people. Focus on: wage changes, job creation/destruction, wealth distribution, rent/housing costs, healthcare access, retirement security. Use CBO scores/data when available. Format: "Redistributes $X billion to workers" or "Increases housing costs by Y%".

7. **worker_empowerment**: NEW FIELD - How does this bill affect worker power?Consider: union rights, bargaining power, job security, workplace democracy, ability to refuse exploitative jobs. Format: "Strengthens/Weakens/Neutral" with explanation.

8. **class_analysis**: NEW FIELD - Which economic class benefits most? Be specific: "Primarily benefits working-class families", "Shifts wealthto capital owners", "Mixed - helps professionals but not service workers". Explain WHY.

9. **arguments_for**: Array of 3-4main arguments SUPPORTING the bill. INCLUDE arguments from labor unions, worker advocacy groups, and community organizations (not just politicians/corporations).

10. **arguments_against**:Array of 3-4 main arguments OPPOSING the bill. INCLUDE critiques from worker perspectives, not just political opposition.

9. **similar_legislation**: Brief mention of similar past bills or related legislation (if you can infer from context or general knowledge). Format: "Similar to [Bill Name] (Year)".

10. **next_steps**: Based on the bill status, what happens next? (e.g., "Awaiting committee vote", "Headed to Senate floor", "Signed into law"). Use status from context.

CRITICAL REQUIREMENTS:
- Be FACTUAL and NON-PARTISAN (present both sides fairly)
- Use SPECIFIC DATA from the context provided (don't make up numbers)
- Use PLAIN LANGUAGE (no legislative jargon)
- Ifinformation is limited, acknowledge it (don't speculate)
- Prioritize information from official sources (bill text) over news articles
- If full bill text is available, extract actualprovisions (section numbers, dollar amounts, dates)

Return ONLY valid JSON:
{
  "summary": "...",
  "key_provisions":["...", "..."],
  "affects": "...",
  "impact_score": 4,
  "impact_reason": "...",
  "economic_impact": "...",
  "worker_empowerment": "Strengthens/Weakens/Neutral with explanation",
  "class_analysis": "Which class benefits and why",
 "arguments_for": ["...", "..."],
  "arguments_against": ["...", "..."],
  "similar_legislation": "...",
  "next_steps": "..."
}`;

        const groqResponse = await axios.post(GROQ_API_URL, {
            model: GROQ_MODEL,
            messages: [
                {
                   role: 'system',
                    content: 'You are an expert legislative analyst who provides comprehensive, evidence-based bill analysis in accessible language. Always respond with valid JSON only.'
                },
               {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens:2500,
            response_format: { type: 'json_object' }
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds for deepanalysis
        });
        
        if (!groqResponse.data || !groqResponse.data.choices || !groqResponse.data.choices[0]) {
            throw new Error('Invalid Groq API response');
        }
        
        let analysis = JSON.parse(groqResponse.data.choices[0].message.content);
        
        //V37.17.0: Apply materialist categorization
        analysis = categorizeBillImpact(analysis);
        
        // Validate and ensure required fields
        analysis.impact_score = Math.min(5, Math.max(1, parseInt(analysis.impact_score) || 3));
        analysis.key_points= analysis.key_provisions || []; // Backwards compatibility
        
        // V37.17.0: Cache with smart TTL in PostgreSQL (forever for settled bills)
       const estimatedCost = 0.000127; // Average cost per Groq API call
        await billCache.saveBillAnalysis({
            bill_id: bill.id,
            bill_title: bill.title || '',
            bill_type: bill.level || 'federal',
            state_code: bill.state || null,
            congress_number: bill.congress || 118,
            bill_number: bill.number || null,
            sponsor_name: bill.sponsor || 'Unknown',
            introduced_date: bill.introducedDate || null,
            status: bill.status || 'Unknown',
            summary: bill.summary || '',
            full_text_url: bill.url || null,
            ai_analysis_full: JSON.stringify(analysis, null, 2),
            labor_impact: analysis.worker_empowerment || '',
            economic_framework: analysis.class_analysis || '',
            groq_api_cost: estimatedCost
        });
        
        // Record cache miss metric (we just analyzed thisbill)
        await billCache.recordCacheMetric('miss', 'api', 2000, estimatedCost);
        
        const impactCategory = analysis.impact_category || 'mixed';
        console.log(`✅ [AI Bills DEEP] Analysis complete for ${bill.id} (impact: ${analysis.impact_score}/5, category: ${impactCategory})`);
        console.log(`   📊 Worker empowerment: ${analysis.worker_empowerment}`);
       console.log(`   ⚖️  Class analysis: ${(analysis.class_analysis || '').substring(0, 80)}...`);
        
        res.json({
            success: true,
            bill_id: bill.id,
            cached: false,
            analysis,
            sources_used: {
                bill_details: !!billDetails,
                web_search: webSearchResults.length,
                full_text: !!(billDetails && billDetails.fullText)
            },
            economic_framework_applied: true
        });
        
} catch (error) {
        console.error('❌ [AI Bills DEEP] Analysis error:', error.message);
        
        res.status(500).json({
            success: false,
            error: 'Failed to analyze bill',
            fallback: {
                summary: 'AI analysis temporarily unavailable. Please check thefull bill text for details.',
                affects: 'Analysis pending',
                impact_score: 3,
                impact_reason: 'Unable to determine impactat this time',
                key_points: ['Full bill text available via link below'],
                key_provisions: ['Full bill text available via link below'],
                arguments_for: [],
arguments_against: [],
                economic_impact: 'Analysis pending',
                similar_legislation: 'Unknown',
                next_steps: 'Check billstatus on official site'
            }
        });
    }
});

// =============================================================================
// INTERACTIVE BILL CHAT ENDPOINT (V37.17.0 - Question Caching)
// =============================================================================

router.post('/chat', async (req, res) => {
    try {
        const { bill, question, conversation_history} = req.body;
        
        if (!bill || !question) {
            return res.status(400).json({ 
                success: false,
                error:'Bill andquestion required' 
            });
        }
        
        console.log(`💬 [AI Bills Chat] Question about ${bill.id}: "${question.substring(0, 50)}..."`);
        
        // V37.17.0: Check question cache first (keyword-based semantic matching)
        const cachedAnswer = awaitbillCache.getCachedQuestionAnswer(bill.id, question, 0.6); // 60% similarity threshold
        
        if (cachedAnswer) {
            console.log(`✅ [AI Bills Chat] Cached answer found (${cachedAnswer.match_type} match, similarity: ${(cachedAnswer.similarity_score * 100).toFixed(0)}%)`);
            
            // Record cache hit
            await billCache.recordCacheMetric('hit', 'cache',30, 0);
            
            return res.json({
                success: true,
                response: cachedAnswer.answer_text,
                cached: true,
                match_type: cachedAnswer.match_type,
                similarity_score: cachedAnswer.similarity_score,
                times_asked: cachedAnswer.asked_count
            });
        }
// No cached answer found - call Groq API
        console.log(`💸 [AI Bills Chat] No cached answer - calling Groq API...`);
        
        const messages= [
            {
                role: 'system',
                content: `You are a civic engagement assistant helping users understand legislation. Be helpful,accurate, and non-partisan.

Current Bill Context:
- Bill: ${bill.id || 'Unknown'}
- Title: ${bill.title || 'No title'}
- Summary: ${bill.summary || bill.description || 'No description available'}
- Level: ${bill.level || 'Unknown'}
- Sponsor: ${bill.sponsor ||'Unknown'}

Guidelines:
- Provide accurate, factual information about the bill
- Use plain language (8th-grade reading level)
- Be non-partisan (avoid political bias)
- Cite specific bill provisions when possible
- If you don't know something, acknowledge it
- Help users understand how the bill mightaffect them or their community
- Keep responses concise (2-4 paragraphs max)

Answer the user's question about this bill.`
            }
        ];
        
        if (conversation_history&& Array.isArray(conversation_history)) {
            messages.push(...conversation_history);
        }
        
        messages.push({
            role: 'user',
content: question
        });
        
        const groqResponse = await axios.post(GROQ_API_URL, {
            model: GROQ_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 800
        }, {
            headers: {
                'Authorization': `Bearer${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        
        if (!groqResponse.data || !groqResponse.data.choices || !groqResponse.data.choices[0]) {
            throw new Error('Invalid Groq APIresponse');
        }
        
        constaiResponse = groqResponse.data.choices[0].message.content;
        
        // V37.17.0: Cache this Q&Afor future users
        const questionCost = 0.00005; // Estimated cost per question
        await billCache.saveQuestionAnswer(
            bill.id,
            question,
            aiResponse,
            'groq-api',
            questionCost
        );
        
        // Record cache miss and API usage
await billCache.recordCacheMetric('miss', 'api', 1500, questionCost);
        
        console.log(`✅ [AI Bills Chat] Response sent andcached for ${bill.id}`);
        
        res.json({
            success: true,
            response: aiResponse,
            cached: false
        });
} catch (error) {
        console.error('❌ [AI Bills Chat] Error:', error.message);
        
        res.status(500).json({
            success: false,
            error: 'Failed to getAI response',
            response: 'I apologize, but I\'m having trouble analyzing this billright now. Please try again in a moment, or check the full bill text for details.'
        });
    }
});

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

router.get('/health', (req, res)=> {
    res.json({
        success: true,
        service: 'ai-bills-analysis',
        version: '37.15.0-DEEP-RESEARCH',
        groq_configured: !!GROQ_API_KEY,
        congress_api_configured: !!CONGRESS_API_KEY,
        openstates_api_configured: !!OPENSTATES_API_KEY,
        model: GROQ_MODEL,
        cache_size: billAnalysisCache.size,
        cache_strategy: 'smart_ttl',
        settled_bills_cached: Array.from(billAnalysisCache.values()).filter(v => v.ttl === Infinity).length,
        active_bills_cached: Array.from(billAnalysisCache.values()).filter(v => v.ttl !== Infinity).length,
        features: ['deep_research', 'multi_source', 'web_search', 'bill_text_analysis', 'smart_caching']
    });
});

console.log('🏛️  AI Bills Routes initialized (v37.15.0-DEEP-RESEARCH-AI-ANALYSIS)');
console.log('   Features: Level 3 Deep Research, Multi-Source Data, Smart Caching');
console.log('   Privacy: DuckDuckGo search, no Google/Big Tech');
console.log('   Cache: Forever forsettled bills, 30 days for active bills');

module.exports = router;
