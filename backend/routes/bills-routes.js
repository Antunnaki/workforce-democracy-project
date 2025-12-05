/**
 * WORKFORCE DEMOCRACY PROJECT - Bills API Routes
 * Version: 37.16.1-PRIVACY-FIRST-SHARED-UTILITY
 * Date: November 22, 2025
 * 
 * Provides bills by location (ZIP code) using:
 * - Congress.gov API for federal bills
 * - OpenStates API for state bills
 * - Shared Location Lookup Utility (Privacy-First ZIP mapping)
 * 
 * PHILOSOPHY: No Big Tech tracking - uses offline Census data + ethical government APIs only
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { lookupZipCode } = require('../utils/location-lookup');

// API Configuration from environment variables
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;

// API Base URLs
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
const OPENSTATES_API_BASE = 'https://v3.openstates.org';
const FCC_AREA_API = 'https://geo.fcc.gov/api/census';

// PRIVACY NOTE: Google Civic API removed - we use offline packages instead

// Bill categories mapping
const BILL_CATEGORIES = {
    'education': ['education', 'school', 'student', 'college', 'university', 'learning'],
    'healthcare': ['health', 'medical', 'medicare', 'medicaid', 'insurance', 'hospital'],
    'environment': ['environment', 'climate', 'energy', 'pollution', 'conservation', 'renewable'],
    'economy': ['economy', 'economic', 'tax', 'budget', 'finance', 'fiscal', 'trade'],
    'rights': ['rights', 'civil', 'voting', 'equality', 'discrimination', 'justice'],
    'labor': ['labor', 'worker', 'employment', 'wage', 'union', 'workplace', 'job'],
    'housing': ['housing', 'rent', 'affordable', 'homeless', 'tenant', 'mortgage']
};

// =============================================================================
// ZIP CODE TO LOCATION MAPPING
// =============================================================================

/**
 * Convert ZIP code to state and congressional district
 * V37.16.1: NOW USES SHARED LOCATION UTILITY - Privacy-First!
 * 
 * PRIVACY-FIRST: Uses offline Census data + ethical government APIs only
 * NO GOOGLE TRACKING - Aligns with zero-knowledge encryption philosophy
 * 
 * @param {string} zipCode - 5-digit ZIP code
 * @returns {Promise<object>} - { state: 'NY', district: '20', city, lat, lon, source }
 */
async function zipToLocation(zipCode) {
    console.log(`🔍 [BILLS-API] ZIP→Location lookup for ${zipCode} (using shared utility)...`);
    
    // Use shared location lookup utility
    const location = await lookupZipCode(zipCode);
    
    if (!location.success) {
        console.warn(`⚠️  [BILLS-API] Location lookup failed: ${location.error}`);
        return {
            state: null,
            district: null,
            zipCode,
            source: 'error'
        };
    }
    
    console.log(`✅ [BILLS-API] ZIP ${zipCode} → ${location.state}${location.district ? `-${location.district}` : ''} (${location.source})`);
    
    // Return in the format expected by this module
    return {
        state: location.state,
        district: location.district,
        city: location.city,
        lat: location.lat,
        lon: location.lon,
        source: location.source
    };
}

// =============================================================================
// FEDERAL BILLS (Congress.gov API)
// =============================================================================

/**
 * Fetch recent federal bills from Congress.gov
 * V37.12.9: NOW FETCHES BILL DETAILS to get sponsor names!
 * @param {number} limit - Number of bills to fetch
 * @returns {Promise<array>} - Array of bill objects
 */
async function fetchFederalBills(limit = 20) {
    try {
        if (!CONGRESS_API_KEY) {
            console.warn('⚠️  CONGRESS_API_KEY not configured');
            return [];
        }

        console.log(`📡 [Federal Bills] Fetching from Congress.gov...`);

        // Step 1: Fetch recent bills list from current Congress (118th = 2023-2025)
        const response = await axios.get(`${CONGRESS_API_BASE}/bill/118`, {
            params: {
                format: 'json',
                api_key: CONGRESS_API_KEY,
                limit: limit,
                offset: 0,
                sort: 'updateDate+desc'
            },
            timeout: 10000
        });

        if (!response.data || !response.data.bills) {
            console.warn('⚠️  No bills returned from Congress.gov');
            return [];
        }

        console.log(`📋 [Federal Bills] Got ${response.data.bills.length} bills from list endpoint`);
        console.log(`🔍 [Federal Bills] Now fetching DETAILS for each bill to get sponsors...`);

        // Step 2: Fetch details for each bill (in parallel) to get sponsor names
        const detailPromises = response.data.bills.map(async (bill) => {
            try {
                const billType = bill.type.toLowerCase();
                const detailUrl = `${CONGRESS_API_BASE}/bill/118/${billType}/${bill.number}`;
                
                const detailResponse = await axios.get(detailUrl, {
                    params: {
                        api_key: CONGRESS_API_KEY,
                        format: 'json'
                    },
                    timeout: 5000
                });

                if (!detailResponse.data || !detailResponse.data.bill) {
                    throw new Error('No detail data returned');
                }

                const fullBill = detailResponse.data.bill;

                // Extract sponsor data
                let sponsorName = 'Unknown';
                if (fullBill.sponsors && fullBill.sponsors.length > 0) {
                    const sponsor = fullBill.sponsors[0];
                    // Format: "Rep. John Smith (D-CA-12)" or "Sen. Jane Doe (R-TX)"
                    const title = sponsor.isByRequest === 'N' ? 
                        (fullBill.originChamber === 'House' ? 'Rep.' : 'Sen.') : '';
                    const party = sponsor.party ? sponsor.party.charAt(0) : '';
                    const state = sponsor.state || '';
                    const district = sponsor.district ? `-${sponsor.district}` : '';
                    sponsorName = `${title} ${sponsor.firstName || ''} ${sponsor.lastName || sponsor.fullName || 'Unknown'}`.trim();
                    if (party && state) {
                        sponsorName += ` (${party}-${state}${district})`;
                    }
                }

                console.log(`  ✓ ${bill.type}${bill.number}: ${sponsorName}`);

                return {
                    id: `${bill.type}${bill.number}`,
                    title: fullBill.title || bill.title,
                    description: fullBill.title || bill.title,
                    status: fullBill.latestAction?.text || bill.latestAction?.text || 'Introduced',
                    level: 'federal',
                    chamber: fullBill.originChamber === 'House' ? 'house' : 'senate',
                    sponsor: sponsorName,
                    cosponsors: fullBill.cosponsors?.length || 0,
                    introduced_date: fullBill.introducedDate || bill.introducedDate,
                    last_action: fullBill.latestAction?.actionDate || bill.latestAction?.actionDate,
                    url: `https://www.congress.gov/bill/118/${billType}-${bill.number}`,
                    category: categorizeBill(fullBill.title || bill.title)
                };

            } catch (err) {
                console.warn(`  ⚠️  Failed to fetch details for ${bill.type}${bill.number}:`, err.message);
                // Fallback to basic data from list endpoint (will show "Unknown" sponsor)
                return {
                    id: `${bill.type}${bill.number}`,
                    title: bill.title,
                    description: bill.title,
                    status: bill.latestAction?.text || 'Introduced',
                    level: 'federal',
                    chamber: bill.originChamber === 'House' ? 'house' : 'senate',
                    sponsor: 'Unknown',
                    cosponsors: 0,
                    introduced_date: bill.introducedDate,
                    last_action: bill.latestAction?.actionDate,
                    url: `https://www.congress.gov/bill/118/${bill.type.toLowerCase()}-${bill.number}`,
                    category: categorizeBill(bill.title)
                };
            }
        });

        // Wait for all detail requests to complete (in parallel for speed)
        const bills = await Promise.all(detailPromises);

        console.log(`✅ [Federal Bills] Fetched ${bills.length} bills WITH SPONSOR DATA`);
        return bills;

    } catch (error) {
        console.error('❌ Federal Bills API Error:', error.message);
        return [];
    }
}

// =============================================================================
// BILL FILTERING (State-Based Relevance)
// =============================================================================

/**
 * Filter federal bills to prioritize user's state representatives
 * Shows bills from user's state FIRST, then others
 * @param {array} bills - Array of bill objects
 * @param {string} state - User's state (e.g., 'NY')
 * @param {string} district - User's congressional district (e.g., '20')
 * @returns {array} - Sorted bills (state-relevant first)
 */
function filterBillsByState(bills, state, district) {
    if (!state || !bills || bills.length === 0) return bills;

    console.log(`🎯 [Bills Filter] Prioritizing bills for ${state}${district ? '-' + district : ''}...`);

    // Sort bills: State-sponsored first, then others
    const sorted = bills.sort((a, b) => {
        // Check if sponsor is from user's state
        const aFromState = a.sponsor && (
            a.sponsor.includes(`-${state}`) ||
            a.sponsor.includes(`(${state}`) ||
            a.sponsor.toLowerCase().includes(state.toLowerCase())
        );
        const bFromState = b.sponsor && (
            b.sponsor.includes(`-${state}`) ||
            b.sponsor.includes(`(${state}`) ||
            b.sponsor.toLowerCase().includes(state.toLowerCase())
        );
        
        // State bills first
        if (aFromState && !bFromState) return -1;
        if (!aFromState && bFromState) return 1;
        
        // Then sort by date
        const dateA = new Date(a.last_action || a.introduced_date);
        const dateB = new Date(b.last_action || b.introduced_date);
        return dateB - dateA;
    });

    const stateRelevantCount = sorted.filter(b => 
        b.sponsor && (
            b.sponsor.includes(`-${state}`) ||
            b.sponsor.includes(`(${state}`)
        )
    ).length;

    console.log(`✅ [Bills Filter] ${stateRelevantCount}/${bills.length} bills from ${state} representatives (prioritized)`);

    return sorted;
}

// =============================================================================
// STATE BILLS (OpenStates API)
// =============================================================================

/**
 * Fetch state bills from OpenStates API
 * @param {string} state - State abbreviation (e.g., 'CA', 'NY')
 * @param {number} limit - Number of bills to fetch
 * @returns {Promise<array>} - Array of bill objects
 */
async function fetchStateBills(state, limit = 20) {
    try {
        if (!OPENSTATES_API_KEY) {
            console.warn('⚠️  OPENSTATES_API_KEY not configured');
            return [];
        }

        if (!state) {
            console.warn('⚠️  No state provided for state bills lookup');
            return [];
        }

        console.log(`📡 [State Bills] Fetching from OpenStates for ${state}...`);

        const response = await axios.get(`${OPENSTATES_API_BASE}/bills`, {
            headers: {
                'X-API-KEY': OPENSTATES_API_KEY
            },
            params: {
                jurisdiction: state.toLowerCase(),
                sort: 'updated_desc',
                per_page: limit,
                page: 1
            },
            timeout: 10000
        });

        if (!response.data || !response.data.results) {
            console.warn('⚠️  No bills returned from OpenStates');
            return [];
        }

        const bills = response.data.results.map(bill => ({
            id: bill.identifier,
            title: bill.title,
            description: bill.title,
            status: bill.latest_action?.description || 'Introduced',
            level: 'state',
            chamber: bill.from_organization?.classification || 'unknown',
            sponsor: bill.sponsorships?.[0]?.name || 'Unknown',
            introduced_date: bill.created_at,
            last_action: bill.latest_action?.date,
            url: bill.openstates_url || `https://openstates.org/${state}/bills/${bill.identifier}`,
            category: categorizeBill(bill.title)
        }));

        console.log(`✅ [State Bills] Fetched ${bills.length} bills for ${state}`);
        return bills;

    } catch (error) {
        console.error('❌ State Bills API Error:', error.message);
        return [];
    }
}

// =============================================================================
// BILL CATEGORIZATION
// =============================================================================

/**
 * Categorize bill based on title keywords
 * @param {string} title - Bill title
 * @returns {string} - Category name
 */
function categorizeBill(title) {
    if (!title) return 'other';

    const titleLower = title.toLowerCase();

    for (const [category, keywords] of Object.entries(BILL_CATEGORIES)) {
        if (keywords.some(keyword => titleLower.includes(keyword))) {
            return category;
        }
    }

    return 'other';
}

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/bills/location
 * Get bills by ZIP code (federal + state bills)
 */
router.get('/location', async (req, res) => {
    try {
        const { zip, category, level } = req.query;

        if (!zip) {
            return res.status(400).json({
                success: false,
                error: 'ZIP code is required'
            });
        }

        // Validate ZIP code
        if (!/^\d{5}$/.test(zip)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ZIP code format. Must be 5 digits.'
            });
        }

        console.log(`🔍 [Bills API] Fetching bills for ZIP: ${zip}, category: ${category || 'all'}, level: ${level || 'all'}`);

        // Get location data from ZIP
        const location = await zipToLocation(zip);

        // Fetch bills
        let allBills = [];

        // Fetch federal bills if requested
        // V37.17.0: REDUCED from 30 → 10 bills (cost optimization)
        if (!level || level === 'all' || level === 'federal') {
            const federalBills = await fetchFederalBills(10);
            
            // FILTER & PRIORITIZE by user's state (privacy-first approach)
            const filteredFederalBills = filterBillsByState(federalBills, location.state, location.district);
            
            allBills = allBills.concat(filteredFederalBills);
        }

        // Fetch state bills if we have a state and it's requested
        // V37.17.0: REDUCED from 20 → 10 bills (cost optimization)
        if (location.state && (!level || level === 'all' || level === 'state')) {
            const stateBills = await fetchStateBills(location.state, 10);
            allBills = allBills.concat(stateBills);
        }

        // Filter by category if specified
        if (category && category !== 'all') {
            allBills = allBills.filter(bill => bill.category === category);
        }

        // Sort by last action date (newest first)
        allBills.sort((a, b) => {
            const dateA = new Date(a.last_action || a.introduced_date);
            const dateB = new Date(b.last_action || b.introduced_date);
            return dateB - dateA;
        });

        console.log(`✅ [Bills API] Returning ${allBills.length} bills`);

        res.json({
            success: true,
            zip,
            location: {
                state: location.state,
                district: location.district,
                source: location.source
            },
            bills: allBills,
            count: allBills.length,
            source: 'congress.gov + openstates.org',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Bills API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to fetch bills from government APIs'
        });
    }
});

/**
 * GET /api/bills/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        privacy_first: true,
        zip_mapping: 'offline_census_data',
        apis: {
            congress_gov: !!CONGRESS_API_KEY,
            openstates: !!OPENSTATES_API_KEY,
            zip_offline_db: true,
            district_offline_db: true,
            fcc_fallback: true,
            google_tracking: false
        },
        version: '37.13.0-PRIVACY-FIRST-ZIP-MAPPING',
        timestamp: new Date().toISOString()
    });
});

console.log('🏛️  Bills API Routes initialized (v37.13.0-PRIVACY-FIRST)');
console.log('🛡️  ZIP Mapping: Offline Census data (NO Google tracking)');

module.exports = router;
