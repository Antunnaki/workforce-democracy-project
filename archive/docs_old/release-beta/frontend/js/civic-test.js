/**
 * CIVIC TRANSPARENCY MODULE - MINIMAL TEST VERSION
 * Testing if syntax errors are in the demo data comments or the actual code
 */

console.log('🔍 [V36.9.15 TEST] civic-test.js loading...');

// Sample data - empty structures
let SAMPLE_COURT_DECISIONS = {};
let STATE_SUPREME_COURT_DECISIONS = {};
let SAMPLE_STATE_GOVERNMENT = {};
let SAMPLE_LOCAL_GOVERNMENT = {};
let SAMPLE_BILLS = [];

console.log('✅ [V36.9.15 TEST] Data structures initialized');

/**
 * Switch between civic tabs
 * @param {string} tabName - Name of the tab to switch to
 */
function switchCivicTab(tabName) {
    console.log('🔍 [TEST] switchCivicTab called with:', tabName);
    
    // Update tab buttons
    const tabs = document.querySelectorAll('.civic-tab');
    tabs.forEach(tab => {
        const tabDataName = tab.getAttribute('data-tab');
        if (tabDataName === tabName) {
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
        } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        }
    });
    
    // Update panels
    const panels = document.querySelectorAll('.civic-panel');
    panels.forEach(panel => {
        const panelId = panel.getAttribute('id');
        if (panelId === `${tabName}-panel`) {
            panel.classList.add('active');
            panel.style.display = 'block';
            console.log('✅ [TEST] Activated panel:', panelId);
        } else {
            panel.classList.remove('active');
            panel.style.display = 'none';
        }
    });
    
    // V37.12.4: Re-initialize Bills section when switching to bills tab
    // This ensures bills detect if user just entered ZIP in Representatives tab
    if (tabName === 'bills' && typeof initializeBillsSection === 'function') {
        console.log('🔄 [V37.12.4] Switching to Bills tab - re-initializing to check for updates...');
        setTimeout(() => {
            initializeBillsSection();
        }, 100); // Small delay to let panel display first
    }
}

// Make function globally available
window.switchCivicTab = switchCivicTab;
console.log('✅ [V36.9.15 TEST] civic-test.js loaded - switchCivicTab is globally available');
