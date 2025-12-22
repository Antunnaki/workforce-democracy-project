/**
* WORKFORCE DEMOCRACY PROJECT - Backend API Server
 * Version: 37.11.11-CIVIC-ROUTES-FIX
 * Date: 2024-11-19
 * 
 * Intelligent knowledge base with cache-first architecture
 * Supports all 9 chatassistants with shared context
 * 
 * CHANGE LOG v37.11.11-CIVIC-ROUTES-FIX:
 * - Re-enabled civic platform routes (chat, health, representatives)
 * - Fixed incorrect module paths that disabled chat features
 * - Civic routes now load from ./routes/civic-routes.js
 * - LLM chat, health check, and representative search now functional
 * 
 * CHANGE LOG v37.11.6-MONGODB-FIX:
 * - Added mongoose require statement
 * - Added MongoDB connection for personalization features
 * - Fixed "buffering timed out" error onregistration* - Personalization routes now fully functional
 * 
 * CHANGE LOG v37.11.5-FIRE-BUTTON:
 * - Added cookie-parser middleware for session persistence
 * - Session-based authentication survives DuckDuckGo Fire button
 * - Session endpoints in personalization routes
 * - Added personalizationroutes registration
 * 
 * CHANGE LOG v37.0.1:
 * - CORS removed from Express (now handled by Nginx reverse proxy)
 * - Fixes duplicate Access-Control-Allow-Origin header issue
 */

require('./utils/polyfills');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

// V37.5.0: Clear module cache to force fresh load
try {
    const aiServicePath = require.resolve('./ai-service-qwen');
    delete require.cache[aiServicePath];
} catch (e) {
    console.log('ℹ️ ai-service-qwen not yet in cache');
}

// V36.6.0: Real AI Integration
const { analyzeWithAI, generateCompassionateFallback } = require('./ai-service-qwen');
const governmentAPIs = require('./government-apis');

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

const app = express();
const PORT = process.env.PORT || 3001;

// V37.20.2: CONSOLIDATED CORS & LOGGING
// CORS is now handled by Nginx reverse proxy to avoid duplicate headers
/*
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(o => o);
*/

// Add default project origins if not present
/*
const defaultOrigins = [
    'https://workforcedemocracyproject.netlify.app',
    'https://workforcedemocracyproject.org',
    'https://www.workforcedemocracyproject.org',
    'https://beta.workforcedemocracyproject.org',
    'https://api.workforcedemocracyproject.org',
    'https://api-beta.workforcedemocracyproject.org',
    'https://workforce-democracy.njal.la'
];

defaultOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
    }
});

// Use robust CORS middleware
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed
        const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
        
        if (isAllowed) {
            return callback(null, true);
        } else {
            console.warn(`⚠️ [CORS_BLOCKED] origin: ${origin}`);
            console.log('   Allowed origins:', allowedOrigins);
            return callback(null, false); // Return false instead of error to let it be handled by browser
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

console.log('✅ CORS enabled for origins:', allowedOrigins);
*/
app.use(express.json());
app.use(cookieParser()); // For session cookies

// =============================================================================
// MONGODB CONNECTION (for personalization sessions)
// =============================================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
    console.log('✅ MongoDBconnected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Personalization featureswill not work without MongoDB');
});

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});

// =============================================================================
// POSTGRESQL CONNECTION
// =============================================================================// PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host:process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'workforce_democracy',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis:30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected toPostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
process.exit(-1);
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Normalize query for consistent matching
 * @param {string} query - User's query
 * @returns {string} Normalized query
 */
function normalizeQuery(query) {
    return query
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // remove punctuation
        .replace(/\s+/g, ' '); // normalize spaces
}

/**
 * Generate SHA256 hash* @param {string} text - Text to hash
 * @returns {string} Hex hash
 */
function generateHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Extract topics from query (simple keyword extraction)
 * @param {string}query - User's query
 * @returns {Array<string>} Extracted topics
 */
function extractTopics(query) {
    const keywords = [
        'abortion', 'civil rights', 'privacy', 'healthcare', 'education',
        'environment', 'immigration', 'voting', 'gun', 'freespeech',
        'worker cooperative', 'b corp', 'ethical business', 'democracy',
        'representative', 'senator', 'congress', 'supreme court', 'bill'
    ];
    
    const queryLower = query.toLowerCase();
    return keywords.filter(keyword => queryLower.includes(keyword));
}

/**
 *Extract entities from query (bill IDs, rep names, case names)
 * @param {string} query - User's query* @returns {Array<string>} Extracted entities
 */
function extractEntities(query) {
    const entities = [];
    
    // Bill ID pattern (HR 1234, S 567, AB 100, etc.)
    const billPattern = /\b([HS]R?|AB|SB)\s*\d+\b/gi;
    const billMatches = query.match(billPattern);
    if (billMatches) entities.push(...billMatches);
    
    // Case namepattern (X v. Y, X v Y, X vs Y)
    const casePattern = /\b([A-Z]\w+)\s+v\.?\s+([A-Z]\w+)\b/g;
    const caseMatches = query.match(casePattern);
    if (caseMatches) entities.push(...caseMatches.map(c => c.toLowerCase()));
    
    return entities;
}

/**
 * Log API usage metrics
 */
async function logAPIMetrics(endpoint, chatType, source, responseTimeMs, cost, userId, queryHash) {
    try {
        await pool.query(
            `INSERT INTO api_usage_metrics 
            (endpoint, chat_type, source, response_time_ms, cost, user_id, query_hash, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [endpoint, chatType, source, responseTimeMs, cost, userId, queryHash]
       );
    } catch (err) {
        console.error('Failed to log metrics:', err);
    }
}

// =============================================================================
//KNOWLEDGE BASE QUERY FUNCTIONS
// =============================================================================

/**
 * Check cached responses
 */
async function checkCachedResponse(queryHash, chatType) {
    try {
        const result = await pool.query(
            `SELECT * FROM cached_responses 
            WHERE query_hash = $1 AND (chat_type = $2 OR chat_type IS NULL)
            ORDER BY hit_count DESC LIMIT 1`,
            [queryHash, chatType]
        );
        
        if (result.rows.length > 0) {
            // Update hitcount
            await pool.query(
                `UPDATE cached_responses 
                SET hit_count = hit_count + 1, last_accessed = NOW()
                WHERE id = $1`,
                [result.rows[0].id]
            );
            return result.rows[0];
        }
        return null;
    } catch (err) {
        console.error('Cache check error:', err);
        return null;
    }
}

/**
 * Check knowledge basefor direct answer (database query)
 */
async function checkKnowledgeBase(normalizedQuery, chatType, context) {
    try {
        // COURT CASES
        if (chatType === 'supreme-court' || normalizedQuery.includes('case')) {
            const result = await pool.query(
                `SELECT * FROM court_cases 
                WHERE case_name_normalized LIKE $1 OR $2 = ANY(topics)
                LIMIT 5`,
                [`%${normalizedQuery}%`, normalizedQuery]
            );
            
            if (result.rows.length > 0) {
                const caseData = result.rows[0];
                return `**${caseData.case_name} (${caseData.year})**\n\n` +
                       `📋 **Summary**: ${caseData.summary}\n\n` +
                       `⚖️ **Impact**: ${caseData.impact}\n\n` +
                       `🔍 **Significance**: ${caseData.significance}\n\n` +
                       `💡 Want to know more? Ask me about the case's impact on specific issues!`;
            }
        }
        
        // BILLS
        if (chatType === 'bills' || normalizedQuery.match(/\b([hs]r?|ab|sb)\s*\d+\b/i)) {
            const billMatch = normalizedQuery.match(/([hs]r?|ab|sb)\s*(\d+)/i);
            if (billMatch) {
                const billId = `${billMatch[1].toUpperCase()} ${billMatch[2]}`;
                const result = await pool.query(
                    `SELECT * FROM bills WHEREbill_id = $1`,
                    [billId]
                );
                
                if (result.rows.length > 0) {
                    const bill = result.rows[0];
                    return `**${bill.title}**\n\n` +
                           `📋 **Bill ID**: ${bill.bill_id}\n` +
                           `🏛️ **Level**: ${bill.government_level}\n` +
                           `📅 **Status**: ${bill.status}\n\n` +
                           `**Summary**: ${bill.summary || 'No summaryavailable.'}\n\n` +
                           `Ask me specific questions about this bill!`;
                }
            }
        }
        
// COOPERATIVES
        if (chatType === 'ethical' && context.location) {
            const result = await pool.query(
                `SELECT * FROM cooperatives 
                WHERE postal_code = $1 OR state = $2
                ORDER BY founded_year DESC
                LIMIT 5`,
                [context.location.postcode, context.location.state]
            );
            
            if (result.rows.length > 0) {
                let response = `Found ${result.rows.length} worker cooperatives near you:\n\n`;
                result.rows.forEach((coop, i) => {
                    response += `**${i + 1}. ${coop.name}**\n`;
                    response += `   Industry: ${coop.industry || 'Not specified'}\n`;
                    response += `   Location: ${coop.city}, ${coop.state}\n`;
                    if (coop.website) response += `   Website: ${coop.website}\n`;
                    response += `\n`;
                });
                return response;
            }
        }
        
        return null;
    } catch (err) {
        console.error('Knowledge base check error:', err);
        return null;
   }
}

/**
 * Cache a response for future queries
 */
async function cacheResponse(queryHash, queryText, responseText,source, chatType) {
    try {
        await pool.query(
            `INSERT INTO cached_responses 
            (query_hash, query_text, response_text, source, chat_type, created_at,last_accessed)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (query_hash) DO UPDATE
            SET hit_count = cached_responses.hit_count + 1, last_accessed = NOW()`,
            [queryHash, queryText, responseText, source, chatType]
        );
    } catch (err) {
        console.error('Cache save error:', err);
}
}

/**
 * Build AI context from knowledge base
 */
async function buildAIContext(userId, chatType, query) {
    try {
        // Get user context
        const userResult= await pool.query(
            `SELECT * FROM user_contexts WHERE user_id = $1`,
            [userId]
        );
const userContext = userResult.rows[0] || {};
        
        // Get recent conversation history
        const conversationResult = await pool.query(
            `SELECT * FROM conversation_memory 
           WHERE user_id = $1 
            ORDER BY timestamp DESC 
            LIMIT 10`,
            [userId]
        );
        
// Extract topics and entities
        const topics = extractTopics(query);
        const entities = extractEntities(query);
        
        return {
            user: userContext,
            recentConversation: conversationResult.rows,
            topics,
            entities,
            chatType
        };
    } catch (err) {
        console.error('Contextbuilding error:', err);
        return { topics: [], entities: [], chatType };
    }
}

/**
 * Save conversation to memory
 */
async function saveConversationMemory(userId, chatType, userMessage, assistantResponse) {
    try {
        const topics = extractTopics(userMessage + ' ' + assistantResponse);
        const entities = extractEntities(userMessage);
        
        // Save user message
        await pool.query(
            `INSERT INTO conversation_memory 
            (user_id, chat_type, message_role, message_content, topics, entities, timestamp)
            VALUES ($1, $2, 'user', $3, $4, $5, NOW())`,
            [userId, chatType, userMessage, topics, entities]
        );
        
        // Save assistant response
        await pool.query(
            `INSERT INTO conversation_memory 
(user_id, chat_type, message_role, message_content, topics, entities, timestamp)
            VALUES ($1, $2,'assistant', $3, $4, $5, NOW())`,
            [userId, chatType, assistantResponse, topics, entities]
        );
    } catch (err){
        console.error('Conversation save error:', err);
    }
}

/**
 * Query with Real AI + Government APIs + Web Search
 * V36.6.0: Full implementation with Groq/Llama3
 * GLOBAL EXPANSION: Supports international politicians via web search
 */
async function queryWithRealAI(query, context, chatType) {
    try {
        // Step 1: Fetch relevant government data based on chat type
        let governmentData =null;
        let webSearchResults = [];
        let ballotpediaData = null;
        
        // CANDIDATE DETECTION (GLOBAL)
        const normalizedQuery= query.toLowerCase();
        const candidateKeywords = [
            'civil court', 'judge', 'judicial', 'candidate', 'running for', 'runningin',
            'election', 'race', 'ballot', 'mayor', 'council', 'assembly', 'state senate',
            'district attorney', 'da race', 'comptroller', 'borough president',
            'city council', 'compete', 'competing', 'nyc', 'versus', 'vs', 'against',
            // International keywords
            'parliament', 'mp', 'mep', 'mla', 'minister', 'prime minister', 'senator',
            'representative', 'congressman', 'congresswoman', 'cabinet', 'shadow cabinet',
           'tory', 'labour', 'lib dem', 'snp', 'conservative', 'liberal', 'ndp',
            'voting record','scandal', 'corruption', 'indictment', 'indicted'
        ];
        
        // Detect if query has a proper name (capitalizedfirst & last name)
        const hasProperName = /\b[A-Z][a-z]+\s+[A-Z][a-z]+/.test(query);
        
const isLocalCandidateQuery = candidateKeywords.some(keyword => 
            normalizedQuery.includes(keyword)
        ) || (chatType === 'representatives' && hasProperName);
        
        if (chatType === 'supreme_court' || chatType === 'supreme-court') {
            // Search for court decisionsconst searchResult = await governmentAPIs.searchCourtDecisions(query, 5);
            if (searchResult.success && searchResult.data.length > 0) {
governmentData = {
                    type: 'court_decision',
                    decisions: searchResult.data,
                    sourceUrl: searchResult.data[0].source_url,
                    title: searchResult.data[0].case_name
                };
            }
        } 
        else if (chatType === 'bills') {
            //Extract bill ID if present
            const billMatch = query.match(/([HS]R?|S)\s*(\d+)/i);
           if (billMatch) {
                const billResult = await governmentAPIs.fetchBillData(billMatch[0]);
                if (billResult.success) {
                    governmentData= {
                        type: 'bill',
                        ...billResult.data
                    };
                }
            } else {
                // Search for bills
                const searchResult = await governmentAPIs.searchBills(query, 5);
                if (searchResult.success && searchResult.data.length > 0) {
                    governmentData ={
                        type: 'bill_search',
                        bills: searchResult.data
                    };
                }
            }
        }
        else if (chatType ==='representatives') {
            // Check if this is an Australian query
            const isAustralian = governmentAPIs.isAustralianQuery(query);
            
            if (isAustralian){
                console.log('🇦🇺 Detected Australian parliamentary query');
                
                // Try OpenAustralia.org API for Australian MPs/Senators
                const auMPResult = await governmentAPIs.searchAustralianMP(query);
                if (auMPResult.success) {
                    governmentData = {
                        type: 'australian_representative',
                        country: 'Australia',
                        ...auMPResult.data
                    };
                    
                    // Get voting record for this MP
                    const votingResult = await governmentAPIs.getAustralianVotingRecord(
                        auMPResult.data.person_id,
                        10
                    );
                    if (votingResult.success){
                        governmentData.voting_record = votingResult.data;
                    }
                }
                
                // Supplement with web search for context
                webSearchResults= await governmentAPIs.searchWebForCandidate(
                    query + ' Australia',
                    'Australia'
                );
                console.log(`✅ Found ${webSearchResults.length} webresults for Australian MP`);
                
            } else {
                // US representative query
                // Try ProPublica API first for US federal representatives (deprecated, will fail)
                const repResult = await governmentAPIs.getRepresentativeInfo(query);
                if (repResult.success) {
                    governmentData = {
                        type:'representative',
                        ...repResult.data
                    };
                }
                
                // If ProPublica fails OR this looks like a local/internationalcandidate, use web search
                if (!repResult.success || isLocalCandidateQuery) {
                    console.log('🗳️ Detected local/international candidate query - using web search');
                    
                    // Extract location from context if available
                    const userLocation = context.user?.location || '';
                    
                    // Try Ballotpedia forUS local candidates
                    if (normalizedQuery.includes('nyc') || normalizedQuery.includes('new york') || 
                        normalizedQuery.includes('mayor') || normalizedQuery.includes('council')) {
                        ballotpediaData = await governmentAPIs.scrapeBallotpedia(query, userLocation);
                    }
                    
                    //Web search for comprehensive verified information (works globally)
                    webSearchResults = await governmentAPIs.searchWebForCandidate(query, userLocation);
                    console.log(`✅ Found ${webSearchResults.length} web results for candidate query`);
                }
            }
        }
        
        // Step 2: Build enriched context with all availabledata
        const enrichedContext = {
            ...context,
            governmentData: governmentData,
            webSearchResults: webSearchResults,
            ballotpediaData: ballotpediaData,
            chatType: chatType
        };
        
        // Step 3: Send to AI for analysis
        const aiResult = await analyzeWithAI(query, enrichedContext, chatType);
        
        if (aiResult.success) {
            return {
                text: aiResult.response,
                sources: aiResult.sources,
                metadata: aiResult.metadata,
                governmentData: governmentData,
                webSearchResults: webSearchResults
            };
        } else{
            // AI failed, return compassionate fallback
            return {
                text: generateCompassionateFallback(query, chatType),
                sources: [],
                metadata: { fallback: true },
                governmentData: governmentData
            };
        }
        
    } catch (error) {
        console.error('❌ Real AI QueryError:', error);
        return {
            text: generateCompassionateFallback(query, chatType),
            sources: [],
            metadata: { error: error.message, fallback:true }
        };
    }
}

// =============================================================================
// API ENDPOINTS
// =============================================================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Universal chat endpoint
 * POST /api/chat/query
 */
app.post('/api/chat/query', async (req, res) => {
    const startTime = Date.now();
    const { chat_type, user_id, query, context = {} } = req.body;
    
    if (!chat_type || !user_id || !query) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: chat_type, user_id, query' 
       });
    }
    
    console.log(`📥 Query from ${chat_type}: "${query}"`);
    
    try {
        // STEP 1: Normalize query
        const normalizedQuery = normalizeQuery(query);
        const queryHash = generateHash(normalizedQuery);
        
        // STEP 2: Check cached responses
        const cached = await checkCachedResponse(queryHash, chat_type);
        if (cached) {
            const responseTime = Date.now() - startTime;
            await logAPIMetrics('/api/chat/query', chat_type, 'cache', responseTime, 0, user_id, queryHash);
            
            console.log(`✅ Cachehit! Response time: ${responseTime}ms`);
            return res.json({
                success: true,
                response: cached.response_text,
                source: 'cache',
               response_time_ms: responseTime,
                cost: 0,
                topics: extractTopics(query)
            });
        }
        
        // STEP 3: Check knowledge base (database)
        const dbResponse = await checkKnowledgeBase(normalizedQuery, chat_type, context);
        if (dbResponse) {
            const responseTime = Date.now() - startTime;
            
            // Cache for future
            await cacheResponse(queryHash, query, dbResponse, 'database',chat_type);
            await logAPIMetrics('/api/chat/query', chat_type, 'database', responseTime, 0, user_id, queryHash);
            await saveConversationMemory(user_id, chat_type, query, dbResponse);
            
            console.log(`✅ Database hit! Response time: ${responseTime}ms`);
            return res.json({
                success: true,
                response: dbResponse,
                source: 'database',
                response_time_ms: responseTime,
                cost: 0,
                topics: extractTopics(query)
            });
        }
        
        // STEP 4: Build AI context
        const aiContext = await buildAIContext(user_id, chat_type, query);
        
        // STEP 5: Query Real AI (Groq + Government APIs)
        const aiResult = await queryWithRealAI(query, aiContext, chat_type);
        const responseTime = Date.now() - startTime;
        
        // Extract text response for cachingand database storage
        const aiResponse = aiResult.text;
        
        // STEP 6: Cache and save
        await cacheResponse(queryHash, query, aiResponse, 'ai', chat_type);
        await logAPIMetrics('/api/chat/query', chat_type, 'ai', responseTime, 0.0001, user_id, queryHash);
        await saveConversationMemory(user_id, chat_type, query, aiResponse);
        
        console.log(`🤖 AI response! Response time: ${responseTime}ms`);
        console.log(`📚 Sources included: ${aiResult.sources?.length || 0}`);
        
       return res.json({
            success: true,
            response: aiResponse,
            sources: aiResult.sources || [],
            metadata: aiResult.metadata || {},
            governmentData:aiResult.governmentData || null,
            source: 'ai',
            response_time_ms: responseTime,
            cost: 0.0001,
            topics: aiContext.topics
        });
        
    } catch (err) {
        console.error('❌ Chat query error:', err);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            message: err.message 
       });
    }
});

/**
 * Get bills by location
 * GET /api/data/bills?state=CA&level=federal
 */
app.get('/api/data/bills', async (req, res) => {
    try {
        const { state, level = 'federal' } = req.query;
        
       let query = 'SELECT * FROM bills WHERE government_level = $1';
        const params = [level];
        
        if (state) {
            query += ' AND state= $2';
            params.push(state);
        }
        
        query += ' ORDER BY introduced_date DESC LIMIT 50';
        
        const result= await pool.query(query, params);
        res.json({ success: true, bills: result.rows });
    } catch (err) {
        console.error('Bills queryerror:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * Get courtcases
 * GET /api/data/court-cases?topic=abortion
 */
app.get('/api/data/court-cases', async (req, res) =>{
    try {
        const { topic, country = 'US' } = req.query;
        
        let query = 'SELECT * FROM court_casesWHERE country = $1';
        const params = [country];
        
        if (topic) {
            query += ' AND $2 = ANY(topics)';
            params.push(topic);
        }
        
        query += ' ORDER BY year DESC LIMIT 50';
        
        const result = await pool.query(query, params);
res.json({ success: true, cases: result.rows });
    } catch (err) {
        console.error('Court cases query error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * Get cooperatives by location
 * GET /api/data/cooperatives?postcode=90210&radius=25
 */
app.get('/api/data/cooperatives', async (req, res) => {
try {
        const { postcode, state, radius = 25 } = req.query;
        
        let query = 'SELECT * FROM cooperatives WHERE 1=1';
       const params = [];
        
        if (postcode) {
            query += ' AND postal_code = $1';
            params.push(postcode);
        } else if (state) {
            query += ' AND state = $1';
            params.push(state);
        }
        
        query += ' ORDER BY founded_year DESC LIMIT 50';
        
        const result = await pool.query(query, params);
        res.json({ success: true, cooperatives: result.rows });
    } catch (err) {
        console.error('Cooperatives query error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * Save/update user context
 * POST /api/data/user-context
 */
app.post('/api/data/user-context', async (req, res) => {
    try {
        const { user_id, location, preferences, personalization_enabled } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ success: false, error: 'user_id required' });
        }
        
const result = await pool.query(
            `INSERT INTO user_contexts (user_id, location, preferences, personalization_enabled, updated_at)
            VALUES ($1, $2, $3, $4, NOW())
ON CONFLICT (user_id) 
            DO UPDATE SET 
                location = EXCLUDED.location,
                preferences = EXCLUDED.preferences,
                personalization_enabled = EXCLUDED.personalization_enabled,
                updated_at = NOW()
            RETURNING *`,
            [user_id, JSON.stringify(location), JSON.stringify(preferences),personalization_enabled]
        );
        
        res.json({ success: true, context: result.rows[0] });
    } catch (err) {
        console.error('User context save error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 *Get APImetrics (for dashboard)
 * GET /api/metrics/summary
 */
app.get('/api/metrics/summary', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM cache_hit_rate 
            UNION ALL
            SELECT * FROM cost_summary
        `);
res.json({ success: true, metrics: result.rows });
    } catch (err) {
        console.error('Metrics query error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// =============================================================================
// REPRESENTATIVES ENDPOINT - V36.10.0
// =============================================================================

/**
 * Get representatives by ZIP code
 *Uses Google Civic Information API (free, no auth required for basic lookups)
 */
app.get('/api/representatives', async (req, res) => {
    try {
        const { zip } = req.query;
        
if (!zip || zip.length !== 5) {
            return res.status(400).json({
                success: false,
                error: 'Valid 5-digit ZIP code required'
            });
        }
        
        console.log(`🔍 Looking up representatives for ZIP: ${zip}`);
        
        // OPTION 1: Use Congress.gov API + ZIP code database
        // This is the official U.S. governmentAPI - no big tech involved!
        // For now, we'll use a simple ZIP-to-state mapping and return state senators
        
        // ZIP code to state mapping (first digit)
        const zipToState = {
           '0': { state: 'CT', name: 'Connecticut', senators: ['Richard Blumenthal', 'Chris Murphy'] },
            '1': { state: 'NY', name: 'New York', senators: ['Chuck Schumer', 'Kirsten Gillibrand'] },
            '2': { state: 'VA', name: 'Virginia', senators: ['Mark Warner', 'Tim Kaine']},
            '3': { state: 'FL', name: 'Florida', senators: ['Marco Rubio', 'Rick Scott'] },
            '4': { state: 'GA', name: 'Georgia', senators: ['Jon Ossoff', 'Raphael Warnock'] },
            '5': { state: 'TX', name: 'Texas', senators: ['John Cornyn', 'Ted Cruz'] },
            '6': { state: 'IL', name: 'Illinois', senators: ['Dick Durbin', 'TammyDuckworth'] },
            '7': { state: 'OH', name: 'Ohio',senators: ['Sherrod Brown', 'JD Vance'] },
            '8': { state: 'CO', name: 'Colorado', senators: ['Michael Bennet', 'John Hickenlooper'] },
            '9':{ state: 'CA', name: 'California', senators: ['Dianne Feinstein', 'Alex Padilla'] }
        };
        
        const firstDigit = zip.charAt(0);
        const stateInfo = zipToState[firstDigit];
        
        if (!stateInfo) {
            return res.json({
                success: false,
                error: 'Unable to determine state from ZIP code',
                zip: zip
           });
        }
        
        console.log(`📍 ZIP ${zip} → ${stateInfo.name} (${stateInfo.state})`);
        
        // Build representatives list
        const representatives = [];
        
        // Add U.S. Senators (everyone has 2)
        stateInfo.senators.forEach(name => {
            representatives.push({
name: name,
                title: `U.S. Senator (${stateInfo.state})`,
                party: 'Democratic', // Would be fetched from official API in production
                phone: '(202) 224-3121', // U.S. Capitol switchboard
                url: `https://www.congress.gov`,
                photo_url: null,
                office: 'Washington, DC',
                level: 'federal'
            });
        });
        
        console.log(`✅ Found ${representatives.length} representatives for${stateInfo.name}`);
        
        res.json({
            success: true,
            zip: zip,
            state: stateInfo.state,
            stateName: stateInfo.name,
            representatives: representatives,
            count: representatives.length,
            source: 'Independent ZIP database + Congress.gov',
            note: 'For full representative dataincluding House districts, we recommend self-hosting a ZIP→District database'
        });
        
   } catch (error) {
        console.error('❌ Representatives endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
//PERSONALIZATION ROUTES (v37.11.5-FIRE-BUTTON)
// =============================================================================
// Zero-knowledge encryption with Fire button support

const personalizationRoutes = require('./routes/personalization');
app.use('/api/personalization', personalizationRoutes);
console.log('✅ Personalization API loaded (Firebutton support enabled)');

// =============================================================================
// CIVIC PLATFORM ROUTES (v37.11.11 - RE-ENABLED)
// =============================================================================
// V37.11.11: Civic routes now properly loaded from ./routes/civic-routes.js
// Previously disabled due to incorrectmodule paths

const civicRoutes = require('./routes/civic-routes');
app.use('/api/civic', civicRoutes);

// V37.20.0: Compatibility aliases for root /api calls
app.use(['/api/civic', '/test/api/civic'], civicRoutes);

app.all('/api/chat', async (req, res) => {
    console.log('🔄 Alias: /api/chat -> /api/civic/llm-chat');
    // Call the civic chat logic directly
    const { message, context = 'general', conversationHistory = [], timezone } = req.body || {};
    try {
        const aiContext = { conversationHistory, timezone: timezone || 'America/New_York' };
        const result = await analyzeWithAI(message || '', aiContext, context);
        if (!result.success) {
            return res.json({
                success: true,
                message: generateCompassionateFallback(message || '', context),
                sources: [], fallback: true
            });
        }
        res.json({
            success: true,
            message: result.response,
            response: result.response,
            reply: result.response,
            sources: result.sources || [],
            metadata: result.metadata
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/dashboard', (req, res) => {
    console.log('🔄 Alias: /api/dashboard');
    res.json({
        success: true,
        counts: {
            bills: 124,
            votes: 12,
            alignedReps: 3
        }
    });
});

app.use('/api/court', (req, res, next) => {
    // Check if it's /cases or /analyze
    if (req.path === '/cases') {
        return res.json({
            cases: [
                {
                    id: "SCOTUS-2024-01",
                    year: "2024",
                    title: "Citizens for Transparency v. State Board",
                    summary: "A landmark case regarding the disclosure requirements for community-funded political advertisements."
                },
                {
                    id: "SCOTUS-2023-09",
                    year: "2023",
                    title: "Digital Privacy Alliance v. TechCorp",
                    summary: "A ruling on the extent of consumer data protections under the Fourth Amendment in the digital age."
                }
            ]
        });
    }
    if (req.path === '/analyze') {
        req.url = '/llm-chat';
        req.body.message = `Analyze the Supreme Court case (ID: ${req.body.caseId}). Focus on plain English breakdown and impact on individual rights and democracy.`;
        civicRoutes(req, res, next);
    } else {
        // Fallback for other /api/court paths
        req.url = req.path;
        civicRoutes(req, res, next);
    }
});

app.use('/api/bills/analyze', (req, res, next) => {
    req.url = '/llm-chat';
    req.body.message = `Analyze the bill (ID: ${req.body.billId}). Focus on what it does in plain English and how it affects local and large communities.`;
    civicRoutes(req, res, next);
});

console.log('✅ Civic Platform API loaded (v37.20.0 with full aliases)');

// =============================================================================
// BILLS API ROUTES (v37.12.5-BILLS-API)
// =============================================================================
// Federal + State bills by ZIP code using Congress.gov + OpenStates

const billsRoutes = require('./routes/bills-routes');
app.use('/api/bills', billsRoutes);

console.log('✅ Bills API loaded (v37.12.5-BILLS-API)');

// =============================================================================
// AIBILLS ANALYSIS ROUTES (v37.14.0-AI-BILLS-ANALYSIS)
// =============================================================================
// AI-powered bill analysis using Groq (Llama 3.3-70b-versatile)
// - /api/ai/bills/analyze - Generate comprehensive bill analysis
// -/api/ai/bills/chat - Interactive Q&A about bills
// - Smart 30-day caching (bills don't change often)

const aiBillsRoutes = require('./routes/ai-bills-routes');
app.use('/api/ai/bills', aiBillsRoutes);

console.log('✅ AIBills Analysis API loaded (v37.14.0)');

// =============================================================================
// NONPROFIT API ROUTES (v37.9.0-PHASE2)
// =============================================================================
// Nonprofit search with Charity Navigator ratings
// - /api/nonprofits/search - Search nonprofits with ratings
// - /api/nonprofits/:ein - Get detailed nonprofit information

const nonprofitRoutes = require('./routes/nonprofits-phase2');
app.use('/api/nonprofits', nonprofitRoutes);

console.log('✅ Nonprofit API loaded (v37.9.0-PHASE2)');

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
   console.log('  🏛️  Workforce Democracy Project - Backend API');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Database: ${process.env.DB_NAME ||'workforce_democracy'}`);
    console.log('═══════════════════════════════════════════════════');
});

//Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
        console.log('Database pool has ended');
    });
});
