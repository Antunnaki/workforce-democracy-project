/**
 * WDP Keyboard Enhancements v36.9.13
 * Optional polish enhancements for keyboard navigation
 * 
 * Features:
 * - Modal keyboard trapping (Escape key + focus trap) ✅ ACTIVE
 * - Focus return after modal close ✅ ACTIVE
 * - Arrow key navigation for tab interfaces ⚠️ DISABLED (bugfix)
 * 
 * BUGFIX V36.9.13: Arrow key navigation temporarily disabled
 * to fix civic tab clicking issue on Netlify deployment.
 * Normal tab navigation (Tab key, Enter, Space, clicks) works perfectly.
 */

class KeyboardEnhancements {
    constructor() {
        this.version = '36.9.13';
        this.modalTriggerElement = null;
        this.activeModal = null;
        this.originalFocusElement = null;
        
        this.init();
    }
    
    /**
     * Initialize all keyboard enhancements
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachEnhancements());
        } else {
            this.attachEnhancements();
        }
    }
    
    /**
     * Attach all keyboard enhancements
     */
    attachEnhancements() {
        this.setupModalKeyboardTrapping();
        this.setupArrowKeyTabNavigation();
        console.log(`✅ [Keyboard Enhancements v${this.version}] All enhancements active`);
    }
    
    /**
     * ENHANCEMENT #1: Modal Keyboard Trapping
     * - Escape key closes modal
     * - Tab/Shift+Tab cycles focus within modal (focus trap)
     * - Focus returns to trigger element when closed
     */
    setupModalKeyboardTrapping() {
        // V37.9.1: Welcome Modal removed - skip keyboard trap setup
        // (Modal HTML, CSS, and JavaScript completely removed)
        
        // Job Comparison Modal
        this.setupModalTrap('jobComparisonModal', closeComparisonModal);
        
        console.log('✅ [Keyboard Enhancements] Modal keyboard trapping enabled');
    }
    
    /**
     * Setup keyboard trapping for a specific modal
     */
    setupModalTrap(modalId, closeFunction) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Escape key listener
        document.addEventListener('keydown', (e) => {
            // Only trap if this modal is active
            if (!modal.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                e.preventDefault();
                console.log(`[Keyboard Enhancements] Escape pressed - closing ${modalId}`);
                closeFunction();
                
                // Return focus to original element
                if (this.originalFocusElement) {
                    this.originalFocusElement.focus();
                    this.originalFocusElement = null;
                }
            }
        });
        
        // Focus trap listener
        modal.addEventListener('keydown', (e) => {
            // Only trap if this modal is active
            if (!modal.classList.contains('active')) return;
            
            if (e.key === 'Tab') {
                const focusableElements = this.getFocusableElements(modal);
                
                if (focusableElements.length === 0) return;
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                // Shift+Tab (backward)
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                        console.log('[Keyboard Enhancements] Focus trap: Wrapped to last element');
                    }
                } 
                // Tab (forward)
                else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                        console.log('[Keyboard Enhancements] Focus trap: Wrapped to first element');
                    }
                }
            }
        });
        
        // Observe when modal opens to set initial focus
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (modal.classList.contains('active')) {
                        // Modal just opened
                        this.originalFocusElement = document.activeElement;
                        
                        // Focus first focusable element
                        setTimeout(() => {
                            const focusableElements = this.getFocusableElements(modal);
                            if (focusableElements.length > 0) {
                                focusableElements[0].focus();
                                console.log(`[Keyboard Enhancements] ${modalId} opened - focused first element`);
                            }
                        }, 100); // Small delay to ensure modal is fully rendered
                    } else {
                        // Modal just closed - return focus
                        if (this.originalFocusElement) {
                            setTimeout(() => {
                                this.originalFocusElement.focus();
                                console.log('[Keyboard Enhancements] Focus returned to trigger element');
                                this.originalFocusElement = null;
                            }, 100);
                        }
                    }
                }
            });
        });
        
        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    /**
     * Get all focusable elements within a container
     */
    getFocusableElements(container) {
        const selector = 'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(container.querySelectorAll(selector))
            .filter(element => {
                // Filter out hidden elements
                return element.offsetParent !== null;
            });
    }
    
    /**
     * ENHANCEMENT #2: Arrow Key Navigation for Tabs
     * - Left/Right arrow keys navigate between tabs
     * - Auto-activates the tab when navigating
     * - Maintains existing Tab key behavior
     * 
     * BUGFIX V36.9.13: DISABLED temporarily to fix civic tab clicking bug
     * Arrow key navigation was interfering with normal tab click functionality
     * Will re-enable after thorough testing
     */
    setupArrowKeyTabNavigation() {
        console.log('⚠️ [Keyboard Enhancements] Arrow key navigation DISABLED (bugfix V36.9.13)');
        console.log('⚠️ [Keyboard Enhancements] Civic tabs will work normally with click/Enter/Space');
        console.log('⚠️ [Keyboard Enhancements] Arrow keys will be re-enabled after testing');
        
        // DISABLED: Arrow key navigation temporarily removed to fix civic tab bug
        // Normal tab navigation (Tab key, Enter, Space, clicks) still works perfectly
        
        return; // Skip arrow key setup for now
        
        /* ORIGINAL CODE (disabled):
        const tabButtons = document.querySelectorAll('[role="tab"]');
        if (tabButtons.length === 0) return;
        // ... rest of arrow key navigation code
        */
    }
    
    /**
     * ENHANCEMENT #3: Focus Return After Modal Close
     * This is automatically handled by the MutationObserver in setupModalTrap()
     */
}

// Initialize keyboard enhancements globally
const wdpKeyboardEnhancements = new KeyboardEnhancements();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardEnhancements;
}

console.log('✅ [WDP Keyboard Enhancements v36.9.13] Loaded successfully - Modal trapping active, arrow keys disabled (bugfix)');
