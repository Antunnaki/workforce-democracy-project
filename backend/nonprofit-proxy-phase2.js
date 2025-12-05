/**
 * NONPROFIT ORGANIZATIONS API - Phase 2 Enhanced
 * Workforce Democracy Project v37.9.0
 * 
 * Features:
 * - ProPublica API integration (1.8M nonprofits)
 * - Charity Navigator ratings (quality verification)
 * - 30-day PostgreSQL caching
 * - User report system
 * - Transparent rating disclosure
 */

const fetch = require('node-fetch');
const charityNavigator = require('./services/charity-navigator-service');
const db = require('./db'); // PostgreSQL connection pool

// In-memory cache for quick lookups (supplemental to database cache)
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 900000; // 15 minutes

/**
 * Search nonprofits with Charity Navigator ratings
 * Phase 2: Includes quality verification and caching
 */
async function searchNonprofits(query, filters = {}) {
    try {
        console.log(`🔍 Searching nonprofits: "${query}"`, filters);
        
        // Step 1: Search ProPublica API
        let apiUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}`;
        
        if (filters.state) {
            apiUrl += `&state[id]=${encodeURIComponent(filters.state)}`;
        }
        if (filters.city) {
            apiUrl += `&city=${encodeURIComponent(filters.city)}`;
        }
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Workforce Democracy Project (Community Services)',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`ProPublica API returned ${response.status}`);
        }
        
        const data = await response.json();
        let organizations = data.organizations || [];
        
        console.log(`📊 Found ${organizations.length} organizations from ProPublica`);
        
        // Step 2: Enhance with Charity Navigator ratings (with caching)
        const enhanced = await enhanceWithRatings(organizations);
        
        console.log(`✅ Enhanced ${enhanced.length} organizations with ratings`);
        
        return enhanced;
        
    } catch (error) {
        console.error('❌ Search error:', error);
        throw error;
    }
}

/**
 * Get detailed nonprofit information with ratings
 * Phase 2: Includes full Charity Navigator data
 */
async function getNonprofitDetails(ein) {
    try {
        console.log(`🔍 Fetching details for EIN: ${ein}`);
        
        // Check database cache first (30-day TTL)
        const cached = await db.query(
            'SELECT * FROM nonprofit_cache WHERE ein = $1 AND expires_at > NOW()',
            [ein]
        );
        
        if (cached.rows.length > 0) {
            console.log(`📦 Database cache hit for EIN ${ein}`);
            const cacheEntry = cached.rows[0];
            
            // Update API calls saved counter
            await db.query(
                'UPDATE nonprofit_cache SET api_calls_saved = api_calls_saved + 1 WHERE ein = $1',
                [ein]
            );
            
            return {
                organization: cacheEntry.data,
                fromCache: true,
                cacheAge: Math.floor((Date.now() - new Date(cacheEntry.cached_at).getTime()) / 1000 / 60 / 60 / 24) // days
            };
        }
        
        // Fetch from ProPublica
        const propublicaUrl = `https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`;
        const propublicaResponse = await fetch(propublicaUrl, {
            headers: {
                'User-Agent': 'Workforce Democracy Project (Community Services)',
                'Accept': 'application/json'
            }
        });
        
        if (!propublicaResponse.ok) {
            throw new Error(`ProPublica API returned ${propublicaResponse.status}`);
        }
        
        const propublicaData = await propublicaResponse.json();
        const org = propublicaData.organization;
        
        // Fetch Charity Navigator rating
        const charityData = await charityNavigator.getCharityByEIN(ein);
        const rating = charityData ? charityNavigator.getOverallRating(charityData) : 0;
        const ratingStatus = charityNavigator.getRatingStatus(charityData);
        
        // Merge data
        const enhanced = {
            ...org,
            charity_navigator: charityData,
            rating_stars: rating,
            rating_status: ratingStatus.status,
            rating_message: ratingStatus.message,
            rating_disclosure: ratingStatus.userShouldKnow,
            rating_warning: ratingStatus.showWarning,
            has_rating: !!charityData,
            charity_navigator_url: charityNavigator.getCharityNavigatorURL(ein),
            user_review_url: charityNavigator.getUserReviewURL(ein)
        };
        
        // Cache in database for 30 days
        await db.query(
            `INSERT INTO nonprofit_cache 
             (ein, data, charity_navigator_data, rating_stars, rating_status, expires_at)
             VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 days')
             ON CONFLICT (ein) DO UPDATE
             SET data = $2, 
                 charity_navigator_data = $3, 
                 rating_stars = $4, 
                 rating_status = $5,
                 cached_at = NOW(), 
                 expires_at = NOW() + INTERVAL '30 days'`,
            [ein, JSON.stringify(enhanced), JSON.stringify(charityData), rating, ratingStatus.status]
        );
        
        console.log(`✅ Cached details for ${org.name} (${rating} stars)`);
        
        return {
            organization: enhanced,
            fromCache: false
        };
        
    } catch (error) {
        console.error('❌ Details fetch error:', error);
        throw error;
    }
}

/**
 * Enhance multiple organizations with Charity Navigator ratings
 * Uses database cache to minimize API calls
 */
async function enhanceWithRatings(organizations) {
    const enhanced = [];
    
    for (const org of organizations) {
        try {
            // Check database cache
            const cached = await db.query(
                'SELECT * FROM nonprofit_cache WHERE ein = $1 AND expires_at > NOW()',
                [org.ein]
            );
            
            if (cached.rows.length > 0) {
                console.log(`📦 Cache hit: ${org.name}`);
                const cacheEntry = cached.rows[0];
                
                // Increment API calls saved
                await db.query(
                    'UPDATE nonprofit_cache SET api_calls_saved = api_calls_saved + 1 WHERE ein = $1',
                    [org.ein]
                );
                
                enhanced.push(cacheEntry.data);
                continue;
            }
            
            // Fetch Charity Navigator rating (not in cache)
            const charityData = await charityNavigator.getCharityByEIN(org.ein);
            const rating = charityData ? charityNavigator.getOverallRating(charityData) : 0;
            const ratingStatus = charityNavigator.getRatingStatus(charityData);
            
            const enhancedOrg = {
                ...org,
                charity_navigator: charityData,
                rating_stars: rating,
                rating_status: ratingStatus.status,
                rating_message: ratingStatus.message,
                rating_disclosure: ratingStatus.userShouldKnow,
                rating_warning: ratingStatus.showWarning,
                has_rating: !!charityData,
                charity_navigator_url: charityNavigator.getCharityNavigatorURL(org.ein),
                user_review_url: charityNavigator.getUserReviewURL(org.ein)
            };
            
            // Cache in database
            await db.query(
                `INSERT INTO nonprofit_cache 
                 (ein, data, charity_navigator_data, rating_stars, rating_status, expires_at)
                 VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 days')
                 ON CONFLICT (ein) DO UPDATE
                 SET data = $2, 
                     charity_navigator_data = $3, 
                     rating_stars = $4, 
                     rating_status = $5,
                     cached_at = NOW(), 
                     expires_at = NOW() + INTERVAL '30 days'`,
                [org.ein, JSON.stringify(enhancedOrg), JSON.stringify(charityData), rating, ratingStatus.status]
            );
            
            enhanced.push(enhancedOrg);
            
            // Small delay to respect API rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.warn(`⚠️ Failed to enhance ${org.name}:`, error.message);
            // Include original org without rating
            enhanced.push({
                ...org,
                rating_stars: 0,
                rating_status: 'unrated',
                has_rating: false
            });
        }
    }
    
    return enhanced;
}

/**
 * Submit user report about outdated nonprofit information
 * Phase 2: Stores in database for admin review
 */
async function submitReport(ein, orgName, reportType, message, userIp = null) {
    try {
        await db.query(
            `INSERT INTO nonprofit_reports (ein, org_name, report_type, user_message, user_ip)
             VALUES ($1, $2, $3, $4, $5)`,
            [ein, orgName, reportType, message, userIp]
        );
        
        console.log(`📝 Report submitted for ${orgName} (EIN: ${ein})`);
        
        // Optional: Send admin notification email
        // await sendAdminNotification(ein, orgName, reportType);
        
        return {
            success: true,
            message: 'Report submitted successfully. Thank you for helping us maintain accurate information!'
        };
        
    } catch (error) {
        console.error('❌ Report submission error:', error);
        throw error;
    }
}

/**
 * Get cache statistics (for admin dashboard)
 */
async function getCacheStats() {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_cached,
                COUNT(*) FILTER (WHERE rating_stars >= 3) as highly_rated,
                COUNT(*) FILTER (WHERE rating_stars > 0 AND rating_stars < 3) as lower_rated,
                COUNT(*) FILTER (WHERE rating_stars = 0) as unrated,
                SUM(api_calls_saved) as total_api_calls_saved,
                AVG(EXTRACT(EPOCH FROM (NOW() - cached_at)) / 86400)::DECIMAL(10,2) as avg_cache_age_days
            FROM nonprofit_cache 
            WHERE expires_at > NOW()
        `);
        
        return stats.rows[0];
        
    } catch (error) {
        console.error('❌ Cache stats error:', error);
        return null;
    }
}

/**
 * Get pending reports (for admin review)
 */
async function getPendingReports(limit = 20) {
    try {
        const reports = await db.query(
            `SELECT * FROM nonprofit_reports 
             WHERE status = 'pending' 
             ORDER BY reported_at DESC 
             LIMIT $1`,
            [limit]
        );
        
        return reports.rows;
        
    } catch (error) {
        console.error('❌ Get reports error:', error);
        return [];
    }
}

module.exports = {
    searchNonprofits,
    getNonprofitDetails,
    enhanceWithRatings,
    submitReport,
    getCacheStats,
    getPendingReports
};
