/**
* Civic Platform API Routes (CONSOLIDATED v37.1.0)
 * 
 * Main Express router for civic platform endpoints.
 * Integrates: Representatives lookup, LLM chat, scraping stats
 * 
 * Endpoints:
 * - GET  /api/civic/representatives/search - Search reps by ZIP* - POST /api/civic/llm-chat - LLM chat with source search
 * - GET  /api/civic/llm-health - Check LLM availability
 * - GET  /api/civic/health - Health check
 */

const express = require('express');
const { getRepresentativesByZip } = require('../us-representatives');
const { analyzeWithAI, generateCompassionateFallback } = require('../ai-service');
// V37.17.0: RE-ENABLED - Testing async LLM chat
const civicLLMAsync = require('../civic-llm-async');

const router = express.Router();

console.log('🏛️  Civic Platform API Routes initialized');

// =============================================================================
// REPRESENTATIVES
// =============================================================================

/**
 * GET /api/civic/representatives/search
 * Search for representatives by ZIP code
 */
router.get('/representatives/search', async (req, res) =>{
  try {
        const { zip, q, state, district, chamber } = req.query;
        
        // Accept ZIP code searches
        if (zip) {
            console.log(`🔍 ZIP code search: ${zip}`);
            
            // Validate ZIP code
            if (!/^\d{5}$/.test(zip)){
return res.status(400).json({
                    success: false,
                    error: 'Invalid ZIP code format. Please provide a 5-digit ZIP code.'
                });
            }
            
            // Fetch real representatives
            console.log(`📡 Fetching real representatives for ZIP: ${zip}`);
            constresult =awaitgetRepresentativesByZip(zip);
            
            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: result.error || 'Failed to fetch representatives',
                    query: { zip }
                });
            }
            
            console.log(`✅ Found ${result.representatives?.length || 0} representatives for ZIP ${zip}`);
            
            return res.json({
                success: true,
                query: { zip },
                representatives: result.representatives,
                results: result.representatives, // Keep for backward compatibility
                location: result.location_used || {},
                counts:result.counts,
data_sources: result.data_sources,
                message: 'Real data from Congress.gov & OpenStates APIs'
            });
        }
        
        if (!q && !state) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q","state", or"zip" is required'
            });
        }
        
        // TODO: Integrate with Congress.gov API for representative search
        res.json({
            success: true,
            query: { q, state, district, chamber },
            results: [],
            message: 'Representative search endpoint ready - Congress.gov integration pending'
});
} catch (error) {
        console.error('Error searching representatives:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// LLM CHAT WITH SOURCE SEARCH
// =============================================================================

/**
 * POST /api/civic/llm-chat
 * Send message to LLM and get response with automatic source search
 */
router.post('/llm-chat', async (req, res) => {
    try {
        const { message, context = 'general', conversationHistory = [], timezone } = req.body;
// Validate request
if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a string'
            });
        }
        
        if (!process.env.DASHSCOPE_API_KEY) {
           console.error('❌ DASHSCOPE_API_KEY not configured in environment');
            return res.status(500).json({
                success: false,
                error: 'LLM service not configured. Please contact administrator.'
            });
        }
        
console.log(`🤖 LLM Chat request: "${message.substring(0,50)}..." (context: ${context}, timezone: ${timezone || 'default'})`);
        
        // Build context object with timezone for date-aware responses
        const aiContext = {
            conversationHistory: conversationHistory,
            timezone: timezone|| 'America/New_York'  // Default to US Eastern if notprovided
        };
        
        //Call AI service (includes automatic source search)
        const result = await analyzeWithAI(message, aiContext, context);
        
        if (!result.success) {
            // Return fallback response
            return res.json({
success: true,
                message: generateCompassionateFallback(message,context),
                sources: [],
               context: context,
                fallback: true
            });
        }
        
        console.log(`✅ LLM response with ${result.sources?.length || 0} sources`);
        
        // Return response with sources
       res.json({
            success: true,
            message: result.response,
           sources: result.sources || [],
           context: context,
            metadata: result.metadata
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
    const hasApiKey = !!(process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY);
    
    res.json({
        success: true,
        available: hasApiKey,
        model: process.env.QWEN_MODEL || 'qwen-plus',
        provider: (process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY) ? 'Tongyi Lab' : 'None',
        message: hasApiKey 
            ? 'LLM service is available' 
            : 'API key not configured'
    });
});

// =============================================================================
// ASYNC JOB QUEUE ENDPOINTS (v37.9.12)
// =============================================================================
// TEMPORARILY DISABLED (V37.16.2 HOTFIX) - Causing crash on VPS
// These endpoints are not critical for representatives functionality

/**
 * POST /api/civic/llm-chat/submit
 * Submit query as asyncjob, get job ID immediately
 * V37.17.0: RE-ENABLED
 */
router.post('/llm-chat/submit', civicLLMAsync.submitQuery);

/**
 * GET /api/civic/llm-chat/status/:jobId* Check status of async job
 * V37.17.0: RE-ENABLED
 */
router.get('/llm-chat/status/:jobId', civicLLMAsync.getStatus);

/**
 * GET /api/civic/llm-chat/result/:jobId
 * Get result of completed job
 *V37.17.0: RE-ENABLED
 */
router.get('/llm-chat/result/:jobId', civicLLMAsync.getResult);

/**
 * GET /api/civic/llm-chat/stats
 * Get job queue statistics (for monitoring)
 * V37.17.0: RE-ENABLED
 */
router.get('/llm-chat/stats', civicLLMAsync.getStats);

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * GET /api/civic/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success:true,
status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            representatives: 'operational',
            llmChat: (process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY) ? 'operational' : 'not_configured'
        },
        version: '37.1.0'
    });
});

//=============================================================================
// ERROR HANDLING
// =============================================================================

/**
 *Error handling middleware
 */
router.use((error, req, res, next) => {
    console.error('Unhandled error in civic API:', error);
    
    res.status(500).json({
        success: false,
        error: 'Internalserver error',
        message: error.message
    });
});

module.exports= router;
