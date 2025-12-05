/**
 * Nonprofit API Routes - Phase 2
 * Workforce Democracy Project v37.9.0
 * 
 * REST API endpoints for nonprofit search with ratings
 */

const express = require('express');
const router = express.Router();
const nonprofitProxy = require('../nonprofit-proxy-phase2');

/**
 * GET /api/nonprofits/search
 * Search nonprofits with Charity Navigator ratings
 * 
 * Query Parameters:
 * - q: Search query (required)
 * - state: State filter (optional, e.g., "NY")
 * - city: City filter (optional)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [organizations],
 *   total: number,
 *   query: string,
 *   filters: object
 * }
 */
router.get('/search', async (req, res) => {
    const { q, state, city } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({
            success: false,
            error: 'Search query must be at least 2 characters'
        });
    }
    
    try {
        const organizations = await nonprofitProxy.searchNonprofits(q, { state, city });
        
        res.json({
            success: true,
            data: organizations,
            total: organizations.length,
            query: q,
            filters: { state, city }
        });
        
    } catch (error) {
        console.error('Search endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to search nonprofits. Please try again later.'
        });
    }
});

/**
 * GET /api/nonprofits/:ein
 * Get detailed nonprofit information with Charity Navigator rating
 * 
 * Parameters:
 * - ein: Organization EIN (Tax ID)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     organization: object,
 *     fromCache: boolean,
 *     cacheAge: number (days, if from cache)
 *   }
 * }
 */
router.get('/:ein', async (req, res) => {
    const { ein } = req.params;
    
    if (!ein || ein.length < 9) {
        return res.status(400).json({
            success: false,
            error: 'Valid EIN required'
        });
    }
    
    try {
        const result = await nonprofitProxy.getNonprofitDetails(ein);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Details endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to fetch nonprofit details. Please try again later.'
        });
    }
});

/**
 * POST /api/nonprofits/report
 * Submit user report about outdated nonprofit information
 * 
 * Body:
 * {
 *   ein: string (required),
 *   orgName: string (required),
 *   reportType: string (optional, default: 'outdated_info'),
 *   message: string (optional)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 */
router.post('/report', async (req, res) => {
    const { ein, orgName, reportType, message } = req.body;
    
    if (!ein || !orgName) {
        return res.status(400).json({
            success: false,
            error: 'EIN and organization name are required'
        });
    }
    
    try {
        // Get user IP for spam prevention (optional)
        const userIp = req.ip || req.connection.remoteAddress;
        
        const result = await nonprofitProxy.submitReport(
            ein,
            orgName,
            reportType || 'outdated_info',
            message || 'User reported outdated information',
            userIp
        );
        
        res.json(result);
        
    } catch (error) {
        console.error('Report endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to submit report. Please try again later.'
        });
    }
});

/**
 * GET /api/nonprofits/admin/cache-stats
 * Get cache statistics (for admin dashboard)
 * 
 * Response:
 * {
 *   total_cached: number,
 *   highly_rated: number,
 *   lower_rated: number,
 *   unrated: number,
 *   total_api_calls_saved: number,
 *   avg_cache_age_days: number
 * }
 */
router.get('/admin/cache-stats', async (req, res) => {
    try {
        const stats = await nonprofitProxy.getCacheStats();
        
        res.json({
            success: true,
            stats: stats
        });
        
    } catch (error) {
        console.error('Cache stats endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to fetch cache statistics'
        });
    }
});

/**
 * GET /api/nonprofits/admin/pending-reports
 * Get pending user reports (for admin review)
 * 
 * Query Parameters:
 * - limit: Number of reports to return (default: 20, max: 100)
 * 
 * Response:
 * {
 *   success: true,
 *   reports: [report objects]
 * }
 */
router.get('/admin/pending-reports', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    try {
        const reports = await nonprofitProxy.getPendingReports(limit);
        
        res.json({
            success: true,
            reports: reports
        });
        
    } catch (error) {
        console.error('Pending reports endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to fetch pending reports'
        });
    }
});

module.exports = router;
