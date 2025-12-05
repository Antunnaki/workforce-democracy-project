/**
 * Test Backend Override
 * v37.18.7 - Override API endpoints to use Version B (test)
 * 
 * This script runs AFTER all other scripts load and overrides
 * the API base URLs to point to Version B via /test route
 */

(function() {
    console.log('🔧 [TEST OVERRIDE] Redirecting API calls to Version B (test backend)');
    
    // Override CleanChat if it exists
    if (typeof CleanChat !== 'undefined') {
        CleanChat.apiBase = 'https://api.workforcedemocracyproject.org/test';
        console.log('✅ [TEST OVERRIDE] CleanChat.apiBase =', CleanChat.apiBase);
    }
    
    // Override CONFIG if it exists
    if (typeof CONFIG !== 'undefined') {
        CONFIG.API_BASE_URL = 'https://api.workforcedemocracyproject.org/test';
        console.log('✅ [TEST OVERRIDE] CONFIG.API_BASE_URL =', CONFIG.API_BASE_URL);
    }
    
    // Override BackendAPI if it exists
    if (typeof BackendAPI !== 'undefined') {
        BackendAPI.baseURL = 'https://api.workforcedemocracyproject.org/test';
        console.log('✅ [TEST OVERRIDE] BackendAPI.baseURL =', BackendAPI.baseURL);
    }
    
    console.log('🎯 [TEST OVERRIDE] All API endpoints now pointing to Version B (port 3002)');
    console.log('📊 [TEST OVERRIDE] Test with: "What is Chuck Schumer\'s voting record on healthcare?"');
})();
