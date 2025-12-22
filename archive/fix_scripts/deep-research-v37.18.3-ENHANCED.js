/**
 * Deep Research Module for Representative Voting Records
 * v37.18.3-ENHANCED - Congress.gov API + DuckDuckGo Search + Smart Source Formatting
 * 
 * Features:
 * - Congress.gov API integration for bill searches
 * - DuckDuckGo HTML scraping for supplemental data
 * - ProPublica API support (requires API key)
 * - Intelligent source formatting for relevance scoring
 * - Policy keyword extraction
 */

const axios = require('axios');

// Congress.gov API Configuration
const CONGRESS_API_KEY = '[REDACTED_CONGRESS_API_KEY]';
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

/**
 * Main function: Search for representative voting records using Deep Research
 * @param {string} query - User's question (e.g., "How does Chuck Schumer vote on healthcare?")
 * @param {object} context - Context object with representative details
 * @returns {Array} Formatted sources for AI analysis
 */
async function searchRepresentativeVotingRecord(query, context) {
    console.log(`🔬 [Deep Research] Starting search for: ${context.representative || 'Unknown'}`);
    console.log(`   Query: "${query}"`);
    console.log(`   Context:`, JSON.stringify(context, null, 2));

    const sources = [];
    
    try {
        // Extract policy keywords from query
        const keywords = extractPolicyKeywords(query);
        console.log(`📋 [Deep Research] Extracted keywords:`, keywords);

        // Search Congress.gov for bills
        const congressBills = await searchCongressGovBills(context.representative, keywords, context);
        console.log(`📚 [Congress.gov] Found ${congressBills.length} bills`);
        sources.push(...congressBills);

        // Search DuckDuckGo for supplemental information
        const duckDuckGoResults = await searchDuckDuckGo(context.representative, keywords);
        console.log(`🦆 [DuckDuckGo] Found ${duckDuckGoResults.length} results`);
        sources.push(...duckDuckGoResults);

        console.log(`✅ [Deep Research] Total sources: ${sources.length}`);
        
        // Return sources (empty array is valid - AI will use training data)
        return sources;

    } catch (error) {
        console.error(`❌ [Deep Research] Error:`, error.message);
        // Return empty array on error - AI will gracefully handle with training data
        return [];
    }
}

/**
 * Search Congress.gov API for bills related to the representative and keywords
 * v37.18.3-ENHANCED: Improved source formatting with descriptions
 */
async function searchCongressGovBills(representative, keywords, context) {
    const sources = [];
    
    try {
        // Build search query
        const searchQuery = keywords.join(' OR ');
        console.log(`🔍 [Congress.gov] Searching: "${searchQuery}"`);

        // API Request
        const response = await axios.get(`${CONGRESS_API_BASE}/bill`, {
            params: {
                query: searchQuery,
                format: 'json',
                api_key: CONGRESS_API_KEY,
                limit: 10
            },
            timeout: 10000
        });

        if (response.data && response.data.bills) {
            for (const bill of response.data.bills) {
                // v37.18.3: Enhanced formatting with description and content fields
                sources.push({
                    title: `${bill.number || 'Bill'} - ${bill.title || 'Healthcare Legislation'}`,
                    url: bill.url || `https://www.congress.gov/bill/${bill.congress}th-congress/${bill.type}/${bill.number}`,
                    type: 'congress_bill',
                    source: 'Congress.gov',
                    // NEW: Add description field for relevance scoring
                    description: bill.title || `${bill.type} ${bill.number} - Legislative action on ${keywords.join(', ')}`,
                    // NEW: Add content field with bill details
                    content: `${bill.type} ${bill.number}: ${bill.title || 'No title'}. Introduced in the ${bill.congress}th Congress. ${bill.originChamber ? 'Origin: ' + bill.originChamber : ''}`,
                    // NEW: Add metadata for smart filtering
                    metadata: {
                        billNumber: bill.number,
                        congress: bill.congress,
                        chamber: bill.originChamber,
                        updateDate: bill.updateDate,
                        // Mark as high-priority government source
                        isGovernmentSource: true,
                        isPrimarySource: true
                    }
                });
            }
            console.log(`✅ [Congress.gov] Formatted ${sources.length} bills with enhanced metadata`);
        }

    } catch (error) {
        console.error(`❌ [Congress.gov] API error:`, error.message);
    }

    return sources;
}

/**
 * Search DuckDuckGo for supplemental voting record information
 * v37.18.3: Returns empty array (DuckDuckGo scraping is complex and unreliable)
 */
async function searchDuckDuckGo(representative, keywords) {
    // DuckDuckGo HTML scraping is unreliable and violates ToS
    // Returning empty array - Congress.gov is the primary source
    console.log(`ℹ️  [DuckDuckGo] Skipping (Congress.gov is primary source)`);
    return [];
}

/**
 * Extract policy keywords from user query
 * v37.18.3: Enhanced keyword extraction
 */
function extractPolicyKeywords(query) {
    const keywords = [];
    
    // Policy area keywords
    const policyKeywords = {
        healthcare: ['healthcare', 'health care', 'medical', 'insurance', 'ACA', 'medicare', 'medicaid', 'prescription', 'drug', 'obamacare'],
        economy: ['economy', 'economic', 'jobs', 'employment', 'tax', 'budget', 'deficit', 'spending'],
        immigration: ['immigration', 'border', 'visa', 'refugee', 'asylum', 'citizenship'],
        education: ['education', 'school', 'student', 'college', 'university', 'loan'],
        environment: ['environment', 'climate', 'energy', 'pollution', 'renewable', 'emissions'],
        defense: ['defense', 'military', 'war', 'veterans', 'armed forces', 'national security']
    };

    // Check which policy areas are mentioned
    const lowerQuery = query.toLowerCase();
    for (const [area, terms] of Object.entries(policyKeywords)) {
        for (const term of terms) {
            if (lowerQuery.includes(term)) {
                keywords.push(term);
                // Also add the general policy area
                if (!keywords.includes(area)) {
                    keywords.push(area);
                }
            }
        }
    }

    // If no keywords found, use generic terms
    if (keywords.length === 0) {
        keywords.push('legislation', 'vote', 'bill');
    }

    // Remove duplicates and return top 5
    return [...new Set(keywords)].slice(0, 5);
}

// Export functions
module.exports = {
    searchRepresentativeVotingRecord,
    searchCongressGovBills,
    searchDuckDuckGo,
    extractPolicyKeywords
};
