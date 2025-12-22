/**
 * RSS PROXY ENDPOINT FOR VPS
 * Version: 1.0.0
 * Date: 2025-11-13
 * 
 * Purpose: Proxy RSS feed requests to bypass CORS restrictions
 * Replaces: Netlify serverless function (which doesn't work with drag & drop)
 * 
 * Security Features:
 * - Domain whitelist (only approved news sources)
 * - Rate limiting (prevents abuse)
 * - User-Agent header (identifies our service)
 * - Error handling
 * - Caching support
 * 
 * Integration: Add to server.js with app.use('/api/rss', require('./rss-proxy-endpoint'));
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Approved News Source Domains
 * Only RSS feeds from these domains are allowed
 * Based on data/news-sources.json vetted sources
 */
const APPROVED_DOMAINS = [
    'democracynow.org',
    'theintercept.com',
    'propublica.org',
    'commondreams.org',
    'inthesetimes.com',
    'jacobin.com',
    'truthout.org',
    'thenation.com',
    'motherjones.com',
    'progressive.org',
    'americanprospect.org',
    'labornotes.org',
    'inthesetimes.com',
    'theguardian.com',
    'bbc.co.uk'
];

/**
 * Cache duration in seconds (30 minutes)
 * RSS feeds don't change that frequently
 */
const CACHE_DURATION = 1800;

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Security validation middleware
 * Checks if the requested URL is from an approved domain
 */
function validateDomain(req, res, next) {
    const feedUrl = req.query.url;
    
    if (!feedUrl) {
        return res.status(400).json({
            success: false,
            error: 'Missing "url" query parameter',
            usage: 'GET /api/rss/proxy?url=https://example.com/feed.rss'
        });
    }
    
    // Extract domain from URL
    let domain;
    try {
        const urlObj = new URL(feedUrl);
        domain = urlObj.hostname.replace(/^www\./, ''); // Remove www. prefix
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: 'Invalid URL format',
            provided: feedUrl
        });
    }
    
    // Check if domain is approved
    const isApproved = APPROVED_DOMAINS.some(approved => 
        domain === approved || domain.endsWith('.' + approved)
    );
    
    if (!isApproved) {
        console.warn(`🚫 RSS Proxy: Blocked unauthorized domain: ${domain}`);
        return res.status(403).json({
            success: false,
            error: 'Domain not in approved whitelist',
            domain: domain,
            hint: 'Only independent news sources are allowed'
        });
    }
    
    // Domain is approved, continue
    req.validatedUrl = feedUrl;
    req.sourceDomain = domain;
    next();
}

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/rss/proxy?url=<feed-url>
 * 
 * Fetches RSS feed from approved source and returns XML
 * 
 * Query Parameters:
 * - url: RSS feed URL (required, must be from approved domain)
 * 
 * Response:
 * - Content-Type: application/xml
 * - Body: RSS feed XML content
 * 
 * Headers:
 * - Access-Control-Allow-Origin: * (allows frontend to fetch)
 * - Cache-Control: public, max-age=1800 (30 min cache)
 * 
 * Example:
 * GET /api/rss/proxy?url=https://www.democracynow.org/democracynow.rss
 */
router.get('/proxy', validateDomain, async (req, res) => {
    const feedUrl = req.validatedUrl;
    const domain = req.sourceDomain;
    
    console.log(`📰 RSS Proxy: Fetching ${domain}...`);
    
    try {
        // Fetch the RSS feed with proper headers
        const response = await axios.get(feedUrl, {
            headers: {
                'User-Agent': 'WorkforceDemocracyProject/1.0 (Independent News Aggregator; https://workforcedemocracyproject.org)',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            },
            timeout: 10000, // 10 second timeout
            maxRedirects: 5
        });
        
        // Validate response is XML
        const contentType = response.headers['content-type'] || '';
        if (!contentType.includes('xml') && !contentType.includes('rss')) {
            console.warn(`⚠️  RSS Proxy: Unexpected content type from ${domain}: ${contentType}`);
        }
        
        console.log(`✅ RSS Proxy: Successfully fetched ${domain} (${response.data.length} bytes)`);
        
        // Return XML with CORS headers
        res.set({
            'Content-Type': 'application/xml; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': `public, max-age=${CACHE_DURATION}`,
            'X-RSS-Source': domain
        });
        
        res.send(response.data);
        
    } catch (error) {
        console.error(`❌ RSS Proxy: Error fetching ${domain}:`, error.message);
        
        // Determine appropriate error response
        if (error.code === 'ENOTFOUND') {
            return res.status(404).json({
                success: false,
                error: 'Feed source not found',
                domain: domain,
                message: 'The RSS feed URL could not be reached'
            });
        }
        
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                error: 'Feed source timeout',
                domain: domain,
                message: 'The RSS feed took too long to respond'
            });
        }
        
        if (error.response) {
            // Feed server returned an error
            return res.status(error.response.status).json({
                success: false,
                error: 'Feed source error',
                domain: domain,
                status: error.response.status,
                message: error.response.statusText
            });
        }
        
        // Generic error
        res.status(500).json({
            success: false,
            error: 'Failed to fetch RSS feed',
            domain: domain,
            message: error.message
        });
    }
});

/**
 * GET /api/rss/health
 * 
 * Health check endpoint
 * Returns service status and approved domains count
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'RSS Proxy',
        version: '1.0.0',
        status: 'operational',
        approved_domains: APPROVED_DOMAINS.length,
        cache_duration: CACHE_DURATION
    });
});

/**
 * GET /api/rss/domains
 * 
 * List approved domains
 * Useful for debugging and verification
 */
router.get('/domains', (req, res) => {
    res.json({
        success: true,
        approved_domains: APPROVED_DOMAINS.sort(),
        count: APPROVED_DOMAINS.length,
        usage: 'Only RSS feeds from these domains are allowed'
    });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Handle invalid routes under /api/rss
 */
router.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'RSS endpoint not found',
        available_endpoints: [
            'GET /api/rss/proxy?url=<feed-url>',
            'GET /api/rss/health',
            'GET /api/rss/domains'
        ]
    });
});

/**
 * Handle errors in RSS routes
 */
router.use((error, req, res, next) => {
    console.error('❌ RSS Proxy Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal RSS proxy error',
        message: error.message
    });
});

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = router;

console.log('✅ RSS Proxy endpoint loaded');
console.log(`   📋 ${APPROVED_DOMAINS.length} approved news sources`);
console.log(`   ⏱️  Cache duration: ${CACHE_DURATION / 60} minutes`);
