/**
 * NONPROFIT ORGANIZATIONS API - ProPublica Proxy
 * Workforce Democracy Project
 * 
 * Purpose: Proxy requests to ProPublica Nonprofit Explorer API
 * Why: Avoid CORS issues, add caching, enable AI enhancements
 * 
 * ProPublica API Docs: https://projects.propublica.org/nonprofits/api
 */

const fetch = require('node-fetch');

// Cache for nonprofit searches (15 minute TTL)
const nonprofitCache = new Map();
const CACHE_TTL = 900000; // 15 minutes

/**
 * Search nonprofits via ProPublica API with enriched address data
 * @param {string} query - Search term
 * @param {object} filters - Optional filters (state, city)
 * @param {boolean} enrichWithAddresses - Whether to fetch detailed address data (default: true)
 * @returns {Promise<Array>} - Array of nonprofit organizations with ZIP codes and addresses
 */
async function searchNonprofits(query, filters = {}, enrichWithAddresses = true) {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}_${enrichWithAddresses}`;
    
    // Check cache
    if (nonprofitCache.has(cacheKey)) {
        const cached = nonprofitCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            console.log('📦 Cache hit:', query);
            return cached.data;
        }
        // Expired cache entry
        nonprofitCache.delete(cacheKey);
    }
    
    try {
        // Build ProPublica API URL
        let apiUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}`;
        
        if (filters.state) {
            apiUrl += `&state[id]=${filters.state}`;
        }
        if (filters.city) {
            apiUrl += `&city=${encodeURIComponent(filters.city)}`;
        }
        
        console.log('🔍 Searching ProPublica:', apiUrl);
        
        // Fetch from ProPublica
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Workforce Democracy Project (Community Services)',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`ProPublica API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // ProPublica response format: { organizations: [...], num_pages: N, cur_page: 1, ... }
        let organizations = data.organizations || [];
        
        // Enrich with detailed address data if requested
        if (enrichWithAddresses && organizations.length > 0) {
            console.log(`🔄 Enriching ${organizations.length} organizations with address data...`);
            organizations = await enrichWithDetails(organizations);
        }
        
        // Cache results
        nonprofitCache.set(cacheKey, {
            data: organizations,
            timestamp: Date.now()
        });
        
        console.log(`✅ Found ${organizations.length} nonprofits for "${query}"`);
        
        return organizations;
        
    } catch (error) {
        console.error('❌ ProPublica search error:', error.message);
        throw error;
    }
}

/**
 * Enrich organizations with detailed address data
 * Batch-fetches details for multiple organizations
 * @param {Array} organizations - Array of basic org data
 * @returns {Promise<Array>} - Array of enriched org data with ZIP codes and addresses
 */
async function enrichWithDetails(organizations) {
    // Limit to first 50 to avoid rate limits (adjust as needed)
    const orgsToEnrich = organizations.slice(0, 50);
    
    try {
        // Batch fetch with concurrency limit (5 at a time to be respectful)
        const enriched = [];
        const batchSize = 5;
        
        for (let i = 0; i < orgsToEnrich.length; i += batchSize) {
            const batch = orgsToEnrich.slice(i, i + batchSize);
            
            const batchResults = await Promise.allSettled(
                batch.map(async org => {
                    try {
                        const details = await getNonprofitDetails(org.ein);
                        const orgData = details.organization || {};
                        
                        return {
                            ...org,
                            // Add ZIP code and address from detailed data
                            zipcode: orgData.zipcode || org.zipcode,
                            postal_code: orgData.zipcode || org.zipcode,
                            address: orgData.address || null,
                            street: orgData.address || null
                        };
                    } catch (error) {
                        console.warn(`⚠️ Failed to enrich ${org.ein}:`, error.message);
                        return org;
                    }
                })
            );
            
            // Extract successful results
            batchResults.forEach(result => {
                if (result.status === 'fulfilled') {
                    enriched.push(result.value);
                }
            });
            
            // Small delay between batches to be respectful of API
            if (i + batchSize < orgsToEnrich.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // Append any remaining orgs that weren't enriched (beyond first 50)
        const remaining = organizations.slice(50);
        
        console.log(`✅ Enriched ${enriched.length}/${organizations.length} organizations with address data`);
        
        return [...enriched, ...remaining];
        
    } catch (error) {
        console.error('❌ Enrichment error:', error.message);
        return organizations;
    }
}

/**
 * Get detailed information about a specific nonprofit
 * @param {string} ein - Employer Identification Number
 * @returns {Promise<Object>} - Nonprofit details
 */
async function getNonprofitDetails(ein) {
    const cacheKey = `details_${ein}`;
    
    // Check cache
    if (nonprofitCache.has(cacheKey)) {
        const cached = nonprofitCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            console.log('📦 Cache hit (details):', ein);
            return cached.data;
        }
        nonprofitCache.delete(cacheKey);
    }
    
    try {
        const apiUrl = `https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`;
        
        console.log('🔍 Fetching nonprofit details:', ein);
        
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
        
        // Cache result
        nonprofitCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        console.log(`✅ Got details for ${data.organization?.name || ein}`);
        
        return data;
        
    } catch (error) {
        console.error('❌ Nonprofit details error:', error.message);
        throw error;
    }
}

/**
 * Clear expired cache entries
 */
function cleanCache() {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, value] of nonprofitCache.entries()) {
        if (now - value.timestamp >= CACHE_TTL) {
            nonprofitCache.delete(key);
            removed++;
        }
    }
    
    if (removed > 0) {
        console.log(`🧹 Cleaned ${removed} expired cache entries`);
    }
}

// Clean cache every 10 minutes
setInterval(cleanCache, 600000);

module.exports = {
    searchNonprofits,
    getNonprofitDetails,
    enrichWithDetails,
    cleanCache
};
