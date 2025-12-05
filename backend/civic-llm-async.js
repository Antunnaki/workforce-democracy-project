/**
 * Civic LLM Chat - Async Job Version
 * v37.18.11 - FINAL FIX
 * 
 * FIXES APPLIED:
 * - v37.18.10: Changed generateResponse → analyzeWithAI (function didn't exist)
 * - v37.18.11: Removed redundant rssService.searchFeeds() call
 *   * analyzeWithAI() already does iterative source searching internally
 *   * It has deep research, source gap analysis, and reaches SOURCE_THRESHOLD
 *   * Calling searchFeeds first was causing wrong/minimal results
 * 
 * Endpoints:
 * - POST /api/civic/llm-chat/submit - Submit query, get job ID
 * - GET /api/civic/llm-chat/status/:jobId - Check job status
 * - GET /api/civic/llm-chat/result/:jobId - Get completed result
 */

const jobQueue = require('./job-queue-service');
const aiService = require('./ai-service');

/**
 * Submit LLM chat query (returns immediately with job ID)
 */
async function submitQuery(req, res) {
    try {
        const { message, context, conversationHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log('[Civic LLM Async] 📤 Submitting query:', message.substring(0, 100));
        
        // Create job
        const jobId = jobQueue.createJob('llm-chat', {
            message,
            context: context || {},
            conversationHistory: conversationHistory || []
        });
        
        // Start processing in background (don't await!)
        processQuery(jobId).catch(error => {
            console.error('[Civic LLM Async] ❌ Background processing error:', error);
            jobQueue.failJob(jobId, error);
        });
        
        // Return job ID immediately
        res.status(202).json({
            jobId: jobId,
            status: 'pending',
            message: 'Query submitted successfully. Poll /status endpoint for updates.',
            statusUrl: `/api/civic/llm-chat/status/${jobId}`,
            resultUrl: `/api/civic/llm-chat/result/${jobId}`
        });
        
    } catch (error) {
        console.error('[Civic LLM Async] ❌ Submit error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Check job status
 */
async function getStatus(req, res) {
    try {
        const { jobId } = req.params;
        
        const status = jobQueue.getStatus(jobId);
        
        if (!status.exists) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        res.json(status);
        
    } catch (error) {
        console.error('[Civic LLM Async] ❌ Status check error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Get job result
 */
async function getResult(req, res) {
    try {
        const { jobId } = req.params;
        
        const result = jobQueue.getResult(jobId);
        
        res.json(result);
        
    } catch (error) {
        if (error.message === 'Job not found') {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (error.message.includes('not completed')) {
            return res.status(425).json({ error: error.message }); // 425 Too Early
        }
        
        console.error('[Civic LLM Async] ❌ Result fetch error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Process query in background
 * @param {string} jobId - Job ID
 */
async function processQuery(jobId) {
    const job = jobQueue.jobs.get(jobId);
    if (!job) {
        console.error('[Civic LLM Async] ❌ Job not found:', jobId);
        return;
    }
    
    const { message, context, conversationHistory } = job.data;
    
    try {
        console.log(`[Civic LLM Async] 🚀 Processing job ${jobId}`);
        
        // FIX v37.18.11: analyzeWithAI does its own source searching (lines 1345-1410 in ai-service.js)
        // It has iterative search, source gap analysis, and reaches SOURCE_THRESHOLD automatically
        // No need to search RSS feeds separately - that was causing issues
        
        jobQueue.updateProgress(jobId, 20, 'Analyzing query and searching sources...');
        
        // Call analyzeWithAI - it will handle all source searching internally
        // analyzeWithAI returns: { success: true, response: "string", sources: [...], metadata: {...} }
        const aiResult = await aiService.analyzeWithAI(message, context, 'representatives');
        
        // Validate AI result
        if (!aiResult || !aiResult.success) {
            throw new Error(aiResult?.error || 'AI analysis failed');
        }
        
        // Extract response (guaranteed to be string)
        const aiResponse = aiResult.response;
        
        // Use AI's sources (already searched, filtered, and scored by analyzeWithAI)
        const finalSources = aiResult.sources || [];
        
        console.log(`[Civic LLM Async] 🤖 Generated response for job ${jobId} (${aiResponse.length} chars)`);
        console.log(`[Civic LLM Async] 📚 Final sources: ${finalSources.length} (AI validated)`);
        
        // Step 3: Format response (80% progress)
        jobQueue.updateProgress(jobId, 80, 'Formatting response...');
        
        const result = {
            response: aiResponse,  // Now guaranteed to be a string
            sources: finalSources,  // AI's validated sources
            metadata: {
                sourceCount: finalSources.length,
                averageRelevance: finalSources.length > 0 
                    ? (finalSources.reduce((sum, s) => sum + (s.relevanceScore || s.relevance || 0), 0) / finalSources.length).toFixed(1)
                    : 0,
                model: aiResult.metadata?.model,
                tokens: aiResult.metadata?.tokens,
                processingTime: null // Will be set by jobQueue
            }
        };
        
        // Complete job (100% progress)
        jobQueue.completeJob(jobId, result);
        
        console.log(`[Civic LLM Async] ✅ Job ${jobId} completed successfully`);
        
    } catch (error) {
        console.error(`[Civic LLM Async] ❌ Job ${jobId} failed:`, error);
        jobQueue.failJob(jobId, error);
    }
}

/**
 * Get queue statistics (for monitoring)
 */
async function getStats(req, res) {
    try {
        const stats = jobQueue.getStats();
        res.json(stats);
    } catch (error) {
        console.error('[Civic LLM Async] ❌ Stats error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    submitQuery,
    getStatus,
    getResult,
    getStats,
    // Aliases for backward compatibility with civic-routes.js
    submitChatJob: submitQuery,
    getJobStatus: getStatus,
    getJobResult: getResult,
    getQueueStats: getStats
};
