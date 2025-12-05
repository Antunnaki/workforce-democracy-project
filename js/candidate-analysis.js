/**
 * CANDIDATE ANALYSIS MODULE
 * AI-powered analysis of election candidates including primary challengers and newcomers
 * Created: January 23, 2025
 * 
 * Features:
 * - Search for candidates by name, office, or location
 * - Get AI-powered policy position analysis
 * - Compare multiple candidates
 * - Ask questions about specific candidates
 * - Privacy-focused (no user data stored on server)
 */

// Configuration
const CANDIDATE_ANALYSIS_CONFIG = {
    // Use CONFIG system for API endpoint (V36.3.1)
    get apiEndpoint() {
        return window.CONFIG?.ENDPOINTS?.CANDIDATE_ANALYSIS || '/api/candidates';
    },
    
    // Check if backend is available (V36.3.1)
    get backendAvailable() {
        return window.CONFIG && window.CONFIG.isBackendConfigured();
    },
    
    // localStorage keys
    storageKeys: {
        chatHistory: 'wdp_candidate_chat_history',
        recentSearches: 'wdp_candidate_recent_searches',
        savedCandidates: 'wdp_saved_candidates'
    },
    
    // Settings
    maxChatHistory: 100,
    maxRecentSearches: 10,
    typingSpeed: 20
};

// State management
let candidateChatHistory = [];
let currentCandidates = [];
let selectedCandidate = null;

/**
 * Initialize candidate analysis module
 */
async function initializeCandidateAnalysis() {
    console.log('🗳️ Initializing Candidate Analysis module...');
    
    // Load chat history from encrypted storage
    await loadCandidateChatHistory();
    
    // Set up event listeners
    setupCandidateEventListeners();
    
    // Welcome message now handled by HTML empty state (V32.6)
    // addCandidateWelcomeMessage(); // Commented out - using standard empty state pattern
    
    console.log('✅ Candidate Analysis module initialized (encrypted storage active)');
}

/**
 * Setup event listeners
 */
function setupCandidateEventListeners() {
    // Search button
    const searchBtn = document.querySelector('.candidate-search-controls .search-button');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchCandidates);
    }
    
    // Search input - enter key
    const searchInput = document.getElementById('candidateSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchCandidates();
            }
        });
    }
    
    // Chat input - enter key (standard behavior, no Shift+Enter needed for single-line)
    const chatInput = document.getElementById('candidateChatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendCandidateMessage();
            }
        });
    }
}

/**
 * Search for candidates
 */
async function searchCandidates() {
    const searchInput = document.getElementById('candidateSearchInput');
    const officeFilter = document.getElementById('candidateOfficeFilter');
    const electionFilter = document.getElementById('candidateElectionFilter');
    const resultsContainer = document.getElementById('candidateResults');
    
    if (!searchInput || !resultsContainer) return;
    
    const searchQuery = searchInput.value.trim();
    const office = officeFilter?.value || '';
    const electionType = electionFilter?.value || '';
    
    if (!searchQuery && !office && !electionType) {
        showNotification('Please enter a search term or select a filter', 'warning');
        return;
    }
    
    // Show loading state
    resultsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Searching for candidates...</p>
        </div>
    `;
    
    try {
        // Call API (mock or real)
        const results = await fetchCandidates(searchQuery, office, electionType);
        
        // Display results
        displayCandidateResults(results);
        
        // Save to recent searches (encrypted)
        await saveRecentSearch({ searchQuery, office, electionType });
        
    } catch (error) {
        console.error('Error searching candidates:', error);
        resultsContainer.innerHTML = `
            <div class="error-state">
                <span style="font-size: 2rem; display: block; margin-bottom: 0.75rem;">😊</span>
                <h4>Oops! We couldn't find candidates right now</h4>
                <p style="margin: 0.75rem 0;">We're having trouble connecting. Please try again in a moment. 💙</p>
                <button onclick="searchCandidates()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Try Again</button>
            </div>
        `;
    }
}

/**
 * Fetch candidates from API
 */
async function fetchCandidates(query, office, electionType) {
    if (CANDIDATE_ANALYSIS_CONFIG.mockMode) {
        // Return mock data for testing
        return await getMockCandidates(query, office, electionType);
    }
    
    // Real API call
    const params = new URLSearchParams({
        q: query || '',
        office: office || '',
        election_type: electionType || ''
    });
    
    const response = await fetch(`${CANDIDATE_ANALYSIS_CONFIG.apiEndpoint}/search?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        console.error('Candidate search API error:', response.status);
        throw new Error('Unable to reach candidate database');
    }
    
    const data = await response.json();
    return data.candidates;
}

/**
 * Get mock candidates for testing
 */
async function getMockCandidates(query, office, electionType) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return sample candidates
    return [
        {
            id: 'cand-001',
            name: 'Alex Rodriguez',
            office: 'U.S. House - District 7',
            party: 'Democratic',
            incumbent: false,
            primaryChallenger: false,
            imageUrl: null,
            summary: 'First-time candidate focusing on healthcare reform, climate action, and worker rights. No previous political experience.',
            website: 'https://example.com/alex',
            sources: ['Campaign Website', 'Local News', 'Public Statements']
        },
        {
            id: 'cand-002',
            name: 'Maria Santos',
            office: 'State Senate - District 12',
            party: 'Democratic',
            incumbent: false,
            primaryChallenger: true,
            imageUrl: null,
            summary: 'Challenging incumbent on education funding and affordable housing. Community organizer with 15 years experience.',
            website: 'https://example.com/maria',
            sources: ['Campaign Website', 'Debates', 'Local News']
        },
        {
            id: 'cand-003',
            name: 'James Thompson',
            office: 'Mayor',
            party: 'Independent',
            incumbent: false,
            primaryChallenger: false,
            imageUrl: null,
            summary: 'Independent candidate with background in city planning. Focuses on infrastructure and public transportation.',
            website: 'https://example.com/james',
            sources: ['Campaign Website', 'Town Halls', 'Policy Papers']
        }
    ];
}

/**
 * Display candidate results
 */
function displayCandidateResults(candidates) {
    const resultsContainer = document.getElementById('candidateResults');
    if (!resultsContainer) return;
    
    currentCandidates = candidates;
    
    if (candidates.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results-state">
                <i class="fas fa-search"></i>
                <h4>No Candidates Found</h4>
                <p>Try adjusting your search terms or filters.</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="results-header">
            <h4>Found ${candidates.length} Candidate${candidates.length !== 1 ? 's' : ''}</h4>
        </div>
        <div class="candidate-cards">
            ${candidates.map(candidate => createCandidateCard(candidate)).join('')}
        </div>
    `;
}

/**
 * Create candidate card HTML
 */
function createCandidateCard(candidate) {
    const challengerBadge = candidate.primaryChallenger ? 
        '<span class="badge badge-primary-challenger">Primary Challenger</span>' : '';
    
    const newBadge = !candidate.incumbent && !candidate.primaryChallenger ? 
        '<span class="badge badge-new">New Candidate</span>' : '';
    
    const incumbentBadge = candidate.incumbent ? 
        '<span class="badge badge-incumbent">Incumbent</span>' : '';
    
    return `
        <div class="candidate-card" data-candidate-id="${candidate.id}">
            <div class="candidate-header">
                <div class="candidate-avatar">
                    ${candidate.imageUrl ? 
                        `<img src="${candidate.imageUrl}" alt="${candidate.name}">` :
                        `<div class="avatar-placeholder">${candidate.name.charAt(0)}</div>`
                    }
                </div>
                <div class="candidate-info">
                    <h5 class="candidate-name">${candidate.name}</h5>
                    <p class="candidate-office">${candidate.office}</p>
                    <p class="candidate-party">${candidate.party}</p>
                </div>
            </div>
            
            <div class="candidate-badges">
                ${incumbentBadge}
                ${challengerBadge}
                ${newBadge}
            </div>
            
            <div class="candidate-summary">
                <p>${candidate.summary}</p>
            </div>
            
            <div class="candidate-actions">
                <button class="btn-analyze" onclick="analyzeCand('${candidate.id}')">
                    <i class="fas fa-chart-line"></i>
                    <span>Analyze Positions</span>
                </button>
                <button class="btn-compare" onclick="addToComparison('${candidate.id}')">
                    <i class="fas fa-balance-scale"></i>
                    <span>Compare</span>
                </button>
                ${candidate.website ? 
                    `<a href="${candidate.website}" target="_blank" class="btn-website">
                        <i class="fas fa-external-link-alt"></i>
                        <span>Website</span>
                    </a>` : ''
                }
            </div>
        </div>
    `;
}

/**
 * Analyze candidate (show detailed view)
 */
async function analyzeCandidate(candidateId) {
    const candidate = currentCandidates.find(c => c.id === candidateId);
    if (!candidate) return;
    
    selectedCandidate = candidate;
    
    // Show loading
    const detailView = document.getElementById('candidateDetailView');
    if (!detailView) return;
    
    detailView.style.display = 'block';
    detailView.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Analyzing ${candidate.name}'s positions...</p>
        </div>
    `;
    
    // Scroll to detail view
    detailView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        // Fetch detailed analysis
        const analysis = await fetchCandidateAnalysis(candidateId);
        
        // Display detailed view
        displayCandidateDetail(candidate, analysis);
        
    } catch (error) {
        console.error('Error analyzing candidate:', error);
        detailView.innerHTML = `
            <div class="error-state">
                <span style="font-size: 2rem; display: block; margin-bottom: 0.75rem;">😊</span>
                <h4>Couldn't load candidate analysis</h4>
                <p style="margin: 0.75rem 0;">We're having trouble loading this candidate's information. Please try again in a moment. 💙</p>
                <button onclick="analyzeCandidate('${candidateId}')" style="margin: 0.5rem 0.25rem; padding: 0.5rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Try Again</button>
                <button onclick="closeCandidateDetail()" style="margin: 0.5rem 0.25rem; padding: 0.5rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Close</button>
            </div>
        `;
    }
}

// Make function globally accessible
window.analyzeCandidate = analyzeCandidate;

// Alternative shorter function name
function analyzeCand(id) {
    analyzeCandidate(id);
}
window.analyzeCand = analyzeCand;

/**
 * Fetch candidate analysis from API
 */
async function fetchCandidateAnalysis(candidateId) {
    if (CANDIDATE_ANALYSIS_CONFIG.mockMode) {
        return await getMockCandidateAnalysis(candidateId);
    }
    
    // Real API call
    const response = await fetch(`${CANDIDATE_ANALYSIS_CONFIG.apiEndpoint}/${candidateId}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            includeComparisons: true,
            includeSources: true
        })
    });
    
    if (!response.ok) {
        console.error('Candidate analysis API error:', response.status);
        throw new Error('Unable to load candidate details');
    }
    
    const data = await response.json();
    return data.analysis;
}

/**
 * Get mock candidate analysis
 */
async function getMockCandidateAnalysis(candidateId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
        policyPositions: {
            healthcare: {
                stance: 'Supports universal healthcare with public option',
                details: 'Has publicly advocated for expanding Medicare and creating a public option. Campaign literature emphasizes reducing prescription drug costs.',
                sources: ['Campaign Website', 'Town Hall - June 2024', 'Interview with Local News']
            },
            climate: {
                stance: 'Strong climate action advocate',
                details: 'Proposes Green New Deal-style investments in renewable energy and green jobs. Supports carbon pricing.',
                sources: ['Policy Paper', 'Debate Statement', 'Environmental Org Questionnaire']
            },
            economy: {
                stance: 'Pro-worker economic policies',
                details: 'Supports raising minimum wage to $20/hour, strengthening unions, and worker cooperatives. Advocates for progressive taxation.',
                sources: ['Campaign Website', 'Labor Union Endorsement Statement']
            },
            education: {
                stance: 'Increase education funding',
                details: 'Proposes doubling federal education funding, making community college free, and student debt forgiveness for public service.',
                sources: ['Education Policy Brief', 'Teacher Union Forum']
            }
        },
        keyIssues: ['Healthcare Reform', 'Climate Action', 'Worker Rights', 'Education Funding'],
        strengths: [
            'Clear policy positions with specific proposals',
            'Strong grassroots support',
            'Focus on working-class issues'
        ],
        concerns: [
            'Limited political experience',
            'Funding challenges compared to incumbent',
            'Some positions may be too progressive for district'
        ],
        votingRecord: null, // New candidate - no voting record
        endorsements: [
            'Local Teachers Union',
            'State Labor Council',
            'Progressive Democrats Organization'
        ],
        funding: {
            totalRaised: '$450,000',
            averageDonation: '$45',
            grassrootsPercentage: '92%'
        }
    };
}

/**
 * Display candidate detail view
 */
function displayCandidateDetail(candidate, analysis) {
    const detailView = document.getElementById('candidateDetailView');
    if (!detailView) return;
    
    detailView.innerHTML = `
        <div class="candidate-detail">
            <div class="detail-header">
                <button class="close-btn" onclick="closeCandidateDetail()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="detail-title">
                    <h3>${candidate.name}</h3>
                    <p>${candidate.office}</p>
                </div>
            </div>
            
            <div class="detail-body">
                <!-- Policy Positions -->
                <div class="detail-section">
                    <h4><i class="fas fa-file-alt"></i> Policy Positions</h4>
                    <div class="policy-grid">
                        ${Object.entries(analysis.policyPositions).map(([topic, data]) => `
                            <div class="policy-card">
                                <h5>${capitalizeFirst(topic)}</h5>
                                <p class="stance"><strong>${data.stance}</strong></p>
                                <p class="details">${data.details}</p>
                                <div class="sources">
                                    <small><i class="fas fa-link"></i> Sources: ${data.sources.join(', ')}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Key Issues -->
                <div class="detail-section">
                    <h4><i class="fas fa-star"></i> Key Issues</h4>
                    <div class="key-issues">
                        ${analysis.keyIssues.map(issue => `
                            <span class="issue-tag">${issue}</span>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Strengths & Concerns -->
                <div class="detail-section">
                    <div class="strengths-concerns">
                        <div class="strengths">
                            <h4><i class="fas fa-check-circle"></i> Strengths</h4>
                            <ul>
                                ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="concerns">
                            <h4><i class="fas fa-exclamation-circle"></i> Considerations</h4>
                            <ul>
                                ${analysis.concerns.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Endorsements -->
                ${analysis.endorsements.length > 0 ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-thumbs-up"></i> Endorsements</h4>
                        <div class="endorsements">
                            ${analysis.endorsements.map(e => `
                                <span class="endorsement-tag">${e}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Funding -->
                ${analysis.funding ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-dollar-sign"></i> Campaign Funding</h4>
                        <div class="funding-info">
                            <div class="funding-stat">
                                <strong>Total Raised:</strong> ${analysis.funding.totalRaised}
                            </div>
                            <div class="funding-stat">
                                <strong>Average Donation:</strong> ${analysis.funding.averageDonation}
                            </div>
                            <div class="funding-stat">
                                <strong>Grassroots Support:</strong> ${analysis.funding.grassrootsPercentage}
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Actions -->
                <div class="detail-actions">
                    <button onclick="askAboutCandidate('${candidate.id}')" class="btn-ask">
                        <i class="fas fa-comments"></i>
                        <span>Ask AI About This Candidate</span>
                    </button>
                    <button onclick="addToComparison('${candidate.id}')" class="btn-compare">
                        <i class="fas fa-balance-scale"></i>
                        <span>Add to Comparison</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    detailView.style.display = 'block';
}

/**
 * Close candidate detail view
 */
function closeCandidateDetail() {
    const detailView = document.getElementById('candidateDetailView');
    if (detailView) {
        detailView.style.display = 'none';
        detailView.innerHTML = '';
    }
    selectedCandidate = null;
}
window.closeCandidateDetail = closeCandidateDetail;

/**
 * Add candidate to comparison list
 */
function addToComparison(candidateId) {
    // TODO: Implement comparison feature
    showNotification('Comparison feature coming soon!', 'info');
}
window.addToComparison = addToComparison;

/**
 * Ask AI about specific candidate
 */
function askAboutCandidate(candidateId) {
    const candidate = currentCandidates.find(c => c.id === candidateId);
    if (!candidate) return;
    
    // Set input with pre-filled question
    const chatInput = document.getElementById('candidateChatInput');
    if (chatInput) {
        chatInput.value = `Tell me more about ${candidate.name}'s position on `;
        chatInput.focus();
        
        // Open and scroll to chat
        const chatWindow = document.getElementById('candidateChatWindow');
        if (chatWindow && !chatWindow.classList.contains('active')) {
            toggleCandidateChat();
        }
        const chatWidget = document.querySelector('.candidate-analysis-chat-widget');
        if (chatWidget) {
            chatWidget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}
window.askAboutCandidate = askAboutCandidate;

/**
 * Send message in candidate chat
 */
async function sendCandidateMessage() {
    const input = document.getElementById('candidateChatInput');
    const messagesContainer = document.getElementById('candidateChatMessages');
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Clear input
    input.value = '';
    
    // Add user message
    addChatMessage('user', message);
    
    // Add to history
    candidateChatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });
    await saveCandidateChatHistory();
    
    // ✅ V34.0.0: CHECK SMART LOCAL TOOLS FIRST (instant, free visualizations)
    if (window.processWithSmartLocalTools) {
        const handledLocally = window.processWithSmartLocalTools(message, 'candidate');
        
        if (handledLocally) {
            console.log('[Candidate Chat] ✅ Query handled by Smart Local Tool (saved LLM cost)');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return;
        }
    }
    
    // ✅ V32.9.6: CHECK FOR HELPFUL SUGGESTIONS
    if (window.checkForHelpfulSuggestion) {
        const suggestion = window.checkForHelpfulSuggestion(message);
        
        if (suggestion) {
            // Show suggestion immediately (before AI response)
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'chat-message assistant-message';
            suggestionDiv.innerHTML = `
                <div class="message-content">
                    ${suggestion}
                </div>
            `;
            messagesContainer.appendChild(suggestionDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response
        const response = await getCandidateAIResponse(message);
        
        // Remove typing indicator
        hideTypingIndicator();
        
        // V36.7.1 Phase 4: Add AI response with markdown + citation rendering
        await addChatMessage('assistant', response, true); // Will use typewriter with markdown
        
        // Add to history
        candidateChatHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });
        await saveCandidateChatHistory();
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        hideTypingIndicator();
        addChatMessage('assistant', '😊 Oops! I had trouble with that question. Could you try asking in a different way? I\'m here to help! 💙');
    }
}

/**
 * Get AI response about candidates (V36.7.1: Connected to real backend LLM)
 */
async function getCandidateAIResponse(message) {
    // V36.7.1: Use same backend as other chats (queryBackendAPI)
    try {
        // Check if backend API is available
        if (typeof queryBackendAPI === 'function') {
            console.log('[Candidate Chat] 🔗 Using real backend LLM via queryBackendAPI');
            
            // Build context for candidate chat
            const context = {
                chatType: 'candidates',
                selectedCandidate: selectedCandidate ? {
                    id: selectedCandidate.id,
                    name: selectedCandidate.name,
                    office: selectedCandidate.office
                } : null,
                recentContext: getRecentCandidateContext()
            };
            
            // Query backend (same as Bills/Civic/Ethical chats)
            const response = await queryBackendAPI('candidates', message, { context });
            
            // V36.7.1 Phase 4: Response already includes markdown + citations
            return response.response || response.text || 'Sorry, I couldn\'t generate a response.';
            
        } else {
            console.warn('[Candidate Chat] ⚠️ queryBackendAPI not available, using fallback');
            return await getMockCandidateResponse(message);
        }
        
    } catch (error) {
        console.error('[Candidate Chat] API Error:', error);
        // Fallback to mock response on error
        return await getMockCandidateResponse(message);
    }
}

/**
 * Get mock AI response
 */
async function getMockCandidateResponse(message) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('primary challenger')) {
        return `Primary challengers are candidates who run against incumbent members of their own party in primary elections. They often represent different wings of the party or challenge incumbents on specific policy issues.\n\nIn the context of the candidates shown, these individuals bring fresh perspectives and may push the party platform in new directions. Primary challenges are an important part of democratic accountability.`;
    }
    
    if (messageLower.includes('no experience') || messageLower.includes('newcomer') || messageLower.includes('first time')) {
        return `Candidates without previous political experience can bring valuable perspectives:\n\n**Advantages:**\n• Fresh ideas unencumbered by political establishment\n• Often more connected to everyday concerns\n• May have expertise from other fields (business, science, activism)\n• Can energize new voters\n\n**Considerations:**\n• Learning curve for legislative processes\n• May lack established relationships\n• Need to build name recognition\n\nMany effective legislators started without political experience. Focus on their policy positions, values, and commitment to public service.`;
    }
    
    if (messageLower.includes('compare') || messageLower.includes('difference')) {
        return `To compare candidates effectively, I can help you examine:\n\n• **Policy Positions**: Where do they stand on key issues?\n• **Experience**: What relevant background do they bring?\n• **Endorsements**: Who supports them?\n• **Funding**: Who's financing their campaign?\n• **Values**: What principles guide their decisions?\n\nWhich specific candidates would you like me to compare, and on which issues?`;
    }
    
    if (messageLower.includes('position') || messageLower.includes('policy')) {
        return `I can analyze candidate positions based on:\n\n• Campaign websites and policy papers\n• Public statements and speeches\n• Debate responses\n• Questionnaires from advocacy organizations\n• Town hall meetings\n• Social media posts\n• News interviews\n\nWhich candidate and which policy area would you like to explore? (e.g., healthcare, climate, economy, education)`;
    }
    
    // Default response
    return `I'm here to help you understand candidate positions and make informed decisions.\n\nI can help with:\n• Analyzing specific policy positions\n• Comparing multiple candidates\n• Understanding candidate backgrounds\n• Explaining campaign funding sources\n• Answering questions about specific issues\n\nWhat would you like to know about the candidates?`;
}

/**
 * Get recent chat context
 */
function getRecentCandidateContext() {
    return candidateChatHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
    }));
}

/**
 * Add message to chat (V36.7.1: Now supports markdown + citations with typewriter)
 */
async function addChatMessage(role, content, useTypewriter = false) {
    const messagesContainer = document.getElementById('candidateChatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message`;
    
    const avatar = role === 'user' ? '👤' : '🤖';
    
    // Create message structure
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    messageDiv.innerHTML = `<div class="message-avatar">${avatar}</div>`;
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // V36.7.1 Phase 4: Use markdown + citation typewriter for assistant messages
    if (role === 'assistant' && useTypewriter) {
        // Remove empty state if it exists
        const emptyState = messagesContainer.querySelector('.chat-empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        // Use markdown + citation typewriter (Phase 4)
        if (window.typewriterWithMarkdownAndCitations) {
            window.typewriterWithMarkdownAndCitations(contentDiv, content, 15, 'candidateChatMessages');
        } else if (window.typewriterEffectWithCitations) {
            // Fallback to Phase 3 (citations only)
            window.typewriterEffectWithCitations(contentDiv, content, 15, 'candidateChatMessages');
        } else {
            // Fallback to formatted message
            contentDiv.innerHTML = formatChatMessage(content);
        }
    } else {
        // User messages use simple formatting
        contentDiv.innerHTML = formatChatMessage(content);
    }
    
    scrollChatToBottom();
}

/**
 * Format chat message content
 */
function formatChatMessage(content) {
    let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^• (.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\s*)+/gs, '<ul>$&</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    return `<p>${formatted}</p>`;
}

/**
 * Add welcome message to chat
 */
function addCandidateWelcomeMessage() {
    const messagesContainer = document.getElementById('candidateChatMessages');
    if (!messagesContainer) return;
    
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'chat-message assistant-message';
    welcomeMsg.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p><strong>Welcome to Candidate Analysis!</strong></p>
            <p>I can help you research election candidates, including primary challengers and newcomers without political history.</p>
            <p><strong>Try asking:</strong></p>
            <p>• "Tell me about [candidate name]'s position on healthcare"<br>
            • "Compare the candidates on climate policy"<br>
            • "What are the main differences between these candidates?"<br>
            • "Who is funding this candidate's campaign?"</p>
            <p>All analysis is based on publicly available data including campaign materials, public statements, and verified news sources.</p>
        </div>
    `;
    messagesContainer.appendChild(welcomeMsg);
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const messagesContainer = document.getElementById('candidateChatMessages');
    if (!messagesContainer) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'chat-message assistant-message typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(indicator);
    scrollChatToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Scroll chat to bottom
 */
function scrollChatToBottom() {
    const messagesContainer = document.getElementById('candidateChatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

/**
 * Load chat history from encrypted storage
 * 🔒 SECURITY: Uses AES-256-GCM encryption via SecurityManager
 */
async function loadCandidateChatHistory() {
    try {
        // Try encrypted storage first (new secure method)
        if (window.securityManager && typeof securityManager.secureRetrieve === 'function') {
            const encryptedData = await securityManager.secureRetrieve('candidate_chat_history');
            if (encryptedData) {
                candidateChatHistory = encryptedData;
                console.log(`🔒 Loaded ${candidateChatHistory.length} chat messages from encrypted storage`);
                return;
            }
        }
        
        // Migration path: Check for old unencrypted data
        const stored = localStorage.getItem(CANDIDATE_ANALYSIS_CONFIG.storageKeys.chatHistory);
        if (stored) {
            candidateChatHistory = JSON.parse(stored);
            console.log(`⚠️ Migrating ${candidateChatHistory.length} chat messages to encrypted storage...`);
            
            // Immediately migrate to encrypted storage
            await saveCandidateChatHistory();
            
            // Remove old unencrypted data
            localStorage.removeItem(CANDIDATE_ANALYSIS_CONFIG.storageKeys.chatHistory);
            console.log('✅ Migration to encrypted storage complete');
        }
    } catch (e) {
        console.error('Error loading chat history:', e);
        candidateChatHistory = [];
    }
}

/**
 * Save chat history to encrypted storage
 * 🔒 SECURITY: Uses AES-256-GCM encryption via SecurityManager
 */
async function saveCandidateChatHistory() {
    try {
        if (candidateChatHistory.length > CANDIDATE_ANALYSIS_CONFIG.maxChatHistory) {
            candidateChatHistory = candidateChatHistory.slice(-CANDIDATE_ANALYSIS_CONFIG.maxChatHistory);
        }
        
        // Use encrypted storage if available
        if (window.securityManager && typeof securityManager.secureStore === 'function') {
            await securityManager.secureStore('candidate_chat_history', candidateChatHistory);
            console.log('🔒 Chat history saved to encrypted storage');
        } else {
            // Fallback to plain localStorage (temporary, should not happen)
            console.warn('⚠️ SecurityManager not available, using plain localStorage (NOT SECURE)');
            localStorage.setItem(
                CANDIDATE_ANALYSIS_CONFIG.storageKeys.chatHistory,
                JSON.stringify(candidateChatHistory)
            );
        }
    } catch (e) {
        console.error('Error saving chat history:', e);
    }
}

/**
 * Clear chat history
 */
async function clearCandidateChatHistory() {
    if (confirm('Clear all conversation history? This cannot be undone.')) {
        candidateChatHistory = [];
        
        // Remove from encrypted storage
        if (window.securityManager && typeof securityManager.secureDelete === 'function') {
            securityManager.secureDelete('candidate_chat_history');
        }
        // Also remove any old unencrypted data
        localStorage.removeItem(CANDIDATE_ANALYSIS_CONFIG.storageKeys.chatHistory);
        
        const messagesContainer = document.getElementById('candidateChatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            addCandidateWelcomeMessage();
        }
        
        if (typeof showNotification === 'function') {
            showNotification('Chat history cleared', 'success');
        }
    }
}

/**
 * Save recent search to encrypted storage
 * 🔒 SECURITY: Uses AES-256-GCM encryption via SecurityManager
 */
async function saveRecentSearch(search) {
    try {
        // Get existing searches from encrypted storage
        let searches = [];
        if (window.securityManager && typeof securityManager.secureRetrieve === 'function') {
            searches = await securityManager.secureRetrieve('candidate_searches') || [];
        } else {
            // Migration path: check old storage
            const oldSearches = localStorage.getItem(CANDIDATE_ANALYSIS_CONFIG.storageKeys.recentSearches);
            if (oldSearches) {
                searches = JSON.parse(oldSearches);
            }
        }
        
        // Add new search
        searches.unshift({ ...search, timestamp: new Date().toISOString() });
        searches = searches.slice(0, CANDIDATE_ANALYSIS_CONFIG.maxRecentSearches);
        
        // Save to encrypted storage
        if (window.securityManager && typeof securityManager.secureStore === 'function') {
            await securityManager.secureStore('candidate_searches', searches);
            console.log('🔒 Search saved to encrypted storage');
            
            // Remove old unencrypted data
            localStorage.removeItem(CANDIDATE_ANALYSIS_CONFIG.storageKeys.recentSearches);
        } else {
            // Fallback
            console.warn('⚠️ SecurityManager not available, using plain localStorage (NOT SECURE)');
            localStorage.setItem(CANDIDATE_ANALYSIS_CONFIG.storageKeys.recentSearches, JSON.stringify(searches));
        }
    } catch (e) {
        console.error('Error saving recent search:', e);
    }
}

/**
 * Utility: Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Utility: Show notification
 */
function showNotification(message, type = 'info') {
    // Use existing notification system if available
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Toggle candidate chat widget (show/hide)
 */
function toggleCandidateChat(event) {
    // Prevent event bubbling if called from close button
    if (event) {
        event.stopPropagation();
    }
    
    const chatWindow = document.getElementById('candidateChatWindow');
    if (chatWindow) {
        chatWindow.classList.toggle('active');
        
        console.log('Candidate chat toggled. Active:', chatWindow.classList.contains('active'));
        
        if (chatWindow.classList.contains('active')) {
            document.getElementById('candidateChatInput')?.focus();
        }
    }
}
// Export toggle function
window.toggleCandidateChat = toggleCandidateChat;

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCandidateAnalysis);
} else {
    initializeCandidateAnalysis();
}

// Export for use in other modules
window.CandidateAnalysis = {
    searchCandidates,
    analyzeCandidate,
    sendCandidateMessage,
    clearCandidateChatHistory
};
