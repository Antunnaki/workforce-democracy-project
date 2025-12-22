/**
 * LOCALSTORAGE PROTECTION FIX
 * 
 * This code adds extra protection to prevent accidental clearing of wdp_* localStorage keys.
 * Can be added to index.html or personalization-system.js as a safeguard.
 * 
 * Created: 2025-01-18
 * Issue: localStorage being cleared on page refresh
 */

(function() {
  'use strict';
  
  console.log('🔒 Activating localStorage protection...');
  
  // Protected key prefixes
  const PROTECTED_PREFIXES = ['wdp_'];
  
  // Check if a key should be protected
  function isProtectedKey(key) {
    return PROTECTED_PREFIXES.some(prefix => key.startsWith(prefix));
  }
  
  // Store original methods
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;
  
  // Override removeItem to prevent removing protected keys
  localStorage.removeItem = function(key) {
    if (isProtectedKey(key)) {
      console.warn(`🛡️ Protected key "${key}" - removal blocked. Use PersonalizationSystem.logout() instead.`);
      console.trace();
      return;
    }
    return originalRemoveItem.apply(this, arguments);
  };
  
  // Override clear to preserve protected keys
  localStorage.clear = function() {
    console.warn('🛡️ localStorage.clear() called - preserving wdp_* keys');
    console.trace();
    
    // Save protected keys
    const protectedKeys = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (isProtectedKey(key)) {
        protectedKeys[key] = localStorage.getItem(key);
      }
    }
    
    // Clear everything
    originalClear.apply(this);
    
    // Restore protected keys
    Object.entries(protectedKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    console.log('✅ Protected keys restored:', Object.keys(protectedKeys));
  };
  
  // Add diagnostic logging
  if (window.location.hostname.includes('gensparkspace')) {
    console.log('🔍 GenSparkSpace detected - extra diagnostics enabled');
    
    // Log all localStorage operations
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (isProtectedKey(key)) {
        console.log(`📝 localStorage.setItem("${key}", ${value.length} chars)`);
      }
      return originalSetItem.apply(this, arguments);
    };
  }
  
  console.log('✅ localStorage protection active');
  console.log('   Protected prefixes:', PROTECTED_PREFIXES);
  console.log('   - removeItem() blocked for wdp_* keys');
  console.log('   - clear() preserves wdp_* keys');
  
})();

/**
 * USAGE:
 * 
 * 1. Add to index.html before personalization-system.js:
 *    <script src="js/localstorage-protection.js"></script>
 * 
 * 2. Or add inline in index.html <script> section
 * 
 * 3. To properly clear user data, use:
 *    PersonalizationSystem.logout()
 *    (This is the only safe way to clear wdp_* keys)
 */

/**
 * TESTING:
 * 
 * After adding this code, try:
 * 
 * 1. localStorage.removeItem('wdp_username');
 *    → Should be blocked with warning
 * 
 * 2. localStorage.clear();
 *    → Should preserve wdp_* keys
 * 
 * 3. PersonalizationSystem.logout();
 *    → Should properly clear all data
 */
