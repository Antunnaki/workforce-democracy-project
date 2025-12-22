/**
 * CIVIC REPRESENTATIVE FINDER - V37.9.1 - FIXED GET METHOD
 * Uses GET method with query params: ?zip=12345
 * Endpoint: /api/civic/representatives/search
 */

// IMMEDIATE LOG - THIS SHOULD APPEAR FIRST
console.log('═══════════════════════════════════════════════════════');
console.log('🚀🚀🚀 [V37.9.1-REP-FINDER-V2] LOADING - FIXED VERSION!!!');
console.log('📍 [REP-FINDER-V2] Using GET /api/civic/representatives/search');
console.log('📍 [REP-FINDER-V2] File loaded at:', new Date().toISOString());
console.log('📍 [REP-FINDER-V2] User agent:', navigator.userAgent);
console.log('═══════════════════════════════════════════════════════');

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
console.log('✅ [POST-METHOD] CSS animation added');

// Simple object-based approach
const RepFinder = {
    init() {
        console.log('🔧 [POST-METHOD] RepFinder.init() called');
        
        const container = document.getElementById('civicResults');
        console.log('📦 [POST-METHOD] Container:', container);
        
        if (!container) {
            console.error('❌ [POST-METHOD] Container #civicResults NOT FOUND!');
            return;
        }
        
        console.log('✅ [POST-METHOD] Container found! Injecting HTML...');
        
        // Simple HTML injection
        container.innerHTML = `
            <div style="padding: 2rem; background: #f0f9ff; border-radius: 8px; border: 2px solid #3b82f6;">
                <h2 style="color: #1e40af; margin: 0 0 1rem 0;">🗺️ Find Your Representatives</h2>
                <p style="margin-bottom: 1.5rem; color: #475569;">Enter your ZIP code to see your federal and state representatives.</p>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #334155;">
                        ZIP Code <span style="color: #dc2626;">*</span>
                    </label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input 
                            type="text" 
                            id="zipCodeInput" 
                            placeholder="Enter 5-digit ZIP code"
                            maxlength="5"
                            style="flex: 1; padding: 0.75rem; border: 2px solid #cbd5e1; border-radius: 6px; font-size: 1rem;"
                        />
                        <button 
                            id="zipLookupBtn"
                            style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"
                        >
                            🔍 Find Reps
                        </button>
                    </div>
                </div>
                
                <div id="lookupResults" style="margin-top: 1rem;"></div>
            </div>
        `;
        
        console.log('✅ [POST-METHOD] HTML injected successfully!');
        
        // Add event listener
        const button = document.getElementById('zipLookupBtn');
        const input = document.getElementById('zipCodeInput');
        const results = document.getElementById('lookupResults');
        
        if (button && input && results) {
            console.log('✅ [POST-METHOD] Elements found, attaching listener...');
            
            button.addEventListener('click', async () => {
                console.log('🎯 [POST-METHOD] Button clicked!');
                const zip = input.value.trim();
                
                if (!zip || zip.length !== 5) {
                    results.innerHTML = '<p style="color: #dc2626; padding: 1rem; background: #fee2e2; border-radius: 6px;">❌ Please enter a valid 5-digit ZIP code</p>';
                    return;
                }
                
                // Show loading state
                button.disabled = true;
                button.style.opacity = '0.6';
                button.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Loading...';
                
                results.innerHTML = `
                    <div style="padding: 1rem; background: #e0f2fe; border-radius: 6px; border: 2px solid #0284c7;">
                        <p style="margin: 0; color: #075985;">
                            🔍 Searching for representatives in ZIP code <strong>${zip}</strong>...
                        </p>
                    </div>
                `;
                
                try {
                    // Call backend API - FIXED v37.9.1: Use GET with query params
                    const apiUrl = window.CONFIG?.ENDPOINTS?.REPRESENTATIVES || 'https://api.workforcedemocracyproject.org/api/civic/representatives/search';
                    const fullUrl = `${apiUrl}?zip=${zip}`;
                    
                    console.log('📡 [REP-FINDER-V2] Calling:', fullUrl);
                    console.log('📡 [REP-FINDER-V2] Using GET method (v37.9.1 fix)');
                    console.log('📡 [REP-FINDER-V2] CONFIG available:', !!window.CONFIG);
                    console.log('📡 [REP-FINDER-V2] ENDPOINTS:', window.CONFIG?.ENDPOINTS);
                    
                    const response = await fetch(fullUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        mode: 'cors'
                    }).catch(fetchError => {
                        console.error('📡 [REP-FINDER-V2] Fetch failed:', fetchError);
                        throw new Error(`Network error: ${fetchError.message}`);
                    });
                    
                    console.log('📡 [REP-FINDER-V2] Response status:', response.status);
                    console.log('📡 [REP-FINDER-V2] Response ok:', response.ok);
                    console.log('📡 [REP-FINDER-V2] Response type:', response.type);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('📡 [POST-METHOD] Error response:', errorText);
                        throw new Error(`API returned ${response.status}: ${errorText}`);
                    }
                    
                    const data = await response.json();
                    console.log('📡 [POST-METHOD] Response data:', data);
                    
                    // Display representatives with enhanced UI
                    if (data.representatives && data.representatives.length > 0) {
                        const counts = data.counts || {};
                        const sources = data.data_sources || [];
                        
                        results.innerHTML = `
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); color: white; margin-bottom: 1rem;">
                                <h3 style="margin: 0 0 0.75rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.5rem;">🎯</span> Found ${data.representatives.length} Representatives
                                </h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
                                    ${counts.federal ? `<div style="background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 8px; text-align: center;">
                                        <div style="font-size: 1.5rem; font-weight: 700;">${counts.federal}</div>
                                        <div style="font-size: 0.875rem; opacity: 0.95;">Federal</div>
                                    </div>` : ''}
                                    ${counts.state ? `<div style="background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 8px; text-align: center;">
                                        <div style="font-size: 1.5rem; font-weight: 700;">${counts.state}</div>
                                        <div style="font-size: 0.875rem; opacity: 0.95;">State</div>
                                    </div>` : ''}
                                </div>
                                <div style="font-size: 0.8125rem; opacity: 0.9; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                    <span>✓ Data from:</span>
                                    ${sources.map(s => `<span style="background: rgba(255,255,255,0.25); padding: 0.25rem 0.5rem; border-radius: 4px;">${s}</span>`).join('')}
                                    ${data.cached ? '<span style="background: rgba(255,255,255,0.25); padding: 0.25rem 0.5rem; border-radius: 4px;">📦 Cached</span>' : ''}
                                </div>
                            </div>
                            
                            <div style="display: grid; gap: 1rem;">
                                ${data.representatives.map(rep => `
                                    <div style="background: white; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid ${rep.level === 'federal' ? '#3b82f6' : '#8b5cf6'}; transition: transform 0.2s, box-shadow 0.2s;" 
                                         onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'"
                                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'">
                                        
                                        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                                            ${rep.photo_url ? `
                                                <img src="${rep.photo_url}" 
                                                     alt="${rep.name}"
                                                     style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; background: #f3f4f6;"
                                                     onerror="this.style.display='none'">
                                            ` : `
                                                <div style="width: 80px; height: 80px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white;">
                                                    ${rep.name ? rep.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                            `}
                                            
                                            <div style="flex: 1;">
                                                <h4 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                                                    ${rep.name || 'Unknown'}
                                                    ${rep.verified ? '<span style="background: #10b981; color: white; font-size: 0.6875rem; padding: 0.125rem 0.375rem; border-radius: 4px; font-weight: 600;">✓ VERIFIED</span>' : ''}
                                                </h4>
                                                
                                                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                                                    <span style="background: ${rep.level === 'federal' ? '#dbeafe' : '#ede9fe'}; color: ${rep.level === 'federal' ? '#1e40af' : '#6b21a8'}; padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600;">
                                                        ${rep.level === 'federal' ? '🏛️ FEDERAL' : '📍 STATE'}
                                                    </span>
                                                    <span style="background: #f3f4f6; color: #4b5563; padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.8125rem;">
                                                        ${rep.title || rep.office || 'Representative'}
                                                    </span>
                                                    ${rep.party ? `<span style="background: ${rep.party === 'Democratic' ? '#dbeafe' : rep.party === 'Republican' ? '#fee2e2' : '#f3f4f6'}; color: ${rep.party === 'Democratic' ? '#1e40af' : rep.party === 'Republican' ? '#991b1b' : '#4b5563'}; padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.8125rem;">
                                                        ${rep.party}
                                                    </span>` : ''}
                                                </div>
                                                
                                                ${rep.district ? `<div style="font-size: 0.875rem; color: #6b7280;">📍 District: ${rep.district}</div>` : ''}
                                            </div>
                                        </div>
                                        
                                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                                            ${rep.phone ? `
                                                <a href="tel:${rep.phone}" style="display: flex; align-items: center; gap: 0.5rem; color: #3b82f6; text-decoration: none; padding: 0.5rem; background: #eff6ff; border-radius: 6px; transition: background 0.2s;"
                                                   onmouseover="this.style.background='#dbeafe'"
                                                   onmouseout="this.style.background='#eff6ff'">
                                                    <span style="font-size: 1.25rem;">📞</span>
                                                    <span style="font-size: 0.875rem; font-weight: 500;">${rep.phone}</span>
                                                </a>
                                            ` : ''}
                                            
                                            ${rep.email ? `
                                                <a href="mailto:${rep.email}" style="display: flex; align-items: center; gap: 0.5rem; color: #8b5cf6; text-decoration: none; padding: 0.5rem; background: #f5f3ff; border-radius: 6px; transition: background 0.2s;"
                                                   onmouseover="this.style.background='#ede9fe'"
                                                   onmouseout="this.style.background='#f5f3ff'">
                                                    <span style="font-size: 1.25rem;">✉️</span>
                                                    <span style="font-size: 0.875rem; font-weight: 500;">${rep.email}</span>
                                                </a>
                                            ` : ''}
                                            
                                            ${rep.website ? `
                                                <a href="${rep.website}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 0.5rem; color: #10b981; text-decoration: none; padding: 0.5rem; background: #d1fae5; border-radius: 6px; transition: background 0.2s;"
                                                   onmouseover="this.style.background='#a7f3d0'"
                                                   onmouseout="this.style.background='#d1fae5'">
                                                    <span style="font-size: 1.25rem;">🌐</span>
                                                    <span style="font-size: 0.875rem; font-weight: 500;">Official Website →</span>
                                                </a>
                                            ` : ''}
                                        </div>
                                        
                                        ${rep.source ? `
                                            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb; font-size: 0.75rem; color: #9ca3af; display: flex; justify-content: space-between; align-items: center;">
                                                <span>Source: ${rep.source}</span>
                                                ${rep.term_start ? `<span>Term: ${rep.term_start}${rep.term_end ? ` - ${rep.term_end}` : ''}</span>` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    } else {
                        results.innerHTML = `
                            <div style="padding: 1rem; background: #fef3c7; border-radius: 6px; border: 2px solid #fbbf24;">
                                <p style="margin: 0; color: #92400e;">
                                    ⚠️ No representatives found for ZIP code ${zip}
                                </p>
                            </div>
                        `;
                    }
                    
                    console.log('✅ [V2] Representatives displayed successfully');
                    
                } catch (error) {
                    console.error('❌ [V2] API Error:', error);
                    console.error('❌ [V2] Error type:', error.constructor.name);
                    console.error('❌ [V2] Error message:', error.message);
                    console.error('❌ [V2] Error details:', {
                        message: error.message,
                        name: error.name,
                        stack: error.stack
                    });
                    
                    // ALWAYS show the raw error message prominently
                    results.innerHTML = `
                        <div style="padding: 1rem; background: #fee2e2; border-radius: 6px; border: 2px solid #dc2626;">
                            <p style="margin: 0 0 0.5rem 0; color: #991b1b; font-weight: 600; font-size: 1.125rem;">
                                ❌ Error loading representatives
                            </p>
                            <div style="padding: 1rem; margin: 0.75rem 0; background: #fef2f2; border-radius: 4px; border-left: 4px solid #dc2626;">
                                <p style="margin: 0; font-family: monospace; font-size: 0.875rem; color: #7f1d1d; font-weight: 600;">
                                    ${error.message}
                                </p>
                            </div>
                            <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #7f1d1d;">
                                Common causes:<br>
                                • Backend server not running<br>
                                • CORS not configured<br>
                                • Endpoint /api/representatives not implemented<br>
                                • Network connectivity issue
                            </p>
                            <details style="margin-top: 0.75rem; background: white; padding: 0.5rem; border-radius: 4px;">
                                <summary style="cursor: pointer; font-size: 0.875rem; color: #991b1b; font-weight: 600;">Show Full Technical Details</summary>
                                <pre style="margin-top: 0.5rem; font-size: 0.75rem; padding: 0.5rem; background: #f9fafb; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify({
                                    message: error.message,
                                    name: error.name,
                                    type: error.constructor.name
                                }, null, 2)}</pre>
                            </details>
                        </div>
                    `;
                } finally {
                    // Reset button
                    button.disabled = false;
                    button.style.opacity = '1';
                    button.innerHTML = '<span class="btn-icon">🔍</span> Find Reps';
                }
            });
            
            // Add Enter key support to input field
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('⌨️ [POST-METHOD] Enter key pressed - triggering search');
                    e.preventDefault();
                    button.click();
                }
            });
            
            console.log('✅ [V2] Event listeners attached (click + Enter key)!');
        } else {
            console.error('❌ [V2] Could not find button/input/results elements');
        }
    }
};

// Export to window
window.RepFinder = RepFinder;

// Initialize with retry
function initRepFinderWithRetry(attempt = 1) {
    const maxAttempts = 10;
    
    console.log(`🔄 [V2] Initialization attempt ${attempt}/${maxAttempts}`);
    
    const container = document.getElementById('civicResults');
    
    if (container) {
        console.log('✅ [V2] Container found on attempt', attempt);
        RepFinder.init();
    } else if (attempt < maxAttempts) {
        console.warn(`⏳ [V2] Container not found, retrying in 500ms... (attempt ${attempt})`);
        setTimeout(() => initRepFinderWithRetry(attempt + 1), 500);
    } else {
        console.error('❌ [V2] FAILED - Container never found after', maxAttempts, 'attempts');
        console.error('❌ [V2] Make sure #civicResults exists in your HTML!');
    }
}

// Start initialization
if (document.readyState === 'loading') {
    console.log('📄 [V2] DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ [V2] DOMContentLoaded fired!');
        initRepFinderWithRetry();
    });
} else {
    console.log('✅ [V2] DOM already loaded, initializing immediately...');
    initRepFinderWithRetry();
}

console.log('🏁 [V2] civic-representative-finder-v2.js FINISHED LOADING');
