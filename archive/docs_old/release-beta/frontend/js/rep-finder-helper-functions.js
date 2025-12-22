/**
 * REP-FINDER HELPER FUNCTIONS
 * V37.16.0 - AGGRESSIVE AUTO-LOAD SUPPORT
 * 
 * These functions support the aggressive auto-load personalization features.
 * Extracted to separate file for clarity and maintainability.
 */

// ============================================================================
// V37.16.0: HELPER FUNCTIONS FOR AGGRESSIVE AUTO-LOAD
// ============================================================================

/**
 * V37.16.0 OPTION A2: Get cached representatives from localStorage
 */
function getCachedRepresentatives() {
    try {
        const cached = localStorage.getItem('wdp_cached_representatives');
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        
        // Check if cache is still fresh (24 hours)
        const cacheAge = Date.now() - (data.timestamp || 0);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (cacheAge > maxAge) {
            console.log('⏰ [REP-FINDER V37.16.0] Cache expired (>24h), will refresh');
            return null;
        }
        
        console.log('✅ [REP-FINDER V37.16.0] OPTION A2: Found fresh cached representatives:', data.representatives?.length);
        return data;
    } catch (error) {
        console.warn('[REP-FINDER V37.16.0] Error reading cached reps:', error);
        return null;
    }
}

/**
 * V37.16.0 OPTION A2: Save representatives to localStorage cache
 */
function cacheRepresentatives(data, zip) {
    try {
        const cacheData = {
            zip: zip,
            representatives: data.representatives || [],
            counts: data.counts || {},
            data_sources: data.data_sources || [],
            timestamp: Date.now()
        };
        
        localStorage.setItem('wdp_cached_representatives', JSON.stringify(cacheData));
        lastLoadedZip = zip;
        console.log('💾 [REP-FINDER V37.16.0] OPTION A2: Cached', data.representatives?.length, 'representatives for ZIP', zip);
    } catch (error) {
        console.warn('[REP-FINDER V37.16.0] Error caching reps:', error);
    }
}

/**
 * V37.16.0 OPTION A5: Render representatives with optional skeleton/cached state
 */
function renderRepresentatives(data, isCached = false) {
    const results = document.getElementById('searchResults');
    if (!results) return;
    
    const reps = data.representatives || [];
    const zip = data.zip || 'your area';
    
    // If no reps and not cached, don't render
    if (reps.length === 0 && !isCached) {
        return;
    }
    
    // Display with cache indicator
    if (isCached && reps.length > 0) {
        const cacheIndicator = `
            <div style="padding: 0.75rem 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af; font-size: 0.875rem; font-weight: 600;">
                    ⚡ Instantly loaded ${reps.length} representative${reps.length !== 1 ? 's' : ''} for ZIP ${zip} (cached)
                </p>
            </div>
        `;
        // Prepend cache indicator before calling displayResults
        results.innerHTML = cacheIndicator + '<div id="searchResultsInner"></div>';
        
        // Temporarily redirect displayResults to inner container
        const originalResults = document.getElementById('searchResults');
        const innerResults = document.getElementById('searchResultsInner');
        if (innerResults) {
            document.getElementById('searchResults').id = 'searchResults_temp';
            innerResults.id = 'searchResults';
            displayResults(data, zip);
            document.getElementById('searchResults').id = 'searchResultsInner';
            document.getElementById('searchResults_temp').id = 'searchResults';
        }
    } else {
        // Use the existing displayResults function
        displayResults(data, zip);
    }
    
    repsAlreadyLoaded = true;
}

/**
 * V37.16.0 OPTION A1/A3/A4: Auto-load representatives based on saved ZIP
 */
function autoLoadRepresentatives() {
    const input = document.getElementById('zipInput');
    const button = document.getElementById('searchBtn');
    
    if (!input || !button) {
        console.warn('[REP-FINDER V37.16.0] Auto-load skipped: Form elements not found');
        return;
    }
    
    // Get ZIP from personalization system or input field
    let zipcodeToLoad = input.value.trim();
    
    // Try to get from PersonalizationSystem
    if (window.PersonalizationSystem) {
        const userData = window.PersonalizationSystem.getUserData();
        if (userData?.address?.zip) {
            zipcodeToLoad = userData.address.zip;
        } else if (userData?.representatives?.zip) {
            zipcodeToLoad = userData.representatives.zip;
        }
    }
    
    // Fallback to legacy localStorage
    if (!zipcodeToLoad) {
        zipcodeToLoad = localStorage.getItem('wdp_personalization_zipcode');
    }
    
    // Validate ZIP
    if (!zipcodeToLoad || !/^\d{5}$/.test(zipcodeToLoad)) {
        console.log('ℹ️ [REP-FINDER V37.16.0] Auto-load skipped: No valid ZIP found');
        return;
    }
    
    // Skip if already loaded this ZIP
    if (repsAlreadyLoaded && lastLoadedZip === zipcodeToLoad) {
        console.log('✅ [REP-FINDER V37.16.0] Auto-load skipped: Already loaded ZIP', zipcodeToLoad);
        return;
    }
    
    // Check cache first
    const cached = getCachedRepresentatives();
    if (cached && cached.zip === zipcodeToLoad) {
        console.log('⚡ [REP-FINDER V37.16.0] Auto-load: Using cached data for ZIP', zipcodeToLoad);
        input.value = zipcodeToLoad;
        renderRepresentatives(cached, true);
        return;
    }
    
    // Load from API
    console.log('🚀 [REP-FINDER V37.16.0] Auto-loading representatives for ZIP:', zipcodeToLoad);
    input.value = zipcodeToLoad;
    
    // Show skeleton first (OPTION A5)
    showSkeletonPlaceholders();
    
    // Trigger search after a short delay
    setTimeout(() => {
        button.click();
    }, 100);
}

/**
 * V37.16.0 OPTION A5: Show skeleton loading placeholders
 */
function showSkeletonPlaceholders() {
    const results = document.getElementById('searchResults');
    if (!results) return;
    
    results.innerHTML = `
        <div style="padding: 1.5rem; background: #f9fafb; border-radius: 12px; margin-bottom: 1rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="width: 90px; height: 90px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 12px;"></div>
                <div style="flex: 1;">
                    <div style="height: 24px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 6px; margin-bottom: 0.75rem; width: 60%;"></div>
                    <div style="height: 16px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 6px; width: 40%;"></div>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="width: 90px; height: 90px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 12px;"></div>
                <div style="flex: 1;">
                    <div style="height: 24px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 6px; margin-bottom: 0.75rem; width: 55%;"></div>
                    <div style="height: 16px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 6px; width: 45%;"></div>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <div style="width: 90px; height: 90px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 12px;"></div>
                <div style="flex: 1;">
                    <div style="height: 24px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 6px; margin-bottom: 0.75rem; width: 65%;"></div>
                    <div style="height: 16px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 6px; width: 35%;"></div>
                </div>
            </div>
        </div>
        <style>
            @keyframes skeleton-shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        </style>
    `;
}
