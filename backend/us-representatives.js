/**
 * WORKFORCE DEMOCRACY PROJECT - US Representatives Lookup
 * Version: 37.17.0-CONTACT-ENHANCEMENT
 * Date: November 24, 2025
 * 
 * Integrates multiple official APIs to provide comprehensive representative information:
 * - Congress.gov API (Federal: Senators + House Representatives)
 * - OpenStates API (State: State Senators + State House/Assembly)
 * - Shared Location Lookup Utility (Privacy-First ZIP → District mapping)
 * - Contact Info Enhancement (District offices, contact forms, smart fallbacks)
 * 
 * PRIVACY-FIRST: Google Civic API REMOVED - uses offline Census data + ethical government APIs
 * All data from official government sources - NO BIG TECH TRACKING
 * 
 * NEW in V37.17.0: Enhanced contact information with smart fallbacks for missing emails/phones
 */

const axios = require('axios');
const { lookupZipCode } = require('./utils/location-lookup');
const { enhanceContactInfo } = require('./utils/contact-info-enhancer');

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
 * Convert ZIP code to Congressional District
 * V37.16.1: NOW USES SHARED LOCATION UTILITY - Privacy-First!
 * 
 * PRIVACY-FIRST: Google Civic API REMOVED
 * Uses: offline Census data (zipcodes package) + FCC API + us-congressional-districts
 * 
 * @param {string} zipCode - 5-digit US ZIP code
 * @returns {Promise<object>} - { state: 'NY', district: '20', lat, lon, source }
 */
async function zipToCongressionalDistrict(zipCode) {
    console.log(`🔍 [US-REPS] ZIP→District lookup for ${zipCode} (using shared utility)...`);
    
    // Use shared location lookup utility
    const location = await lookupZipCode(zipCode);
    
    if (!location.success) {
        console.error(`❌ [US-REPS] Location lookup failed: ${location.error}`);
        throw new Error(location.error || `Could not determine location for ZIP ${zipCode}`);
    }
    
    console.log(`✅ [US-REPS] ZIP ${zipCode} → ${location.state}${location.district ? `-${location.district}` : ''} (${location.source})`);
    
    // Return in the format expected by this module
    return {
        state: location.state,
        district: location.district,
        zipCode: location.zipCode,
        lat: location.lat,
        lon: location.lon,
        city: location.city,
        source: location.source,
        verified: true
    };
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
    let senatorsError = null;
    let houseError = null;
    try {
        console.log(`🏛️ [Congress.gov] Fetching federal reps for ${state}${district ? `-${district}` : ''}`);

        const representatives = [];

        // Get Senators (always 2 per state)
        try {
            const senators = await getSenatorsForState(state);
            representatives.push(...senators);
        } catch (e) {
            console.error(`❌ [Senators] Failed: ${e.message}`);
            senatorsError = e.message;
        }

        // Get House Representative (if district is known)
        try {
            if (district) {
                const houseRep = await getHouseRepresentative(state, district);
                if (houseRep) {
                    representatives.push(houseRep);
                } else {
                    // If specific district rep not found, add a general placeholder
                    representatives.push(enhanceContactInfo({
                        id: `placeholder_house_${state}_${district}`,
                        name: `U.S. Representative (District ${district})`,
                        title: 'U.S. Representative',
                        office: 'U.S. House of Representatives',
                        level: 'federal',
                        party: 'Unknown',
                        state: state,
                        district: `${state}-${district}`,
                        website: `https://www.house.gov/representatives/find-your-representative?zip=${district}`,
                        source: 'WDP-INTERNAL-FALLBACK',
                        is_fallback: true,
                        message: 'Specific representative data unavailable via API. Please check House.gov.'
                    }));
                }
            } else {
                // If no district, get all House reps for the state
                console.log(`⚠️ [Congress.gov] No district specified, fetching all House reps for ${state}`);
                const allHouseReps = await getAllHouseRepsForState(state);
                if (allHouseReps.length > 0) {
                    representatives.push(...allHouseReps);
                }
            }
        } catch (e) {
            console.error(`❌ [House] Failed: ${e.message}`);
            houseError = e.message;
        }

        if (representatives.length === 0 && (senatorsError || houseError)) {
            throw new Error(`Federal lookup failed: ${senatorsError || houseError}`);
        }

        console.log(`✅ [Congress.gov] Found ${representatives.length} federal representatives`);
        return representatives;

    } catch (error) {
        console.error(`❌ [Congress.gov] Error:`, error.message);
        throw error; // Let the caller handle it
    }
}

// State Senators Fallback Data (Current as of 2024-2025)
const STATE_SENATORS = {
    'AL': [{ name: 'Katie Britt', party: 'Republican' }, { name: 'Tommy Tuberville', party: 'Republican' }],
    'AK': [{ name: 'Lisa Murkowski', party: 'Republican' }, { name: 'Dan Sullivan', party: 'Republican' }],
    'AZ': [{ name: 'Mark Kelly', party: 'Democratic' }, { name: 'Kyrsten Sinema', party: 'Independent' }],
    'AR': [{ name: 'John Boozman', party: 'Republican' }, { name: 'Tom Cotton', party: 'Republican' }],
    'CA': [{ name: 'Alex Padilla', party: 'Democratic' }, { name: 'Laphonza Butler', party: 'Democratic' }],
    'CO': [{ name: 'Michael Bennet', party: 'Democratic' }, { name: 'John Hickenlooper', party: 'Democratic' }],
    'CT': [{ name: 'Richard Blumenthal', party: 'Democratic' }, { name: 'Chris Murphy', party: 'Democratic' }],
    'DE': [{ name: 'Tom Carper', party: 'Democratic' }, { name: 'Chris Coons', party: 'Democratic' }],
    'FL': [{ name: 'Marco Rubio', party: 'Republican' }, { name: 'Rick Scott', party: 'Republican' }],
    'GA': [{ name: 'Jon Ossoff', party: 'Democratic' }, { name: 'Raphael Warnock', party: 'Democratic' }],
    'HI': [{ name: 'Mazie Hirono', party: 'Democratic' }, { name: 'Brian Schatz', party: 'Democratic' }],
    'ID': [{ name: 'Mike Crapo', party: 'Republican' }, { name: 'Jim Risch', party: 'Republican' }],
    'IL': [{ name: 'Tammy Duckworth', party: 'Democratic' }, { name: 'Dick Durbin', party: 'Democratic' }],
    'IN': [{ name: 'Mike Braun', party: 'Republican' }, { name: 'Todd Young', party: 'Republican' }],
    'IA': [{ name: 'Joni Ernst', party: 'Republican' }, { name: 'Chuck Grassley', party: 'Republican' }],
    'KS': [{ name: 'Jerry Moran', party: 'Republican' }, { name: 'Roger Marshall', party: 'Republican' }],
    'KY': [{ name: 'Mitch McConnell', party: 'Republican' }, { name: 'Rand Paul', party: 'Republican' }],
    'LA': [{ name: 'Bill Cassidy', party: 'Republican' }, { name: 'John Kennedy', party: 'Republican' }],
    'ME': [{ name: 'Susan Collins', party: 'Republican' }, { name: 'Angus King', party: 'Independent' }],
    'MD': [{ name: 'Ben Cardin', party: 'Democratic' }, { name: 'Chris Van Hollen', party: 'Democratic' }],
    'MA': [{ name: 'Edward Markey', party: 'Democratic' }, { name: 'Elizabeth Warren', party: 'Democratic' }],
    'MI': [{ name: 'Gary Peters', party: 'Democratic' }, { name: 'Debbie Stabenow', party: 'Democratic' }],
    'MN': [{ name: 'Amy Klobuchar', party: 'Democratic' }, { name: 'Tina Smith', party: 'Democratic' }],
    'MS': [{ name: 'Cindy Hyde-Smith', party: 'Republican' }, { name: 'Roger Wicker', party: 'Republican' }],
    'MO': [{ name: 'Josh Hawley', party: 'Republican' }, { name: 'Eric Schmitt', party: 'Republican' }],
    'MT': [{ name: 'Steve Daines', party: 'Republican' }, { name: 'Jon Tester', party: 'Democratic' }],
    'NE': [{ name: 'Deb Fischer', party: 'Republican' }, { name: 'Pete Ricketts', party: 'Republican' }],
    'NV': [{ name: 'Catherine Cortez Masto', party: 'Democratic' }, { name: 'Jacky Rosen', party: 'Democratic' }],
    'NH': [{ name: 'Maggie Hassan', party: 'Democratic' }, { name: 'Jeanne Shaheen', party: 'Democratic' }],
    'NJ': [{ name: 'Cory Booker', party: 'Democratic' }, { name: 'George Helmy', party: 'Democratic' }],
    'NM': [{ name: 'Martin Heinrich', party: 'Democratic' }, { name: 'Ben Ray Luján', party: 'Democratic' }],
    'NY': [{ name: 'Kirsten Gillibrand', party: 'Democratic' }, { name: 'Chuck Schumer', party: 'Democratic' }],
    'NC': [{ name: 'Ted Budd', party: 'Republican' }, { name: 'Thom Tillis', party: 'Republican' }],
    'ND': [{ name: 'Kevin Cramer', party: 'Republican' }, { name: 'John Hoeven', party: 'Republican' }],
    'OH': [{ name: 'Sherrod Brown', party: 'Democratic' }, { name: 'JD Vance', party: 'Republican' }],
    'OK': [{ name: 'James Lankford', party: 'Republican' }, { name: 'Markwayne Mullin', party: 'Republican' }],
    'OR': [{ name: 'Jeff Merkley', party: 'Democratic' }, { name: 'Ron Wyden', party: 'Democratic' }],
    'PA': [{ name: 'Bob Casey Jr.', party: 'Democratic' }, { name: 'John Fetterman', party: 'Democratic' }],
    'RI': [{ name: 'Jack Reed', party: 'Democratic' }, { name: 'Sheldon Whitehouse', party: 'Democratic' }],
    'SC': [{ name: 'Lindsey Graham', party: 'Republican' }, { name: 'Tim Scott', party: 'Republican' }],
    'SD': [{ name: 'Mike Rounds', party: 'Republican' }, { name: 'John Thune', party: 'Republican' }],
    'TN': [{ name: 'Marsha Blackburn', party: 'Republican' }, { name: 'Bill Hagerty', party: 'Republican' }],
    'TX': [{ name: 'John Cornyn', party: 'Republican' }, { name: 'Ted Cruz', party: 'Republican' }],
    'UT': [{ name: 'Mike Lee', party: 'Republican' }, { name: 'Mitt Romney', party: 'Republican' }],
    'VT': [{ name: 'Bernie Sanders', party: 'Independent' }, { name: 'Peter Welch', party: 'Democratic' }],
    'VA': [{ name: 'Tim Kaine', party: 'Democratic' }, { name: 'Mark Warner', party: 'Democratic' }],
    'WA': [{ name: 'Maria Cantwell', party: 'Democratic' }, { name: 'Patty Murray', party: 'Democratic' }],
    'WV': [{ name: 'Shelley Moore Capito', party: 'Republican' }, { name: 'Joe Manchin', party: 'Independent' }],
    'WI': [{ name: 'Tammy Baldwin', party: 'Democratic' }, { name: 'Ron Johnson', party: 'Republican' }],
    'WY': [{ name: 'John Barrasso', party: 'Republican' }, { name: 'Cynthia Lummis', party: 'Republican' }]
};

/**
 * Get fallback Senators for a state when API fails
 */
function getSenatorsFallback(state) {
    console.log(`📡 [Fallback] Providing hardcoded Senators for ${state}`);
    const senators = STATE_SENATORS[state] || [];
    return senators.map(s => enhanceContactInfo({
        id: `fallback_${state}_${s.name.replace(/\s+/g, '_')}`,
        name: s.name,
        title: 'U.S. Senator',
        office: 'United States Senate',
        level: 'federal',
        party: s.party,
        state: state,
        district: `${state} (At-large)`,
        photo_url: null,
        source: 'WDP-INTERNAL-FALLBACK',
        verified: false,
        is_fallback: true,
        message: 'Data provided from internal fallback due to official API unavailability.'
    }));
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

        if (!CONGRESS_API_KEY) {
            console.warn(`⚠️ [Senators] No Congress API key - using fallback for ${state}`);
            return getSenatorsFallback(state);
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
                const memberState = m.state || '';
                const memberStateCode = STATE_CODES[memberState] || memberState; // Convert "New York" → "NY"
                return memberStateCode === state && termsArray.some(t => t.chamber === 'Senate');
            })
            .slice(0, 2) // Should always be exactly 2
            .map(member => formatCongressMember(member, 'Senate'));

        if (senators.length === 0) {
            console.warn(`⚠️ [Senators] API returned 0 results for ${state} - using fallback`);
            return getSenatorsFallback(state);
        }

        // Cache the result
        cache.members.set(cacheKey, {
            data: senators,
            timestamp: Date.now()
        });

        console.log(`✅ [Senators] Found ${senators.length} senators for ${state}`);
        return senators;

    } catch (error) {
        console.error(`❌ [Senators] Error for ${state}:`, error.message);
        // GUARANTEED FALLBACK: If API fails for ANY reason (403, 500, Timeout, etc.), return hardcoded senators
        return getSenatorsFallback(state);
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
            const memberState = m.state || '';
            const memberStateCode = STATE_CODES[memberState] || memberState; // Convert "New York" → "NY"
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
                const memberState = m.state || '';
                const memberStateCode = STATE_CODES[memberState] || memberState; // Convert "New York" → "NY"
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
 * V37.17.0: Now includes enhanced contact information
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
    
    const baseRep = {
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
    
    // 🆕 V37.17.0: Enhance with contact information
    return enhanceContactInfo(baseRep);
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

        if (!OPENSTATES_API_KEY) {
            console.warn(`⚠️ [OpenStates] No API key for ${state}`);
            throw new Error('OpenStates API key not configured');
        }

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
        // GUARANTEED FALLBACK: Provide a link to OpenStates if API is restricted or fails for ANY reason
        return [{
            id: `fallback_state_${state}`,
            name: `State Legislators for ${state}`,
            title: 'State Representative/Senator',
            office: 'State Legislature',
            level: 'state',
            party: 'Various',
            state: state,
            district: 'Multiple',
            photo_url: null,
            website: `https://openstates.org/${state.toLowerCase()}/`,
            source: 'WDP-INTERNAL-FALLBACK',
            verified: false,
            is_fallback: true,
            message: 'Official API access restricted or unavailable. Please check OpenStates directly.'
        }];
    }
}

/**
 * Format OpenStates legislator data to our standard format
 * Updated for REST API v3 (GraphQL deprecated)
 * V37.17.0: Now includes enhanced contact information
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

        const baseRep = {
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
        
        // 🆕 V37.17.0: Enhance with contact information
        return enhanceContactInfo(baseRep);
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
        console.log(`🔍 [US-REPS] v37.22.0-FINAL-FIX: ZIP ${zipCode}`);
        console.log(`🔍 ========================================\n`);

        // Step 1: Get congressional district from ZIP
        let location;
        try {
            location = await zipToCongressionalDistrict(zipCode);
        } catch (locErr) {
            console.warn(`⚠️ [US-REPS] Location lookup failed for ZIP ${zipCode}: ${locErr.message}`);
            // Fallback to basic state detection from ZIP if first digit is known
            const zipToStatePrefix = {
                '0': 'MA', '1': 'NY', '2': 'VA', '3': 'FL', '4': 'GA', 
                '5': 'MS', '6': 'IL', '7': 'TX', '8': 'CO', '9': 'CA'
            };
            const prefix = zipCode.charAt(0);
            location = { 
                state: zipToStatePrefix[prefix] || 'NY', // Default to NY if unknown
                district: null,
                zipCode: zipCode,
                source: 'zip_prefix_fallback'
            };
            console.log(`📍 [US-REPS] Falling back to state prefix: ${location.state}`);
        }
        
        if (!location || !location.state) {
            console.error(`❌ [US-REPS] Critical location failure for ZIP ${zipCode}`);
            throw new Error(`Could not determine location for ZIP ${zipCode}`);
        }

        console.log(`📍 Location: ${location.state}${location.district ? `-${location.district}` : ''} (Source: ${location.source})`);

        // Step 2: Get federal representatives
        let federal = [];
        let fedError = null;
        try {
            federal = await getFederalRepresentatives(location.state, location.district);
        } catch (e) {
            console.error(`❌ [US-REPS] Federal lookup failed: ${e.message}`);
            fedError = e.message;
        }
        console.log(`🏛️ [US-REPS] Federal reps found: ${federal.length}`);

        // Step 3: Get state legislators
        let state = [];
        let stateError = null;
        try {
            state = await getStateLegislators(location.state, 5);
        } catch (e) {
            console.error(`❌ [US-REPS] State lookup failed: ${e.message}`);
            stateError = e.message;
        }
        console.log(`🏛️ [US-REPS] State reps found: ${state.length}`);

        // Combine all representatives and remove duplicates
        const all = [...federal, ...state];
        
        if (all.length === 0) {
            console.warn(`⚠️ [US-REPS] No representatives found at all for ZIP ${zipCode} (State: ${location.state})`);
        }
        
        // Deduplicate by bioguide ID or name+level combination
        const seen = new Set();
        const deduplicated = all.filter(rep => {
            const key = rep.id || `${rep.name}_${rep.level}_${rep.office}`;
            if (seen.has(key)) {
                console.log(`🔄 [DEDUP] Removing duplicate: ${rep.name} (${rep.office})`);
                return false;
            }
            seen.add(key);
            return true;
        });

        console.log(`\n✅ ========================================`);
        console.log(`✅ Found ${deduplicated.length} total representatives (after deduplication)`);
        console.log(`✅   Federal: ${federal.length} | State: ${state.length}`);
        console.log(`✅   Duplicates removed: ${all.length - deduplicated.length}`);
        console.log(`✅ ========================================\n`);

        // Build status message if any failures occurred
        let statusMessage = 'Real data from Congress.gov & OpenStates APIs';
        if (fedError || stateError) {
            statusMessage = `Partial data. Errors: ${[fedError, stateError].filter(Boolean).join('; ')}`;
        }

        return {
            success: true,
            representatives: deduplicated,
            location_used: {
                zipCode: zipCode,
                state: location.state,
                district: location.district,
                lat: location.lat,
                lon: location.lon,
                source: location.source
            },
            counts: {
                federal: deduplicated.filter(r => r.level === 'federal').length,
                state: deduplicated.filter(r => r.level === 'state').length,
                total: deduplicated.length
            },
            data_sources: ['congress.gov', 'openstates.org', location.source],
            errors: {
                federal: fedError,
                state: stateError
            },
            message: statusMessage,
            cached: false,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error(`❌ Error looking up representatives for ZIP ${zipCode}:`, error.message);
        
        // LAST RESORT FALLBACK: If everything fails (even ZIP detection), return National Senators placeholder
        return {
            success: true,
            representatives: [{
                id: 'national_senate_link',
                name: 'U.S. Senate (National)',
                title: 'Official Records',
                office: 'U.S. Capitol',
                level: 'federal',
                party: 'Various',
                state: 'US',
                district: 'National',
                website: 'https://www.senate.gov/senators/senators-contact.htm',
                source: 'WDP-EMERGENCY-FALLBACK',
                is_fallback: true,
                message: 'Complete location lookup failure. Please visit Senate.gov to find your officials manually.'
            }],
            location_used: { zipCode, state: 'Unknown', source: 'emergency_fallback' },
            counts: { federal: 1, state: 0, total: 1 },
            data_sources: ['emergency_fallback'],
            message: `Emergency fallback activated: ${error.message}`,
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
