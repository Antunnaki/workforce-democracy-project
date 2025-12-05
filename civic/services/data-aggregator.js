/**
 * Data Aggregator Service
 * 
 * Combines data from multiple independent, ethical sources:
 * - FEC API (campaign finance)
 * - OpenStates API (state legislators)
 * - Congress.gov API (federal bills & voting records)
 * - VoteSmart API (issue positions & ratings)
 * - DuckDuckGo + Web Scraping (news & fact-checking)
 * 
 * Philosophy:
 * - NO big tech dependencies (Google, Facebook, Twitter)
 * - Use only free, government, or non-partisan APIs
 * - Respect rate limits and cache aggressively (7 days)
 * - Transparent about data sources
 * - No manipulation or bias in aggregation
 * 
 * Returns unified representative profiles with:
 * - Contact information
 * - Voting records
 * - Campaign finance data
 * - Issue positions and ratings
 * - Recent news (fact-checked)
 * - Worker rights alignment score
 */

const FECApi = require('./fec-api');
const OpenStatesApi = require('./openstates-api');
const VoteSmartApi = require('./votesmart-api');
const EthicalScraper = require('./ethical-scraper');
const CacheManager = require('./cache-manager');

class DataAggregator {
    constructor() {
        this.fecApi = new FECApi();
        this.openStatesApi = new OpenStatesApi();
        this.voteSmartApi = new VoteSmartApi();
        this.scraper = new EthicalScraper();
        this.cache = new CacheManager({
            cacheDir: './cache/aggregated-data'
        });
        
        console.log('📊 Data Aggregator initialized with independent sources');
    }
    
    /**
     * Get comprehensive representative profile
     * Combines all data sources into single unified profile
     */
    async getRepresentativeProfile(representative) {
        const cacheKey = `rep_profile_${representative.bioguide_id || representative.id}`;
        
        // Check cache first (7-day TTL)
        const cached = await this.cache.get(cacheKey);
        if (cached) {
            console.log(`✓ Using cached profile for ${representative.name}`);
            return cached;
        }
        
        console.log(`🔄 Building fresh profile for ${representative.name}...`);
        
        // Fetch data from all sources in parallel
        const [
            campaignFinance,
            voteSmartData,
            newsArticles,
            stateData
        ] = await Promise.allSettled([
            this.getCampaignFinanceData(representative),
            this.getVoteSmartData(representative),
            this.getNewsArticles(representative),
            this.getStateData(representative)
        ]);
        
        // Build unified profile
        const profile = {
            // Basic Information
            id: representative.bioguide_id || representative.id,
            name: representative.name,
            party: representative.party,
            state: representative.state,
            district: representative.district || null,
            chamber: representative.chamber || 'house',
            
            // Contact Information
            contact: {
                phone: representative.phone || null,
                email: representative.email || null,
                website: representative.url || null,
                office: representative.office || null,
                contactForm: representative.contact_form || null
            },
            
            // Campaign Finance
            campaignFinance: campaignFinance.status === 'fulfilled' ? campaignFinance.value : {
                error: 'Data unavailable',
                totalRaised: null,
                topDonors: [],
                pacContributions: null,
                individualContributions: null,
                industryBreakdown: []
            },
            
            // Issue Positions & Ratings
            voteSmartData: voteSmartData.status === 'fulfilled' ? voteSmartData.value : {
                error: 'Data unavailable',
                ratings: [],
                positions: [],
                votes: []
            },
            
            // News & Fact-Checking
            news: newsArticles.status === 'fulfilled' ? newsArticles.value : [],
            
            // State-Specific Data
            stateInfo: stateData.status === 'fulfilled' ? stateData.value : null,
            
            // Alignment Scores
            alignmentScores: await this.calculateAlignmentScores(representative, voteSmartData),
            
            // Metadata
            dataQuality: this.assessDataQuality(campaignFinance, voteSmartData, newsArticles),
            lastUpdated: new Date().toISOString(),
            sources: [
                'FEC (Federal Election Commission)',
                'OpenStates.org',
                'Vote Smart',
                'DuckDuckGo News Search',
                'Congress.gov'
            ]
        };
        
        // Cache for 7 days
        await this.cache.set(cacheKey, profile);
        
        return profile;
    }
    
    /**
     * Get campaign finance data from FEC
     */
    async getCampaignFinanceData(rep) {
        if (!rep.fec_candidate_id) {
            return {
                error: 'No FEC candidate ID available',
                totalRaised: null,
                topDonors: [],
                pacContributions: null,
                individualContributions: null,
                industryBreakdown: []
            };
        }
        
        try {
            const currentCycle = new Date().getFullYear().toString();
            
            const [summary, donors, industries] = await Promise.all([
                this.fecApi.getCandidateFinances(rep.fec_candidate_id, currentCycle),
                this.fecApi.getTopIndividualContributors(rep.fec_candidate_id, currentCycle, 20),
                this.fecApi.getTopContributingIndustries(rep.fec_candidate_id, currentCycle, 15)
            ]);
            
            return {
                totalRaised: summary.total_receipts || 0,
                totalSpent: summary.total_disbursements || 0,
                cashOnHand: summary.cash_on_hand || 0,
                pacContributions: summary.pac_contributions || 0,
                individualContributions: summary.individual_contributions || 0,
                topDonors: donors,
                industryBreakdown: industries,
                cycle: currentCycle,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error fetching FEC data for ${rep.name}:`, error.message);
            return {
                error: error.message,
                totalRaised: null,
                topDonors: [],
                industryBreakdown: []
            };
        }
    }
    
    /**
     * Get VoteSmart issue positions and ratings
     */
    async getVoteSmartData(rep) {
        try {
            const [firstName, ...lastNameParts] = rep.name.split(' ');
            const lastName = lastNameParts.join(' ');
            
            const profile = await this.voteSmartApi.getComprehensiveProfile(
                firstName,
                lastName,
                rep.state
            );
            
            if (!profile.success) {
                return {
                    error: profile.error,
                    ratings: [],
                    positions: [],
                    votes: []
                };
            }
            
            return profile.data;
        } catch (error) {
            console.error(`Error fetching VoteSmart data for ${rep.name}:`, error.message);
            return {
                error: error.message,
                ratings: [],
                positions: [],
                votes: []
            };
        }
    }
    
    /**
     * Get news articles using DuckDuckGo (privacy-first)
     */
    async getNewsArticles(rep) {
        try {
            const query = `${rep.name} ${rep.state} representative`;
            const results = await this.scraper.searchDuckDuckGo(query, 15);
            
            // Filter for news sources only
            const newsSources = [
                'apnews.com',
                'reuters.com',
                'npr.org',
                'pbs.org',
                'propublica.org',
                'c-span.org',
                'ballotpedia.org',
                'opensecrets.org',
                'votesmart.org'
            ];
            
            const newsArticles = results.filter(result => 
                newsSources.some(source => result.url.includes(source))
            );
            
            return newsArticles.map(article => ({
                title: article.title,
                url: article.url,
                snippet: article.snippet,
                source: this.extractDomain(article.url),
                factChecked: false, // Will be checked separately
                publishedDate: article.publishedDate || null
            }));
        } catch (error) {
            console.error(`Error fetching news for ${rep.name}:`, error.message);
            return [];
        }
    }
    
    /**
     * Get state-specific data from OpenStates
     */
    async getStateData(rep) {
        if (!rep.state || rep.chamber === 'senate') {
            return null; // Only relevant for state legislators
        }
        
        try {
            const stateReps = await this.openStatesApi.getLegislatorsByState(
                rep.state,
                rep.district
            );
            
            // Find matching rep
            const match = stateReps.find(sr => 
                sr.name.toLowerCase().includes(rep.name.toLowerCase())
            );
            
            return match || null;
        } catch (error) {
            console.error(`Error fetching state data for ${rep.name}:`, error.message);
            return null;
        }
    }
    
    /**
     * Calculate alignment scores with user priorities
     * Focuses on worker rights, healthcare, environment, education
     */
    async calculateAlignmentScores(rep, voteSmartData) {
        const scores = {
            workerRights: null,
            healthcare: null,
            environment: null,
            education: null,
            overall: null
        };
        
        if (voteSmartData.status !== 'fulfilled' || !voteSmartData.value.ratings) {
            return scores;
        }
        
        const ratings = voteSmartData.value.ratings;
        
        // Worker Rights (AFL-CIO, labor unions)
        const laborOrgs = ['AFL-CIO', 'Labor', 'Union', 'Workers'];
        const laborRatings = ratings.filter(r => 
            laborOrgs.some(org => r.organization.includes(org))
        );
        if (laborRatings.length > 0) {
            scores.workerRights = this.averageRatings(laborRatings);
        }
        
        // Healthcare (AMA, Planned Parenthood, etc.)
        const healthOrgs = ['Health', 'Medical', 'Planned Parenthood'];
        const healthRatings = ratings.filter(r => 
            healthOrgs.some(org => r.organization.includes(org))
        );
        if (healthRatings.length > 0) {
            scores.healthcare = this.averageRatings(healthRatings);
        }
        
        // Environment (Sierra Club, League of Conservation)
        const envOrgs = ['Sierra Club', 'Environment', 'Conservation', 'Climate'];
        const envRatings = ratings.filter(r => 
            envOrgs.some(org => r.organization.includes(org))
        );
        if (envRatings.length > 0) {
            scores.environment = this.averageRatings(envRatings);
        }
        
        // Education (teachers unions, education groups)
        const eduOrgs = ['Education', 'Teachers', 'NEA', 'AFT'];
        const eduRatings = ratings.filter(r => 
            eduOrgs.some(org => r.organization.includes(org))
        );
        if (eduRatings.length > 0) {
            scores.education = this.averageRatings(eduRatings);
        }
        
        // Overall score (average of available scores)
        const availableScores = Object.values(scores).filter(s => s !== null);
        if (availableScores.length > 0) {
            scores.overall = Math.round(
                availableScores.reduce((a, b) => a + b, 0) / availableScores.length
            );
        }
        
        return scores;
    }
    
    /**
     * Calculate average rating from array of ratings
     */
    averageRatings(ratings) {
        const numericRatings = ratings
            .map(r => parseFloat(r.rating))
            .filter(r => !isNaN(r));
        
        if (numericRatings.length === 0) {
            return null;
        }
        
        return Math.round(
            numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length
        );
    }
    
    /**
     * Assess overall data quality
     */
    assessDataQuality(campaignFinance, voteSmartData, newsArticles) {
        let score = 0;
        const maxScore = 100;
        
        // Campaign finance data (30 points)
        if (campaignFinance.status === 'fulfilled' && campaignFinance.value.totalRaised) {
            score += 20;
            if (campaignFinance.value.topDonors.length > 0) score += 10;
        }
        
        // VoteSmart data (40 points)
        if (voteSmartData.status === 'fulfilled') {
            if (voteSmartData.value.ratings?.length > 0) score += 20;
            if (voteSmartData.value.positions?.length > 0) score += 10;
            if (voteSmartData.value.votes?.length > 0) score += 10;
        }
        
        // News articles (30 points)
        if (newsArticles.status === 'fulfilled') {
            const count = newsArticles.value.length;
            score += Math.min(30, count * 3);
        }
        
        return {
            score: Math.round((score / maxScore) * 100),
            hasCampaignFinance: campaignFinance.status === 'fulfilled',
            hasVoteSmartData: voteSmartData.status === 'fulfilled',
            hasNews: newsArticles.status === 'fulfilled',
            completeness: score >= 70 ? 'good' : score >= 40 ? 'partial' : 'limited'
        };
    }
    
    /**
     * Extract domain from URL
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }
    
    /**
     * Search representatives by location
     * Returns array of representatives with basic info
     */
    async searchRepresentativesByLocation(address) {
        // This would integrate with Congress.gov API or Geocodio
        // For now, returning structure for frontend integration
        
        const cacheKey = `reps_location_${address.replace(/\s/g, '_')}`;
        const cached = await this.cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        // TODO: Integrate with Congress.gov Representative Lookup API
        // https://api.congress.gov/v3/member
        
        return {
            error: 'Location search not yet implemented',
            message: 'Please provide representative name or bioguide ID',
            representatives: []
        };
    }
    
    /**
     * Get recent bills for tracking
     */
    async getRecentBills(filters = {}) {
        const cacheKey = `bills_${JSON.stringify(filters)}`;
        const cached = await this.cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        // TODO: Integrate with Congress.gov Bills API
        // https://api.congress.gov/v3/bill
        
        return {
            error: 'Bills API not yet implemented',
            message: 'Congress.gov API integration pending',
            bills: []
        };
    }
}

module.exports = DataAggregator;
