-- =====================================================================
-- WORKFORCE DEMOCRACY PROJECT - Bill Analysis Caching System
-- Version: V37.17.0-BILL-CACHE
-- Date: 2025-01-XX
-- 
-- Smart PostgreSQL caching for AI bill analyses with:
-- - Universal bill analysis cache (shared across all users)
-- - Keyword-based question matching (semantic similarity)
-- - Cost tracking and cache hit rate monitoring
-- - Never-expire settled bills, 30-day cache for active bills
-- 
-- Cost Optimization:
-- - Before: $50-100/month (50 bills × 50 analyses per user)
-- - After: $0.50 one-time (analyze each bill ONCE), then FREE forever
-- - Savings: 99.5%+ reduction
-- =====================================================================

-- =====================================================================
-- TABLE 1: Bills Cache (Universal Bill Metadata + AI Analysis)
-- =====================================================================
-- Stores ONE analysis per bill (shared across ALL users)
-- Bills are identified by unique bill_id (e.g., "hr1234-118", "ca-ab123-2024")

CREATE TABLE IF NOT EXISTS bills_cache (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Bill Identification (UNIQUE per bill)
    bill_id VARCHAR(100) UNIQUE NOT NULL,  -- e.g., "hr1234-118", "ca-ab123-2024"
    bill_title TEXT NOT NULL,               -- e.g., "Affordable Housing Act of 2024"
    bill_type VARCHAR(50),                  -- "federal" or "state"
    state_code VARCHAR(2),                  -- NULL for federal, "CA" for state bills
    congress_number INTEGER,                -- 118, 119, etc. (federal only)
    bill_number INTEGER,                    -- Bill number (e.g., 1234 from HR 1234)
    
    -- Bill Metadata
    sponsor_name VARCHAR(255),              -- e.g., "Rep. Alexandria Ocasio-Cortez (D-NY-14)"
    introduced_date DATE,                   -- When bill was introduced
    status VARCHAR(100),                    -- "Introduced", "Passed House", "Became Law", etc.
    summary TEXT,                           -- Official bill summary
    full_text_url TEXT,                     -- Link to full bill text
    
    -- AI Analysis (Das Kapital Economic Framework)
    ai_analysis_full TEXT NOT NULL,         -- Complete AI analysis with markdown formatting
    labor_impact TEXT,                      -- "Impact on Workers" section
    economic_framework TEXT,                -- Das Kapital analysis perspective
    
    -- Keywords for Semantic Matching
    keywords TEXT[],                        -- Array of extracted keywords: ['housing', 'rent', 'affordable', 'tenants']
    
    -- Caching Metadata
    cached_at TIMESTAMP DEFAULT NOW(),      -- When this analysis was cached
    expires_at TIMESTAMP,                   -- NULL = never expires (settled bills)
    cache_hits INTEGER DEFAULT 0,           -- How many times this cache was used (cost savings metric!)
    
    -- Amendment Tracking (for cache invalidation)
    last_amendment_date DATE,               -- Track if bill was amended
    version VARCHAR(50),                    -- Bill version (e.g., "1.0", "2.0" after amendments)
    
    -- Cost Tracking
    groq_api_cost DECIMAL(10, 6),          -- Actual cost of this analysis (e.g., 0.000127)
    
    -- Indexes for fast lookups
    CONSTRAINT check_bill_type CHECK (bill_type IN ('federal', 'state'))
);

-- Index for fast bill_id lookups
CREATE INDEX idx_bills_cache_bill_id ON bills_cache(bill_id);

-- Index for keyword searches (GIN index for array operations)
CREATE INDEX idx_bills_cache_keywords ON bills_cache USING GIN(keywords);

-- Index for expiration cleanup
CREATE INDEX idx_bills_cache_expires_at ON bills_cache(expires_at) WHERE expires_at IS NOT NULL;

-- Index for cache hit tracking
CREATE INDEX idx_bills_cache_hits ON bills_cache(cache_hits DESC);

-- =====================================================================
-- TABLE 2: Bill Questions Cache (Keyword-Based Q&A)
-- =====================================================================
-- Stores user questions and AI answers about specific bills
-- Uses keyword matching to serve similar questions from cache

CREATE TABLE IF NOT EXISTS bill_questions_cache (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Link to Bill
    bill_id VARCHAR(100) NOT NULL REFERENCES bills_cache(bill_id) ON DELETE CASCADE,
    
    -- Question Data
    question_text TEXT NOT NULL,            -- Original question asked by user
    question_normalized TEXT NOT NULL,      -- Lowercased, stripped punctuation for matching
    question_keywords TEXT[],               -- Extracted keywords: ['teachers', 'education', 'impact']
    
    -- Answer Data
    answer_text TEXT NOT NULL,              -- AI-generated answer (markdown formatted)
    answer_source VARCHAR(50),              -- "groq-api" or "bill-analysis" (from main cache)
    
    -- Metadata
    asked_count INTEGER DEFAULT 1,          -- How many times this question was asked
    cached_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW(),   -- Track when this Q&A was last served
    
    -- Cost Tracking
    groq_api_cost DECIMAL(10, 6),          -- Cost of this specific answer
    
    -- Indexes
    CONSTRAINT fk_bill_questions_bill FOREIGN KEY (bill_id) REFERENCES bills_cache(bill_id)
);

-- Index for bill_id lookups
CREATE INDEX idx_bill_questions_bill_id ON bill_questions_cache(bill_id);

-- Index for keyword searches (GIN index for array operations)
CREATE INDEX idx_bill_questions_keywords ON bill_questions_cache USING GIN(question_keywords);

-- Index for normalized question text matching
CREATE INDEX idx_bill_questions_normalized ON bill_questions_cache(question_normalized);

-- Index for popular questions (most asked)
CREATE INDEX idx_bill_questions_popular ON bill_questions_cache(asked_count DESC);

-- =====================================================================
-- TABLE 3: Cache Performance Metrics
-- =====================================================================
-- Track cache hit rates, cost savings, and performance

CREATE TABLE IF NOT EXISTS cache_metrics (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE UNIQUE,  -- One row per day
    
    -- Cache Hit Stats
    total_requests INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    cache_hit_rate DECIMAL(5, 2),           -- Percentage (e.g., 98.5)
    
    -- Cost Stats
    groq_api_calls INTEGER DEFAULT 0,       -- How many times we called Groq
    total_cost_saved DECIMAL(10, 2),       -- Money saved by caching
    total_cost_spent DECIMAL(10, 2),       -- Money spent on Groq API
    
    -- Performance Stats
    avg_response_time_cached_ms INTEGER,    -- Avg response time from cache
    avg_response_time_api_ms INTEGER,       -- Avg response time from Groq API
    
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================================
-- VIEWS: Useful Analytics
-- =====================================================================

-- Most cached bills (by cache hits)
CREATE OR REPLACE VIEW popular_bills AS
SELECT 
    bill_id,
    bill_title,
    status,
    cache_hits,
    cached_at,
    ROUND(groq_api_cost * cache_hits, 4) AS total_savings
FROM bills_cache
WHERE cache_hits > 0
ORDER BY cache_hits DESC
LIMIT 50;

-- Most asked questions
CREATE OR REPLACE VIEW popular_questions AS
SELECT 
    bq.bill_id,
    bc.bill_title,
    bq.question_text,
    bq.asked_count,
    bq.cached_at,
    ROUND(bq.groq_api_cost * bq.asked_count, 4) AS total_savings
FROM bill_questions_cache bq
JOIN bills_cache bc ON bq.bill_id = bc.bill_id
WHERE bq.asked_count > 1
ORDER BY bq.asked_count DESC
LIMIT 50;

-- Daily cache performance
CREATE OR REPLACE VIEW cache_performance_summary AS
SELECT 
    date,
    total_requests,
    cache_hits,
    cache_misses,
    cache_hit_rate,
    total_cost_saved,
    total_cost_spent,
    ROUND((total_cost_saved / NULLIF(total_cost_saved + total_cost_spent, 0)) * 100, 2) AS savings_percentage
FROM cache_metrics
ORDER BY date DESC
LIMIT 30;

-- =====================================================================
-- FUNCTIONS: Helper Functions
-- =====================================================================

-- Function to extract keywords from text (simple version)
CREATE OR REPLACE FUNCTION extract_keywords(text_input TEXT)
RETURNS TEXT[] AS $$
DECLARE
    keywords TEXT[];
    cleaned TEXT;
BEGIN
    -- Convert to lowercase and remove punctuation
    cleaned := LOWER(REGEXP_REPLACE(text_input, '[^\w\s]', ' ', 'g'));
    
    -- Split into words, filter out common words, return unique keywords
    SELECT ARRAY_AGG(DISTINCT word)
    INTO keywords
    FROM (
        SELECT unnest(string_to_array(cleaned, ' ')) AS word
    ) words
    WHERE 
        LENGTH(word) > 3  -- Ignore short words
        AND word NOT IN (  -- Common stop words
            'this', 'that', 'these', 'those', 'what', 'which', 'when', 'where',
            'who', 'whom', 'whose', 'why', 'how', 'will', 'would', 'could',
            'should', 'does', 'about', 'with', 'from', 'have', 'been', 'were',
            'there', 'their', 'they', 'them', 'then', 'than', 'some', 'such'
        );
    
    RETURN COALESCE(keywords, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate keyword match score between two keyword arrays
CREATE OR REPLACE FUNCTION keyword_match_score(keywords1 TEXT[], keywords2 TEXT[])
RETURNS DECIMAL AS $$
DECLARE
    common_count INTEGER;
    total_unique INTEGER;
    score DECIMAL;
BEGIN
    -- Count common keywords
    SELECT COUNT(*)
    INTO common_count
    FROM (
        SELECT unnest(keywords1)
        INTERSECT
        SELECT unnest(keywords2)
    ) common;
    
    -- Count total unique keywords
    SELECT COUNT(DISTINCT keyword)
    INTO total_unique
    FROM (
        SELECT unnest(keywords1) AS keyword
        UNION
        SELECT unnest(keywords2) AS keyword
    ) all_keywords;
    
    -- Calculate Jaccard similarity score (0-1)
    IF total_unique > 0 THEN
        score := common_count::DECIMAL / total_unique::DECIMAL;
    ELSE
        score := 0;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- INITIAL DATA: Insert test/example data (optional)
-- =====================================================================

-- Example: Cache a famous bill (Affordable Care Act)
INSERT INTO bills_cache (
    bill_id,
    bill_title,
    bill_type,
    congress_number,
    bill_number,
    sponsor_name,
    introduced_date,
    status,
    summary,
    ai_analysis_full,
    labor_impact,
    economic_framework,
    keywords,
    expires_at,
    groq_api_cost
) VALUES (
    'hr3590-111',
    'Patient Protection and Affordable Care Act',
    'federal',
    111,
    3590,
    'Rep. John Dingell (D-MI-15)',
    '2009-09-17',
    'Became Public Law',
    'Comprehensive health care reform to provide affordable health insurance coverage.',
    '**Affordable Care Act (ACA) Analysis**\n\n**Labor Theory Perspective:**\nThis legislation aimed to expand healthcare access to workers...',
    '**Impact on Workers:** Expanded employer-sponsored insurance mandate, created individual marketplaces...',
    '**Das Kapital Framework:** Healthcare as a commodity vs. human right. Worker exploitation through...',
    ARRAY['healthcare', 'insurance', 'affordable', 'workers', 'coverage', 'medicaid', 'medicare'],
    NULL,  -- Never expires (settled bill)
    0.000234
) ON CONFLICT (bill_id) DO NOTHING;

-- =====================================================================
-- CLEANUP JOBS (Run periodically via cron or pg_cron)
-- =====================================================================

-- Delete expired active bill caches (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_caches()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM bills_cache
    WHERE expires_at IS NOT NULL
      AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % expired bill caches', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- USAGE EXAMPLES
-- =====================================================================

-- Example 1: Find cached bill analysis
-- SELECT ai_analysis_full FROM bills_cache WHERE bill_id = 'hr1234-118';

-- Example 2: Find similar questions
-- SELECT * FROM bill_questions_cache 
-- WHERE bill_id = 'hr1234-118' 
--   AND keyword_match_score(question_keywords, ARRAY['teachers', 'education']) > 0.5
-- ORDER BY keyword_match_score(question_keywords, ARRAY['teachers', 'education']) DESC
-- LIMIT 1;

-- Example 3: View cache performance
-- SELECT * FROM cache_performance_summary;

-- Example 4: Find most popular bills
-- SELECT * FROM popular_bills;

-- =====================================================================
-- NOTES
-- =====================================================================

-- PostgreSQL Version: Requires PostgreSQL 9.5+ (for array operations)
-- GIN Indexes: Enable fast keyword searches on TEXT[] arrays
-- Settled Bills: Never expire (expires_at = NULL) = cache forever
-- Active Bills: Expire in 30 days (expires_at = NOW() + INTERVAL '30 days')
-- Cost Tracking: Track every Groq API call to monitor expenses
-- Keyword Matching: Simple keyword extraction, upgradeable to word embeddings/vectors later

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
