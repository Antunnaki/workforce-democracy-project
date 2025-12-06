/**
 * WORKFORCE DEMOCRACY PROJECT - AI Service (Qwen Implementation)
 * 
 * Real AI integration with Qwen (Tongyi Lab)
 * Replaces previous Groq/Llama implementation
 * 
 * Core Values:
 * - Meet anger with patience and understanding
 * - Provide factual, well-sourced information
 * - Help people leave conversations better than they entered
 * - Believe in people's capacity to change
 * - Promote independent journalism and transparency
 */

const axios = require('axios');

// =============================================================================
// CONFIGURATION
// =============================================================================

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_API_URL = process.env.DASHSCOPE_API_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen3-max';

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Generate compassionate fallback response when AI is unavailable
 */
function generateCompassionateFallback(query, context) {
    const responses = [
        `I'm having trouble connecting to the AI service right now, but I'm committed to helping you find the information you need. Could you tell me more about what you're looking for? I'll do my best to assist you using our knowledge base.`,
        `I'm temporarily unable to access the AI service, but I'm here to help. Can you share more details about your question? I'll search our database to provide the best information possible.`,
        `The AI service is currently unavailable, but I'm dedicated to supporting your civic engagement journey. What specific information do you need? I'll explore alternative ways to assist you.`
    ];
    
    // Select response based on query content for slight personalization
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('representative') || lowerQuery.includes('senator')) {
        return responses[0];
    } else if (lowerQuery.includes('bill') || lowerQuery.includes('legislation')) {
        return responses[1];
    } else {
        return responses[2];
    }
}

/**
 * Call Qwen API with messages
 */
async function callQwen(messages, options = {}) {
    if (!QWEN_API_KEY) {
        throw new Error('QWEN_API_KEY not configured');
    }

    try {
        const response = await axios.post(QWEN_API_URL, {
            model: QWEN_MODEL,
            input: {
                messages: messages
            },
            parameters: {
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2048,
                top_p: options.topP || 0.8,
                enable_search: true // Enable web search for current information
            }
        }, {
            headers: {
                'Authorization': `Bearer ${QWEN_API_KEY}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'enable'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Qwen API Error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Analyze query with AI and provide sourced response
 */
async function analyzeWithAI(query, context = {}, chatType = 'general') {
    try {
        // Build context-aware prompt
        let systemPrompt = `You are an AI assistant for the Workforce Democracy Project, a civic information platform.
        
MISSION:
Help people understand how government works, what policies mean for communities, and how to participate in democracy. Present facts clearly so users can discover truth themselves.

APPROACH:
• Direct & Clear: Present facts without hedging or apologetic language
• People-Centered: Show how policies affect communities, workers, and vulnerable populations
• Evidence-Based: Use verifiable facts - voting records, court documents, campaign finance data
• Source-Aware: Prioritize independent journalism over corporate media for critical analysis
• Accessible: Plain language, no jargon

CONTEXT:
- Current time: ${new Date().toLocaleString('en-US', { timeZone: context.timezone || 'America/New_York' })}
- Chat type: ${chatType}
`;

        // Add conversation history if available
        if (context.conversationHistory && context.conversationHistory.length > 0) {
            systemPrompt += "\nRecent conversation history:\n";
            context.conversationHistory.slice(-3).forEach(msg => {
                systemPrompt += `${msg.role}: ${msg.content}\n`;
            });
        }

        // Add government data if available
        if (context.governmentData) {
            systemPrompt += `\nGovernment data available: ${JSON.stringify(context.governmentData, null, 2)}\n`;
        }

        // Add web search results if available
        if (context.webSearchResults && context.webSearchResults.length > 0) {
            systemPrompt += `\nWeb search results:\n`;
            context.webSearchResults.slice(0, 5).forEach((result, index) => {
                systemPrompt += `${index + 1}. ${result.title} - ${result.snippet}\n`;
            });
        }

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
        ];

        // Call Qwen API
        const result = await callQwen(messages, { 
            maxTokens: 2048,
            temperature: 0.7
        });

        if (!result || !result.output || !result.output.text) {
            throw new Error('Invalid response from Qwen API');
        }

        return {
            success: true,
            response: result.output.text,
            sources: [], // Sources would be added by the calling function
            metadata: {
                model: QWEN_MODEL,
                tokens: result.usage?.total_tokens
            }
        };
    } catch (error) {
        console.error('AI Analysis Error:', error);
        return {
            success: false,
            error: error.message,
            response: generateCompassionateFallback(query, chatType)
        };
    }
}

module.exports = {
    analyzeWithAI,
    generateCompassionateFallback,
    QWEN_MODEL
};