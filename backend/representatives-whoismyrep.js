/**
 * INDEPENDENT ALTERNATIVE: Who Is My Representative API
 * 
 * Free, no signup required, no big tech
 * Source: https://whoismyrepresentative.com/
 * 
 * This is an independent civic tech project that provides
 * free access to representative data without tracking.
 */

const axios = require('axios');

/**
 * Get representatives by ZIP code using WhoIsMyRepresentative.com
 * 
 * @param {string} zip - 5-digit ZIP code
 * @returns {Promise<object>} - Representatives data
 */
async function getRepsByZIP(zip) {
    try {
        console.log(`🔍 Looking up representatives for ZIP: ${zip} (WhoIsMyRep.com)`);
        
        // Call the free API - no key required!
        const response = await axios.get('https://whoismyrepresentative.com/getall_mems.php', {
            params: {
                zip: zip,
                output: 'json'
            },
            timeout: 10000 // 10 second timeout
        });
        
        // Parse response
        const data = response.data;
        
        if (!data || !data.results) {
            throw new Error('No results returned from API');
        }
        
        // Format representatives
        const representatives = data.results.map(rep => ({
            name: rep.name,
            title: `${rep.state} ${rep.party} - ${rep.district || 'Senator'}`,
            party: rep.party,
            phone: rep.phone,
            url: rep.link,
            photo_url: null,
            office: rep.office,
            level: rep.district ? 'house' : 'senate'
        }));
        
        console.log(`✅ Found ${representatives.length} representatives`);
        
        return {
            success: true,
            zip: zip,
            representatives: representatives,
            count: representatives.length,
            source: 'WhoIsMyRepresentative.com',
            privacy: 'No tracking, independent service'
        };
        
    } catch (error) {
        console.error('❌ WhoIsMyRep API Error:', error.message);
        
        // Return fallback data
        return {
            success: false,
            error: error.message,
            zip: zip,
            fallback: true
        };
    }
}

/**
 * Get representatives by state
 * 
 * @param {string} state - 2-letter state code (e.g., 'NY')
 * @returns {Promise<object>} - Representatives data
 */
async function getRepsByState(state) {
    try {
        console.log(`🔍 Looking up representatives for state: ${state}`);
        
        const response = await axios.get('https://whoismyrepresentative.com/getall_reps_bystate.php', {
            params: {
                state: state,
                output: 'json'
            },
            timeout: 10000
        });
        
        const data = response.data;
        
        if (!data || !data.results) {
            throw new Error('No results returned from API');
        }
        
        const representatives = data.results.map(rep => ({
            name: rep.name,
            title: `U.S. Representative - ${rep.district}`,
            party: rep.party,
            phone: rep.phone,
            url: rep.link,
            photo_url: null,
            office: rep.office
        }));
        
        return {
            success: true,
            state: state,
            representatives: representatives,
            count: representatives.length,
            source: 'WhoIsMyRepresentative.com'
        };
        
    } catch (error) {
        console.error('❌ WhoIsMyRep API Error:', error.message);
        return {
            success: false,
            error: error.message,
            state: state
        };
    }
}

module.exports = {
    getRepsByZIP,
    getRepsByState
};
