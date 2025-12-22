/**
 * OPENSTATES API INTEGRATION
 * v37.0.0 - State legislator data
 * 
 * Source: https://openstates.org/api/v3/
 * Cost: FREE for non-commercial use
 * API Key: Required (sign up at openstates.org)
 * 
 * Data provided:
 * - State legislators (all 50 states)
 * - State bills and legislation
 * - Committee assignments
 * - Voting records (state level)
 */

const axios = require('axios');

class OpenStatesApi {
    constructor(apiKey = null) {
        this.baseUrl = 'https://v3.openstates.org';
        this.apiKey = apiKey || process.env.OPENSTATES_API_KEY;
        
        if (!this.apiKey) {
            console.warn('⚠️ OpenStates API key not configured. State legislator data will be limited.');
        }
        
        // Cache for expensive queries
        this.cache = new Map();
        this.cacheDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    /**
     * Get state legislators by location
     * @param {string} state - State abbreviation (e.g., 'NY')
     * @param {string} district - Optional district number
     * @returns {Promise<Array>} - Array of legislators
     */
    async getLegislatorsByState(state, district = null) {
        const cacheKey = `legislators_${state}_${district || 'all'}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                console.log(`📦 OpenStates cache hit: ${state}`);
                return cached.data;
            }
        }
        
        if (!this.apiKey) {
            return this.getFallbackStateLegislators(state);
        }
        
        try {
            console.log(`🏛️ Fetching state legislators: ${state}`);
            
            const params = {
                jurisdiction: state.toLowerCase(),
                per_page: 100
            };
            
            if (district) {
                params.district = district;
            }
            
            const response = await axios.get(`${this.baseUrl}/people`, {
                headers: {
                    'X-API-Key': this.apiKey
                },
                params: params,
                timeout: 10000
            });
            
            const legislators = response.data.results.map(leg => ({
                id: leg.id,
                name: leg.name,
                party: leg.party,
                chamber: leg.current_role?.title || 'Unknown',
                district: leg.current_role?.district,
                email: leg.email,
                photo_url: leg.image,
                websites: leg.links || [],
                committees: leg.current_role?.committee_memberships || [],
                state: state.toUpperCase()
            }));
            
            // Cache result
            this.cache.set(cacheKey, {
                data: legislators,
                timestamp: Date.now()
            });
            
            console.log(`  ✅ Found ${legislators.length} legislators`);
            
            return legislators;
            
        } catch (error) {
            console.error(`❌ OpenStates API error for ${state}:`, error.message);
            return this.getFallbackStateLegislators(state);
        }
    }

    /**
     * Get specific legislator by ID
     * @param {string} legislatorId - OpenStates person ID
     * @returns {Promise<object>} - Legislator details
     */
    async getLegislatorById(legislatorId) {
        if (!this.apiKey) {
            console.warn('⚠️ OpenStates API key required for detailed legislator data');
            return null;
        }
        
        try {
            console.log(`📋 Fetching legislator details: ${legislatorId}`);
            
            const response = await axios.get(`${this.baseUrl}/people/${legislatorId}`, {
                headers: {
                    'X-API-Key': this.apiKey
                },
                timeout: 10000
            });
            
            const leg = response.data;
            
            return {
                id: leg.id,
                name: leg.name,
                party: leg.party,
                chamber: leg.current_role?.title,
                district: leg.current_role?.district,
                email: leg.email,
                phone: leg.capitol_voice,
                photo_url: leg.image,
                websites: leg.links,
                committees: leg.current_role?.committee_memberships,
                biography: leg.biography,
                extras: leg.extras
            };
            
        } catch (error) {
            console.error(`❌ OpenStates legislator error:`, error.message);
            return null;
        }
    }

    /**
     * Search for state bills
     * @param {string} state - State abbreviation
     * @param {object} filters - Search filters (subject, status, etc.)
     * @returns {Promise<Array>} - Array of bills
     */
    async searchStateBills(state, filters = {}) {
        if (!this.apiKey) {
            console.warn('⚠️ OpenStates API key required for bill search');
            return [];
        }
        
        try {
            console.log(`📜 Searching state bills: ${state}`);
            
            const params = {
                jurisdiction: state.toLowerCase(),
                per_page: 50,
                ...filters
            };
            
            const response = await axios.get(`${this.baseUrl}/bills`, {
                headers: {
                    'X-API-Key': this.apiKey
                },
                params: params,
                timeout: 15000
            });
            
            const bills = response.data.results.map(bill => ({
                id: bill.id,
                identifier: bill.identifier,
                title: bill.title,
                classification: bill.classification,
                subject: bill.subject,
                status: this.simplifyBillStatus(bill.latest_action_description),
                introduced_date: bill.first_action_date,
                last_action_date: bill.latest_action_date,
                sponsors: bill.sponsorships || [],
                state: state.toUpperCase()
            }));
            
            console.log(`  ✅ Found ${bills.length} bills`);
            
            return bills;
            
        } catch (error) {
            console.error(`❌ OpenStates bill search error:`, error.message);
            return [];
        }
    }

    /**
     * Simplify bill status for display
     * @param {string} action - Last action description
     * @returns {string} - Simplified status
     */
    simplifyBillStatus(action) {
        if (!action) return 'Unknown';
        
        const lowerAction = action.toLowerCase();
        
        if (lowerAction.includes('signed') || lowerAction.includes('enacted')) {
            return 'Became Law';
        } else if (lowerAction.includes('passed') && lowerAction.includes('house')) {
            return 'Passed House';
        } else if (lowerAction.includes('passed') && lowerAction.includes('senate')) {
            return 'Passed Senate';
        } else if (lowerAction.includes('committee')) {
            return 'In Committee';
        } else if (lowerAction.includes('introduced')) {
            return 'Introduced';
        } else if (lowerAction.includes('vetoed')) {
            return 'Vetoed';
        } else {
            return 'In Progress';
        }
    }

    /**
     * Fallback data when API key not available
     * @param {string} state - State abbreviation
     * @returns {Array} - Basic state info
     */
    getFallbackStateLegislators(state) {
        console.log(`ℹ️ Using fallback data for ${state} (API key not configured)`);
        
        return [{
            id: `fallback_${state}`,
            name: 'State Legislator Data Unavailable',
            party: 'N/A',
            chamber: 'N/A',
            district: 'N/A',
            state: state.toUpperCase(),
            message: 'Configure OpenStates API key in .env for full state legislator data',
            signup_url: 'https://openstates.org/api/register/'
        }];
    }
}

module.exports = OpenStatesApi;
