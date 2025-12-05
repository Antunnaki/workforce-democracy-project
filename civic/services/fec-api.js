/**
 * FEC (FEDERAL ELECTION COMMISSION) API INTEGRATION
 * v37.0.0 - Campaign finance data
 * 
 * Source: https://api.open.fec.gov/developers/
 * Cost: FREE (government API)
 * API Key: Optional for higher rate limits (we'll use without for now)
 * 
 * Data provided:
 * - Candidate financial summaries
 * - Individual contributions
 * - Committee contributions (PACs)
 * - Itemized receipts and disbursements
 */

const axios = require('axios');

class FECApi {
    constructor(apiKey = null) {
        this.baseUrl = 'https://api.open.fec.gov/v1';
        this.apiKey = apiKey || process.env.FEC_API_KEY || 'DEMO_KEY';
        
        // Cache for expensive queries
        this.cache = new Map();
        this.cacheDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    /**
     * Get candidate financial summary
     * @param {string} candidateId - FEC candidate ID
     * @param {string} cycle - Election cycle (e.g., '2024')
     * @returns {Promise<object>} - Financial summary
     */
    async getCandidateFinances(candidateId, cycle = '2024') {
        const cacheKey = `candidate_${candidateId}_${cycle}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                console.log(`📦 FEC cache hit: ${candidateId}`);
                return cached.data;
            }
        }
        
        try {
            console.log(`💰 Fetching FEC data: ${candidateId} (${cycle})`);
            
            const response = await axios.get(`${this.baseUrl}/candidate/${candidateId}/totals/`, {
                params: {
                    cycle: cycle,
                    api_key: this.apiKey,
                    sort: '-cycle'
                },
                timeout: 10000
            });
            
            const data = response.data.results[0] || {};
            
            const summary = {
                candidate_id: candidateId,
                cycle: cycle,
                total_receipts: data.receipts || 0,
                total_disbursements: data.disbursements || 0,
                cash_on_hand: data.cash_on_hand_end_period || 0,
                individual_contributions: data.individual_contributions || 0,
                pac_contributions: data.political_party_committee_contributions || 0,
                candidate_contribution: data.candidate_contribution || 0,
                last_updated: new Date().toISOString()
            };
            
            // Cache result
            this.cache.set(cacheKey, {
                data: summary,
                timestamp: Date.now()
            });
            
            console.log(`  ✅ Raised: $${(summary.total_receipts / 1000000).toFixed(2)}M`);
            
            return summary;
            
        } catch (error) {
            console.error(`❌ FEC API error for ${candidateId}:`, error.message);
            return {
                candidate_id: candidateId,
                cycle: cycle,
                error: error.message,
                last_updated: new Date().toISOString()
            };
        }
    }

    /**
     * Get top contributors (individuals) to a candidate
     * @param {string} candidateId - FEC candidate ID
     * @param {string} cycle - Election cycle
     * @param {number} limit - Number of top contributors
     * @returns {Promise<Array>} - Top contributors
     */
    async getTopIndividualContributors(candidateId, cycle = '2024', limit = 10) {
        try {
            console.log(`👥 Fetching top individual contributors: ${candidateId}`);
            
            const response = await axios.get(`${this.baseUrl}/schedules/schedule_a/`, {
                params: {
                    candidate_id: candidateId,
                    two_year_transaction_period: cycle,
                    api_key: this.apiKey,
                    sort: '-contribution_receipt_amount',
                    per_page: limit
                },
                timeout: 15000
            });
            
            const contributors = response.data.results.map(contrib => ({
                name: contrib.contributor_name,
                occupation: contrib.contributor_occupation,
                employer: contrib.contributor_employer,
                amount: contrib.contribution_receipt_amount,
                date: contrib.contribution_receipt_date,
                city: contrib.contributor_city,
                state: contrib.contributor_state
            }));
            
            console.log(`  ✅ Found ${contributors.length} top contributors`);
            
            return contributors;
            
        } catch (error) {
            console.error(`❌ FEC contributors error:`, error.message);
            return [];
        }
    }

    /**
     * Get top PAC/committee contributions
     * @param {string} candidateId - FEC candidate ID
     * @param {string} cycle - Election cycle
     * @param {number} limit - Number of top PACs
     * @returns {Promise<Array>} - Top PAC contributors
     */
    async getTopPACContributors(candidateId, cycle = '2024', limit = 10) {
        try {
            console.log(`🏢 Fetching top PAC contributors: ${candidateId}`);
            
            const response = await axios.get(`${this.baseUrl}/schedules/schedule_a/`, {
                params: {
                    candidate_id: candidateId,
                    two_year_transaction_period: cycle,
                    api_key: this.apiKey,
                    is_individual: false,
                    sort: '-contribution_receipt_amount',
                    per_page: limit
                },
                timeout: 15000
            });
            
            const pacs = response.data.results.map(contrib => ({
                name: contrib.contributor_name,
                type: contrib.entity_type,
                amount: contrib.contribution_receipt_amount,
                date: contrib.contribution_receipt_date
            }));
            
            console.log(`  ✅ Found ${pacs.length} top PACs`);
            
            return pacs;
            
        } catch (error) {
            console.error(`❌ FEC PAC contributors error:`, error.message);
            return [];
        }
    }

    /**
     * Get industry breakdown of contributions
     * @param {string} candidateId - FEC candidate ID
     * @param {string} cycle - Election cycle
     * @returns {Promise<Array>} - Industry breakdown
     */
    async getIndustryBreakdown(candidateId, cycle = '2024') {
        try {
            // Note: FEC API doesn't directly provide industry classification
            // We'll need to aggregate by employer and categorize
            console.log(`🏭 Fetching industry breakdown: ${candidateId}`);
            
            const response = await axios.get(`${this.baseUrl}/schedules/schedule_a/`, {
                params: {
                    candidate_id: candidateId,
                    two_year_transaction_period: cycle,
                    api_key: this.apiKey,
                    per_page: 100,
                    sort: '-contribution_receipt_amount'
                },
                timeout: 20000
            });
            
            // Aggregate by employer
            const employerTotals = {};
            response.data.results.forEach(contrib => {
                const employer = contrib.contributor_employer || 'Not Employed';
                if (!employerTotals[employer]) {
                    employerTotals[employer] = 0;
                }
                employerTotals[employer] += contrib.contribution_receipt_amount || 0;
            });
            
            // Convert to array and sort
            const breakdown = Object.entries(employerTotals)
                .map(([employer, amount]) => ({
                    employer: employer,
                    amount: amount,
                    // TODO: Map employer to industry category
                    industry: this.categorizeIndustry(employer)
                }))
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 20);
            
            console.log(`  ✅ Analyzed ${breakdown.length} employers`);
            
            return breakdown;
            
        } catch (error) {
            console.error(`❌ FEC industry breakdown error:`, error.message);
            return [];
        }
    }

    /**
     * Simple industry categorization (can be expanded)
     * @param {string} employer - Employer name
     * @returns {string} - Industry category
     */
    categorizeIndustry(employer) {
        const lowerEmployer = employer.toLowerCase();
        
        if (lowerEmployer.includes('tech') || lowerEmployer.includes('software')) {
            return 'Technology';
        } else if (lowerEmployer.includes('health') || lowerEmployer.includes('medical')) {
            return 'Healthcare';
        } else if (lowerEmployer.includes('bank') || lowerEmployer.includes('financial')) {
            return 'Finance';
        } else if (lowerEmployer.includes('energy') || lowerEmployer.includes('oil')) {
            return 'Energy';
        } else if (lowerEmployer.includes('law') || lowerEmployer.includes('attorney')) {
            return 'Legal';
        } else if (lowerEmployer.includes('university') || lowerEmployer.includes('college')) {
            return 'Education';
        } else if (lowerEmployer.includes('retired')) {
            return 'Retired';
        } else if (employer === 'Not Employed') {
            return 'Unemployed';
        } else {
            return 'Other';
        }
    }

    /**
     * Get complete campaign finance profile
     * @param {string} candidateId - FEC candidate ID
     * @param {string} cycle - Election cycle
     * @returns {Promise<object>} - Complete profile
     */
    async getCompleteProfile(candidateId, cycle = '2024') {
        console.log(`📊 Building complete FEC profile: ${candidateId}`);
        
        const [summary, topIndividuals, topPACs, industries] = await Promise.all([
            this.getCandidateFinances(candidateId, cycle),
            this.getTopIndividualContributors(candidateId, cycle, 10),
            this.getTopPACContributors(candidateId, cycle, 10),
            this.getIndustryBreakdown(candidateId, cycle)
        ]);
        
        return {
            candidate_id: candidateId,
            cycle: cycle,
            summary: summary,
            top_individual_donors: topIndividuals,
            top_pac_donors: topPACs,
            industry_breakdown: industries,
            generated_at: new Date().toISOString()
        };
    }
}

module.exports = FECApi;
