/**
* CIVIC PLATFORM - v37.9.1
 * Consolidated civic transparency features
 * 
 * Architecture:
 * - Bills Tab: Vote on legislation, AI chat assistance
 * - Representatives Tab: Find and analyze your representatives
 * - Court Cases Tab: Explore Supreme Court decisions
 * - Dashboard Tab: Personal civic engagement tracking
 * - Voting Info Tab: Registration and voting assistance
 * 
 * Backend Connection:
 * - Endpoint: /api/civic/llm-chat
 * - Contexts: billExplanation, representativeAnalysis, general
 * - Caching: PostgreSQL (bills cached forever)
 * 
 * Created: November 10, 2025
 * Dependencies: backend-api.js (v37.0.2+)
 */

// ============================================================================
// CIVIC PLATFORM STATE
// ============================================================================

const CivicPlatform = {
    currentTab: 'representatives', // Default tab
    chatHistory: {
       bills: [],
        representatives: [],
        court: []
    },
    
    // Initialize platform
    init() {
        console.log('[Civic Platform] Initializing v37.9.1...');
        this.setupTabSwitching();
        this.setupChatWidgets();
        this.loadSavedState();
        console.log('[CivicPlatform] ✅ Initialization complete');
    },
    
    // Save state to localStorage
    saveState() {
        try {
            localStorage.setItem('civic_platform_state', JSON.stringify({
                currentTab: this.currentTab,
                chatHistory: this.chatHistory,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('[Civic Platform] Could not save state:', error);
        }
    },
    
    // Load saved state
    loadSavedState() {
        try {
            const saved = localStorage.getItem('civic_platform_state');
            if (saved) {
                const state = JSON.parse(saved);
               this.chatHistory = state.chatHistory || this.chatHistory;
                // Restore chat messages if any
                this.restoreChatMessages();
            }
        } catch (error) {
            console.warn('[Civic Platform] Could not load saved state:', error);
        }
    },
    
    // Restore chat messages from history
   restoreChatMessages() {
        ['bills', 'representatives', 'court'].forEach(chatType => {
            const history = this.chatHistory[chatType];
            if (history && history.length > 0) {
                // Chat history exists, could restore here if needed
                console.log(`[Civic Platform] Found ${history.length} messages in ${chatType} history`);
            }
        });
    }
};

// Ensure CivicPlatform is available globally
window.CivicPlatform = CivicPlatform;

// ============================================================================
// TAB SWITCHING
// ============================================================================

CivicPlatform.setupTabSwitching = function() {
    // V37.16.0: FIXED - Don't override HTML's active classes
    // The HTML already has the correct tab/panel marked as active
    // This was causing bills-panel to become active on page load!
    console.log('[Civic Platform V37.16.0] Tab switching setup - respectingHTML defaults');
};

// Global function for tab switching (called from HTML onclick)
function switchCivicTab(tabName) {
    console.log(`[Civic Platform] Switching to tab: ${tabName}`);
    
    // Update state
    CivicPlatform.currentTab = tabName;
    CivicPlatform.saveState();
    
// Remove active class from all tabs and panels
    document.querySelectorAll('.civic-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    document.querySelectorAll('.civic-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
// Add active class to selected tab and panel
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedPanel = document.getElementById(`${tabName}-panel`);
    
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.setAttribute('aria-selected','true');
    }
    
    if (selectedPanel) {
        selectedPanel.classList.add('active');
        
        // Scroll to panel smoothly
        setTimeout(() => {
            selectedPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
    
    // V37.16.0: Dispatch tab-switched event for aggressive auto-load personalization
    window.dispatchEvent(new CustomEvent('wdp:tab-switched', {
        detail: { tab: tabName }
    }));
    console.log(`[Civic Platform V37.16.0]📢 Dispatched wdp:tab-switched event for: ${tabName}`);
}

// ============================================================================
// CHAT WIDGETS - Backend Connection
// ============================================================================

CivicPlatform.setupChatWidgets = function() {
    console.log('[Civic Platform] Setting up chat widgets...');
    
    // Bills Chat
    this.setupBillsChat();
    
    // Representatives Chat
    this.setupRepsChat();
    
    // Court Cases Chat
    this.setupCourtChat();
};

// ----------------------------------------------------------------------------
// BILLS CHAT
// ----------------------------------------------------------------------------

CivicPlatform.setupBillsChat = function() {
    const toggle = document.getElementById('billsChatToggleTop');
    const window = document.getElementById('billsChatWindowTop');
    const close = document.getElementById('billsChatCloseTop');
    const input = document.getElementById('billsChatInputTop');
    const send = document.getElementById('billsChatSendTop');
    const messages = document.getElementById('billsChatMessagesTop');
    
    if (!toggle || !window) {
        console.warn('[Civic Platform] Bills chat elements not found');
        return;
    }
    
    // Toggle chat window
    toggle.addEventListener('click', () => {
        const isActive = window.classList.toggle('active');
        toggle.classList.toggle('active');
        
       if (isActive && input) {
            setTimeout(() => input.focus(), 300);
        }
    });
    
    // Close button
    if (close) {
        close.addEventListener('click', () => {
            window.classList.remove('active');
            toggle.classList.remove('active');
        });
    }
    
    //Send message
    const sendMessage = async () => {
        if (!input || !send || !messages) return;
        
        const query = input.value.trim();
        if (!query) return;
        
        // Disable input
        input.disabled = true;
        send.disabled = true;
        
        // Add user message
this.addChatMessage(messages, 'user', query);
        input.value = '';
        
        // Show typing indicator
        const typingId = this.addTypingIndicator(messages);
        
        try {
            console.log('[Civic Platform] 📤 Sending bills query to backend...');
            
            // Call backend API (uses/api/civic/llm-chat with billExplanation context)
            const response = await queryBackendAPI('bills', query, {
                context: 'billExplanation'
            });
            
            // Remove typing indicator
            this.removeTypingIndicator(messages, typingId);
            
            // Add assistant response -improved error handling
            const responseText = response.response || response.message || response.text || 'No response received';
            this.addChatMessage(messages, 'assistant', responseText);
            
            // Save to history
            this.chatHistory.bills.push({
                query: query,
                response: responseText,
                timestamp:Date.now()
            });
            this.saveState();
            
            console.log('[Civic Platform] ✅ Bills query successful');
            
        } catch (error) {
            console.error('[Civic Platform] ❌ Bills query failed:', error);
            this.removeTypingIndicator(messages, typingId);
            this.addChatMessage(messages, 'error', 'Sorry, I encountered an error. Please try again.');
        } finally {
            // Re-enable input
            input.disabled = false;
            send.disabled = false;
            input.focus();
        }
    };
    
    if (send) {
        send.addEventListener('click', sendMessage);
    }
    
if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
};

// ----------------------------------------------------------------------------
// REPRESENTATIVES CHAT
// ----------------------------------------------------------------------------

CivicPlatform.setupRepsChat = function() {
    const toggle = document.getElementById('repsInlineChatToggle');
    const window = document.getElementById('repsInlineChatWindow');
    const input = document.getElementById('repsInlineChatInput');
    const send = document.getElementById('repsInlineChatSend');
    const messages = document.getElementById('repsInlineChatMessages');
    
    if (!toggle || !window) {
        console.warn('[Civic Platform] Reps chat elements not found');
        return;
    }
    
    // Toggle chat window
    toggle.addEventListener('click', () => {
        const isActive = window.classList.toggle('active');
        toggle.classList.toggle('active');
        
        if (isActive && input) {
            setTimeout(() => input.focus(), 300);
        }
    });
    
    // Sendmessage
    const sendMessage = async () => {
        if (!input || !send || !messages) return;
        
        const query = input.value.trim();
        if (!query) return;
        
        // Disable input
        input.disabled = true;
        send.disabled = true;
        
        // Add user message
       this.addChatMessage(messages, 'user', query);
        input.value = '';
        
        // Show typing indicator
        const typingId = this.addTypingIndicator(messages);
        
        try {
            console.log('[Civic Platform] 📤 Sending representativesquery to backend...');
            
            // Call backend API (uses /api/civic/llm-chat with representativeAnalysis context)
            const response = await queryBackendAPI('representatives', query, {
                context: 'representativeAnalysis'
            });
            
            // Remove typing indicator
            this.removeTypingIndicator(messages,typingId);
            
            // Add assistant response -improved error handling
            const responseText = response.response || response.message || response.text || 'No response received';
            this.addChatMessage(messages, 'assistant', responseText);
            
            // Save to history
            this.chatHistory.representatives.push({
                query: query,
                response: responseText,
                timestamp: Date.now()
            });
            this.saveState();
            
            console.log('[Civic Platform] ✅ Representatives query successful');
            
        } catch (error) {
            console.error('[Civic Platform] ❌ Representatives query failed:',error);
            this.removeTypingIndicator(messages, typingId);
            this.addChatMessage(messages, 'error', 'Sorry, I encountered an error. Please try again.');
        } finally {
            // Re-enable input
            input.disabled = false;
            send.disabled = false;
            input.focus();
        }
    };
if (send) {
        send.addEventListener('click', sendMessage);
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
};

// ----------------------------------------------------------------------------
// COURTCASES CHAT
// ----------------------------------------------------------------------------

CivicPlatform.setupCourtChat = function() {
    const toggle = document.getElementById('courtInlineChatToggle');
    const window = document.getElementById('courtInlineChatWindow');
    const input = document.getElementById('courtInlineChatInput');
    const send = document.getElementById('courtInlineChatSend');
    const messages = document.getElementById('courtInlineChatMessages');
    
    if (!toggle || !window) {
        console.warn('[Civic Platform] Court chat elements not found');
        return;
    }
    
    // Toggle chat window
    toggle.addEventListener('click', () => {
        const isActive = window.classList.toggle('active');
        toggle.classList.toggle('active');
        
        if (isActive && input) {
            setTimeout(() => input.focus(), 300);
        }
    });
    
    // Sendmessage
    const sendMessage = async () => {
        if (!input || !send || !messages) return;
        
        const query = input.value.trim();
        if (!query) return;
        
        // Disable input
        input.disabled = true;
        send.disabled = true;
        
        // Add user message
       this.addChatMessage(messages, 'user', query);
        input.value = '';
        
        // Show typing indicator
        const typingId = this.addTypingIndicator(messages);
        
        try {
            console.log('[Civic Platform] 📤 Sending courtcases query to backend...');
            
            // Call backend API (uses /api/civic/llm-chat with general context)
            const response = await queryBackendAPI('supreme_court', query, {
                context: 'general'
            });
            
            // Remove typing indicator
            this.removeTypingIndicator(messages,typingId);
            
            // Add assistant response -improved error handling
            const responseText = response.response || response.message || response.text || 'No response received';
            this.addChatMessage(messages, 'assistant', responseText);
            
            // Save to history
            this.chatHistory.court.push({
                query: query,
                response: responseText,
                timestamp: Date.now()
            });
            this.saveState();
            
            console.log('[Civic Platform] ✅ Court cases query successful');
            
        } catch (error) {
            console.error('[Civic Platform] ❌ Court cases query failed:', error);
            this.removeTypingIndicator(messages, typingId);
            this.addChatMessage(messages, 'error', 'Sorry, I encountered an error. Please try again.');
        } finally {
            // Re-enable input
            input.disabled = false;
            send.disabled = false;
            input.focus();
        }
   };
    
    if (send) {
        send.addEventListener('click', sendMessage);
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
};

// ============================================================================
// CHAT MESSAGE HELPERS
// ============================================================================

CivicPlatform.addChatMessage = function(container, type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message-${type}`;
    
    // Format content with basic markdown
    let formattedContent = content ||'';
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${formattedContent}
</div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
};

CivicPlatform.addTypingIndicator = function(container) {
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = 'chat-message chat-message-typing';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    return typingId;
};

CivicPlatform.removeTypingIndicator = function(container, typingId) {
    const typingElement = document.getElementById(typingId);
    if (typingElement) {
        typingElement.remove();
    }
};

// ============================================================================
// INITIALIZATION// ============================================================================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Civic Platform] DOMContentLoaded event fired');
    // Initialize CivicPlatform
    if (typeof CivicPlatform !== 'undefined' && typeof CivicPlatform.init === 'function') {
        CivicPlatform.init();
   } else {
        console.error('[Civic Platform] CivicPlatform not found or init function missing');
    }
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    console.log('[Civic Platform] DOMstill loading, waiting for DOMContentLoaded');
} else {
    // DOM is already loaded
    console.log('[Civic Platform] DOM already loaded, initializing immediately');
    if (typeof CivicPlatform !== 'undefined' && typeof CivicPlatform.init === 'function') {
        CivicPlatform.init();
    } else {
        console.error('[Civic Platform] CivicPlatform not found or init function missing');
    }
}