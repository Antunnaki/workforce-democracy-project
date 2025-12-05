/**
 * Community Services Discovery System
 * Workforce Democracy Project
 * 
 * PURPOSE: Help users find community services and ethical businesses
 * NOT for IRS verification - for discovering community help and support
 */

// ============================================================================
// Configuration
// ============================================================================

// V36.11.16: Using backend proxy to avoid CORS issues
const NONPROFIT_API = {
    BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.workforcedemocracyproject.org',
    SEARCH: '/api/nonprofits/search'
};

// Community service categories with descriptions
const SERVICE_CATEGORIES = {
    'legal-aid': {
        icon: '⚖️',
        title: 'Legal Aid',
        description: 'Free legal services, advocacy, tenant rights',
        searchTerms: ['legal aid', 'legal services', 'civil rights'],
        color: '#667eea'
    },
    'housing': {
        icon: '🏠',
        title: 'Housing Support',
        description: 'Shelter, affordable housing, rental assistance',
        searchTerms: ['housing', 'shelter', 'homeless services'],
        color: '#48bb78'
    },
    'healthcare': {
        icon: '🏥',
        title: 'Healthcare',
        description: 'Free clinics, medical assistance, health services',
        searchTerms: ['health', 'medical', 'clinic'],
        color: '#f56565'
    },
    'food': {
        icon: '🍽️',
        title: 'Food Banks',
        description: 'Food pantries, meal programs, nutrition assistance',
        searchTerms: ['food bank', 'food pantry', 'meals'],
        color: '#ed8936'
    },
    'workers-rights': {
        icon: '✊',
        title: 'Workers\' Rights',
        description: 'Labor advocacy, workplace rights, union support',
        searchTerms: ['labor', 'workers rights', 'employment rights'],
        color: '#9f7aea'
    },
    'mental-health': {
        icon: '🧠',
        title: 'Mental Health',
        description: 'Counseling, crisis support, therapy services',
        searchTerms: ['mental health', 'counseling', 'crisis'],
        color: '#38b2ac'
    }
};

// Curated ethical businesses (expandable database)
const ETHICAL_BUSINESSES = [
    {
        name: 'Equal Exchange',
        type: 'Fair Trade Coffee & Chocolate',
        description: 'Worker-owned co-op supporting fair trade farmers',
        website: 'https://equalexchange.coop',
        category: 'Food & Beverage',
        icon: '☕'
    },
    {
        name: 'Patagonia',
        type: 'Outdoor Clothing',
        description: 'B Corp focused on environmental sustainability',
        website: 'https://www.patagonia.com',
        category: 'Apparel',
        icon: '👕'
    },
    {
        name: 'Ben & Jerry\'s',
        type: 'Ice Cream',
        description: 'Social justice advocacy, fair trade ingredients',
        website: 'https://www.benjerry.com',
        category: 'Food & Beverage',
        icon: '🍦'
    },
    {
        name: 'The Body Shop',
        type: 'Beauty Products',
        description: 'Cruelty-free, ethical sourcing, community trade',
        website: 'https://www.thebodyshop.com',
        category: 'Personal Care',
        icon: '🧴'
    },
    {
        name: 'King Arthur Baking',
        type: 'Baking Supplies',
        description: 'Employee-owned company, quality ingredients',
        website: 'https://www.kingarthurbaking.com',
        category: 'Food & Beverage',
        icon: '🥖'
    },
    {
        name: 'Seventh Generation',
        type: 'Cleaning Products',
        description: 'Plant-based, sustainable household products',
        website: 'https://www.seventhgeneration.com',
        category: 'Household',
        icon: '🧼'
    }
];

// ============================================================================
// State Management
// ============================================================================

const communityServicesState = {
    currentView: 'services', // 'services' or 'ethical-business'
    selectedCategory: null,
    searchResults: [],
    isLoading: false,
    cache: new Map()
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Search community service organizations with optional location filters
 * @param {string} searchTerm - Service type to search for
 * @param {object} options - Optional filters {zip, state, city, radius}
 */
async function searchCommunityServices(searchTerm, options = {}) {
    const cacheKey = `search_${searchTerm}`;
    
    // Check cache
    if (communityServicesState.cache.has(cacheKey)) {
        const cached = communityServicesState.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 900000) { // 15 min cache
            console.log('📦 Using cached results:', searchTerm);
            return cached.data;
        }
    }
    
    try {
        // Call backend proxy instead of ProPublica directly (fixes CORS)
        let url = `${NONPROFIT_API.BASE_URL}${NONPROFIT_API.SEARCH}?q=${encodeURIComponent(searchTerm)}`;
        
        // Add location filters if provided
        if (options.state) url += `&state=${encodeURIComponent(options.state)}`;
        if (options.city) url += `&city=${encodeURIComponent(options.city)}`;
        
        console.log('🔍 Searching via backend proxy:', searchTerm, options, url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('Community services API error:', response.status);
            throw new Error('Unable to reach community services database');
        }
        
        const result = await response.json();
        
        // Backend wraps data in {success, data, total, query}
        if (!result.success) {
            console.error('Community services search failed:', result.error);
            throw new Error(result.error || 'Search temporarily unavailable');
        }
        
        const orgs = result.data || [];
        
        // Cache results
        communityServicesState.cache.set(cacheKey, {
            data: orgs,
            timestamp: Date.now()
        });
        
        console.log(`✅ Found ${orgs.length} organizations`);
        return orgs;
        
    } catch (error) {
        console.error('❌ Community services search error:', error);
        throw error;
    }
}

// ============================================================================
// UI Rendering
// ============================================================================

/**
 * Render the main community services widget
 */
function renderCommunityServicesWidget() {
    const container = document.getElementById('communityServicesWidget');
    if (!container) {
        console.warn('Community services widget container not found');
        return;
    }
    
    container.innerHTML = `
        <div class="community-services-widget">
            <!-- Header -->
            <div class="community-services-header">
                <div class="header-icon">💙</div>
                <h3>Find Community Support</h3>
                <p>Discover services and ethical businesses that can help you</p>
            </div>
            
            <!-- View Toggle -->
            <div class="view-toggle">
                <button class="toggle-btn active" data-view="services" onclick="switchView('services')">
                    <span class="toggle-icon">🤝</span>
                    <span>Community Services</span>
                </button>
                <button class="toggle-btn" data-view="ethical-business" onclick="switchView('ethical-business')">
                    <span class="toggle-icon">🌟</span>
                    <span>Ethical Businesses</span>
                </button>
            </div>
            
            <!-- Services View -->
            <div id="servicesView" class="services-view active">
                <div class="services-intro">
                    <p>Find local organizations that can help you:</p>
                </div>
                
                <!-- Location Search -->
                <div class="location-search-box">
                    <div class="location-inputs">
                        <div class="input-group">
                            <label for="zipCode"><i class="fas fa-map-marker-alt"></i> ZIP Code</label>
                            <input type="text" 
                                   id="zipCode" 
                                   placeholder="e.g., 90210" 
                                   maxlength="5"
                                   pattern="[0-9]{5}">
                        </div>
                        <div class="input-group">
                            <label for="serviceKeyword"><i class="fas fa-search"></i> Service Type (Optional)</label>
                            <input type="text" 
                                   id="serviceKeyword" 
                                   placeholder="e.g., food bank, legal aid, shelter">
                        </div>
                        <div class="input-group">
                            <label for="searchRadius"><i class="fas fa-map-marked-alt"></i> Search Area</label>
                            <select id="searchRadius">
                                <option value="statewide" selected>State-wide (All cities)</option>
                            </select>
                            <small style="font-size: 0.75rem; color: rgba(255,255,255,0.9); margin-top: 0.25rem; display: block;">
                                📍 Searches entire state from your ZIP code
                            </small>
                        </div>
                    </div>
                    <button class="btn-location-search" onclick="searchByLocation()">
                        <i class="fas fa-search"></i> Search My State
                    </button>
                    <p style="text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.85); margin-top: 0.75rem;">
                        <i class="fas fa-info-circle"></i> Currently showing state-wide results. Enter your ZIP to find organizations in your state.
                    </p>
                </div>
                
                <div class="service-categories-grid">
                    ${Object.entries(SERVICE_CATEGORIES).map(([key, cat]) => `
                        <button class="service-category-card" 
                                data-category="${key}" 
                                onclick="loadCategoryServices('${key}')"
                                style="border-left: 4px solid ${cat.color};">
                            <div class="category-icon">${cat.icon}</div>
                            <div class="category-content">
                                <h4>${cat.title}</h4>
                                <p>${cat.description}</p>
                            </div>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Results Container -->
                <div id="serviceResults" class="service-results" style="display: none;">
                    <!-- Dynamic results loaded here -->
                </div>
            </div>
            
            <!-- Ethical Business View -->
            <div id="ethicalBusinessView" class="ethical-business-view" style="display: none;">
                <div class="ethical-intro">
                    <p>Support businesses that prioritize workers, communities, and the environment:</p>
                </div>
                
                <div class="ethical-business-grid">
                    ${ETHICAL_BUSINESSES.map(business => `
                        <div class="ethical-business-card">
                            <div class="business-icon">${business.icon}</div>
                            <h4 class="business-name">${business.name}</h4>
                            <div class="business-type">${business.type}</div>
                            <p class="business-description">${business.description}</p>
                            <a href="${business.website}" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="business-link">
                                Visit Website <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    `).join('')}
                </div>
                
                <div class="ethical-cta">
                    <p style="text-align: center; margin-top: 2rem; color: #718096; font-style: italic;">
                        Know an ethical business we should feature? <a href="help.html" style="color: #2563eb;">Let us know!</a>
                    </p>
                </div>
            </div>
            
            <!-- Full Explorer CTA -->
            <div class="community-cta">
                <a href="nonprofits.html" class="btn-full-explorer">
                    <i class="fas fa-search"></i>
                    Search All Community Organizations
                </a>
            </div>
        </div>
    `;
}

/**
 * Switch between services and ethical business views
 */
function switchView(view) {
    communityServicesState.currentView = view;
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update views
    const servicesView = document.getElementById('servicesView');
    const ethicalView = document.getElementById('ethicalBusinessView');
    
    if (view === 'services') {
        servicesView.style.display = 'block';
        ethicalView.style.display = 'none';
    } else {
        servicesView.style.display = 'none';
        ethicalView.style.display = 'block';
    }
}

/**
 * Load organizations for a specific category
 */
async function loadCategoryServices(categoryKey) {
    const category = SERVICE_CATEGORIES[categoryKey];
    if (!category) return;
    
    communityServicesState.selectedCategory = categoryKey;
    const resultsContainer = document.getElementById('serviceResults');
    
    // Check if user has entered a ZIP code (from input or localStorage)
    const userZip = getUserZipCode();
    let locationInfo = null;
    
    if (userZip) {
        try {
            locationInfo = await zipToLocation(userZip);
            console.log(`📍 Using user's location: ${locationInfo.stateName} (ZIP: ${userZip})`);
        } catch (error) {
            console.warn('Could not determine location from ZIP:', error);
        }
    }
    
    // Show loading state
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="results-header">
            <h4>${category.icon} ${category.title}</h4>
            <p>${category.description}</p>
        </div>
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Finding organizations ${locationInfo ? `in ${locationInfo.stateName}` : 'in your area'}...</p>
        </div>
    `;
    
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        // Search using the first search term for this category
        const searchTerm = category.searchTerms[0];
        
        // If we have location info, search with state filter
        const searchOptions = locationInfo ? { state: locationInfo.state } : {};
        const organizations = await searchCommunityServices(searchTerm, searchOptions);
        
        if (organizations.length === 0) {
            resultsContainer.innerHTML = `
                <div class="results-header">
                    <h4>${category.icon} ${category.title}</h4>
                    <p>${category.description}</p>
                </div>
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No organizations found ${locationInfo ? `in ${locationInfo.stateName}` : 'for this category'}.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try searching on the <a href="nonprofits.html">full explorer page</a>.</p>
                </div>
            `;
            return;
        }
        
        // If we have a ZIP code, add proximity info and sort by distance
        let displayOrgs = organizations;
        if (userZip) {
            displayOrgs = organizations.map(org => {
                const orgZip = org.postal_code || org.zip_code || org.zipcode;
                let proximity = 999999;
                
                if (orgZip) {
                    const orgZipNum = parseInt(String(orgZip).substring(0, 5));
                    const userZipNum = parseInt(userZip);
                    
                    if (!isNaN(orgZipNum) && !isNaN(userZipNum)) {
                        proximity = Math.abs(orgZipNum - userZipNum);
                    }
                }
                
                return {
                    ...org,
                    proximity,
                    displayZip: orgZip || 'N/A'
                };
            });
            
            // Sort by proximity (closest first)
            displayOrgs.sort((a, b) => a.proximity - b.proximity);
        }
        
        // Display results
        const locationText = locationInfo ? ` in ${locationInfo.stateName}` : '';
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4>${category.icon} ${category.title}</h4>
                <p>Found ${displayOrgs.length} organizations${locationText}</p>
                ${userZip ? `<p style="font-size: 0.875rem; color: #6b7280;">📍 Your ZIP: <strong>${userZip}</strong> - Results sorted by proximity</p>` : ''}
            </div>
            <div class="organizations-grid">
                ${displayOrgs.slice(0, 12).map(org => createOrgCard(org)).join('')}
            </div>
            ${displayOrgs.length > 12 ? `
                <div class="see-more-cta">
                    <a href="nonprofits.html?category=${categoryKey}" class="btn-see-more">
                        See All ${displayOrgs.length} Organizations
                    </a>
                </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('Failed to load services:', error);
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4>${category.icon} ${category.title}</h4>
                <p>${category.description}</p>
            </div>
            <div class="error-state" style="text-align: center; padding: 2rem;">
                <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">😊</span>
                <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem; color: #374151;">Oops! We couldn't load organizations right now</p>
                <p style="font-size: 0.95rem; color: #6b7280; margin-bottom: 1.5rem;">We're having trouble connecting. Please try again in a moment, or visit the <a href="nonprofits.html" style="color: #3b82f6; text-decoration: underline;">full explorer page</a>. 💙</p>
                <button onclick="loadCategoryServices('${categoryKey}')" style="padding: 0.625rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">Try Again</button>
            </div>
        `;
    }
}

/**
 * Create organization card HTML
 */
function createOrgCard(org) {
    const location = org.city && org.state ? `${org.city}, ${org.state}` : (org.city || org.state || 'Location not listed');
    const revenue = formatCurrency(org.revenue_amount);
    
    // Proximity badge
    let proximityBadge = '';
    if (org.proximity !== undefined) {
        if (org.proximity < 10) {
            proximityBadge = '<span class="proximity-badge very-close">📍 Same Area</span>';
        } else if (org.proximity < 100) {
            proximityBadge = '<span class="proximity-badge close">📍 Nearby</span>';
        } else if (org.proximity < 1000) {
            proximityBadge = '<span class="proximity-badge moderate">📍 Regional</span>';
        }
        
        // Show ZIP if available
        if (org.displayZip && org.displayZip !== 'N/A') {
            proximityBadge += ` <span class="zip-badge">ZIP ${org.displayZip}</span>`;
        }
    }
    
    return `
        <div class="org-card-compact" onclick="showOrganizationModal('${org.ein}')">
            <h5 class="org-name">${escapeHtml(org.name)}</h5>
            ${proximityBadge ? `<div class="proximity-info">${proximityBadge}</div>` : ''}
            <p class="org-location">
                <i class="fas fa-map-marker-alt"></i>
                ${escapeHtml(location)}
            </p>
            ${revenue ? `
                <p class="org-revenue">
                    <i class="fas fa-chart-line"></i>
                    ${revenue} annual revenue
                </p>
            ` : ''}
            <div class="org-actions">
                <span class="view-details">View Details →</span>
            </div>
        </div>
    `;
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatCurrency(amount) {
    if (!amount || amount === 0) return null;
    
    const num = parseInt(amount);
    if (isNaN(num)) return null;
    
    if (num >= 1000000000) {
        return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
    } else {
        return `$${num.toLocaleString()}`;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Community Services Widget initializing...');
    renderCommunityServicesWidget();
    console.log('✅ Community Services Widget ready');
});

/**
 * Search by location (ZIP code + proximity)
 * Shows results from user's ZIP and expanding outward to nearby ZIPs
 */
async function searchByLocation() {
    const zipCode = document.getElementById('zipCode').value.trim();
    const keyword = document.getElementById('serviceKeyword').value.trim() || 'community services';
    const radius = document.getElementById('searchRadius').value;
    
    if (!zipCode || zipCode.length !== 5 || isNaN(zipCode)) {
        alert('Please enter a valid 5-digit ZIP code');
        return;
    }
    
    // Store ZIP code in localStorage for distance calculations
    localStorage.setItem('lastSearchZip', zipCode);
    
    const resultsContainer = document.getElementById('serviceResults');
    
    // Show loading state
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="results-header">
            <h4><i class="fas fa-map-marker-alt"></i> Organizations Near ${zipCode}</h4>
            <p>Searching within ${radius} miles for: ${keyword}</p>
        </div>
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Finding organizations in your area...</p>
        </div>
    `;
    
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        // Convert ZIP to state for context
        const location = await zipToLocation(zipCode);
        
        console.log(`🗺️ ZIP ${zipCode} → ${location.stateName} (${location.state})`);
        
        // Search WITH state filter to get organizations in user's state
        const organizations = await searchCommunityServices(keyword, { state: location.state });
        
        console.log(`📦 API returned ${organizations.length} total organizations`);
        console.log('🔍 Sample org data:', organizations.slice(0, 3));
        
        // Filter to show organizations in the same state first, then nearby states
        const withProximity = organizations.map(org => {
            // Calculate ZIP proximity (simple numeric difference for now)
            const orgZip = org.postal_code || org.zip_code || org.zipcode;
            const orgState = org.state;
            let proximity = 999999; // Default: very far
            
            if (orgZip) {
                const orgZipNum = parseInt(String(orgZip).substring(0, 5));
                const userZipNum = parseInt(zipCode);
                
                if (!isNaN(orgZipNum) && !isNaN(userZipNum)) {
                    // ZIP code difference as proximity measure
                    // Lower number = closer (e.g., 12061 vs 12065 = difference of 4)
                    proximity = Math.abs(orgZipNum - userZipNum);
                }
            }
            
            // Also prioritize same state
            const sameState = org.state && org.state.toUpperCase() === location.state.toUpperCase();
            
            return {
                ...org,
                proximity,
                sameState,
                displayZip: orgZip || 'N/A',
                orgState: orgState || 'N/A'
            };
        });
        
        console.log('📊 Proximity calculated for', withProximity.length, 'orgs');
        console.log('🔍 Sample proximity data:', withProximity.slice(0, 5).map(o => ({
            name: o.name,
            state: o.orgState,
            zip: o.displayZip,
            proximity: o.proximity,
            sameState: o.sameState
        })));
        
        // Sort by: same state first, then by ZIP proximity
        const sortedOrgs = withProximity.sort((a, b) => {
            // Prioritize same state
            if (a.sameState && !b.sameState) return -1;
            if (!a.sameState && b.sameState) return 1;
            
            // Within same priority, sort by ZIP proximity
            return a.proximity - b.proximity;
        });
        
        // Filter to show organizations in the same state (regardless of ZIP proximity)
        // Also include very close ZIPs from neighboring states
        const filteredOrgs = sortedOrgs.filter(org => {
            // Keep if: (1) same state (any proximity), OR (2) very close ZIP even if different state (< 100)
            return org.sameState || (org.proximity < 100);
        });
        
        console.log(`📊 Filtering results:`);
        console.log(`   - Before filter: ${sortedOrgs.length} orgs`);
        console.log(`   - Same state: ${sortedOrgs.filter(o => o.sameState).length} orgs`);
        console.log(`   - After filter: ${filteredOrgs.length} orgs`);
        console.log(`✅ Found ${filteredOrgs.length} organizations in ${location.state} and nearby ZIPs`);
        
        if (filteredOrgs.length === 0) {
            resultsContainer.innerHTML = `
                <div class="results-header">
                    <h4><i class="fas fa-map-marker-alt"></i> No Results Near ${zipCode}</h4>
                    <p>${location.stateName} (${location.state})</p>
                </div>
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No "${keyword}" organizations found in ${location.stateName}.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem; color: #6b7280;">💡 Try a simpler search term like "food" or "legal" instead of full phrases.</p>
                    <button onclick="document.getElementById('serviceKeyword').value='food'; searchByLocation();" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Try "food"</button>
                </div>
            `;
            return;
        }
        
        // Display results
        const closestZips = [...new Set(filteredOrgs.slice(0, 10).map(o => o.displayZip))].slice(0, 5);
        
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4><i class="fas fa-map-marker-alt"></i> ${filteredOrgs.length} Organizations Near You</h4>
                <p style="font-size: 1rem; color: #4b5563; margin: 0.5rem 0;">📍 Your ZIP: <strong>${zipCode}</strong> (${location.city || location.stateName})</p>
                <p style="font-size: 0.875rem; color: #6b7280;">🎯 Showing results from ${closestZips.join(', ')} and nearby areas</p>
            </div>
            <div class="organizations-grid">
                ${filteredOrgs.slice(0, 12).map(org => createOrgCard(org)).join('')}
            </div>
            ${filteredOrgs.length > 12 ? `
                <div class="see-more-cta">
                    <a href="nonprofits.html?zip=${zipCode}&q=${encodeURIComponent(keyword)}" class="btn-see-more">
                        See All ${filteredOrgs.length} Organizations
                    </a>
                </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('Failed to search by location:', error);
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4><i class="fas fa-map-marker-alt"></i> Search Error</h4>
            </div>
            <div class="error-state" style="text-align: center; padding: 2rem;">
                <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">😊</span>
                <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem; color: #374151;">Oops! We couldn't search this location</p>
                <p style="font-size: 0.95rem; color: #6b7280; margin-bottom: 1.5rem;">${error.message || 'Please try again or use category search below.'}</p>
                <button onclick="searchByLocation()" style="padding: 0.625rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">Try Again</button>
            </div>
        `;
    }
}

/**
 * Convert ZIP code to state/city using improved mapping
 * Uses ZIP code ranges for more accurate state detection
 */
async function zipToLocation(zip) {
    const zipNum = parseInt(zip);
    
    // Comprehensive ZIP code to state mapping
    const zipRanges = [
        { min: 501, max: 544, state: 'NY', name: 'New York' },
        { min: 6390, max: 6390, state: 'NY', name: 'New York' },
        { min: 10001, max: 14999, state: 'NY', name: 'New York' },
        { min: 501, max: 599, state: 'NY', name: 'New York' },
        { min: 6001, max: 6999, state: 'CT', name: 'Connecticut' },
        { min: 7001, max: 8999, state: 'NJ', name: 'New Jersey' },
        { min: 10001, max: 14999, state: 'NY', name: 'New York' },
        { min: 15001, max: 19699, state: 'PA', name: 'Pennsylvania' },
        { min: 20001, max: 20599, state: 'DC', name: 'Washington DC' },
        { min: 20600, max: 21999, state: 'MD', name: 'Maryland' },
        { min: 22001, max: 24699, state: 'VA', name: 'Virginia' },
        { min: 24700, max: 26999, state: 'WV', name: 'West Virginia' },
        { min: 27001, max: 28999, state: 'NC', name: 'North Carolina' },
        { min: 29001, max: 29999, state: 'SC', name: 'South Carolina' },
        { min: 30001, max: 31999, state: 'GA', name: 'Georgia' },
        { min: 32001, max: 34999, state: 'FL', name: 'Florida' },
        { min: 35001, max: 36999, state: 'AL', name: 'Alabama' },
        { min: 37001, max: 38599, state: 'TN', name: 'Tennessee' },
        { min: 38600, max: 39999, state: 'MS', name: 'Mississippi' },
        { min: 40001, max: 42999, state: 'KY', name: 'Kentucky' },
        { min: 43001, max: 45999, state: 'OH', name: 'Ohio' },
        { min: 46001, max: 47999, state: 'IN', name: 'Indiana' },
        { min: 48001, max: 49999, state: 'MI', name: 'Michigan' },
        { min: 50001, max: 52999, state: 'IA', name: 'Iowa' },
        { min: 53001, max: 54999, state: 'WI', name: 'Wisconsin' },
        { min: 55001, max: 56999, state: 'MN', name: 'Minnesota' },
        { min: 57001, max: 57999, state: 'SD', name: 'South Dakota' },
        { min: 58001, max: 58999, state: 'ND', name: 'North Dakota' },
        { min: 59001, max: 59999, state: 'MT', name: 'Montana' },
        { min: 60001, max: 62999, state: 'IL', name: 'Illinois' },
        { min: 63001, max: 65999, state: 'MO', name: 'Missouri' },
        { min: 66001, max: 67999, state: 'KS', name: 'Kansas' },
        { min: 68001, max: 69999, state: 'NE', name: 'Nebraska' },
        { min: 70001, max: 71599, state: 'LA', name: 'Louisiana' },
        { min: 71600, max: 72999, state: 'AR', name: 'Arkansas' },
        { min: 73001, max: 74999, state: 'OK', name: 'Oklahoma' },
        { min: 75001, max: 79999, state: 'TX', name: 'Texas' },
        { min: 80001, max: 81999, state: 'CO', name: 'Colorado' },
        { min: 82001, max: 83199, state: 'WY', name: 'Wyoming' },
        { min: 83200, max: 83999, state: 'ID', name: 'Idaho' },
        { min: 84001, max: 84999, state: 'UT', name: 'Utah' },
        { min: 85001, max: 86599, state: 'AZ', name: 'Arizona' },
        { min: 87001, max: 88499, state: 'NM', name: 'New Mexico' },
        { min: 88500, max: 89999, state: 'NV', name: 'Nevada' },
        { min: 90001, max: 96199, state: 'CA', name: 'California' },
        { min: 96200, max: 96999, state: 'HI', name: 'Hawaii' },
        { min: 97001, max: 97999, state: 'OR', name: 'Oregon' },
        { min: 98001, max: 99499, state: 'WA', name: 'Washington' },
        { min: 99500, max: 99999, state: 'AK', name: 'Alaska' }
    ];
    
    // Find matching state
    for (const range of zipRanges) {
        if (zipNum >= range.min && zipNum <= range.max) {
            return { state: range.state, stateName: range.name, city: null };
        }
    }
    
    throw new Error('Invalid or unrecognized ZIP code');
}

// ============================================================================
// Organization Detail Modal
// ============================================================================

/**
 * Show organization details in modal popup
 * @param {string} ein - Organization EIN
 */
async function showOrganizationModal(ein) {
    // Create modal container if it doesn't exist
    let modal = document.getElementById('orgDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orgDetailModal';
        modal.className = 'org-detail-modal';
        document.body.appendChild(modal);
    }
    
    // Show loading state
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeOrganizationModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Loading...</h3>
                <button class="modal-close" onclick="closeOrganizationModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Fetching organization details...</p>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    
    try {
        // Fetch detailed organization data from backend
        const response = await fetch(`${NONPROFIT_API.BASE_URL}/api/nonprofits/${ein}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch organization details');
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
            throw new Error('Invalid response from server');
        }
        
        const org = result.data.organization || result.data;
        
        // Render modal with organization data
        renderOrganizationModal(org);
        
    } catch (error) {
        console.error('Error loading organization:', error);
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeOrganizationModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Error</h3>
                    <button class="modal-close" onclick="closeOrganizationModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="error-state" style="text-align: center; padding: 2rem;">
                        <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">😞</span>
                        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem;">Unable to load organization details</p>
                        <p style="font-size: 0.95rem; color: #6b7280; margin-bottom: 1.5rem;">Please try again in a moment.</p>
                        <button onclick="closeOrganizationModal()" style="padding: 0.625rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Close</button>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Render organization details in modal
 * @param {object} org - Organization data
 */
function renderOrganizationModal(org) {
    const modal = document.getElementById('orgDetailModal');
    if (!modal) return;
    
    // Build full address
    const addressParts = [];
    if (org.address || org.street) addressParts.push(org.address || org.street);
    if (org.city) addressParts.push(org.city);
    if (org.state) addressParts.push(org.state);
    if (org.zipcode || org.zip) addressParts.push(org.zipcode || org.zip);
    const fullAddress = addressParts.join(', ');
    
    // Calculate distance from user's location (if available)
    const userZip = getUserZipCode();
    const distance = userZip && (org.zipcode || org.zip) ? 
        calculateDistance(userZip, org.zipcode || org.zip) : null;
    const distanceText = distance ? ` (${distance.toFixed(1)} miles away)` : '';
    
    // Create navigation URL (geo: for mobile, Google Maps for desktop)
    const encodedAddress = encodeURIComponent(fullAddress);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const geoUrl = `geo:0,0?q=${encodedAddress}`;
    
    // Get website if available
    const website = org.website || org.url || null;
    
    // Get mission/description
    const mission = org.mission || org.description || 'No description available';
    
    // Infer service categories from mission text
    const serviceCategories = inferServiceCategories(mission);
    
    // Infer language support and accessibility from mission/name
    const languageInfo = inferLanguageSupport(mission, org.name);
    const accessibilityInfo = inferAccessibility(mission);
    
    // DuckDuckGo search URL for contact info
    const ddgSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(org.name + ' contact phone email')}`;
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeOrganizationModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>🏛️ ${escapeHtml(org.name)}</h3>
                <button class="modal-close" onclick="closeOrganizationModal()">×</button>
            </div>
            <div class="modal-body">
                <!-- Address Section (Primary) -->
                <div class="modal-section address-section">
                    <h4>📍 ADDRESS${distanceText}</h4>
                    <div class="address-box" onclick="openNavigation('${geoUrl}', '${mapsUrl}')">
                        <p class="address-text">${escapeHtml(fullAddress)}</p>
                        <button class="nav-button">
                            📱 Open in Maps
                        </button>
                    </div>
                    <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; text-align: center;">
                        Tap to navigate using your preferred map app
                    </p>
                </div>
                
                <!-- Service Categories -->
                ${serviceCategories.length > 0 ? `
                    <div class="modal-section">
                        <h4>🏷️ SERVICES PROVIDED</h4>
                        <div class="service-tags">
                            ${serviceCategories.map(cat => `<span class="service-tag">${cat}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Language Support -->
                ${languageInfo.length > 0 ? `
                    <div class="modal-section">
                        <h4>🌐 LANGUAGE SUPPORT</h4>
                        <p class="info-text">Services available in: ${languageInfo.join(', ')}</p>
                    </div>
                ` : ''}
                
                <!-- Accessibility Info -->
                ${accessibilityInfo.length > 0 ? `
                    <div class="modal-section">
                        <h4>♿ ACCESSIBILITY</h4>
                        <div class="accessibility-list">
                            ${accessibilityInfo.map(info => `<p class="accessibility-item">✅ ${info}</p>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Website Section -->
                ${website ? `
                    <div class="modal-section">
                        <h4>🌐 WEBSITE</h4>
                        <a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer" class="website-button">
                            Visit Website →
                        </a>
                    </div>
                ` : ''}
                
                <!-- Contact Information Section -->
                <div class="modal-section">
                    <h4>📞 CONTACT INFORMATION</h4>
                    <a href="${ddgSearchUrl}" target="_blank" rel="noopener noreferrer" class="search-button">
                        🔍 Search DuckDuckGo for Contact Info
                    </a>
                    <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; text-align: center;">
                        Find current phone, email, and hours of operation
                    </p>
                </div>
                
                <!-- About Section -->
                <div class="modal-section">
                    <h4>📋 ABOUT THIS ORGANIZATION</h4>
                    <p class="mission-text">${escapeHtml(mission)}</p>
                </div>
                
                <!-- Report Outdated Info -->
                <div class="modal-section" style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 1rem;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #92400e;">ℹ️ NEED UPDATED INFORMATION?</h4>
                    <p style="font-size: 0.875rem; color: #78350f; margin-bottom: 0.75rem;">
                        If any details are incorrect or outdated, please let us know.
                    </p>
                    <button onclick="reportOutdatedInfo('${escapeHtml(org.name)}', '${org.ein}')" class="report-button">
                        📝 Report Outdated Information
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeOrganizationModal()" class="btn-close-modal">Close</button>
            </div>
        </div>
    `;
}

/**
 * Open navigation app with organization address
 * @param {string} geoUrl - Geo URL for mobile
 * @param {string} mapsUrl - Google Maps URL for desktop
 */
function openNavigation(geoUrl, mapsUrl) {
    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Try geo: URL first (opens native map app)
        window.location.href = geoUrl;
        
        // Fallback to Google Maps if geo: doesn't work
        setTimeout(() => {
            window.open(mapsUrl, '_blank');
        }, 500);
    } else {
        // Desktop: open Google Maps in new tab
        window.open(mapsUrl, '_blank');
    }
}

/**
 * Get user's ZIP code from search input or localStorage
 * @returns {string|null} - User's ZIP code
 */
function getUserZipCode() {
    // Try to get from current search input
    const zipInput = document.getElementById('nonprofitZip');
    if (zipInput && zipInput.value.trim()) {
        return zipInput.value.trim();
    }
    
    // Try to get from localStorage (if previously searched)
    const lastZip = localStorage.getItem('lastSearchZip');
    if (lastZip) {
        return lastZip;
    }
    
    return null;
}

/**
 * Calculate straight-line distance between two ZIP codes (Haversine formula)
 * @param {string} zip1 - First ZIP code
 * @param {string} zip2 - Second ZIP code
 * @returns {number|null} - Distance in miles
 */
function calculateDistance(zip1, zip2) {
    // Simplified ZIP to approximate lat/long (US-centric)
    // This uses ZIP code prefix approximation for rough distance
    const zipToCoords = (zip) => {
        const zipNum = parseInt(zip.substring(0, 3));
        // Approximate lat/long based on ZIP prefix (rough estimates)
        // Format: [latitude, longitude]
        const zipMap = {
            '006': [43.7, -72.3],  // VT
            '100': [40.7, -74.0],  // NYC
            '200': [38.9, -77.0],  // DC
            '300': [33.7, -84.4],  // Atlanta
            '400': [36.2, -86.8],  // Nashville
            '500': [41.6, -93.6],  // Des Moines
            '600': [41.9, -87.6],  // Chicago
            '700': [29.9, -90.1],  // New Orleans
            '800': [39.7, -104.9], // Denver
            '900': [34.0, -118.2], // LA
        };
        
        // Find closest ZIP prefix match
        const prefix = Math.floor(zipNum / 100) * 100;
        const key = prefix.toString().padStart(3, '0');
        return zipMap[key] || [39.8, -98.6]; // Default to US center
    };
    
    try {
        const [lat1, lon1] = zipToCoords(zip1);
        const [lat2, lon2] = zipToCoords(zip2);
        
        // Haversine formula
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    } catch (error) {
        console.warn('Error calculating distance:', error);
        return null;
    }
}

/**
 * Infer service categories from mission text
 * @param {string} mission - Organization mission statement
 * @returns {Array<string>} - Array of service category names
 */
function inferServiceCategories(mission) {
    const categories = [];
    const missionLower = mission.toLowerCase();
    
    // Food-related
    if (missionLower.includes('food') || missionLower.includes('meal') || 
        missionLower.includes('nutrition') || missionLower.includes('hunger')) {
        categories.push('🍽️ Food Assistance');
    }
    
    // Housing-related
    if (missionLower.includes('housing') || missionLower.includes('shelter') || 
        missionLower.includes('homeless') || missionLower.includes('home')) {
        categories.push('🏠 Housing Support');
    }
    
    // Health-related
    if (missionLower.includes('health') || missionLower.includes('medical') || 
        missionLower.includes('clinic') || missionLower.includes('wellness')) {
        categories.push('🏥 Healthcare Services');
    }
    
    // Mental health
    if (missionLower.includes('mental') || missionLower.includes('counseling') || 
        missionLower.includes('therapy') || missionLower.includes('crisis')) {
        categories.push('🧠 Mental Health Support');
    }
    
    // Legal services
    if (missionLower.includes('legal') || missionLower.includes('advocacy') || 
        missionLower.includes('rights') || missionLower.includes('justice')) {
        categories.push('⚖️ Legal Aid');
    }
    
    // Education
    if (missionLower.includes('education') || missionLower.includes('school') || 
        missionLower.includes('learning') || missionLower.includes('training')) {
        categories.push('📚 Educational Programs');
    }
    
    // Family/children
    if (missionLower.includes('family') || missionLower.includes('children') || 
        missionLower.includes('youth') || missionLower.includes('parent')) {
        categories.push('👨‍👩‍👧 Family Support');
    }
    
    // Employment
    if (missionLower.includes('employment') || missionLower.includes('job') || 
        missionLower.includes('workforce') || missionLower.includes('career')) {
        categories.push('💼 Employment Services');
    }
    
    return categories;
}

/**
 * Infer language support from mission text and organization name
 * @param {string} mission - Organization mission statement
 * @param {string} name - Organization name
 * @returns {Array<string>} - Array of supported languages
 */
function inferLanguageSupport(mission, name) {
    const languages = ['English']; // Default
    const textToSearch = (mission + ' ' + name).toLowerCase();
    
    if (textToSearch.includes('spanish') || textToSearch.includes('español') || 
        textToSearch.includes('hispanic') || textToSearch.includes('latino')) {
        languages.push('Spanish');
    }
    
    if (textToSearch.includes('chinese') || textToSearch.includes('mandarin') || 
        textToSearch.includes('cantonese')) {
        languages.push('Chinese');
    }
    
    if (textToSearch.includes('russian')) {
        languages.push('Russian');
    }
    
    if (textToSearch.includes('arabic')) {
        languages.push('Arabic');
    }
    
    if (textToSearch.includes('french')) {
        languages.push('French');
    }
    
    if (textToSearch.includes('korean')) {
        languages.push('Korean');
    }
    
    if (textToSearch.includes('multilingual') || textToSearch.includes('multi-lingual')) {
        languages.push('Multiple languages');
    }
    
    // If we only have English and there's no specific language mentioned, return empty
    // (better to show nothing than assume English-only)
    return languages.length > 1 ? languages : [];
}

/**
 * Infer accessibility features from mission text
 * @param {string} mission - Organization mission statement
 * @returns {Array<string>} - Array of accessibility features
 */
function inferAccessibility(mission) {
    const features = [];
    const missionLower = mission.toLowerCase();
    
    if (missionLower.includes('wheelchair') || missionLower.includes('accessible') || 
        missionLower.includes('disability')) {
        features.push('Wheelchair accessible');
    }
    
    if (missionLower.includes('asl') || missionLower.includes('sign language') || 
        missionLower.includes('deaf')) {
        features.push('ASL interpreter available');
    }
    
    if (missionLower.includes('transit') || missionLower.includes('subway') || 
        missionLower.includes('bus')) {
        features.push('Near public transportation');
    }
    
    if (missionLower.includes('parking')) {
        features.push('Parking available');
    }
    
    return features;
}

/**
 * Report outdated organization information
 * @param {string} orgName - Organization name
 * @param {string} ein - Organization EIN
 */
function reportOutdatedInfo(orgName, ein) {
    // For Phase 1, just show a simple confirmation
    // Phase 2 will connect this to backend
    const message = `Thank you for helping keep our information accurate!\n\nOrganization: ${orgName}\n\nWe'll review this organization's details and update them as soon as possible.\n\nNote: This feature will be fully functional in the next update.`;
    
    alert(message);
    
    // Optional: Could also open email client
    // const subject = encodeURIComponent(`Report Outdated Info: ${orgName}`);
    // const body = encodeURIComponent(`Organization: ${orgName}\nEIN: ${ein}\n\nWhat information is outdated?\n\n`);
    // window.location.href = `mailto:support@workforcedemocracyproject.org?subject=${subject}&body=${body}`;
}

/**
 * Close organization detail modal
 */
function closeOrganizationModal() {
    const modal = document.getElementById('orgDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions available globally
window.switchView = switchView;
window.loadCategoryServices = loadCategoryServices;
window.searchByLocation = searchByLocation;
window.showOrganizationModal = showOrganizationModal;
window.closeOrganizationModal = closeOrganizationModal;
window.openNavigation = openNavigation;
window.reportOutdatedInfo = reportOutdatedInfo;
