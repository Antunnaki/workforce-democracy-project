/**
 * ETHICAL BUSINESS FINDER
 * Find worker cooperatives and ethical businesses in your area
 * Created: January 23, 2025
 */

// Current filter state
let currentFilter = 'all';
let currentSearchTerm = '';

/**
 * Initialize ethical business section on page load
 */
function initializeEthicalBusiness() {
    // Check if personalization is enabled
    if (isPersonalizationEnabled()) {
        showEthicalBusinessInterface();
        loadLocalBusinesses();
    } else {
        showEthicalBusinessPrompt();
    }
}

/**
 * Show the personalization prompt (when not enabled)
 */
function showEthicalBusinessPrompt() {
    const prompt = document.getElementById('ethicalBusinessPrompt');
    const interface = document.getElementById('ethicalBusinessInterface');
    
    if (prompt) prompt.style.display = 'block';
    if (interface) interface.style.display = 'none';
}

/**
 * Show the ethical business interface (when enabled)
 */
function showEthicalBusinessInterface() {
    const prompt = document.getElementById('ethicalBusinessPrompt');
    const interface = document.getElementById('ethicalBusinessInterface');
    
    if (prompt) prompt.style.display = 'none';
    if (interface) {
        interface.style.display = 'block';
        interface.classList.add('active');
    }
    
    // Update location display
    updateLocationDisplay();
}

/**
 * Update the current location display
 */
function updateLocationDisplay() {
    const locationText = document.getElementById('currentLocationText');
    if (!locationText) return;
    
    const location = getUserLocation();
    if (location && location.derivedLocation) {
        const { state, country } = location.derivedLocation;
        locationText.textContent = `Showing businesses near ${location.postcode} (${state}, ${country})`;
    } else {
        locationText.textContent = 'Location not set';
    }
}

/**
 * Open personalization modal (V36.3.2 - Fixed conflict)
 * REMOVED local definition - now uses global function from personalization.js
 */
// function openPersonalizationModal() { ... } // REMOVED - was causing conflict!

/**
 * Change location (opens modal to update postcode)
 */
function changeLocation() {
    // V36.3.2: Use global function from personalization.js
    if (typeof window.openPersonalizationModal === 'function') {
        window.openPersonalizationModal();
    } else {
        console.error('[Ethical Business] openPersonalizationModal not found!');
        alert('Please refresh the page to enable location settings.');
    }
}

/**
 * Load businesses based on user location
 */
async function loadLocalBusinesses() {
    const location = getUserLocation();
    if (!location || !location.postcode) {
        showNoResults('Please set your location to find businesses near you.');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Check if backend is configured
    if (window.CONFIG && window.CONFIG.isBackendConfigured()) {
        try {
            const country = location.derivedLocation?.country || 'USA';
            
            const response = await fetch(window.CONFIG.ENDPOINTS.ETHICAL_BUSINESSES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    postcode: location.postcode,
                    country: country,
                    radius: 25 // miles
                })
            });
            
            if (!response.ok) {
                console.error('Ethical businesses API error:', response.status);
                throw new Error('Unable to reach ethical businesses database');
            }
            
            const data = await response.json();
            const businesses = data.businesses || [];
            displayBusinesses(businesses);
            
            console.log(`✅ Businesses loaded from backend: ${businesses.length} businesses`);
            
        } catch (error) {
            console.error('Failed to fetch businesses from backend:', error);
            console.log('⚠️ Falling back to sample data...');
            
            // Fallback to sample data
            setTimeout(() => {
                const businesses = generateSampleBusinesses(location);
                displayBusinesses(businesses);
            }, 500);
        }
    } else {
        // Backend not configured, use sample data
        console.log('ℹ️ Backend not configured, using sample business data');
        setTimeout(() => {
            const businesses = generateSampleBusinesses(location);
            displayBusinesses(businesses);
        }, 1000);
    }
}

/**
 * Generate sample businesses (replace with real API in production)
 */
function generateSampleBusinesses(location) {
    const { postcode, derivedLocation } = location;
    const { state, country } = derivedLocation;
    
    // Sample business data
    const sampleBusinesses = [
        {
            id: 1,
            name: 'Community Harvest Co-op',
            type: 'cooperative',
            typeName: 'Worker Cooperative',
            description: 'Employee-owned organic grocery store supporting local farmers and providing fair wages to all worker-owners.',
            location: `${state}, ${country}`,
            distance: '2.3 miles',
            category: 'Food & Grocery'
        },
        {
            id: 2,
            name: 'Fair Trade Coffee Roasters',
            type: 'ethical_business',
            typeName: 'Ethical Business',
            description: 'Coffee roastery committed to direct trade, living wages, and environmental sustainability.',
            location: `${state}, ${country}`,
            distance: '3.7 miles',
            category: 'Food & Beverage'
        },
        {
            id: 3,
            name: 'Neighborhood Tool Library',
            type: 'community_service',
            typeName: 'Community Service',
            description: 'Community-run tool lending library promoting resource sharing and reducing consumption.',
            location: `${state}, ${country}`,
            distance: '1.5 miles',
            category: 'Community Resources'
        },
        {
            id: 4,
            name: 'Green Tech Collective',
            type: 'cooperative',
            typeName: 'Worker Cooperative',
            description: 'Technology services co-op providing web development, IT support, and training with democratic governance.',
            location: `${state}, ${country}`,
            distance: '4.2 miles',
            category: 'Technology'
        },
        {
            id: 5,
            name: 'Ethical Threads Boutique',
            type: 'ethical_business',
            typeName: 'Ethical Business',
            description: 'Clothing store featuring fair trade fashion, transparent supply chains, and living wage commitments.',
            location: `${state}, ${country}`,
            distance: '2.8 miles',
            category: 'Retail'
        },
        {
            id: 6,
            name: 'Community Kitchen Incubator',
            type: 'social_enterprise',
            typeName: 'Social Enterprise',
            description: 'Shared commercial kitchen space supporting food entrepreneurs from underserved communities.',
            location: `${state}, ${country}`,
            distance: '3.1 miles',
            category: 'Food Services'
        },
        {
            id: 7,
            name: 'Bike Repair Cooperative',
            type: 'cooperative',
            typeName: 'Worker Cooperative',
            description: 'Worker-owned bike shop offering repairs, sales, and workshops on bicycle maintenance.',
            location: `${state}, ${country}`,
            distance: '1.9 miles',
            category: 'Services'
        },
        {
            id: 8,
            name: 'Local Food Hub',
            type: 'social_enterprise',
            typeName: 'Social Enterprise',
            description: 'Aggregates and distributes produce from small local farms to restaurants and markets.',
            location: `${state}, ${country}`,
            distance: '5.6 miles',
            category: 'Agriculture'
        }
    ];
    
    return sampleBusinesses;
}

/**
 * Display businesses in the results grid
 */
function displayBusinesses(businesses) {
    const resultsContainer = document.getElementById('ethicalBusinessResults');
    const loadingState = document.getElementById('businessLoadingState');
    const noResults = document.getElementById('businessNoResults');
    
    // Hide loading
    if (loadingState) loadingState.style.display = 'none';
    
    // Filter businesses based on current filter and search
    let filteredBusinesses = businesses;
    
    if (currentFilter !== 'all') {
        filteredBusinesses = filteredBusinesses.filter(b => b.type === currentFilter);
    }
    
    if (currentSearchTerm) {
        const searchLower = currentSearchTerm.toLowerCase();
        filteredBusinesses = filteredBusinesses.filter(b => 
            b.name.toLowerCase().includes(searchLower) ||
            b.description.toLowerCase().includes(searchLower) ||
            b.category.toLowerCase().includes(searchLower)
        );
    }
    
    // Show no results if empty
    if (filteredBusinesses.length === 0) {
        if (resultsContainer) resultsContainer.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    // Hide no results
    if (noResults) noResults.style.display = 'none';
    
    // Create business cards
    if (resultsContainer) {
        resultsContainer.innerHTML = filteredBusinesses.map(business => createBusinessCard(business)).join('');
    }
}

/**
 * Create HTML for a business card
 */
function createBusinessCard(business) {
    const iconClass = business.type;
    const icon = getBusinessIcon(business.type);
    
    return `
        <div class="business-card" data-business-id="${business.id}">
            <div class="business-card-header">
                <div class="business-icon ${iconClass}">
                    ${icon}
                </div>
                <div class="business-card-title">
                    <h4>${business.name}</h4>
                    <span class="business-type">${business.typeName}</span>
                </div>
            </div>
            <div class="business-card-content">
                <p>${business.description}</p>
            </div>
            <div class="business-card-footer">
                <div class="business-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${business.distance} • ${business.location}</span>
                </div>
                <div class="business-actions">
                    <button class="business-action-btn" onclick="shareBusiness(${business.id})" aria-label="Share business" title="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="business-action-btn" onclick="saveBusiness(${business.id})" aria-label="Save business" title="Save">
                        <i class="far fa-bookmark"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get icon for business type
 */
function getBusinessIcon(type) {
    const icons = {
        cooperative: '🤝',
        ethical_business: '✅',
        community_service: '🆘',
        social_enterprise: '🌱'
    };
    return icons[type] || '🏢';
}

/**
 * Filter businesses by type
 */
function filterBusinesses(filterType) {
    currentFilter = filterType;
    
    // Update filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        if (chip.dataset.filter === filterType) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    
    // Reload businesses with new filter
    loadLocalBusinesses();
}

/**
 * Search businesses
 */
function searchBusinesses() {
    const searchInput = document.getElementById('businessSearchInput');
    if (searchInput) {
        currentSearchTerm = searchInput.value.trim();
        loadLocalBusinesses();
    }
}

/**
 * Share business (placeholder)
 */
function shareBusiness(businessId) {
    if (typeof showNotification === 'function') {
        showNotification('Share functionality coming soon!', 'info');
    } else {
        alert('Share functionality coming soon!');
    }
}

/**
 * Save business (placeholder)
 */
function saveBusiness(businessId) {
    if (typeof showNotification === 'function') {
        showNotification('Saved to your bookmarks!', 'success');
    } else {
        alert('Saved to your bookmarks!');
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const resultsContainer = document.getElementById('ethicalBusinessResults');
    const loadingState = document.getElementById('businessLoadingState');
    const noResults = document.getElementById('businessNoResults');
    
    if (resultsContainer) resultsContainer.innerHTML = '';
    if (loadingState) loadingState.style.display = 'block';
    if (noResults) noResults.style.display = 'none';
}

/**
 * Show no results state
 */
function showNoResults(message = 'No businesses found') {
    const resultsContainer = document.getElementById('ethicalBusinessResults');
    const loadingState = document.getElementById('businessLoadingState');
    const noResults = document.getElementById('businessNoResults');
    
    if (resultsContainer) resultsContainer.innerHTML = '';
    if (loadingState) loadingState.style.display = 'none';
    if (noResults) {
        noResults.style.display = 'block';
        const noResultsText = noResults.querySelector('p');
        if (noResultsText) noResultsText.textContent = message;
    }
}

/**
 * Refresh ethical business section after personalization is enabled
 */
function refreshEthicalBusinessSection() {
    if (isPersonalizationEnabled()) {
        showEthicalBusinessInterface();
        loadLocalBusinesses();
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEthicalBusiness);
} else {
    initializeEthicalBusiness();
}

// Listen for Enter key on search input
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('businessSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBusinesses();
            }
        });
    }
});

// Expose to window for welcome modal
window.refreshEthicalBusinessSection = refreshEthicalBusinessSection;
