/**
 * WORKFORCE DEMOCRACY PROJECT - Australian Parliament API Integration
 * 
 * Fetches data from OpenAustralia.org API:
 * - Members of Parliament (MPs) and Senators
 * - Voting records (divisions)
 * - Hansard (parliamentary debates and speeches)
 * - Bills and legislation
 * 
 * API Documentation: https://www.openaustralia.org.au/api/docs/
 * Privacy: Non-profit, no user tracking, open source
 */

const axios = require('axios');

// =============================================================================
// CONFIGURATION
// =============================================================================

const OPENAUSTRALIA_API_KEY = process.env.OPENAUSTRALIA_API_KEY;
const OPENAUSTRALIA_BASE_URL = 'https://www.openaustralia.org.au/api';

// Australian-specific keywords for query detection
const AUSTRALIAN_KEYWORDS = [
    'australia', 'australian', 'mp', 'senator',
    'albanese', 'dutton', 'bandt', 'wong', 'chalmers',
    'nsw', 'victoria', 'queensland', 'western australia', 'south australia',
    'tasmania', 'act', 'northern territory',
    'labor', 'labour', 'liberal', 'greens', 'nationals',
    'house of representatives', 'senate', 'parliament house', 'canberra'
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if query is about Australian politics
 */
function isAustralianQuery(query) {
    const normalizedQuery = query.toLowerCase();
    return AUSTRALIAN_KEYWORDS.some(keyword => normalizedQuery.includes(keyword));
}

/**
 * Parse OpenAustralia.org XML response to JSON
 * (API returns XML by default, but we request JS format)
 */
function parseOpenAustraliaResponse(data) {
    // API with output=js returns JavaScript-compatible format
    // Just return the data directly
    return data;
}

// =============================================================================
// MEMBER (MP/SENATOR) FUNCTIONS
// =============================================================================

/**
 * Search for Australian MPs and Senators by name
 * 
 * @param {string} searchTerm - MP/Senator name or partial name
 * @returns {Promise<object>} - Member information
 */
async function searchAustralianMP(searchTerm) {
    try {
        // Check if API key is configured
        if (!OPENAUSTRALIA_API_KEY) {
            console.log('ℹ️ OpenAustralia API key not configured');
            return {
                success: false,
                error: 'OpenAustralia API key not configured',
                message: 'Australian parliamentary data requires OpenAustralia.org API access. Add OPENAUSTRALIA_API_KEY to .env file.',
                source: 'openaustralia'
            };
        }

        console.log(`🇦🇺 Searching OpenAustralia.org for: ${searchTerm}`);

        // Get all current MPs
        const response = await axios.get(`${OPENAUSTRALIA_BASE_URL}/getMPs`, {
            params: {
                key: OPENAUSTRALIA_API_KEY,
                output: 'js'
            },
            timeout: 10000
        });

        // Filter results by search term
        const members = response.data || [];
        const searchLower = searchTerm.toLowerCase();
        
        const matches = members.filter(member => {
            const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
            return fullName.includes(searchLower) || 
                   member.last_name.toLowerCase().includes(searchLower);
        });

        if (matches.length === 0) {
            console.log(`❌ No Australian MPs found for: ${searchTerm}`);
            return {
                success: false,
                error: 'No members found',
                source: 'openaustralia'
            };
        }

        // Return first match (most relevant)
        const member = matches[0];
        console.log(`✅ Found Australian MP: ${member.full_name}`);

        return {
            success: true,
            data: {
                person_id: member.person_id,
                member_id: member.member_id,
                name: member.full_name,
                first_name: member.first_name,
                last_name: member.last_name,
                party: member.party,
                electorate: member.constituency,
                house: member.house, // 'Representatives' or 'Senate'
                entered_house: member.entered_house,
                left_house: member.left_house || 'Current',
                image_url: member.image || null,
                source_url: `https://www.openaustralia.org.au/mp/?id=${member.person_id}`
            },
            source: 'openaustralia'
        };

    } catch (error) {
        console.error('❌ OpenAustralia API error:', error.message);
        return {
            success: false,
            error: error.message,
            source: 'openaustralia'
        };
    }
}

/**
 * Get detailed information about a specific MP/Senator
 * 
 * @param {string} personId - OpenAustralia person ID
 * @returns {Promise<object>} - Detailed member information
 */
async function getMPDetails(personId) {
    try {
        if (!OPENAUSTRALIA_API_KEY) {
            return {
                success: false,
                error: 'API key not configured'
            };
        }

        console.log(`🇦🇺 Fetching details for person ID: ${personId}`);

        const response = await axios.get(`${OPENAUSTRALIA_BASE_URL}/getMP`, {
            params: {
                key: OPENAUSTRALIA_API_KEY,
                id: personId,
                output: 'js'
            },
            timeout: 10000
        });

        const member = response.data;

        return {
            success: true,
            data: member,
            source: 'openaustralia'
        };

    } catch (error) {
        console.error('❌ OpenAustralia MP details error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// =============================================================================
// VOTING RECORDS (DIVISIONS)
// =============================================================================

/**
 * Get voting record for an MP/Senator
 * 
 * @param {string} personId - OpenAustralia person ID
 * @param {number} limit - Number of recent votes to retrieve (default: 20)
 * @returns {Promise<object>} - Voting record
 */
async function getVotingRecord(personId, limit = 20) {
    try {
        if (!OPENAUSTRALIA_API_KEY) {
            return {
                success: false,
                error: 'API key not configured'
            };
        }

        console.log(`🗳️ Fetching voting record for person ID: ${personId}`);

        // Get recent debates/votes for this person
        const response = await axios.get(`${OPENAUSTRALIA_BASE_URL}/getDebates`, {
            params: {
                key: OPENAUSTRALIA_API_KEY,
                person: personId,
                num: limit,
                output: 'js'
            },
            timeout: 10000
        });

        const debates = response.data || [];

        return {
            success: true,
            data: {
                total_votes: debates.length,
                votes: debates.map(debate => ({
                    date: debate.hdate,
                    body: debate.body,
                    title: debate.parent ? debate.parent.body : 'Parliamentary Debate',
                    speech_text: debate.body,
                    url: debate.listurl
                }))
            },
            source: 'openaustralia'
        };

    } catch (error) {
        console.error('❌ OpenAustralia voting record error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// =============================================================================
// HANSARD SEARCH
// =============================================================================

/**
 * Search Hansard (parliamentary debates) for keywords
 * 
 * @param {string} query - Search term (e.g., "climate change", "housing")
 * @param {string} personId - Optional: Filter by specific MP/Senator
 * @param {number} limit - Number of results (default: 10)
 * @returns {Promise<object>} - Search results
 */
async function searchHansard(query, personId = null, limit = 10) {
    try {
        if (!OPENAUSTRALIA_API_KEY) {
            return {
                success: false,
                error: 'API key not configured'
            };
        }

        console.log(`📜 Searching Hansard for: ${query}`);

        const params = {
            key: OPENAUSTRALIA_API_KEY,
            search: query,
            num: limit,
            output: 'js'
        };

        if (personId) {
            params.person = personId;
        }

        const response = await axios.get(`${OPENAUSTRALIA_BASE_URL}/getHansard`, {
            params: params,
            timeout: 10000
        });

        const results = response.data.rows || [];

        return {
            success: true,
            data: {
                total_results: results.length,
                speeches: results.map(result => ({
                    date: result.hdate,
                    speaker: result.speaker ? result.speaker.name : 'Unknown',
                    body: result.body,
                    excerpt: result.excerpt,
                    url: result.listurl
                }))
            },
            source: 'openaustralia'
        };

    } catch (error) {
        console.error('❌ OpenAustralia Hansard search error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// =============================================================================
// POLICY ANALYSIS (HELPER)
// =============================================================================

/**
 * Analyze MP's policy positions based on voting record
 * This is a helper that combines data from multiple API calls
 * 
 * @param {string} personId - OpenAustralia person ID
 * @param {string} policyArea - Policy topic (e.g., "climate", "housing", "immigration")
 * @returns {Promise<object>} - Policy analysis
 */
async function analyzeMPPolicy(personId, policyArea) {
    try {
        console.log(`🔍 Analyzing ${policyArea} policy for person ID: ${personId}`);

        // Get MP details
        const mpResult = await getMPDetails(personId);
        if (!mpResult.success) {
            return mpResult;
        }

        // Search Hansard for speeches on this policy
        const hansardResult = await searchHansard(policyArea, personId, 10);
        
        // Get recent voting record
        const votingResult = await getVotingRecord(personId, 20);

        return {
            success: true,
            data: {
                member: mpResult.data,
                speeches: hansardResult.success ? hansardResult.data.speeches : [],
                votes: votingResult.success ? votingResult.data.votes : [],
                policy_area: policyArea
            },
            source: 'openaustralia'
        };

    } catch (error) {
        console.error('❌ Policy analysis error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // Query detection
    isAustralianQuery,
    
    // Member functions
    searchAustralianMP,
    getMPDetails,
    
    // Voting records
    getVotingRecord,
    
    // Hansard search
    searchHansard,
    
    // Policy analysis
    analyzeMPPolicy,
    
    // Constants
    AUSTRALIAN_KEYWORDS
};
