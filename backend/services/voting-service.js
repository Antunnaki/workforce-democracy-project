const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { analyzeWithAI } = require('../ai-service-qwen');

// API Configuration
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
const OPENSTATES_API_BASE = 'https://v3.openstates.org';

// Cache directory
const CACHE_DIR = path.join(__dirname, '../../data/voting-cache');

/**
 * Get voting records for a representative
 */
async function getVotingRecords(repId, level, name) {
    try {
        const cacheFile = path.join(CACHE_DIR, `${repId}.json`);
        
        // Check for indefinite cache
        if (fs.existsSync(cacheFile)) {
            console.log(`📦 [VotingService] Indefinite cache hit for ${repId}`);
            return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        }

        console.log(`🔍 [VotingService] Fetching votes for ${name} (${repId}, ${level})`);
        
        let votes = [];
        let source = '';

        if (level === 'federal') {
            votes = await fetchFederalVotes(repId, name);
            source = 'Congress.gov + AI Deep Search';
        } else {
            votes = await fetchStateVotes(repId, name);
            source = 'OpenStates';
        }

        // Get AI Summary/Explanation for the votes
        const aiSummary = await getAIVotingSummary(name, votes);

        const result = {
            success: true,
            repId,
            name,
            level,
            votes,
            aiSummary,
            source,
            timestamp: Date.now()
        };

        // Save to indefinite cache
        fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));
        
        return result;

    } catch (error) {
        console.error(`❌ [VotingService] Error:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Fetch federal votes from Congress.gov and supplement with AI
 */
async function fetchFederalVotes(bioguideId, name) {
    const votes = [];
    const id = bioguideId.replace('congress_', '');

    try {
        // 1. Get sponsored legislation from Congress.gov
        const response = await axios.get(`${CONGRESS_API_BASE}/member/${id}/sponsored-legislation`, {
            params: {
                format: 'json',
                api_key: CONGRESS_API_KEY,
                limit: 10
            }
        });

        const legislation = response.data.sponsoredLegislation || [];
        legislation.forEach(leg => {
            votes.push({
                title: leg.title,
                date: leg.latestAction?.actionDate,
                action: 'Sponsored',
                billNumber: `${leg.type}${leg.number}`,
                result: 'Legislation Introduced',
                description: leg.latestAction?.text
            });
        });

        // 2. Supplement with AI Deep Search for recent actual VOTES
        console.log(`🤖 [VotingService] Requesting AI Deep Search for recent votes of ${name}`);
        const aiSearchQuery = `Find the 5 most recent high-profile floor votes of US Representative ${name}. For each vote, include the Bill Title, Date, the Representative's position (Yea/Nay/Present), and the final result of the vote.`;
        
        const aiResult = await analyzeWithAI(aiSearchQuery, { context: 'voting_records' });
        
        // Note: In a real implementation, we'd want the AI to return structured data.
        // For now, we'll store the AI's research as a special entry or parse it.
        if (aiResult && aiResult.response) {
            votes.push({
                title: "Recent Floor Votes (AI Research)",
                isAiResearch: true,
                content: aiResult.response,
                sources: aiResult.sources
            });
        }

    } catch (error) {
        console.error(`❌ [VotingService] Federal Fetch Error:`, error.message);
    }

    return votes;
}

/**
 * Fetch state votes from OpenStates
 */
async function fetchStateVotes(openstatesId, name) {
    const votes = [];
    const id = openstatesId.replace('openstates_', '');

    try {
        // OpenStates API for person actions/votes
        // Note: OpenStates v3 REST API /people/{id} might not have votes directly
        // We'll use the bills endpoint to find bills where this person was a sponsor as a proxy if needed,
        // or just use AI search for state-level votes as well.
        
        const aiSearchQuery = `Find the 5 most recent high-profile votes of State Representative ${name} in their state legislature. Include Bill Title, Date, Position, and Result.`;
        const aiResult = await analyzeWithAI(aiSearchQuery, { context: 'voting_records' });

        if (aiResult && aiResult.response) {
            votes.push({
                title: "Recent State Legislature Votes (AI Research)",
                isAiResearch: true,
                content: aiResult.response,
                sources: aiResult.sources
            });
        }
    } catch (error) {
        console.error(`❌ [VotingService] State Fetch Error:`, error.message);
    }

    return votes;
}

/**
 * Get AI summary of voting patterns
 */
async function getAIVotingSummary(name, votes) {
    try {
        const votesContext = votes.map(v => v.title).join(', ');
        const prompt = `Based on these recent legislative actions and votes for ${name}: ${votesContext}. 
        Provide a 3-paragraph "Deep Dive" analysis in plain English:
        1. Overview of their primary legislative focus recently.
        2. A summary of their voting record on high-profile issues.
        3. How these actions align with general public interests (remain neutral and factual).
        Use a compassionate and informative tone. Always cite sources if you know them.`;

        const result = await analyzeWithAI(prompt, { context: 'voting_analysis' });
        return result.response || "Summary currently unavailable.";
    } catch (error) {
        return "AI Analysis failed to generate.";
    }
}

module.exports = {
    getVotingRecords
};
