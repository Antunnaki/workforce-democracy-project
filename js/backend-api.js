/**
* BACKEND API INTEGRATION - V37.0.2
 * Connects frontend chat systems to Njalla VPS backend
 * V37.0.2: FIXED - Use /api/civic/llm-chat endpoint (working endpoint)
 * V36.11.10: Attempted fix to /api/backend/query (didn't exist)
 * V36.11.9: Enhanced error logging for CORS and HTTP debugging
 * 
 * Architecture:
 * - Frontend: Netlify (Static Site)
 * - Backend: Njalla VPS (185.193.126.13)
 * - LLM: Groq API (via backend)
 * - Civic API: Real government representative data
 * 
 * Features:
 * - Secure LLM proxy (API keys server-side)
 * - Real-time chat responses
 * - Automatic fallback handling
 * - Performance tracking* 
 * Created: October 28, 2025
 * Updated: November 3, 2025
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const BackendAPI = {
    // Addenvironment detection for backend URL
    baseURL: window.location.hostname.includes('netlify.app') || window.location.hostname === 'localhost' 
        ? 'https://api.workforcedemocracyproject.org'  // Use HTTPS for Netlify
        : 'https://api.workforcedemocracyproject.org',  // Production environmentendpoints: {
        query: '/api/civic/llm-chat',  // ✅ V37.0.2: Use working civic LLM endpoint
        health: '/health',
        context: '/api/context',
        metrics: '/api/metrics'
    },

    // User identification (anonymous)
    getUserId() {
        let userId = localStorage.getItem('wdp_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('wdp_user_id', userId);
        }
        return userId;
    },

// Check if backend is available
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.health}`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.warn('[Backend API] Health check failed:', error);
            return false;
        }
    }
};

// MakeBackendAPI available globally
window.BackendAPI = BackendAPI;

// ============================================================================
// MAIN QUERY FUNCTION
// ============================================================================

/**
 * Query the backend API with intelligent routing
 * 
 * Flow:
 * 1. Check cached responses (instant, free)
 * 2. Query knowledge base(bills, court cases, representatives)
 * 3. Fall back to Groq AI for complex queries
 * 
 * @param {string} chatType - Type of chat: 'supreme_court', 'representatives', 'bills', 'ethical', 'learning', 'faq'
 * @param {string} query - User's question
* @param {object} options - Additional options (context, userId, etc.)
 * @returns {Promise<object>} - Response with text, source, cost, responseTime
 */
async function queryBackendAPI(chatType, query, options = {}) {
    const startTime = Date.now();
    
    try {
        // V37.0.2: Map chat types to civic contexts
        const contextMap = {
            'supreme_court': 'general',
            'representatives': 'representativeAnalysis',
            'bills': 'billExplanation',
            'ethical': 'general',
           'learning': 'general',
            'faq': 'general',
            'reps': 'representativeAnalysis'
        };
        
        // V37.0.2: Get conversation history for context
        const conversationHistory = getConversationHistory(chatType);
        
        // V37.0.2: Formatconversationhistory for LLM (convert to role/content format)
        const formattedHistory = [];
        conversationHistory.slice(-5).forEach(exchange => {
            formattedHistory.push({
                role: 'user',
                content: exchange.query
            });
            formattedHistory.push({
                role: 'assistant',
                content: exchange.response
});
        });
        
        // V37.0.2: Format for civic LLM endpoint
        const requestBody = {
            message: query,  // ✅ Changed from 'query' to 'message'
            context: contextMap[chatType] || 'general',  // ✅ Use civic contexttypes
            conversationHistory: formattedHistory // ✅ Properly formatted history
        };
        
        console.log(`[Backend API] 📤 Sending query to backend:`, {
            chatType,
            context: requestBody.context,
            query: query.substring(0, 50) + '...',
            historyLength: formattedHistory.length,
            endpoint: BackendAPI.baseURL + BackendAPI.endpoints.query
        });
        
        const response = await fetch(BackendAPI.baseURL + BackendAPI.endpoints.query, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(requestBody)
        }).catch(error => {
            console.error('[Backend API] ❌ Fetch failed (likely CORS or network):', {
                error: error.message,
                endpoint: BackendAPI.baseURL + BackendAPI.endpoints.query,
                requestBody: requestBody
            });
            throw error;
        });
        
       if (!response.ok) {
            console.error(`[Backend API] ❌ HTTP ${response.status}:`, {
                status: response.status,
                statusText: response.statusText,
                url: BackendAPI.baseURL + BackendAPI.endpoints.query,
                headers: Object.fromEntries(response.headers)
            });
            throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        console.log(`[Backend API] ✅ Response received:`, {
            model: data.model,
            responseTime: `${responseTime}ms`,
            responseLength: data.message?.length || 0
        });
        
        // V37.0.2: Save conversation to history
        saveConversationHistory(chatType, query, data.message);
        
        return {
            success: true,
            response: data.message,  // ✅ CivicLLM returns 'message' not 'response'
            source: 'llm',  // Civic LLM endpoint doesn't provide source
            cost: 0,  // Cost tracking done backend-side
            responseTime: responseTime,
            topics: []
        };
        
    } catch (error) {
        console.error('[Backend API] ❌ Error:', error);
        console.error('[Backend API] ❌ Error details:', {
            message: error.message,
            stack: error.stack,
            endpoint: BackendAPI.baseURL + BackendAPI.endpoints.query,
            chatType: chatType
        });
        
        return {
            success:false,
            error: error.message,
            responseTime: Date.now() - startTime,
            fallback: true
        };
    }
}

// ============================================================================
// CHAT-SPECIFIC HELPERS
// ============================================================================

/**
 * Query Supreme Court chat
 */
async function querySupremeCourtChat(query, context = {}) {
   return await queryBackendAPI('supreme_court', query, { context });
}

/**
 * Query Bills chat
 */
async function queryBillsChat(query, context = {}) {
    return await queryBackendAPI('bills', query, { context });
}

/**
 * Query Representatives chat
 */
async function queryRepresentativesChat(query, context = {}) {
    return await queryBackendAPI('representatives', query, { context });
}

/**
 * Getconversation history for a chat type
 */
function getConversationHistory(chatType) {
    const key = `chat_history_${chatType}`;
    try {
        const history = localStorage.getItem(key);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.warn(`[Backend API] Failed toload chat history for ${chatType}:`, error);
        return [];
    }
}

/**
 * Save conversation history for a chat type
 */
function saveConversationHistory(chatType, query, response) {
    const key = `chat_history_${chatType}`;
    try {
        const history = getConversationHistory(chatType);
       history.push({ query, response, timestamp: Date.now() });
        
        // Keep only last 10 conversations
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }
        
        localStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
        console.warn(`[Backend API] Failed to save chat history for ${chatType}:`, error);
    }
}

// Make functions available globally
window.queryBackendAPI = queryBackendAPI;
window.querySupremeCourtChat = querySupremeCourtChat;
window.queryBillsChat = queryBillsChat;
window.queryRepresentativesChat = queryRepresentativesChat;

// Test the backend API connection
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[Backend API] Testing connection...');
    try {
        const isHealthy = await BackendAPI.checkHealth();
        console.log(`[Backend API] Health check: ${isHealthy? '✅ Healthy' : '❌ Unhealthy'}`);
    } catch (error) {
        console.error('[Backend API] Health check failed:', error);
    }
});
