/**
 * Charity Navigator API Service
 * Workforce Democracy Project - Phase 2
 * 
 * Fetches nonprofit ratings and accountability data
 * Free API for civic projects: https://charity.3scale.net/
 */

const fetch = require('node-fetch');

const CHARITY_NAVIGATOR_API = {
    BASE_URL: 'https://api.charitynavigator.org/v2',
    APP_ID: process.env.CHARITY_NAVIGATOR_APP_ID || '',
    APP_KEY: process.env.CHARITY_NAVIGATOR_APP_KEY || ''
};

/**
 * Check if API credentials are configured
 * @returns {boolean}
 */
function isConfigured() {
    return !!(CHARITY_NAVIGATOR_API.APP_ID && CHARITY_NAVIGATOR_API.APP_KEY);
}

/**
 * Search Charity Navigator by EIN
 * @param {string} ein - Organization EIN (Tax ID)
 * @returns {Promise<Object|null>} - Rating data or null if not found/error
 */
async function getCharityByEIN(ein) {
    if (!isConfigured()) {
        console.warn('Charity Navigator API not configured - skipping rating lookup');
        return null;
    }
    
    try {
        const url = `${CHARITY_NAVIGATOR_API.BASE_URL}/Organizations?ein=${ein}`;
        
        const response = await fetch(url, {
            headers: {
                'app_id': CHARITY_NAVIGATOR_API.APP_ID,
                'app_key': CHARITY_NAVIGATOR_API.APP_KEY
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`No Charity Navigator rating found for EIN ${ein} (not rated)`);
                return null;
            }
            console.warn(`Charity Navigator API error for EIN ${ein}:`, response.status);
            return null;
        }
        
        const data = await response.json();
        
        // Return first result (EIN should be unique)
        if (data && data.length > 0) {
            console.log(`✅ Found Charity Navigator rating for EIN ${ein}: ${data[0].currentRating?.rating || 0} stars`);
            return data[0];
        }
        
        console.log(`No Charity Navigator data for EIN ${ein}`);
        return null;
        
    } catch (error) {
        console.error('Charity Navigator fetch error:', error);
        return null;
    }
}

/**
 * Get overall star rating (0-4)
 * @param {Object} charityData - Charity Navigator data
 * @returns {number} - Star rating (0-4)
 */
function getOverallRating(charityData) {
    if (!charityData || !charityData.currentRating) return 0;
    return charityData.currentRating.rating || 0;
}

/**
 * Get financial rating (0-4)
 * @param {Object} charityData - Charity Navigator data
 * @returns {number} - Financial health rating
 */
function getFinancialRating(charityData) {
    if (!charityData || !charityData.currentRating) return 0;
    return charityData.currentRating.financialRating?.rating || 0;
}

/**
 * Get accountability rating (0-4)
 * @param {Object} charityData - Charity Navigator data
 * @returns {number} - Accountability & transparency rating
 */
function getAccountabilityRating(charityData) {
    if (!charityData || !charityData.currentRating) return 0;
    return charityData.currentRating.accountabilityRating?.rating || 0;
}

/**
 * Determine rating status and user message
 * @param {Object} charityData - Charity Navigator data
 * @returns {Object} - {status, message, userShouldKnow}
 */
function getRatingStatus(charityData) {
    if (!charityData) {
        return {
            status: 'unrated',
            message: 'This organization has not been rated by Charity Navigator yet.',
            userShouldKnow: 'This doesn\'t mean the organization isn\'t trustworthy - many small, local, or newer nonprofits aren\'t rated. We still include them to ensure you have access to community resources.',
            showWarning: false
        };
    }
    
    const rating = getOverallRating(charityData);
    
    if (rating >= 3) {
        return {
            status: 'good',
            message: `Highly rated by Charity Navigator (${rating}/4 stars)`,
            userShouldKnow: 'This organization demonstrates strong financial health and accountability.',
            showWarning: false
        };
    } else if (rating === 2) {
        return {
            status: 'fair',
            message: `Rated ${rating}/4 stars by Charity Navigator`,
            userShouldKnow: 'This rating indicates the organization meets basic standards but may have room for improvement in financial health or accountability. We include them because they may still provide valuable community services.',
            showWarning: true
        };
    } else if (rating === 1) {
        return {
            status: 'poor',
            message: `Low rating: ${rating}/4 stars by Charity Navigator`,
            userShouldKnow: 'This low rating may indicate concerns about financial health, accountability, or transparency. Please review the full Charity Navigator report before donating or engaging with this organization.',
            showWarning: true
        };
    } else {
        return {
            status: 'unrated',
            message: 'Rating information not available',
            userShouldKnow: 'We include unrated organizations to ensure comprehensive community resource access.',
            showWarning: false
        };
    }
}

/**
 * Check if charity meets quality threshold (≥3 stars OR unrated)
 * @param {Object} charityData - Charity Navigator data
 * @returns {boolean}
 */
function meetsQualityThreshold(charityData) {
    if (!charityData) return true; // Include unrated orgs
    
    const rating = getOverallRating(charityData);
    return rating >= 3 || rating === 0; // ≥3 stars or unrated
}

/**
 * Get Charity Navigator profile URL
 * @param {string} ein - Organization EIN
 * @returns {string} - Full URL to Charity Navigator profile
 */
function getCharityNavigatorURL(ein) {
    return `https://www.charitynavigator.org/ein/${ein}`;
}

/**
 * Get user review/feedback URL for Charity Navigator
 * @param {string} ein - Organization EIN
 * @returns {string} - URL for users to leave reviews
 */
function getUserReviewURL(ein) {
    // Charity Navigator doesn't have direct review URLs, but users can click through to the profile
    // and use the "Report a Concern" feature
    return `https://www.charitynavigator.org/ein/${ein}#how-to-help`;
}

module.exports = {
    isConfigured,
    getCharityByEIN,
    getOverallRating,
    getFinancialRating,
    getAccountabilityRating,
    getRatingStatus,
    meetsQualityThreshold,
    getCharityNavigatorURL,
    getUserReviewURL
};
