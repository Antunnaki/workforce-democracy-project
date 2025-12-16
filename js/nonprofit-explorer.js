/**
* Nonprofit Explorer - ProPublica API Integration
 * Workforce Democracy Project
 * 
 * Provides comprehensive nonprofit search, discovery, and verification
 * Data source: ProPublica Nonprofit Explorer (IRS Form 990 filings)
 */

// ============================================================================
// Configuration & Constants
// ============================================================================

const NONPROFIT_API = {
    BASE_URL: 'https://api.workforcedemocracyproject.org/api/nonprofits',
    ENDPOINTS: {
        SEARCH: '/search',
        ORGANIZATION: '/'
    },
    RATE_LIMIT: 100, // requests per minute
    CACHE_DURATION: 1000* 60 * 15 // 15 minutes
};

const CATEGORY_KEYWORDS = {
    healthcare: ['health', 'medical', 'hospital', 'clinic', 'healthcare', 'wellness'],
    housing: ['housing', 'homeless', 'shelter', 'affordable housing', 'transitional'],
food: ['food', 'hunger', 'meal', 'nutrition', 'pantry', 'feeding'],
    education: ['education', 'school', 'scholarship', 'literacy', 'learning', 'university'],
    environment: ['environment', 'conservation', 'wildlife','nature', 'climate', 'sustainability'],
    'human-services': ['human services', 'community', 'family', 'children', 'youth', 'senior'],
    'mental-health': ['mental health', 'counseling', 'therapy', 'behavioral', 'psychiatric'],
    legal: ['legal', 'law', 'justice', 'civil rights', 'advocacy'],
    crisis: ['crisis', 'emergency', 'domestic violence', 'abuse', 'hotline', 'suicide prevention'],
    employment: ['employment', 'job', 'workforce', 'career', 'training', 'vocational']
};

// ============================================================================
// State Management
// ============================================================================

const nonprofitExplorerState = {
    currentQuery: '',
    currentCategory: 'all',
    currentResults: [],
    currentPage: 1,
    totalResults: 0,
    isLoading: false,
    cache: new Map()
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Search for nonprofits by name or keyword
 * @param {string} query - Search query
 * @param {number} page - Page number (not used by API but for future pagination)
 * @returns {Promise<Object>} Search results
 */
async function searchNonprofits(query) {
   const cacheKey = `search_${query}`;
    
    // Check cache first
    if (nonprofitExplorerState.cache.has(cacheKey)) {
        const cached = nonprofitExplorerState.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < NONPROFIT_API.CACHE_DURATION) {
            console.log('📦 Using cached results for:', query);
            return cached.data;
        }
    }
    
    try {
        const url = `${NONPROFIT_API.BASE_URL}${NONPROFIT_API.ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`;
        console.log('🔍Fetching:', url);
        
        const response =await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the results
        nonprofitExplorerState.cache.set(cacheKey, {
            data: data.data, // Extract data fromresponse
            timestamp: Date.now()
        });
        
        console.log(`✅ Found ${data.data?.length || 0} organizations`);
        return data.data;
        
    } catch (error) {
        console.error('❌ Search error:', error);
        throw new Error(`Failed to search nonprofits: ${error.message}`);
}
}

/**
 * Get detailedinformation about a specific nonprofit
 * @param {string} ein - Employer Identification Number
 * @returns {Promise<Object>} Organization details
 */
async function getOrganizationDetails(ein) {
    const cacheKey = `org_${ein}`;
    
    // Check cache first
    if (nonprofitExplorerState.cache.has(cacheKey)) {
        const cached = nonprofitExplorerState.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < NONPROFIT_API.CACHE_DURATION) {
            console.log('📦 Using cached orgdetails for:', ein);
            return cached.data;
        }
    }
    
    try {
        const url = `${NONPROFIT_API.BASE_URL}${NONPROFIT_API.ENDPOINTS.ORGANIZATION}${ein}`;
        console.log('🔍 Fetching organization:', url);
        
        const response = await fetch(url);
        
       if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the results
        nonprofitExplorerState.cache.set(cacheKey, {
            data: data.data, // Extract data from response
            timestamp: Date.now()
        });
        
        console.log('✅ Organization details loaded');
        return data.data;
        
    } catch (error) {
        console.error('❌ Organization fetch error:', error);
        throw new Error(`Failed to load organization details: ${error.message}`);
    }
}

// ============================================================================
// UI Rendering Functions
// ============================================================================

/**
 * Render search results ascards
*/
function renderResults(organizations) {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsHeader = document.getElementById('resultsHeader');
    const resultsCount = document.getElementById('resultsCount');
    const emptyState =document.getElementById('emptyState');
    const featuredCategories = document.getElementById('featuredCategories');
if (!organizations || organizations.length === 0) {
        resultsGrid.innerHTML = '';
        resultsHeader.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No Results Found</h3>
<p>Try a different search term or browse by category</p>
        `;
        featuredCategories.style.display = 'block';
        return;
    }
    
    // Hide empty state and featured categories, show results
    emptyState.style.display = 'none';
    featuredCategories.style.display = 'none';
    resultsHeader.style.display = 'flex';
    
    // Update count
    resultsCount.textContent = `Found ${organizations.length} organization${organizations.length !== 1 ? 's' : ''}`;
    
    // Render cards
    resultsGrid.innerHTML = organizations.map(org=> createOrganizationCard(org)).join('');
    
    // Add clickhandlers tocards
    document.querySelectorAll('.org-card').forEach(card => {
        card.addEventListener('click', () => {
            const ein = card.dataset.ein;
            showOrganizationDetails(ein);
        });
    });
}

/**
 * Create HTML for organization card*/
function createOrganizationCard(org) {
    const revenue =formatCurrency(org.revenue_amount);
    const assets = formatCurrency(org.asset_amount);
    const city = org.city || 'Unknown';
    const state = org.state || '';
    const location = state ? `${city}, ${state}` : city;
    
   // Determine classification icon
    const classIcon = getClassificationIcon(org.ntee_code);
    
    return `
        <div class="org-card" data-ein="${org.ein}" tabindex="0" role="button">
            <div class="org-card-header">
                <div class="org-icon">${classIcon}</div>
                <div class="org-title-section">
                   <h3 class="org-name">${escapeHtml(org.name)}</h3>
                    <p class="org-location">
                        <i class="fas fa-map-marker-alt"></i> ${escapeHtml(location)}
                    </p>
                </div>
            </div>
            
            <div class="org-card-body">
               ${org.ntee_code ? `
                    <div class="org-classification">
                        <span class="classification-badge">${escapeHtml(org.ntee_code)}</span>
                    </div>
                ` : ''}
                
                <div class="org-stats">
                    ${revenue ? `
                        <div class="stat">
                            <span class="stat-label">Annual Revenue</span>
                            <span class="stat-value">${revenue}</span>
                        </div>
                    ` : ''}
                    ${assets ? `
                        <div class="stat">
                            <span class="stat-label">TotalAssets</span>
                            <span class="stat-value">${assets}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="org-card-footer">
                <button class="btn-view-details">
                    <i class="fas fa-info-circle"></i> View Details</button>
            </div>
        </div>
   `;
}

/**
 * Show detailed organization modal
 */
async function showOrganizationDetails(ein) {
    const modal = document.getElementById('orgModal');
    const modalBody = document.getElementById('modalBody');
    
    // Show modal with loading state
    modal.style.display = 'block';
    document.body.style.overflow ='hidden';
    
    modalBody.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading organization details...</p>
        </div>
    `;
    
    try {
        const data = await getOrganizationDetails(ein);
        const org = data.organization;
        
modalBody.innerHTML = createOrganizationDetailView(org);
        
        // Add event listeners for tabs
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.tab;
                
                // Update tabs
               document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update content
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
            });
        });
        
    } catch (error) {
        modalBody.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to Load Details</h3>
                <p>${escapeHtml(error.message)}</p>
                <button class="btn-primary" onclick="document.getElementById('orgModal').style.display='none';document.body.style.overflow='auto';">
                    Close
                </button>
            </div>
        `;
    }
}

/**
 * Create detailed organization view
 */
function createOrganizationDetailView(org) {
    const revenue = formatCurrency(org.revenue_amount);
    const assets = formatCurrency(org.asset_amount);
    const income = formatCurrency(org.income_amount);
    const city = org.city || 'Unknown';
    const state = org.state || '';
    const location = state ? `${city}, ${state}` : city;
    const classIcon = getClassificationIcon(org.ntee_code);
    
    //Get most recent filing
    const latestFiling= org.filings_with_data?.[0];
    
    return `
        <div class="org-detail-view">
            <div class="org-detail-header">
                <div class="org-detail-icon">${classIcon}</div>
                <div>
                    <h2>${escapeHtml(org.name)}</h2>
                    <p class="org-detail-location">
                        <i class="fas fa-map-marker-alt"></i> ${escapeHtml(location)}
                    </p>
                    ${org.ntee_code ? `
                        <span class="classification-badge large">${escapeHtml(org.ntee_code)}</span>
` : ''}
                </div>
            </div>
<div class="org-detail-tabs">
                <button class="detail-tab active" data-tab="overview">
                    <i class="fas fa-info-circle"></i> Overview
                </button>
                <button class="detail-tab" data-tab="financials">
<i class="fas fa-dollar-sign"></i> Financials
                </button>
                <button class="detail-tab" data-tab="contact">
                    <i class="fas fa-address-card"></i> Contact
                </button>
                ${latestFiling ? `
                    <button class="detail-tab"data-tab="filings">
                        <iclass="fas fa-file-alt"></i> IRS Filings
                    </button>
                ` : ''}
            </div>
            
            <div class="org-detail-content">
                <!-- Overview Tab -->
                <div class="tab-content active" id="overview">
                    <h3>Organization Information</h3>
                   <divclass="info-grid">
                        <div class="info-item">
                            <span class="info-label">EIN (Tax ID)</span>
                            <span class="info-value">${escapeHtml(org.ein)}</span>
                        </div>
                        ${org.ruling_date? `
                            <div class="info-item">
<span class="info-label">Founded</span>
                                <span class="info-value">${formatDate(org.ruling_date)}</span>
                            </div>
                        ` : ''}
                        ${org.organization_type ? `
                            <div class="info-item">
                                <span class="info-label">Organization Type</span>
<span class="info-value">${escapeHtml(org.organization_type)}</span>
                            </div>
                        ` : ''}
                        ${org.tax_prd ? `
                            <div class="info-item">
                                <span class="info-label">Tax Period</span>
                                <span class="info-value">${escapeHtml(org.tax_prd)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${latestFiling?.mission ? `
                        <div class="mission-statement">
                            <h4><i class="fas fa-bullseye"></i> Mission Statement</h4>
<p>${escapeHtml(latestFiling.mission)}</p>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Financials Tab -->
                <div class="tab-content" id="financials">
                    <h3>Financial Overview</h3>
                    <div class="financial-stats">
                        ${revenue ?`
                            <div class="financial-stat">
                                <i class="fas fa-chart-line"></i>
                                <div>
                                    <span class="stat-label">Annual Revenue</span>
                                    <span class="stat-value-large">${revenue}</span>
                                </div>
                            </div>
                        ` :''}
${assets ? `
                            <div class="financial-stat">
                                <i class="fas fa-building"></i>
                                <div>
                                    <span class="stat-label">Total Assets</span>
                                    <span class="stat-value-large">${assets}</span>
                                </div>
                            </div>
                        `:''}
                        ${income ? `
                            <div class="financial-stat">
                                <i class="fas fa-money-bill-wave"></i>
                                <div>
                                    <span class="stat-label">Total Income</span>
                                    <span class="stat-value-large">${income}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${latestFiling ? `
                        <div class="filing-details">
                            <h4>Latest Filing Details (${latestFiling.tax_prd_yr || 'N/A'})</h4>
                            <div class="info-grid">
                                ${latestFiling.totrevenue ? `
                                    <div class="info-item">
                                        <span class="info-label">Total Revenue</span>
                                        <span class="info-value">${formatCurrency(latestFiling.totrevenue)}</span>
                                    </div>
                                ` : ''}
                                ${latestFiling.totassetsend?`
                                    <div class="info-item">
                                        <span class="info-label">Assets (End of Year)</span>
                                        <span class="info-value">${formatCurrency(latestFiling.totassetsend)}</span>
                                    </div>
                                ` : ''}
                                ${latestFiling.totliabend?`
                                    <div class="info-item">
                                        <span class="info-label">Liabilities</span>
                                        <span class="info-value">${formatCurrency(latestFiling.totliabend)}</span>
                                    </div>
                                ` : ''}
                                ${latestFiling.totexpns ?`
                                   <div class="info-item">
                                        <span class="info-label">Total Expenses</span>
                                        <span class="info-value">${formatCurrency(latestFiling.totexpns)}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
<!--Contact Tab -->
                <div class="tab-content" id="contact">
                    <h3>Contact Information</h3>
                    <div class="contact-info">
                        ${org.address ? `
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <div>
                                   <strong>Address</strong>
                                    <p>${escapeHtml(org.address)}</p>
                                    <p>${escapeHtml(city)}, ${escapeHtml(state)} ${escapeHtml(org.zipcode || '')}</p>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${latestFiling?.website? `
                           <div class="contact-item">
                                <i class="fas fa-globe"></i>
                                <div>
                                    <strong>Website</strong>
                                    <a href="${escapeHtml(latestFiling.website)}" target="_blank" rel="noopener noreferrer">
                                        ${escapeHtml(latestFiling.website)}
                                       <i class="fas fa-external-link-alt"></i>
                                    </a>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="contact-item">
                            <i class="fas fa-search"></i>
                            <div>
                                <strong>Verify on ProPublica</strong>
<a href="https://projects.propublica.org/nonprofits/organizations/${org.ein}" target="_blank" rel="noopener noreferrer">
                                    View full IRS records
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
</div>
</div>
                
                <!-- Filings Tab -->
                ${latestFiling ? `
                    <div class="tab-content" id="filings">
                        <h3>IRS Form 990 Filings</h3>
                        <div class="filings-list">
                            ${org.filings_with_data?.slice(0, 5).map(filing => `
                                <div class="filing-item">
                                    <div class="filing-year">
                                        <i class="fas fa-calendar-alt"></i>
                                        <strong>${filing.tax_prd_yr || 'N/A'}</strong>
</div>
                                  <div class="filing-info">
                                        ${filing.totrevenue ? `<span>Revenue: ${formatCurrency(filing.totrevenue)}</span>` : ''}
                                        ${filing.totassetsend ? `<span>Assets: ${formatCurrency(filing.totassetsend)}</span>`: ''}
                                    </div>
                                    ${filing.pdf_url ? `
                                        <a href="${escapeHtml(filing.pdf_url)}" target="_blank" rel="noopener noreferrer" class="btn-filing">
                                            <i class="fas fa-file-pdf"></i> View PDF
                                        </a>
                                    ` : ''}
</div>
                            `).join('') || '<p>No filings available</p>'}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Get icon based on NTEE classification code
 */
function getClassificationIcon(nteeCode) {
   if (!nteeCode)return'<i class="fas fa-building"></i>';
    
    const prefix = nteeCode.charAt(0).toUpperCase();
    const iconMap = {
        'A': '<i class="fas fa-palette"></i>', // Arts
        'B': '<i class="fas fa-graduation-cap"></i>',// Education
        'C': '<i class="fas fa-leaf"></i>', // Environment
        'D': '<i class="fas fa-paw"></i>', // Animals
        'E': '<i class="fas fa-heartbeat"></i>', // Healthcare
       'F': '<i class="fas fa-brain"></i>', // Mental Health
        'G': '<i class="fas fa-hand-holding-medical"></i>', // Diseases
        'H': '<i class="fas fa-clinic-medical"></i>', // Medical Research
        'I': '<i class="fas fa-shield-alt"></i>', // Crime & Safety
        'J': '<i class="fas fa-briefcase"></i>', // Employment
        'K': '<i class="fas fa-utensils"></i>', // Food & Agriculture
        'L': '<i class="fas fa-home"></i>',//Housing
        'M': '<i class="fas fa-balance-scale"></i>', // Legal
        'N': '<i class="fas fa-running"></i>', // Recreation
        'O': '<i class="fas fa-child"></i>', // Youth Development
        'P': '<i class="fasfa-hands-helping"></i>', // Human Services
        'Q': '<i class="fas fa-globe"></i>', // International
        'R': '<i class="fas fa-fist-raised"></i>', // Civil Rights
        'S': '<i class="fas fa-users"></i>',// Community
        'T': '<i class="fas fa-hands"></i>', // Philanthropy
        'U': '<i class="fas fa-university"></i>', // Science
        'V': '<i class="fas fa-network-wired"></i>', //Social Science
        'W':'<i class="fas fa-handshake"></i>', // Public Affairs
        'X': '<i class="fas fa-church"></i>', // Religion
        'Y': '<i class="fas fa-building"></i>' // Mutual Benefit
    };
    
    return iconMap[prefix] || '<iclass="fas fa-building"></i>';
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency values
 */
function formatCurrency(amount) {
    if (!amount || amount === 0) return null;
    
    const num = parseInt(amount);
    if (isNaN(num))return null;
    
    if(num >=1000000000) {
        return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
       return `$${(num /1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
    } else {
        return `$${num.toLocaleString()}`;
    }
}

/**
* Format date string*/
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month:'long', 
       day: 'numeric' 
    });
}

/**
 * Escape HTML to prevent XSS
 */
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

/**
 * Show loading state
 */
function showLoading() {
    nonprofitExplorerState.isLoading = true;
    document.getElementById('loadingState').style.display = 'flex';
   document.getElementById('resultsGrid').style.display = 'none';
    document.getElementById('resultsHeader').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoading() {
   nonprofitExplorerState.isLoading =false;
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultsGrid').style.display = 'grid';
}

/**
 * Show error state
 */
function showError(message) {
    document.getElementById('errorState').style.display = 'flex';
document.getElementById('errorMessage').textContent= message;
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultsGrid').style.display = 'none';
    document.getElementById('resultsHeader').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
}

// ============================================================================
// Event Handlers
// ============================================================================/**
 * Handle search input*/
async function handleSearch(query) {
    if (!query || query.trim().length < 2) {
        nonprofitExplorerState.currentResults = [];
        renderResults([]);
        return;
    }
    
    nonprofitExplorerState.currentQuery = query;
    
   showLoading();
    
    try {
const data = await searchNonprofits(query);
        state.currentResults = data.organizations || [];
        
        hideLoading();
        renderResults(state.currentResults);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

/**
 * Debounce function forsearch input
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded',() => {
    console.log('🚀 Nonprofit Explorer initialized');
    
    // Search input
    const searchInput = document.getElementById('nonprofitSearch');
    const clearBtn = document.getElementById('clearSearch');
    const debouncedSearch = debounce(handleSearch, 500);
    
// Only attach event listeners if elementsexist (safety check forpages without nonprofit search)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        if (query.length > 0){
            clearBtn.style.display = 'flex';
        } else {
           clearBtn.style.display = 'none';
        }
        
        debouncedSearch(query);
        });
        
        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
        searchInput.value = '';
                clearBtn.style.display = 'none';
                nonprofitExplorerState.currentResults = [];
renderResults([]);
                const featuredCats = document.getElementById('featuredCategories');
                if (featuredCats) featuredCats.style.display = 'block';
            });
        }
        
        // Example searches
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click',() => {
                const query= btn.dataset.query;
                searchInput.value = query;
                if (clearBtn) clearBtn.style.display = 'flex';
                handleSearch(query);
            });
        });
    }
    
    // Category buttons (search section)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () =>{
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            state.currentCategory = category;
            
            if (category === 'all') {
                // Showall current results
                if(state.currentResults.length > 0) {
                    renderResults(state.currentResults);
                }
            } else {
                // Filter by category keywords
                const keywords = CATEGORY_KEYWORDS[category];
                if (keywords && keywords.length > 0) {
                    searchInput.value = keywords[0];
                    clearBtn.style.display = 'flex';
                    handleSearch(keywords[0]);
                }
            }
        });
    });
    
    // Category exploration cards
    document.querySelectorAll('.btn-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
e.stopPropagation();
            const query = btn.dataset.query;
            searchInput.value= query;
            clearBtn.style.display = 'flex';
            handleSearch(query);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Emergency resources modal
    const emergencyBtn = document.getElementById('showEmergencyResources');
    const emergencyModal= document.getElementById('emergencyModal');
    const emergencyModalClose = document.getElementById('emergencyModalClose');
    const emergencyModalOverlay = document.getElementById('emergencyModalOverlay');
    
    // Only add event listeners if elements exist
    if (emergencyBtn && emergencyModal) {
       emergencyBtn.addEventListener('click', () => {
           emergencyModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    const closeEmergencyModal = () => {
        if (emergencyModal) {
            emergencyModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
    
    if (emergencyModalClose) {
        emergencyModalClose.addEventListener('click', closeEmergencyModal);
    }
    if (emergencyModalOverlay) {
        emergencyModalOverlay.addEventListener('click', closeEmergencyModal);
    }
    
    // Emergency resource search buttons (with location awareness)
    document.querySelectorAll('.btn-resource').forEach(btn => {
        btn.addEventListener('click', async ()=> {
            const query = btn.dataset.query;
            searchInput.value = query;
            clearBtn.style.display = 'flex';
            closeEmergencyModal();
            
            // Try to use user's location if available
            if ('geolocation'in navigator) {
                try {
                    const position =await new Promise((resolve,reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    
                    // Add location context to search
                    console.log('🌍 Using user location for emergency search');
                    handleSearch(query, {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        useLocation: true
                    });
} catch (error) {
                    console.log('Location not available, searching without location');
                    handleSearch(query);
                }
            } else {
                handleSearch(query);
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
   // Organizationdetail modal
   const orgModal = document.getElementById('orgModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    
    const closeOrgModal = () => {
        if (orgModal){
            orgModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
    
    // Add event listeners with null checks
    if (modalClose) {
        modalClose.addEventListener('click', closeOrgModal);
    } else {
        console.warn('⚠️ Element #modalClosenot found - modal close button may not work');
    }
if (modalOverlay) {
        modalOverlay.addEventListener('click', closeOrgModal);
    } else {
        console.warn('⚠️ Element #modalOverlay not found - modal overlay click may not work');
    }
    
    // Keyboard accessibility for modalsdocument.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
            if (orgModal &&orgModal.style.display === 'block') {
                closeOrgModal();
            }
            if (emergencyModal && emergencyModal.style.display === 'block') {
                closeEmergencyModal();
            }
        }
    });
    
    // Export results button - only addif element exists
    const exportBtn = document.getElementById('exportResults');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (state.currentResults.length === 0) return;
            
            const csvContent = exportToCSV(state.currentResults);
            downloadCSV(csvContent, `nonprofits_${Date.now()}.csv`);
        });
    } else{
        console.warn('⚠️ Element #exportResults not found - export button may not work');
    }
    
    // Retry button - only add if element exists
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn){
        retryBtn.addEventListener('click',() => {
            if (state.currentQuery) {
                handleSearch(state.currentQuery);
            }
        });
    } else {
        console.warn('⚠️ Element #retryBtn not found - retry button may not work');
    }
});

/**
 * Export results to CSV
 */
functionexportToCSV(organizations) {
   const headers = ['Name', 'EIN', 'City', 'State', 'Revenue', 'Assets', 'Classification'];
    const rows = organizations.map(org => [
        org.name,
        org.ein,
        org.city || '',
org.state || '',
        org.revenue_amount|| '',
        org.asset_amount || '',
org.ntee_code || ''
    ]);
    
    const csvRows = [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
);
    
    return csvRows.join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
   link.setAttribute('download', filename);
   link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// Make functions available globally for inline event handlers
window.showOrganizationDetails = showOrganizationDetails;
