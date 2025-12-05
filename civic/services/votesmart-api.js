/**
 * VoteSmart API Integration
 * 
 * Project Vote Smart is a non-partisan, independent voter guide that provides
 * objective information on candidates, elected officials, and their positions.
 * 
 * API Documentation: https://api.votesmart.org/docs/
 * Free for non-commercial, non-partisan use (requires API key request)
 * 
 * Features:
 * - Legislator ratings from various organizations (NRA, ACLU, Sierra Club, etc.)
 * - Issue positions and voting records
 * - Special interest group ratings
 * - Key votes on major legislation
 * - Political courage test responses
 * 
 * Ethical Usage:
 * - Respects rate limits (generous for free tier)
 * - Results cached for 7 days via cache-manager
 * - Non-partisan presentation of all data
 * - No manipulation or selective display
 */

const axios = require('axios');

class VoteSmartApi {
    constructor(apiKey = null) {
        this.baseUrl = 'http://api.votesmart.org';
        this.apiKey = apiKey || process.env.VOTESMART_API_KEY || null;
        
        if (!this.apiKey) {
            console.warn('⚠️  VoteSmart API key not configured. Some features will be limited.');
            console.warn('   Request free API key at: https://votesmart.org/share/api');
        }
        
        this.rateLimit = 1000; // 1 second between requests (conservative)
        this.lastRequest = 0;
    }
    
    /**
     * Rate limiting to be respectful to VoteSmart servers
     */
    async respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        
        if (timeSinceLastRequest < this.rateLimit) {
            const waitTime = this.rateLimit - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequest = Date.now();
    }
    
    /**
     * Make API request with error handling
     */
    async makeRequest(endpoint, params = {}) {
        if (!this.apiKey) {
            return {
                success: false,
                error: 'API key not configured',
                data: null
            };
        }
        
        await this.respectRateLimit();
        
        try {
            const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
                params: {
                    key: this.apiKey,
                    o: 'JSON', // Output format
                    ...params
                },
                timeout: 10000
            });
            
            return {
                success: true,
                data: response.data,
                error: null
            };
        } catch (error) {
            console.error('VoteSmart API Error:', error.message);
            
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }
    
    /**
     * Find VoteSmart candidate ID by name and state
     * Required for most other API calls
     */
    async findCandidateId(firstName, lastName, state = null) {
        const result = await this.makeRequest('Candidates.getByLastname', {
            lastName: lastName,
            electionYear: new Date().getFullYear()
        });
        
        if (!result.success || !result.data?.candidateList?.candidate) {
            return null;
        }
        
        const candidates = Array.isArray(result.data.candidateList.candidate) 
            ? result.data.candidateList.candidate 
            : [result.data.candidateList.candidate];
        
        // Filter by first name and state if provided
        const matches = candidates.filter(c => {
            const nameMatch = c.firstName.toLowerCase().includes(firstName.toLowerCase());
            const stateMatch = !state || c.electionStateId === state;
            return nameMatch && stateMatch;
        });
        
        return matches.length > 0 ? matches[0].candidateId : null;
    }
    
    /**
     * Get special interest group (SIG) ratings for a candidate
     * Returns ratings from organizations like NRA, ACLU, Sierra Club, etc.
     */
    async getCandidateRatings(candidateId) {
        const result = await this.makeRequest('Rating.getCandidateRating', {
            candidateId: candidateId
        });
        
        if (!result.success) {
            return [];
        }
        
        const ratings = result.data?.candidateRating?.rating || [];
        const ratingsArray = Array.isArray(ratings) ? ratings : [ratings];
        
        return ratingsArray.map(rating => ({
            organization: rating.sigName,
            organizationId: rating.sigId,
            rating: rating.rating,
            ratingText: rating.ratingText,
            ratingName: rating.ratingName,
            timespan: rating.timespan,
            category: this.categorizeOrganization(rating.sigName)
        }));
    }
    
    /**
     * Categorize special interest groups by issue area
     */
    categorizeOrganization(orgName) {
        const categories = {
            'gun_rights': ['NRA', 'Gun Owners'],
            'civil_liberties': ['ACLU', 'Human Rights'],
            'environment': ['Sierra Club', 'League of Conservation', 'Environment'],
            'labor': ['AFL-CIO', 'Labor', 'Union', 'Workers'],
            'business': ['Chamber of Commerce', 'Business'],
            'healthcare': ['Planned Parenthood', 'Health'],
            'education': ['Education', 'Teachers'],
            'veterans': ['Veterans', 'American Legion'],
            'fiscal': ['Taxpayers', 'Fiscal']
        };
        
        const nameLower = orgName.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))) {
                return category;
            }
        }
        
        return 'other';
    }
    
    /**
     * Get candidate's positions on key issues
     * Returns positions from NPAT (National Political Awareness Test)
     */
    async getCandidatePositions(candidateId) {
        const result = await this.makeRequest('Npat.getNpat', {
            candidateId: candidateId
        });
        
        if (!result.success || !result.data?.npat) {
            return [];
        }
        
        const questions = result.data.npat.question || [];
        const questionsArray = Array.isArray(questions) ? questions : [questions];
        
        return questionsArray.map(q => ({
            questionId: q.questionId,
            question: q.question,
            answer: q.answer,
            category: q.categoryName
        }));
    }
    
    /**
     * Get candidate's key votes
     * Shows how they voted on important legislation
     */
    async getCandidateVotes(candidateId) {
        const result = await this.makeRequest('Votes.getByOfficial', {
            candidateId: candidateId
        });
        
        if (!result.success || !result.data?.votes?.vote) {
            return [];
        }
        
        const votes = result.data.votes.vote;
        const votesArray = Array.isArray(votes) ? votes : [votes];
        
        return votesArray.map(vote => ({
            billId: vote.billId,
            billNumber: vote.billNumber,
            billTitle: vote.billTitle,
            vote: vote.vote, // 'Yea', 'Nay', 'Abstain', etc.
            date: vote.date,
            stage: vote.stage,
            chamber: vote.chamber
        }));
    }
    
    /**
     * Get comprehensive profile combining all VoteSmart data
     */
    async getComprehensiveProfile(firstName, lastName, state = null) {
        // First find the candidate ID
        const candidateId = await this.findCandidateId(firstName, lastName, state);
        
        if (!candidateId) {
            return {
                success: false,
                error: 'Candidate not found in VoteSmart database',
                data: null
            };
        }
        
        // Fetch all data in parallel
        const [ratings, positions, votes] = await Promise.all([
            this.getCandidateRatings(candidateId),
            this.getCandidatePositions(candidateId),
            this.getCandidateVotes(candidateId)
        ]);
        
        return {
            success: true,
            candidateId: candidateId,
            data: {
                ratings: ratings,
                positions: positions,
                votes: votes,
                summary: this.generateSummary(ratings, positions, votes)
            }
        };
    }
    
    /**
     * Generate summary of candidate's political positions
     */
    generateSummary(ratings, positions, votes) {
        const summary = {
            totalRatings: ratings.length,
            ratingsByCategory: {},
            averageRatings: {},
            keyPositions: positions.slice(0, 5),
            recentVotes: votes.slice(0, 10)
        };
        
        // Group ratings by category
        ratings.forEach(rating => {
            if (!summary.ratingsByCategory[rating.category]) {
                summary.ratingsByCategory[rating.category] = [];
            }
            summary.ratingsByCategory[rating.category].push(rating);
        });
        
        // Calculate average ratings by category
        Object.keys(summary.ratingsByCategory).forEach(category => {
            const categoryRatings = summary.ratingsByCategory[category];
            const numericRatings = categoryRatings
                .map(r => parseFloat(r.rating))
                .filter(r => !isNaN(r));
            
            if (numericRatings.length > 0) {
                const average = numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length;
                summary.averageRatings[category] = Math.round(average);
            }
        });
        
        return summary;
    }
    
    /**
     * Get worker rights alignment score
     * Custom analysis of how well a candidate aligns with worker rights issues
     */
    async getWorkerRightsAlignment(candidateId) {
        const ratings = await this.getCandidateRatings(candidateId);
        const positions = await this.getCandidatePositions(candidateId);
        
        // Pro-worker organizations
        const proWorkerOrgs = [
            'AFL-CIO',
            'Labor',
            'Union',
            'Workers',
            'Employee',
            'Minimum Wage'
        ];
        
        // Filter ratings from pro-worker organizations
        const workerRatings = ratings.filter(rating => {
            const orgNameLower = rating.organization.toLowerCase();
            return proWorkerOrgs.some(keyword => 
                orgNameLower.includes(keyword.toLowerCase())
            );
        });
        
        // Calculate alignment score (0-100)
        if (workerRatings.length === 0) {
            return {
                score: null,
                confidence: 'low',
                ratingsUsed: 0,
                details: 'Insufficient data from worker rights organizations'
            };
        }
        
        const numericRatings = workerRatings
            .map(r => parseFloat(r.rating))
            .filter(r => !isNaN(r));
        
        const averageScore = numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length;
        
        return {
            score: Math.round(averageScore),
            confidence: workerRatings.length >= 3 ? 'high' : 'medium',
            ratingsUsed: workerRatings.length,
            organizations: workerRatings.map(r => r.organization),
            details: `Based on ${workerRatings.length} ratings from worker rights organizations`
        };
    }
}

module.exports = VoteSmartApi;
