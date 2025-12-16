/* WDP civic-representative-finder.20251216T1000.js LIVE V37.9.1-PHASE1-FIXED builtAt=2025-12-16T10:00Z TIMESTAMP-VERIFIED */

/**
 * CIVIC REPRESENTATIVE FINDER - V37.9.1 PHASE 1 - FIXED GET METHOD
 * 
 * Features:
 * - ZIP code based representative lookup
 * - Optional full address for precise local matching
 * - Privacy disclosure displayed prominently
 * - Encrypted localStorage for user location
 * - Integration with Congress.gov API via backend
 * - Auto-minimize location input after first use
 * - Display federal + local representatives
 * - Contact information (email, phone, office)
 * - Voting record summary
 * - Alignment calculations
 * 
 * Architecture:
 * - Frontend: ZIP/address input validation
 * - Backend: GET /api/civic/representatives/search?zip=12345
 * - Storage: Encrypted location data (AES-256-GCM)
 * - Privacy: All PII stays local, only anonymized lookups sent
 * 
 * Created: November 1, 2025
 */

console.log('🔍 [V37.17.0] civic-representative-finder.js loading with Smart Search...');

// ============================================================================
// SMART SEARCH INTEGRATION (V37.17.0)
// ============================================================================

// Initialize Smart Search Enhancer when available
let smartSearchEnhancer = null;
if (typeof SmartSearchEnhancer !== 'undefined') {
    smartSearchEnhancer = new SmartSearchEnhancer();
    console.log('✅ [Smart Search] Enhancer initialized');
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const RepresentativeFinder = {
    storageKey: 'wdp_civic_location',
    representativesKey: 'wdp_civic_representatives',
    cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    
    state: {
        locationEntered: false,
        showFullAddressInput: false,
        representatives: [],
        lastUpdate: null
    },
    
    /**
     * Initialize the representative finder
     */
    init() {
        console.log('🔍 [RepFinder] Initializing...');
        console.log('[RepFinder] DOM ready state:', document.readyState);
        console.log('[RepFinder] Checking for #civicResults...');
        
        const container = document.getElementById('civicResults');
        console.log('[RepFinder] Container found:', !!container);
        
        if (!container) {
            console.error('[RepFinder] ❌ CRITICAL: Container not found! Cannot initialize.');
            return;
        }
        
        // Check if location already entered
        this.loadSavedLocation();
        
        // Set up event listeners  
        this.setupEventListeners();
        
        // ALWAYS render UI immediately to ensure something appears
        console.log('[RepFinder] 🎨 Calling renderUI()...');
        this.renderUI();
        
        console.log('✅ [RepFinder] Initialized successfully');
    },
    
    /**
     * Load saved location from encrypted storage
     */
    async loadSavedLocation() {
        try {
            // Check if SecurityManager is available
            if (typeof window.securityManager === 'undefined') {
                console.warn('[RepFinder] SecurityManager not available yet, will retry...');
                setTimeout(() => this.loadSavedLocation(), 1000);
                return;
            }
            
            const encryptedData = localStorage.getItem(this.storageKey);
            if (!encryptedData) {
                console.log('[RepFinder] No saved location found');
                return;
            }
            
            // Decrypt location data
            const locationData = await window.securityManager.decrypt(encryptedData);
            
            if (locationData && locationData.zipCode) {
                this.state.locationEntered = true;
                console.log('[RepFinder] ✅ Loaded saved location (ZIP:', locationData.zipCode.substring(0, 3) + '**)');
                
                // Load cached representatives
                await this.loadCachedRepresentatives();
            }
        } catch (error) {
            console.error('[RepFinder] Error loading saved location:', error);
        }
    },
    
    /**
     * Load cached representatives
     */
    async loadCachedRepresentatives() {
        try {
            const encryptedData = localStorage.getItem(this.representativesKey);
            if (!encryptedData) return;
            
            const repData = await window.securityManager.decrypt(encryptedData);
            
            if (repData && repData.representatives && repData.timestamp) {
                const age = Date.now() - repData.timestamp;
                
                if (age < this.cacheExpiry) {
                    this.state.representatives = repData.representatives;
                    this.state.lastUpdate = repData.timestamp;
                    console.log('[RepFinder] ✅ Loaded cached representatives:', repData.representatives.length);
                    this.displayRepresentatives();
                } else {
                    console.log('[RepFinder] Cache expired, will refresh');
                }
            }
        } catch (error) {
            console.error('[RepFinder] Error loading cached representatives:', error);
        }
    },
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // ZIP code lookup button
        const zipLookupBtn = document.getElementById('zipLookupBtn');
        if (zipLookupBtn) {
            zipLookupBtn.addEventListener('click', () => this.handleZipLookup());
        }
        
        // Full address toggle
        const fullAddressToggle = document.getElementById('fullAddressToggle');
        if (fullAddressToggle) {
            fullAddressToggle.addEventListener('click', () => this.toggleFullAddress());
        }
        
        // Full address lookup button
        const fullAddressLookupBtn = document.getElementById('fullAddressLookupBtn');
        if (fullAddressLookupBtn) {
            fullAddressLookupBtn.addEventListener('click', () => this.handleFullAddressLookup());
        }
        
        // Change location button
        const changeLocationBtn = document.getElementById('changeLocationBtn');
        if (changeLocationBtn) {
            changeLocationBtn.addEventListener('click', () => this.handleChangeLocation());
        }
        
        // Enter key support
        const zipInput = document.getElementById('zipCodeInput');
        if (zipInput) {
            zipInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleZipLookup();
                }
            });
        }
    },
    
    /**
     * Render UI based on current state
     */
    renderUI() {
        const container = document.getElementById('civicResults');
        if (!container) {
            console.error('[RepFinder] ❌ Container #civicResults not found!');
            return;
        }
        
        console.log('[RepFinder] ✅ Container found, rendering UI...');
        console.log('[RepFinder] locationEntered state:', this.state.locationEntered);
        
        if (!this.state.locationEntered) {
            // Show location input
            console.log('[RepFinder] 🎨 Rendering location input form...');
            this.renderLocationInput(container);
            console.log('[RepFinder] ✅ Location input rendered');
        } else {
            // Show representatives with minimized location change option
            console.log('[RepFinder] 📋 Rendering representatives view...');
            this.renderRepresentativesView(container);
        }
    },
    
    /**
     * Render location input form
     */
    renderLocationInput(container) {
        console.log('[RepFinder] 📝 renderLocationInput() called');
        console.log('[RepFinder] Container element:', container);
        
        container.innerHTML = `
            <div class="rep-finder-location-input">
                <div class="location-input-header">
                    <h3>🗺️ Find Your Representatives</h3>
                    <p>Enter your ZIP code to see your federal and state representatives</p>
                </div>
                
                <!-- Privacy Disclosure -->
                <div class="privacy-disclosure">
                    <div class="disclosure-icon">🔒</div>
                    <div class="disclosure-content">
                        <strong>Privacy First:</strong> Your location is encrypted and stored only on your device. 
                        We never track or share your personal information.
                    </div>
                </div>
                
                <!-- ZIP Code Input -->
                <div class="location-input-primary">
                    <label for="zipCodeInput" class="input-label">
                        <span class="label-text">ZIP Code</span>
                        <span class="label-required">*</span>
                    </label>
                    <div class="input-group">
                        <input 
                            type="text" 
                            id="zipCodeInput" 
                            class="form-input" 
                            placeholder="Enter 5-digit ZIP code"
                            maxlength="5"
                            pattern="[0-9]{5}"
                            aria-label="ZIP code"
                            autocomplete="postal-code"
                        />
                        <button id="zipLookupBtn" class="btn-primary">
                            <span class="btn-icon">🔍</span>
                            <span class="btn-text">Find Reps</span>
                        </button>
                    </div>
                    <p class="input-note">
                        <span class="note-icon">ℹ️</span>
                        <strong>Note:</strong> Based on ZIP code - may not reflect exact voting district
                    </p>
                </div>
                
                <!-- Optional Full Address -->
                <div class="location-input-optional">
                    <button id="fullAddressToggle" class="toggle-link">
                        <span class="toggle-icon">📍</span>
                        <span class="toggle-text">Need precise local representatives? Enter full address</span>
                        <span class="toggle-arrow">▼</span>
                    </button>
                    
                    <div id="fullAddressSection" class="full-address-section" style="display: none;">
                        <div class="full-address-disclosure">
                            <p><strong>Full address provides:</strong></p>
                            <ul>
                                <li>Exact House district</li>
                                <li>State legislative districts</li>
                                <li>Local city council / county board</li>
                            </ul>
                        </div>
                        
                        <div class="form-group">
                            <label for="streetAddress" class="input-label">Street Address</label>
                            <input 
                                type="text" 
                                id="streetAddress" 
                                class="form-input" 
                                placeholder="123 Main Street"
                                autocomplete="street-address"
                            />
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city" class="input-label">City</label>
                                <input 
                                    type="text" 
                                    id="city" 
                                    class="form-input" 
                                    placeholder="City"
                                    autocomplete="address-level2"
                                />
                            </div>
                            
                            <div class="form-group">
                                <label for="state" class="input-label">State</label>
                                <select id="state" class="form-select" autocomplete="address-level1">
                                    <option value="">Select State</option>
                                    <option value="AL">Alabama</option>
                                    <option value="AK">Alaska</option>
                                    <option value="AZ">Arizona</option>
                                    <option value="AR">Arkansas</option>
                                    <option value="CA">California</option>
                                    <option value="CO">Colorado</option>
                                    <option value="CT">Connecticut</option>
                                    <option value="DE">Delaware</option>
                                    <option value="FL">Florida</option>
                                    <option value="GA">Georgia</option>
                                    <option value="HI">Hawaii</option>
                                    <option value="ID">Idaho</option>
                                    <option value="IL">Illinois</option>
                                    <option value="IN">Indiana</option>
                                    <option value="IA">Iowa</option>
                                    <option value="KS">Kansas</option>
                                    <option value="KY">Kentucky</option>
                                    <option value="LA">Louisiana</option>
                                    <option value="ME">Maine</option>
                                    <option value="MD">Maryland</option>
                                    <option value="MA">Massachusetts</option>
                                    <option value="MI">Michigan</option>
                                    <option value="MN">Minnesota</option>
                                    <option value="MS">Mississippi</option>
                                    <option value="MO">Missouri</option>
                                    <option value="MT">Montana</option>
                                    <option value="NE">Nebraska</option>
                                    <option value="NV">Nevada</option>
                                    <option value="NH">New Hampshire</option>
                                    <option value="NJ">New Jersey</option>
                                    <option value="NM">New Mexico</option>
                                    <option value="NY">New York</option>
                                    <option value="NC">North Carolina</option>
                                    <option value="ND">North Dakota</option>
                                    <option value="OH">Ohio</option>
                                    <option value="OK">Oklahoma</option>
                                    <option value="OR">Oregon</option>
                                    <option value="PA">Pennsylvania</option>
                                    <option value="RI">Rhode Island</option>
                                    <option value="SC">South Carolina</option>
                                    <option value="SD">South Dakota</option>
                                    <option value="TN">Tennessee</option>
                                    <option value="TX">Texas</option>
                                    <option value="UT">Utah</option>
                                    <option value="VT">Vermont</option>
                                    <option value="VA">Virginia</option>
                                    <option value="WA">Washington</option>
                                    <option value="WV">West Virginia</option>
                                    <option value="WI">Wisconsin</option>
                                    <option value="WY">Wyoming</option>
                                    <option value="DC">Washington DC</option>
                                </select>
                            </div>
                        </div>
                        
                        <button id="fullAddressLookupBtn" class="btn-secondary">
                            <span class="btn-icon">🎯</span>
                            <span class="btn-text">Find with Full Address</span>
                        </button>
                    </div>
                </div>
                
                <!-- Loading State -->
                <div id="lookupLoading" class="lookup-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Finding your representatives...</p>
                </div>
                
                <!-- Error Message -->
                <div id="lookupError" class="lookup-error" style="display: none;"></div>
            </div>
        `;
        
        // Re-attach event listeners after rendering
        this.setupEventListeners();
    },
    
    /**
     * Render representatives view with minimized location change
     */
    renderRepresentativesView(container) {
        const locationSummary = this.getLocationSummary();
        
        container.innerHTML = `
            <div class="rep-finder-results">
                <!-- Minimized Location Bar -->
                <div class="location-bar-minimized">
                    <div class="location-info">
                        <span class="location-icon">📍</span>
                        <span class="location-text">${locationSummary}</span>
                        <span class="last-update">Updated: ${this.getLastUpdateText()}</span>
                    </div>
                    <button id="changeLocationBtn" class="btn-link">
                        <span class="btn-icon">✏️</span>
                        <span>Change Location</span>
                    </button>
                </div>
                
                <!-- Representatives Display -->
                <div id="representativesDisplay" class="representatives-display">
                    ${this.state.representatives.length > 0 
                        ? this.renderRepresentativesList() 
                        : '<p class="loading-message">Loading representatives...</p>'}
                </div>
            </div>
        `;
        
        // Re-attach event listeners
        this.setupEventListeners();
    },
    
    /**
     * Get location summary for minimized display
     */
    getLocationSummary() {
        // For now, just show "Your Location" - will enhance with actual data later
        return 'Your Location';
    },
    
    /**
     * Get last update text
     */
    getLastUpdateText() {
        if (!this.state.lastUpdate) return 'Just now';
        
        const diff = Date.now() - this.state.lastUpdate;
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    },
    
    /**
     * Render representatives list
     */
    renderRepresentativesList() {
        if (!this.state.representatives || this.state.representatives.length === 0) {
            return '<p class="no-results">No representatives found.</p>';
        }
        
        let html = '';
        
        // Group by level: federal, state, local
        const grouped = this.groupRepresentativesByLevel(this.state.representatives);
        
        for (const [level, reps] of Object.entries(grouped)) {
            if (reps.length === 0) continue;
            
            html += `
                <div class="rep-group">
                    <h3 class="rep-group-title">${this.getLevelTitle(level)}</h3>
                    <div class="rep-cards">
                        ${reps.map(rep => this.renderRepresentativeCard(rep)).join('')}
                    </div>
                </div>
            `;
        }
        
        return html;
    },
    
    /**
     * Group representatives by level
     */
    groupRepresentativesByLevel(representatives) {
        const grouped = {
            federal: [],
            state: [],
            local: []
        };
        
        representatives.forEach(rep => {
            const level = rep.level || 'federal';
            if (grouped[level]) {
                grouped[level].push(rep);
            }
        });
        
        return grouped;
    },
    
    /**
     * Get level title
     */
    getLevelTitle(level) {
        const titles = {
            federal: '🏛️ Federal Representatives',
            state: '🏢 State Representatives',
            local: '🏘️ Local Representatives'
        };
        return titles[level] || level;
    },
    
    /**
     * Render individual representative card
     */
    renderRepresentativeCard(rep) {
        return `
            <div class="rep-card" data-rep-id="${rep.id}">
                <div class="rep-card-header">
                    ${rep.photo_url ? `<img src="${rep.photo_url}" alt="${rep.name}" class="rep-photo" />` : '<div class="rep-photo-placeholder">👤</div>'}
                    <div class="rep-info">
                        <h4 class="rep-name">${rep.name}</h4>
                        <p class="rep-title">${rep.title || rep.office}</p>
                        <p class="rep-party">${this.formatParty(rep.party)}</p>
                    </div>
                </div>
                
                <div class="rep-card-body">
                    ${rep.district ? `<p class="rep-district"><strong>District:</strong> ${rep.district}</p>` : ''}
                    
                    <!-- Contact Information - V37.17.0 ENHANCED with Smart Fallbacks -->
                    <div class="rep-contact">
                        <h5>Contact:</h5>
                        ${this.renderSmartContactButtons(rep)}
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="rep-actions">
                        <button class="btn-small btn-outline" onclick="RepresentativeFinder.viewVotingRecord('${rep.id}')">
                            📊 Voting Record
                        </button>
                        <button class="btn-small btn-outline" onclick="RepresentativeFinder.contactRep('${rep.id}')">
                            ✉️ Contact
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Format party affiliation
     */
    formatParty(party) {
        if (!party) return '';
        
        const partyMap = {
            'D': 'Democrat',
            'R': 'Republican',
            'I': 'Independent',
            'L': 'Libertarian',
            'G': 'Green'
        };
        
        return partyMap[party] || party;
    },
    
    /**
     * Render smart contact buttons with intelligent fallbacks
     * V37.17.0: ALWAYS shows Phone, Email, Website, and District Office buttons
     * Uses fallback URLs when direct contact info is missing
     */
    renderSmartContactButtons(rep) {
        const contactInfo = rep.contactInfo || {};
        const website = rep.website || contactInfo.website;
        const phone = rep.phone || contactInfo.phone;
        const email = rep.email || contactInfo.email;
        
        // Construct fallback URLs
        const contactPageUrl = contactInfo.contactPageUrl || (website ? `${website}/contact` : null);
        const contactFormUrl = contactInfo.contactFormUrl || (website ? `${website}/contact/email-me` : null);
        const districtOfficeUrl = contactInfo.districtOfficeUrl || (website ? `${website}/offices` : null);
        
        // DuckDuckGo search for contact info
        const searchQuery = `"${rep.name}" contact phone email site:${website ? website.replace('https://', '').replace('http://', '') : ''}`;
        const ddgSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
        
        let html = '';
        
        // PHONE BUTTON - Always show with smart fallback
        if (phone) {
            // Direct phone available
            html += `
                <a href="tel:${phone}" class="contact-link contact-link-direct">
                    <span class="contact-icon">📞</span>
                    <span>${phone}</span>
                </a>
            `;
        } else if (contactPageUrl) {
            // No direct phone - link to contact page
            html += `
                <a href="${contactPageUrl}" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-fallback" title="Find phone number on contact page">
                    <span class="contact-icon">📞</span>
                    <span>Find Phone</span>
                </a>
            `;
        }
        
        // EMAIL BUTTON - Always show with smart fallback
        if (email) {
            // Direct email available
            html += `
                <a href="mailto:${email}" class="contact-link contact-link-direct">
                    <span class="contact-icon">✉️</span>
                    <span>${email}</span>
                </a>
            `;
        } else if (contactFormUrl) {
            // No direct email - link to contact form
            html += `
                <a href="${contactFormUrl}" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-fallback" title="Send message via contact form">
                    <span class="contact-icon">✉️</span>
                    <span>Contact Form</span>
                </a>
            `;
        } else if (contactPageUrl) {
            // Fallback to generic contact page
            html += `
                <a href="${contactPageUrl}" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-fallback" title="Visit contact page">
                    <span class="contact-icon">✉️</span>
                    <span>Contact Page</span>
                </a>
            `;
        }
        
        // WEBSITE BUTTON - Always available
        if (website) {
            html += `
                <a href="${website}" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-direct">
                    <span class="contact-icon">🌐</span>
                    <span>Website</span>
                </a>
            `;
        }
        
        // DISTRICT OFFICE BUTTON - Show for federal reps
        if (rep.level === 'federal' && districtOfficeUrl) {
            html += `
                <a href="${districtOfficeUrl}" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-enhanced" title="Find local district office">
                    <span class="contact-icon">🏢</span>
                    <span>Local Office</span>
                </a>
            `;
        }
        
        // SEARCH FALLBACK - If nothing else works
        if (!phone && !email && !website) {
            html += `
                <a href="${ddgSearchUrl}" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-search" title="Search for contact information">
                    <span class="contact-icon">🔍</span>
                    <span>Search Contact Info</span>
                </a>
            `;
        }
        
        return html;
    },
    
    /**
     * Handle ZIP code lookup
     */
    async handleZipLookup() {
        const zipInput = document.getElementById('zipCodeInput');
        const zipCode = zipInput?.value.trim();
        
        if (!zipCode) {
            this.showError('Please enter a ZIP code');
            return;
        }
        
        if (!this.validateZipCode(zipCode)) {
            this.showError('Please enter a valid 5-digit ZIP code');
            return;
        }
        
        await this.lookupRepresentatives({ zipCode });
    },
    
    /**
     * Handle full address lookup
     */
    async handleFullAddressLookup() {
        const zipCode = document.getElementById('zipCodeInput')?.value.trim();
        const streetAddress = document.getElementById('streetAddress')?.value.trim();
        const city = document.getElementById('city')?.value.trim();
        const state = document.getElementById('state')?.value;
        
        if (!zipCode || !streetAddress || !city || !state) {
            this.showError('Please fill in all address fields');
            return;
        }
        
        await this.lookupRepresentatives({
            zipCode,
            streetAddress,
            city,
            state,
            fullAddress: true
        });
    },
    
    /**
     * Main lookup function
     */
    async lookupRepresentatives(locationData) {
        this.showLoading();
        this.hideError();
        
        try {
            console.log('[RepFinder] 🔍 Looking up representatives...', {
                zip: locationData.zipCode,
                fullAddress: locationData.fullAddress || false
            });
            
            // Call backend API - FIXED v37.9.1: Use GET with query params
            const apiUrl = `${BackendAPI.baseURL}/api/civic/representatives/search?zip=${locationData.zipCode}`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            console.log('[RepFinder] ✅ Representatives found:', data.representatives?.length || 0);
            
            // Save encrypted location and representatives
            await this.saveLocationData(locationData);
            await this.saveRepresentativesData(data.representatives);
            
            // Update state
            this.state.locationEntered = true;
            this.state.representatives = data.representatives;
            this.state.lastUpdate = Date.now();
            
            // Re-render UI
            this.renderUI();
            
            this.hideLoading();
            
        } catch (error) {
            console.error('[RepFinder] Error looking up representatives:', error);
            this.showError('Unable to find representatives. Please try again.');
            this.hideLoading();
        }
    },
    
    /**
     * Save location data (encrypted)
     */
    async saveLocationData(locationData) {
        try {
            const encrypted = await window.securityManager.encrypt(locationData);
            localStorage.setItem(this.storageKey, encrypted);
            console.log('[RepFinder] ✅ Location data saved (encrypted)');
        } catch (error) {
            console.error('[RepFinder] Error saving location:', error);
        }
    },
    
    /**
     * Save representatives data (encrypted)
     */
    async saveRepresentativesData(representatives) {
        try {
            const data = {
                representatives: representatives,
                timestamp: Date.now()
            };
            const encrypted = await window.securityManager.encrypt(data);
            localStorage.setItem(this.representativesKey, encrypted);
            console.log('[RepFinder] ✅ Representatives data saved (encrypted)');
        } catch (error) {
            console.error('[RepFinder] Error saving representatives:', error);
        }
    },
    
    /**
     * Handle change location
     */
    handleChangeLocation() {
        // Clear state
        this.state.locationEntered = false;
        this.state.representatives = [];
        this.state.lastUpdate = null;
        
        // Re-render
        this.renderUI();
    },
    
    /**
     * Toggle full address section
     */
    toggleFullAddress() {
        this.state.showFullAddressInput = !this.state.showFullAddressInput;
        
        const section = document.getElementById('fullAddressSection');
        const toggle = document.getElementById('fullAddressToggle');
        
        if (section) {
            section.style.display = this.state.showFullAddressInput ? 'block' : 'none';
        }
        
        if (toggle) {
            const arrow = toggle.querySelector('.toggle-arrow');
            if (arrow) {
                arrow.textContent = this.state.showFullAddressInput ? '▲' : '▼';
            }
        }
    },
    
    /**
     * Validate ZIP code
     */
    validateZipCode(zip) {
        return /^\d{5}$/.test(zip);
    },
    
    /**
     * Show loading state
     */
    showLoading() {
        const loading = document.getElementById('lookupLoading');
        if (loading) loading.style.display = 'block';
    },
    
    /**
     * Hide loading state
     */
    hideLoading() {
        const loading = document.getElementById('lookupLoading');
        if (loading) loading.style.display = 'none';
    },
    
    /**
     * Show error message
     */
    showError(message) {
        const error = document.getElementById('lookupError');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
    },
    
    /**
     * Hide error message
     */
    hideError() {
        const error = document.getElementById('lookupError');
        if (error) error.style.display = 'none';
    },
    
    /**
     * View voting record (to be implemented)
     */
    viewVotingRecord(repId) {
        console.log('[RepFinder] View voting record:', repId);
        // TODO: Implement voting record view
        alert('Voting record feature coming soon!');
    },
    
    /**
     * Contact representative (to be implemented)
     */
    contactRep(repId) {
        console.log('[RepFinder] Contact rep:', repId);
        // TODO: Implement contact feature
        alert('Contact feature coming soon!');
    },
    
    /**
     * Display representatives (legacy method for compatibility)
     */
    displayRepresentatives() {
        this.renderUI();
    }
};

// ============================================================================
// EXPORT TO WINDOW
// ============================================================================

window.RepresentativeFinder = RepresentativeFinder;

// Initialize on DOM ready with retry mechanism
function initWithRetry(attempts = 0) {
    const maxAttempts = 5;
    const container = document.getElementById('civicResults');
    
    if (container) {
        console.log('[RepFinder] Container found, initializing...');
        RepresentativeFinder.init();
    } else if (attempts < maxAttempts) {
        console.warn(`[RepFinder] Container not found, retrying in 500ms (attempt ${attempts + 1}/${maxAttempts})...`);
        setTimeout(() => initWithRetry(attempts + 1), 500);
    } else {
        console.error('[RepFinder] ❌ Failed to find container after', maxAttempts, 'attempts');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initWithRetry());
} else {
    initWithRetry();
}

console.log('✅ [V36.10.0] civic-representative-finder.js loaded successfully');
