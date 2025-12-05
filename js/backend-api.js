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
    //Add environment detection for backend URL
    baseURL: window.location.hostname.includes('netlify.app') || window.location.hostname === 'localhost' 
        ? 'http://185.193.126.13:3001'  // Version B (Development) on port 3001
        : 'http://185.193.126.13:3000',  // Version A (Production) on port 3000
    endpoints: {
        query: '/api/civic/llm-chat',  // ✅ V37.0.2: Use working civic LLM endpoint
        health: '/api/civic/llm-health',
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
        
        // V37.0.2: Formatconversation history for LLM (convert to role/content format)
        const formattedHistory = [];
        conversationHistory.slice(-5).forEach(exchange => {
            formattedHistory.push({
                role: 'user',
                content: exchange.query
            });
            formattedHistory.push({
                role: 'assistant',
                content: exchange.response});
        });
        
        // V37.0.2: Format for civic LLM endpoint
        const requestBody = {
            message: query,  // ✅ Changed from 'query' to 'message'
            context: contextMap[chatType] || 'general',  // ✅ Use civiccontext types
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
            body: JSON.stringify(requestBody)
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
            throw newError(`Backend API error: ${response.status} ${response.statusText}`);
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
            success: false,
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
 * Query Representatives chat
 */
async function queryRepresentativesChat(query, context = {}) {
    return await queryBackendAPI('representatives', query, { context });
}

/**
 * Query Bills chat
 */
async function queryBillsChat(query, context = {}) {
    return await queryBackendAPI('bills', query, { context });
}

/**
 * Query Ethical Business chat
 */
async function queryEthicalChat(query, context = {}) {
    return await queryBackendAPI('ethical_business', query, { context });
}

/**
 * Query Learning chat*/
async function queryLearningChat(query, context = {}) {
    return await queryBackendAPI('learning', query, { context });
}

/**
 * Query FAQ chat
 */
async function queryFAQChat(query, context = {}) {
    return await queryBackendAPI('faq', query, { context });
}

// ============================================================================
// CONTEXTMANAGEMENT
// ============================================================================

/**
 * Save conversation context to backend
 * Enables cross-chat context sharing
 */
async function saveConversationContext(userId, context) {
    try {
        const response = await fetch(BackendAPI.baseURL + BackendAPI.endpoints.context, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                context: context
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('[Backend API] Failed to save context:', error);
        return false;
    }
}

/**
 * Retrieve conversation context from backend
 */
async function getConversationContext(userId) {
    try {
        const response = await fetch(`${BackendAPI.baseURL}${BackendAPI.endpoints.context}?user_id=${userId}`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.context || null;
    } catch (error) {
        console.error('[Backend API] Failed to get context:', error);
        return null;
    }
}

// ============================================================================
// CONVERSATION HISTORY MANAGEMENT (V36.6.0)
// ============================================================================

/**
 * Get conversation history for a specific chat type
 *@param {string} chatType - Type of chat
 * @returns {Array} - Array of {query, response} objects
 */
function getConversationHistory(chatType) {
    const key = `wdp_${chatType}_history`;
    const history = localStorage.getItem(key);
    return history ? JSON.parse(history) : [];
}

/**
 * Save conversation to history
 * @param {string} chatType - Type of chat
 * @param {string} query - User's question
 * @param {string} response - AI's response
 */
function saveConversationHistory(chatType, query, response) {
    const key =`wdp_${chatType}_history`;
    const history = getConversationHistory(chatType);
    
    // Add new exchange
    history.push({
        query: query,
        response: response,
        timestamp: Date.now()
    });
    
    // Keep only last 20 exchanges (40 messages total)
   if (history.length > 20) {
        history.splice(0, history.length - 20);
    }
    
    localStorage.setItem(key, JSON.stringify(history));
}

/**
 * Clear conversation history for a chat type
 * @param {string} chatType - Type of chat
 */
function clearConversationHistory(chatType) {
    const key = `wdp_${chatType}_history`;
    localStorage.removeItem(key);
}

// ============================================================================
// FALLBACK RESPONSES (When Backend Unavailable)
// ============================================================================

/**
 * Generate fallback response when backend is unavailable
 */
function generateFallbackResponse(chatType, query) {
    const fallbacks ={
        supreme_court: `I can help you understand Supreme Court cases! However, I'm currently unable to connect to the backend API. Please try again in a moment, or browse the court decisions above.`,
        
        representatives: `I can help you learn about representatives! However, I'm currently unable to connect tothe backend API. Please try again in a moment, or use the search bar above to find representatives.`,
        
        bills: `I can help you research bills and legislation! However, I'm currently unable to connect to the backend API. Please try again in a moment, or browse the bills above.`,
        
        ethical_business: `I can help you find ethical businesses and worker cooperatives! However, I'm currently unable to connect to the backend API. Please try again in a moment, or enable personalization to see nearby businesses.`,
        
        learning: `I'm your learning assistant! However, I'm currently unable to connect to the backendAPI. Please try again in a moment.`,
        
        faq: `I can answer your questions! However, I'm currently unable to connect to the backend API. Please try again in a moment.`
    };
    
    return fallbacks[chatType] || `I'm currently unable to connect to the backend API. Please try again in a moment.`;
}

// ============================================================================
// EXPORT TO WINDOW
// ============================================================================

window.BackendAPI = BackendAPI;
window.queryBackendAPI = queryBackendAPI;
window.querySupremeCourtChat = querySupremeCourtChat;
window.queryRepresentativesChat = queryRepresentativesChat;
window.queryBillsChat = queryBillsChat;
window.queryEthicalChat = queryEthicalChat;
window.queryLearningChat = queryLearningChat;
window.queryFAQChat = queryFAQChat;
window.saveConversationContext = saveConversationContext;
window.getConversationContext = getConversationContext;
window.getConversationHistory = getConversationHistory;
window.saveConversationHistory = saveConversationHistory;
window.clearConversationHistory = clearConversationHistory;
window.generateFallbackResponse = generateFallbackResponse;

console.log('═══════════════════════════════════════════════════');
console.log('  ✅ Backend API IntegrationV37.0.2 Loaded');
console.log('  🧠 Conversation Memory: ENABLED');
console.log('  🔧 Endpoint: /api/civic/llm-chat (Groq LLM)');
console.log('═══════════════════════════════════════════════════');
console.log(' 🔗 Backend URL:', BackendAPI.baseURL);
console.log('  🤖 LLM Model: llama-3.3-70b-versatile');
console.log('  👤 User ID:', BackendAPI.getUserId());
console.log('  🧪 Testing connection...');

// Test backend connection on load
BackendAPI.checkHealth().then(isHealthy => {
    if (isHealthy) {
        console.log('  ✅ Backend connection: HEALTHY');
    } else {
        console.warn('  ⚠️ Backend connection: FAILED');
        console.warn('  ⚠️ Chat features will use fallback responses');
    }
   console.log('═══════════════════════════════════════════════════');
});
