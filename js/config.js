/**
 * WORKFORCE DEMOCRACY PROJECT - CONFIGURATION
 * 
 * Central configuration for API endpoints and feature flags
 * Version: V36.2.0
 * Last Updated: 2025-01-27
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Update API_BASE_URL with your Njalla backend domain
 * 2. Set GROQ_ENABLED to true when backend is deployed
 * 3. That's it! No other files need manual updates.
 */

function getBackendUrl() {
    // For Netlify testing environment
    if (window.location.hostname.includes('netlify.app') || 
        window.location.hostname === 'localhost') {
        // Connect to Version B (Development) on port 3001
        return 'http://185.193.126.13:3001';
    } else {
        // Production environment - connect to Version A on port 3000
        return 'http://185.193.126.13:3000';
    }
}

const CONFIG = {
    // ═══════════════════════════════════════════════════════════════════════
    //   🔧 BACKEND CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Backend API Base URL
     * 
     * UPDATE THIS with your Njalla VPS domain when backend is deployed
     * 
     * Options:
     *   - Subdomain: 'https://api.workforcedemocracyproject.org'
     *   - Njalla subdomain: 'https://workforce-api.njal.la'
     *   - Custom domain: 'https://your-domain.com'
     * 
     * Leave as empty string '' to use placeholders (development mode)
     */
    API_BASE_URL: getBackendUrl(),  // v37.18.7: Version B via /test route
    
    /**
     * Groq AI Features Enabled
     * 
     * Set to true when backend is deployed and ready
     * Set to false to use placeholder responses (development mode)
     */
    GROQ_ENABLED: true,  // ✅ GROQ AI ENABLED!
    
    
    // ═══════════════════════════════════════════════════════════════════════
    //   📡 API ENDPOINTS (Auto-configured from API_BASE_URL)
    // ═══════════════════════════════════════════════════════════════════════
    
    get ENDPOINTS() {
        const baseUrl = this.API_BASE_URL || 'https://your-backend-not-configured.com';
        return {
            VOTING_ASSISTANT: `${baseUrl}/api/groq/voting-assistant`,
            BILLS_CHAT: `${baseUrl}/api/groq/bills-chat`,
            CANDIDATE_ANALYSIS: `${baseUrl}/api/groq/candidate-analysis`,
            BILLS_BY_LOCATION: `${baseUrl}/api/bills/location`,
            ETHICAL_BUSINESSES: `${baseUrl}/api/businesses/location`,
            REPRESENTATIVES: `${baseUrl}/api/civic/representatives/search`, // ✅ FIXED v37.9.1: Added /search
            HEALTH_CHECK: `${baseUrl}/health`
        };
    },
    
    
    // ═══════════════════════════════════════════════════════════════════════
    //   ⚙️ FEATURE FLAGS
    // ═══════════════════════════════════════════════════════════════════════
    
    FEATURES: {
        // Voting Assistant AI (Groq/Llama3)
        VOTING_ASSISTANT_AI: true,  // Show "Ask AI Assistant" button
        
        // Bills Chat AI (Groq/Llama3)
        BILLS_CHAT_AI: true,  // Show bills chat widget
        
        // Hybrid Intelligence (local pattern matching + LLM fallback)
        HYBRID_INTELLIGENCE: true,  // 90% local, 10% LLM for cost savings
        
        // Debug mode (shows console logs)
        DEBUG_MODE: false  // Set to true for debugging
    },
    
    
    // ═══════════════════════════════════════════════════════════════════════
    //   🔒 SECURITY SETTINGS
    // ═══════════════════════════════════════════════════════════════════════
    
    SECURITY: {
        // API timeout (milliseconds)
        API_TIMEOUT: 30000,  // 30 seconds
        
        // Maximum message length (characters)
        MAX_MESSAGE_LENGTH: 500,
        
        // Rate limiting (client-side check)
        RATE_LIMIT_ENABLED: true,
        RATE_LIMIT_WINDOW: 60000,  // 1 minute
        RATE_LIMIT_MAX_REQUESTS: 10  // Max 10 requests per minute
    },
    
    
    // ═══════════════════════════════════════════════════════════════════════
    //   📊 ANALYTICS SETTINGS (Privacy-Safe)
    // ═══════════════════════════════════════════════════════════════════════
    
    ANALYTICS: {
        // Track feature usage (localStorage only, no servers)
        TRACK_FEATURE_USAGE: true,
        
        // Log API errors to console (for debugging)
        LOG_API_ERRORS: true
    },
    
    
    // ═══════════════════════════════════════════════════════════════════════
    //   🎨 UI SETTINGS
    // ═══════════════════════════════════════════════════════════════════════
    
    UI: {
        // Show backend status indicator
        SHOW_BACKEND_STATUS: true,
        
        // Show "Backend not configured" messages
        SHOW_CONFIG_WARNINGS: true,
        
        // Animation duration (milliseconds)
        ANIMATION_DURATION: 300
    },
    
    
    // ═══════════════════════════════════════════════════════════════════════
    //   🔍 VALIDATION & HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Check if backend is configured
     */
    isBackendConfigured() {
        return this.API_BASE_URL && this.API_BASE_URL !== '';
    },
    
    /**
     * Check if Groq features are ready
     */
    isGroqReady() {
        return this.isBackendConfigured() && this.GROQ_ENABLED;
    },
    
    /**
     * Get backend status message
     */
    getBackendStatus() {
        if (this.isGroqReady()) {
            return {
                status: 'ready',
                message: '✅ AI assistant ready',
                color: 'green'
            };
        } else if (this.isBackendConfigured() && !this.GROQ_ENABLED) {
            return {
                status: 'configured',
                message: '⏳ Backend configured, awaiting activation',
                color: 'orange'
            };
        } else {
            return {
                status: 'not-configured',
                message: '⚠️ Backend not configured (using placeholders)',
                color: 'gray'
            };
        }
    },
    
    /**
     * Log debug message (only if DEBUG_MODE is true)
     */
    debug(message, ...args) {
        if (this.FEATURES.DEBUG_MODE) {
            console.log(`[CONFIG] ${message}`, ...args);
        }
    }
};

// Freeze config to prevent accidental modifications
// (except API_BASE_URL and GROQ_ENABLED which can be updated)
Object.defineProperty(CONFIG, 'API_BASE_URL', {
    writable: true,
    configurable: false
});

Object.defineProperty(CONFIG, 'GROQ_ENABLED', {
    writable: true,
    configurable: false
});

// Log configuration status on load
console.log('═══════════════════════════════════════════════════════');
console.log('  🔧 Workforce Democracy Project - Configuration');
console.log('═══════════════════════════════════════════════════════');
console.log(`  Backend URL: ${CONFIG.API_BASE_URL || '(not configured)'}`);
console.log(`  Groq Enabled: ${CONFIG.GROQ_ENABLED ? '✅' : '❌'}`);
console.log(`  Status: ${CONFIG.getBackendStatus().message}`);
console.log('═══════════════════════════════════════════════════════\n');

// Make CONFIG globally available
window.CONFIG = CONFIG;