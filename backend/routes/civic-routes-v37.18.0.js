/**
 * Civic Platform API Routes (CONSOLIDATED v37.18.0)
 * 
 * Main Express router for civic platform endpoints.
 * Integrates: Representatives lookup, LLM chat with SMART ROUTING, scraping stats
 * 
 * NEW v37.18.0: Smart Router for Deep Research AI
 * - Detects voting/policy questions → Routes to Deep Research (Congress.gov + DuckDuckGo)
 * - Detects general questions → Routes to Generic Chat (RSS feeds)
 * 
 * Endpoints:
 * - GET  /api/civic/representatives/search - Search reps by ZIP
 * - POST /api/civic/llm-chat/submit - Smart LLM chat with deep research routing
 * - GET  /api/civic/llm-chat/status/:jobId - Check job status
 * - GET  /api/civic/llm-chat/result/:jobId - Get job result
 * - GET  /api/civic/llm-chat/stats - Job queue stats
 * - GET  /api/civic/health - Health check
 */

const express = require('express');
const { getRepresentativesByZip } = require('../us-representatives');
const { analyzeWithAI, generateCompassionateFallback } = require('../ai-service');
// V37.17.0: RE-ENABLED - Testing async LLM chat
const civicLLMAsync = require('../civic-llm-async');

const router = express.Router();

console.log('🏛️  Civic Platform API Routes initialized');
console.log('✨ V37.18.0: Smart Router for Deep Research AI enabled');

// =============================================================================
// REPRESENTATIVES
// =============================================================================

/**
 * GET /api/civic/representatives/search
 * Search for representatives by ZIP code
 */
router.get('/representatives/search', async (req, res) => {
    try {
        const { zip, q, state, district, chamber } = req.query;
        
        // Accept ZIP code searches
        if (zip) {
            console.log(`🔍 ZIP code search: ${zip}`);
            
            // Validate ZIP code
            if (!/^\d{5}$/.test(zip)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ZIP code format. Please provide a 5-digit ZIP code.'
                });
            }
            
            // Fetch real representatives
            console.log(`📡 Fetching real representatives for ZIP: ${zip}`);
            const result = await getRepresentativesByZip(zip);
            
            if (result.success) {
                console.log(`✅ Found ${result.representatives.length} representatives for ZIP ${zip}`);
                return res.json(result);
            } else {
                console.error(`❌ Error for ZIP ${zip}:`, result.error);
                return res.status(500).json(result);
            }
        }
        
        // Return error if no valid search parameter
        return res.status(400).json({
            success: false,
            error: 'Please provide a zip parameter (5-digit ZIP code)'
        });
        
    } catch (error) {
        console.error('❌ Error in representatives/search:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// =============================================================================
// ASYNC LLM CHAT WITH SMART ROUTING (V37.18.0)
// =============================================================================

/**
 * POST /api/civic/llm-chat/submit
 * Smart router: Detects if query needs Deep Research AI or Generic Chat
 * 
 * Deep Research triggers:
 * - Questions about voting records, bills, policy positions
 * - Context includes representative information
 * - Keywords: vote, voting, bill, sponsored, legislation, policy, position
 * 
 * Generic Chat triggers:
 * - General questions, definitions, explanations
 * - No specific representative context
 * 
 * V37.18.0: Routes to Deep Research AI for representative voting/policy questions
 */
router.post('/llm-chat/submit', async (req, res) => {
    try {
        const { message, context, conversationHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log('[Civic LLM Smart Router v37.18.0] 📤 Analyzing query:', message.substring(0, 100));
        
        // Detect if query needs deep research
        const deepResearchKeywords = [
            'vote', 'voting', 'voted', 'how does', 'healthcare bill', 'healthcare',
            'sponsored', 'co-sponsor', 'legislation', 'policy', 'bill',
            'support', 'oppose', 'position on', 'record on', 'stance',
            'congressman', 'senator', 'representative', 'voting record'
        ];
        
        const messageLower = message.toLowerCase();
        const needsDeepResearch = deepResearchKeywords.some(keyword => 
            messageLower.includes(keyword)
        );
        
        // Check if viewing a representative
        const hasRepContext = context?.viewingContent?.type === 'representative';
        
        // Route to Deep Research AI if needed
        if (needsDeepResearch && hasRepContext) {
            console.log('🔬 [Smart Router] → Deep Research AI (representative voting/policy query)');
            console.log('   Representative:', context.viewingContent.name);
            console.log('   Query keywords detected:', deepResearchKeywords.filter(k => messageLower.includes(k)));
            
            // Use deep research for representative analysis
            return await handleDeepResearchQuery(message, context, res);
        }
        
        // Otherwise use generic async chat
        console.log('💬 [Smart Router] → Generic Chat (general question)');
        return await civicLLMAsync.submitQuery(req, res);
        
    } catch (error) {
        console.error('[Civic LLM Smart Router] ❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Handle Deep Research queries about representatives
 * Uses AI Service with deep research enabled (Congress.gov + DuckDuckGo)
 * 
 * V37.18.0: Returns immediate result in async job format for frontend compatibility
 */
async function handleDeepResearchQuery(message, context, res) {
    try {
        const repName = context?.viewingContent?.name || 'Unknown';
        const repState = context?.viewingContent?.state;
        const repChamber = context?.viewingContent?.chamber;
        
        console.log(`🔬 [Deep Research] Analyzing ${repName}'s record on: ${message}`);
        
        // Build search query for deep research
        const searchQuery = `"${repName}" ${message} site:congress.gov OR site:propublica.org OR site:senate.gov OR site:house.gov`;
        
        console.log(`🔍 [Deep Research] Search query: ${searchQuery}`);
        
        // Call AI service with deep research enabled
        // This will trigger DuckDuckGo search + Congress.gov API
        const result = await analyzeWithAI(
            message,
            [], // No pre-fetched sources, let deep research find them
            {
                type: 'representativeAnalysis',
                representative: repName,
                state: repState,
                chamber: repChamber,
                enableDeepResearch: true,
                searchQuery: searchQuery,
                requireCitations: true
            }
        );
        
        console.log(`✅ [Deep Research] Analysis complete for ${repName}`);
        console.log(`   Sources found: ${result.sources?.length || 0}`);
        
        // Generate job ID for tracking
        const jobId = `deep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Return in async job format for frontend compatibility
        // Status is "completed" immediately because deep research is synchronous
        res.status(202).json({
            jobId: jobId,
            status: 'completed', // Instant completion for deep research
            message: 'Deep research analysis completed',
            result: {
                response: result.analysis || result.response || result,
                sources: result.sources || [],
                metadata: {
                    researchType: 'deep',
                    representative: repName,
                    state: repState,
                    sourceCount: result.sources?.length || 0,
                    processingTime: result.processingTime || 0
                }
            },
            statusUrl: `/api/civic/llm-chat/status/${jobId}`,
            resultUrl: `/api/civic/llm-chat/result/${jobId}`
        });
        
    } catch (error) {
        console.error('[Deep Research] ❌ Error:', error);
        
        // Return fallback response
        res.status(202).json({
            jobId: `error-${Date.now()}`,
            status: 'completed',
            result: {
                response: `I apologize, but I encountered an error while researching this topic. Error: ${error.message}`,
                sources: [],
                metadata: {
                    researchType: 'error',
                    error: error.message
                }
            }
        });
    }
}

/**
 * GET /api/civic/llm-chat/status/:jobId
 * Check status of async job
 * V37.17.0: RE-ENABLED
 */
router.get('/llm-chat/status/:jobId', civicLLMAsync.getStatus);

/**
 * GET /api/civic/llm-chat/result/:jobId
 * Get result of completed job
 * V37.17.0: RE-ENABLED
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
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            representatives: 'operational',
            llmChat: process.env.GROQ_API_KEY ? 'operational' : 'not_configured',
            deepResearch: 'operational' // V37.18.0
        },
        version: '37.18.0',
        features: ['smart_routing', 'deep_research', 'async_jobs']
    });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Error handling middleware
 */
router.use((error, req, res, next) => {
    console.error('Unhandled error in civic API:', error);
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

module.exports = router;
