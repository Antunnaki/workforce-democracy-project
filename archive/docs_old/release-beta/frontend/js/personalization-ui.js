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

let currentWizardStep = 1; // 1..3 maps to: 1→'0' (mode), 2→'1-local'|'1-sync', 3→'2' (recovery)
let recoveryKey = null;
let wizardMode = 'local'; // 'local' | 'sync'

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
  
  // Setup password strength indicator (sync mode field)
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
  currentWizardStep = 1; // progress step 1 = mode selection
  recoveryKey = null;
  wizardMode = 'local';
  console.log('📋 Calling updateWizardUI()...');
  updateWizardUI();
  clearErrors();
  console.log('✅ Setup wizard opened');
}

async function wizardNextStep() {
  console.log('🚀 wizardNextStep() called - progress step:', currentWizardStep);

  const error = await validateCurrentStep();
  if (error) {
    console.log('❌ Validation error:', error);
    showStepError(currentWizardStep, error);
    return;
  }

  console.log('✅ Validation passed');
  clearErrors();

  // Progress mapping: 1 (mode) → 2 (credentials) → 3 (recovery)
  if (currentWizardStep === 1) {
    // Capture selected mode
    const selected = document.querySelector('input[name="mode"]:checked');
    wizardMode = selected ? selected.value : 'local';
    currentWizardStep = 2;
    updateWizardUI();
    return;
  }

  if (currentWizardStep === 2) {
    if (wizardMode === 'local') {
      const localPass = document.getElementById('local-pass').value.trim();
      await PersonalizationSystem.localOnlyInit(localPass);
      recoveryKey = localStorage.getItem(PersonalizationSystem.STORAGE_KEYS.RECOVERY_KEY);
      currentWizardStep = 3;
      updateWizardUI();
      return;
    } else {
      const username = document.getElementById('sync-username').value.trim();
      const pass = document.getElementById('sync-pass').value;
      const email = document.getElementById('opt-email-toggle')?.checked
        ? document.getElementById('sync-email').value.trim()
        : null;
      const result = await PersonalizationSystem.register(username, pass, { email });
      if (!result.success) {
        showStepError(2, result.error);
        return;
      }
      recoveryKey = result.recoveryKey;
      currentWizardStep = 3;
      updateWizardUI();
      return;
    }
  }

  if (currentWizardStep === 3) {
    // Ensure user acknowledged recovery
    const ack = document.getElementById('ack-recovery');
    if (!ack || !ack.checked) {
      showRecoveryModal(recoveryKey);
      return;
    }
    completeSetup();
    return;
  }
}

function wizardPrevStep() {
  if (currentWizardStep === 2) {
    currentWizardStep = 1; // back to mode selection
  } else if (currentWizardStep === 3) {
    currentWizardStep = 2; // back to credentials of chosen mode
  }
  updateWizardUI();
  clearErrors();
}

function updateWizardUI() {
  console.log('🔧 updateWizardUI() called - progress:', currentWizardStep, 'mode:', wizardMode);

  // Determine which content block to show
  let stepKey = '0';
  if (currentWizardStep === 1) stepKey = '0';
  if (currentWizardStep === 2) stepKey = wizardMode === 'sync' ? '1-sync' : '1-local';
  if (currentWizardStep === 3) stepKey = '2';

  document.querySelectorAll('.wizard-step').forEach((el) => {
    const isActive = el.getAttribute('data-step') === stepKey;
    el.style.display = isActive ? 'block' : 'none';
    el.classList.toggle('active', isActive);
  });

  // Progress dots (1..3)
  document.querySelectorAll('.progress-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index + 1 === currentWizardStep);
    dot.classList.toggle('completed', index + 1 < currentWizardStep);
  });

  // Toggle email field visibility on sync step
  const toggle = document.getElementById('opt-email-toggle');
  const emailInput = document.getElementById('sync-email');
  if (toggle && emailInput) {
    emailInput.style.display = toggle.checked ? 'block' : 'none';
    toggle.onchange = () => { emailInput.style.display = toggle.checked ? 'block' : 'none'; };
  }

  // Setup recovery display when on step 3
  if (currentWizardStep === 3) {
    const phraseEl = document.getElementById('recovery-phrase');
    if (phraseEl && recoveryKey) phraseEl.textContent = recoveryKey;
    const dlBtn = document.getElementById('download-recovery');
    if (dlBtn) {
      dlBtn.onclick = () => {
        const blob = new Blob([JSON.stringify({ recoveryKey }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wdp-recovery.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showRecoveryModal(recoveryKey);
      };
    }
    const nextBtn = document.getElementById('wizardNextBtn');
    if (nextBtn) nextBtn.textContent = 'Complete Setup';
  } else {
    const nextBtn = document.getElementById('wizardNextBtn');
    if (nextBtn) nextBtn.textContent = 'Next →';
  }

  // Buttons
  const backBtn = document.getElementById('wizardPrevBtn');
  if (backBtn) backBtn.style.display = currentWizardStep > 1 ? 'block' : 'none';
}

async function validateCurrentStep() {
  if (currentWizardStep === 1) {
    // Mode selection – always valid (a default is checked)
    return null;
  }

  if (currentWizardStep === 2) {
    if (wizardMode === 'local') {
      const localPass = document.getElementById('local-pass').value.trim();
      if (localPass.length < 6) return 'Please enter at least 6 characters.';
      return null;
    } else {
      const username = document.getElementById('sync-username').value.trim();
      const pass = document.getElementById('sync-pass').value;
      const consent = document.getElementById('consent-encryption').checked;
      if (!username) return 'Please choose a username';
      if (username.length < 3) return 'Username must be at least 3 characters';
      if (pass.length < 8) return 'Passphrase should be at least 8 characters';
      const validation = CryptoUtils.validatePassword(pass);
      if (!validation.valid) return validation.errors[0];
      if (!consent) return 'Please acknowledge the encryption notice';
      const wantEmail = document.getElementById('opt-email-toggle').checked;
      if (wantEmail) {
        const email = document.getElementById('sync-email').value.trim();
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please enter a valid email or leave it blank';
      }
      return null;
    }
  }

  if (currentWizardStep === 3) {
    // Recovery step – checked at submission time
    return null;
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
    alert(`✅ Recovery key downloaded!

File saved as:
${filename}

Please store this file in a secure location.`);
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
  const passwordInput = document.getElementById('sync-pass');
  const meter = document.getElementById('pass-strength');
  if (!passwordInput || !meter) return;
  const bar = meter.querySelector('.password-strength-bar');
  const label = meter.querySelector('.password-strength-text');
  if (!bar || !label) return;
  passwordInput.addEventListener('input', (e) => {
    const p = e.target.value;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    bar.style.width = `${(score / 5) * 100}%`;
    if (score <= 2) { bar.style.background = '#e74c3c'; label.textContent = 'Weak'; }
    else if (score === 3) { bar.style.background = '#f39c12'; label.textContent = 'Medium'; }
    else { bar.style.background = '#27ae60'; label.textContent = 'Strong'; }
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

/**
 * Show a friendly recovery key modal
 * @param {string} key - Recovery key to display
 */
function showRecoveryModal(key) {
  const modal = document.getElementById('recovery-modal');
  const keyBox = document.getElementById('rk-key');
  const btnCopy = document.getElementById('rk-copy');
  const btnDl = document.getElementById('rk-download');
  const btnClose = document.getElementById('rk-close');

  if (!modal || !keyBox) return alert('Recovery key: ' + key);

  keyBox.textContent = key;
  modal.hidden = false;

  const copy = async () => {
    try { await navigator.clipboard.writeText(key); btnCopy.textContent = 'Copied!'; setTimeout(()=>btnCopy.textContent='Copy', 1200); } catch {}
  };
  const download = () => {
    const blob = new Blob([
      'Workforce Democracy Project — Recovery Key\n',
      'Generated: ' + new Date().toISOString() + '\n\n',
      key + '\n'
    ], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wdp-recovery-key.txt';
    document.body.appendChild(a); a.click(); a.remove();
  };
  const close = () => { modal.hidden = true; };

  btnCopy.onclick = copy;
  btnDl.onclick = download;
  btnClose.onclick = close;
  modal.addEventListener('click', (e)=>{ if (e.target === modal) close(); });
  document.addEventListener('keydown', function esc(e){ if (e.key==='Escape'){ close(); document.removeEventListener('keydown', esc);} });
}

// Make function globally accessible
window.showRecoveryModal = showRecoveryModal;
