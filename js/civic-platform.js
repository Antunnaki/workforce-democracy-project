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
        console.log('[Civic Platform] ✅ Initialization complete');
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

// ============================================================================
// TAB SWITCHING
// ============================================================================

CivicPlatform.setupTabSwitching = function() {
    // V37.16.0: FIXED - Don't override HTML's active classes
    // The HTML already has the correct tab/panel marked as active
    // This was causing bills-panel to become active on page load!
    console.log('[Civic Platform V37.16.0] Tab switching setup - respecting HTML defaults');
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
        selectedTab.setAttribute('aria-selected', 'true');
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
    console.log(`[Civic Platform V37.16.0] 📢 Dispatched wdp:tab-switched event for: ${tabName}`);
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
    
    // Send message
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
            
            // Call backend API (uses /api/civic/llm-chat with billExplanation context)
            const response = await queryBackendAPI('bills', query, {
                context: 'billExplanation'
            });
            
            // Remove typing indicator
            this.removeTypingIndicator(messages, typingId);
            
            // Add assistant response
            this.addChatMessage(messages, 'assistant', response.response || response.text);
            
            // Save to history
            this.chatHistory.bills.push({
                query: query,
                response: response.response || response.text,
                timestamp: Date.now()
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
    
    // Send message
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
            console.log('[Civic Platform] 📤 Sending representatives query to backend...');
            
            // Call backend API (uses /api/civic/llm-chat with representativeAnalysis context)
            const response = await queryBackendAPI('representatives', query, {
                context: 'representativeAnalysis'
            });
            
            // Remove typing indicator
            this.removeTypingIndicator(messages, typingId);
            
            // Add assistant response
            this.addChatMessage(messages, 'assistant', response.response || response.text);
            
            // Save to history
            this.chatHistory.representatives.push({
                query: query,
                response: response.response || response.text,
                timestamp: Date.now()
            });
            this.saveState();
            
            console.log('[Civic Platform] ✅ Representatives query successful');
            
        } catch (error) {
            console.error('[Civic Platform] ❌ Representatives query failed:', error);
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
// COURT CASES CHAT
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
    
    // Send message
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
            console.log('[Civic Platform] 📤 Sending court cases query to backend...');
            
            // Call backend API (uses /api/civic/llm-chat with general context)
            const response = await queryBackendAPI('supreme_court', query, {
                context: 'general'
            });
            
            // Remove typing indicator
            this.removeTypingIndicator(messages, typingId);
            
            // Add assistant response
            this.addChatMessage(messages, 'assistant', response.response || response.text);
            
            // Save to history
            this.chatHistory.court.push({
                query: query,
                response: response.response || response.text,
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
// CHAT UI HELPERS
// ============================================================================

CivicPlatform.addChatMessage = function(container, type, content) {
    if (!container) return;
    
    // Remove empty state if present
    const emptyState = container.querySelector('.bills-chat-empty-state-top, .inline-chat-message-assistant');
    if (emptyState && type === 'user') {
        // Keep initial assistant message, only remove on first user message
        const isInitialMessage = emptyState.textContent.includes('Welcome') || emptyState.textContent.includes('Hi!');
        if (isInitialMessage && container.children.length === 1) {
            // Don't remove, this is the welcome message
        }
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `inline-chat-message inline-chat-message-${type}`;
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                <div style="font-size: 1.5rem; flex-shrink: 0;">👤</div>
                <div style="flex: 1;">
                    <p style="margin: 0;">${this.escapeHtml(content)}</p>
                </div>
            </div>
        `;
    } else if (type === 'assistant') {
        messageDiv.innerHTML = `
            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                <div style="font-size: 1.5rem; flex-shrink: 0;">🤖</div>
                <div style="flex: 1;">
                    <p style="margin: 0; line-height: 1.6;">${this.formatResponse(content)}</p>
                </div>
            </div>
        `;
    } else if (type === 'error') {
        messageDiv.innerHTML = `
            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                <div style="font-size: 1.5rem; flex-shrink: 0;">⚠️</div>
                <div style="flex: 1;">
                    <p style="margin: 0; color: #dc2626;">${this.escapeHtml(content)}</p>
                </div>
            </div>
        `;
    }
    
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    setTimeout(() => {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
};

CivicPlatform.addTypingIndicator = function(container) {
    if (!container) return null;
    
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = 'inline-chat-message inline-chat-message-assistant';
    typingDiv.innerHTML = `
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
            <div style="font-size: 1.5rem; flex-shrink: 0;">🤖</div>
            <div style="flex: 1;">
                <p style="margin: 0; color: #64748b; font-style: italic;">Thinking...</p>
            </div>
        </div>
    `;
    
    container.appendChild(typingDiv);
    
    // Scroll to bottom
    setTimeout(() => {
        typingDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
    
    return typingId;
};

CivicPlatform.removeTypingIndicator = function(container, typingId) {
    if (!container || !typingId) return;
    
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) {
        typingDiv.remove();
    }
};

CivicPlatform.formatResponse = function(text) {
    if (!text) return '';
    
    // Escape HTML first
    let formatted = this.escapeHtml(text);
    
    // Format line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Format bold text **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format links [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: underline;">$1</a>');
    
    return formatted;
};

CivicPlatform.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// ============================================================================
// INLINE CHAT TOGGLE (Global function for HTML onclick)
// ============================================================================

function toggleInlineChat(chatType) {
    const toggle = document.getElementById(`${chatType}InlineChatToggle`);
    const window = document.getElementById(`${chatType}InlineChatWindow`);
    
    if (!toggle || !window) return;
    
    const isActive = window.classList.toggle('active');
    toggle.classList.toggle('active');
    
    if (isActive) {
        const input = document.getElementById(`${chatType}InlineChatInput`);
        if (input) {
            setTimeout(() => input.focus(), 300);
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CivicPlatform.init());
} else {
    CivicPlatform.init();
}

// Export for global access
window.CivicPlatform = CivicPlatform;
window.switchCivicTab = switchCivicTab;
window.toggleInlineChat = toggleInlineChat;

console.log('[Civic Platform] Module loaded v37.9.1');
