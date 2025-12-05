-- =============================================================================
-- WORKFORCE DEMOCRACY PROJECT - DATABASE SCHEMA
-- Version: 1.0
-- Date: 2025-01-28
-- Database: PostgreSQL 14+
-- =============================================================================

-- =============================================================================
-- TABLE 1: BILLS (Government Legislation)
-- =============================================================================

CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    full_text TEXT,
    status VARCHAR(50),
    government_level VARCHAR(20) CHECK (government_level IN ('federal', 'state', 'local')),
    state VARCHAR(2), -- for state/local bills
    introduced_date DATE,
    last_action_date DATE,
    sponsor_name VARCHAR(255),
    sponsor_party VARCHAR(50),
    categories TEXT[], -- array of categories
    tags TEXT[], -- searchable tags
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for bills
CREATE INDEX idx_bills_bill_id ON bills(bill_id);
CREATE INDEX idx_bills_state ON bills(state);
CREATE INDEX idx_bills_government_level ON bills(government_level);
CREATE INDEX idx_bills_categories ON bills USING GIN(categories);
CREATE INDEX idx_bills_tags ON bills USING GIN(tags);
CREATE INDEX idx_bills_introduced_date ON bills(introduced_date DESC);

-- =============================================================================
-- TABLE 2: REPRESENTATIVES (Elected Officials)
-- =============================================================================

CREATE TABLE IF NOT EXISTS representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rep_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100), -- Senator, Representative, Governor, etc.
    party VARCHAR(50),
    state VARCHAR(2),
    district VARCHAR(10),
    office_address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    social_media JSONB, -- { twitter, facebook, instagram }
    voting_record JSONB, -- structured voting data
    committee_assignments TEXT[],
    bio TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for representatives
CREATE INDEX idx_reps_state ON representatives(state);
CREATE INDEX idx_reps_district ON representatives(district);
CREATE INDEX idx_reps_party ON representatives(party);
CREATE INDEX idx_reps_name ON representatives(name);

-- =============================================================================
-- TABLE 3: COURT CASES (Supreme Court and Federal Cases)
-- =============================================================================

CREATE TABLE IF NOT EXISTS court_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(100) UNIQUE NOT NULL,
    case_name VARCHAR(500) NOT NULL,
    case_name_normalized VARCHAR(500), -- for matching (lowercase, no punctuation)
    year INTEGER,
    court_level VARCHAR(50) CHECK (court_level IN ('supreme', 'federal', 'state')),
    country VARCHAR(10) DEFAULT 'US',
    summary TEXT NOT NULL,
    impact TEXT,
    significance TEXT,
    decision TEXT,
    vote_split VARCHAR(20), -- e.g., "5-4", "7-2", "unanimous"
    majority_author VARCHAR(255),
    dissenting_authors TEXT[],
    full_opinion_url TEXT,
    topics TEXT[], -- abortion, civil rights, privacy, etc.
    related_cases TEXT[], -- array of related case IDs
    precedent_set TEXT, -- what precedent this case established
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for court_cases
CREATE INDEX idx_cases_normalized_name ON court_cases(case_name_normalized);
CREATE INDEX idx_cases_topics ON court_cases USING GIN(topics);
CREATE INDEX idx_cases_country ON court_cases(country);
CREATE INDEX idx_cases_year ON court_cases(year DESC);
CREATE INDEX idx_cases_court_level ON court_cases(court_level);

-- =============================================================================
-- TABLE 4: COOPERATIVES (Worker Cooperatives & B Corps)
-- =============================================================================

CREATE TABLE IF NOT EXISTS cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    type VARCHAR(100), -- worker cooperative, housing coop, credit union, b corp
    industry VARCHAR(100),
    description TEXT,
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(2),
    postal_code VARCHAR(20),
    country VARCHAR(10) DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(255),
    employee_count INTEGER,
    founded_year INTEGER,
    certification VARCHAR(100), -- B Corp, Worker Owned, etc.
    certification_date DATE,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for cooperatives
CREATE INDEX idx_coops_location ON cooperatives(state, city);
CREATE INDEX idx_coops_postal ON cooperatives(postal_code);
CREATE INDEX idx_coops_type ON cooperatives(type);
CREATE INDEX idx_coops_industry ON cooperatives(industry);
CREATE INDEX idx_coops_tags ON cooperatives USING GIN(tags);

-- Spatial index for location-based queries
CREATE INDEX idx_coops_lat_lng ON cooperatives(latitude, longitude);

-- =============================================================================
-- TABLE 5: USER CONTEXTS (Anonymous User Data - Encrypted)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL, -- anonymous hash or user ID
    location JSONB, -- { postcode, city, state, country }
    preferences JSONB, -- user settings
    voting_history JSONB, -- encrypted voting data
    learning_progress JSONB, -- what they've learned
    personalization_enabled BOOLEAN DEFAULT false,
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for user_contexts
CREATE INDEX idx_user_contexts_user_id ON user_contexts(user_id);
CREATE INDEX idx_user_contexts_last_active ON user_contexts(last_active DESC);

-- =============================================================================
-- TABLE 6: CONVERSATION MEMORY (Cross-Chat Context)
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversation_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    chat_type VARCHAR(50) NOT NULL, -- bills, civic, ethical, voting, etc.
    message_role VARCHAR(20) NOT NULL CHECK (message_role IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    topics TEXT[], -- extracted topics from message
    entities TEXT[], -- extracted entities (bill IDs, rep names, case names)
    session_id VARCHAR(255), -- optional session grouping
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for conversation_memory
CREATE INDEX idx_conversation_user_id ON conversation_memory(user_id);
CREATE INDEX idx_conversation_timestamp ON conversation_memory(timestamp DESC);
CREATE INDEX idx_conversation_topics ON conversation_memory USING GIN(topics);
CREATE INDEX idx_conversation_chat_type ON conversation_memory(chat_type);
CREATE INDEX idx_conversation_session ON conversation_memory(session_id);

-- Auto-delete old conversation memory (30 days retention)
CREATE OR REPLACE FUNCTION delete_old_conversations()
RETURNS void AS $$
BEGIN
    DELETE FROM conversation_memory 
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE 7: CACHED RESPONSES (AI Response Cache)
-- =============================================================================

CREATE TABLE IF NOT EXISTS cached_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 hash of normalized query
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    source VARCHAR(20) CHECK (source IN ('cache', 'ai', 'database')),
    chat_type VARCHAR(50),
    context_hash VARCHAR(64), -- hash of context used
    hit_count INTEGER DEFAULT 1,
    last_accessed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for cached_responses
CREATE INDEX idx_cached_responses_hash ON cached_responses(query_hash);
CREATE INDEX idx_cached_responses_chat_type ON cached_responses(chat_type);
CREATE INDEX idx_cached_responses_last_accessed ON cached_responses(last_accessed DESC);

-- Update hit count on cache access
CREATE OR REPLACE FUNCTION update_cache_hit()
RETURNS TRIGGER AS $$
BEGIN
    NEW.hit_count = OLD.hit_count + 1;
    NEW.last_accessed = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE 8: FAQ CONTENT (Pre-written FAQ Answers)
-- =============================================================================

CREATE TABLE IF NOT EXISTS faq_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faq_id VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    related_topics TEXT[],
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faq_content
CREATE INDEX idx_faq_category ON faq_content(category);
CREATE INDEX idx_faq_view_count ON faq_content(view_count DESC);

-- =============================================================================
-- TABLE 9: API USAGE METRICS (Cost Tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    chat_type VARCHAR(50),
    source VARCHAR(20), -- cache, database, ai
    response_time_ms INTEGER,
    cost DECIMAL(10, 6), -- actual API cost
    user_id VARCHAR(255),
    query_hash VARCHAR(64),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for api_usage_metrics
CREATE INDEX idx_metrics_timestamp ON api_usage_metrics(timestamp DESC);
CREATE INDEX idx_metrics_source ON api_usage_metrics(source);
CREATE INDEX idx_metrics_chat_type ON api_usage_metrics(chat_type);

-- =============================================================================
-- VIEWS (Convenience Queries)
-- =============================================================================

-- View: Cache hit rate by chat type
CREATE OR REPLACE VIEW cache_hit_rate AS
SELECT 
    chat_type,
    COUNT(*) FILTER (WHERE source = 'cache') AS cache_hits,
    COUNT(*) FILTER (WHERE source = 'ai') AS ai_queries,
    COUNT(*) AS total_queries,
    ROUND(100.0 * COUNT(*) FILTER (WHERE source = 'cache') / COUNT(*), 2) AS cache_hit_percentage
FROM api_usage_metrics
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY chat_type;

-- View: Most popular court cases
CREATE OR REPLACE VIEW popular_court_cases AS
SELECT 
    cc.case_name,
    cc.year,
    cc.topics,
    COUNT(cm.id) AS mention_count
FROM court_cases cc
LEFT JOIN conversation_memory cm ON cm.entities && ARRAY[cc.case_name_normalized]
WHERE cm.timestamp > NOW() - INTERVAL '30 days'
GROUP BY cc.id, cc.case_name, cc.year, cc.topics
ORDER BY mention_count DESC
LIMIT 50;

-- View: Cost summary
CREATE OR REPLACE VIEW cost_summary AS
SELECT 
    DATE(timestamp) AS date,
    SUM(cost) AS total_cost,
    COUNT(*) AS total_queries,
    COUNT(*) FILTER (WHERE source = 'cache') AS cached_queries,
    COUNT(*) FILTER (WHERE source = 'ai') AS ai_queries
FROM api_usage_metrics
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- =============================================================================
-- INITIAL DATA: Famous Supreme Court Cases
-- =============================================================================

INSERT INTO court_cases (
    case_id, case_name, case_name_normalized, year, court_level, country,
    summary, impact, significance, decision, vote_split, majority_author, topics
) VALUES
(
    'roe-v-wade-1973',
    'Roe v. Wade',
    'roe v wade',
    1973,
    'supreme',
    'US',
    'Landmark decision that established a constitutional right to abortion.',
    'Recognized privacy rights under the 14th Amendment. Protected abortion access until viability (~24 weeks). Later overturned by Dobbs v. Jackson (2022).',
    'One of the most controversial Supreme Court decisions in US history. Shaped reproductive rights debate for 50 years.',
    'The Court held that the Constitution protects a woman''s liberty to choose to have an abortion without excessive government restriction.',
    '7-2',
    'Justice Harry Blackmun',
    ARRAY['abortion', 'privacy', 'reproductive rights', '14th amendment']
),
(
    'brown-v-board-1954',
    'Brown v. Board of Education',
    'brown v board',
    1954,
    'supreme',
    'US',
    'Declared racial segregation in public schools unconstitutional.',
    'Overturned "separate but equal" doctrine from Plessy v. Ferguson. Catalyzed the Civil Rights Movement.',
    'Unanimously ruled segregation violated the Equal Protection Clause of the 14th Amendment.',
    'The Court ruled that state laws establishing separate public schools for Black and white students were unconstitutional.',
    'unanimous',
    'Chief Justice Earl Warren',
    ARRAY['civil rights', 'segregation', 'education', '14th amendment', 'equal protection']
),
(
    'miranda-v-arizona-1966',
    'Miranda v. Arizona',
    'miranda v arizona',
    1966,
    'supreme',
    'US',
    'Established "Miranda Rights" - police must inform suspects of their rights.',
    'Required police to warn suspects: right to remain silent, right to attorney, anything said can be used in court.',
    'Protects Fifth Amendment right against self-incrimination. Created the famous "You have the right to remain silent..." warning heard in countless TV shows and movies.',
    'The Court held that both inculpatory and exculpatory statements made in response to interrogation by a defendant in police custody will be admissible at trial only if the prosecution can show that the defendant was informed of the right to consult with an attorney.',
    '5-4',
    'Chief Justice Earl Warren',
    ARRAY['criminal justice', 'civil rights', '5th amendment', 'self-incrimination', 'police procedure']
),
(
    'citizens-united-2010',
    'Citizens United v. FEC',
    'citizens united',
    2010,
    'supreme',
    'US',
    'Ruled that corporations can spend unlimited money on political campaigns.',
    'Treated corporate political spending as protected free speech. Led to rise of Super PACs.',
    'Controversial decision that dramatically increased money in politics. Considered one of the most impactful campaign finance rulings.',
    'The Court held that the free speech clause of the First Amendment prohibits the government from restricting independent expenditures for political campaigns by corporations.',
    '5-4',
    'Justice Anthony Kennedy',
    ARRAY['campaign finance', 'free speech', '1st amendment', 'corporate personhood', 'super pacs']
),
(
    'dobbs-v-jackson-2022',
    'Dobbs v. Jackson Women''s Health Organization',
    'dobbs v jackson',
    2022,
    'supreme',
    'US',
    'Overturned Roe v. Wade, returning abortion regulation to states.',
    'Eliminated federal constitutional right to abortion. Each state now sets its own abortion laws.',
    'Most significant reversal of precedent in modern Supreme Court history. Ended nearly 50 years of federal abortion rights.',
    'The Court held that the Constitution does not confer a right to abortion, and returned the authority to regulate abortion to the states.',
    '6-3',
    'Justice Samuel Alito',
    ARRAY['abortion', 'reproductive rights', 'state rights', 'precedent reversal']
)
ON CONFLICT (case_id) DO NOTHING;

-- =============================================================================
-- FUNCTIONS: Cleanup and Maintenance
-- =============================================================================

-- Function: Clean old cached responses (keep top 10,000 by hit count)
CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM cached_responses
    WHERE id NOT IN (
        SELECT id FROM cached_responses
        ORDER BY hit_count DESC, last_accessed DESC
        LIMIT 10000
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Archive old conversation memory
CREATE OR REPLACE FUNCTION archive_old_conversations()
RETURNS void AS $$
BEGIN
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS conversation_memory_archive (LIKE conversation_memory INCLUDING ALL);
    
    -- Move old conversations to archive
    INSERT INTO conversation_memory_archive
    SELECT * FROM conversation_memory
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Delete from main table
    DELETE FROM conversation_memory
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SCHEDULED JOBS (Run with pg_cron or external cron)
-- =============================================================================

-- Daily: Clean old cache
-- SELECT cleanup_old_cache();

-- Weekly: Archive old conversations
-- SELECT archive_old_conversations();

-- =============================================================================
-- GRANTS (Adjust based on your user setup)
-- =============================================================================

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =============================================================================
-- SCHEMA VERSION
-- =============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description) VALUES 
('1.0', 'Initial schema with 9 tables for knowledge base');

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
