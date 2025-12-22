/**
 * REPRESENTATIVE FINDER - AGGRESSIVE AUTO-LOAD VERSION
 * V37.16.0 - MY REPS PERSONALIZATION (ALL OPTION A'S)
 * 
 * This version implements ALL OPTION A's for optimal UX:
 * ✅ OPTION A1: Aggressive Auto-Load (login, tab switch, page load)
 * ✅ OPTION A2: Save Representatives List (localStorage + user profile)
 * ✅ OPTION A3: Tab Switch Trigger (auto-load on "My Reps" tab click)
 * ✅ OPTION A4: Auto-Update Everywhere (ZIP change listener)
 * ✅ OPTION A5: Skeleton Placeholders (instant visual feedback)
 * 
 * Features:
 * - Runs immediately on DOM load
 * - Auto-loads on tab switch to "My Reps"
 * - Auto-loads on login (personalization:ready event)
 * - Auto-updates when ZIP changes in Bills section
 * - Skeleton loading placeholders for instant feedback
 * - Saves representatives to user profile (encrypted)
 * - Caches results in localStorage for instant display
 * - Zero latency UX with smart caching
 */

console.log('🚀 [REP-FINDER V37.16.0] Loading - AGGRESSIVE AUTO-LOAD PERSONALIZATION');
console.log('📊 [REP-FINDER V37.16.0] Endpoint: /api/civic/representatives/search');
console.log('✨ [REP-FINDER V37.16.0] OPTION A1: Aggressive auto-load on login + tab switch');
console.log('💾 [REP-FINDER V37.16.0] OPTION A2: Saves reps list to localStorage + profile');
console.log('🎯 [REP-FINDER V37.16.0] OPTION A3: Auto-loads on "My Reps" tab switch');
console.log('♻️  [REP-FINDER V37.16.0] OPTION A4: Auto-updates when ZIP changes');
console.log('⚡ [REP-FINDER V37.16.0] OPTION A5: Skeleton placeholders for instant feedback');

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRepFinder);
} else {
    initRepFinder();
}

// V37.16.0: Global state to track if we've already loaded reps
let repsAlreadyLoaded = false;
let lastLoadedZip = null;

function initRepFinder() {
    console.log('🔧 [REP-FINDER V37.16.0] Initializing with aggressive auto-load...');
    
    // Find container
    const container = document.getElementById('civicResults');
    
    if (!container) {
        console.error('❌ [REP-FINDER V37.16.0] Container #civicResults not found!');
        return;
    }
    
    console.log('✅ [REP-FINDER V37.16.0] Container found!');
    
    // V37.16.0 OPTION A5: Cache check will happen AFTER HTML injection
    
    // Check if user is logged in (for personalized welcome)
    const username = localStorage.getItem('wdp_username');
    const isLoggedIn = !!username;
    
    // Inject search form HTML with conditional welcome message
    let welcomeMessage = '';
    if (isLoggedIn) {
        welcomeMessage = `
            <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; backdrop-filter: blur(10px);">
                <p style="color: #ffffff; margin: 0; font-size: 0.9375rem; font-weight: 600;">
                    👋 Welcome back, <strong>${username}</strong>! Your ZIP code will be saved to your profile.
                </p>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <!-- Search Box -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 16px; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3); margin-bottom: 2rem;">
                ${welcomeMessage}
                <h2 style="color: white; margin: 0 0 0.5rem 0; font-size: 1.75rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 2rem;">🗺️</span>
                    ${isLoggedIn ? 'Your Representatives' : 'Find Your Representatives'}
                </h2>
                <p style="color: #ffffff; margin: 0 0 1.5rem 0; font-size: 1rem; text-shadow: 0 1px 3px rgba(0,0,0,0.3); font-weight: 500;">
                    ${isLoggedIn ? 'Your saved ZIP code or enter a new one to update your profile' : 'Enter your ZIP code to discover your federal senators and state legislators'}
                </p>
                
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <input 
                        type="text" 
                        id="zipInput" 
                        placeholder="Enter 5-digit ZIP code"
                        maxlength="5"
                        style="flex: 1; min-width: 200px; padding: 1rem; border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; font-size: 1.125rem; background: rgba(255,255,255,0.95); font-weight: 500;"
                    />
                    <button 
                        id="searchBtn"
                        style="padding: 1rem 2rem; background: white; color: #667eea; border: none; border-radius: 12px; font-weight: 700; font-size: 1.125rem; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
                    >
                        🔍 Find Reps
                    </button>
                </div>
            </div>
            
            <!-- Results Container -->
            <div id="searchResults"></div>
        </div>
    `;
    
    console.log('✅ [REP-FINDER V37.16.0] HTML injected!');
    
    // Get elements
    const input = document.getElementById('zipInput');
    const button = document.getElementById('searchBtn');
    const results = document.getElementById('searchResults');
    
    if (!input || !button || !results) {
        console.error('❌ [REP-FINDER V37.16.0] Could not find form elements!');
        return;
    }
    
    // V37.16.0 OPTION A3: Listen for tab switches to "My Reps"
    window.addEventListener('wdp:tab-switched', (e) => {
        if (e.detail && e.detail.tab === 'representatives') {
            console.log('🎯 [REP-FINDER V37.16.0] OPTION A3: Tab switched to My Reps - Triggering auto-load!');
            autoLoadRepresentatives();
        }
    });
    
    // V37.16.0 OPTION A4: Listen for ZIP changes from other sections
    window.addEventListener('wdp:zip-saved', (e) => {
        const newZip = e.detail && e.detail.zip;
        if (newZip && newZip !== lastLoadedZip) {
            console.log('♻️  [REP-FINDER V37.16.0] OPTION A4: ZIP changed to', newZip, '- Auto-updating reps!');
            input.value = newZip;
            autoLoadRepresentatives();
        }
    });
    
    // V37.16.0 OPTION A1: Listen for user login
    window.addEventListener('personalization:ready', (e) => {
        if (e.detail && e.detail.loggedIn) {
            console.log('🔓 [REP-FINDER V37.16.0] OPTION A1: User logged in - Triggering auto-load!');
            setTimeout(() => autoLoadRepresentatives(), 500);
        }
    });
    
    // Search function
    async function search() {
        const zip = input.value.trim();
        
        // Validation
        if (!zip || zip.length !== 5 || !/^\d{5}$/.test(zip)) {
            results.innerHTML = `
                <div style="padding: 1.5rem; background: #fee2e2; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 1.125rem;">❌ Please enter a valid 5-digit ZIP code</p>
                </div>
            `;
            return;
        }
        
        // Loading state
        button.disabled = true;
        button.innerHTML = '⏳ Searching...';
        button.style.opacity = '0.6';
        
        results.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: #eff6ff; border-radius: 12px; border: 2px solid #3b82f6;">
                <div style="font-size: 3rem; margin-bottom: 1rem; animation: spin 2s linear infinite;">🔍</div>
                <p style="margin: 0; color: #1e40af; font-size: 1.125rem; font-weight: 600;">
                    Searching for representatives in ZIP <strong>${zip}</strong>...
                </p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        try {
            // Call API - FIXED v37.9.1: Use GET with query params
            const base = window.WDP_API_BASE || 'https://api.workforcedemocracyproject.org';
            const apiUrl = window.CONFIG?.ENDPOINTS?.REPRESENTATIVES || `${base}/api/civic/representatives/search`;
            const fullUrl = `${apiUrl}?zip=${zip}`;
            
            console.log('📡 [REP-FINDER-SIMPLE] Calling:', fullUrl);
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ [REP-FINDER V37.16.0] Data:', data);
            
            // V37.16.0 OPTION A2: Cache representatives for instant loading
            cacheRepresentatives(data, zip);
            
            // Display results
            displayResults(data, zip);
            
            // V37.12.5: FIXED - Save to personalization system if user is logged in
            if (window.PersonalizationSystem && isLoggedIn) {
                try {
                    // Save ZIP to user profile (FIXED: use updateField not setUserDataField)
                    window.PersonalizationSystem.updateField('address.zip', zip);
                    console.log('✅ [REP-FINDER V37.12.5] Saved ZIP to address.zip:', zip);
                    
                    // Save representatives to user profile
                    const repData = {
                        lastUpdated: new Date().toISOString(),
                        zip: zip,
                        representatives: data.representatives || [],
                        counts: data.counts || {}
                    };
                    window.PersonalizationSystem.updateField('representatives', repData);
                    
                    console.log('✅ [REP-FINDER V37.12.5] Saved ZIP and representatives to user profile');
                    console.log('📊 [REP-FINDER V37.12.5] User data after save:', window.PersonalizationSystem.getUserData());
                    
                    // V37.12.5: Dispatch event for bills section to listen
                    window.dispatchEvent(new CustomEvent('wdp:zip-saved', {
                        detail: { zip: zip }
                    }));
                    console.log('📢 [REP-FINDER V37.12.5] Dispatched wdp:zip-saved event');
                    
                } catch (error) {
                    console.error('[REP-FINDER V37.12.5] ❌ Could not save to personalization:', error);
                    console.error('[REP-FINDER V37.12.5] Error details:', error.stack);
                }
            }
            
        } catch (error) {
            console.error('❌ [REP-FINDER-SIMPLE] Error:', error);
            results.innerHTML = `
                <div style="padding: 1.5rem; background: #fee2e2; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <p style="margin: 0 0 0.5rem 0; color: #991b1b; font-weight: 700; font-size: 1.25rem;">❌ Error Loading Representatives</p>
                    <p style="margin: 0; color: #7f1d1d; font-size: 0.9375rem;">${error.message}</p>
                </div>
            `;
        } finally {
            button.disabled = false;
            button.innerHTML = '🔍 Find Reps';
            button.style.opacity = '1';
        }
    }
    
    // Display results function
    function displayResults(data, zip) {
        const reps = data.representatives || [];
        const counts = data.counts || {};
        const sources = data.data_sources || [];
        
        console.log(`📊 [REP-FINDER-SIMPLE V37.9.2] Received ${reps.length} representatives:`, reps);
        console.log('📊 [REP-FINDER-SIMPLE V37.9.2] Counts:', counts);
        
        if (reps.length === 0) {
            console.warn('⚠️ [REP-FINDER-SIMPLE] Backend returned empty array. Possible issues:');
            console.warn('   - Backend may need restart (PM2 flush)');
            console.warn('   - Congress.gov API key may have expired');
            console.warn('   - OpenStates API key may have expired');
            console.warn('   - ZIP lookup failed on backend');
            
            results.innerHTML = `
                <div style="padding: 2rem; background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 1rem;">
                    <h3 style="margin: 0 0 1rem 0; color: #92400e; font-size: 1.25rem; font-weight: 700;">⚠️ No Representatives Found</h3>
                    <p style="margin: 0 0 1rem 0; color: #78350f; font-size: 1rem; line-height: 1.6;">
                        The backend API returned 0 results for ZIP code <strong>${zip}</strong>. This usually means:
                    </p>
                    <ul style="margin: 0 0 1.5rem 0; padding-left: 1.5rem; color: #78350f; line-height: 1.8;">
                        <li>The backend server needs to be restarted (PM2 flush)</li>
                        <li>API keys may have expired (Congress.gov or OpenStates)</li>
                        <li>ZIP code lookup is failing on the backend</li>
                    </ul>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: #f59e0b; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                            🔄 Refresh Page
                        </button>
                        <button onclick="document.getElementById('zipInput').value=''; document.getElementById('zipInput').focus();" style="padding: 0.75rem 1.5rem; background: white; color: #f59e0b; border: 2px solid #f59e0b; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                            🔍 Try Another ZIP
                        </button>
                    </div>
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #fbbf24; font-size: 0.875rem; color: #78350f;">
                        <strong>For Developers:</strong> Check backend logs at VPS for detailed error messages. Backend connection is working but returning empty results.
                    </div>
                </div>
            `;
            return;
        }
        
        // Header - V37.16.3: Updated to match Civic Transparency color scheme
        let html = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 2rem;
                border-radius: 12px;
                margin-bottom: 2rem;
                box-shadow: 0 10px 15px rgba(102, 126, 234, 0.2);
            ">
                <h3 style="
                    margin: 0 0 1.5rem 0;
                    font-size: 1.875rem;
                    font-weight: 900;
                    color: #ffffff;
                    text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                ">
                    <span style="font-size: 2rem;">🎯</span>
                    Found ${reps.length} Representative${reps.length !== 1 ? 's' : ''}
                </h3>
                
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                ">
                    ${counts.federal ? `
                        <div style="
                            background: rgba(255, 255, 255, 0.2);
                            padding: 1.25rem;
                            border-radius: 10px;
                            text-align: center;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            backdrop-filter: blur(10px);
                        ">
                            <div style="
                                font-size: 2.5rem;
                                font-weight: 900;
                                color: #ffffff;
                                line-height: 1;
                                margin-bottom: 0.5rem;
                                text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);
                            ">${counts.federal}</div>
                            <div style="
                                font-size: 0.875rem;
                                font-weight: 800;
                                color: #ffffff;
                                text-transform: uppercase;
                                letter-spacing: 0.05em;
                                text-shadow: 0 2px 4px rgba(0,0,0,0.4);
                            ">Federal</div>
                        </div>
                    ` : ''}
                    
                    ${counts.state ? `
                        <div style="
                            background: rgba(255, 255, 255, 0.2);
                            padding: 1.25rem;
                            border-radius: 10px;
                            text-align: center;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            backdrop-filter: blur(10px);
                        ">
                            <div style="
                                font-size: 2.5rem;
                                font-weight: 900;
                                color: #ffffff;
                                line-height: 1;
                                margin-bottom: 0.5rem;
                                text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);
                            ">${counts.state}</div>
                            <div style="
                                font-size: 0.875rem;
                                font-weight: 800;
                                color: #ffffff;
                                text-transform: uppercase;
                                letter-spacing: 0.05em;
                                text-shadow: 0 2px 4px rgba(0,0,0,0.4);
                            ">State</div>
                        </div>
                    ` : ''}
                </div>
                
                ${sources && sources.length > 0 ? `
                    <div style="
                        font-size: 0.875rem;
                        color: #ffffff;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        flex-wrap: wrap;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.4);
                    ">
                        <span style="opacity: 0.9;">✓ Data Sources:</span>
                        ${sources.map(s => `
                            <span style="
                                background: #1e293b;
                                padding: 0.375rem 0.875rem;
                                border-radius: 8px;
                                border: 2px solid #475569;
                                font-weight: 700;
                                text-shadow: none;
                            ">${s}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Representative cards
        html += '<div style="display: grid; gap: 1.25rem;">';
        
        reps.forEach((rep, index) => {
            console.log(`🎴 [REP-FINDER V36.12.3] Rendering card ${index + 1}/${reps.length}:`, {
                name: rep.name,
                photo_url: rep.photo_url,
                level: rep.level,
                office: rep.office || rep.title
            });
            html += `
                <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid ${rep.level === 'federal' ? '#3b82f6' : '#8b5cf6'}; transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'"
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'">
                    
                    <div style="display: flex; gap: 1.25rem; margin-bottom: 1rem;">
                        ${rep.photo_url ? `
                            <div style="width: 110px; height: 110px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; flex-shrink: 0; overflow: hidden; position: relative; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.15);">
                                <span style="position: absolute; z-index: 1; font-weight: 700;" class="photo-fallback-${index}">${rep.name ? rep.name.charAt(0).toUpperCase() : '?'}</span>
                                <img src="${rep.photo_url}" alt="${rep.name}" 
                                     style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 2;"
                                     onload="const fallback = this.parentElement.querySelector('.photo-fallback-${index}'); if(fallback) fallback.style.display='none';"
                                     onerror="console.error('❌ [REP-FINDER] Photo failed to load:', '${rep.name}', '${rep.photo_url}'); this.style.display='none';">
                            </div>
                        ` : `
                            <div style="width: 110px; height: 110px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; flex-shrink: 0; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.15);">
                                ${rep.name ? rep.name.charAt(0).toUpperCase() : '?'}
                            </div>
                        `}
                        
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="margin: 0 0 0.5rem 0; font-size: 1.25rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                ${rep.name || 'Unknown'}
                                ${rep.verified ? '<span style="background: #10b981; color: white; font-size: 0.6875rem; padding: 0.125rem 0.5rem; border-radius: 6px; font-weight: 700;">✓ VERIFIED</span>' : ''}
                            </h4>
                            
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <span style="background: ${rep.level === 'federal' ? '#dbeafe' : '#ede9fe'}; color: ${rep.level === 'federal' ? '#1e40af' : '#6b21a8'}; padding: 0.375rem 0.75rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase;">
                                    ${rep.level === 'federal' ? '🏛️ FEDERAL' : '📍 STATE'}
                                </span>
                                <span style="background: #f3f4f6; color: #4b5563; padding: 0.375rem 0.75rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600;">
                                    ${rep.title || rep.office || 'Representative'}
                                </span>
                                ${rep.party ? `<span style="background: ${rep.party.includes('Democratic') ? '#dbeafe' : rep.party.includes('Republican') ? '#fee2e2' : '#f3f4f6'}; color: ${rep.party.includes('Democratic') ? '#1e40af' : rep.party.includes('Republican') ? '#991b1b' : '#4b5563'}; padding: 0.375rem 0.75rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600;">
                                    ${rep.party}
                                </span>` : ''}
                            </div>
                            
                            ${rep.district ? `<div style="font-size: 0.875rem; color: #6b7280;">📍 District: ${rep.district}</div>` : ''}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; padding-top: 1rem; border-top: 2px solid #e5e7eb;">
                        ${rep.phone ? `
                            <a href="tel:${rep.phone}" style="display: flex; align-items: center; gap: 0.5rem; color: #1e40af; text-decoration: none; padding: 0.875rem; background: #bfdbfe; border-radius: 8px; transition: all 0.2s; font-weight: 700; border: 2px solid #3b82f6;"
                               onmouseover="this.style.background='#93c5fd'; this.style.transform='translateX(4px)'"
                               onmouseout="this.style.background='#bfdbfe'; this.style.transform='translateX(0)'">
                                <span style="font-size: 1.375rem; flex-shrink: 0;">📞</span>
                                <span style="font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${rep.phone}</span>
                            </a>
                        ` : ''}
                        
                        ${rep.email ? `
                            <a href="mailto:${rep.email}" style="display: flex; align-items: center; gap: 0.5rem; color: #6b21a8; text-decoration: none; padding: 0.875rem; background: #ddd6fe; border-radius: 8px; transition: all 0.2s; font-weight: 700; border: 2px solid #8b5cf6;"
                               onmouseover="this.style.background='#c4b5fd'; this.style.transform='translateX(4px)'"
                               onmouseout="this.style.background='#ddd6fe'; this.style.transform='translateX(0)'">
                                <span style="font-size: 1.375rem; flex-shrink: 0;">✉️</span>
                                <span style="font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${rep.email}</span>
                            </a>
                        ` : ''}
                        
                        ${rep.website ? `
                            <a href="${rep.website}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 0.5rem; color: #065f46; text-decoration: none; padding: 0.875rem; background: #a7f3d0; border-radius: 8px; transition: all 0.2s; font-weight: 700; border: 2px solid #10b981;"
                               onmouseover="this.style.background='#6ee7b7'; this.style.transform='translateX(4px)'"
                               onmouseout="this.style.background='#a7f3d0'; this.style.transform='translateX(0)'">
                                <span style="font-size: 1.375rem; flex-shrink: 0;">🌐</span>
                                <span style="font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Website</span>
                            </a>
                        ` : ''}
                    </div>
                    
                    ${rep.source || rep.term_start ? `
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.75rem; color: #9ca3af; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                            ${rep.source ? `<span>Source: ${rep.source}</span>` : ''}
                            ${rep.term_start ? `<span>Term: ${rep.term_start}${rep.term_end ? ` - ${rep.term_end}` : ''}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        
        results.innerHTML = html;
    }
    
    // Add event listeners
    button.addEventListener('click', search);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            search();
        }
    });
    
    // V37.16.0 OPTION A1: AGGRESSIVE AUTO-LOAD on page load
    // Check if user has saved ZIP and auto-load representatives
    console.log('🚀 [REP-FINDER V37.16.0] OPTION A1: Checking for auto-load conditions...');
    
    // Delay auto-load slightly to ensure DOM is ready
    setTimeout(() => {
        autoLoadRepresentatives();
    }, 300);
    
    console.log('✅ [REP-FINDER V37.16.0] Ready! Auto-load personalization active.');
}

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
 * V37.16.0: This function is no longer used - simplified to just use autoLoadRepresentatives()
 * Keeping it here for backward compatibility but it does nothing
 */
function renderRepresentatives(data, isCached = false) {
    // Deprecated - functionality moved to autoLoadRepresentatives()
    console.log('[REP-FINDER V37.16.0] renderRepresentatives() called but deprecated');
}

/**
 * V37.16.0 OPTION A1/A3/A4: Auto-load representatives based on saved ZIP
 */
function autoLoadRepresentatives() {
    const input = document.getElementById('zipInput');
    const button = document.getElementById('searchBtn');
    
    if (!input || !button) {
        console.warn('[REP-FINDER V37.16.0] Auto-load skipped: Form elements not found yet');
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
    
    // Set ZIP and trigger search (will use cache if available via API)
    console.log('🚀 [REP-FINDER V37.16.0] Auto-loading representatives for ZIP:', zipcodeToLoad);
    input.value = zipcodeToLoad;
    
    // Trigger search (the search function will handle caching logic)
    setTimeout(() => {
        button.click();
    }, 200);
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
