/**
 * PERSONALIZATION UI - User Interface Logic
 * Version: 37.11.6-ENCRYPTION-BUG-FIX
 * Date: January 19, 2025
 * 
 * Handles all UI interactions for the personalization system:
 * - Setup wizard flow
 * - Login modal
 * - Account menu
 * - Welcome banner
 * 
 * v37.11.6 FIX: Removed window.location.reload() from completeSetup()
 * to prevent sessionPassword from being cleared, which was causing
 * localStorage data to appear lost after setup complete.
 */

let currentWizardStep = 1;
let recoveryKey = null;

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
  // BANNER DISPLAY REMOVED - Nov 16, 2025
  // Reason: Duplicate display logic causes conflicts
  // Banner is now shown by PersonalizationSystem.showWelcomeBanner() only
  //
  // OLD CODE (causing duplicate):
  // if (!PersonalizationSystem.isLoggedIn()) {
  //   setTimeout(() => {
  //     const banner = document.getElementById('welcome-banner');
  //     if (banner) banner.style.display = 'block';
  //   }, 2000);
  // } else {
  //   showAccountIndicator();
  // }
  
  // Setup password strength indicator
  setupPasswordStrength();
  
  // Setup overlay click-outside-to-close
  setupOverlayClose();
  
  // FIX: Attach login form handler programmatically
  // The inline onsubmit attribute doesn't work reliably in all browsers
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    console.log('✅ Login form event listener attached');
  }
});

// ============================================
// WELCOME BANNER
// ============================================

function dismissWelcomeBanner() {
  const banner = document.getElementById('welcome-banner');
  if (banner) banner.style.display = 'none';
}

// ============================================
// SETUP WIZARD
// ============================================

function openSetupWizard() {
  console.log('🎯 openSetupWizard() called');
  dismissWelcomeBanner();
  document.getElementById('personalization-overlay').classList.add('active');
  document.getElementById('setup-wizard').style.display = 'block';
  document.getElementById('login-modal').style.display = 'none';
  currentWizardStep = 1;
  recoveryKey = null;
  console.log('📋 Calling updateWizardUI()...');
  updateWizardUI();
  clearErrors();
  console.log('✅ Setup wizard opened');
}

async function wizardNextStep() {
  console.log('🚀 wizardNextStep() called - currentStep:', currentWizardStep);
  
  const error = await validateCurrentStep();
  if (error) {
    console.log('❌ Validation error:', error);
    showStepError(currentWizardStep, error);
    return;
  }
  
  console.log('✅ Validation passed');
  clearErrors();
  
  // Step 1: Register account
  if (currentWizardStep === 1) {
    const username = document.getElementById('wizard-username').value;
    const password = document.getElementById('wizard-password').value;
    
    console.log('Registering account...');
    const result = await PersonalizationSystem.register(username, password);
    
    if (!result.success) {
      showStepError(1, result.error);
      return;
    }
    
    recoveryKey = result.recoveryKey;
    console.log('✅ Registration successful');
  }
  
  // Step 2: Save address
  if (currentWizardStep === 2) {
    const address = {
      street: document.getElementById('wizard-street').value,
      city: document.getElementById('wizard-city').value,
      state: document.getElementById('wizard-state').value,
      zip: document.getElementById('wizard-zip').value
    };
    
    PersonalizationSystem.updateField('address', address);
    console.log('✅ Address saved:', address);
    
    // TODO: Look up congressional district from address
    // For now, just continue
  }
  
  // Step 3: Final setup
  if (currentWizardStep === 3) {
    // Get language from SELECT dropdown, not radio buttons
    const languageSelect = document.getElementById('wizard-language');
    const language = languageSelect ? languageSelect.value : 'en';
    PersonalizationSystem.updateField('preferences.language', language);
    console.log('✅ Language saved:', language);
    
    // Show recovery key
    const recoveryContainer = document.getElementById('recoveryKeySection');
    const recoveryValue = document.getElementById('recoveryKeyText');
    const nextBtn = document.getElementById('wizardNextBtn');
    
    console.log('🔑 Recovery key available:', recoveryKey ? 'YES' : 'NO');
    console.log('🔑 Recovery container found:', recoveryContainer ? 'YES' : 'NO');
    
    if (recoveryKey && recoveryContainer && recoveryValue && nextBtn) {
      recoveryContainer.style.display = 'block';
      recoveryValue.textContent = recoveryKey;
      nextBtn.textContent = 'Complete Setup! ✓';
      nextBtn.onclick = completeSetup;
      console.log('✅ Recovery key displayed, button changed to Complete Setup');
    } else {
      console.error('❌ Cannot show recovery key - missing elements');
    }
    return;
  }
  
  currentWizardStep++;
  updateWizardUI();
}

function wizardPrevStep() {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    updateWizardUI();
    clearErrors();
  }
}

function updateWizardUI() {
  console.log('🔧 updateWizardUI() called - currentStep:', currentWizardStep);
  
  // Update step visibility - use .wizard-step not .setup-wizard-step!
  document.querySelectorAll('.wizard-step').forEach((step, index) => {
    step.classList.toggle('active', index + 1 === currentWizardStep);
    console.log(`  Step ${index + 1}: ${index + 1 === currentWizardStep ? 'ACTIVE' : 'hidden'}`);
  });
  
  // Update progress dots
  document.querySelectorAll('.progress-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index + 1 === currentWizardStep);
    dot.classList.toggle('completed', index + 1 < currentWizardStep);
  });
  
  // Update buttons - use IDs not classes!
  const backBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  
  console.log('🔍 Next button found:', nextBtn ? 'YES' : 'NO');
  
  if (backBtn) {
    backBtn.style.display = currentWizardStep > 1 ? 'block' : 'none';
    backBtn.onclick = wizardPrevStep;
  }
  
  if (nextBtn) {
    nextBtn.textContent = 'Next →';
    nextBtn.onclick = wizardNextStep;
    console.log('✅ Next button onclick attached');
  } else {
    console.error('❌ Next button NOT found in DOM!');
  }
}

async function validateCurrentStep() {
  if (currentWizardStep === 1) {
    const username = document.getElementById('wizard-username').value.trim();
    const password = document.getElementById('wizard-password').value;
    const confirm = document.getElementById('wizard-password-confirm').value;
    
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!password) return 'Password is required';
    if (password !== confirm) return 'Passwords do not match';
    
    const validation = CryptoUtils.validatePassword(password);
    if (!validation.valid) return validation.errors[0];
  }
  
  if (currentWizardStep === 2) {
    const fields = [
      { id: 'wizard-street', name: 'Street address' },
      { id: 'wizard-city', name: 'City' },
      { id: 'wizard-state', name: 'State' },
      { id: 'wizard-zip', name: 'Zip code' }
    ];
    
    for (const field of fields) {
      const value = document.getElementById(field.id).value.trim();
      if (!value) return `${field.name} is required`;
    }
    
    const zip = document.getElementById('wizard-zip').value.trim();
    if (!/^\d{5}$/.test(zip)) return 'Zip code must be 5 digits';
  }
  
  if (currentWizardStep === 3) {
    // Step 3 has no required fields - language has default, recovery key is shown not entered
    console.log('✅ Step 3 validation: No required fields');
  }
  
  return null;
}

async function completeSetup() {
  console.log('🎉 completeSetup() called');
  
  // SIMPLIFIED WORKFLOW:
  // 1. Close modal and show account indicator immediately
  // 2. Sync in background (don't block UI)
  // 3. No page reload needed - user is already logged in
  
  closeModals();
  showAccountIndicator();
  
  console.log('✅ Setup complete - you are now logged in!');
  console.log('📤 Syncing data to backend in background...');
  
  // Sync in background - don't wait for it
  PersonalizationSystem.syncToServer()
    .then(result => {
      if (result && result.success) {
        console.log('✅ Background sync completed successfully');
      } else {
        console.warn('⚠️ Background sync failed - will retry later');
      }
    })
    .catch(error => {
      console.warn('⚠️ Background sync error:', error);
      console.log('📝 Data is saved locally and will sync when connection is stable');
    });
  
  // Apply personalization immediately without reload
  PersonalizationSystem.applyPersonalization();
  
  // Show success message
  console.log('🎉 Welcome! Your account is set up and ready to use.');
}

// ============================================
// LOGIN MODAL
// ============================================

function openLoginModal() {
  dismissWelcomeBanner();
  document.getElementById('personalization-overlay').classList.add('active');
  document.getElementById('login-modal').style.display = 'block';
  document.getElementById('setup-wizard').style.display = 'none';
  clearErrors();
}

async function handleLogin(event) {
  // Prevent form from submitting normally (which would refresh the page)
  if (event) event.preventDefault();
  
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  
  if (!username || !password) {
    showLoginError('Please enter username and password');
    return;
  }
  
  console.log('Logging in...');
  const result = await PersonalizationSystem.login(username, password);
  
  if (!result.success) {
    console.error('Login failed:', result.error);
    showLoginError(result.error);
    return;
  }
  
  console.log('✅ Login successful - data saved to localStorage');
  console.log('📊 Username:', localStorage.getItem('wdp_username'));
  console.log('📊 Password hash exists:', !!localStorage.getItem('wdp_password_hash'));
  
  // Give localStorage time to finish writing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // ✅ FIX v37.11.6: Don't reload - just close modal and show account indicator
  // Reloading was clearing sessionPassword from memory, preventing decryption
  console.log('✅ Setup complete - staying on page (no reload)');
  closeModals();
  showAccountIndicator();
  
  // Apply personalization immediately without reload
  PersonalizationSystem.applyPersonalization();
}

function showLoginError(message) {
  const error = document.getElementById('login-error');
  if (error) {
    error.textContent = message;
    error.classList.add('active');
  }
}

// ============================================
// ACCOUNT INDICATOR & MENU
// ============================================

function showAccountIndicator() {
  console.log('👤 showAccountIndicator() called');
  
  const username = PersonalizationSystem.getUsername();
  console.log('  Username:', username);
  
  // Fix #12: Correct IDs to match HTML (camelCase, not kebab-case)
  const indicator = document.getElementById('accountIndicator');
  const usernameSpans = document.querySelectorAll('.account-username'); // Class, not ID!
  const dropdownUsername = document.querySelector('.account-dropdown-username');
  const banner = document.getElementById('welcome-banner');
  
  console.log('  Indicator found:', indicator ? 'YES' : 'NO');
  console.log('  Banner found:', banner ? 'YES' : 'NO');
  console.log('  Username spans found:', usernameSpans.length);
  
  // Update all username display elements
  usernameSpans.forEach(span => span.textContent = username);
  if (dropdownUsername) dropdownUsername.textContent = username;
  
  // Show account menu, hide welcome banner
  if (indicator) indicator.style.display = 'block';
  if (banner) {
    banner.style.display = 'none';
    console.log('✅ Welcome banner hidden');
  }
  
  console.log('✅ Account indicator displayed');
}

function toggleAccountMenu() {
  console.log('🔽 toggleAccountMenu() called');
  
  // Fix #12: Correct ID to match HTML (camelCase)
  const dropdown = document.getElementById('accountDropdown');
  
  console.log('  Dropdown found:', dropdown ? 'YES' : 'NO');
  
  if (dropdown) {
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    console.log('  Dropdown now:', isVisible ? 'HIDDEN' : 'VISIBLE');
  }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  // Fix #12: Correct IDs to match HTML (camelCase)
  const indicator = document.getElementById('accountIndicator');
  const dropdown = document.getElementById('accountDropdown');
  
  if (indicator && dropdown && !indicator.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// ============================================
// ADDRESS UPDATE
// ============================================

function openAddressUpdate() {
  // TODO: Create address update modal
  alert('Address update coming soon! For now, use the setup wizard.');
}

// ============================================
// RECOVERY KEY
// ============================================

function copyRecoveryKey() {
  console.log('📋 copyRecoveryKey() called');
  
  const keyElement = document.getElementById('recoveryKeyText');
  
  console.log('🔍 Key element found:', keyElement ? 'YES' : 'NO');
  
  if (!keyElement) {
    console.error('❌ Recovery key element not found!');
    alert('Error: Could not find recovery key to copy');
    return;
  }
  
  const key = keyElement.textContent;
  console.log('🔑 Recovery key:', key ? key.substring(0, 20) + '...' : 'EMPTY');
  
  if (!key) {
    console.error('❌ Recovery key is empty!');
    alert('Error: Recovery key is empty');
    return;
  }
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(key).then(() => {
      console.log('✅ Recovery key copied to clipboard!');
      alert('✅ Recovery key copied to clipboard!');
    }).catch(err => {
      console.error('❌ Clipboard copy failed:', err);
      alert('Copy failed. Please manually select and copy the key.');
    });
  } else {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = key;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      console.log('✅ Recovery key copied (fallback method)');
      alert('✅ Recovery key copied to clipboard!');
    } catch (error) {
      console.error('❌ Fallback copy failed:', error);
      alert('Copy failed. Please manually select and copy the key.');
    }
  }
}

function downloadRecoveryKey() {
  console.log('📥 downloadRecoveryKey() called');
  
  const keyElement = document.getElementById('recoveryKeyText');
  const usernameInput = document.getElementById('wizard-username');
  
  console.log('🔍 Key element found:', keyElement ? 'YES' : 'NO');
  console.log('🔍 Username input found:', usernameInput ? 'YES' : 'NO');
  
  if (!keyElement) {
    console.error('❌ Recovery key element not found!');
    return;
  }
  
  const key = keyElement.textContent;
  const username = usernameInput ? usernameInput.value : 'user';
  
  console.log('🔑 Recovery key:', key ? key.substring(0, 20) + '...' : 'EMPTY');
  console.log('👤 Username:', username);
  
  const content = `
WORKFORCE DEMOCRACY PROJECT
Recovery Key for: ${username}

⚠️ KEEP THIS SAFE! ⚠️

You'll need this key to reset your password if you forget it.
Store it in a secure location (password manager, safe, etc.)

Recovery Key:
${key}

Generated: ${new Date().toLocaleString()}
`.trim();
  
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `recovery-key-${username}-${Date.now()}.txt`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Download triggered successfully');
    
    // Fix #11: Show download confirmation notification
    alert(`✅ Recovery key downloaded!\n\nFile saved as:\n${filename}\n\nPlease store this file in a secure location.`);
  } catch (error) {
    console.error('❌ Download failed:', error);
    alert('Download failed. Please use the Copy Key button instead.');
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function closeModals() {
  document.getElementById('personalization-overlay').classList.remove('active');
  document.getElementById('setup-wizard').style.display = 'none';
  document.getElementById('login-modal').style.display = 'none';
  clearErrors();
}

function showStepError(step, message) {
  const error = document.getElementById(`step${step}-error`);
  if (error) {
    error.textContent = message;
    error.classList.add('active');
  }
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(error => {
    error.textContent = '';
    error.classList.remove('active');
  });
}

function setupPasswordStrength() {
  const passwordInput = document.getElementById('wizard-password');
  const strengthFill = document.getElementById('password-strength-fill');
  
  if (!passwordInput || !strengthFill) return;
  
  passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    
    strengthFill.className = 'password-strength-fill';
    if (strength <= 2) {
      strengthFill.classList.add('weak');
    } else if (strength === 3) {
      strengthFill.classList.add('medium');
    } else {
      strengthFill.classList.add('strong');
    }
  });
}

function setupOverlayClose() {
  const overlay = document.getElementById('personalization-overlay');
  if (!overlay) return;
  
  overlay.addEventListener('click', (e) => {
    if (e.target.id === 'personalization-overlay') {
      closeModals();
    }
  });
}

// Make functions globally available
window.openSetupWizard = openSetupWizard;
window.openLoginModal = openLoginModal;
window.handleLogin = handleLogin;
window.dismissWelcomeBanner = dismissWelcomeBanner;
window.toggleAccountMenu = toggleAccountMenu;
window.openAddressUpdate = openAddressUpdate;
window.copyRecoveryKey = copyRecoveryKey;
window.downloadRecoveryKey = downloadRecoveryKey;
window.wizardNextStep = wizardNextStep;
window.wizardPrevStep = wizardPrevStep;
