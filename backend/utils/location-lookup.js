/**
 * WORKFORCE DEMOCRACY PROJECT - Location Lookup Utility
 * Version: 37.16.1-PRIVACY-FIRST-SHARED-UTILITY
 * Date: November 22, 2025
 * 
 * PRIVACY-FIRST ZIP CODE TO LOCATION MAPPING
 * Shared by: Bills API, Representatives API, and all future locality features
 * 
 * PHILOSOPHY: No Big Tech tracking - uses offline Census data + ethical government APIs only
 * - Layer 1: Offline ZIP Database (US Census data, public domain)
 * - Layer 2: FCC API for Congressional District (US Government service, ethical)
 * - NO GOOGLE CIVIC API (removed for privacy)
 * 
 * Data Sources:
 * - 'zipcodes' npm package (offline, US Census ZCTA data)
 * - FCC Area API (https://geo.fcc.gov/api/census)
 * - 'us-congressional-districts' npm package (fallback)
 */

const axios = require('axios');
const zipcodes = require('zipcodes');

// Optional: us-congressional-districts package (if installed)
let usCongressionalDistricts;
try {
    usCongressionalDistricts = require('us-congressional-districts');
    console.log('✅ [Location Lookup] us-congressional-districts package loaded');
} catch (err) {
    console.warn('⚠️  [Location Lookup] us-congressional-districts not installed (optional)');
}

// FCC API Configuration
const FCC_AREA_API = 'https://geo.fcc.gov/api/census';

// Cache for reducing API calls (in-memory)
const locationCache = new Map();
const CACHE_TTL = 365 * 24 * 60 * 60 * 1000; // 1 year (ZIP codes don't change often)

// =============================================================================
// MAIN LOOKUP FUNCTION
// =============================================================================

/**
 * Convert ZIP code to location data (state, district, city, coordinates)
 * PRIVACY-FIRST: Uses offline Census data + ethical government APIs only
 * NO GOOGLE TRACKING - Aligns with zero-knowledge encryption philosophy
 * 
 * @param {string} zipCode - 5-digit ZIP code
 * @returns {Promise<object>} - Location data object
 * 
 * Returns:
 * {
 *   success: true/false,
 *   zipCode: '12061',
 *   state: 'NY',
 *   stateCode: 'NY',
 *   stateName: 'New York',
 *   district: '20',
 *   city: 'Schenectady',
 *   county: 'Schenectady County',
 *   lat: 42.8142,
 *   lon: -73.9396,
 *   source: 'offline_zip_fcc_district',
 *   timestamp: 1732307520000
 * }
 */
async function lookupZipCode(zipCode) {
    try {
        // Validate ZIP code format
        if (!zipCode || !/^\d{5}$/.test(zipCode)) {
            console.error(`❌ [Location Lookup] Invalid ZIP code format: ${zipCode}`);
            return {
                success: false,
                error: 'Invalid ZIP code format. Please provide a 5-digit ZIP code.',
                zipCode
            };
        }

        // Check cache first
        const cacheKey = `zip_${zipCode}`;
        const cached = locationCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log(`✅ [Location Lookup] Cache hit for ${zipCode}`);
            return { ...cached.data, success: true };
        }

        console.log(`🔍 [Location Lookup] Looking up ${zipCode} (🛡️  PRIVACY MODE: Offline)...`);

        // =================================================================
        // LAYER 1: Offline ZIP Database (PRIMARY - US Census data)
        // =================================================================
        const zipData = zipcodes.lookup(zipCode);
        
        if (!zipData) {
            console.warn(`⚠️  [Location Lookup] ZIP ${zipCode} not found in offline database`);
            return {
                success: false,
                error: `ZIP code ${zipCode} not found in database`,
                zipCode,
                source: 'not_found'
            };
        }

        console.log(`✅ [Location Lookup] Found: ${zipData.city}, ${zipData.state} (Offline)`);

        // Base result from offline data
        const result = {
            zipCode,
            state: zipData.state,
            stateCode: zipData.state,
            stateName: getStateName(zipData.state),
            city: zipData.city,
            county: zipData.county || null,
            lat: parseFloat(zipData.latitude),
            lon: parseFloat(zipData.longitude),
            district: null,
            source: 'offline_zip_only',
            timestamp: Date.now()
        };

        // =================================================================
        // LAYER 2: FCC API for Congressional District (US Government)
        // =================================================================
        try {
            const fccResponse = await axios.get(`${FCC_AREA_API}/area`, {
                params: {
                    latitude: zipData.latitude,
                    longitude: zipData.longitude,
                    format: 'json',
                    censusYear: '2020'
                },
                timeout: 5000
            });

            if (fccResponse.data && fccResponse.data.results && fccResponse.data.results[0]) {
                const fccResult = fccResponse.data.results[0];
                result.district = fccResult.congressional_district;
                result.source = 'offline_zip_fcc_district';
                console.log(`✅ [Location Lookup] District: ${result.state}-${result.district} (FCC)`);
            }
        } catch (fccError) {
            console.warn(`⚠️  [Location Lookup] FCC API failed: ${fccError.message}`);
            
            // =================================================================
            // LAYER 3: Fallback to us-congressional-districts package
            // =================================================================
            if (usCongressionalDistricts) {
                try {
                    const district = usCongressionalDistricts.getDistrict(result.lat, result.lon);
                    if (district && district.districtCode) {
                        result.district = district.districtCode.split('-')[1]; // Extract '20' from 'NY-20'
                        result.source = 'offline_zip_us_congressional_districts';
                        console.log(`✅ [Location Lookup] District: ${result.state}-${result.district} (offline package)`);
                    }
                } catch (districtError) {
                    console.warn(`⚠️  [Location Lookup] us-congressional-districts failed: ${districtError.message}`);
                }
            }
        }

        // Cache the result
        locationCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        console.log(`✅ [Location Lookup] Complete for ${zipCode}:`, {
            city: result.city,
            state: result.state,
            district: result.district,
            source: result.source
        });

        return { ...result, success: true };

    } catch (error) {
        console.error('❌ [Location Lookup] Error:', error.message);
        return {
            success: false,
            error: error.message,
            zipCode,
            source: 'error'
        };
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert state code to full state name
 * @param {string} stateCode - Two-letter state code (e.g., 'NY')
 * @returns {string} - Full state name (e.g., 'New York')
 */
function getStateName(stateCode) {
    const STATE_NAMES = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
        'DC': 'District of Columbia', 'PR': 'Puerto Rico'
    };
    
    return STATE_NAMES[stateCode] || stateCode;
}

/**
 * Clear the location cache (useful for testing or manual refresh)
 */
function clearCache() {
    locationCache.clear();
    console.log('🗑️  [Location Lookup] Cache cleared');
}

/**
 * Get cache statistics
 * @returns {object} - Cache stats
 */
function getCacheStats() {
    return {
        size: locationCache.size,
        entries: Array.from(locationCache.keys())
    };
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    lookupZipCode,
    clearCache,
    getCacheStats
};

console.log('✅ [Location Lookup Utility] Loaded - Privacy-First ZIP→Location service ready');
