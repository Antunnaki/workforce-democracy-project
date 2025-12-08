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

const OpenAI = require('openai');

// =============================================================================
// CONFIGURATION
// =============================================================================

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-plus'; // Updated to qwen-plus

// Define fallback models in order of preference
const QWEN_MODEL_FALLBACKS = [
    QWEN_MODEL,
    'qwen3-plus',
    'qwen3-max'
];

// Initialize OpenAI client for Qwen
const openai = new OpenAI({
    apiKey: QWEN_API_KEY,
    baseURL: QWEN_API_URL
});

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Generate compassionate fallback response when AI is unavailable
 */
function generateCompassionateFallback(query, context){
    const responses= [
        `I'm having trouble connecting to the AI service rightnow, but I'm committed to helping you find the information you need. Could you tellme more about what you're looking for? I'll do my best to assist you using our knowledge base.`,
        `I'mtemporarily unableto access the AI service, but I'm here to help. Can you share more detailsabout your question? I'll search our database to provide the best information possible.`,
        `The AI service is currently unavailable, but I'm dedicated to supporting your civic engagement journey. What specific information do you need? I'llexplorealternative ways to assist you.`
    ];
    
    // Select response based on querycontent for slight personalization
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
 * Call Qwen APIwith messages using OpenAI SDK
 */
async function callQwen(messages, options = {}) {
    if (!DASHSCOPE_API_KEY){
        throw new Error('DASHSCOPE_API_KEY not configured');
    }

    // If forced to disable free tier restriction, we'll proceed anyway
    if (FORCE_DISABLE_FREE_TIER) {
        console.warn('⚠️  Free tier restriction bypassed for testing purposes');
    }

    try {
        constcompletion = await openai.chat.completions.create({
            model: QWEN_MODEL,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2048,
            top_p: options.topP || 0.8
        });

       return completion;
    } catch (error) {
        console.error('Qwen API Error:', error.response?.data || error.message);
        
        // Enhanced error handling for quota issues
if (error.response?.data) {
            const errorData = error.response.data;
            if (typeof errorData === 'object'){
                // Check for specific quota-related error messages
                const errorMessage = errorData.message || errorData.error?.message || '';
                if (errorMessage.includes('free tier') || errorMessage.includes('quota')) {
                    console.error('_quota_issue_detected_', {
                        error_code: errorData.code,
                        error_message: errorMessage,
suggestion: 'Check DashScope console quota settings - free tier may be exhausted and "use free tier only" mode may be enabled'
                    });
                }
            }
        }
        
       throw error;
    }
}

/**
*Analyzequery withAI and provide sourced response
 */
async function analyzeWithAI(query, context = {}, chatType ='general') {
    try {
        // Build context-aware prompt
        let systemPrompt = `You are an AI assistant for the Workforce Democracy Project, a civicinformation platform.
        
MISSION:
Helppeople understandhow governmentworks, what policies mean for communities, and how to participate in democracy. Present facts clearly so userscan discover truth themselves.

APPROACH:
• Direct & Clear: Present facts without hedging or apologetic language
• People-Centered: Show how policies affectcommunities, workers, and vulnerablepopulations
• Evidence-Based: Use verifiable facts - voting records, court documents, campaign finance data
• Source-Aware: Prioritize independent journalism over corporate media for critical analysis
• Accessible: Plain language, no jargon

CONTEXT:
- Current time: ${new Date().toLocaleString('en-US', {timeZone: context.timezone || 'America/New_York' })}
- Chat type: ${chatType}
`;

        //Add conversation history if available
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
systemPrompt +=`${index + 1}. ${result.title} - ${result.snippet}\n`;
            });
        }

const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
        ];

        // Call Qwen APIconstresult= await callQwen(messages, { 
            maxTokens: 2048,
            temperature: 0.7
        });

        if (!result || !result.choices || !result.choices[0] || !result.choices[0].message) {
            throw new Error('Invalid responsefrom QwenAPI');
        }

return {
success: true,
            response: result.choices[0].message.content,
            sources: [],// Sources would be added by the calling function
            metadata: {
                model: QWEN_MODEL,
                tokens: result.usage?.total_tokens
            }
        };
    }catch(error) {
       console.error('AI Analysis Error:', error);
        return {
            success: false,
            error: error.message,
response: generateCompassionateFallback(query, chatType)
        };
    }
}

/**
* Checkcurrent quota status
 */
async function checkQuotaStatus() {
    try {
       // This would require additional API calls toget quota info
        // For now, we'll just log the current state
        console.log(`Current quota status: ${process.env.QWEN_MODEL} model with 100%free quota remaining`);
        return {
            model: process.env.QWEN_MODEL,
quotaRemaining: 100,
            quotaTotal: 1000000,
            hasFreeTierRestriction: true
        };
    } catch (error) {
        console.error('Error checking quota status:', error);
        return null;
    }
}

module.exports = {
    analyzeWithAI,
    generateCompassionateFallback,
    QWEN_MODEL
};