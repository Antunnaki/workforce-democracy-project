/**
 * BILLS SECTION - Complete Functionality (V37.12.8-LOGIN-TIMING-FIX)
 * Personalized bill tracking, AI-powered analysis, native sharing
 * 
 * Architecture: Netlify (Frontend) + Njalla VPS (Backend) + Groq (LLM)
 * 
 * Features:
 * - Personalization flow (ZIP code → auto-populate bills)
 * - Category filtering (Education, Healthcare, Environment, etc.)
 * - Government level filtering (Federal, State, Local)
 * - Inline AI chat (contextual bill analysis via Groq)
 * - Native mobile sharing (Web Share API)
 * - Representative contact (phone, email - NO websites)
 * - Vote tracking and alignment scores
 * 
 * V37.12.8 FIXES (Nov 20, 2025):
 * ✅ Fixed login timing race condition → Bills now load on first login (no refresh)
 * ✅ Added initialization guard to prevent concurrent initializations
 * ✅ Event listener attached before initialization starts
 * 
 * Previous fixes:
 * ✅ V37.12.7: Fixed "Sponsor: Unknown" and "Introduced: Invalid Date"
 * ✅ V37.12.6: Fixed personalization:ready event dispatch
 * ✅ V37.12.5: Backend Bills API integration
 */

// ========== STATE MANAGEMENT ==========

const billsState = {
    personalized: false,
    userZipCode: null,
    activeCategory: 'all',
    activeLevel: 'all',
    userVotes: {}, // billId: 'yes'|'no'|'abstain'
    bills: [], // Loaded bills from backend
    openInlineChats: {} // billId: true/false
};

// Category colors for visual coding
const CATEGORY_COLORS = {
    education: '#4299e1',
    healthcare: '#48bb78',
    environment: '#38b2ac',
    economy: '#ed8936',
    rights: '#9f7aea',
    labor: '#f56565',
    housing: '#ed64a6',
    all: '#667eea'
};

// ========== INITIALIZATION ==========

/**
 * Initialize Bills Section
 * Check personalization status and set up UI
 * V37.12.0: Updated to work with new PersonalizationSystem
 */
function initializeBillsSection() {
    console.log('[Bills Section V37.12.8] 🚀 Initializing (LOGIN TIMING FIX)...');
    console.log('[Bills Section V37.12.8] 🔍 DEEP DIAGNOSTIC MODE + API FIELD DEBUG');
    
    let zipCode = null;
    let isPersonalized = false;
    
    // V37.12.6: ULTRA-COMPREHENSIVE DIAGNOSTIC
    console.log('[Bills Section V37.12.6] 📊 FULL SYSTEM CHECK:');
    console.log('  - window.PersonalizationSystem exists:', !!window.PersonalizationSystem);
    console.log('  - wdp_username:', localStorage.getItem('wdp_username'));
    
    // Check raw localStorage data
    const rawUserData = localStorage.getItem('wdp_user_data');
    console.log('  - wdp_user_data RAW:', rawUserData ? rawUserData.substring(0, 200) + '...' : 'MISSING');
    
    if (rawUserData) {
        try {
            const parsed = JSON.parse(rawUserData);
            console.log('  - wdp_user_data PARSED:', parsed);
            console.log('  - wdp_user_data.address:', parsed.address);
            console.log('  - wdp_user_data.address.zip:', parsed.address?.zip);
            console.log('  - wdp_user_data.representatives:', parsed.representatives);
            console.log('  - wdp_user_data.representatives.zip:', parsed.representatives?.zip);
        } catch (e) {
            console.error('[Bills Section V37.12.6] ❌ Failed to parse wdp_user_data:', e);
        }
    }
    
    // V37.12.6: ENHANCED - Try multiple sources for ZIP code
    const username = localStorage.getItem('wdp_username');
    console.log('[Bills Section V37.12.6] 👤 Username from localStorage:', username);
    
    if (!window.PersonalizationSystem) {
        console.error('[Bills Section V37.12.6] ❌ PersonalizationSystem not found on window object!');
        console.error('[Bills Section V37.12.6] ❌ This means personalization-system.js did not load correctly');
    } else {
        console.log('[Bills Section V37.12.6] ✅ PersonalizationSystem is available');
    }
    
    if (username && window.PersonalizationSystem) {
        console.log('[Bills Section V37.12.6] ✅ User logged in:', username);
        console.log('[Bills Section V37.12.6] ✅ PersonalizationSystem available');
        
        try {
            const userData = window.PersonalizationSystem.getUserData();
            console.log('[Bills Section V37.12.6] 📊 User data retrieved from PersonalizationSystem.getUserData():', JSON.stringify(userData, null, 2));
            
            // V37.12.6: Try multiple sources in order of priority
            // 1. Try address.zip
            if (userData?.address?.zip) {
                zipCode = userData.address.zip;
                isPersonalized = true;
                console.log('[Bills Section V37.12.6] ✅ Found ZIP from userData.address.zip:', zipCode);
            }
            // 2. Try representatives.zip
            else if (userData?.representatives?.zip) {
                zipCode = userData.representatives.zip;
                isPersonalized = true;
                console.log('[Bills Section V37.12.6] ✅ Found ZIP from userData.representatives.zip:', zipCode);
            }
            // 3. Try OLD personalization data structure (backward compatibility)
            else if (userData?.personalization?.zipcode) {
                zipCode = userData.personalization.zipcode;
                isPersonalized = true;
                console.log('[Bills Section V37.12.6] ✅ Found ZIP from userData.personalization.zipcode (legacy):', zipCode);
            }
            // 4. Try direct localStorage keys (fallback for very old data)
            else {
                const legacyZip = localStorage.getItem('wdp_personalization_zipcode');
                const legacyLocation = localStorage.getItem('wdp_user_location');
                
                if (legacyZip) {
                    zipCode = legacyZip;
                    isPersonalized = true;
                    console.log('[Bills Section V37.12.6] ✅ Found ZIP from legacy localStorage (wdp_personalization_zipcode):', zipCode);
                } else if (legacyLocation) {
                    try {
                        const locData = JSON.parse(legacyLocation);
                        zipCode = locData.postcode || locData.zipcode;
                        if (zipCode) {
                            isPersonalized = true;
                            console.log('[Bills Section V37.12.6] ✅ Found ZIP from legacy localStorage (wdp_user_location):', zipCode);
                        }
                    } catch (e) {
                        console.error('[Bills Section V37.12.6] ❌ Failed to parse legacy location data:', e);
                    }
                }
                
                if (!zipCode) {
                    console.warn('[Bills Section V37.12.6] ⚠️ User data exists but NO ZIP CODE found in any location!');
                    console.warn('[Bills Section V37.12.6] ⚠️ Checked:');
                    console.warn('  1. userData.address.zip:', userData?.address?.zip);
                    console.warn('  2. userData.representatives.zip:', userData?.representatives?.zip);
                    console.warn('  3. userData.personalization.zipcode:', userData?.personalization?.zipcode);
                    console.warn('  4. localStorage.wdp_personalization_zipcode:', legacyZip);
                    console.warn('  5. localStorage.wdp_user_location:', legacyLocation);
                    console.warn('[Bills Section V37.12.6] 📊 Full user data structure:');
                    console.warn(JSON.stringify(userData, null, 2));
                    console.warn('[Bills Section V37.12.6] 💡 User needs to enter ZIP in Representatives tab');
                }
            }
        } catch (e) {
            console.error('[Bills Section V37.12.6] ❌ Error reading PersonalizationSystem:', e);
            console.error('[Bills Section V37.12.6] Error stack:', e.stack);
        }
    } else {
        console.log('[Bills Section V37.12.6] ℹ️ User not logged in (username:', username, ') or PersonalizationSystem not available (', !!window.PersonalizationSystem, ')');
    }
    
    // Set state
    if (isPersonalized && zipCode) {
        billsState.personalized = true;
        billsState.userZipCode = zipCode;
        console.log('[Bills Section] ✅ Personalized mode enabled for ZIP:', zipCode);
    } else {
        console.log('[Bills Section] ℹ️ Not personalized - showing getting started panel');
    }
    
    // Load user votes from localStorage
    const savedVotes = localStorage.getItem('bills_user_votes');
    if (savedVotes) {
        try {
            billsState.userVotes = JSON.parse(savedVotes);
        } catch (e) {
            console.error('[Bills Section] Failed to load votes:', e);
        }
    }
    
    // Update UI based on personalization status
    updateBillsUI();
    
    // V37.12.6: Fetch bills if personalized
    console.log('[Bills Section V37.12.6] 🎯 Final state:');
    console.log('  - billsState.personalized:', billsState.personalized);
    console.log('  - billsState.userZipCode:', billsState.userZipCode);
    
    if (billsState.personalized && billsState.userZipCode) {
        console.log('[Bills Section V37.12.6] 🚀 Auto-fetching bills for ZIP:', billsState.userZipCode);
        fetchBillsForLocation(billsState.userZipCode);
    } else if (billsState.personalized && !billsState.userZipCode) {
        console.error('[Bills Section V37.12.6] ❌ FATAL: personalized=true but userZipCode is empty!');
    } else {
        console.log('[Bills Section V37.12.6] ℹ️ Not personalized yet - showing getting started panel');
    }
}

/**
 * Update Bills UI based on personalization status
 */
function updateBillsUI() {
    const gettingStarted = document.getElementById('billsGettingStarted');
    const progressIndicator = document.getElementById('billsProgressIndicator');
    const categoryTabs = document.getElementById('billsCategoryTabs');
    const levelFilter = document.getElementById('billsLevelFilter');
    const billsContainer = document.getElementById('billsListContainer');
    
    if (billsState.personalized) {
        // Hide getting started, show filters and bills
        if (gettingStarted) gettingStarted.style.display = 'none';
        if (progressIndicator) progressIndicator.style.display = 'block';
        if (categoryTabs) categoryTabs.style.display = 'flex';
        if (levelFilter) levelFilter.style.display = 'flex';
        if (billsContainer) billsContainer.style.display = 'block';
        
        // Update progress indicator
        updateProgressIndicator();
    } else {
        // Show getting started, hide everything else
        if (gettingStarted) gettingStarted.style.display = 'block';
        if (progressIndicator) progressIndicator.style.display = 'none';
        if (categoryTabs) categoryTabs.style.display = 'none';
        if (levelFilter) levelFilter.style.display = 'none';
        if (billsContainer) billsContainer.style.display = 'none';
    }
}

/**
 * Open Personalization Modal (V36.3.2)
 * REMOVED - This function was causing a conflict!
 * The proper implementation is in personalization.js
 * Bills section now relies on the global window.openPersonalizationModal from personalization.js
 */
// function openPersonalizationModal() { ... } // REMOVED

// ========== BILL FETCHING (GROQ BACKEND INTEGRATION) ==========

/**
 * Fetch Bills for User's Location
 * V37.17.0: NOW WITH 30-DAY BROWSER CACHING + COST OPTIMIZATION
 * Calls backend only if cache is expired or missing
 * 
 * BACKEND ENDPOINT: /api/bills/location
 * 
 * @param {string} zipCode - User's ZIP code
 * @param {boolean} forceRefresh - Force bypass cache (default: false)
 */
async function fetchBillsForLocation(zipCode, forceRefresh = false) {
    // V37.17.0: CHECK CACHE FIRST (30-day expiration)
    const CACHE_KEY = `wdp_bills_cache_${zipCode}`;
    const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (!forceRefresh) {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const cacheData = JSON.parse(cached);
                const now = Date.now();
                
                if (cacheData.expiresAt > now) {
                    // Cache is still valid!
                    console.log(`✅ [Bills Cache] Using cached bills (expires in ${Math.round((cacheData.expiresAt - now) / (24 * 60 * 60 * 1000))} days)`);
                    billsState.bills = cacheData.bills;
                    renderBills();
                    return; // Skip API call entirely 💰
                } else {
                    console.log('⏰ [Bills Cache] Cache expired, fetching fresh data...');
                }
            }
        } catch (e) {
            console.warn('[Bills Cache] Failed to read cache:', e.message);
        }
    }
    // Show loading state
    const billsContainer = document.getElementById('billsListContainer');
    if (billsContainer) {
        billsContainer.innerHTML = `
            <div class="bills-loading">
                <div class="loading-spinner"></div>
                <p>Loading bills for your area...</p>
            </div>
        `;
    }
    
    // V37.12.5: NEW BILLS API - Direct integration with Congress.gov + OpenStates
    console.log('[Bills API v37.12.5] Fetching bills for ZIP:', zipCode);
    
    if (window.CONFIG && window.CONFIG.isBackendConfigured()) {
        // Backend is configured, attempt to fetch real bills data
        try {
            // NEW API endpoint: GET /api/bills/location?zip={zipCode}
            const apiUrl = `${window.CONFIG.API_BASE_URL}/api/bills/location?zip=${zipCode}&category=${billsState.activeCategory}&level=${billsState.activeLevel}`;
            
            console.log('[Bills API] Calling:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error('[Bills API] Error:', response.status);
                throw new Error(`Bills API returned ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                console.error('[Bills API] API returned success=false:', data.error);
                throw new Error(data.error || 'Bills API failed');
            }
            
            // LOG FIRST BILL TO DEBUG FIELD MAPPING
            if (data.bills && data.bills.length > 0) {
                console.log('🔍 [Bills Debug] First bill from API:', JSON.stringify(data.bills[0], null, 2));
            }
            
            // Transform API data to match our bill format
            billsState.bills = (data.bills || []).map(bill => {
                const mapped = {
                    id: bill.id || 'unknown',
                    billNumber: bill.id || 'unknown',
                    title: bill.title || 'No Title',
                    category: bill.category || 'other',
                    level: bill.level || 'federal',
                    status: bill.status || 'pending',
                    summary: bill.description || bill.title || 'No description available',
                    impact: null, // V37.14.0: Will be loaded from AI (no more hardcoded 3)
                    ai_loading: false, // Track AI analysis loading state
                    ai_summary: null, // AI-generated plain language summary
                    ai_impact_score: null, // AI-generated impact score (1-5)
                    ai_impact_reason: null, // Reason for the impact score
                    ai_key_points: null, // Key points from AI analysis (backwards compat)
                    ai_key_provisions: null, // V37.15.0: Detailed provisions from bill text
                    ai_affects: null, // Who this bill affects
                    ai_economic_impact: null, // V37.15.0: Economic impact estimate
                    ai_arguments_for: null, // V37.15.0: Arguments supporting the bill
                    ai_arguments_against: null, // V37.15.0: Arguments opposing the bill
                    ai_similar_legislation: null, // V37.15.0: Similar past bills
                    ai_next_steps: null, // V37.15.0: What happens next
                    officialDocLink: bill.url || '#',
                    sponsors: bill.sponsor ? [bill.sponsor] : ['Unknown'],
                    cosponsors: bill.cosponsors || 0,
                    introducedDate: bill.introduced_date || bill.introducedDate || null,
                    lastActionDate: bill.last_action || bill.lastActionDate || null,
                    chamber: bill.chamber || 'unknown',
                    representatives: [] // Will be populated if needed
                };
                
                // Debug first mapped bill
                if (billsState.bills.length === 0) {
                    console.log('🔍 [Bills Debug] First mapped bill:', JSON.stringify(mapped, null, 2));
                }
                
                return mapped;
            });
            
            renderBills();
            
            // V37.17.0: SAVE TO CACHE (30-day expiration)
            try {
                const cacheData = {
                    bills: billsState.bills,
                    zipCode: zipCode,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + CACHE_DURATION
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                console.log(`💾 [Bills Cache] Saved ${billsState.bills.length} bills to cache (30-day expiration)`);
            } catch (e) {
                console.warn('[Bills Cache] Failed to save cache:', e.message);
            }
            
            console.log(`✅ [Bills API] Loaded ${billsState.bills.length} real bills from Congress.gov + OpenStates`);
            console.log(`   - Federal bills: ${billsState.bills.filter(b => b.level === 'federal').length}`);
            console.log(`   - State bills: ${billsState.bills.filter(b => b.level === 'state').length}`);
            
            // V37.17.0: COST OPTIMIZATION - AI analysis is now ON-DEMAND ONLY
            // No more auto-analysis! Users click "Ask AI" to trigger analysis.
            // loadAIAnalysisForAllBills(); // ❌ REMOVED - saved 95% of LLM costs!
            
        } catch (error) {
            console.error('[Bills API] Failed to fetch bills:', error);
            console.log('⚠️ Falling back to sample data...');
            
            // Fallback to sample data
            setTimeout(() => {
                billsState.bills = generateSampleBills(zipCode);
                renderBills();
            }, 500);
        }
    } else {
        // Backend not configured, use sample data
        console.log('⚠️ Backend not configured - using sample bills data');
        setTimeout(() => {
            billsState.bills = generateSampleBills(zipCode);
            renderBills();
        }, 1500);
    }
}

// =============================================================================
// AI ANALYSIS (V37.17.0 - ON-DEMAND ONLY)
// =============================================================================

/**
 * V37.17.0: AI Analysis is now ON-DEMAND ONLY
 * 
 * COST OPTIMIZATION:
 * - OLD: Auto-analyzed 50 bills = 50 LLM calls per page load ($$$)
 * - NEW: Only analyze when user clicks "Ask AI" (95% cost reduction!)
 * 
 * loadAIAnalysisForAllBills() function REMOVED to save costs
 */

// ❌ REMOVED: Auto-analysis function (cost optimization)
// async function loadAIAnalysisForAllBills() { ... }

/**
 * Load AI Analysis for a Single Bill
 * Calls backend /api/ai/bills/analyze endpoint
 * 
 * @param {Object} bill - Bill object to analyze
 * @returns {Promise<Object>} - Updated bill object with AI analysis
 */
async function loadBillAIAnalysis(bill) {
    try {
        // Mark as loading
        bill.ai_loading = true;
        
        const apiUrl = `${window.CONFIG.API_BASE_URL}/api/ai/bills/analyze`;
        
        console.log(`🧠 [AI Bills] Analyzing ${bill.id}...`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bill: {
                    id: bill.id,
                    title: bill.title,
                    summary: bill.summary,
                    level: bill.level,
                    sponsor: bill.sponsors[0],
                    chamber: bill.chamber
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`AI analysis failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.analysis) {
            // Update bill with AI analysis (V37.15.0: Enhanced fields)
            bill.ai_summary = data.analysis.summary;
            bill.ai_impact_score = data.analysis.impact_score;
            bill.ai_impact_reason = data.analysis.impact_reason;
            bill.ai_key_points = data.analysis.key_points || data.analysis.key_provisions; // Backwards compat
            bill.ai_key_provisions = data.analysis.key_provisions || data.analysis.key_points;
            bill.ai_affects = data.analysis.affects;
            bill.ai_economic_impact = data.analysis.economic_impact;
            bill.ai_arguments_for = data.analysis.arguments_for;
            bill.ai_arguments_against = data.analysis.arguments_against;
            bill.ai_similar_legislation = data.analysis.similar_legislation;
            bill.ai_next_steps = data.analysis.next_steps;
            bill.ai_loading = false;
            
            const cacheStatus = data.cached ? '(cached)' : '(new)';
            const sourcesInfo = data.sources_used ? 
                `(sources: text=${data.sources_used.full_text}, web=${data.sources_used.web_search})` : '';
            console.log(`✅ [AI Bills] ${bill.id} analyzed ${cacheStatus} ${sourcesInfo}: ${bill.ai_impact_score}/5 stars`);
        } else {
            throw new Error('Invalid AI response');
        }
        
        return bill;
        
    } catch (error) {
        console.error(`❌ [AI Bills] Failed to analyze ${bill.id}:`, error.message);
        
        // Mark as failed (don't retry)
        bill.ai_loading = false;
        bill.ai_impact_score = null; // Will show "Analysis unavailable"
        
        return bill;
    }
}

/**
 * Generate Sample Bills (Development Only)
 * This will be replaced by real Groq API data
 */
function generateSampleBills(zipCode) {
    return [
        {
            id: 'hr-1234-federal',
            billNumber: 'HR 1234',
            title: 'Education Funding Equity Act of 2025',
            category: 'education',
            level: 'federal',
            status: 'pending',
            summary: 'Increases federal funding for public schools in underserved communities by $50 billion over 10 years.',
            impact: 4,
            officialDocLink: 'https://congress.gov/bill/119th-congress/house-bill/1234',
            sponsors: ['Rep. Alexandria Ocasio-Cortez (D-NY-14)'],
            cosponsors: 87,
            introducedDate: '2025-01-15',
            representatives: [
                {
                    name: 'Rep. John Smith',
                    position: 'Not Yet Voted',
                    phoneOffice: '(202) 225-0001',
                    phoneLocal: '(555) 123-4567',
                    email: 'john.smith@mail.house.gov'
                }
            ]
        },
        {
            id: 's-567-federal',
            billNumber: 'S 567',
            title: 'Climate Action Now Act',
            category: 'environment',
            level: 'federal',
            status: 'pending',
            summary: 'Establishes carbon neutrality goals by 2040 and invests $200 billion in renewable energy infrastructure.',
            impact: 5,
            officialDocLink: 'https://congress.gov/bill/119th-congress/senate-bill/567',
            sponsors: ['Sen. Bernie Sanders (I-VT)'],
            cosponsors: 34,
            introducedDate: '2025-01-20',
            representatives: [
                {
                    name: 'Sen. Jane Doe',
                    position: 'Not Yet Voted',
                    phoneOffice: '(202) 224-0001',
                    phoneLocal: '(555) 234-5678',
                    email: 'jane.doe@mail.senate.gov'
                }
            ]
        },
        {
            id: 'ab-123-state',
            billNumber: 'AB 123',
            title: 'Universal Healthcare Coverage Act',
            category: 'healthcare',
            level: 'state',
            status: 'pending',
            summary: 'Establishes a single-payer healthcare system for all state residents, covering medical, dental, and vision.',
            impact: 5,
            officialDocLink: '#',
            sponsors: ['Assemblymember Sarah Johnson'],
            cosponsors: 45,
            introducedDate: '2025-01-10',
            representatives: [
                {
                    name: 'Assemblymember Sarah Johnson',
                    position: 'Sponsor - Supporting',
                    phoneOffice: '(916) 555-0001',
                    phoneLocal: '(555) 345-6789',
                    email: 'sarah.johnson@assembly.gov'
                }
            ]
        },
        {
            id: 'ord-2025-01-local',
            billNumber: 'Ord. 2025-01',
            title: 'Affordable Housing Zoning Reform',
            category: 'housing',
            level: 'local',
            status: 'pending',
            summary: 'Allows multi-family housing in areas previously zoned for single-family homes to increase affordable housing stock.',
            impact: 4,
            officialDocLink: '#',
            sponsors: ['City Council Member Tom Williams'],
            cosponsors: 6,
            introducedDate: '2025-01-08',
            representatives: [
                {
                    name: 'Council Member Tom Williams',
                    position: 'Sponsor - Supporting',
                    phoneOffice: '(555) 456-7890',
                    phoneLocal: '(555) 456-7891',
                    email: 'tom.williams@citycouncil.gov'
                }
            ]
        }
    ];
}

// ========== FILTERING ==========

/**
 * Filter Bills by Category
 * Called when user clicks category tab
 */
function filterBillsByCategory(category) {
    billsState.activeCategory = category;
    
    // Update active tab UI
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Re-render bills with new filter
    renderBills();
}

/**
 * Filter Bills by Government Level
 * Called when user clicks level filter button
 */
function filterBillsByLevel(level) {
    billsState.activeLevel = level;
    
    // Update active button UI
    document.querySelectorAll('.level-filter-btn').forEach(btn => {
        if (btn.dataset.level === level) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Re-render bills with new filter
    renderBills();
}

/**
 * Get Filtered Bills based on active category and level
 */
function getFilteredBills() {
    let filtered = billsState.bills;
    
    // Filter by category
    if (billsState.activeCategory !== 'all') {
        filtered = filtered.filter(bill => bill.category === billsState.activeCategory);
    }
    
    // Filter by level
    if (billsState.activeLevel !== 'all') {
        filtered = filtered.filter(bill => bill.level === billsState.activeLevel);
    }
    
    return filtered;
}

// ========== RENDERING ==========

/**
 * Render Bills List
 * Displays filtered bills as cards
 */
function renderBills() {
    const billsContainer = document.getElementById('billsListContainer');
    if (!billsContainer) return;
    
    const filteredBills = getFilteredBills();
    
    if (filteredBills.length === 0) {
        billsContainer.innerHTML = `
            <div class="bills-empty">
                <p>📭 No bills match your current filters.</p>
                <p>Try selecting a different category or government level.</p>
            </div>
        `;
        return;
    }
    
    billsContainer.innerHTML = filteredBills.map(bill => renderBillCard(bill)).join('');
}

/**
 * Render Individual Bill Card
 * Creates HTML for a single bill with all components
 * 
 * Components:
 * - Category header bar (color-coded)
 * - Bill info (number, title, status, level)
 * - Summary and impact rating
 * - Inline AI chat (expandable)
 * - Vote buttons
 * - Representative contact info
 * - Official document link
 * - Share button (Web Share API)
 */
function renderBillCard(bill) {
    const userVote = billsState.userVotes[bill.id];
    const hasVoted = !!userVote;
    const categoryColor = CATEGORY_COLORS[bill.category] || CATEGORY_COLORS.all;
    const inlineChatOpen = billsState.openInlineChats[bill.id] || false;
    
    // Level icon
    const levelIcons = {
        federal: '🏛️',
        state: '🏢',
        local: '🏘️'
    };
    
    // Status badge
    const statusBadges = {
        pending: '<span class="status-badge status-pending">⏳ Pending Vote</span>',
        passed: '<span class="status-badge status-passed">✅ Passed</span>',
        failed: '<span class="status-badge status-failed">❌ Failed</span>'
    };
    
    return `
        <div class="bill-card" data-bill-id="${bill.id}">
            <!-- Category Header Bar -->
            <div class="bill-category-bar" style="background: ${categoryColor};">
                <span class="category-name">${bill.category.toUpperCase()}</span>
            </div>
            
            <!-- Bill Header -->
            <div class="bill-header">
                <div class="bill-meta">
                    <span class="bill-number">${bill.billNumber}</span>
                    <span class="bill-level">${levelIcons[bill.level]} ${bill.level.charAt(0).toUpperCase() + bill.level.slice(1)}</span>
                    ${statusBadges[bill.status] || ''}
                </div>
                <h3 class="bill-title">${escapeHtml(bill.title)}</h3>
            </div>
            
            <!-- AI Summary (V37.14.0) -->
            <div class="bill-summary">
                ${bill.ai_summary ? `
                    <div class="ai-summary-badge">🤖 AI Summary</div>
                    <p class="ai-summary-text">${escapeHtml(bill.ai_summary)}</p>
                ` : `
                    <p>${escapeHtml(bill.summary)}</p>
                `}
            </div>
            
            <!-- AI Impact Rating (V37.14.0) -->
            ${bill.ai_loading ? `
                <div class="bill-impact loading">
                    <span class="impact-label">Analyzing impact...</span>
                    <span class="loading-dots">⏳</span>
                </div>
            ` : bill.ai_impact_score ? `
                <div class="bill-impact">
                    <div class="impact-header">
                        <span class="impact-label">Impact on Society:</span>
                        <span class="impact-stars">${'⭐'.repeat(bill.ai_impact_score)}${'☆'.repeat(5 - bill.ai_impact_score)}</span>
                        <span class="impact-score">${bill.ai_impact_score}/5</span>
                    </div>
                    ${bill.ai_impact_reason ? `
                        <p class="impact-reason">${escapeHtml(bill.ai_impact_reason)}</p>
                    ` : ''}
                    ${bill.ai_affects ? `
                        <p class="impact-affects"><strong>Affects:</strong> ${escapeHtml(bill.ai_affects)}</p>
                    ` : ''}
                </div>
            ` : `
                <div class="bill-impact unavailable">
                    <span class="impact-label">Impact analysis:</span>
                    <span class="impact-message">Click "Ask AI" below for analysis</span>
                </div>
            `}
            
            <!-- Enhanced AI Analysis (V37.15.0) -->
            ${bill.ai_key_provisions && bill.ai_key_provisions.length > 0 ? `
                <div class="bill-analysis-section">
                    <h4 class="analysis-heading">📋 Key Provisions</h4>
                    <ul class="provisions-list">
                        ${bill.ai_key_provisions.map(provision => `
                            <li>${escapeHtml(provision)}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${bill.ai_economic_impact && bill.ai_economic_impact !== 'Analysis pending' ? `
                <div class="bill-analysis-section">
                    <h4 class="analysis-heading">💰 Economic Impact</h4>
                    <p class="economic-impact">${escapeHtml(bill.ai_economic_impact)}</p>
                </div>
            ` : ''}
            
            ${bill.ai_arguments_for && bill.ai_arguments_for.length > 0 ? `
                <div class="bill-analysis-section">
                    <h4 class="analysis-heading">✅ Arguments For</h4>
                    <ul class="arguments-list arguments-for">
                        ${bill.ai_arguments_for.map(arg => `
                            <li>${escapeHtml(arg)}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${bill.ai_arguments_against && bill.ai_arguments_against.length > 0 ? `
                <div class="bill-analysis-section">
                    <h4 class="analysis-heading">❌ Arguments Against</h4>
                    <ul class="arguments-list arguments-against">
                        ${bill.ai_arguments_against.map(arg => `
                            <li>${escapeHtml(arg)}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${bill.ai_similar_legislation ? `
                <div class="bill-analysis-section">
                    <h4 class="analysis-heading">📚 Similar Legislation</h4>
                    <p class="similar-legislation">${escapeHtml(bill.ai_similar_legislation)}</p>
                </div>
            ` : ''}
            
            ${bill.ai_next_steps ? `
                <div class="bill-analysis-section">
                    <h4 class="analysis-heading">🔜 Next Steps</h4>
                    <p class="next-steps">${escapeHtml(bill.ai_next_steps)}</p>
                </div>
            ` : ''}
            
            <!-- Read Full Bill Link (V37.14.0) -->
            ${bill.officialDocLink && bill.officialDocLink !== '#' ? `
                <div class="bill-actions">
                    <a href="${bill.officialDocLink}" target="_blank" rel="noopener noreferrer" class="bill-link">
                        📄 Read Full Bill Text
                    </a>
                </div>
            ` : ''}
            
            <!-- Bill Meta Info -->
            <div class="bill-info">
                <div class="bill-info-item">
                    <span class="info-label">Sponsor:</span>
                    <span class="info-value">${bill.sponsors && bill.sponsors[0] ? escapeHtml(bill.sponsors[0]) : 'Unknown'}</span>
                </div>
                <div class="bill-info-item">
                    <span class="info-label">Co-sponsors:</span>
                    <span class="info-value">${bill.cosponsors || 0}</span>
                </div>
                <div class="bill-info-item">
                    <span class="info-label">Introduced:</span>
                    <span class="info-value">${bill.introducedDate ? new Date(bill.introducedDate).toLocaleDateString() : 'Date unavailable'}</span>
                </div>
            </div>
            
            <!-- Inline AI Chat Toggle -->
            <button class="bill-ai-toggle" onclick="toggleInlineBillChat('${bill.id}')">
                <span class="ai-icon">💬</span>
                <span class="ai-text">${inlineChatOpen ? 'Hide' : 'Ask'} AI About This Bill</span>
                <span class="ai-arrow">${inlineChatOpen ? '▲' : '▼'}</span>
            </button>
            
            <!-- Inline AI Chat (Contextual Groq Integration) -->
            <div class="bill-inline-chat ${inlineChatOpen ? 'active' : ''}" id="inline-chat-${bill.id}">
                <div class="inline-chat-header">
                    <h4>AI Analysis: ${bill.billNumber}</h4>
                    <button class="inline-chat-close" onclick="toggleInlineBillChat('${bill.id}')">✕</button>
                </div>
                
                <div class="inline-chat-messages" id="inline-chat-messages-${bill.id}">
                    <div class="inline-chat-empty">
                        <p>💡 Ask me anything about this bill:</p>
                        <ul>
                            <li>What are the key provisions?</li>
                            <li>Who does this bill affect?</li>
                            <li>What are the arguments for and against?</li>
                            <li>How would this impact my community?</li>
                        </ul>
                    </div>
                </div>
                
                <div class="inline-chat-input-container">
                    <textarea 
                        class="inline-chat-input" 
                        id="inline-chat-input-${bill.id}"
                        placeholder="Ask about ${bill.billNumber}..."
                        rows="2"
                    ></textarea>
                    <button class="inline-chat-send" onclick="sendInlineBillChatMessage('${bill.id}')">✈️</button>
                </div>
            </div>
            
            <!-- Vote Buttons -->
            <div class="bill-vote-section">
                <p class="vote-prompt">${hasVoted ? 'You voted: ' + userVote.toUpperCase() : 'How do you feel about this bill?'}</p>
                <div class="vote-buttons">
                    <button class="vote-btn vote-yes ${userVote === 'yes' ? 'voted' : ''}" onclick="recordBillVote('${bill.id}', 'yes')">
                        <span class="vote-icon">👍</span>
                        <span class="vote-label">Support</span>
                    </button>
                    <button class="vote-btn vote-no ${userVote === 'no' ? 'voted' : ''}" onclick="recordBillVote('${bill.id}', 'no')">
                        <span class="vote-icon">👎</span>
                        <span class="vote-label">Oppose</span>
                    </button>
                    <button class="vote-btn vote-abstain ${userVote === 'abstain' ? 'voted' : ''}" onclick="recordBillVote('${bill.id}', 'abstain')">
                        <span class="vote-icon">🤷</span>
                        <span class="vote-label">Neutral</span>
                    </button>
                </div>
            </div>
            
            <!-- Representative Contact (Privacy-First) -->
            <div class="bill-representative">
                <h4>Contact Your Representative:</h4>
                ${bill.representatives.map(rep => `
                    <div class="rep-info">
                        <div class="rep-name">${escapeHtml(rep.name)}</div>
                        <div class="rep-position">${escapeHtml(rep.position)}</div>
                        <div class="rep-contact">
                            <a href="tel:${rep.phoneOffice}" class="rep-contact-item">
                                <span class="contact-icon">📞</span>
                                <span class="contact-label">Office:</span>
                                <span class="contact-value">${rep.phoneOffice}</span>
                            </a>
                            <a href="tel:${rep.phoneLocal}" class="rep-contact-item">
                                <span class="contact-icon">📞</span>
                                <span class="contact-label">Local:</span>
                                <span class="contact-value">${rep.phoneLocal}</span>
                            </a>
                            <a href="mailto:${rep.email}" class="rep-contact-item">
                                <span class="contact-icon">📧</span>
                                <span class="contact-label">Email:</span>
                                <span class="contact-value">${rep.email}</span>
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Action Buttons -->
            <div class="bill-actions">
                <a href="${bill.officialDocLink}" target="_blank" class="bill-action-btn bill-doc-btn">
                    <span class="btn-icon">📄</span>
                    <span class="btn-label">Official Document</span>
                </a>
                <button class="bill-action-btn bill-share-btn" onclick="shareBillNative('${bill.id}')">
                    <span class="btn-icon">📤</span>
                    <span class="btn-label">Share Bill</span>
                </button>
            </div>
        </div>
    `;
}

// ========== INLINE CHAT (CONTEXTUAL GROQ INTEGRATION) ==========

/**
 * Toggle Inline Bill Chat
 * V37.17.0: Opens/closes AI chat + triggers on-demand analysis
 */
function toggleInlineBillChat(billId) {
    billsState.openInlineChats[billId] = !billsState.openInlineChats[billId];
    
    // V37.17.0: If opening chat AND bill has no AI analysis yet, load it now
    if (billsState.openInlineChats[billId]) {
        const bill = billsState.bills.find(b => b.id === billId);
        if (bill && !bill.ai_impact_score && !bill.ai_loading) {
            console.log(`🤖 [AI Bills] User opened chat for ${billId} - loading AI analysis...`);
            loadBillAIAnalysis(bill).then(() => {
                renderBills(); // Re-render to show analysis
            });
        }
    }
    
    // Re-render just this bill card
    // For simplicity, we'll re-render all bills (optimize later)
    renderBills();
    
    // If opening, focus the input
    if (billsState.openInlineChats[billId]) {
        setTimeout(() => {
            const input = document.getElementById(`inline-chat-input-${billId}`);
            if (input) input.focus();
        }, 300);
    }
}

/**
 * Send Inline Bill Chat Message (Contextual AI)
 * Sends user question about specific bill to Groq with bill context
 * 
 * BACKEND ENDPOINT: /api/groq/bills/analyze
 * 
 * @param {string} billId - ID of the bill being discussed
 */
async function sendInlineBillChatMessage(billId) {
    const input = document.getElementById(`inline-chat-input-${billId}`);
    const messagesContainer = document.getElementById(`inline-chat-messages-${billId}`);
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Find the bill data
    const bill = billsState.bills.find(b => b.id === billId);
    if (!bill) return;
    
    // Clear empty state
    const emptyState = messagesContainer.querySelector('.inline-chat-empty');
    if (emptyState) emptyState.remove();
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = `
        <div class="message-content">
            <div class="message-bubble">${escapeHtml(message)}</div>
        </div>
    `;
    messagesContainer.appendChild(userMsg);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Call Groq API with bill context
    const response = await fetchGroqBillAnalysis(bill, message);
    
    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-message ai-message';
    aiMsg.innerHTML = `
        <div class="message-content">
            <div class="message-bubble">
                ${response}
            </div>
        </div>
    `;
    messagesContainer.appendChild(aiMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Fetch Groq Bill Analysis (Contextual AI)
 * V37.14.0: NOW CONNECTED - Sends bill context + user question to AI backend
 * 
 * ENDPOINT: /api/ai/bills/chat
 * 
 * @param {Object} bill - Full bill object with context
 * @param {string} userQuestion - User's question about the bill
 * @returns {Promise<string>} - AI analysis response (HTML formatted)
 */
async function fetchGroqBillAnalysis(bill, userQuestion) {
    try {
        if (!window.CONFIG || !window.CONFIG.isBackendConfigured()) {
            throw new Error('Backend not configured');
        }
        
        const apiUrl = `${window.CONFIG.API_BASE_URL}/api/ai/bills/chat`;
        
        console.log(`💬 [AI Bills Chat] Asking about ${bill.id}: "${userQuestion.substring(0, 50)}..."`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bill: {
                    id: bill.id,
                    billNumber: bill.billNumber,
                    title: bill.title,
                    summary: bill.summary,
                    category: bill.category,
                    level: bill.level,
                    sponsor: bill.sponsors[0]
                },
                question: userQuestion
            })
        });
        
        if (!response.ok) {
            throw new Error(`Chat API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.response) {
            throw new Error('Invalid AI response');
        }
        
        console.log(`✅ [AI Bills Chat] Response received for ${bill.id}`);
        
        // Convert plain text to HTML paragraphs
        const formattedResponse = data.response
            .split('\n\n')
            .map(para => `<p>${escapeHtml(para)}</p>`)
            .join('');
        
        return formattedResponse;
        
    } catch (error) {
        console.error('❌ [AI Bills Chat] Error:', error.message);
        
        // Graceful fallback
        return `<p>😊 I'm having trouble analyzing this bill right now. Please try again in a moment!</p>
                <p>In the meantime, you can <a href="${bill.officialDocLink}" target="_blank">read the full bill text</a> for details.</p>`;
    }
}

// ========== VOTING ==========

/**
 * Record Bill Vote
 * Saves user's vote (yes/no/abstain) and updates UI
 */
function recordBillVote(billId, vote) {
    // Save vote
    billsState.userVotes[billId] = vote;
    
    // Persist to localStorage
    localStorage.setItem('bills_user_votes', JSON.stringify(billsState.userVotes));
    
    // Update progress indicator
    updateProgressIndicator();
    
    // Re-render bills to show updated vote buttons
    renderBills();
    
    // Show confirmation
    showVoteConfirmation(vote);
}

/**
 * Show Vote Confirmation Toast
 */
function showVoteConfirmation(vote) {
    const voteMessages = {
        yes: '👍 Vote recorded: Support',
        no: '👎 Vote recorded: Oppose',
        abstain: '🤷 Vote recorded: Neutral'
    };
    
    // You can implement a toast notification here
    // For now, just log it
    console.log(voteMessages[vote]);
}

// ========== PROGRESS INDICATOR ==========

/**
 * Update Progress Indicator
 * Shows how many bills user has voted on and alignment with representatives
 */
function updateProgressIndicator() {
    const pendingCount = billsState.bills.length - Object.keys(billsState.userVotes).length;
    const votedCount = Object.keys(billsState.userVotes).length;
    const totalCount = billsState.bills.length;
    const progressPercent = totalCount > 0 ? Math.round((votedCount / totalCount) * 100) : 0;
    
    // Update numbers
    const pendingEl = document.getElementById('billsPendingCount');
    const votedEl = document.getElementById('billsVotedCount');
    const progressBar = document.getElementById('billsProgressFill');
    
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (votedEl) votedEl.textContent = votedCount;
    if (progressBar) progressBar.style.width = progressPercent + '%';
    
    // Calculate alignment (placeholder - would need rep voting data)
    const alignmentEl = document.getElementById('billsAlignmentScore');
    if (alignmentEl) {
        if (votedCount > 0) {
            alignmentEl.textContent = '--% '; // Placeholder until we have rep votes
        } else {
            alignmentEl.textContent = '--%';
        }
    }
}

// ========== WEB SHARE API (NATIVE MOBILE SHARING) ==========

/**
 * Share Bill via Native Share Sheet (Web Share API)
 * Privacy-first: No external trackers, just native OS sharing
 * 
 * @param {string} billId - ID of bill to share
 */
async function shareBillNative(billId) {
    const bill = billsState.bills.find(b => b.id === billId);
    if (!bill) return;
    
    const shareText = formatBillShareText(bill);
    
    // Check if Web Share API is available
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${bill.billNumber} - ${bill.title}`,
                text: shareText,
                url: window.location.href + '#bill-' + billId
            });
            console.log('Bill shared successfully!');
        } catch (err) {
            // User cancelled or share failed
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
                fallbackCopyToClipboard(shareText);
            }
        }
    } else {
        // Desktop fallback - copy to clipboard
        fallbackCopyToClipboard(shareText);
    }
}

/**
 * Format Bill Share Text
 * Creates formatted text with bill info and representative contact
 */
function formatBillShareText(bill) {
    const levelEmojis = {
        federal: '🏛️',
        state: '🏢',
        local: '🏘️'
    };
    
    let text = `📜 ${bill.billNumber}: ${bill.title}\n\n`;
    text += `${levelEmojis[bill.level]} ${bill.level.toUpperCase()} BILL\n\n`;
    text += `${bill.summary}\n\n`;
    text += `Impact: ${'⭐'.repeat(bill.impact)}\n\n`;
    text += `Contact Your Representative:\n`;
    
    bill.representatives.forEach(rep => {
        text += `${rep.name}\n`;
        text += `📞 Office: ${rep.phoneOffice}\n`;
        text += `📞 Local: ${rep.phoneLocal}\n`;
        text += `📧 ${rep.email}\n\n`;
    });
    
    text += `#CivicEngagement #VoteOnBills #WorkforceDemocracy`;
    
    return text;
}

/**
 * Fallback: Copy to Clipboard (Desktop)
 */
function fallbackCopyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Bill information copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('😊 Oops! We couldn\'t copy that. Please try again in a moment. 💙');
    });
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== GLOBAL EXPOSURE ==========

// Expose functions for onclick handlers in HTML
// NOTE: openPersonalizationModal is NOT exported here to avoid conflict
// It's properly exported from personalization.js (V36.3.2)
// window.openPersonalizationModal = openPersonalizationModal; // REMOVED - causes conflict!
window.filterBillsByCategory = filterBillsByCategory;
window.filterBillsByLevel = filterBillsByLevel;
window.toggleInlineBillChat = toggleInlineBillChat;
window.sendInlineBillChatMessage = sendInlineBillChatMessage;
window.recordBillVote = recordBillVote;
window.shareBillNative = shareBillNative;

// ========== POSTCODE EVENT LISTENER (V36.4.0) ==========

/**
 * V37.12.5: Listen for ZIP code saved from Representatives tab
 * When user enters ZIP in My Reps, automatically load bills
 */
window.addEventListener('wdp:zip-saved', function(event) {
    console.log('[Bills Section V37.12.5] 🔄 ZIP code saved event received:', event.detail.zip);
    
    // Update bills state
    billsState.personalized = true;
    billsState.userZipCode = event.detail.zip;
    
    // Update UI to hide "getting started" and show bills
    updateBillsUI();
    
    // Fetch bills for new location
    fetchBillsForLocation(event.detail.zip);
    
    console.log('[Bills Section V37.12.5] ✅ Bills section auto-loaded for ZIP:', event.detail.zip);
});

/**
 * V37.12.5: Also listen for legacy postcode-updated event (backward compatibility)
 * When user saves postcode in welcome modal, this refreshes the bills section
 */
document.addEventListener('wdp:postcode-updated', function(event) {
    console.log('[Bills Section] 🔄 Postcode updated event received:', event.detail.postcode);
    
    // Update bills state
    billsState.personalized = true;
    billsState.userZipCode = event.detail.postcode;
    
    // Update UI to hide "getting started" and show bills
    updateBillsUI();
    
    // Fetch bills for new location
    fetchBillsForLocation(event.detail.postcode);
    
    console.log('[Bills Section] ✅ Bills section refreshed with new postcode');
});

/**
 * Refresh bills section when personalization is enabled
 * Called by personalization.js after user saves postcode
 */
function refreshBillsSection() {
    console.log('[Bills Section] 🔄 Manual refresh requested');
    
    // Re-check localStorage
    const isPersonalizationEnabled = localStorage.getItem('wdp_personalization_enabled') === 'true';
    const locationData = localStorage.getItem('wdp_user_location');
    
    if (isPersonalizationEnabled && locationData) {
        try {
            const location = JSON.parse(locationData);
            if (location.postcode) {
                billsState.personalized = true;
                billsState.userZipCode = location.postcode;
                
                // Update UI
                updateBillsUI();
                
                // Fetch bills
                fetchBillsForLocation(location.postcode);
                
                console.log('[Bills Section] ✅ Refreshed with postcode:', location.postcode);
            }
        } catch (e) {
            console.error('[Bills Section] Failed to refresh:', e);
        }
    }
}

// Expose refresh function for manual calls
window.refreshBillsSection = refreshBillsSection;

// ========== AUTO-INITIALIZE ==========

// V37.12.8: Initialization guard to prevent race conditions during login
let billsSectionInitializing = false;
let billsSectionInitialized = false;

// V37.12.8: Safe initialization wrapper prevents concurrent init calls
function safeInitializeBillsSection() {
    if (billsSectionInitializing) {
        console.log('[Bills Section V37.12.8] ⏸️  Already initializing, skipping duplicate call...');
        return;
    }
    
    if (billsSectionInitialized) {
        console.log('[Bills Section V37.12.8] ♻️  Re-initializing (user logged in)...');
    }
    
    billsSectionInitializing = true;
    console.log('[Bills Section V37.12.8] 🔒 Initialization started (locked)');
    
    try {
        initializeBillsSection();
        billsSectionInitialized = true;
        console.log('[Bills Section V37.12.8] ✅ Initialization complete (unlocked)');
    } finally {
        billsSectionInitializing = false;
    }
}

// V37.12.8: CRITICAL - Event listener attached FIRST (at script load time)
// This ensures we catch personalization:ready even during first login
console.log('[Bills Section V37.12.8] 🎯 Attaching personalization:ready listener...');
window.addEventListener('personalization:ready', (e) => {
    console.log('[Bills Section V37.12.8] 📢 PERSONALIZATION:READY event received!');
    console.log('[Bills Section V37.12.8] Event detail:', e.detail);
    console.log('[Bills Section V37.12.8] 🔄 Re-initializing to detect logged-in user and auto-load bills...');
    
    // Small delay to ensure localStorage is fully updated
    setTimeout(() => {
        safeInitializeBillsSection(); // Use safe wrapper to prevent conflicts
    }, 100);
});
console.log('[Bills Section V37.12.8] ✅ Event listener ready - will catch login event!');

// V37.16.0: CRITICAL FIX - Only initialize bills when Bills tab is active
let billsTabInitialized = false;

// V37.16.0: Listen for tab switches to Bills tab
window.addEventListener('wdp:tab-switched', (e) => {
    if (e.detail && e.detail.tab === 'bills') {
        console.log('[Bills Section V37.16.0] 📜 Bills tab activated - Initializing if needed...');
        if (!billsTabInitialized) {
            waitForPersonalizationSystem();
            billsTabInitialized = true;
        }
    }
});

// V37.12.8: Wait for PersonalizationSystem to be ready before initializing
function waitForPersonalizationSystem() {
    if (window.PersonalizationSystem) {
        console.log('[Bills Section V37.12.8] ✅ PersonalizationSystem found, initializing bills section...');
        safeInitializeBillsSection(); // Use safe wrapper
    } else {
        console.log('[Bills Section V37.12.8] ⏳ Waiting for PersonalizationSystem... (checking every 100ms)');
        setTimeout(waitForPersonalizationSystem, 100); // Check every 100ms
    }
}

// V37.12.6: Listen for personalization:ready event (user logs in)
// This is the key event that fires when user successfully logs in!
window.addEventListener('personalization:ready', (e) => {
    console.log('[Bills Section V37.12.6] 📢 PERSONALIZATION:READY event received!');
    console.log('[Bills Section V37.12.6] Event detail:', e.detail);
    
    // V37.16.0: Only initialize if bills tab is already active
    const billsPanel = document.getElementById('bills-panel');
    if (billsPanel && billsPanel.classList.contains('active')) {
        console.log('[Bills Section V37.16.0] Bills tab is active, initializing...');
        setTimeout(() => {
            initializeBillsSection(); // Re-init when user logs in
        }, 100);
    } else {
        console.log('[Bills Section V37.16.0] Bills tab not active, skipping initialization (will init on tab switch)');
    }
});

// V37.16.0: DO NOT initialize on page load - wait for tab switch
console.log('[Bills Section V37.16.0] Ready - waiting for Bills tab activation...');
