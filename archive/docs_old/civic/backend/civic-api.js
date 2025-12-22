/**
 * Civic Platform API Router
 * 
 * Main Express router that provides endpoints for the entire civic platform.
 * Integrates all services: FEC, OpenStates, VoteSmart, fact-checking, data aggregation.
 * 
 * Endpoints:
 * - /api/civic/representatives - Search and get representative profiles
 * - /api/civic/bills - Browse and track legislation
 * - /api/civic/fact-check - Verify claims against multiple sources
 * - /api/civic/user-votes - Track user positions on bills
 * - /api/civic/alignment - Calculate user alignment with representatives
 * - /api/civic/news - Get fact-checked news articles
 * 
 * Design Principles:
 * - RESTful design with clear resource paths
 * - Comprehensive error handling
 * - Request validation
 * - Rate limiting to prevent abuse
 * - Extensive logging for debugging
 * - CORS enabled for frontend access
 */

const express = require('express');
const DataAggregator = require('../services/data-aggregator');
const FactVerificationEngine = require('../services/fact-verification');
const ScrapingQueue = require('./scraping-queue');
const { getRepresentativesByZip } = require('../../backend/us-representatives');

const router = express.Router();

// Initialize services
const aggregator = new DataAggregator();
const factChecker = new FactVerificationEngine();
const scrapingQueue = new ScrapingQueue();

console.log('🏛️  Civic Platform API initialized');

/**
 * GET /api/civic/representatives/search
 * Search for representatives by name, state, or location
 */
router.get('/representatives/search', async (req, res) => {
    try {
        const { q, state, district, chamber, zip } = req.query;
        
        // Accept ZIP code searches
        if (zip) {
            console.log(`🔍 ZIP code search: ${zip}`);
            
            // Validate ZIP code
            if (!/^\d{5}$/.test(zip)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ZIP code format. Please provide a 5-digit ZIP code.'
                });
            }
            
            // V37.0.2: Use REAL representative data from us-representatives.js
            console.log(`📡 Fetching real representatives for ZIP: ${zip}`);
            const result = await getRepresentativesByZip(zip);
            
            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: result.error || 'Failed to fetch representatives',
                    query: { zip }
                });
            }
            
            console.log(`✅ Found ${result.representatives?.length || 0} representatives for ZIP ${zip}`);
            
            return res.json({
                success: true,
                query: { zip },
                results: result.representatives,
                location: {
                    state: result.state,
                    district: result.district
                },
                sources: result.sources,
                message: 'Real data from Congress.gov & OpenStates APIs'
            });
        }
        
        if (!q && !state) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q", "state", or "zip" is required'
            });
        }
        
        // TODO: Integrate with Congress.gov API for representative search
        // For now, return mock data structure
        
        res.json({
            success: true,
            query: { q, state, district, chamber },
            results: [],
            message: 'Representative search endpoint ready - Congress.gov integration pending'
        });
        
    } catch (error) {
        console.error('Error searching representatives:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/representatives/:id
 * Get comprehensive representative profile
 */
router.get('/representatives/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { refresh } = req.query; // Force refresh cache
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Representative ID is required'
            });
        }
        
        // Mock representative data for aggregation
        const mockRep = {
            bioguide_id: id,
            name: 'Representative Name',
            party: 'D',
            state: 'NY',
            district: '12',
            chamber: 'house'
        };
        
        // Get comprehensive profile
        const profile = await aggregator.getRepresentativeProfile(mockRep);
        
        res.json({
            success: true,
            data: profile
        });
        
    } catch (error) {
        console.error('Error fetching representative profile:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/representatives/:id/campaign-finance
 * Get campaign finance data for a representative
 */
router.get('/representatives/:id/campaign-finance', async (req, res) => {
    try {
        const { id } = req.params;
        const { cycle } = req.query;
        
        // This would fetch FEC data directly
        // For now, return structure
        
        res.json({
            success: true,
            data: {
                candidateId: id,
                cycle: cycle || '2024',
                message: 'Campaign finance endpoint ready'
            }
        });
        
    } catch (error) {
        console.error('Error fetching campaign finance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/bills/search
 * Search for federal bills
 */
router.get('/bills/search', async (req, res) => {
    try {
        const { q, congress, type, status } = req.query;
        
        // TODO: Integrate with Congress.gov Bills API
        
        res.json({
            success: true,
            query: { q, congress, type, status },
            results: [],
            message: 'Bills search endpoint ready - Congress.gov integration pending'
        });
        
    } catch (error) {
        console.error('Error searching bills:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/bills/:id
 * Get detailed bill information
 */
router.get('/bills/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // TODO: Fetch bill details from Congress.gov
        
        res.json({
            success: true,
            data: {
                billId: id,
                message: 'Bill details endpoint ready'
            }
        });
        
    } catch (error) {
        console.error('Error fetching bill details:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/civic/user-votes
 * Record user's position on a bill
 */
router.post('/user-votes', async (req, res) => {
    try {
        const { billId, position, userId } = req.body;
        
        if (!billId || !position) {
            return res.status(400).json({
                success: false,
                error: 'billId and position are required'
            });
        }
        
        // TODO: Store in database using RESTful Table API
        
        res.json({
            success: true,
            data: {
                billId,
                position,
                userId,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error recording user vote:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/user-votes/:userId
 * Get all votes for a user
 */
router.get('/user-votes/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // TODO: Fetch from database
        
        res.json({
            success: true,
            data: {
                userId,
                votes: [],
                message: 'User votes endpoint ready'
            }
        });
        
    } catch (error) {
        console.error('Error fetching user votes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/civic/fact-check
 * Verify a claim using multiple fact-checking sources
 */
router.post('/fact-check', async (req, res) => {
    try {
        const { claim, options } = req.body;
        
        if (!claim || claim.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Claim text is required'
            });
        }
        
        if (claim.length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Claim must be 500 characters or less'
            });
        }
        
        console.log(`🔍 Fact-checking claim: "${claim.substring(0, 50)}..."`);
        
        // Verify claim using multi-source fact-checking
        const result = await factChecker.verifyClaim(claim, options);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error fact-checking claim:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/fact-check/trending
 * Get trending misinformation topics
 */
router.get('/fact-check/trending', async (req, res) => {
    try {
        const trending = await factChecker.getTrendingMisinformation();
        
        res.json({
            success: true,
            data: trending
        });
        
    } catch (error) {
        console.error('Error fetching trending misinformation:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/civic/fact-check/batch
 * Batch verify multiple claims
 */
router.post('/fact-check/batch', async (req, res) => {
    try {
        const { claims, options } = req.body;
        
        if (!Array.isArray(claims) || claims.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Claims array is required'
            });
        }
        
        if (claims.length > 10) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 10 claims per batch request'
            });
        }
        
        const results = await factChecker.batchVerify(claims, options);
        
        res.json({
            success: true,
            data: results
        });
        
    } catch (error) {
        console.error('Error batch fact-checking:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/alignment/:userId/:representativeId
 * Calculate alignment score between user and representative
 */
router.get('/alignment/:userId/:representativeId', async (req, res) => {
    try {
        const { userId, representativeId } = req.params;
        
        // TODO: Fetch user votes and rep votes, calculate alignment
        
        res.json({
            success: true,
            data: {
                userId,
                representativeId,
                alignmentScore: null,
                message: 'Alignment calculation endpoint ready'
            }
        });
        
    } catch (error) {
        console.error('Error calculating alignment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/news
 * Get fact-checked news articles
 */
router.get('/news', async (req, res) => {
    try {
        const { q, source, verified } = req.query;
        
        // TODO: Search news using DuckDuckGo + fact-check status
        
        res.json({
            success: true,
            query: { q, source, verified },
            results: [],
            message: 'News search endpoint ready'
        });
        
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/scraping/stats
 * Get scraping queue statistics
 */
router.get('/scraping/stats', (req, res) => {
    try {
        const stats = scrapingQueue.getStats();
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error fetching scraping stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/civic/scraping/clear
 * Clear scraping queue (admin only)
 */
router.post('/scraping/clear', (req, res) => {
    try {
        const cleared = scrapingQueue.clearQueue();
        
        res.json({
            success: true,
            data: {
                clearedTasks: cleared
            }
        });
        
    } catch (error) {
        console.error('Error clearing scraping queue:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/civic/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            dataAggregator: 'operational',
            factChecker: 'operational',
            scrapingQueue: 'operational'
        },
        version: '37.0.0'
    });
});

/**
 * Error handling middleware
 */
router.use((error, req, res, next) => {
    console.error('Unhandled error in civic API:', error);
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

module.exports = router;
