/**
 * LLM Assistant Component
 * 
 * Groq + Llama3 integration for conversational civic education.
 * Used throughout the platform for:
 * - Fact-checking discussions
 * - Bill summaries and explanations
 * - Representative profile analysis
 * - Contextual help and education
 * 
 * Philosophy:
 * - NON-PARTISAN: Presents facts without bias
 * - EDUCATIONAL: Helps users understand complex topics
 * - TRANSPARENT: Shows sources and reasoning
 * - PRIVATE: Uses Groq (no data retention)
 * - COST-EFFECTIVE: Llama3 is free and open-source
 * 
 * Features:
 * - Streaming responses for better UX
 * - Context-aware conversations
 * - Fact integration from verification engine
 * - Source citation
 * - Conversation history
 */

class LLMAssistant {
    constructor(options = {}) {
        this.groqApiKey = options.apiKey || window.GROQ_API_KEY || null;
        this.groqBaseUrl = 'https://api.groq.com/openai/v1';
        this.model = options.model || 'llama-3.3-70b-versatile'; // Backend handles API calls
        
        // Conversation state
        this.conversationHistory = [];
        this.maxHistoryLength = 10; // Keep last 10 messages
        
        // System prompts for different contexts
        this.systemPrompts = {
            factChecking: `You are a neutral, non-partisan fact-checking assistant helping citizens understand political claims. Your role is to:
1. Present facts objectively without political bias
2. Cite multiple sources when available
3. Explain context and nuance
4. Help users think critically about information
5. Never tell users what to think, only provide facts

Always be transparent about uncertainty and acknowledge when information is contested.`,
            
            billExplanation: `You are a civic education assistant helping citizens understand legislation. Your role is to:
1. Explain bills in plain language
2. Highlight key provisions and impacts
3. Present multiple perspectives fairly
4. Connect to real-world implications
5. Avoid partisan framing

Make complex policy accessible without dumbing it down.`,
            
            representativeAnalysis: `You are a non-partisan analyst helping citizens understand their representatives. Your role is to:
1. Present voting records objectively
2. Explain campaign finance data neutrally
3. Highlight alignment with various interest groups
4. Compare positions to constituent preferences
5. Avoid judgment or endorsement

Help users make informed decisions based on facts.`,
            
            general: `You are a helpful civic engagement assistant. Answer questions about democracy, voting, legislation, and civic participation with accuracy and non-partisan neutrality.`
        };
        
        this.currentContext = 'general';
        
        console.log('🤖 LLM Assistant initialized');
        console.log(`   Model: ${this.model}`);
        console.log(`   Provider: Groq (via backend proxy)`);
        console.log(`   API Key: Handled securely by backend`);
    }
    
    /**
     * Set context for specialized conversations
     */
    setContext(context) {
        if (this.systemPrompts[context]) {
            this.currentContext = context;
            console.log(`📝 Context set to: ${context}`);
        } else {
            console.warn(`⚠️  Unknown context: ${context}, using general`);
            this.currentContext = 'general';
        }
    }
    
    /**
     * Send message and get response
     */
    async sendMessage(userMessage, options = {}) {
        const {
            stream = false,
            includeFactChecks = false,
            includeSources = false,
            temperature = 0.3 // Low for factual accuracy
        } = options;
        
        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });
            
            // Trim history if too long
            if (this.conversationHistory.length > this.maxHistoryLength * 2) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
            }
            
            // Use backend proxy instead of calling Groq directly (more secure)
            const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3001'
                : 'https://api.workforcedemocracyproject.org';
            
            console.log(`🤖 Sending message to backend proxy: ${API_BASE}/api/civic/llm-chat`);
            
            // Call backend proxy
            const response = await fetch(`${API_BASE}/api/civic/llm-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: this.currentContext,
                    conversationHistory: this.conversationHistory.slice(0, -1) // Don't include the message we just added
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Backend error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error from backend');
            }
            
            const assistantMessage = data.message;
            
            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });
            
            console.log(`✅ Got response from LLM: "${assistantMessage.substring(0, 50)}..."`);
            
            return {
                success: true,
                message: assistantMessage,
                usage: data.usage,
                model: data.model || this.model
            };
            
        } catch (error) {
            console.error('LLM Assistant Error:', error);
            return {
                success: false,
                error: error.message,
                message: null
            };
        }
    }
    
    /**
     * Fact-check a claim with conversational explanation
     */
    async explainFactCheck(claim, factCheckResults) {
        this.setContext('factChecking');
        
        const sourceSummary = factCheckResults.sources
            .map(s => `- ${s.source}: "${s.title}"`)
            .join('\n');
        
        const message = `I'm trying to verify this claim: "${claim}"

The fact-checkers found:
Status: ${factCheckResults.status}
Confidence: ${factCheckResults.confidence}%

Sources checked:
${sourceSummary}

Can you help me understand what this means in plain language? What should I know about this claim?`;
        
        return await this.sendMessage(message);
    }
    
    /**
     * Explain a bill in simple terms
     */
    async explainBill(billData) {
        this.setContext('billExplanation');
        
        const message = `Can you explain this bill to me in simple terms?

Title: ${billData.title}
Bill Number: ${billData.number}
Status: ${billData.status}
Summary: ${billData.summary || 'No summary available'}

What does this bill do? Who would it affect? What are the potential impacts?`;
        
        return await this.sendMessage(message);
    }
    
    /**
     * Analyze representative alignment
     */
    async analyzeAlignment(representative, userVotes, repVotes) {
        this.setContext('representativeAnalysis');
        
        const agreementCount = this.calculateAgreement(userVotes, repVotes);
        const agreementPercent = Math.round((agreementCount / userVotes.length) * 100);
        
        const message = `I've compared my voting positions to ${representative.name}'s actual votes on ${userVotes.length} bills. We agree ${agreementPercent}% of the time.

Can you help me understand what this alignment score means? What factors should I consider when evaluating my representative?`;
        
        return await this.sendMessage(message);
    }
    
    /**
     * Calculate agreement between user and representative votes
     */
    calculateAgreement(userVotes, repVotes) {
        let agreements = 0;
        
        userVotes.forEach(userVote => {
            const repVote = repVotes.find(rv => rv.billId === userVote.billId);
            if (repVote && userVote.position === repVote.position) {
                agreements++;
            }
        });
        
        return agreements;
    }
    
    /**
     * Answer general civic question
     */
    async askQuestion(question) {
        this.setContext('general');
        return await this.sendMessage(question);
    }
    
    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        console.log('🗑️  Conversation history cleared');
    }
    
    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }
    
    /**
     * Export conversation
     */
    exportConversation() {
        return {
            context: this.currentContext,
            messages: this.conversationHistory,
            timestamp: new Date().toISOString(),
            model: this.model
        };
    }
    
    /**
     * Import conversation
     */
    importConversation(exported) {
        if (exported.messages && Array.isArray(exported.messages)) {
            this.conversationHistory = exported.messages;
            this.currentContext = exported.context || 'general';
            console.log(`📥 Imported ${exported.messages.length} messages`);
        }
    }
}

/**
 * UI Component for chat interface
 */
class LLMAssistantUI {
    constructor(containerId, apiKey = null) {
        this.container = document.getElementById(containerId);
        this.assistant = new LLMAssistant({ apiKey });
        this.isOpen = false;
        
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="llm-assistant-widget">
                <button class="llm-assistant-toggle" id="llmToggle">
                    <i class="fas fa-comments"></i>
                    <span>Ask AI Assistant</span>
                </button>
                
                <div class="llm-assistant-chat" id="llmChat" style="display: none;">
                    <div class="llm-chat-header">
                        <h3>
                            <i class="fas fa-robot"></i>
                            Civic AI Assistant
                        </h3>
                        <div class="llm-chat-actions">
                            <button class="llm-clear-btn" id="llmClear" title="Clear conversation">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="llm-close-btn" id="llmClose">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="llm-chat-messages" id="llmMessages">
                        <div class="llm-message llm-assistant">
                            <div class="llm-message-content">
                                <p>👋 Hi! I'm your civic engagement assistant powered by Llama3.</p>
                                <p>I can help you:</p>
                                <ul>
                                    <li>Understand fact-checks and verify claims</li>
                                    <li>Explain bills and legislation</li>
                                    <li>Analyze your representative's positions</li>
                                    <li>Answer questions about democracy and voting</li>
                                </ul>
                                <p><strong>Important:</strong> I present facts objectively without political bias. I'll help you understand issues, but I won't tell you what to think!</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="llm-chat-input">
                        <textarea 
                            id="llmInput" 
                            placeholder="Ask me anything about civic engagement..."
                            rows="2"
                        ></textarea>
                        <button id="llmSend" class="llm-send-btn">
                            <i class="fas fa-paper-plane"></i>
                            Send
                        </button>
                    </div>
                    
                    <div class="llm-chat-footer">
                        <small>
                            <i class="fas fa-shield-alt"></i>
                            Powered by Groq + Llama3 • Privacy-first • No data retention
                        </small>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Toggle chat
        document.getElementById('llmToggle').addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Close chat
        document.getElementById('llmClose').addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Clear conversation
        document.getElementById('llmClear').addEventListener('click', () => {
            if (confirm('Clear conversation history?')) {
                this.assistant.clearHistory();
                this.clearMessages();
                this.addAssistantMessage('Conversation cleared. How can I help you?');
            }
        });
        
        // Send message
        const sendBtn = document.getElementById('llmSend');
        const input = document.getElementById('llmInput');
        
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        const chat = document.getElementById('llmChat');
        chat.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen) {
            document.getElementById('llmInput').focus();
        }
    }
    
    async sendMessage() {
        const input = document.getElementById('llmInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to UI
        this.addUserMessage(message);
        input.value = '';
        
        // Show loading
        const loadingId = this.addLoadingMessage();
        
        // Get response from assistant
        const response = await this.assistant.sendMessage(message);
        
        // Remove loading
        this.removeMessage(loadingId);
        
        // Add assistant response
        if (response.success) {
            this.addAssistantMessage(response.message);
        } else {
            this.addErrorMessage(response.error || 'Failed to get response');
        }
    }
    
    addUserMessage(message) {
        const messagesDiv = document.getElementById('llmMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'llm-message llm-user';
        messageDiv.innerHTML = `
            <div class="llm-message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        messagesDiv.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addAssistantMessage(message) {
        const messagesDiv = document.getElementById('llmMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'llm-message llm-assistant';
        messageDiv.innerHTML = `
            <div class="llm-message-content">
                ${this.formatMessage(message)}
            </div>
        `;
        messagesDiv.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addLoadingMessage() {
        const messagesDiv = document.getElementById('llmMessages');
        const messageDiv = document.createElement('div');
        const loadingId = 'loading-' + Date.now();
        messageDiv.id = loadingId;
        messageDiv.className = 'llm-message llm-assistant llm-loading';
        messageDiv.innerHTML = `
            <div class="llm-message-content">
                <i class="fas fa-circle-notch fa-spin"></i> Thinking...
            </div>
        `;
        messagesDiv.appendChild(messageDiv);
        this.scrollToBottom();
        return loadingId;
    }
    
    addErrorMessage(error) {
        const messagesDiv = document.getElementById('llmMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'llm-message llm-error';
        messageDiv.innerHTML = `
            <div class="llm-message-content">
                <p><i class="fas fa-exclamation-circle"></i> ${this.escapeHtml(error)}</p>
            </div>
        `;
        messagesDiv.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    removeMessage(id) {
        const message = document.getElementById(id);
        if (message) {
            message.remove();
        }
    }
    
    clearMessages() {
        const messagesDiv = document.getElementById('llmMessages');
        messagesDiv.innerHTML = '';
    }
    
    scrollToBottom() {
        const messagesDiv = document.getElementById('llmMessages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    formatMessage(message) {
        // Simple markdown-like formatting
        return message
            .split('\n')
            .map(line => {
                if (line.startsWith('- ')) {
                    return `<li>${this.escapeHtml(line.substring(2))}</li>`;
                }
                return `<p>${this.escapeHtml(line)}</p>`;
            })
            .join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LLMAssistant, LLMAssistantUI };
}
