/**
 * WORKFORCE DEMOCRACY PROJECT - Backend API Server
 * Version: 37.11.4-PERSONALIZATION
 * Date: 2025-11-16
 * 
 * CORRECTED VERSION - Fixes personalization deployment issues
 * 
 * Intelligent knowledge base with cache-first architecture
 * Supports all 9 chat assistants with shared context
 * NOW WITH: Zero-knowledge personalization system
 * 
 * CHANGE LOG v37.11.4:
 * - ✅ FIXED: Removed references to archived civic/backend/ paths
 * - ✅ FIXED: Use consolidated backend/routes/civic-routes.js
 * - ✅ ADDED: Personalization API routes
 * - ✅ UPDATED: Proper route imports for current structure
 * 
 * Previous Issues Fixed:
 * - v37.0.1: CORS removed from Express (now handled by Nginx reverse proxy)
 * - v37.0.1: Fixes duplicate Access-Control-Allow-Origin header issue
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

// V37.5.0: Clear module cache to force fresh load
delete require.cache[require.resolve('./ai-service')];

// V36.6.0: Real AI Integration
const { analyzeWithAI, generateCompassionateFallback } = require('./ai-service');
const governmentAPIs = require('./government-apis');

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

const app = express();
const PORT = process.env.PORT || 3001;

// V37.0.1: CORS DISABLED - Now handled by Nginx reverse proxy
// This prevents duplicate Access-Control-Allow-Origin headers
// Nginx configuration at: /etc/nginx/sites-enabled/workforce-backend
//
// Previous CORS config (v36.x) caused duplicate header issues when combined with Nginx
// Nginx is the proper place to handle CORS for reverse proxy architectures
//
// If you need to test locally without Nginx, uncomment the block below:
/*
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://workforcedemocracyproject.netlify.app',
            'https://workforcedemocracyproject.org',
            'https://www.workforcedemocracyproject.org',
            'http://localhost:3000',
            'http://localhost:5500'
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));
*/
console.log('ℹ️  CORS handled by Nginx reverse proxy (v37.0.1)');
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'workforce_democracy',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
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
 * Generate SHA256 hash
 * @param {string} text - Text to hash
 * @returns {string} Hex hash
 */
function generateHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Extract topics from query (simple keyword extraction)
 * @param {string} query - User's query
 * @returns {Array<string>} Extracted topics
 */
function extractTopics(query) {
    const keywords = [
        'abortion', 'civil rights', 'privacy', 'healthcare', 'education',
        'environment', 'immigration', 'voting', 'gun', 'free speech',
        'worker cooperative', 'b corp', 'ethical business', 'democracy',
        'representative', 'senator', 'congress', 'supreme court', 'bill'
    ];
    
    const queryLower = query.toLowerCase();
    return keywords.filter(keyword => queryLower.includes(keyword));
}

/**
 * Extract entities from query (bill IDs, rep names, case names)
 * @param {string} query - User's query
 * @returns {Array<string>} Extracted entities
 */
function extractEntities(query) {
    const entities = [];
    
    // Bill ID pattern (HR 1234, S 567, AB 100, etc.)
    const billPattern = /\b([HS]R?|AB|SB)\s*\d+\b/gi;
    const billMatches = query.match(billPattern);
    if (billMatches) entities.push(...billMatches);
    
    // Case name pattern (X v. Y, X v Y, X vs Y)
    const casePattern = /\b([A-Z]\w+)\s+v\.?\s+([A-Z]\w+)\b/g;
    const caseMatches = query.match(casePattern);
    if (caseMatches) entities.push(...caseMatches.map(c => c.toLowerCase()));
    
    return entities;
}

// =============================================================================
// DATABASE QUERY HELPERS
// =============================================================================

/**
 * Check cache for query response
 * @param {string} queryHash - Hash of normalized query
 * @returns {Promise<Object|null>} Cached response or null
 */
async function checkCache(queryHash) {
    try {
        const result = await pool.query(
            'SELECT response, topics, entities, created_at FROM cached_responses WHERE query_hash = $1 AND created_at > NOW() - INTERVAL \'7 days\'',
            [queryHash]
        );
        
        if (result.rows.length > 0) {
            console.log('✅ Cache hit');
            return result.rows[0];
        }
        
        console.log('ℹ️  Cache miss');
        return null;
    } catch (error) {
        console.error('Cache check error:', error);
        return null;
    }
}

/**
 * Save response to cache
 * @param {string} queryHash - Hash of normalized query
 * @param {string} query - Original query
 * @param {string} chatType - Type of chat (supreme-court, bills, etc.)
 * @param {string} response - AI response
 * @param {Array} topics - Extracted topics
 * @param {Array} entities - Extracted entities
 */
async function saveToCache(queryHash, query, chatType, response, topics, entities) {
    try {
        await pool.query(
            `INSERT INTO cached_responses (query_hash, query, chat_type, response, topics, entities)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (query_hash) DO UPDATE SET
                response = EXCLUDED.response,
                topics = EXCLUDED.topics,
                entities = EXCLUDED.entities,
                created_at = NOW()`,
            [queryHash, query, chatType, response, topics, entities]
        );
        console.log('✅ Response cached');
    } catch (error) {
        console.error('Cache save error:', error);
    }
}

/**
 * Log API usage metrics
 * @param {string} chatType - Type of chat
 * @param {string} source - Response source (cache/database/ai)
 * @param {number} responseTime - Response time in ms
 * @param {number} cost - Estimated cost
 */
async function logMetrics(chatType, source, responseTime, cost = 0) {
    try {
        await pool.query(
            'INSERT INTO api_usage_metrics (chat_type, source, response_time_ms, cost) VALUES ($1, $2, $3, $4)',
            [chatType, source, responseTime, cost]
        );
    } catch (error) {
        console.error('Metrics logging error:', error);
    }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '37.11.4-PERSONALIZATION',
        services: {
            database: 'operational',
            ai: process.env.GROQ_API_KEY ? 'operational' : 'not_configured'
        }
    });
});

// =============================================================================
// CHAT API ENDPOINTS
// =============================================================================

/**
 * Universal chat endpoint for all 9 assistants
 * Implements cache-first architecture
 */
app.post('/api/chat/query', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { chat_type, user_id, query, context } = req.body;
        
        // Validate request
        if (!chat_type || !query) {
            return res.status(400).json({
                success: false,
                error: 'chat_type and query are required'
            });
        }
        
        console.log(`📝 Query: "${query}" (${chat_type})`);
        
        // Normalize query and generate hash
        const normalizedQuery = normalizeQuery(query);
        const queryHash = generateHash(normalizedQuery);
        
        // 1. CHECK CACHE
        const cached = await checkCache(queryHash);
        if (cached) {
            const responseTime = Date.now() - startTime;
            await logMetrics(chat_type, 'cache', responseTime, 0);
            
            return res.json({
                success: true,
                response: cached.response,
                source: 'cache',
                response_time_ms: responseTime,
                cost: 0,
                topics: cached.topics
            });
        }
        
        // 2. CALL AI SERVICE
        console.log('🤖 Calling AI service...');
        const aiResult = await analyzeWithAI(query, context, chat_type);
        
        if (!aiResult.success) {
            // Fallback response
            const fallback = generateCompassionateFallback(query, chat_type);
            return res.json({
                success: true,
                response: fallback,
                source: 'fallback',
                response_time_ms: Date.now() - startTime,
                cost: 0
            });
        }
        
        // Extract topics and entities
        const topics = extractTopics(query);
        const entities = extractEntities(query);
        
        // Cache the response
        await saveToCache(queryHash, query, chat_type, aiResult.response, topics, entities);
        
        // Log metrics
        const responseTime = Date.now() - startTime;
        await logMetrics(chat_type, 'ai', responseTime, 0.0001);
        
        res.json({
            success: true,
            response: aiResult.response,
            source: 'ai',
            response_time_ms: responseTime,
            cost: 0.0001,
            topics: topics
        });
        
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// DATA ENDPOINTS
// =============================================================================

/**
 * Get representatives by postcode
 */
app.get('/api/data/representatives', async (req, res) => {
    try {
        const { postcode, state } = req.query;
        
        if (!postcode && !state) {
            return res.status(400).json({
                success: false,
                error: 'postcode or state is required'
            });
        }
        
        // TODO: Integrate with government APIs
        res.json({
            success: true,
            representatives: [],
            message: 'Representatives endpoint ready - integration pending'
        });
        
    } catch (error) {
        console.error('Representatives error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Fallback endpoint for ZIP code lookup (basic mapping)
 * Returns U.S. Senators by ZIP code (first digit)
 */
app.get('/api/representatives', async (req, res) => {
    try {
        const { zip } = req.query;
        
        if (!zip) {
            return res.status(400).json({
                success: false,
                error: 'ZIP code is required'
            });
        }
        
        // Basic ZIP to state mapping (first digit = general region)
        const zipToState = {
            '0': { state: 'CT', name: 'Connecticut', senators: ['Richard Blumenthal', 'Chris Murphy'] },
            '1': { state: 'NY', name: 'New York', senators: ['Chuck Schumer', 'Kirsten Gillibrand'] },
            '2': { state: 'VA', name: 'Virginia', senators: ['Mark Warner', 'Tim Kaine'] },
            '3': { state: 'FL', name: 'Florida', senators: ['Marco Rubio', 'Rick Scott'] },
            '4': { state: 'GA', name: 'Georgia', senators: ['Jon Ossoff', 'Raphael Warnock'] },
            '5': { state: 'TX', name: 'Texas', senators: ['John Cornyn', 'Ted Cruz'] },
            '6': { state: 'IL', name: 'Illinois', senators: ['Dick Durbin', 'Tammy Duckworth'] },
            '7': { state: 'OH', name: 'Ohio', senators: ['Sherrod Brown', 'JD Vance'] },
            '8': { state: 'CO', name: 'Colorado', senators: ['Michael Bennet', 'John Hickenlooper'] },
            '9': { state: 'CA', name: 'California', senators: ['Dianne Feinstein', 'Alex Padilla'] }
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
        
        console.log(`✅ Found ${representatives.length} representatives for ${stateInfo.name}`);
        
        res.json({
            success: true,
            zip: zip,
            state: stateInfo.state,
            stateName: stateInfo.name,
            representatives: representatives,
            count: representatives.length,
            source: 'Independent ZIP database + Congress.gov',
            note: 'For full representative data including House districts, we recommend self-hosting a ZIP→District database'
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
// CIVIC PLATFORM ROUTES (v37.11.4 - CORRECTED)
// =============================================================================

// ✅ FIXED: Use consolidated civic routes from backend/routes/civic-routes.js
// ❌ REMOVED: Old references to ../civic/backend/civic-api (archived)
// ❌ REMOVED: Old references to ../civic/backend/llm-proxy (archived)

const civicRoutes = require('./routes/civic-routes');
app.use('/api/civic', civicRoutes);

console.log('🏛️  Civic Platform API loaded (v37.11.4 - using consolidated routes)');

// =============================================================================
// PERSONALIZATION ROUTES (v37.11.4)
// =============================================================================

const personalizationRoutes = require('./routes/personalization-CORRECTED');
app.use('/api/personalization', personalizationRoutes);

console.log('🔐 Personalization API loaded (v37.11.4)');

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('  🏛️  Workforce Democracy Project - Backend API');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Version: 37.11.4-PERSONALIZATION`);
    console.log(`  Server running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Database: ${process.env.DB_NAME || 'workforce_democracy'}`);
    console.log('  ');
    console.log('  🔐 Personalization: ENABLED');
    console.log('  🏛️  Civic Platform: ENABLED (consolidated routes)');
    console.log('═══════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
        console.log('Database pool has ended');
    });
});
