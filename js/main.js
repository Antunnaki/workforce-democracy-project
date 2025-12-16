/**
* WORKFORCE DEMOCRACY PROJECT - MAIN APPLICATION
 * Core functionality and initialization
 */

// Application state
const AppState = {
    currentLanguage: 'en',
    personalizationEnabled: false,
    userLocation: null,
    preferences: {},
    isLoading: false
};

// Language selector state (must be declared beforesetupEventListeners)
let languageMenuJustOpened = false;
let toggleCount = 0;
let languageSelectorsInitialized = false;

/**
 * Initialize application
 *Sets up all core functionality
 */
function initializeApp() {
    console.log('🚀 Initializing Workforce Democracy Project...');
    
    // Initialize core components
  try {
        // V35.7.6: Removed initializeUnifiedOnboarding() - using custom welcome modal instead
        // The custom modal is initialized inline inindex.html (checkWelcomeModalStatus function)
        
        // Initialize philosophies section
        if (typeof initializePhilosophies === 'function') {
          try {
                initializePhilosophies();
            } catch (error) {
                console.error('⚠️ Error initializing philosophies:', error);
            }
        }
        
       // Initialize job categories
        if (typeof initializeJobCategories === 'function') {
            try {
                initializeJobCategories();
            } catch (error){
console.error('⚠️ Error initializing job categories:', error);
            }
        }
        
        // Initialize learning resources
        if (typeof initializeLearningResources === 'function') {
            try {
                initializeLearningResources();
            } catch (error) {
                console.error('⚠️ Error initializing learning resources:', error);
}
}
        
        // V36.4.0: ALWAYS initialize personalization features
        try {
            if (typeof initializePersonalizationStatus === 'function') {
                initializePersonalizationStatus();
            }
            
            if (typeof initializePersonalizationFeatures === 'function') {
                initializePersonalizationFeatures();
}
       } catch (error) {
            console.error('⚠️ Error initializing personalization features:', error);
        }
        
        // Initialize language selectors
        try{
            initializeLanguageSelectors();
        } catch (error) {
            console.error('⚠️ Error initializing language selectors:', error);
        }
        
        //Initialize dynamic spacingfor civic section
        try {
            initializeDynamicCivicSpacing();
        } catch (error) {
            console.error('⚠️ Error initializing dynamic spacing:', error);
        }
        
        // Initialize civic platform
        try {
            if (typeof window.CivicPlatform !== 'undefined' && typeof window.CivicPlatform.init=== 'function') {
                console.log('Initializing Civic Platform...');
                window.CivicPlatform.init();
            } else {
                console.warn('Civic Platformnot found or not initialized');
            }
        } catch (error) {
            console.error('⚠️ Error initializing civic platform:', error);
        }
        
console.log('✅ Application initialized successfully');
    } catch (error) {
        console.error('❌ Critical error during initialization:', error);
    }
}

/**
* Loaduser preferences from secure storage
 */
async function loadUserPreferences() {
  try {
    // Load from localStorage (simple storage, no encryption needed for public settings)
    const prefsString = localStorage.getItem('user_preferences');
    if (prefsString) {
      const prefs = JSON.parse(prefsString);
      AppState.preferences = prefs;
      AppState.currentLanguage = prefs.language || 'en';
      AppState.personalizationEnabled = prefs.personalizationEnabled || false;
      // Apply language
      if (AppState.currentLanguage !== 'en') {
        await changeLanguage(AppState.currentLanguage);
      }
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

/**
 * Save user preferences
 */
async function saveUserPreferences() {
   try {
        // Saveto localStorage
        localStorage.setItem('user_preferences', JSON.stringify(AppState.preferences));
    } catch (error) {
        console.error('Error saving preferences:', error);
   }
}

/**
 * Check personalization status (DEPRECATED - Now using unified system in personalization.js)
 * Kept for backwardcompatibility
 */
function checkPersonalizationStatus() {
    // Migrate old personalization data to new unified system
    const oldChoice = localStorage.getItem('personalizationChoice');
    const newChoice = localStorage.getItem('wdp_personalization_choice');
    
    if (oldChoice && !newChoice) {
        // Migrate old data to new system
        if (oldChoice === 'enabled') {
            localStorage.setItem('wdp_personalization_choice', 'enabled');
            localStorage.setItem('wdp_personalization_enabled', 'true');
        } else if (oldChoice === 'skipped') {
            localStorage.setItem('wdp_personalization_choice', 'skipped');
            localStorage.setItem('wdp_personalization_enabled', 'false');
        }
    }
}

/**
 * Enable personalization (DEPRECATED - Now using acceptUnifiedPersonalization() inpersonalization.js)
 * Kept for backward compatibility
 */
// V36.3.3: DELETED deprecated enablePersonalization() and skipPersonalization()
// These are now handled by personalization.js and the welcome modal system

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    //Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Escape key closes modals and menus
       if (e.key ==='Escape') {
            closeModal();
            closeMobileMenu();
            const langMenu = document.getElementById('languageMenu');
            if (langMenu) langMenu.classList.remove('active');
            const desktopLangMenu = document.getElementById('languageMenuDesktop');
            if (desktopLangMenu) desktopLangMenu.classList.remove('active');
       }
});
    
    // CLICK-OUTSIDE HANDLER REMOVED
    // Menu will close when:
    // 1. User selects a language (handledin language.js)
    // 2. User presses Escape (handled below)
    // 3. User clicks button again totoggle (handled in buttonlistener)
    
    console.log('✅ Click-outside handler disabled - menu closes via button toggle or language selection only');
    
    // Handle smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href =this.getAttribute('href');
            let target = document.querySelector(href);
            
            // Special handling for #local - scroll to the visible content
            if (href ==='#local') {
                const optIn = document.getElementById('personalizationOptIn');
                const localInterface = document.getElementById('localResourcesInterface');
                
                // Ifpersonalization is enabled, scroll to interface instead of section
                if (localInterface && localInterface.style.display !== 'none') {
                    target = localInterface;
                } else if (optIn && optIn.style.display !== 'none') {
                    target = optIn;
                }
            }
            
           if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Remove focus from link after clicking to prevent staying highlighted
               this.blur();
            }
        });
    });
    
    // Enhance sticky header with scroll effect
    let lastScrollTop =0;
    const header = document.querySelector('.site-header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (header) {
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
               header.classList.remove('scrolled');
           }
}
        
        lastScrollTop = scrollTop;
    }, { passive: true });
}

/**
 * Mobile menu functions
 */
function toggleMobileMenu() {
const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) {
        const isOpening = !mobileNav.classList.contains('active');
        mobileNav.classList.toggle('active');
        
        // If opening menu, add click-outside listener after a short delay
        // to prevent the toggle click from immediatelyclosing it
        if (isOpening) {
            setTimeout(() => {
                document.addEventListener('click', handleClickOutsideMobileMenu);
            }, 100);
       }else {
            document.removeEventListener('click', handleClickOutsideMobileMenu);
        }
    }
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) {
        mobileNav.classList.remove('active');
        document.removeEventListener('click', handleClickOutsideMobileMenu);
    }
}

function handleClickOutsideMobileMenu(event) {
    const mobileNav = document.getElementById('mobileNav');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
// Check if click is outside both menu and toggle button
    if (mobileNav && 
        !mobileNav.contains(event.target) && 
        !menuToggle.contains(event.target)) {
        closeMobileMenu();
    }
}

/**
 * Language selector functions
 * NOTE: Dropdown functions below are DEPRECATED - nowusing modal approach
 */

/**
 * @deprecated - Replaced by openLanguageModal() 
 * Old dropdown toggle function - keptfor reference only
 */
function toggleLanguageMenu() {
toggleCount++;
    console.log('🔵 toggleLanguageMenu called - COUNT:', toggleCount);
    console.log('🔵 Call stack:', new Error().stack);
    console.log('🔵 Timestamp:', Date.now());
    
    const menu = document.getElementById('languageMenu');
   const button = document.getElementById('languageBtnMobile');
    
if (menu) {
        const wasActive = menu.classList.contains('active');
        console.log('🔵 Menu was active:', wasActive);
// If opening, position menu below button
        if (!wasActive && button) {
            const rect = button.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = (rect.bottom + 4) + 'px';
            menu.style.left = rect.left + 'px';
            menu.style.right = 'auto';
            console.log('🔵 Menu positioned at left:', rect.left, 'top:', rect.bottom + 4);
            
            // Set flag to prevent immediate closing by click-outside handlerlanguageMenuJustOpened = true;
            console.log('🔵 Flag set: languageMenuJustOpened = true');
setTimeout(() => {
                languageMenuJustOpened = false;
                console.log('🔵 Flag cleared: languageMenuJustOpened= false');
            }, 100);
        }
        
       menu.classList.toggle('active');
        const isNowActive = menu.classList.contains('active');
        console.log('🔵 Menu toggledto:', isNowActive ? 'ACTIVE' : 'INACTIVE');
        
        // INTERCEPT ANY ATTEMPTS TO REMOVE'active' CLASS
        if (isNowActive) {
           const originalRemove= menu.classList.remove;
            menu.classList.remove = function(className) {
                if (className === 'active') {
console.error('🚨🚨🚨 SOMETHING IS TRYING TO REMOVE ACTIVE CLASS! 🚨🚨🚨');
                   console.error('🚨 Call stack:', new Error().stack);
                }
               return originalRemove.apply(this, arguments);
            };
        }
        
        // Check after a brief moment if it's still activesetTimeout(() => {
            const stillActive = menu.classList.contains('active');
            console.log('🔵 After 50ms, menu is:', stillActive ? 'STILL ACTIVE' :'NO LONGERACTIVE');
            if (!stillActive && isNowActive) {
                console.error('⚠️⚠️⚠️ MENU WAS CLOSED BY SOMETHING! ⚠️⚠️⚠️');
            }
        }, 50);
    } else {
        console.error('Language menu element not found');
    }
}

/**
 * @deprecated - Replaced by openLanguageModal()
 * Old desktop dropdown toggle function - kept forreference only
 */
function toggleLanguageMenuDesktop() {
    console.log('toggleLanguageMenuDesktop called - DEPRECATED, usemodal instead');
    const menu = document.getElementById('languageMenuDesktop');
   if (menu){
        const wasActive = menu.classList.contains('active');
        menu.classList.toggle('active');
        console.log('Desktop language menu toggled:', wasActive ? 'closing' : 'opening');
    } else {
        console.error('Desktop language menu element not found');
    }
}

/**
 * Initialize languageselector event listeners*/
function initializeLanguageSelectors() {
    // Prevent double initialization
    if (languageSelectorsInitialized) {
console.log('⚠️ Language selectors already initialized - skipping');
        console.log('⚠️ Called from:', new Error().stack);
        return;
    }
    
    console.log('📝 Initializing language selectors(modal version)...');
    console.log('📝 Called from:', new Error().stack);
    languageSelectorsInitialized = true;
    
    // Ensure modal is closed on initialization
    const languageModal = document.getElementById('languageModal');
    const languageModalOverlay = document.getElementById('languageModalOverlay');
    if (languageModal){
        languageModal.classList.remove('active');
        console.log('🔧 Language modal explicitly closed');
    }
    if (languageModalOverlay) {
        languageModalOverlay.classList.remove('active');
        console.log('🔧 Language modal overlay explicitly closed');
}
    
    // Mobile language button - opens modal instead of dropdown
    constmobileLangBtn =document.getElementById('languageBtnMobile');
    if (mobileLangBtn) {
        let lastClickTime= 0;
        mobileLangBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            // Prevent double-click/double-tap (within 300ms)
            constnow = Date.now();
            if (now - lastClickTime < 300) {
console.log('🔵 Ignoring duplicate click (within 300ms)');
                return;
            }
            lastClickTime = now;
            
            console.log('🔵 Mobile language button clicked - opening modal');
            openLanguageModal();
        });
        console.log('✅ Mobile language button listener attached (modal version)');
   } else {
        console.error('❌ Mobile language button not found');
    }
    
    // Desktop language button - alsoopens modal for consistency
    const desktopLangBtn = document.getElementById('languageBtnDesktop');
if (desktopLangBtn) {
        desktopLangBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Desktop language button clicked - opening modal');
            openLanguageModal();
        });
        console.log('✅ Desktoplanguage button listener attached (modal version)');
    } else {
        console.error('❌ Desktop language buttonnot found');
    }
    
    // Note: Old dropdown menu button listeners removed - nowusing modal
    // Language options in modal use onclick="selectLanguageFromModal(lang)" in HTML
    
    console.log('✅ Languageselectors initialized (modal version)');
}

/**
 * Modal functions
 */
functionopenModal(content) {
const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    
    if (overlay && container) {
        container.innerHTML = content;
        overlay.classList.add('active');
        container.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
}
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
   const container = document.getElementById('modalContainer');
    
    if (overlay && container) {
        overlay.classList.remove('active');
        container.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
   }
}

/**
 * Language Modal Functions
 */
function openLanguageModal() {
    console.log('🌍 Opening language modal...');
    const overlay = document.getElementById('languageModalOverlay');
    const modal = document.getElementById('languageModal');
    
if (overlay && modal) {
        overlay.classList.add('active');
modal.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
console.log('✅ Language modal opened');
    } else {
        console.error('❌ Language modal elements not found');
    }
}

function closeLanguageModal() {
    console.log('🌍 Closing language modal...');
   const overlay = document.getElementById('languageModalOverlay');
    const modal = document.getElementById('languageModal');
    
    if(overlay && modal) {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        
        // Restore body scrolldocument.body.style.overflow = '';
        console.log('✅ Language modal closed');
    }
}

function selectLanguageFromModal(langCode) {
    console.log('🌍 Language selected from modal:',langCode);
    
    // Close the modal
    closeLanguageModal();
    
    // Change the language using the existing function fromlanguage.js
    if (window.changeLanguage) {
        window.changeLanguage(langCode);
    } else {
console.error('❌ changeLanguage function not available');
    }
}

// Make functionsglobally accessible
window.openLanguageModal = openLanguageModal;
window.closeLanguageModal = closeLanguageModal;
window.selectLanguageFromModal= selectLanguageFromModal;

// Add keyboard support (Escape to closemodal)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal= document.getElementById('languageModal');
        if (modal && modal.classList.contains('active')) {
            console.log('🌍 Escape pressed- closing language modal');
            closeLanguageModal();
        }
    }
});

/**
 * Loading indicator functions*/
function showLoading() {
    const indicator = document.getElementById('loadingIndicator');
    if(indicator) {
        indicator.classList.add('active');
        AppState.isLoading = true;
    }
}

function hideLoading() {
   const indicator = document.getElementById('loadingIndicator');
    if (indicator){
        indicator.classList.remove('active');
        AppState.isLoading = false;
    }
}

/**
 * Notification system
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
top: 20px;
right: 20px;
        background: ${type === 'success'? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--info)'};
       color: white;
        padding: var(--space-md) var(--space-xl);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        z-index:10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--space-md);">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(()=> {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Add animation styles
const style= document.createElement('style');
style.textContent = `
    @keyframesslideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to{
            transform: translateX(0);
            opacity: 1;
       }
    }
    
    @keyframesslideOut {
        from {
            transform: translateX(0);
           opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
}
   }
`;
document.head.appendChild(style);

/**
 * Privacy & Security Functions
*/
function showPrivacyPolicy() {
   const content = `
        <div style="max-width: 800px;">
            <h2>Privacy Policy</h2>
            <div style="text-align: right; margin-bottom: 20px;">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
</div>
            
            <h3>Our Commitment to Privacy</h3>
            <p>The Workforce Democracy Project is committed to complete privacy and transparency. This policy explains our approach:</p>
<h4>Zero Data Collection</h4>
            <ul>
<li>We collect ZERO personal data</li>
                <li>We use ZERO trackers or analytics</li>
<li>We share ZERO information with third parties</li>
                <li>We store ZERO data on our servers</li>
            </ul>
            
            <h4>Client-Side Only Storage</h4>
            <p>All personalization data is storedexclusively on YOUR device using military-grade encryption (AES-256-GCM). This includes:</p>
            <ul>
                <li>Your location preferences</li>
               <li>Saved resources and bookmarks</li>
                <li>Learning progress</li>
<li>Language preferences</li>
            </ul>
            
            <h4>Your Rights</h4>
            <ul>
                <li><strong>Right to Delete:</strong> Delete all your data instantly withone click</li>
                <li><strong>Right to Export:</strong> Download allyour data in JSON format</li>
                <li><strong>Right to Opt-Out:</strong>All personalization features are optional</li>
            </ul>
            
            <h4>Security Measures</h4>
<ul>
                <li>AES-256-GCM encryption with PBKDF2 keyderivation</li>
                <li>600,000 iterations for key strengthening</li>
                <li>Anti-fingerprinting protection</li>
                <li>Secure data deletion (DOD 5220.22-M standard)</li>
            </ul>
            
            <h4>Questions?</h4>
            <p>Ifyou have any questions about our privacy practices,please contact us.</p>
            
            <p style="margin-top: 30px; padding-top:20px; border-top: 1px solid var(--border); color: var(--text-secondary);font-size: 0.875rem;">
Last updated: January 2025
            </p>
        </div>
    `;
    openModal(content);
}

function showSecurityInfo() {
    const content = `
        <div style="max-width: 800px;">
            <h2>SecurityInformation</h2>
            <div style="text-align: right; margin-bottom: 20px;">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
            </div>
            
            <h3>HowWe Protect You</h3>
            
            <h4>🔒 Encryption</h4>
           <p>We use military-grade encryption to protectyour data:</p>
            <ul>
                <li><strong>Algorithm:</strong> AES-256-GCM (Advanced Encryption Standard)</li>
                <li><strong>Key Derivation:</strong> PBKDF2with SHA-256</li>
                <li><strong>Iterations:</strong> 600,000 (OWASP 2024 recommendation)</li>
                <li><strong>Key Length:</strong> 256 bits</li>
            </ul>
            
            <h4>🛡️ Anti-Fingerprinting</h4>
            <p>We actively protect against browser fingerprinting:</p>
            <ul>
                <li>Canvas fingerprinting protection</li>
                <li>Timing attack mitigation</li>
               <li>Plugin enumeration blocking</li>
                <li>Font fingerprinting protection</li>
</ul>
            
            <h4>🔐 Secure Data Deletion</h4>
            <p>When you delete data, we follow DOD 5220.22-M standard:</p>
<ul>
                <li>Overwrite with random data 3times</li>
                <li>Clear from all storage locations</li>
<li>Remove from IndexedDB and caches</li>
            </ul>
            
            <h4>✅ Content Security Policy</h4>
            <p>We enforce strict CSP to prevent:</p>
            <ul>
                <li>Cross-site scripting (XSS)attacks</li>
                <li>Data injection attacks</li>
                <li>Unauthorized script execution</li>
            </ul>
            
            <h4>🌐 HTTPS Only</h4>
           <p>All connections use HTTPS with HSTS to prevent:</p>
            <ul>
                <li>Man-in-the-middle attacks</li>
               <li>Eavesdropping</li>
                <li>Data tampering</li>
            </ul>
            
            <div style="margin-top: 30px; padding: 20px; background: var(--background); border-radius: var(--radius-md);">
               <h4 style="margin-top: 0;">Want to Verify?</h4>
                <p>Our code is open for inspection. You can verify our security measures yourself.</p>
            </div>
        </div>
    `;
    openModal(content);
}

async function exportUserData() {
    if (confirm('Export all your data? Thiswill download a JSON file containing all your encrypted information.')) {
        try {
            showLoading();
            await securityManager.exportUserData();
            hideLoading();
            showNotification('Data exported successfully!', 'success');
        } catch (error) {
            hideLoading();
            showNotification('Errorexporting data: ' + error.message, 'error');
        }
    }
}

async function deleteUserData() {
    if (confirm('⚠️ WARNING: This will permanently delete ALL your data from this device. This action cannot be undone. Are you sure?')) {
        if (confirm('This is your final confirmation.Delete all data?')) {
           try {
                showLoading();
                await securityManager.deleteAllUserData();
                AppState.personalizationEnabled = false;
                AppState.preferences = {};
                hideLoading();
                showNotification('All data deleted successfully.', 'success');
                
                // Reload page to resetstate
                setTimeout(() => {
window.location.reload();
                },2000);
            } catch (error) {
                hideLoading();
                showNotification('Error deleting data: ' + error.message, 'error');
           }
        }
    }
}

function showContactForm() {
    // Generate unique submission IDfor anonymous tracking
    const submissionId = 'SUB-' +Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const content = `
        <div style="max-width: 600px;">
            <h2>Contact Us</h2>
            <div style="text-align: right; margin-bottom: 20px;">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
            </div>
            
            <p>We'dlove to hear from you! Whether you have questions, suggestions, or want to share yourstory about workplace democracy.</p>
<!-- Netlify Forms: Hidden fields for bot detection and form identification -->
            <form id="contactForm" name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onsubmit="handleContactSubmit(event)">
               <!-- Honeypot field forspam protection (hidden) -->
<input type="hidden" name="bot-field" />
                
                <!-- Hidden form name for Netlify -->
                <input type="hidden" name="form-name" value="contact" />
                
                <!-- Hidden submission ID for tracking anonymous responses -->
                <inputtype="hidden" name="submission-id" value="${submissionId}" />
                
                <div style="margin-bottom: 20px;">
                    <label for="contactName">Your Name <span style="color:var(--text-light); font-size: 0.875rem;">(Optional - youcan remain anonymous)</span></label>
                    <inputtype="text" id="contactName" name="name" placeholder="Leave blank to remain anonymous">
                </div>
                
                <div style="margin-bottom:20px;">
                    <label for="contactEmail">Your Email <span style="color:var(--text-light); font-size: 0.875rem;">(Optional - only if you want a reply)</span></label>
                    <input type="email" id="contactEmail" name="email" placeholder="Leave blank to remain anonymous">
                    <p style="font-size: 0.8125rem; color: var(--text-light); margin-top: 0.5rem; margin-bottom: 0;">
                        💡 <strong>Tip:</strong> If you want a response butwant to stay anonymous, you can provide an email without your real name, or use a temporary email service.
                    </p>
                </div>
                
               <div style="margin-bottom: 20px;">
                    <label for="contactSubject">Subject <span style="color: var(--error);">*</span></label>
                    <input type="text" id="contactSubject" name="subject" required placeholder="What is your message about?">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label for="contactMessage">Message <span style="color: var(--error);">*</span></label>
                    <textarea id="contactMessage" name="message" rows="6" required placeholder="Share your thoughts, questions, orfeedback..."></textarea>
                </div>
                
                <!-- Show submission ID for user reference -->
                <div style="margin-bottom: 20px; padding: 12px; background: var(--surface-alt); border-radius: var(--radius-md);border-left: 4px solidvar(--primary);">
<p style="font-size: 0.8125rem; margin: 0; color: var(--text-secondary);">
                        📋<strong>Your Submission ID:</strong> <code style="background: var(--surface); padding: 2px6px; border-radius: 4px; font-family: monospace;">${submissionId}</code><br>
                        <span style="font-size: 0.75rem; color:var(--text-light);">Save this ID to reference your message if you submit anonymously.</span>
                    </p>
                </div>
                
                <buttontype="submit" class="btn btn-primary">Send Message</button>
            </form>
            
            <div style="margin-top: 30px;padding-top: 20px; border-top: 1px solid var(--border);">
                <p style="color: var(--text-secondary);font-size: 0.875rem; margin-bottom: 0.75rem;">
                    <i class="fas fa-shield-alt"></i>
<strong>Privacy Guarantee:</strong> Your message will be sent securely. We will never share your contact information.
               </p>
                <p style="color:var(--text-light); font-size: 0.8125rem; margin: 0;">
                    ✨ <strong>Anonymous submissionsare welcome!</strong> You can leave Name and Email blank if you prefer to remain anonymous. Use your Submission ID to referenceyour message if needed.
                </p>
           </div>
        </div>
    `;
    openModal(content);
}

function handleContactSubmit(event) {
    event.preventDefault();
    
    const form= event.target;
    const formData = new FormData(form);
    const submissionId = formData.get('submission-id');
    constisAnonymous = !formData.get('name') &&!formData.get('email');
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText= submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
submitButton.disabled = true;
    
    //Submit to Netlify Forms
    fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
    })
    .then(response => {
        if (response.ok) {
            // Success!
            let successMessage= 'Thank you for your message! ';
            
            if (isAnonymous) {
                successMessage += `Your submission ID is <strong>${submissionId}</strong>. Save this to reference your message.`;
            } else if (!formData.get('email')) {
                successMessage += `Your submission ID is <strong>${submissionId}</strong> (you can check for responses using this ID).`;
            } else {
                successMessage += "We'll get back toyou soon at the email you provided.";
            }
            
            showNotification(successMessage, 'success');
            closeModal();
            
           // Store submission ID in localStorage for user reference
const submissions = JSON.parse(localStorage.getItem('wdp_contact_submissions') || '[]');
            submissions.push({
                id: submissionId,
               date: new Date().toISOString(),
                subject: formData.get('subject'),
                anonymous: isAnonymous
            });
            // Keeponly last 10 submissions
            if(submissions.length > 10) submissions.shift();
            localStorage.setItem('wdp_contact_submissions', JSON.stringify(submissions));
            
        }else {
            throw new Error('Form submission failed');
        }
    })
    .catch(error => {
        console.error('Contact formerror:', error);
        showNotification('Oops! There was a problem sending your message. Please try again or email us directly.', 'error');
        submitButton.innerHTML = originalButtonText;
       submitButton.disabled = false;
    });
}

/**
 * Utility functions
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(AppState.currentLanguage, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

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

/**
 * Navigate to section smoothly
 */
function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
//Close mobile menu if open
        closeMobileMenu();
        
        // Track that user has interacted (for guided tour)
        localStorage.setItem('hasInteracted', 'true');
    }
}

/**
 * Show Civic Voting section
 */
function showCivicVoting() {
   // This function will be called afternavigating to civic section
    // You can add specific logic to show voting tracker if needed
    console.log('Showing civic voting tracker...');
}

/**
* Guided Tour Overlay
 */
function initializeGuidedTour() {
    // Check if user has seen the tour before
   const hasSeenTour = localStorage.getItem('hasSeenGuidedTour');
    const hasInteracted = localStorage.getItem('hasInteracted');
    
    // Only show on first visit and if user hasn't interacted yet
    if (!hasSeenTour && !hasInteracted) {
        setTimeout(() => {
            showGuidedTour();
        }, 1000); // Show after 1 second delay
    }
}

function showGuidedTour() {
    const tourHTML = `
        <div class="guided-tour-overlay" id="guidedTourOverlay">
            <div class="guided-tour-content">
                <div class="tour-header">
                    <h2>👋 Welcome to Workforce Democracy!</h2>
                    <p style="margin-top: 0.75rem; font-size: 1.1rem; opacity: 0.95;">Your journey to understanding democratic workplaces starts here</p>
                    <buttonclass="tour-close-btn" onclick="closeGuidedTour()" aria-label="Close tour">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
<div class="tour-body">
                    <!-- Step 1: Welcome -->
                    <div class="tour-step active" data-step="1">
                        <div class="tour-step-icon">🎯</div>
                        <h3>Discover a Better Way to Work</h3>
                        <p style="font-size: 1.05rem; margin-bottom: 1.5rem;">Explore how democratic workplaces empower employees, track government transparency,and find ethical businesses—all in one place.</p>
                        
                        <div class="tour-features-grid">
                            <div class="tour-feature-card">
                                <div class="tour-feature-icon">🗳️</div>
                                <div class="tour-feature-title">Civic Engagement</div>
                                <div class="tour-feature-desc">Track representatives & vote onbills</div>
                            </div>
                            <div class="tour-feature-card">
                                <div class="tour-feature-icon">💼</div>
                                <div class="tour-feature-title">Job Exploration</div>
                                <div class="tour-feature-desc">230+ professions compared</div>
                            </div>
                            <div class="tour-feature-card">
                                <div class="tour-feature-icon">🤝</div>
                                <div class="tour-feature-title">Ethical Business</div>
                                <div class="tour-feature-desc">Find democratic workplaces near you</div>
</div>
                            <div class="tour-feature-card">
                                <div class="tour-feature-icon">📚</div>
                                <div class="tour-feature-title">Learning Center</div>
                                <div class="tour-feature-desc">Videos, research & real stories</div>
                            </div>
                        </div>
                        
                        <p style="margin-top:1.5rem; font-weight: 600; font-size: 1.05rem;">Ready for a 45-second tour?</p>
                        
                        <div class="tour-actions">
                            <button class="btn btn-primary" onclick="nextTourStep()">
                                <i class="fasfa-rocket"></i> Let's Go!
                            </button>
                            <button class="btn btn-secondary" onclick="skipGuidedTour()">
                                I'll explore on my own
                            </button>
                        </div>
                    </div>
                    
                    <!-- Step 2: Civic Engagement -->
                    <div class="tour-step" data-step="2">
                        <div class="tour-step-icon">🗳️</div>
                        <h3>CivicEngagement & Transparency</h3>
                        <p style="font-size: 1.05rem; margin-bottom: 1.25rem;">Stay informed about whatyour electedofficials are doing—and have your voice heard.</p>
                        
                        <div style="background: rgba(102, 126, 234, 0.05); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.25rem; border-left: 4px solid #667eea;">
                            <p style="margin: 0 0 0.75rem 0;"><strong style="color: #667eea;">✓</strong> Track voting records from federal tolocal government</p>
                            <p style="margin: 0 0 0.75rem 0;"><strong style="color: #667eea;">✓</strong> Voteon bills yourself and compare with your representatives</p>
                            <p style="margin: 0 0 0.75rem 0;"><strong style="color: #667eea;">✓</strong> GetAI-powered explanations of complex legislation</p>
                            <p style="margin: 0;"><strong style="color: #667eea;">✓</strong> Chat with our Civic Assistant for instant answers</p>
                        </div>
                        
                        <div class="tour-actions">
                            <button class="btn btn-primary" onclick="nextTourStep()">
                                Next<i class="fas fa-arrow-right"></i>
                            </button>
                            <button class="btn-link" onclick="skipGuidedTour()">Skip tour</button>
                        </div>
                    </div>
                    
                    <!-- Step 3: Jobs Exploration -->
                    <div class="tour-step" data-step="3">
<div class="tour-step-icon">💼</div>
                        <h3>Explore Democratic Jobs</h3>
                        <p style="font-size: 1.05rem; margin-bottom: 1.25rem;">See what your profession would look like with worker democracy—increased autonomy,fair wages, and meaningful participation.</p>
                        
                        <div class="tour-features-grid" style="grid-template-columns: 1fr;">
                            <div class="tour-feature-card" style="text-align: left;">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                    <div class="tour-feature-icon" style="margin: 0;">🔍</div>
                                    <div>
<div class="tour-feature-title" style="margin-bottom: 0.25rem;">Compare 230+ Professions</div>
<div class="tour-feature-desc">Side-by-side comparisons of traditional vs democratic workplaces</div>
                                    </div>
                                </div>
                            </div>
                            <div class="tour-feature-card" style="text-align: left;">
                                <div style="display: flex; align-items: center; gap:1rem; margin-bottom: 1rem;">
                                    <div class="tour-feature-icon" style="margin: 0;">💬</div>
                                    <div>
                                       <div class="tour-feature-title" style="margin-bottom: 0.25rem;">AI Job Assistant</div>
                                        <div class="tour-feature-desc">Ask questions specific to your career and industry</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tour-actions">
                            <button class="btn btn-primary" onclick="nextTourStep()">
                                Next <i class="fas fa-arrow-right"></i>
                           </button>
                            <button class="btn-link" onclick="skipGuidedTour()">Skip tour</button>
                        </div>
                    </div>
                    
                    <!-- Step 4: Ethical Business & Learning -->
                    <div class="tour-step" data-step="4">
                        <div class="tour-step-icon">🤝</div>
                        <h3>Find Ethical Businesses & Learn</h3>
                        <p style="font-size: 1.05rem; margin-bottom: 1.25rem;">Discoverdemocratic workplaces in your area and deepen your understanding with educational resources.</p>
                        
                        <div style="display: grid; gap: 1rem; margin-bottom: 1.25rem;">
                            <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); padding: 1.25rem; border-radius: 12px; border: 2px solidrgba(102, 126, 234, 0.2);">
                                <div style="font-weight: 600; margin-bottom: 0.5rem; color: #667eea;">🗺️ Ethical Business Finder</div>
                                <p style="margin: 0; font-size: 0.95rem;">Search for worker cooperatives, B-Corps, and democratically-run businesses near you. Chat with our assistant to find the perfect match.</p>
                            </div>
                            <div style="background: linear-gradient(135deg,rgba(72, 187, 120, 0.1)0%, rgba(72, 187, 120, 0.05) 100%); padding: 1.25rem; border-radius: 12px; border: 2px solid rgba(72, 187, 120, 0.2);">
                                <div style="font-weight: 600; margin-bottom: 0.5rem; color: #48bb78;">📚 Learning Center</div>
                                <p style="margin: 0; font-size: 0.95rem;">Watchexpert videos, read research studies, explore real-world success stories, and get answers to common questions in our comprehensive FAQ.</p>
                            </div>
                        </div>
                        
                        <div class="tour-actions">
                            <button class="btn btn-primary" onclick="nextTourStep()">
                                Next<iclass="fas fa-arrow-right"></i>
                            </button>
                            <button class="btn-link" onclick="skipGuidedTour()">Skip tour</button>
                        </div>
                    </div>
                    
                    <!-- Step 5: Personalization -->
                    <div class="tour-step" data-step="5">
                      <div class="tour-step-icon">✨</div>
                        <h3>Personalize Your Experience</h3>
                        <p style="font-size: 1.05rem; margin-bottom: 1.5rem;">Gettailored recommendations and find what matters most to you—with complete privacy protection.</p>
                        
                       <div class="tour-personalization-input">
                            <label for="tourPostcode" style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #2d3748;">
                                📍 Your Postcode (Optional)
</label>
                           <p style="font-size: 0.9rem; color: #718096; margin-bottom: 1rem;">
                                Enter your postcode to find local representatives, nearby ethical businesses, and community events.
                            </p>
                            <input 
                                type="text"id="tourPostcode"placeholder="e.g., SW1A 1AA" 
                                style="width: 100%; padding: 0.875rem 1.25rem; border:2px solid #cbd5e0; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;"
                                onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)'"
                                onblur="this.style.borderColor='#cbd5e0'; this.style.boxShadow='none'"
                            />
                        </div>
                        
                        <div class="tour-privacy-badge">
                            <div style="display: flex; align-items: start; gap: 0.75rem;">
                                <div style="font-size: 1.5rem; flex-shrink: 0;">🔐</div>
                                <div>
                                    <div style="font-weight: 700; margin-bottom: 0.5rem; color:#2d3748;">Complete Privacy Guaranteed</div>
                                    <ulstyle="margin: 0;padding-left: 1.25rem; font-size: 0.95rem; line-height: 1.6;">
                                        <li><strong>All data stays on YOUR device</strong> (AES-256 encrypted)</li>
                                        <li><strong>Nothing sent toservers</strong>—ever</li>
                                        <li><strong>No accounts, no email, no tracking</strong></li>
                                        <li><strong>Delete anytime</strong> with one click</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: rgba(102, 126, 234, 0.05); padding: 1.25rem; border-radius: 8px; margin-top: 1.25rem;">
                            <p style="margin: 0 0 0.5rem 0;font-weight: 600; color: #2d3748;">What gets remembered (locally only):</p>
                            <p style="margin: 0; font-size: 0.95rem; color: #4a5568;">Billsyou view • Yourvotes • Topics explored • Learning progress • Search history</p>
                        </div>
                        
                        <div class="tour-actions" style="margin-top: 1.5rem;">
                            <button class="btn btn-primary" onclick="enablePersonalizationAndFinish()">
                                <i class="fas fa-check-circle"></i> Enable Personalization
                            </button>
                            <button class="btn btn-secondary" onclick="finishGuidedTour()">
                                No Thanks, Keep It Simple
                            </button>
                        </div>
<p style="font-size: 0.85rem; color: #718096; margin-top: 1rem; text-align: center;">
                            <i class="fas fa-info-circle"></i> Change this anytime in <a href="privacy.html#personalization" style="color: #667eea; text-decoration: none; font-weight: 600;">PrivacySettings</a>
</p>
                    </div>
                </div>
                
                <div class="tour-progress">
                    <div class="tour-progress-dots">
                        <span class="progress-dotactive" data-step="1"></span>
                        <span class="progress-dot" data-step="2"></span>
                        <spanclass="progress-dot" data-step="3"></span>
                        <span class="progress-dot" data-step="4"></span>
                        <span class="progress-dot" data-step="5"></span>
                    </div>
                </div>
            </div>
        </div>
`;
    
   document.body.insertAdjacentHTML('beforeend', tourHTML);
}

let currentTourStep = 1;

function nextTourStep() {
    currentTourStep++;
    updateTourStep();
}

function updateTourStep() {
    const steps = document.querySelectorAll('.tour-step');
    const dots = document.querySelectorAll('.progress-dot');
    
steps.forEach((step, index) => {
        if (parseInt(step.dataset.step) === currentTourStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    dots.forEach((dot, index) => {
        if (parseInt(dot.dataset.step)<= currentTourStep) {
dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function enablePersonalizationAndFinish() {
    // Get postcodeif provided
    const postcodeInput = document.getElementById('tourPostcode');
    const postcode = postcodeInput ? postcodeInput.value.trim() : '';
    
// Use new unified personalization system
    localStorage.setItem('wdp_personalization_enabled', 'true');
    localStorage.setItem('wdp_personalization_choice', 'enabled');
localStorage.setItem('wdp_personalization_consent_date', new Date().toISOString());
    
    // Savepostcode if provided
if (postcode) {
       localStorage.setItem('wdp_user_postcode', postcode);
    }
    
    // Initialize empty learning profile
    const initialProfile = {
        billsViewed: [],
votingHistory: [],
        categoriesInterested: {},
        timeSpent: {},
        questionsAsked: [],
knowledgeLevel: 'beginner',
        postcode: postcode,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('wdp_learning_profile', JSON.stringify(initialProfile));
    
    // Finish tour
   localStorage.setItem('hasSeenGuidedTour', 'true');
    closeGuidedTour();
    
    constmessage = postcode 
       ? '✅ Personalization enabled!We\'ll find local resources for you.' 
        : '✅ Personalization enabled! Your journey is now customized to your interests.';
    showNotification(message,'success');
}

function finishGuidedTour() {
    // User declined personalization - use unified system
localStorage.setItem('wdp_personalization_enabled', 'false');
localStorage.setItem('wdp_personalization_choice', 'skipped');
    localStorage.setItem('hasSeenGuidedTour', 'true');
    closeGuidedTour();
    showNotification('🎉 Welcome! Scroll down to start exploring.', 'success');
}

function skipGuidedTour() {
   // User skipped tour entirely - useunified system
    localStorage.setItem('wdp_personalization_enabled', 'false');
    localStorage.setItem('wdp_personalization_choice', 'skipped');
localStorage.setItem('hasSeenGuidedTour', 'true');
    closeGuidedTour();
}

function closeGuidedTour() {
    constoverlay = document.getElementById('guidedTourOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

/**
 * Initialize dynamic spacing for civic section
 * Makes spacing conditional basedon content presence* Fixes blank space issue betweencivic and jobs sections
*/
function initializeDynamicCivicSpacing() {
    const containers = [
        'billsListContainer',
        'upcomingBillsContainer',
        'civicResults',
        'courtContainer',
        'personalDashboardContainer',
        'candidateResults'
    ];
// Function to update container spacing
function updateContainerSpacing(){
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                // Check if container has meaningful content
                const hasContent = container.children.length > 0 && 
                                 container.textContent.trim().length > 0;
                
                // Toggleclass for dynamic styling
               if (hasContent) {
                    container.classList.add('has-content');
                } else {
                    container.classList.remove('has-content');
                }
            }
        });
    }
    
    // Initial check
    updateContainerSpacing();
    
   // Set upMutationObserver to watch for content changes
   const observer = new MutationObserver(() => {
        updateContainerSpacing();
    });
    
    // Observe each container for changes
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            observer.observe(container,{
                childList: true,
                subtree: true,
               characterData: true
           });
        }
    });
    
    console.log('✅ Dynamic civic spacing initialized');
}

// Make functions globally available
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.toggleLanguageMenu =toggleLanguageMenu;
// V36.4.0:REMOVED - enablePersonalizationand skipPersonalization deleted
// window.enablePersonalization = enablePersonalization;
// window.skipPersonalization = skipPersonalization;
window.showPrivacyPolicy = showPrivacyPolicy;
window.showSecurityInfo = showSecurityInfo;
window.exportUserData = exportUserData;
window.deleteUserData = deleteUserData;
window.showContactForm = showContactForm;
window.handleContactSubmit = handleContactSubmit;
window.openModal = openModal;
window.closeModal = closeModal;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showNotification = showNotification;
window.navigateToSection =navigateToSection;
window.showCivicVoting = showCivicVoting;
window.showGuidedTour = showGuidedTour;
window.closeGuidedTour = closeGuidedTour;
window.skipGuidedTour = skipGuidedTour;
window.nextTourStep = nextTourStep;
window.finishGuidedTour =finishGuidedTour;
window.toggleLanguageMenuDesktop = toggleLanguageMenuDesktop;

function getBackendUrl() {
    // For Netlify testing environment
    if (window.location.hostname.includes('netlify.app') || 
        window.location.hostname === 'localhost') {
        // Connect to Version B (Development) on port 3001
        return 'http://185.193.126.13:3001';
    } else {
        // Production environment - connect to Version A on port 3000
        return 'http://185.193.126.13:3000';
    }
}

// Globalbackend URLconstant

// Initialize floating chat widget
document.addEventListener('DOMContentLoaded', () => {
  try { 
    window.ChatWidget?.initFloating?.(); 
  } catch(e) { 
    console.error('[ChatWidget] initFloating error:', e); 
  }
