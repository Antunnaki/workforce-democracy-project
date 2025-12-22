/**
 * WORKFORCE DEMOCRACY PROJECT - Government API Integration
 * 
 * Fetches data from official government sources:
 * - Congress.gov API (bills and legislation)
 * - ProPublica Congress API (representatives, voting records) [DISCONTINUED]
 * - Court Listener API (Supreme Court decisions)
 * - OpenAustralia.org API (Australian parliament data)
 * 
 * All APIs are FREE and provide official, authoritative data
 */

require('./utils/polyfills');
const axios = require('axios');
const cheerio = require('cheerio');

// Import Australian Parliament API
const australianAPI = require('./australian-parliament-api');

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const PROPUBLICA_API_KEY = process.env.PROPUBLICA_API_KEY;
const COURT_LISTENER_API_KEY = process.env.COURT_LISTENER_API_KEY;

// API Endpoints
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
const PROPUBLICA_API_BASE = 'https://api.propublica.org/congress/v1';
const COURT_LISTENER_API_BASE = 'https://www.courtlistener.com/api/rest/v3';

// =============================================================================
// CONGRESS.GOV API - BILLS & LEGISLATION
// =============================================================================

/**
 * Fetch bill data from Congress.gov
 * 
 * @param {string} billId - Bill identifier (e.g., "HR1234", "S5678")
 * @param {number} congress - Congress number (e.g., 118 for current)
 * @returns {Promise<object>} - Bill data with full text, sponsors, status
 */
async function fetchBillData(billId, congress = 118) {
    try {
        // Parse bill ID (e.g., "HR 1234" or "S 5678")
        const billMatch = billId.match(/([HS]R?|S)\s*(\d+)/i);
        if (!billMatch) {
            throw new Error('Invalid bill ID format');
        }
        
        const billType = billMatch[1].toLowerCase();
        const billNumber = billMatch[2];
        
        // Fetch bill details
        const response = await axios.get(
            `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}`,
            {
                params: { format: 'json', api_key: CONGRESS_API_KEY }
            }
        );
        
        const bill = response.data.bill;
        
        // Fetch bill actions (status updates)
        const actionsResponse = await axios.get(
            `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}/actions`,
            {
                params: { format: 'json', api_key: CONGRESS_API_KEY }
            }
        );
        
        // Format response
        return {
            success: true,
            data: {
                bill_id: billId,
                title: bill.title,
                summary: bill.summary?.text || 'Summary not yet available',
                sponsors: bill.sponsors || [],
                status: bill.latestAction?.text || 'Status unknown',
                introduced_date: bill.introducedDate,
                last_action_date: bill.latestAction?.actionDate,
                full_text_url: `https://www.congress.gov/bill/${congress}/${billType}-${billNumber}/text`,
                source_url: `https://www.congress.gov/bill/${congress}/${billType}-${billNumber}`,
                actions: actionsResponse.data.actions || []
            },
            source: 'congress.gov'
        };
        
    } catch (error) {
        console.error('❌ Congress.gov API Error:', error.message);
        return {
            success: false,
            error: error.message,
            source: 'congress.gov'
        };
    }
}

/**
 * Search bills by topic or keyword
 */
async function searchBills(query, limit = 10) {
    try {
        const response = await axios.get(
            `${CONGRESS_API_BASE}/bill`,
            {
                params: {
                    format: 'json',
                    api_key: CONGRESS_API_KEY,
                    query: query,
                    limit: limit
                }
            }
        );
        
        return {
            success: true,
            data: response.data.bills || [],
            count: response.data.bills?.length || 0,
            source: 'congress.gov'
        };
        
    } catch (error) {
        console.error('❌ Congress.gov Search Error:', error.message);
        return {
            success: false,
            error: error.message,
            source: 'congress.gov'
        };
    }
}

// =============================================================================
// PROPUBLICA API - REPRESENTATIVES & VOTING RECORDS
// =============================================================================

/**
 * Get representative information by name or district
 */
async function getRepresentativeInfo(query) {
    try {
        // Check if ProPublica API key is configured
        if (!PROPUBLICA_API_KEY || PROPUBLICA_API_KEY === 'OPTIONAL_FOR_NOW') {
            console.log('ℹ️ ProPublica API key not configured - skipping representative lookup');
            return {
                success: false,
                error: 'ProPublica API key not configured',
                message: 'Representative voting records require ProPublica API access. Add PROPUBLICA_API_KEY to .env file.',
                source: 'propublica'
            };
        }
        
        // Search members by name
        const response = await axios.get(
            `${PROPUBLICA_API_BASE}/members/search.json`,
            {
                params: { query: query },
                headers: { 'X-API-Key': PROPUBLICA_API_KEY }
            }
        );
        
        const members = response.data.results || [];
        
        if (members.length === 0) {
            return {
                success: false,
                error: 'No representatives found',
                source: 'propublica'
            };
        }
        
        // Get detailed info for first result
        const member = members[0];
        const detailResponse = await axios.get(
            `${PROPUBLICA_API_BASE}/members/${member.id}.json`,
            {
                headers: { 'X-API-Key': PROPUBLICA_API_KEY }
            }
        );
        
        const details = detailResponse.data.results[0];
        
        return {
            success: true,
            data: {
                name: details.first_name + ' ' + details.last_name,
                party: details.current_party,
                state: details.state,
                district: details.district,
                office: details.office,
                phone: details.phone,
                website: details.url,
                votes_with_party: details.votes_with_party_pct,
                missed_votes_pct: details.missed_votes_pct,
                source_url: `https://www.propublica.org/datastore/dataset/congressional-data-api`
            },
            source: 'propublica'
        };
        
    } catch (error) {
        console.error('❌ ProPublica API Error:', error.message);
        return {
            success: false,
            error: error.message,
            source: 'propublica'
        };
    }
}

/**
 * Get recent votes by representative
 */
async function getRepresentativeVotes(memberId, limit = 20) {
    try {
        // Check if ProPublica API key is configured
        if (!PROPUBLICA_API_KEY || PROPUBLICA_API_KEY === 'OPTIONAL_FOR_NOW') {
            console.log('ℹ️ ProPublica API key not configured - skipping votes lookup');
            return {
                success: false,
                error: 'ProPublica API key not configured',
                message: 'Voting records require ProPublica API access. Add PROPUBLICA_API_KEY to .env file.',
                source: 'propublica'
            };
        }
        
        const response = await axios.get(
            `${PROPUBLICA_API_BASE}/members/${memberId}/votes.json`,
            {
                headers: { 'X-API-Key': PROPUBLICA_API_KEY }
            }
        );
        
        return {
            success: true,
            data: response.data.results[0].votes.slice(0, limit),
            source: 'propublica'
        };
        
    } catch (error) {
        console.error('❌ ProPublica Votes Error:', error.message);
        return {
            success: false,
            error: error.message,
            source: 'propublica'
        };
    }
}

// =============================================================================
// COURT LISTENER API - SUPREME COURT DECISIONS
// =============================================================================

/**
 * Search Supreme Court decisions by case name or topic
 */
async function searchCourtDecisions(query, limit = 10) {
    try {
        const response = await axios.get(
            `${COURT_LISTENER_API_BASE}/search/`,
            {
                params: {
                    q: query,
                    type: 'o',  // Opinions
                    court: 'scotus',  // Supreme Court only
                    order_by: 'dateFiled desc',
                    page_size: limit
                },
                headers: { 'Authorization': `Token ${COURT_LISTENER_API_KEY}` }
            }
        );
        
        const results = response.data.results || [];
        
        return {
            success: true,
            data: results.map(decision => ({
                case_name: decision.caseName,
                date_filed: decision.dateFiled,
                court: 'Supreme Court of the United States',
                summary: decision.snippet,
                full_text_url: `https://www.courtlistener.com${decision.absolute_url}`,
                source_url: `https://www.courtlistener.com${decision.absolute_url}`,
                citations: decision.citation || []
            })),
            count: results.length,
            source: 'courtlistener'
        };
        
    } catch (error) {
        console.error('❌ Court Listener API Error:', error.message);
        return {
            success: false,
            error: error.message,
            source: 'courtlistener'
        };
    }
}

/**
 * Get specific court decision by citation
 */
async function getCourtDecisionByCitation(citation) {
    try {
        const response = await axios.get(
            `${COURT_LISTENER_API_BASE}/search/`,
            {
                params: {
                    q: `citation:"${citation}"`,
                    type: 'o',
                    court: 'scotus'
                },
                headers: { 'Authorization': `Token ${COURT_LISTENER_API_KEY}` }
            }
        );
        
        if (response.data.results.length === 0) {
            return {
                success: false,
                error: 'Case not found',
                source: 'courtlistener'
            };
        }
        
        const decision = response.data.results[0];
        
        return {
            success: true,
            data: {
                case_name: decision.caseName,
                date_filed: decision.dateFiled,
                court: 'Supreme Court of the United States',
                summary: decision.snippet,
                full_text_url: `https://www.courtlistener.com${decision.absolute_url}`,
                source_url: `https://www.courtlistener.com${decision.absolute_url}`,
                citations: decision.citation || []
            },
            source: 'courtlistener'
        };
        
    } catch (error) {
        console.error('❌ Court Listener API Error:', error.message);
        return {
            success: false,
            error: error.message,
            source: 'courtlistener'
        };
    }
}

// =============================================================================
// BALLOTPEDIA SCRAPING - LOCAL & JUDICIAL CANDIDATES
// =============================================================================

/**
 * Scrape Ballotpedia for local/judicial candidate information
 * Works for US local elections (city council, judges, district attorney, etc.)
 * 
 * @param {string} candidateName - Candidate's full name
 * @param {string} location - City, state (e.g., "New York City, NY")
 * @returns {Promise<object>} - Candidate profile data
 */
async function scrapeBallotpedia(candidateName, location = '') {
    try {
        console.log(`🗳️ Scraping Ballotpedia for ${candidateName} (${location})`);
        
        // Build Ballotpedia search URL
        const searchQuery = `${candidateName} ${location}`.trim();
        const encodedQuery = encodeURIComponent(searchQuery);
        const url = `https://ballotpedia.org/wiki/index.php?search=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Extract candidate profile info
        const profile = {
            name: candidateName,
            location: location,
            bio: '',
            position: '',
            party: '',
            election_date: '',
            endorsements: [],
            source_url: response.request?.res?.responseUrl || url
        };
        
        // Try to extract bio from infobox
        const infobox = $('.infobox');
        if (infobox.length > 0) {
            profile.position = infobox.find('th:contains("Office")').next('td').text().trim();
            profile.party = infobox.find('th:contains("Party")').next('td').text().trim();
            profile.election_date = infobox.find('th:contains("Election")').next('td').text().trim();
        }
        
        // Extract first paragraph as bio
        const firstPara = $('#mw-content-text p').first().text().trim();
        if (firstPara && firstPara.length > 20) {
            profile.bio = firstPara.substring(0, 500);
        }
        
        // Extract endorsements if available
        $('#mw-content-text').find('li').each((i, element) => {
            const text = $(element).text();
            if (text.toLowerCase().includes('endorse') && profile.endorsements.length < 5) {
                profile.endorsements.push(text.trim());
            }
        });
        
        console.log(`✅ Ballotpedia scrape successful for ${candidateName}`);
        
        return {
            success: true,
            data: profile,
            source: 'ballotpedia'
        };
        
    } catch (error) {
        console.error(`❌ Ballotpedia scrape error for ${candidateName}:`, error.message);
        return {
            success: false,
            error: error.message,
            source: 'ballotpedia'
        };
    }
}

// =============================================================================
// DUCKDUCKGO WEB SEARCH - COMPREHENSIVE VERIFIED INFORMATION
// =============================================================================

/**
 * Search web for candidate information using DuckDuckGo (privacy-focused, no API key)
 * Automatically detects location (US, UK, Canada, Australia, etc.) and searches accordingly
 * 
 * @param {string} candidateName - Politician's name
 * @param {string} location - Location context (optional, will auto-detect from query)
 * @returns {Promise<Array>} - Array of search results with trusted source indicators
 */
async function searchWebForCandidate(candidateName, location = '') {
    try {
        console.log(`🌐 Web searching for ${candidateName} ${location ? `in ${location}` : '(global)'}`);
        
        // Detect location/country from query for international support
        const normalizedQuery = `${candidateName} ${location}`.toLowerCase();
        
        // Location detection patterns
        const locationPatterns = {
            uk: ['uk', 'britain', 'england', 'scotland', 'wales', 'london', 'manchester', 'birmingham', 'parliament', 'westminster', 'downing street', 'mp', 'mep'],
            canada: ['canada', 'canadian', 'toronto', 'montreal', 'vancouver', 'ottawa', 'quebec', 'ontario'],
            australia: ['australia', 'australian', 'sydney', 'melbourne', 'canberra', 'queensland'],
            nz: ['new zealand', 'nz', 'wellington', 'auckland'],
            eu: ['european union', 'brussels', 'strasbourg', 'mep', 'european parliament'],
            us: ['us', 'usa', 'united states', 'nyc', 'new york', 'california', 'texas', 'florida', 'congress', 'senate', 'house']
        };
        
        let detectedLocation = 'us'; // Default to US
        for (const [region, keywords] of Object.entries(locationPatterns)) {
            if (keywords.some(keyword => normalizedQuery.includes(keyword))) {
                detectedLocation = region;
                console.log(`📍 Detected location: ${region.toUpperCase()}`);
                break;
            }
        }
        
        // Build search query - enhanced for judicial candidates
        // Check if this is a judicial/court candidate
        const isJudicialCandidate = normalizedQuery.includes('judge') || 
                                    normalizedQuery.includes('court') || 
                                    normalizedQuery.includes('civil court') ||
                                    normalizedQuery.includes('judicial');
        
        let searchQuery;
        if (isJudicialCandidate) {
            // For judges: focus on judicial record, endorsements, campaign statements
            searchQuery = encodeURIComponent(`${candidateName} ${location} judge endorsements judicial record campaign policy`);
            console.log(`⚖️ Judicial candidate detected - searching for judicial record and endorsements`);
        } else {
            // For legislators: focus on voting record, policy positions
            searchQuery = encodeURIComponent(`${candidateName} ${location} policy positions voting record scandal corruption`);
        }
        const url = `https://html.duckduckgo.com/html/?q=${searchQuery}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const results = [];
        
        // Extract search results
        $('.result').slice(0, 8).each((i, element) => {
            const $result = $(element);
            const title = $result.find('.result__a').text().trim();
            let resultUrl = $result.find('.result__a').attr('href');

            // DuckDuckGo uses redirect URLs - extract the actual URL
            if (resultUrl && resultUrl.includes('uddg=')) {
                try {
                    const urlMatch = resultUrl.match(/uddg=([^&]+)/);
                    if (urlMatch) {
                        resultUrl = decodeURIComponent(urlMatch[1]);
                    }
                } catch (e) {
                    // Keep original URL if extraction fails
                }
            }
            const snippet = $result.find('.result__snippet').text().trim();
            
            if (title && resultUrl && snippet) {
                // Define trusted sources by region
                const trustedSourcesByRegion = {
                    us: ['nytimes.com', 'propublica.org', 'ballotpedia.org', 'nyc.gov', 'gothamist.com', 'thecity.nyc', 'politico.com', 'npr.org', 'apnews.com', 'washingtonpost.com', 'thenation.com', 'jacobin.com', 'silive.com', 'amny.com', 'ny1.com', 'cityandstateny.com'],
                    uk: ['bbc.co.uk', 'theguardian.com', 'parliament.uk', 'independent.co.uk', 'channel4.com', 'opendemocracy.net'],
                    canada: ['cbc.ca', 'theglobeandmail.com', 'thestar.com', 'macleans.ca', 'nationalobserver.com'],
                    australia: ['abc.net.au', 'theconversation.com', 'theguardian.com/australia', 'smh.com.au'],
                    nz: ['stuff.co.nz', 'nzherald.co.nz', 'rnz.co.nz'],
                    eu: ['europarl.europa.eu', 'politico.eu', 'euobserver.com']
                };
                
                const relevantSources = trustedSourcesByRegion[detectedLocation] || trustedSourcesByRegion.us;
                const isTrusted = relevantSources.some(domain => resultUrl.includes(domain));
                
                results.push({
                    title: title,
                    url: resultUrl,
                    snippet: snippet,
                    trusted: isTrusted,
                    region: detectedLocation
                });
                
                console.log(`  📰 Found: ${title.substring(0, 60)}... (${isTrusted ? 'TRUSTED' : 'general'} | ${detectedLocation.toUpperCase()})`);
            }
        });
        
        console.log(`✅ Found ${results.length} web results for ${candidateName}`);
        return results;
        
    } catch (error) {
        console.error(`❌ Web search error for ${candidateName}:`, error.message);
        return [];
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // Bills
    fetchBillData,
    searchBills,
    
    // Representatives (US)
    getRepresentativeInfo,
    getRepresentativeVotes,
    
    // Court Decisions
    searchCourtDecisions,
    getCourtDecisionByCitation,
    
    // Local & Global Candidates
    scrapeBallotpedia,
    searchWebForCandidate,
    
    // Australian Parliament (OpenAustralia.org)
    isAustralianQuery: australianAPI.isAustralianQuery,
    searchAustralianMP: australianAPI.searchAustralianMP,
    getMPDetails: australianAPI.getMPDetails,
    getAustralianVotingRecord: australianAPI.getVotingRecord,
    searchAustralianHansard: australianAPI.searchHansard,
    analyzeAustralianMPPolicy: australianAPI.analyzeMPPolicy
};
