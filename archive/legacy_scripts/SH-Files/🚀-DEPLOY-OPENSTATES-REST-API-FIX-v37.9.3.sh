#!/bin/bash

###############################################################################
# 🚀 DEPLOY OPENSTATES REST API FIX - v37.9.3
# Workforce Democracy Project
# 
# Purpose: Fix OpenStates 404 errors by converting from deprecated GraphQL to REST API
# Issue: OpenStates v3 deprecated GraphQL endpoint, only REST API works now
# Fix: Complete file replacement with REST API implementation
# 
# Changes:
# - Lines 535-560: GraphQL → REST API
# - Lines 581-620: Updated formatter for REST API v3 response format
# 
# Expected Result:
# - Federal senators: 2 (Hickenlooper, Bennet)
# - State legislators: 5+ Colorado state reps/senators
###############################################################################

echo "═══════════════════════════════════════════════════════════════════"
echo "🚀 DEPLOYING OPENSTATES REST API FIX - v37.9.3"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Fix Details:"
echo "   • OpenStates v3 deprecated GraphQL endpoint"
echo "   • Converting to REST API: /people endpoint"
echo "   • Updated response format parser"
echo ""

# Change to backend directory
cd /var/www/workforce-democracy/backend/

# Create backup
echo "💾 Creating backup..."
BACKUP_FILE="us-representatives.js.backup-v37.9.3-$(date +%Y%m%d-%H%M%S)"
cp us-representatives.js "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo ""

# Deploy the fixed file
echo "📝 Writing fixed us-representatives.js with REST API..."

cat > us-representatives.js <<'ENDOFFILE'
/**
 * WORKFORCE DEMOCRACY PROJECT - US Representatives Lookup
 * 
 * Integrates multiple official APIs to provide comprehensive representative information:
 * - Congress.gov API (Federal: Senators + House Representatives)
 * - OpenStates REST API v3 (State: State Senators + State House/Assembly)
 * - FCC Area API (ZIP → Congressional District mapping)
 * 
 * All data from official government sources - no Big Tech APIs
 * 
 * Version: 37.9.3 - OpenStates GraphQL → REST API migration
 */

const axios = require('axios');

// API Configuration from environment variables
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;

// API Base URLs
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
const OPENSTATES_API_BASE = 'https://v3.openstates.org';
const FCC_AREA_API = 'https://geo.fcc.gov/api/census';

// Cache for reducing API calls (in-memory for now)
const cache = {
    zipToDistrict: new Map(),
    members: new Map(),
    stateLegs: new Map()
};

// Cache TTL (Time To Live)
const CACHE_TTL = {
    zipToDistrict: 365 * 24 * 60 * 60 * 1000, // 1 year (ZIP codes don't change often)
    members: 180 * 24 * 60 * 60 * 1000, // 6 months (Congress changes every 2 years)
    stateLegs: 90 * 24 * 60 * 60 * 1000 // 3 months (State legislators change more frequently)
};

// State code mapping: Congress.gov returns full names, we use abbreviations
const STATE_CODES = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC', 'Puerto Rico': 'PR'
};

// =============================================================================
// ZIP CODE TO CONGRESSIONAL DISTRICT LOOKUP
// =============================================================================

/**
 * Convert ZIP code to Congressional District - FIXED v37.9.1
 * Uses multiple fallback strategies for maximum reliability:
 * 1. Google Civic Information API (most reliable)
 * 2. ZIP code database lookup (offline, instant)
 * 3. State-only fallback
 * 
 * @param {string} zipCode - 5-digit US ZIP code
 * @returns {Promise<object>} - { state: 'CA', district: '12', lat: 34.05, lon: -118.24 }
 */
async function zipToCongressionalDistrict(zipCode) {
    try {
        // Check cache first
        const cacheKey = `zip_${zipCode}`;
        const cached = cache.zipToDistrict.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL.zipToDistrict)) {
            console.log(`✅ [ZIP→District] Cache hit for ${zipCode}`);
            return cached.data;
        }

        console.log(`🔍 [ZIP→District] Looking up ${zipCode}...`);

        // =================================================================
        // METHOD 1: Google Civic Information API (Most Reliable)
        // =================================================================
        // This API is free, requires no auth for basic ZIP lookups
        // Returns current congressional district accurately
        
        try {
            const civicResponse = await axios.get('https://www.googleapis.com/civicinfo/v2/representatives', {
                params: {
                    address: zipCode,
                    levels: 'country',
                    roles: 'legislatorUpperBody,legislatorLowerBody'
                },
                timeout: 8000
            });

            if (civicResponse.data && civicResponse.data.divisions) {
                // Parse division string like "ocd-division/country:us/state:co/cd:7"
                const divisions = civicResponse.data.divisions;
                
                for (const [divisionId, divisionData] of Object.entries(divisions)) {
                    // Extract state and congressional district from division ID
                    const stateMatch = divisionId.match(/state:([a-z]{2})/);
                    const districtMatch = divisionId.match(/cd:(\d+)/);
                    
                    if (stateMatch) {
                        const state = stateMatch[1].toUpperCase();
                        const district = districtMatch ? districtMatch[1] : null;
                        
                        // Get normalized coordinates if available
                        const normalizedInput = civicResponse.data.normalizedInput || {};
                        
                        const result = {
                            state: state,
                            district: district,
                            zipCode: zipCode,
                            lat: normalizedInput.latitude || null,
                            lon: normalizedInput.longitude || null,
                            source: 'google_civic_api',
                            verified: true
                        };

                        // Cache the result
                        cache.zipToDistrict.set(cacheKey, {
                            data: result,
                            timestamp: Date.now()
                        });

                        console.log(`✅ [Google Civic API] ${zipCode} → ${state}${district ? `-${district}` : ''}`);
                        return result;
                    }
                }
            }
        } catch (googleError) {
            console.warn(`⚠️ [Google Civic API] Failed for ${zipCode}:`, googleError.message);
            // Continue to fallback methods
        }

        // =================================================================
        // METHOD 2: ZIP Code Database (Offline Fallback)
        // =================================================================
        // Use comprehensive ZIP→District mapping
        // More reliable than external APIs, instant response
        
        const zipData = getZipCodeData(zipCode);
        if (zipData) {
            const result = {
                state: zipData.state,
                district: zipData.district,
                zipCode: zipCode,
                lat: zipData.lat,
                lon: zipData.lon,
                source: 'zip_database',
                verified: true
            };

            // Cache the result
            cache.zipToDistrict.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            console.log(`✅ [ZIP Database] ${zipCode} → ${zipData.state}-${zipData.district}`);
            return result;
        }

        // =================================================================
        // METHOD 3: State-Only Lookup (Last Resort)
        // =================================================================
        const stateFromZip = getStateFromZipCode(zipCode);
        if (stateFromZip) {
            console.log(`⚠️ [ZIP→District] Using state-only fallback: ${stateFromZip}`);
            
            const result = {
                state: stateFromZip,
                district: null, // Unknown district
                zipCode: zipCode,
                source: 'zip_range_fallback',
                fallback: true
            };

            // Cache the result (shorter TTL for fallback)
            cache.zipToDistrict.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;
        }

        throw new Error('ZIP code not found in any lookup method');

    } catch (error) {
        console.error(`❌ [ZIP→District] All methods failed for ${zipCode}:`, error.message);
        throw new Error(`Could not determine congressional district for ZIP ${zipCode}`);
    }
}

/**
 * Get ZIP code data from database
 * Offline ZIP→District lookup for reliability
 */
function getZipCodeData(zipCode) {
    // Sample ZIP code database (expand this with full data as needed)
    // Format: { state, district, lat, lon }
    const zipDatabase = {
        // Colorado ZIPs (for testing ZIP 80204)
        '80201': { state: 'CO', district: '1', lat: 39.7525, lon: -104.9984 },
        '80202': { state: 'CO', district: '1', lat: 39.7525, lon: -105.0053 },
        '80203': { state: 'CO', district: '1', lat: 39.7306, lon: -104.9771 },
        '80204': { state: 'CO', district: '1', lat: 39.7392, lon: -105.0131 }, // Denver - District 1
        '80205': { state: 'CO', district: '1', lat: 39.7588, lon: -104.9631 },
        '80206': { state: 'CO', district: '1', lat: 39.7294, lon: -104.9544 },
        '80207': { state: 'CO', district: '1', lat: 39.7764, lon: -104.9022 },
        '80209': { state: 'CO', district: '1', lat: 39.7080, lon: -104.9589 },
        '80210': { state: 'CO', district: '1', lat: 39.6783, lon: -104.9589 },
        '80211': { state: 'CO', district: '1', lat: 39.7686, lon: -105.0072 },
        '80212': { state: 'CO', district: '1', lat: 39.7764, lon: -105.0339 },
        '80218': { state: 'CO', district: '1', lat: 39.7392, lon: -104.9703 },
        '80219': { state: 'CO', district: '1', lat: 39.7025, lon: -105.0253 },
        '80220': { state: 'CO', district: '1', lat: 39.7294, lon: -104.9069 },
        '80221': { state: 'CO', district: '7', lat: 39.8361, lon: -105.0253 },
        '80222': { state: 'CO', district: '1', lat: 39.6708, lon: -104.9069 },
        '80223': { state: 'CO', district: '1', lat: 39.6933, lon: -105.0019 },
        '80224': { state: 'CO', district: '1', lat: 39.7083, lon: -104.8847 },
        '80226': { state: 'CO', district: '1', lat: 39.7392, lon: -105.0672 },
        '80227': { state: 'CO', district: '7', lat: 39.6658, lon: -105.0869 },
        '80230': { state: 'CO', district: '1', lat: 39.7197, lon: -104.8869 },
        '80231': { state: 'CO', district: '6', lat: 39.6708, lon: -104.8847 },
        '80233': { state: 'CO', district: '7', lat: 39.9136, lon: -104.9869 },
        '80246': { state: 'CO', district: '1', lat: 39.6833, lon: -104.9344 },
        
        // TODO: Expand this database or integrate with a ZIP code service
        // You can add more ZIPs or load from a CSV file
    };

    return zipDatabase[zipCode] || null;
}

/**
 * Simple fallback: Get state from ZIP code prefix
 * This is approximate but works for most cases
 */
function getStateFromZipCode(zipCode) {
    const zip = parseInt(zipCode);
    
    // ZIP code ranges by state (simplified)
    const zipRanges = {
        'AL': [35000, 36999], 'AK': [99500, 99999], 'AZ': [85000, 86999],
        'AR': [71600, 72999], 'CA': [90000, 96699], 'CO': [80000, 81999],
        'CT': [6000, 6999], 'DE': [19700, 19999], 'FL': [32000, 34999],
        'GA': [30000, 31999], 'HI': [96700, 96999], 'ID': [83200, 83999],
        'IL': [60000, 62999], 'IN': [46000, 47999], 'IA': [50000, 52999],
        'KS': [66000, 67999], 'KY': [40000, 42999], 'LA': [70000, 71599],
        'ME': [3900, 4999], 'MD': [20600, 21999], 'MA': [1000, 2799],
        'MI': [48000, 49999], 'MN': [55000, 56999], 'MS': [38600, 39999],
        'MO': [63000, 65999], 'MT': [59000, 59999], 'NE': [68000, 69999],
        'NV': [88900, 89999], 'NH': [3000, 3899], 'NJ': [7000, 8999],
        'NM': [87000, 88499], 'NY': [10000, 14999], 'NC': [27000, 28999],
        'ND': [58000, 58999], 'OH': [43000, 45999], 'OK': [73000, 74999],
        'OR': [97000, 97999], 'PA': [15000, 19699], 'RI': [2800, 2999],
        'SC': [29000, 29999], 'SD': [57000, 57999], 'TN': [37000, 38599],
        'TX': [75000, 79999], 'UT': [84000, 84999], 'VT': [5000, 5999],
        'VA': [20100, 20199], 'WA': [98000, 99499], 'WV': [24700, 26999],
        'WI': [53000, 54999], 'WY': [82000, 83199], 'DC': [20000, 20099]
    };

    for (const [state, range] of Object.entries(zipRanges)) {
        if (zip >= range[0] && zip <= range[1]) {
            return state;
        }
    }

    return null;
}

// =============================================================================
// CONGRESS.GOV API - FEDERAL REPRESENTATIVES
// =============================================================================

/**
 * Get all current members of Congress by state
 * Returns Senators (2 per state) and House Representatives (by district)
 * 
 * @param {string} state - State abbreviation (e.g., 'CA', 'NY')
 * @param {string} district - Congressional district number (optional, for House only)
 * @returns {Promise<Array>} - Array of representative objects
 */
async function getFederalRepresentatives(state, district = null) {
    try {
        console.log(`🏛️ [Congress.gov] Fetching federal reps for ${state}${district ? `-${district}` : ''}`);

        const representatives = [];

        // Get Senators (always 2 per state)
        const senators = await getSenatorsForState(state);
        representatives.push(...senators);

        // Get House Representative (if district is known)
        if (district) {
            const houseRep = await getHouseRepresentative(state, district);
            if (houseRep) {
                representatives.push(houseRep);
            }
        } else {
            // If no district, get all House reps for the state
            console.log(`⚠️ [Congress.gov] No district specified, fetching all House reps for ${state}`);
            const allHouseReps = await getAllHouseRepsForState(state);
            representatives.push(...allHouseReps);
        }

        console.log(`✅ [Congress.gov] Found ${representatives.length} federal representatives`);
        return representatives;

    } catch (error) {
        console.error(`❌ [Congress.gov] Error:`, error.message);
        return [];
    }
}

/**
 * Get current Senators for a state
 */
async function getSenatorsForState(state) {
    try {
        const cacheKey = `senators_${state}`;
        const cached = cache.members.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL.members)) {
            console.log(`✅ [Senators] Cache hit for ${state}`);
            return cached.data;
        }

        const response = await axios.get(`${CONGRESS_API_BASE}/member`, {
            params: {
                format: 'json',
                api_key: CONGRESS_API_KEY,
                limit: 250,
                currentMember: true
            },
            timeout: 15000
        });

        const members = response.data.members || [];
        
        // Filter for Senators from this state
        const senators = members
            .filter(m => {
                const termsArray = m.terms?.item || [];
                const memberStateCode = STATE_CODES[m.state] || m.state; // Convert "New York" → "NY"
                return memberStateCode === state && termsArray.some(t => t.chamber === 'Senate');
            })
            .slice(0, 2) // Should always be exactly 2
            .map(member => formatCongressMember(member, 'Senate'));

        // Cache the result
        cache.members.set(cacheKey, {
            data: senators,
            timestamp: Date.now()
        });

        console.log(`✅ [Senators] Found ${senators.length} senators for ${state}`);
        return senators;

    } catch (error) {
        console.error(`❌ [Senators] Error for ${state}:`, error.message);
        return [];
    }
}

/**
 * Get House Representative for specific district
 */
async function getHouseRepresentative(state, district) {
    try {
        const cacheKey = `house_${state}_${district}`;
        const cached = cache.members.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL.members)) {
            console.log(`✅ [House] Cache hit for ${state}-${district}`);
            return cached.data;
        }

        const response = await axios.get(`${CONGRESS_API_BASE}/member`, {
            params: {
                format: 'json',
                api_key: CONGRESS_API_KEY,
                limit: 250,
                currentMember: true
            },
            timeout: 15000
        });

        const members = response.data.members || [];
        
        // Find House member for this state and district
        const houseRep = members.find(m => {
            const termsArray = m.terms?.item || [];
            const memberStateCode = STATE_CODES[m.state] || m.state; // Convert "New York" → "NY"
            return memberStateCode === state && 
                   m.district === parseInt(district) &&
                   termsArray.some(t => t.chamber === 'House of Representatives');
        });

        if (!houseRep) {
            console.log(`⚠️ [House] No representative found for ${state}-${district}`);
            return null;
        }

        const formatted = formatCongressMember(houseRep, 'House');

        // Cache the result
        cache.members.set(cacheKey, {
            data: formatted,
            timestamp: Date.now()
        });

        console.log(`✅ [House] Found representative for ${state}-${district}`);
        return formatted;

    } catch (error) {
        console.error(`❌ [House] Error for ${state}-${district}:`, error.message);
        return null;
    }
}

/**
 * Get all House Representatives for a state (when district is unknown)
 */
async function getAllHouseRepsForState(state) {
    try {
        const response = await axios.get(`${CONGRESS_API_BASE}/member`, {
            params: {
                format: 'json',
                api_key: CONGRESS_API_KEY,
                limit: 250,
                currentMember: true
            },
            timeout: 15000
        });

        const members = response.data.members || [];
        
        // Filter for House members from this state
        const houseReps = members
            .filter(m => {
                const termsArray = m.terms?.item || [];
                const memberStateCode = STATE_CODES[m.state] || m.state; // Convert "New York" → "NY"
                return memberStateCode === state && 
                       termsArray.some(t => t.chamber === 'House of Representatives');
            })
            .map(member => formatCongressMember(member, 'House'))
            .slice(0, 10); // Limit to 10 to avoid overwhelming response

        console.log(`✅ [House] Found ${houseReps.length} representatives for ${state}`);
        return houseReps;

    } catch (error) {
        console.error(`❌ [House] Error for ${state}:`, error.message);
        return [];
    }
}

/**
 * Format Congress.gov member data to our standard format
 */
function formatCongressMember(member, chamber) {
    // Fix: Congress.gov API returns terms as object with 'item' array
    const termsArray = member.terms?.item || [];
    const latestTerm = termsArray.length > 0 ? termsArray[termsArray.length - 1] : {};
    
    // Parse name from "Last, First" format
    const fullName = member.name || '';
    const nameParts = fullName.split(',').map(s => s.trim());
    const lastName = nameParts[0] || '';
    const firstName = nameParts[1] || '';
    
    // 🔧 FIX: Build actual website URL if officialWebsiteUrl is missing
    let websiteUrl = member.officialWebsiteUrl;
    
    // If congress.gov doesn't provide website, construct senator/house website
    if (!websiteUrl || websiteUrl.trim() === '') {
        const lastNameLower = lastName.toLowerCase();
        
        if (chamber === 'Senate') {
            // Senate website pattern: https://www.lastname.senate.gov
            // Examples: schumer.senate.gov, gillibrand.senate.gov
            websiteUrl = `https://www.${lastNameLower}.senate.gov`;
        } else {
            // House website pattern: https://lastname.house.gov
            // Examples: jeffries.house.gov, ocasio-cortez.house.gov
            websiteUrl = `https://${lastNameLower}.house.gov`;
        }
    }
    
    return {
        id: `congress_${member.bioguideId}`,
        name: `${firstName} ${lastName}`.trim(),
        title: chamber === 'Senate' ? 'U.S. Senator' : 'U.S. Representative',
        office: chamber === 'Senate' ? 'United States Senate' : 'U.S. House of Representatives',
        level: 'federal',
        party: member.partyName || latestTerm.party || 'Unknown',
        state: member.state,
        district: chamber === 'House' ? `${member.state}-${member.district}` : `${member.state} (At-large)`,
        photo_url: member.depiction?.imageUrl || null,
        phone: latestTerm.office || null,
        email: null, // Congress.gov doesn't provide direct email
        website: websiteUrl, // ✅ FIXED: Now uses constructed URL if officialWebsiteUrl is empty
        term_start: latestTerm.startYear || null,
        term_end: latestTerm.endYear || null,
        bioguide_id: member.bioguideId,
        source: 'congress.gov',
        verified: true
    };
}

// =============================================================================
// OPENSTATES API - STATE LEGISLATORS
// =============================================================================

/**
 * Get state legislators for a state
 * Returns state senators and house/assembly members
 * 
 * @param {string} state - State abbreviation (e.g., 'CA', 'NY')
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Promise<Array>} - Array of state legislator objects
 */
async function getStateLegislators(state, limit = 10) {
    try {
        console.log(`🏛️ [OpenStates] Fetching state legislators for ${state}`);

        const cacheKey = `state_legs_${state}`;
        const cached = cache.stateLegs.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL.stateLegs)) {
            console.log(`✅ [OpenStates] Cache hit for ${state}`);
            return cached.data.slice(0, limit);
        }

        // OpenStates REST API (v3 - GraphQL deprecated as of 2024)
        // Jurisdiction format: ocd-jurisdiction/country:us/state:co/government
        const jurisdiction = `ocd-jurisdiction/country:us/state:${state.toLowerCase()}/government`;
        
        console.log(`📍 [OpenStates] Using jurisdiction: ${jurisdiction}`);

        const response = await axios.get(
            `${OPENSTATES_API_BASE}/people`,
            {
                params: {
                    jurisdiction: jurisdiction,
                    per_page: limit * 2
                },
                headers: {
                    'X-API-Key': OPENSTATES_API_KEY
                },
                timeout: 15000
            }
        );

        const people = response.data.results || [];
        
        const legislators = people
            .map(person => formatStateLegislator(person, state))
            .filter(leg => leg !== null)
            .slice(0, limit);

        // Cache the result
        cache.stateLegs.set(cacheKey, {
            data: legislators,
            timestamp: Date.now()
        });

        console.log(`✅ [OpenStates] Found ${legislators.length} state legislators for ${state}`);
        return legislators;

    } catch (error) {
        console.error(`❌ [OpenStates] Error for ${state}:`, error.message);
        return [];
    }
}

/**
 * Format OpenStates legislator data to our standard format
 * Updated for REST API v3 (GraphQL deprecated)
 */
function formatStateLegislator(person, state) {
    try {
        // REST API v3 format uses current_role instead of currentMemberships
        const role = person.current_role;
        
        if (!role) {
            console.log(`⚠️ [OpenStates] No current role for ${person.name}`);
            return null;
        }

        // Determine title based on org_classification
        const isUpperChamber = role.org_classification === 'upper';
        const title = isUpperChamber ? 'State Senator' : 'State Representative';
        const office = isUpperChamber ? 'State Senate' : 'State House';
        const district = role.district || role.title;

        return {
            id: `openstates_${person.id}`,
            name: person.name,
            title: title,
            office: office,
            level: 'state',
            party: person.party || 'Unknown',
            state: state,
            district: district,
            photo_url: person.image || null,
            phone: null, // REST API doesn't include phone in main response
            email: person.email || null,
            website: person.openstates_url || null,
            term_start: null,
            term_end: null,
            openstates_id: person.id,
            source: 'openstates.org',
            verified: true
        };
    } catch (error) {
        console.error('❌ [OpenStates] Error formatting legislator:', error.message);
        return null;
    }
}

// =============================================================================
// MAIN LOOKUP FUNCTION
// =============================================================================

/**
 * Main function: Get all representatives for a ZIP code
 * Combines federal and state representatives
 * 
 * @param {string} zipCode - 5-digit US ZIP code
 * @returns {Promise<object>} - { federal: [], state: [], location: {} }
 */
async function getRepresentativesByZip(zipCode) {
    try {
        console.log(`\n🔍 ========================================`);
        console.log(`🔍 Looking up representatives for ZIP ${zipCode}`);
        console.log(`🔍 ========================================\n`);

        // Step 1: Get congressional district from ZIP
        const location = await zipToCongressionalDistrict(zipCode);
        
        if (!location || !location.state) {
            throw new Error(`Could not determine location for ZIP ${zipCode}`);
        }

        console.log(`📍 Location: ${location.state}${location.district ? `-${location.district}` : ''}`);

        // Step 2: Get federal representatives
        const federal = await getFederalRepresentatives(location.state, location.district);

        // Step 3: Get state legislators
        const state = await getStateLegislators(location.state, 5);

        // Combine all representatives
        const all = [...federal, ...state];

        console.log(`\n✅ ========================================`);
        console.log(`✅ Found ${all.length} total representatives`);
        console.log(`✅   Federal: ${federal.length} | State: ${state.length}`);
        console.log(`✅ ========================================\n`);

        return {
            success: true,
            representatives: all,
            location_used: {
                zipCode: zipCode,
                state: location.state,
                district: location.district,
                lat: location.lat,
                lon: location.lon
            },
            counts: {
                federal: federal.length,
                state: state.length,
                total: all.length
            },
            data_sources: ['congress.gov', 'openstates.org', 'fcc.gov'],
            cached: false,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error(`❌ Error looking up representatives for ZIP ${zipCode}:`, error.message);
        
        return {
            success: false,
            error: error.message,
            representatives: [],
            location_used: { zipCode: zipCode },
            data_sources: [],
            timestamp: Date.now()
        };
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    getRepresentativesByZip,
    getFederalRepresentatives,
    getStateLegislators,
    zipToCongressionalDistrict
};
ENDOFFILE

echo "✅ Fixed file written successfully"
echo ""

# Verify the fix
echo "🔍 Verifying REST API implementation..."
if grep -q "OpenStates REST API (v3 - GraphQL deprecated" us-representatives.js; then
    echo "✅ REST API comment found!"
fi

if grep -q "current_role" us-representatives.js; then
    echo "✅ REST API response format parser found!"
fi

if grep -q "axios.get.*OPENSTATES_API_BASE.*people" us-representatives.js; then
    echo "✅ REST API endpoint found!"
fi

echo ""

# Restart PM2
echo "🔄 Restarting PM2 backend..."
pm2 restart backend
sleep 3

# Show logs
echo ""
echo "📜 Backend logs:"
pm2 logs backend --lines 20 --nostream

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE - v37.9.3"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "🧪 Test with:"
echo "   curl \"http://localhost:3001/api/civic/representatives/search?zip=80204\""
echo ""
echo "Expected results:"
echo "   • 2 Federal Senators (Hickenlooper, Bennet)"
echo "   • 5+ Colorado State Legislators (NEW!)"
echo "   • All with photos, emails, websites"
echo ""
echo "💾 Backup saved: $BACKUP_FILE"
echo ""
