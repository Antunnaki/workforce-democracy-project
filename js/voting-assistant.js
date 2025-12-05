/**
 * VOTING ASSISTANT CHAT WIDGET
 * AI-powered voting information assistant using Groq/Llama 3
 * Provides personalized help with voter registration, polling locations, and voting procedures
 * Version: V36.1.0
 * Last Updated: 2025-01-27
 */

let votingAssistantOpen = false;
let votingAssistantContext = {
    country: null,
    votingData: null
};

/**
 * Open Voting Assistant Chat Modal
 */
function openVotingAssistant() {
    // Get currently selected country
    const countrySelector = document.getElementById('votingCountrySelector');
    const selectedCountry = countrySelector ? countrySelector.value : null;
    
    votingAssistantContext.country = selectedCountry;
    votingAssistantContext.votingData = currentVotingCountry ? votingData.countries[currentVotingCountry] : null;
    
    // Create modal if it doesn't exist
    if (!document.getElementById('votingAssistantModal')) {
        createVotingAssistantModal();
    }
    
    // Open modal
    const modal = document.getElementById('votingAssistantModal');
    if (modal) {
        modal.style.display = 'flex';
        votingAssistantOpen = true;
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('votingAssistantInput');
            if (input) input.focus();
        }, 300);
        
        // Add initial message if needed
        const messagesContainer = document.getElementById('votingAssistantMessages');
        if (messagesContainer && messagesContainer.children.length === 0) {
            addVotingAssistantInitialMessage();
        }
    }
}

/**
 * Create Voting Assistant Modal HTML
 */
function createVotingAssistantModal() {
    const modalHTML = `
        <div id="votingAssistantModal" class="voting-assistant-modal" style="display: none;">
            <div class="voting-assistant-overlay" onclick="closeVotingAssistant()"></div>
            <div class="voting-assistant-container">
                <!-- Header -->
                <div class="voting-assistant-header">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.75rem;">🗳️</span>
                        <div>
                            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: white;">Voting Assistant</h3>
                            <p style="margin: 0; font-size: 0.875rem; opacity: 0.9; color: white;">AI-Powered Voting Information</p>
                        </div>
                    </div>
                    <button onclick="closeVotingAssistant()" 
                            class="voting-assistant-close" 
                            aria-label="Close voting assistant">
                        ✕
                    </button>
                </div>
                
                <!-- Messages Container -->
                <div class="voting-assistant-messages" id="votingAssistantMessages">
                    <!-- Messages will be added here dynamically -->
                </div>
                
                <!-- Input Area -->
                <div class="voting-assistant-input-container">
                    <textarea id="votingAssistantInput" 
                              class="voting-assistant-input" 
                              placeholder="Ask me anything about voting..."
                              rows="1"></textarea>
                    <button onclick="sendVotingAssistantMessage()" 
                            class="voting-assistant-send-btn"
                            aria-label="Send message">
                        <span style="font-size: 1.25rem;">➤</span>
                    </button>
                </div>
                
                <!-- Privacy Notice -->
                <div class="voting-assistant-privacy">
                    🔒 Your conversations are private and not stored
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize event listeners
    initializeVotingAssistantListeners();
}

/**
 * Initialize event listeners for voting assistant
 */
function initializeVotingAssistantListeners() {
    const input = document.getElementById('votingAssistantInput');
    
    if (input) {
        // Enter key to send
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendVotingAssistantMessage();
            }
        });
        
        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });
    }
    
    console.log('✅ Voting Assistant listeners initialized');
}

/**
 * Close Voting Assistant Modal
 */
function closeVotingAssistant() {
    const modal = document.getElementById('votingAssistantModal');
    if (modal) {
        modal.style.display = 'none';
        votingAssistantOpen = false;
    }
}

/**
 * Add initial welcome message
 */
function addVotingAssistantInitialMessage() {
    const messagesContainer = document.getElementById('votingAssistantMessages');
    if (!messagesContainer) return;
    
    const countryName = votingAssistantContext.country ? 
        votingData.countries[votingAssistantContext.country].countryName : 
        'USA, Mexico, or Australia';
    
    const welcomeHTML = `
        <div class="assistant-message">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-bubble assistant-bubble">
                    <p><strong>👋 Welcome to the Voting Assistant!</strong></p>
                    <p>I'm here to help you with:</p>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.6;">
                        <li>✅ Voter registration and eligibility</li>
                        <li>📍 Finding polling locations</li>
                        <li>📅 Important voting deadlines</li>
                        <li>🪪 Required ID and documents</li>
                        <li>📬 Absentee and early voting</li>
                        <li>♿ Accessibility services</li>
                    </ul>
                    ${votingAssistantContext.country ? 
                        `<p style="margin-top: 0.75rem; padding: 0.5rem; background: rgba(102, 126, 234, 0.1); border-radius: 6px;">
                            <strong>📍 Current Country:</strong> ${countryName}
                        </p>` : 
                        `<p style="margin-top: 0.75rem; color: #718096; font-size: 0.875rem;">
                            💡 Tip: Select your country from the dropdown above for personalized assistance!
                        </p>`
                    }
                    <p style="margin-top: 0.75rem; font-size: 0.9375rem;">What would you like to know about voting?</p>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.innerHTML = welcomeHTML;
}

/**
 * Send user message to voting assistant
 */
async function sendVotingAssistantMessage() {
    const input = document.getElementById('votingAssistantInput');
    const messagesContainer = document.getElementById('votingAssistantMessages');
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    addTypingIndicator();
    
    // Get AI response
    const response = await fetchVotingAssistantResponse(message);
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add assistant response
    addMessage(response, 'assistant');
}

/**
 * Add message to chat
 */
function addMessage(content, type = 'user') {
    const messagesContainer = document.getElementById('votingAssistantMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-bubble user-bubble">
                    ${escapeHtml(content)}
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-bubble assistant-bubble">
                    ${content}
                </div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Add typing indicator
 */
function addTypingIndicator() {
    const messagesContainer = document.getElementById('votingAssistantMessages');
    if (!messagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'assistant-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-bubble assistant-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Fetch AI response from Groq/Llama 3 backend
 * Hybrid approach: Local data + LLM fallback
 */
async function fetchVotingAssistantResponse(userMessage) {
    // First, try to answer with local voting data (fast, free, accurate)
    const localResponse = await tryLocalVotingResponse(userMessage);
    if (localResponse) {
        return localResponse;
    }
    
    // If no local match, use LLM for more complex queries
    return await fetchGroqVotingResponse(userMessage);
}

/**
 * Try to answer with local voting data (FAST, FREE, ACCURATE)
 */
async function tryLocalVotingResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    const country = votingAssistantContext.country;
    const data = votingAssistantContext.votingData;
    
    // If no country selected
    if (!country || !data) {
        if (msg.includes('register') || msg.includes('registration')) {
            return `
                <p><strong>📝 Voter Registration Information</strong></p>
                <p>Please select your country from the dropdown above to get specific registration information.</p>
                <p><strong>Available countries:</strong></p>
                <ul>
                    <li>🇺🇸 United States</li>
                    <li>🇲🇽 México</li>
                    <li>🇦🇺 Australia</li>
                </ul>
            `;
        }
        
        return `
            <p>To provide accurate voting information, please select your country from the dropdown menu above.</p>
            <p>I can help you with voting information for:</p>
            <ul>
                <li>🇺🇸 United States</li>
                <li>🇲🇽 México</li>
                <li>🇦🇺 Australia</li>
            </ul>
        `;
    }
    
    // Eligibility questions
    if (msg.includes('eligible') || msg.includes('can i vote') || msg.includes('who can vote')) {
        let response = `<p><strong>✅ Voter Eligibility in ${data.countryName}</strong></p>`;
        response += `<ul>`;
        data.eligibility.requirements.forEach(req => {
            response += `<li>${req}</li>`;
        });
        response += `</ul>`;
        if (data.eligibility.notes) {
            response += `<p style="margin-top: 0.75rem; padding: 0.5rem; background: #f0f9ff; border-radius: 6px; font-size: 0.9375rem;">${data.eligibility.notes}</p>`;
        }
        if (data.eligibility.officialLink) {
            response += `<p style="margin-top: 1rem;"><a href="${data.eligibility.officialLink}" target="_blank" style="color: #667eea; font-weight: 600;">📄 Official Information →</a></p>`;
        }
        return response;
    }
    
    // Registration questions
    if (msg.includes('register') || msg.includes('registration') || msg.includes('how to register')) {
        let response = `<p><strong>📝 ${data.registration.title}</strong></p>`;
        response += `<ol style="padding-left: 1.5rem; line-height: 1.6;">`;
        data.registration.steps.forEach(step => {
            response += `<li>${step}</li>`;
        });
        response += `</ol>`;
        if (data.registration.deadlines) {
            response += `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 0.75rem; border-radius: 6px; margin: 1rem 0;">
                <strong>⏰ Deadlines:</strong> ${data.registration.deadlines}
            </div>`;
        }
        if (data.registration.officialLinks && data.registration.officialLinks.primary) {
            response += `<p style="margin-top: 1rem;"><a href="${data.registration.officialLinks.primary}" target="_blank" style="display: inline-block; background: #667eea; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">📝 Register Now →</a></p>`;
        }
        return response;
    }
    
    // Polling location questions
    if (msg.includes('where') || msg.includes('polling') || msg.includes('vote location') || msg.includes('polling place')) {
        let response = `<p><strong>📍 ${data.pollingLocations.title}</strong></p>`;
        response += `<ul style="padding-left: 1.5rem; line-height: 1.6;">`;
        data.pollingLocations.howToFind.forEach(item => {
            response += `<li>${item}</li>`;
        });
        response += `</ul>`;
        if (data.pollingLocations.officialLinks && data.pollingLocations.officialLinks.locator) {
            response += `<p style="margin-top: 1rem;"><a href="${data.pollingLocations.officialLinks.locator}" target="_blank" style="display: inline-block; background: #667eea; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">📍 Find Your Polling Place →</a></p>`;
        }
        return response;
    }
    
    // ID requirements
    if (msg.includes('id') || msg.includes('document') || msg.includes('identification') || msg.includes('what do i need')) {
        let response = `<p><strong>🪪 ${data.requiredDocuments.title}</strong></p>`;
        response += `<p>${data.requiredDocuments.description}</p>`;
        response += `<ul style="padding-left: 1.5rem; line-height: 1.6;">`;
        data.requiredDocuments.acceptedIds.forEach(id => {
            response += `<li>${id}</li>`;
        });
        response += `</ul>`;
        if (data.requiredDocuments.notes) {
            response += `<p style="margin-top: 0.75rem; padding: 0.5rem; background: #fef3c7; border-radius: 6px; font-size: 0.9375rem;">${data.requiredDocuments.notes}</p>`;
        }
        return response;
    }
    
    // Deadline/date questions
    if (msg.includes('when') || msg.includes('deadline') || msg.includes('date') || msg.includes('election day')) {
        let response = `<p><strong>📅 ${data.importantDates.title}</strong></p>`;
        response += `<p>${data.importantDates.description}</p>`;
        if (data.importantDates.presidentialElection) {
            response += `<div style="background: #f0f9ff; padding: 0.75rem; border-radius: 6px; margin: 0.5rem 0;">
                <strong>🗳️ Presidential Elections:</strong> ${data.importantDates.presidentialElection}
            </div>`;
        }
        if (data.importantDates.generalElection) {
            response += `<div style="background: #f0f9ff; padding: 0.75rem; border-radius: 6px; margin: 0.5rem 0;">
                <strong>🗳️ General Elections:</strong> ${data.importantDates.generalElection}
            </div>`;
        }
        return response;
    }
    
    // Early voting / absentee
    if (msg.includes('early') || msg.includes('absentee') || msg.includes('mail') || msg.includes('postal')) {
        let response = `<p><strong>📬 ${data.votingMethods.title}</strong></p>`;
        data.votingMethods.methods.forEach(method => {
            if (method.type.toLowerCase().includes('early') || 
                method.type.toLowerCase().includes('absentee') || 
                method.type.toLowerCase().includes('mail') ||
                method.type.toLowerCase().includes('postal')) {
                response += `<div style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin: 0.75rem 0;">
                    <h4 style="margin: 0 0 0.5rem; font-size: 1rem;">${method.type}</h4>
                    <p style="margin: 0 0 0.5rem;">${method.description}</p>
                    ${method.requirements ? `<p style="margin: 0; font-size: 0.875rem; color: #6b7280;"><strong>Requirements:</strong> ${method.requirements}</p>` : ''}
                </div>`;
            }
        });
        return response;
    }
    
    // Accessibility
    if (msg.includes('accessibility') || msg.includes('disabled') || msg.includes('wheelchair') || msg.includes('assistance')) {
        let response = `<p><strong>♿ ${data.accessibility.title}</strong></p>`;
        response += `<ul style="padding-left: 1.5rem; line-height: 1.6;">`;
        data.accessibility.services.forEach(service => {
            response += `<li>${service}</li>`;
        });
        response += `</ul>`;
        if (data.accessibility.helpline) {
            response += `<div style="background: #dcfce7; padding: 0.75rem; border-radius: 6px; margin: 1rem 0;">
                <strong>📞 Accessibility Helpline:</strong> ${data.accessibility.helpline}
            </div>`;
        }
        return response;
    }
    
    // No local match found
    return null;
}

/**
 * Fetch response from Groq/Llama 3 API
 * 
 * Uses CONFIG.ENDPOINTS.VOTING_ASSISTANT for API endpoint
 * Automatically switches between production and placeholder based on CONFIG.GROQ_ENABLED
 */
async function fetchGroqVotingResponse(userMessage) {
    // Check if backend is configured and enabled
    if (!window.CONFIG || !window.CONFIG.isGroqReady()) {
        // Return placeholder response
        return generatePlaceholderVotingResponse(userMessage);
    }
    
    // PRODUCTION CODE - Calls actual Groq backend
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.SECURITY.API_TIMEOUT);
        
        const response = await fetch(CONFIG.ENDPOINTS.VOTING_ASSISTANT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                country: votingAssistantContext.country,
                context: votingAssistantContext.votingData
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response || data.message || 'Unable to generate response.';
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Groq API timeout:', error);
            return '<p>⏱️ Request timeout. The AI service is taking too long to respond. Please try again.</p>';
        }
        
        console.error('Groq API error:', error);
        
        if (CONFIG.ANALYTICS.LOG_API_ERRORS) {
            console.error('Full error details:', {
                message: error.message,
                endpoint: CONFIG.ENDPOINTS.VOTING_ASSISTANT,
                timestamp: new Date().toISOString()
            });
        }
        
        return '<p>😊 Oops! I had trouble connecting right now. Could you try asking again in a moment? 💙</p><p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">💡 <strong>Tip:</strong> Try asking specific questions like "How do I register?" for instant answers from our local database!</p>';
    }
}

/**
 * Generate placeholder response (development/fallback mode)
 */
function generatePlaceholderVotingResponse(userMessage) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const country = votingAssistantContext.country;
            const countryName = country ? votingData.countries[country].countryName : 'your country';
            
            const backendStatus = CONFIG ? CONFIG.getBackendStatus() : { message: 'Backend not configured' };
            
            resolve(`
                <p><strong>Thank you for your question about voting in ${countryName}!</strong></p>
                <p>I'm an AI-powered voting assistant ready to provide accurate, personalized information about:</p>
                <ul>
                    <li>📝 Detailed voter registration guidance</li>
                    <li>📍 Personalized polling location assistance</li>
                    <li>📅 Important deadlines and dates</li>
                    <li>🪪 Required identification documents</li>
                    <li>📬 Early voting and absentee ballot information</li>
                    <li>♿ Accessibility services and support</li>
                </ul>
                <p style="margin-top: 1rem; padding: 0.75rem; background: #fef3c7; border-radius: 6px; font-size: 0.9375rem;">
                    ⚠️ <strong>Backend Status:</strong> ${backendStatus.message}<br>
                    <em>Once the Groq AI backend is deployed and configured, I'll provide detailed, personalized responses powered by Llama 3!</em>
                </p>
                <p style="margin-top: 1rem; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; font-size: 0.9375rem;">
                    💡 <strong>For now:</strong> Try asking specific questions like "How do I register?" or "Where do I vote?" for instant answers from our comprehensive local database!
                </p>
            `);
        }, 1000);
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global exposure for inline onclick handlers
window.openVotingAssistant = openVotingAssistant;
window.closeVotingAssistant = closeVotingAssistant;
window.sendVotingAssistantMessage = sendVotingAssistantMessage;

console.log('✅ Voting Assistant Chat initialized');
