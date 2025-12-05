/**
 * UNIFIED PERSONALIZATION MODULE
 * Single opt-in for ALL personalization features
 * Created: January 23, 2025
 * 
 * Features Included:
 * - Local Representatives Tracker (requires postcode)
 * - Ethical Business Finder (requires postcode)
 * - Civic Voting Tracker (no extra data needed)
 * - Learning Progress & Recommendations (no extra data needed)
 */

/**
 * Check if user has already made a personalization choice
 * Show modal on first visit (but respect if they closed it)
 */
function checkPersonalizationChoice() {
    const choice = localStorage.getItem('wdp_personalization_choice');
    const modalClosed = sessionStorage.getItem('wdp_modal_closed');
    const modal = document.getElementById('personalizationModal');
    
    // Only show if:
    // 1. No choice made yet (first visit)
    // 2. User hasn't closed it this session
    if (!choice && !modalClosed && modal) {
        // First-time visitor - show modal after 2 seconds
        setTimeout(() => {
            modal.style.display = 'flex';
        }, 2000);
    }
}

/**
 * Accept unified personalization (Enable All Features)
 */
async function acceptUnifiedPersonalization() {
    const postcodeInput = document.getElementById('personalizationPostcode');
    const postcode = postcodeInput ? postcodeInput.value.trim() : '';
    
    const professionInput = document.getElementById('personalizationProfession');
    const profession = professionInput ? professionInput.value.trim() : '';
    
    // Store unified consent
    localStorage.setItem('wdp_personalization_choice', 'enabled');
    localStorage.setItem('wdp_personalization_enabled', 'true');
    localStorage.setItem('wdp_personalization_consent_date', new Date().toISOString());
    
    // Store location if provided (for local reps & business finder)
    if (postcode) {
        const locationData = {
            postcode: postcode,
            derivedLocation: deriveLocationFromPostcode(postcode),
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('wdp_user_location', JSON.stringify(locationData));
    }
    
    // Store profession if provided (for jobs section personalization)
    if (profession) {
        const professionData = {
            profession: profession,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('wdp_user_profession', JSON.stringify(professionData));
        console.log('✅ Saved user profession:', profession);
    }
    
    // Initialize empty profiles if they don't exist
    if (!localStorage.getItem('wdp_learning_profile')) {
        const learningProfile = {
            billsViewed: [],
            votingHistory: [],
            categoriesInterested: {},
            timeSpent: {},
            questionsAsked: [],
            knowledgeLevel: 'beginner',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('wdp_learning_profile', JSON.stringify(learningProfile));
    }
    
    if (!localStorage.getItem('wdp_civic_voting_data')) {
        const civicData = {
            votingHistory: {},
            selectedDistrict: null,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('wdp_civic_voting_data', JSON.stringify(civicData));
    }
    
    // Hide modal
    const modal = document.getElementById('personalizationModal');
    if (modal) modal.style.display = 'none';
    
    // NOTE: Success feedback now shown inline in unified onboarding modal
    // No annoying toast notifications! (V33.0.0 improvement)
    // if (typeof showNotification === 'function') {
    //     showNotification('✅ Personalization enabled! Your data is encrypted and stored only on your device.', 'success');
    // }
    
    // Trigger personalization features initialization
    initializePersonalizationFeatures();
    
    // Refresh ethical business section if it exists
    if (typeof refreshEthicalBusinessSection === 'function') {
        refreshEthicalBusinessSection();
    }
}

/**
 * Close personalization modal (X button - no choice made)
 */
function closePersonalizationModal() {
    const modal = document.getElementById('personalizationModal');
    if (modal) modal.style.display = 'none';
    
    // Remember they closed it this session (don't show again until they refresh)
    sessionStorage.setItem('wdp_modal_closed', 'true');
    
    // NOTE: No annoying notifications! (V33.0.0 improvement)
    // User can enable from Privacy page anytime - they don't need a notification telling them this
    // if (typeof showNotification === 'function') {
    //     showNotification('You can enable personalization anytime from the Privacy page.', 'info');
    // }
}

/**
 * Close modal if user clicks outside of it
 */
function closePersonalizationModalIfOutside(event) {
    // Only close if clicking on the overlay itself, not the modal content
    if (event.target.id === 'personalizationModal') {
        closePersonalizationModal();
    }
}

/**
 * Manually open personalization modal (V36.3.2.1 - Fixed for new welcome modal)
 * Used by "Enable Personalization" buttons throughout the site
 */
function openPersonalizationModal() {
    // V36.3.2.1: Updated to use new welcome modal ID and proper class system
    const modal = document.getElementById('wdpWelcomeModal');
    if (modal) {
        // Use the same class system as the modal's open/close functions
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        
        // Pre-fill postcode if already saved
        const locationData = getUserLocation();
        if (locationData && locationData.postcode) {
            // New modal uses different input ID
            const postcodeInput = document.getElementById('wdpPostcode');
            if (postcodeInput) {
                postcodeInput.value = locationData.postcode;
            }
        }
        
        // Auto-check the opt-in checkbox
        const optInCheckbox = document.getElementById('wdpPersonalizationOptIn');
        if (optInCheckbox) {
            optInCheckbox.checked = true;
        }
        
        // Scroll to personalization section within modal
        setTimeout(() => {
            const personalizationCard = document.querySelector('.wdp-card-personalization');
            if (personalizationCard) {
                personalizationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
        
        console.log('[Personalization] Welcome modal opened manually');
    } else {
        console.error('[Personalization] Welcome modal element not found! Looking for #wdpWelcomeModal');
    }
}

/**
 * Skip personalization (Maybe Later - permanent skip)
 */
function skipUnifiedPersonalization() {
    localStorage.setItem('wdp_personalization_choice', 'skipped');
    localStorage.setItem('wdp_personalization_enabled', 'false');
    
    // Hide modal
    const modal = document.getElementById('personalizationModal');
    if (modal) modal.style.display = 'none';
    
    // Clear session flag since they made a permanent choice
    sessionStorage.removeItem('wdp_modal_closed');
    
    // NOTE: No annoying notifications! (V33.0.0 improvement)
    // User made their choice - no need to nag them
    // if (typeof showNotification === 'function') {
    //     showNotification('You can enable personalization anytime from the Privacy page.', 'info');
    // }
}

/**
 * Initialize personalization features after enabling (V36.4.0 - FIXED: Location vs Tracking)
 * 
 * IMPORTANT DISTINCTION:
 * - LOCATION PERSONALIZATION = Requires opt-in + postcode (Bills, Ethical Business)
 * - FEATURE TRACKING = Always active, no opt-in needed (Learning, FAQ, Civic votes)
 */
function initializePersonalizationFeatures() {
    console.log('[Personalization] V36.4.0 - Initializing features...');
    
    // ============================================================
    // PART 1: LOCATION-BASED FEATURES (requires opt-in)
    // ============================================================
    const locationData = localStorage.getItem('wdp_user_location');
    if (locationData) {
        try {
            const location = JSON.parse(locationData);
            console.log('[Personalization] ✅ User location loaded:', location.postcode, location.derivedLocation);
            
            const postcode = location.postcode;
            let syncedSections = [];
            
            // 1. Bills Section (Legislative Research) - LOCATION-BASED
            if (typeof fetchBillsForLocation === 'function') {
                console.log('[Personalization] 🏛️ Syncing bills section with postcode...');
                fetchBillsForLocation(postcode);
                syncedSections.push('Bills');
            } else {
                console.warn('[Personalization] ⚠️ fetchBillsForLocation() not available');
            }
            
            // 2. Ethical Business Finder - LOCATION-BASED
            if (typeof loadLocalResources === 'function') {
                console.log('[Personalization] 🤝 Syncing ethical business section with postcode...');
                loadLocalResources(postcode);
                syncedSections.push('Ethical Business');
            } else {
                console.warn('[Personalization] ⚠️ loadLocalResources() not available');
            }
            
            // 3. Local Representatives Tracker - LOCATION-BASED (future feature)
            if (typeof loadLocalRepresentatives === 'function') {
                console.log('[Personalization] 👥 Syncing representatives with location...');
                loadLocalRepresentatives(location.derivedLocation);
                syncedSections.push('Representatives');
            }
            
            // Dispatch event for future location-based features
            const postcodeEvent = new CustomEvent('wdp:postcode-updated', {
                detail: {
                    postcode: postcode,
                    location: location.derivedLocation
                }
            });
            document.dispatchEvent(postcodeEvent);
            
            // Summary
            console.log(`[Personalization] ✅ Location features synced: ${syncedSections.join(', ')}`);
            if (syncedSections.length === 0) {
                console.warn('[Personalization] ⚠️ No location features synced - modules may not be loaded yet');
            }
            
        } catch (e) {
            console.error('[Personalization] ❌ Error loading location data:', e);
        }
    } else {
        console.log('[Personalization] ℹ️ No location data - location features disabled');
        console.log('[Personalization] ℹ️ User can enable by clicking "Enable Personalization" in Bills section');
    }
    
    // ============================================================
    // PART 2: FEATURE TRACKING (always active, NO opt-in required)
    // ============================================================
    console.log('[Personalization] 🔄 Initializing feature tracking (always active)...');
    
    // Learning profile tracking - tracks what user views/explores
    if (typeof initializeLearningTracking === 'function') {
        initializeLearningTracking();
        console.log('[Personalization] ✅ Learning tracking active');
    }
    
    // Civic voting tracker - tracks user's votes on bills
    if (typeof initializeCivicVoting === 'function') {
        initializeCivicVoting();
        console.log('[Personalization] ✅ Civic voting tracking active');
    }
    
    // FAQ interaction tracking - tracks which questions user explores
    // (No function to call - FAQ auto-tracks when questions are viewed)
    console.log('[Personalization] ✅ FAQ tracking active (automatic)');
    
    console.log('[Personalization] 🎉 Initialization complete');
    console.log('[Personalization] 📍 Location features:', locationData ? 'ENABLED' : 'DISABLED');
}

// Expose to window for welcome modal
window.initializePersonalizationFeatures = initializePersonalizationFeatures;

/**
 * Check if personalization is enabled
 */
function isPersonalizationEnabled() {
    return localStorage.getItem('wdp_personalization_enabled') === 'true';
}

/**
 * Get user location (postcode + derived data)
 */
function getUserLocation() {
    const locationData = localStorage.getItem('wdp_user_location');
    if (!locationData) return null;
    
    try {
        return JSON.parse(locationData);
    } catch (e) {
        return null;
    }
}

/**
 * Get learning profile
 */
function getLearningProfile() {
    const profile = localStorage.getItem('wdp_learning_profile');
    if (!profile) return null;
    
    try {
        return JSON.parse(profile);
    } catch (e) {
        return null;
    }
}

/**
 * Update learning profile
 */
function updateLearningProfile(updates) {
    const profile = getLearningProfile();
    if (!profile) return;
    
    const updatedProfile = { ...profile, ...updates };
    localStorage.setItem('wdp_learning_profile', JSON.stringify(updatedProfile));
}

/**
 * Get civic voting data
 */
function getCivicVotingData() {
    const data = localStorage.getItem('wdp_civic_voting_data');
    if (!data) return null;
    
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

/**
 * Update civic voting data
 */
function updateCivicVotingData(updates) {
    const data = getCivicVotingData();
    if (!data) return;
    
    const updatedData = { ...data, ...updates };
    localStorage.setItem('wdp_civic_voting_data', JSON.stringify(updatedData));
}

// ===========================
// PRIVACY PAGE FUNCTIONS
// ===========================

/**
 * Initialize personalization status display on privacy page
 */
function initializePersonalizationStatus() {
    const statusText = document.getElementById('personalization-status-text');
    const toggleBtn = document.getElementById('personalization-toggle-btn');
    
    if (!statusText || !toggleBtn) return; // Not on privacy page
    
    const isEnabled = localStorage.getItem('wdp_personalization_enabled') === 'true';
    
    if (isEnabled) {
        const consentDate = localStorage.getItem('wdp_personalization_consent_date');
        const dateStr = consentDate ? new Date(consentDate).toLocaleDateString() : 'Unknown';
        
        const locationData = getUserLocation();
        const locationStr = locationData ? `Location: ${locationData.postcode}` : 'No location saved';
        
        statusText.innerHTML = `
            <span style="color: #7FB069;"><i class="fas fa-check-circle"></i> <strong>Personalization Enabled</strong></span><br>
            <span style="font-size: 0.95rem; color: rgba(255, 255, 255, 0.85);">Active since ${dateStr}</span><br>
            <span style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.75);">${locationStr}</span>
        `;
        
        toggleBtn.className = 'btn btn-secondary';
        toggleBtn.innerHTML = '<i class="fas fa-toggle-on"></i> Disable Personalization';
    } else {
        statusText.innerHTML = `
            <span style="color: #FF6B6B;"><i class="fas fa-times-circle"></i> <strong>Personalization Disabled</strong></span><br>
            <span style="font-size: 0.95rem; color: rgba(255, 255, 255, 0.85);">No data is being tracked</span>
        `;
        
        toggleBtn.className = 'btn btn-primary';
        toggleBtn.innerHTML = '<i class="fas fa-toggle-off"></i> Enable Personalization';
    }
}

/**
 * Toggle personalization on/off (from privacy page)
 */
function togglePersonalization() {
    const isEnabled = localStorage.getItem('wdp_personalization_enabled') === 'true';
    
    if (isEnabled) {
        // Disable personalization
        if (confirm('⚠️ Disable Personalization?\n\nThis will stop tracking your interests, but will NOT delete your existing data.\n\nTo delete data, use the "Delete Personalization Data" button below.')) {
            localStorage.setItem('wdp_personalization_enabled', 'false');
            
            // Optional: Show subtle feedback (not annoying like before)
            // Commenting out for V33.0.0 - user already confirmed, no need for notification
            // if (typeof showNotification === 'function') {
            //     showNotification('Personalization disabled. Your data is preserved but no longer being updated.', 'success');
            // }
            
            initializePersonalizationStatus();
        }
    } else {
        // Enable personalization - show the unified modal
        const modal = document.getElementById('personalizationModal');
        if (modal) {
            // Reopen the modal
            modal.style.display = 'flex';
        } else {
            // Fallback if modal doesn't exist (on privacy page)
            if (confirm('✨ Enable Personalization?\n\nWe\'ll track your interests and voting patterns ON YOUR DEVICE ONLY to provide personalized recommendations.\n\n✅ All data encrypted\n✅ Never sent to servers\n✅ Delete anytime\n\nEnable now?')) {
                localStorage.setItem('wdp_personalization_enabled', 'true');
                localStorage.setItem('wdp_personalization_choice', 'enabled');
                localStorage.setItem('wdp_personalization_consent_date', new Date().toISOString());
                
                // Initialize empty profiles
                if (!localStorage.getItem('wdp_learning_profile')) {
                    const learningProfile = {
                        billsViewed: [],
                        votingHistory: [],
                        categoriesInterested: {},
                        timeSpent: {},
                        questionsAsked: [],
                        knowledgeLevel: 'beginner',
                        createdAt: new Date().toISOString()
                    };
                    localStorage.setItem('wdp_learning_profile', JSON.stringify(learningProfile));
                }
                
                // Optional: Show subtle feedback
                // Commenting out for V33.0.0 - user already confirmed, no need for notification
                // if (typeof showNotification === 'function') {
                //     showNotification('✅ Personalization enabled!', 'success');
                // }
                
                initializePersonalizationStatus();
            }
        }
    }
}

/**
 * Toggle expandable explanation sections
 */
function toggleExplanation(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const icon = document.getElementById(`${sectionId}-icon`);
    
    if (!content || !icon) return;
    
    if (content.style.maxHeight && content.style.maxHeight !== '0px') {
        // Close
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
    } else {
        // Open
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
}

/**
 * Delete only personalization data (keep privacy settings)
 */
function deletePersonalizationData() {
    const confirmation = confirm(
        '⚠️ DELETE PERSONALIZATION DATA?\n\n' +
        'This will permanently delete:\n' +
        '• Your voting history on bills\n' +
        '• Tracked interests and categories\n' +
        '• Learning progress and bookmarks\n' +
        '• Questions asked and time spent\n' +
        '• Saved location (postcode/ZIP)\n' +
        '• Local representatives data\n' +
        '• Ethical business preferences\n\n' +
        'This will NOT delete:\n' +
        '✓ Your privacy settings\n' +
        '✓ Language preferences\n' +
        '✓ Tour completion status\n\n' +
        'This action CANNOT be undone. Continue?'
    );
    
    if (!confirmation) return;
    
    const finalConfirm = confirm(
        '🚨 FINAL CONFIRMATION\n\n' +
        'Are you absolutely sure you want to permanently delete all personalization data?\n\n' +
        'Type "DELETE" in the next prompt to confirm.'
    );
    
    if (!finalConfirm) return;
    
    const typeConfirm = prompt('Type DELETE (in capital letters) to confirm permanent deletion:');
    
    if (typeConfirm === 'DELETE') {
        // Secure deletion of personalization data (DOD 5220.22-M standard)
        const keysToDelete = [
            'wdp_learning_profile',
            'wdp_civic_voting_data',
            'wdp_user_location',
            'wdp_personalization_data',
            'wdp_user_interests',
            'wdp_bills_viewed',
            'wdp_categories_explored',
            'wdp_time_tracking',
            'wdp_knowledge_level',
            'wdp_bookmarked_content',
            'wdp_learning_progress',
            // Legacy keys (from old system)
            'learning_profile',
            'civicVotingData',
            'user_preferences',
            'personalizationChoice',
            'personalization_enabled',
            'personalization_consent_date'
        ];
        
        keysToDelete.forEach(key => {
            if (localStorage.getItem(key)) {
                // 3-pass DOD wipe
                for (let pass = 0; pass < 3; pass++) {
                    if (pass === 0) {
                        localStorage.setItem(key, '\x00'.repeat(1000)); // Pass 1: zeros
                    } else if (pass === 1) {
                        localStorage.setItem(key, '\xFF'.repeat(1000)); // Pass 2: ones
                    } else {
                        const randomData = Array.from({length: 1000}, () => 
                            String.fromCharCode(Math.floor(Math.random() * 256))
                        ).join('');
                        localStorage.setItem(key, randomData); // Pass 3: random
                    }
                }
                localStorage.removeItem(key);
            }
        });
        
        // Also disable personalization
        localStorage.setItem('wdp_personalization_enabled', 'false');
        localStorage.setItem('wdp_personalization_choice', 'deleted');
        
        // User already went through 3 confirmations, they KNOW it's deleted
        // No need for yet another notification!
        // if (typeof showNotification === 'function') {
        //     showNotification('✅ Personalization data permanently deleted. Tracking disabled.', 'success');
        // }
        
        initializePersonalizationStatus();
        
        // Reload page after 2 seconds
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        // User cancelled - they know what happened, no notification needed
        // if (typeof showNotification === 'function') {
        //     showNotification('❌ Deletion cancelled.', 'info');
        // }
    }
}

/**
 * Enable device sync (WebRTC peer-to-peer)
 */
function enableDeviceSync() {
    const isPersonalizationEnabled = localStorage.getItem('wdp_personalization_enabled') === 'true';
    
    if (!isPersonalizationEnabled) {
        alert('⚠️ Personalization Required\n\nYou must enable personalization before you can sync data across devices.\n\nEnable personalization first, then try again.');
        return;
    }
    
    alert(
        '🔄 Device Sync (Coming Soon)\n\n' +
        'Local WiFi device sync will be available in a future update!\n\n' +
        'This feature will allow you to:\n' +
        '• Sync personalization data between your devices\n' +
        '• Use peer-to-peer WebRTC (no servers)\n' +
        '• Keep complete privacy and security\n' +
        '• Only sync when on same WiFi network\n\n' +
        'Stay tuned for this privacy-first sync feature!'
    );
    
    // TODO: Implement WebRTC peer-to-peer sync
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Derive location from postcode (supports US, UK, CA, AU)
 * This is a simplified version - in production, use a proper geocoding API
 */
function deriveLocationFromPostcode(postcode) {
    if (!postcode) return { country: 'Unknown', state: 'Unknown', district: 'Unknown' };
    
    const cleanPostcode = postcode.trim().toUpperCase();
    
    // UK postcode pattern (MUST check first - alphanumeric, e.g., SW1A 1AA)
    if (/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(cleanPostcode)) {
        const area = cleanPostcode.substring(0, 2);
        return { country: 'UK', state: 'England', district: area };
    }
    
    // Canadian postal code pattern (alphanumeric, e.g., K1A 0B1)
    if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(cleanPostcode)) {
        const province = cleanPostcode.charAt(0);
        const provinceMap = {
            'K': 'Ontario',
            'M': 'Ontario',
            'H': 'Quebec',
            'V': 'British Columbia',
            'T': 'Alberta'
        };
        return { 
            country: 'Canada', 
            state: provinceMap[province] || 'Canada', 
            district: cleanPostcode.substring(0, 3) 
        };
    }
    
    // Australian postcode pattern (4 digits only - check before 5-digit codes)
    if (/^\d{4}$/.test(cleanPostcode)) {
        const postcodeNum = parseInt(cleanPostcode);
        if (postcodeNum >= 2000 && postcodeNum <= 2999) {
            return { country: 'Australia', state: 'New South Wales', district: 'NSW-' + Math.floor(postcodeNum / 100) };
        } else if (postcodeNum >= 3000 && postcodeNum <= 3999) {
            return { country: 'Australia', state: 'Victoria', district: 'VIC-' + Math.floor(postcodeNum / 100) };
        } else if (postcodeNum >= 4000 && postcodeNum <= 4999) {
            return { country: 'Australia', state: 'Queensland', district: 'QLD-' + Math.floor(postcodeNum / 100) };
        } else {
            return { country: 'Australia', state: 'Australia', district: cleanPostcode };
        }
    }
    
    // 5-digit codes (US, Mexico, France, Germany) - must differentiate by range
    if (/^\d{5}(-?\d{4})?$/.test(cleanPostcode)) {
        const zip = cleanPostcode.substring(0, 5);
        const zipNum = parseInt(zip);
        
        // US-specific ranges (most definitive)
        if ((zipNum >= 35000 && zipNum <= 36999) || // Alabama
            (zipNum >= 99500 && zipNum <= 99999) || // Alaska
            (zipNum >= 85000 && zipNum <= 86999) || // Arizona
            (zipNum >= 90000 && zipNum <= 96699) || // California
            (zipNum >= 80000 && zipNum <= 81999) || // Colorado (conflict with Mexico Sinaloa)
            (zipNum >= 32000 && zipNum <= 34999) || // Florida
            (zipNum >= 60000 && zipNum <= 62999) || // Illinois
            (zipNum >= 46000 && zipNum <= 47999) || // Indiana
            (zipNum >= 70000 && zipNum <= 71999) || // Louisiana
            (zipNum >= 48000 && zipNum <= 49999) || // Michigan
            (zipNum >= 55000 && zipNum <= 56999) || // Minnesota
            (zipNum >= 27000 && zipNum <= 28999) || // North Carolina
            (zipNum >= 43000 && zipNum <= 45999) || // Ohio
            (zipNum >= 73000 && zipNum <= 74999) || // Oklahoma
            (zipNum >= 97000 && zipNum <= 97999) || // Oregon
            (zipNum >= 15000 && zipNum <= 19699) || // Pennsylvania
            (zipNum >= 75000 && zipNum <= 79999) || // Texas (conflict with France Paris)
            (zipNum >= 98000 && zipNum <= 99499))   // Washington
        {
            return { country: 'US', state: 'United States', district: zip };
        }
        
        // Mexico-specific ranges (check before generic US)
        if ((zipNum >= 1000 && zipNum <= 16999) ||   // Mexico City
            (zipNum >= 20000 && zipNum <= 24999) ||   // Oaxaca, Puebla
            (zipNum >= 44000 && zipNum <= 45999) ||   // Jalisco (Guadalajara)
            (zipNum >= 64000 && zipNum <= 67999) ||   // Nuevo León (Monterrey)
            (zipNum >= 82000 && zipNum <= 82999))     // Sinaloa (specific to avoid US Colorado)
        {
            return { country: 'Mexico', state: 'México', district: 'MX-' + cleanPostcode.substring(0, 2) };
        }
        
        // France-specific ranges (check distinct ranges)
        if ((zipNum >= 75000 && zipNum <= 75020) ||  // Paris arrondissements
            (zipNum >= 69000 && zipNum <= 69009) ||   // Lyon
            (zipNum >= 13000 && zipNum <= 13999) ||   // Marseille
            (zipNum >= 31000 && zipNum <= 31999) ||   // Toulouse
            (zipNum >= 33000 && zipNum <= 33999) ||   // Bordeaux
            (zipNum >= 59000 && zipNum <= 59999) ||   // Lille
            (zipNum >= 67000 && zipNum <= 67999))     // Strasbourg
        {
            return { country: 'France', state: 'France', district: 'FR-' + cleanPostcode.substring(0, 2) };
        }
        
        // Germany-specific ranges
        if ((zipNum >= 10000 && zipNum <= 14999) ||  // Berlin
            (zipNum >= 20000 && zipNum <= 21999) ||   // Hamburg
            (zipNum >= 80000 && zipNum <= 81999) ||   // München (Munich)
            (zipNum >= 50000 && zipNum <= 51999) ||   // Köln (Cologne)
            (zipNum >= 60000 && zipNum <= 60599) ||   // Frankfurt
            (zipNum >= 70000 && zipNum <= 70999))     // Stuttgart
        {
            return { country: 'Germany', state: 'Deutschland', district: 'DE-' + cleanPostcode.substring(0, 2) };
        }
        
        // Default to US for other 5-digit codes (most common)
        return { country: 'US', state: 'United States', district: zip };
    }
    
    // Fallback for unknown format
    return { country: 'Unknown', state: 'Unknown', district: cleanPostcode };
}

// ===========================
// INITIALIZATION
// ===========================

// ===== V33.0.0: OLD PERSONALIZATION MODAL DISABLED =====
// Replaced with unified onboarding (js/unified-onboarding.js)
// Old system showed separate personalization modal after guided tour (duplication!)
// New system: Personalization integrated into unified onboarding Step 5
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', checkPersonalizationChoice);
// } else {
//     checkPersonalizationChoice();
// }

// PERFORMANCE OPTIMIZATION (2025-01-25):
// These are now called from main.js centralized initialization
// to avoid multiple DOMContentLoaded listeners slowing down page load

// Initialize privacy page status if on privacy page
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializePersonalizationStatus);
// } else {
//     initializePersonalizationStatus();
// }

// Auto-initialize personalization features if already enabled
// if (isPersonalizationEnabled()) {
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', initializePersonalizationFeatures);
//     } else {
//         initializePersonalizationFeatures();
//     }
// }

// Add escape key handler for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('personalizationModal');
        if (modal && modal.style.display === 'flex') {
            closePersonalizationModal();
        }
    }
});

// ===========================
// GLOBAL EXPORTS (V36.3.2)
// ===========================
// Make functions accessible from HTML onclick attributes
window.openPersonalizationModal = openPersonalizationModal;
window.acceptUnifiedPersonalization = acceptUnifiedPersonalization;
window.skipUnifiedPersonalization = skipUnifiedPersonalization;
window.closePersonalizationModal = closePersonalizationModal;
window.isPersonalizationEnabled = isPersonalizationEnabled;
window.getUserLocation = getUserLocation;
