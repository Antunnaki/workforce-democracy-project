/**
 * CIVIC PLATFORM DATABASE SCHEMA
 * v37.0.0 - Complete rebuild for democratic engagement
 * 
 * Tables:
 * 1. representatives - Enhanced rep data with all sources
 * 2. bills - Congress bills with user voting
 * 3. user_votes - User positions on bills
 * 4. fact_checks - Submitted claims for verification
 * 5. rep_votes - Representative voting records
 * 6. campaign_finance - FEC data cache
 * 7. news_articles - Aggregated news with fact-check status
 * 8. user_preferences - Issue priorities and alignment settings
 */

const CIVIC_SCHEMA = {
    // =========================================================================
    // TABLE 1: REPRESENTATIVES (Enhanced)
    // =========================================================================
    representatives: {
        fields: [
            { name: 'id', type: 'text', description: 'Unique identifier (bioguide_id or state-generated)' },
            { name: 'name', type: 'text', description: 'Full name' },
            { name: 'party', type: 'text', description: 'Political party (D/R/I/etc)' },
            { name: 'state', type: 'text', description: 'State abbreviation' },
            { name: 'district', type: 'text', description: 'District number (for House)' },
            { name: 'chamber', type: 'text', description: 'senate or house' },
            { name: 'photo_url', type: 'text', description: 'Official photo URL' },
            { name: 'email', type: 'text', description: 'Contact email' },
            { name: 'phone', type: 'text', description: 'Office phone' },
            { name: 'website', type: 'text', description: 'Official website' },
            { name: 'twitter', type: 'text', description: 'Twitter handle' },
            { name: 'facebook', type: 'text', description: 'Facebook page' },
            { name: 'term_start', type: 'datetime', description: 'Current term start date' },
            { name: 'term_end', type: 'datetime', description: 'Current term end date' },
            { name: 'next_election', type: 'datetime', description: 'Next election date' },
            { name: 'committees', type: 'array', description: 'Committee assignments' },
            { name: 'fec_candidate_id', type: 'text', description: 'FEC ID for campaign finance' },
            { name: 'votesmart_id', type: 'text', description: 'VoteSmart ID' },
            { name: 'ballotpedia_url', type: 'text', description: 'Ballotpedia profile URL' },
            { name: 'last_enriched', type: 'datetime', description: 'Last data update timestamp' },
            { name: 'data_sources', type: 'array', description: 'List of sources used' }
        ]
    },

    // =========================================================================
    // TABLE 2: BILLS (Congress legislation)
    // =========================================================================
    bills: {
        fields: [
            { name: 'id', type: 'text', description: 'Bill ID (e.g., hr1234-118)' },
            { name: 'congress', type: 'number', description: 'Congress number (e.g., 118)' },
            { name: 'bill_type', type: 'text', description: 'hr, s, hjres, sjres' },
            { name: 'bill_number', type: 'number', description: 'Bill number' },
            { name: 'title', type: 'text', description: 'Official title' },
            { name: 'short_title', type: 'text', description: 'Short/popular title' },
            { name: 'summary', type: 'rich_text', description: 'Bill summary' },
            { name: 'llm_summary', type: 'rich_text', description: 'AI-generated plain language summary' },
            { name: 'status', type: 'text', description: 'introduced, passed_house, passed_senate, became_law, etc' },
            { name: 'introduced_date', type: 'datetime', description: 'Date introduced' },
            { name: 'last_action_date', type: 'datetime', description: 'Most recent action' },
            { name: 'sponsors', type: 'array', description: 'Primary sponsors' },
            { name: 'cosponsors', type: 'array', description: 'Co-sponsors' },
            { name: 'categories', type: 'array', description: 'labor, healthcare, environment, etc' },
            { name: 'full_text_url', type: 'text', description: 'Link to full text' },
            { name: 'congress_gov_url', type: 'text', description: 'Official Congress.gov link' },
            { name: 'user_vote_count', type: 'number', description: 'Number of user votes' },
            { name: 'user_support_pct', type: 'number', description: 'Percentage supporting' }
        ]
    },

    // =========================================================================
    // TABLE 3: USER VOTES (User positions on bills)
    // =========================================================================
    user_votes: {
        fields: [
            { name: 'id', type: 'text', description: 'Auto-generated UUID' },
            { name: 'user_id', type: 'text', description: 'Anonymous user ID (hashed)' },
            { name: 'bill_id', type: 'text', description: 'References bills.id' },
            { name: 'position', type: 'text', description: 'support, oppose, neutral' },
            { name: 'strength', type: 'number', description: '1-5 (how strongly they feel)' },
            { name: 'reason', type: 'text', description: 'Optional: why they voted this way' },
            { name: 'voted_at', type: 'datetime', description: 'When they voted' },
            { name: 'updated_at', type: 'datetime', description: 'If they changed their vote' }
        ]
    },

    // =========================================================================
    // TABLE 4: REPRESENTATIVE VOTES (How reps voted on bills)
    // =========================================================================
    rep_votes: {
        fields: [
            { name: 'id', type: 'text', description: 'Auto-generated UUID' },
            { name: 'rep_id', type: 'text', description: 'References representatives.id' },
            { name: 'bill_id', type: 'text', description: 'References bills.id' },
            { name: 'vote', type: 'text', description: 'yea, nay, present, not_voting' },
            { name: 'vote_date', type: 'datetime', description: 'When vote occurred' },
            { name: 'vote_type', type: 'text', description: 'passage, cloture, amendment, etc' },
            { name: 'explanation', type: 'text', description: 'Rep explanation (if available)' }
        ]
    },

    // =========================================================================
    // TABLE 5: FACT CHECKS (User-submitted claims)
    // =========================================================================
    fact_checks: {
        fields: [
            { name: 'id', type: 'text', description: 'Auto-generated UUID' },
            { name: 'claim', type: 'rich_text', description: 'The claim to fact-check' },
            { name: 'submitted_by', type: 'text', description: 'Anonymous user ID' },
            { name: 'rep_id', type: 'text', description: 'Related representative (optional)' },
            { name: 'status', type: 'text', description: 'pending, in_progress, verified, debunked' },
            { name: 'rating', type: 'text', description: 'true, mostly_true, mixed, mostly_false, false' },
            { name: 'llm_analysis', type: 'rich_text', description: 'AI assistant analysis' },
            { name: 'sources', type: 'array', description: 'Verified sources used' },
            { name: 'discussion', type: 'array', description: 'User-AI conversation thread' },
            { name: 'submitted_at', type: 'datetime', description: 'Submission timestamp' },
            { name: 'verified_at', type: 'datetime', description: 'Verification complete timestamp' }
        ]
    },

    // =========================================================================
    // TABLE 6: CAMPAIGN FINANCE (FEC data cache)
    // =========================================================================
    campaign_finance: {
        fields: [
            { name: 'id', type: 'text', description: 'Auto-generated UUID' },
            { name: 'rep_id', type: 'text', description: 'References representatives.id' },
            { name: 'cycle', type: 'text', description: 'Election cycle (e.g., 2024)' },
            { name: 'total_raised', type: 'number', description: 'Total campaign funds raised' },
            { name: 'total_spent', type: 'number', description: 'Total campaign funds spent' },
            { name: 'individual_contributions', type: 'number', description: 'From individuals' },
            { name: 'pac_contributions', type: 'number', description: 'From PACs' },
            { name: 'top_donors', type: 'array', description: 'Top 10 donor organizations' },
            { name: 'top_individuals', type: 'array', description: 'Top 10 individual donors' },
            { name: 'industry_breakdown', type: 'array', description: 'Contributions by industry' },
            { name: 'last_updated', type: 'datetime', description: 'FEC data timestamp' }
        ]
    },

    // =========================================================================
    // TABLE 7: NEWS ARTICLES (Aggregated with fact-check status)
    // =========================================================================
    news_articles: {
        fields: [
            { name: 'id', type: 'text', description: 'Auto-generated UUID' },
            { name: 'rep_id', type: 'text', description: 'Related representative (optional)' },
            { name: 'bill_id', type: 'text', description: 'Related bill (optional)' },
            { name: 'title', type: 'text', description: 'Article headline' },
            { name: 'url', type: 'text', description: 'Article URL' },
            { name: 'source', type: 'text', description: 'News outlet name' },
            { name: 'source_type', type: 'text', description: 'independent, local, wire_service' },
            { name: 'published_date', type: 'datetime', description: 'Publication date' },
            { name: 'summary', type: 'text', description: 'Brief summary' },
            { name: 'sentiment', type: 'text', description: 'positive, negative, neutral' },
            { name: 'fact_check_status', type: 'text', description: 'verified, unverified, disputed' },
            { name: 'fact_check_notes', type: 'text', description: 'Verification notes' },
            { name: 'scraped_at', type: 'datetime', description: 'When we cached this' }
        ]
    },

    // =========================================================================
    // TABLE 8: USER PREFERENCES (Issue priorities & settings)
    // =========================================================================
    user_preferences: {
        fields: [
            { name: 'id', type: 'text', description: 'Anonymous user ID (hashed)' },
            { name: 'zip_code', type: 'text', description: 'ZIP for rep lookup' },
            { name: 'issue_priorities', type: 'array', description: 'labor, healthcare, environment, etc (ranked)' },
            { name: 'saved_reps', type: 'array', description: 'Favorite representative IDs' },
            { name: 'saved_bills', type: 'array', description: 'Bills tracking' },
            { name: 'notification_preferences', type: 'array', description: 'What to be notified about' },
            { name: 'created_at', type: 'datetime', description: 'Account creation' },
            { name: 'last_active', type: 'datetime', description: 'Last platform use' }
        ]
    }
};

// Export for backend use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CIVIC_SCHEMA;
}
