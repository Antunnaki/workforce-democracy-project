/**
 * CIVIC DATA LOADER
 * Ready for backend integration - no demo data needed!
 * When backend goes live, this will fetch real data from government APIs
 */

(function() {
  'use strict';
  
  // Cache for loaded data
  let civicDataCache = null;
  let isLoading = false;
  let loadPromise = null;
  
  /**
   * Load civic data - currently returns empty structure
   * BACKEND TODO: Replace with API call to your Llama 3 backend
   * Example: fetch('/api/civic/data') or fetch to Together AI endpoint
   * @returns {Promise<Object>} The civic data
   */
  async function loadCivicData() {
    // Return cached data if already loaded
    if (civicDataCache) {
      return civicDataCache;
    }
    
    // If already loading, return existing promise
    if (isLoading) {
      return loadPromise;
    }
    
    // Start loading
    isLoading = true;
    
    // BACKEND TODO: Replace this with real API call
    // Example:
    // loadPromise = fetch('/api/civic/data')
    //   .then(response => response.json())
    //   .then(data => { ... });
    
    // For now: Return empty data structure immediately
    loadPromise = Promise.resolve({
      SAMPLE_COURT_DECISIONS: {},
      STATE_SUPREME_COURT_DECISIONS: {},
      SAMPLE_STATE_GOVERNMENT: {},
      SAMPLE_LOCAL_GOVERNMENT: {},
      SAMPLE_BILLS: []
    })
    .then(data => {
      civicDataCache = data;
      isLoading = false;
      console.log('ℹ️ Civic data loader ready. Connect backend to load real government data.');
      return data;
    });
    
    return loadPromise;
  }
  
  /**
   * Initialize civic data when user interacts with civic section
   * Attaches to civic section click/focus events
   */
  function initCivicDataLoader() {
    // Find civic section elements
    const civicSection = document.getElementById('civic-section');
    const civicButtons = document.querySelectorAll('[data-civic-trigger]');
    
    // Load data when civic section becomes visible or is interacted with
    const loadHandler = async () => {
      const data = await loadCivicData();
      
      // Make data globally available for civic.js functions
      window.SAMPLE_COURT_DECISIONS = data.SAMPLE_COURT_DECISIONS;
      window.STATE_SUPREME_COURT_DECISIONS = data.STATE_SUPREME_COURT_DECISIONS;
      window.SAMPLE_STATE_GOVERNMENT = data.SAMPLE_STATE_GOVERNMENT;
      window.SAMPLE_LOCAL_GOVERNMENT = data.SAMPLE_LOCAL_GOVERNMENT;
      window.SAMPLE_BILLS = data.SAMPLE_BILLS;
      
      // Trigger custom event so civic.js knows data is ready
      window.dispatchEvent(new CustomEvent('civicDataLoaded', { detail: data }));
    };
    
    // Attach to civic section if it exists
    if (civicSection) {
      // Load on first interaction
      civicSection.addEventListener('click', loadHandler, { once: true, passive: true });
      
      // Also load when scrolled into view (preload for better UX)
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadHandler();
            observer.disconnect(); // Only load once
          }
        });
      }, { rootMargin: '100px' }); // Start loading 100px before visible
      
      observer.observe(civicSection);
    }
    
    // Attach to any civic trigger buttons
    civicButtons.forEach(button => {
      button.addEventListener('click', loadHandler, { once: true, passive: true });
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCivicDataLoader);
  } else {
    initCivicDataLoader();
  }
  
  // Export loader function
  window.loadCivicData = loadCivicData;
  
})();
