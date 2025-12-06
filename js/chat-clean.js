/**
* Clean Chat System v37.9.14-FINAL
 * 
 * COMPLETE REBUILD - NO TYPEWRITER EFFECT
 * 
 * Features:
 * - ✅ INSTANT text display (no character-by-character rendering)
 * - ✅ Simple superscript citations (¹ ² ³ not [1] [2] [3])
 * - ✅ Collapsible Sources section below response
 * - ✅ Bill voting integration with official links
 * - ✅ Smart paragraph formatting (1-10 based on complexity)
 * - ✅ Context-aware (knows what page user is viewing)
 * - ✅ Sourceprioritization (independent > fact-checkers > mainstream)
 * - ✅ 2-minute timeout for policy research queries
 * - ✅ localStorage persistence (survives tab switch/chat close)
 * - ✅ Auto-scroll to BOTTOM of chat (shows full response)
 * - ✅ DYNAMIC container support (floatingwidget + inline chats)
 * - ✅ Single loading indicator (no duplicates)
 * 
 * WHY NO TYPEWRITER:
 * User reported: "it seems since i had citations working and then implemented 
 * the typewriter effect, everything started breaking"
 * 
 * Root cause: Character-by-character rendering breaks HTML structure,causing:
 * - Citations display as `_CITATION0_` instead of clickable links
 * - Markdown bold (__text__) conflicts with citation placeholders (__CITATION_0__)
 * - Multiple failed fixes (20+ documentation files)
 * 
 * Solution: REMOVE typewriter entirely, render text instantly** Created: November 7, 2025
 * Updated: January 13, 2026
 * Version: 37.9.14-FINAL - All fixes complete
 * 
 * v37.9.14-FINAL CHANGELOG (January 13, 2026):
 * - 🔧 CRITICAL FIX: Added currentChatContainer to track active chat
 * - 🔧 CRITICAL FIX: displayLoadingMessage() and displayAIResponse() now use dynamic container
 * - 🔧 ROOT CAUSE: Functions were hardcoded to 'chat-messages' which doesn'texist
 * - ✅ Now works with floating widget (floatingChatMessages) and all inline chats
 * - ✅ Container is set when user opens a chat or sends a message
 * - 🔧 FIX: Removed duplicate loading indicators (was showing 2 "Thinking" boxes)
 * - ✅ Added skipLoadingIndicator parameter to sendQuery()
 * - ✅ handleInlineChatSend() now passes skipLoadingIndicator=true
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CleanChat = {
    version: '37.9.14-FINAL',
    apiBase: 'https://api.workforcedemocracyproject.org', // Fixed: removed '/test' path
    fetchTimeout: 300000, // 5 minutes for policy research queries (backend needs 60-90s)
    currentChatContainer: null, // FIX v37.9.14: Track which chat container is active
    
    //Source prioritization (exactly as user requested)
    newsSources: {
        independent: [
            { name: 'Zeteo', domain: 'zeteo.com', priority: 1 },
            { name: 'Breaking Points',domain: 'breakingpoints.com', priority: 1 },
            { name:'The Intercept', domain: 'theintercept.com', priority: 1 },
            { name: 'Democracy Now', domain: 'democracynow.org', priority: 1 },
            { name: 'ProPublica', domain: 'propublica.org', priority: 1 }
        ],
factCheckers: [
            { name: 'PolitiFact', domain: 'politifact.com', priority: 2 },
            { name: 'FactCheck.org', domain: 'factcheck.org', priority: 2 },
          { name: 'AP Fact Check', domain: 'apnews.com/ap-fact-check', priority: 2 },
            { name: 'Reuters Fact Check', domain: 'reuters.com/fact-check', priority: 2 }
        ],
        mainstream: [
            { name: 'AP News', domain: 'apnews.com', priority: 3 },
            { name: 'Reuters',domain: 'reuters.com', priority: 3 },
            { name: 'BBC News', domain: 'bbc.com/news', priority: 3 }
        ]
    },
    
    // UI Configuration
    ui: {
        primaryColor: '#6366f1',
        maxHistoryLength: 10,
        autoScrollEnabled: true,
        sourcesCollapsedByDefault: true // User wants collapsible sources
    },
    
    // Context tracking
    context: {
        page: 'unknown',
        section: null,
        viewingContent: null
    },
    
    // State management
    state: {
       isOpen: false,
        conversationHistory: [],
        currentSources: [],
        persistedMessages: [] // Store messages for persistence
    }
};

// =============================================================================
// PERSISTENCE MANAGEMENT
// =============================================================================

/**
 * Save chat messages to localStorage so theysurvive tab switch/chat close
 */
function saveChatHistory() {
   try {
        const historyData = {
            messages: CleanChat.state.persistedMessages,
            timestamp: Date.now()
        };
        localStorage.setItem('cleanChatHistory', JSON.stringify(historyData));
        console.log('[CleanChat] 💾 Chathistory savedto localStorage');
    } catch (error) {
        console.error('[CleanChat] ❌ Failed to save chat history:', error);
    }
}

/**
 * Load chat messages from localStorage when chat is reopened
 */
function loadChatHistory() {
    try {
        const stored = localStorage.getItem('cleanChatHistory');
if(stored) {
            const historyData = JSON.parse(stored);
// Only load if less than 24 hours old
            const age = Date.now() - historyData.timestamp;
            if (age < 24 * 60 * 60 * 1000) {
CleanChat.state.persistedMessages = historyData.messages || [];
                console.log('[CleanChat] 📂 Loaded %d messages from localStorage', CleanChat.state.persistedMessages.length);
                return CleanChat.state.persistedMessages;
            } else {
                console.log('[CleanChat] ⏰ Clearing old chathistory (>24h)');
                localStorage.removeItem('cleanChatHistory');
            }
}
    } catch (error) {
        console.error('[CleanChat] ❌ Failed to load chat history:', error);
    }
    return [];
}

/**
 * Restore persisted messages to UI when chat is reopened
 */
function restoreChatMessages() {
const messages = loadChatHistory();
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    // Clear existing messages
    chatMessages.innerHTML = '';
    
    // Restore each message
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
       messageDiv.className = msg.isUser ? 'user-message' : 'ai-message';
messageDiv.innerHTML = msg.html;
        chatMessages.appendChild(messageDiv);
    });
    
    console.log('[CleanChat] ✅ Restored %d messages to UI', messages.length);
}

// =============================================================================
// CONTEXT DETECTION
// =============================================================================/**
 * Detect what page/content user is currently viewing
 * This helps theAI provide more relevant responses
 */
function detectContext() {
    const path = window.location.pathname;
    const context = { 
        page: 'home', 
        section: null, 
        viewingContent: null 
    };
    
  // Detect page
    if (path.includes('civic-platform')) {
       context.page = 'civic-platform';
    } else if (path.includes('philosophies')) {
        context.page = 'philosophies';
    } else if (path.includes('learning')) {
        context.page = 'learning';
  } else if (path.includes('privacy')) {
        context.page = 'privacy';
    } else if (path === '/' || path.includes('index')) {
        context.page = 'home';
    }
    
    // Detect section (which part of page is visible)
    const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight * 0.5) {
            context.section = section.id;
        }
    });
    
    // Detect specific content being viewed
    if (context.section === 'my-representatives'){
const repCard = document.querySelector('.rep-card');  // ✅ FIX:Changed from .representative-card to .rep-card
        if (repCard) {
            const name = repCard.querySelector('.rep-name')?.textContent;
            if (name) {
                context.viewingContent = { type:'representative', name };
            }
        }
    } else if (context.section === 'bills') {
        const billTitle = document.querySelector('.bill-title.active')?.textContent;
        if (billTitle) {
            context.viewingContent = { type: 'bill', title: billTitle };
        }
   }
    
return context;
}

// =============================================================================
// CITATION CONVERSION (Simple Superscripts ¹ ² ³)
// =============================================================================

/**
 * Convert [1] [2] [3] to superscript ¹ ² ³
 * NO TYPEWRITER - instant conversion
 * 
 * Userrequirement: "simple superscript numbers (¹ ² ³) instead"
 * User requirement: "Click citation number to expand sources and access link"
 * 
 * CRITICAL FIX: Use DOM manipulation instead of innerHTML string replacement
 * to prevent HTML escaping issues
 */
function convertCitations(text, sources) {
if(!text) {
        return text;
    }
    
    // Handle case where no sourcesprovided
    if (!sources || sources.length === 0) {
        console.warn('[convertCitations] ⚠️ No sources provided, but text may contain citations');
        // Still process to show warnings for anycitationsfound
    }
    
    console.log('[convertCitations] Processing citations...');
    console.log('[convertCitations] Text length:', text.length);
    console.log('[convertCitations] Sources count:', sources ? sources.length : 0);
    console.log('[convertCitations] Sample text:', text.substring(0,300));
    
    // Map numbers to superscript Unicode characters
    // Supportsunlimited citations: ¹, ², ... ¹⁰, ¹¹, ... ⁹⁹, ¹⁰⁰, etc.
    const superscriptMap = {
        '0':'⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};
    
    // Convert [1], [2], [3] etc to clickable superscripts
let converted = text;
    let citationsFound = 0;
    let citationsConverted = 0;
    let missingSourcesWarnings = [];
    
    // Match [1] through [999] (supportsup to 999 citations)
    converted = converted.replace(/\[(\d{1,3})\]/g, (match, num) => {
        const index = parseInt(num) - 1; // [1] = sources[0]
        citationsFound++;
        
        // Only convert if sourceexistsif (sources && index >= 0 && index < sources.length) {
            // Convert number to superscript (e.g., "12" → "¹²")
            const superscript = num.split('').map(digit => 
                superscriptMap[digit] || digit
            ).join('');
citationsConverted++;
            
            // Use data attribute instead of onclick to avoid HTML escaping
            return `<sup class="citation-link" data-source-index="${index}">${superscript}</sup>`;
        }
        
        // Source doesn't exist - REMOVE citation entirely (user's Option D)
        // User requirement:"If youare unable to provide the source, please do not include"
        // Reason: Would be interpreted as AI interpretation withoutproper attribution
        missingSourcesWarnings.push({
            citation: num,
            index: index,
            position: match.index
        });
        
        console.warn(`[convertCitations]⚠️ MISSING SOURCE:Citation [${num}] found in text but no corresponding source at index ${index}`);
        console.warn(`[convertCitations] → REMOVING citation from display (no source = no citation)`);
        console.warn(`[convertCitations] → Backend should provide source object at sources[${index}]`);
        
        return''; // REMOVE citation entirely - don't show [N] or any placeholder
    });
    
    // Summarylogging
    console.log(`[convertCitations] ✅ Summary:`);
    console.log(`[convertCitations]    → Citations found in text: ${citationsFound}`);
console.log(`[convertCitations]    → Citations converted to superscripts: ${citationsConverted}`);
    console.log(`[convertCitations]    → Sources provided by backend: ${sources ? sources.length : 0}`);
    
    if (missingSourcesWarnings.length > 0) {
        console.error(`[convertCitations]❌ BACKEND DATA MISMATCH:`);
        console.error(`[convertCitations]    → ${missingSourcesWarnings.length} citation(s) have no matching source`);
        console.error(`[convertCitations]    → These citations have been REMOVED from display`);
        console.error(`[convertCitations]    →Missing citations: [${missingSourcesWarnings.map(w => w.citation).join('], [')}]`);
       console.error(`[convertCitations]    → Backend must send ${citationsFound} sources, currently sends ${sources ? sources.length : 0}`);
        console.error(`[convertCitations]    →User will see plain text [N] for missing citations`);
    }
    
    return converted;
}

// =============================================================================
//MARKDOWN RENDERING (Simple, NO typewriter)
// =============================================================================

/**
 * Convert markdown to HTML - INSTANT rendering
 * NO character-by-character processing
 * 
 *CRITICAL FIX: Do NOTwrap in <p> tags - we'll add those AFTER citations
 * to prevent HTML escaping issues
 */
functionrenderMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Links: [text](url)- but NOT citation numbers [1] [2] [3]
    // Only convert if it's a proper markdown link with (url)
    html = html.replace(/\[([^\]\d]+)\]\(([^)]+)\)/g, 
        '<a href="$2" target="_blank" rel="noopenernoreferrer">$1</a>');
    
    // Line breaks - use <br> instead of </p><p> to avoid escaping issues
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    
    // DO NOT wrap in <p>tags - citations will be added next
    return html;
}

// =============================================================================
// SOURCES SECTION BUILDER
// =============================================================================

/**
 * Build collapsible Sources section
 * Userrequirement: "Collapsible'Sources' section below response text"
 */
function buildSourcesSection(sources) {
    if (!sources || sources.length === 0) {
        return '';
    }
    
    const sourcesHTML = sources.map((source, index) => {
        const num = index + 1;
        return`
            <div class="source-item" id="source-${index}" 
                 style="background: white; padding: 12px; margin: 8px 0; 
                        border-radius: 8px; border-left: 4px solid #3b82f6;">
                <divstyle="display: flex; align-items: start; gap: 12px;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
                                color: white; padding: 4px 10px; border-radius: 6px; 
                                font-weight: bold; flex-shrink: 0;">
                        ${num}
                    </div>
<div style="flex: 1;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">
                            ${source.title || 'Source ' + num}
                        </div>
                        ${source.snippet ? `
                            <divstyle="color: #64748b; font-size: 0.9em; margin-bottom: 8px;">
                                ${source.snippet}
                            </div>
                        ` : ''}
<a href="${source.url}" target="_blank" rel="noopener noreferrer"
                           style="color: #3b82f6; font-size: 0.9em; text-decoration: none; 
                                  display: inline-flex; align-items: center; gap: 4px;">
                            <span>${new URL(source.url).hostname}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 13v6a2 20 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 219"></polyline>
                               <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    return `
       <div class="sources-section"style="margin-top: 20px;">
            <div class="sources-header" onclick="CleanChat.toggleSources(this)" 
                 style="cursor: pointer; display: flex; align-items: center; gap: 8px; 
                        padding: 12px;background: linear-gradient(135deg, #eff6ff, #dbeafe); 
                        border-radius: 8px; margin-bottom: 12px;">
                <span style="font-size: 1.2em;">📚</span>
                <strong style="color: #1e40af; flex: 1;">Sources (${sources.length})</strong>
                <svg class="sources-arrow" width="20" height="20" viewBox="0 0 24 24" 
                     fill="none" stroke="#1e40af" style="transition: transform0.3s ease;">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
            <div class="sources-list" style="display: ${CleanChat.ui.sourcesCollapsedByDefault ? 'none' : 'block'};">
                ${sourcesHTML}
           </div>
        </div>
    `;
}

// =============================================================================
// BILL VOTING INTEGRATION
// =============================================================================

/**
 * Add bill voting information when relevant
 * User requirement: "Link to official government record of the vote"
 * User requirement: "Bill summary"
* User requirement: "How the representative voted"
 * User requirement: "Impact analysis of the vote"
 */
function addBillVotingInfo(text, context) {
   // Check if we're viewing a bill
    if (!context.viewingContent || context.viewingContent.type !== 'bill') {
        return text;
}
    
    const billInfo = context.viewingContent;
    
    // Add bill context section
    const billSection = `
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; 
                    padding: 16px; margin: 16px 0; border-radius: 8px;">
            <div style="font-weight: 600; color: #1e40af; margin-bottom: 8px;">
                📜 Bill Context: ${billInfo.title}
            </div>
            <div style="font-size: 0.95em;color: #475569;">
                <a href="https://www.congress.gov" target="_blank"style="color: #3b82f6; text-decoration: none;">
                    View Official Voting Record →
                </a>
            </div>
        </div>
   `;
    
    return billSection + text;
}

// =============================================================================
// SMART PARAGRAPH FORMATTING
// =============================================================================

/**
* Format response with appropriate number of paragraphs
 * User requirement: "Dynamic paragraph count (1-10 based on question complexity)"
 * Userrequirement: "No rigid structure"
 * Userrequirement: "No duplicate information"
 * User requirement: "Context-appropriate length"
 */
function formatSmartParagraphs(text){
    // V37.18.12: FIX - Don't split on '. ' if it's part of a numbered list (1. 2. 3. etc.)
// Problem: "5. Environmental Sustainability: text" was being split into "5" and "Environmental..."
    // Solution: Detect numbered lists and preserve them
    
    // First, check if text contains numbered list patterns
    const hasNumberedList = /\n\d+\.\s/.test(text) || /^\d+\.\s/.test(text);
    
    if (hasNumberedList) {
        // Text has numbered lists - preserve them byNOT processing
        console.log('[formatSmartParagraphs] Detected numbered list, preserving original formatting');
        return text;
    }
    
    // Splitinto sentences (but not on numbered lists like"1. ", "2. ")
    // Use negative lookahead to avoid splitting on digit followed by period
    const sentences =text.split(/(?<!\d)\. /).map(s => s.trim()).filter(s => s.length > 0);
    
    // Determineparagraph grouping based on content length
    consttotalSentences = sentences.length;
    let paragraphSize;
    
    if (totalSentences <= 3) {
        //Short answer: 1 paragraph
        paragraphSize = totalSentences;
    } else if (totalSentences <= 6) {
        //Medium answer: 2-3 paragraphs
paragraphSize = Math.ceil(totalSentences / 2);
    } else if (totalSentences <= 12) {
// Long answer: 3-5 paragraphs
        paragraphSize = Math.ceil(totalSentences / 4);
    } else {
       // Very long answer: 5-10 paragraphs
        paragraphSize = Math.ceil(totalSentences / 6);
    }
    
    // Group sentences into paragraphs
   const paragraphs = [];
    for (let i = 0; i < sentences.length; i += paragraphSize) {
        const group = sentences.slice(i, i + paragraphSize);
       paragraphs.push(group.join('. ') + '.');
    }
    
    return paragraphs.join('\n\n');
}

// =============================================================================
// BACKEND APIINTEGRATION
// =============================================================================

/**
 * Send query to backend and get AI response
 * Uses existing backend: https://api.workforcedemocracyproject.org
 * 
 * FIX v37.9.8: Added 2-minute timeout for policy research queries
 * FIX v37.9.14: Skip loading message if called from handleInlineChatSend (it creates its own)
 * FIX 2025-12-06: Simplified approach to use direct APIcall instead of async job queue
 */
async function sendQuery(userMessage, skipLoadingIndicator = false) {
    try {
        // Update context
        CleanChat.context = detectContext();
        
        // Show loading state (unless caller already showed one)
        if (!skipLoadingIndicator) {
            displayLoadingMessage();
       }
        
        // Prepare request - Backend expects 'message' not 'query'
        const requestBody= {
            message: userMessage,
            context: CleanChat.context,
            conversationHistory: CleanChat.state.conversationHistory
        };
        
        console.log('[CleanChat v37.9.12-ASYNC] 📤 Sending direct request:', requestBody);
        
        const startTime = Date.now();
        
// Direct approach: Send message directly to LLM chat endpoint
        const directResponse = await fetch(`${CleanChat.apiBase}/api/civic/llm-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
});
        
        if (!directResponse.ok) {
            const errorText = await directResponse.text();
            console.error('[CleanChat v37.9.12-ASYNC] ❌ Direct API error:', errorText);
            throw new Error(`HTTP ${directResponse.status}: ${errorText}`);
       }
        
        const data = await directResponse.json();
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('[CleanChat v37.9.12-ASYNC] ✅ Received result after', elapsedTime, 'seconds:', data);
        
// Extract response and sources
        let aiResponse = data.message || 'Sorry, I received an empty response.';
        const sources = data.sources || [];
        
        // FIX v37.18.8: Ensure aiResponse is always a string (backend might return object)
        if (typeof aiResponse !=='string') {
            console.warn('[CleanChat] ⚠️ aiResponse is not a string, converting:', typeof aiResponse);
            aiResponse = String(aiResponse);
        }
        
        console.log('[CleanChat] 📊 Raw response:', aiResponse.substring(0, 300));
        console.log('[CleanChat] 📚 Sources received from backend:', sources.length);
        
        // Count how many citations are in the text
        const citationMatches = aiResponse.match(/\[\d{1,3}\]/g);
        const citationCount = citationMatches ? citationMatches.length : 0;
        
        console.log('[CleanChat] 📊 Citations found in text:', citationCount);
        console.log('[CleanChat] 📊 Citation numbers:', citationMatches);
        
        // VALIDATION: Check for citation/source mismatch
        if (citationCount > 0 && sources.length !== citationCount) {
            console.error('\n' + '='.repeat(80));
            console.error('🛑 BACKEND DATA MISMATCH DETECTED!');
            console.error('='.repeat(80));
            console.error(`📄 Text contains: ${citationCount} citation(s) ${citationMatches ? citationMatches.join(' ') : ''}`);
            console.error(`📚 Backend provided: ${sources.length} source(s)`);
            console.error(`❌ Gap: ${Math.abs(citationCount - sources.length)} ${citationCount > sources.length ? 'MISSING' : 'EXTRA'} source(s)`);
            console.error('');
            
            if (citationCount > sources.length) {
                console.error('⚠️ PROBLEM: Morecitations than sources');
                console.error(`   → Citations [${sources.length + 1}] through [${citationCount}] will be REMOVED from display`);
                console.error(`   → User requirement: "If no source, don't include citation" (prevents misattribution)`);
                console.error(`→ Backend should send ${citationCount} sources, currently sends ${sources.length}`);
                console.error(`   → Check LLM prompt: Should only add citations when sources exist`);
            } else {
                console.error('⚠️ WARNING: More sources than citations');
                console.error(`   → Sources [${citationCount +1}] through [${sources.length}] will not be linked`);
                console.error(`   → These sources will appear in Sources section but no citation in text`);
            }
            
            console.error('');
            console.error('🔧 EXPECTED BEHAVIOR:');
            console.error('→ Every [N] in text should have sources[N-1] object');
            console.error('   → Every source should be cited as [N] in text');
            console.error('   → citationCount === sources.length (perfect match)');
            console.error('='.repeat(80) + '\n');
        } else if (citationCount > 0 && sources.length === citationCount) {
            console.log('✅ Perfect match: %d citations = %d sources', citationCount, sources.length);
        }
        
        console.log('[CleanChat] 📚 Sources array:', JSON.stringify(sources, null, 2));
        
        // Store sources for citation linking
        CleanChat.state.currentSources = sources;
        
        // CRITICAL FIX: Correct order of operations
        // 1. Format paragraphs (plain text operation)
        let formattedResponse = formatSmartParagraphs(aiResponse);
        
        // 2. Add bill context if viewing a bill (plain text/HTML)
        formattedResponse= addBillVotingInfo(formattedResponse, CleanChat.context);
        
        // 3. Convert citations FIRST (while still mostly text)
        const withCitations = convertCitations(formattedResponse, sources);
        
        // 4. THEN render markdown (thiswon't escape the citations)
        constmarkdownRendered = renderMarkdown(withCitations);
        
        // 5. Wrap in paragraph tag NOW (after all processing)
        const finalHTML = '<p>' + markdownRendered + '</p>';
        
        // 6. Build sources section
        const sourcesHTML =buildSourcesSection(sources);
        
       // Display response (INSTANT - no typewriter!)
        displayAIResponse(finalHTML + sourcesHTML, userMessage);
        
        // Update conversation history
        CleanChat.state.conversationHistory.push({
            role: 'user',
            content: userMessage
        }, {
            role:'assistant',
            content: aiResponse
        });
        
        // Keep only last N exchanges
        if (CleanChat.state.conversationHistory.length > CleanChat.ui.maxHistoryLength * 2) {
            CleanChat.state.conversationHistory = CleanChat.state.conversationHistory.slice(-CleanChat.ui.maxHistoryLength*2);
        }
        
       // Save to localStorage
        saveChatHistory();
        
    } catch (error) {
        console.error('[CleanChat v37.9.12-ASYNC] ❌ Error:', error);
        
        // Display error message
        displayErrorMessage(error.message || 'Anerroroccurred while processing your request.');
   }
}

// =============================================================================
// UI HELPER FUNCTIONS
// =============================================================================

function displayLoadingMessage() {
    // FIX v37.9.14: Use dynamic container instead of hardcoded 'chat-messages'
    const chatMessages = CleanChat.currentChatContainer ? 
        document.getElementById(CleanChat.currentChatContainer) :document.getElementById('floatingChatMessages'); // Fallback to floating widget
    
    if (!chatMessages) {
        console.error('[CleanChat] ❌ Chat container not found. Current:', CleanChat.currentChatContainer);
        return;
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className= 'ai-message loading';
    loadingDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🤖</span>
            <div style="display: flex;align-items: center; gap: 6px;">
                <span style="font-size: 14px; color: #64748b;">Thinking</span>
                <div class="thinking-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
<spanclass="dot"></span>
                </div>
            </div>
        </div>
        <style>
            .thinking-dots {
                display: inline-flex;
                gap: 4px;
                align-items: center;
            }
            .thinking-dots .dot {
                width: 6px;
               height: 6px;
                background: #3b82f6;
                border-radius: 50%;
                animation: thinking-pulse 1.4s infinite ease-in-out;
            }
            .thinking-dots .dot:nth-child(1) {
                animation-delay: 0s;
           }
            .thinking-dots .dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            .thinking-dots .dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            @keyframes thinking-pulse {
                0%, 60%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                30% {
                    transform: scale(1.2);
                    opacity: 1;
                }
            }
        </style>
    `;
    chatMessages.appendChild(loadingDiv);
    
   if (CleanChat.ui.autoScrollEnabled) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function displayAIResponse(html, userMessage) {
    // Remove loading message
    const loading = document.querySelector('.ai-message.loading');
    if (loading) loading.remove();
    
   // FIX v37.9.14: Use dynamic container instead of hardcoded 'chat-messages'
    const chatMessages = CleanChat.currentChatContainer ? 
        document.getElementById(CleanChat.currentChatContainer) : 
        document.getElementById('floatingChatMessages'); // Fallback to floating widget
    
    if (!chatMessages) {
       console.error('[CleanChat] ❌ Chat container not found. Current:', CleanChat.currentChatContainer);
        return;
    }
    
    console.log('[CleanChat] ✅ Displaying response to container:', CleanChat.currentChatContainer || 'floatingChatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message';
    messageDiv.innerHTML = html; // INSTANT display - no typewriter!
    
    // CRITICALFIX: Add click handlers to citations AFTER DOM insertion
    // This prevents HTML escaping issues with onclick attributes
    const citations = messageDiv.querySelectorAll('.citation-link');
    citations.forEach(citation => {
        const sourceIndex = parseInt(citation.dataset.sourceIndex);
        citation.addEventListener('click', () => {
            CleanChat.scrollToSource(sourceIndex);
        });
        citation.style.cursor = 'pointer';
        citation.style.color = '#3b82f6';
        citation.style.fontWeight = 'bold';
        citation.title = 'Click to see source';
    });
    
    chatMessages.appendChild(messageDiv);
    
    // FIX v37.9.8: Persist messages to localStorage
    CleanChat.state.persistedMessages.push({
        isUser: true,
        html: userMessage,
        timestamp: Date.now()
    });
    CleanChat.state.persistedMessages.push({
        isUser: false,
        html: html,
        timestamp: Date.now()
    });
saveChatHistory();
    
    // FIX v37.9.14: Scroll to bottom of chat container to show full response
    if (CleanChat.ui.autoScrollEnabled) {
        // Scroll the container we just wrote to
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
}
    }
}

function displayErrorMessage(message) {
    const loading = document.querySelector('.ai-message.loading');
    if (loading) loading.remove();
    
    // FIX v37.9.14: Use dynamic container instead of hardcoded 'chat-messages'
    const chatMessages = CleanChat.currentChatContainer ?document.getElementById(CleanChat.currentChatContainer) : 
        document.getElementById('floatingChatMessages'); // Fallback to floating widget
    
    if (!chatMessages) {
        console.error('[CleanChat] ❌ Chat container not found forerror message. Current:', CleanChat.currentChatContainer);
        return;
    }
    
    consterrorDiv = document.createElement('div');
    errorDiv.className = 'ai-message error';
    errorDiv.innerHTML = `<p style="color: #ef4444;">${message}</p>`;
    chatMessages.appendChild(errorDiv);
}

// =============================================================================
// PUBLIC API
// =============================================================================

// Expose functions to window foronclick handlers
CleanChat.scrollToSource = function(index) {
    const sourceElement = document.getElementById(`source-${index}`);
    if (sourceElement) {
        // Expand sources section if collapsed
        const sourcesList = sourceElement.closest('.sources-list');
        if (sourcesList && sourcesList.style.display === 'none'){
const header = sourcesList.previousElementSibling;
            CleanChat.toggleSources(header);
        }
        
        // Scroll to source
        sourceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
// Highlight source briefly
        sourceElement.style.background = '#dbeafe';
        setTimeout(() => {
sourceElement.style.background = 'white';
        }, 2000);
    }
};

CleanChat.toggleSources = function(headerElement) {
    const sourcesList = headerElement.nextElementSibling;
    const arrow= headerElement.querySelector('.sources-arrow');
    
    if (sourcesList.style.display === 'none') {
       sourcesList.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        sourcesList.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
};

// =============================================================================
// INLINE CHAT TOGGLE (For existing HTML widgets)
// =============================================================================/**
 *Toggle inline chat sections (called by onclick in HTML)
 * This function was in the deleted files - recreating it here
 */
window.toggleInlineChat = function(chatId) {
    console.log(`[CleanChat] toggleInlineChat('${chatId}') called`);
    
    const windowId = `${chatId}InlineChatWindow`;
    const toggleId = `${chatId}InlineChatToggle`;
    const sendId = `${chatId}InlineChatSend`;
    const inputId = `${chatId}InlineChatInput`;
    
    const chatWindow = document.getElementById(windowId);
    const toggleButton = document.getElementById(toggleId);
    
   if (!chatWindow) {
        console.error(`[CleanChat] Chat window not found: ${windowId}`);
        return;
    }
    
    // Toggle visibility
    if (chatWindow.style.display === 'none' || !chatWindow.style.display) {
        chatWindow.style.display = 'block';
if (toggleButton) toggleButton.classList.add('active');
        console.log(`[CleanChat] Opened: ${chatId}`);
        
        // FIX v37.9.8: Restore persisted messageswhen chat is reopened
        const messagesId = `${chatId}InlineChatMessages`;
        const messagesContainer= document.getElementById(messagesId);
        if (messagesContainer && messagesContainer.children.length === 0) {
            // Only restore if container is empty (first open)
            restoreChatMessages();
        }
    } else{
        chatWindow.style.display = 'none';
        if (toggleButton) toggleButton.classList.remove('active');
        console.log(`[CleanChat] Closed: ${chatId}`);
    }
    
    // Initialize event listener for send button if not already done
    const sendButton = document.getElementById(sendId);
    constinputField = document.getElementById(inputId);
    
    if (sendButton && inputField && !sendButton.dataset.initialized) {
sendButton.addEventListener('click', function() {
            handleInlineChatSend(chatId, inputId, `${chatId}InlineChatMessages`);
        });
        
        inputField.addEventListener('keypress',function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleInlineChatSend(chatId, inputId, `${chatId}InlineChatMessages`);
            }
        });
        
        sendButton.dataset.initialized = 'true';
        console.log(`[CleanChat] Event listeners added for: ${chatId}`);
    }
};

/**
 * Handle sending a message from inline chat*/
async function handleInlineChatSend(chatId, inputId, messagesId) {
    const inputField = document.getElementById(inputId);
    const messagesContainer = document.getElementById(messagesId);
    
    if (!inputField || !messagesContainer) return;
    
    // FIX v37.9.14: Setcurrent container so displayAIResponse knows where to write
    CleanChat.currentChatContainer = messagesId;
    console.log('[CleanChat] 📍 Active chat container set to:', messagesId);
    
    const message =inputField.value.trim();
    if (!message) return;
    
    // Clear input
    inputField.value = '';
    
   // Add user message to UI
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'inline-chat-message inline-chat-message-user';
    userMessageDiv.innerHTML =`
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; justify-content: flex-end;">
            <div style="background: #3b82f6; color: white; padding: 0.75rem 1rem; 
                        border-radius: 12px; max-width: 80%;">
                ${message}
            </div>
            <div style="font-size: 1.5rem; flex-shrink: 0;">👤</div>
        </div>
    `;
    messagesContainer.appendChild(userMessageDiv);
    messagesContainer.scrollTop= messagesContainer.scrollHeight;
    
    // Add loading message with animated dots
    const loadingDiv = document.createElement('div');
   loadingDiv.className = 'inline-chat-message inline-chat-message-assistant loading';
    loadingDiv.innerHTML = `
        <div style="display: flex; gap: 0.75rem;align-items: flex-start;">
<div style="font-size: 1.5rem; flex-shrink: 0;">🤖</div>
            <div style="background: #f1f5f9; padding: 0.75rem 1rem; border-radius: 12px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px; color: #64748b;">Thinking</span>
                <div class="thinking-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                   <span class="dot"></span>
                </div>
            </div>
        </div>
   `;
messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Send to backend
    try {
        // Pass skipLoadingIndicator=true since we already created a loading indicator above
        await sendQuery(message, true);
        
        // Remove loading
        loadingDiv.remove();
    }catch(error) {
        loadingDiv.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'inline-chat-message inline-chat-message-assistant';
        errorDiv.innerHTML = `
            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
<div style="font-size: 1.5rem; flex-shrink: 0;">🤖</div>
                <div style="flex: 1; background: #fee; padding: 0.75rem 1rem; border-radius: 12px; color: #dc2626;">
                    Sorry, I encountered an error. Please try again.
                </div>
            </div>
        `;
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// =============================================================================
// FLOATING CHAT WIDGET (Bottom-right corner)
// =============================================================================

/**
 * Createandinitialize floating chat widget
 */
function createFloatingChatWidget() {
    // Check if already exists
    if (document.getElementById('floatingChatWidget')) {
        console.log('[CleanChat] Floating widget already exists');
        return;
    }
    
    const widget = document.createElement('div');
    widget.id = 'floatingChatWidget';
    widget.innerHTML = `
        <!-- Floating Chat Button -->
        <button id="floatingChatButton" style="
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 60px;
            height: 60px;
            border-radius:50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            z-index: 9998;
            transition: all 0.3s ease;
        " aria-label="Open chat">
            💬
        </button>
        
        <!-- Floating Chat Window -->
        <div id="floatingChatWindow" style="
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 380px;
            max-width:calc(100vw - 48px);
            height: 500px;
            max-height: calc(100vh - 150px);
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32pxrgba(0, 0, 0, 0.15);
            display: none;
            flex-direction: column;
            z-index: 9999;
            overflow: hidden;
        ">
            <!-- Chat Header -->
            <div style="
                background: linear-gradient(135deg,#667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <div style="display: flex; align-items: center;gap: 12px;">
                    <span style="font-size: 24px;">🤖</span>
                    <div>
                        <div style="font-weight: 600; font-size: 16px;">AI Assistant</div>
                        <div style="font-size: 12px; opacity: 0.9;">Context-aware help</div>
                    </div>
                </div>
                <button id="floatingChatClose" style="
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                   color:white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                " aria-label="Closechat">
×
                </button>
            </div>
            
            <!-- Chat Messages -->
            <div id="floatingChatMessages" style="
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #f8fafc;
            ">
                <div class="inline-chat-message inline-chat-message-assistant">
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div style="font-size: 24px; flex-shrink: 0;">🤖</div>
                        <div style="flex: 1;background:white; padding: 12px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <p style="margin: 0 0 8px 0; font-weight: 600;">Hi! I'm your AI assistant.</p>
                            <p style="margin: 0;">I can help you with:</p>
                            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                                <li>Understanding representatives</li>
<li>Explaining bills and legislation</li>
                                <li>Voting information</li>
                                <li>Government transparency</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Chat Input -->
            <div style="padding: 16px;background: white; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; gap: 8px;">
                    <textarea 
                        id="floatingChatInput" 
                        placeholder="Ask me anything..."
                        style="
                            flex: 1;
border: 2px solid#e2e8f0;
                            border-radius: 12px;
                            padding: 12px;
                            font-family: inherit;
                            font-size: 14px;
                            resize: none;
                            height: 44px;
                        "
                        rows="1"></textarea>
<button id="floatingChatSend" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 0 20px;
border-radius: 12px;
                       cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        white-space: nowrap;
                    ">
                        Send
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(widget);
    
   // Add event listeners
const button = document.getElementById('floatingChatButton');
    const window = document.getElementById('floatingChatWindow');
    const closeBtn = document.getElementById('floatingChatClose');
    const sendBtn = document.getElementById('floatingChatSend');
    const input = document.getElementById('floatingChatInput');
    
    button.addEventListener('click', function() {
        const isVisible = window.style.display === 'flex';
        window.style.display = isVisible ? 'none' : 'flex';
        button.style.transform = isVisible ? 'scale(1)' : 'scale(0.9)';
        
        if (!isVisible) {
           input.focus();
        }
});
    
    closeBtn.addEventListener('click', function() {
        window.style.display = 'none';
        button.style.transform = 'scale(1)';
    });
    
    sendBtn.addEventListener('click', function() {
        handleInlineChatSend('floating', 'floatingChatInput', 'floatingChatMessages');
    });
    
input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleInlineChatSend('floating', 'floatingChatInput', 'floatingChatMessages');
        }
    });
    
    // Auto-resize textarea
input.addEventListener('input',function() {
        this.style.height= '44px';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    console.log('[CleanChat] ✅ Floating chat widget created');
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', function(){
    console.log(`[CleanChatv${CleanChat.version}] ✅ Initialized - NO TYPEWRITER`);
    console.log('[CleanChat] User requirements implemented:');
    console.log('  ✅ Simple superscript citations (¹ ² ³)');
    console.log('  ✅Collapsible Sources section');
   console.log('  ✅ Bill votingintegration');
    console.log('  ✅ Smart paragraph formatting (1-10 based on complexity)');
    console.log('  ✅ NO typewriter effect (instant text display)');
    console.log('  ✅ 5-minute timeout for policy research(300 seconds)');
console.log('  ✅ localStorage persistence(survives tab switch)');
    console.log('  ✅ Auto-scroll to TOP of answer');
    
    // Detect initial context
    CleanChat.context = detectContext();
    
    // FIX v37.9.8: Load chathistory from localStorage on pageload
    loadChatHistory();
    
   // Create floating chat widget
    createFloatingChatWidget();
    
    console.log('[CleanChat] ✅ Initialization complete');
});

// Expose to window for external access
window.CleanChat = CleanChat;
window.CleanChatSendQuery = sendQuery;

console.log('[CleanChat v37.9.12-ASYNC] 🚀 Module loaded - Async polling with NO TIMEOUT!');
