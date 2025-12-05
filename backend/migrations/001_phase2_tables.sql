-- ============================================================================
-- Phase 2: Nonprofit Caching and Reporting Tables
-- Workforce Democracy Project v37.9.0
-- ============================================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS nonprofit_reports CASCADE;
DROP TABLE IF EXISTS nonprofit_cache CASCADE;

-- ============================================================================
-- Nonprofit Cache Table (30-day TTL)
-- Stores merged data from ProPublica + Charity Navigator
-- ============================================================================

CREATE TABLE nonprofit_cache (
    id SERIAL PRIMARY KEY,
    ein VARCHAR(20) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    charity_navigator_data JSONB,
    rating_stars INTEGER DEFAULT 0,
    rating_status VARCHAR(20) DEFAULT 'unrated', -- 'good', 'fair', 'poor', 'unrated'
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
    api_calls_saved INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_nonprofit_cache_ein ON nonprofit_cache(ein);
CREATE INDEX idx_nonprofit_cache_expires ON nonprofit_cache(expires_at);
CREATE INDEX idx_nonprofit_cache_rating ON nonprofit_cache(rating_stars);

-- ============================================================================
-- Nonprofit User Reports Table
-- Stores user-submitted reports about outdated/incorrect information
-- ============================================================================

CREATE TABLE nonprofit_reports (
    id SERIAL PRIMARY KEY,
    ein VARCHAR(20) NOT NULL,
    org_name VARCHAR(255),
    report_type VARCHAR(50) DEFAULT 'outdated_info', -- 'outdated_info', 'closed', 'wrong_location', 'other'
    user_message TEXT,
    user_ip VARCHAR(45), -- For spam prevention (optional)
    reported_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    reviewed_at TIMESTAMP,
    reviewer_notes TEXT,
    actions_taken TEXT
);

-- Indexes for admin review
CREATE INDEX idx_nonprofit_reports_ein ON nonprofit_reports(ein);
CREATE INDEX idx_nonprofit_reports_status ON nonprofit_reports(status);
CREATE INDEX idx_nonprofit_reports_date ON nonprofit_reports(reported_at DESC);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to automatically cleanup expired cache entries (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM nonprofit_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Sample Queries for Admin Dashboard (Future)
-- ============================================================================

-- View pending reports
-- SELECT * FROM nonprofit_reports WHERE status = 'pending' ORDER BY reported_at DESC LIMIT 20;

-- View cache statistics
-- SELECT 
--     COUNT(*) as total_cached,
--     COUNT(*) FILTER (WHERE rating_stars >= 3) as highly_rated,
--     COUNT(*) FILTER (WHERE rating_stars = 0) as unrated,
--     SUM(api_calls_saved) as total_api_calls_saved
-- FROM nonprofit_cache WHERE expires_at > NOW();

-- View most reported organizations
-- SELECT ein, org_name, COUNT(*) as report_count 
-- FROM nonprofit_reports 
-- WHERE status = 'pending' 
-- GROUP BY ein, org_name 
-- ORDER BY report_count DESC 
-- LIMIT 10;

-- ============================================================================
-- Grant Permissions (adjust user as needed)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON nonprofit_cache TO backend_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON nonprofit_reports TO backend_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO backend_user;

-- ============================================================================
-- Success Message
-- ============================================================================

SELECT 'Phase 2 tables created successfully!' as message;
SELECT 'Run cleanup_expired_cache() daily via cron to remove old cache entries' as note;
