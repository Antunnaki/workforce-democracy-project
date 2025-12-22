/**
 * PERSONALIZATION SYSTEM - Core Logic
 * Version: 37.11.9-SYNC-CLEANUP
 * Date: November 19, 2024
 * 
 * Manages user personalization with zero-knowledge encryption.
 * All personal data encrypted client-side before sync to server.
 * 
 * Features:
 * - One-time setup wizard
 * - Auto-save all personalization data
 * - Cross-device sync
 * - Offline support
 * - Privacy-first architecture
 * - 🔥 FIRE BUTTON SUPPORT: Session persistence via backend cookies
 */

const PersonalizationSystem = {
  // API Configuration
  API_BASE: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api/personalization'
    : 'https://api.workforcedemocracyproject.org/api/personalization',
  
  // Session password (kept in memory for re-encryption during sync)
  // NOTE: This is cleared on logout and tab close
  sessionPassword: null,
  
  // LocalStorage keys
  STORAGE_KEYS: {
    USERNAME: 'wdp_username',
    PASSWORD_HASH: 'wdp_password_hash',
    SALT: 'wdp_salt',
    USER_DATA: 'wdp_user_data',
    RECOVERY_KEY: 'wdp_recovery_key',
    LAST_SYNC: 'wdp_last_sync',
    OFFLINE_CHANGES: 'wdp_offline_changes'
  },

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize personalization system on page load
   */
  async init() {
    console.log('🔐 Initializing Personalization System...');
    
    // Debug: Check all localStorage keys
    console.log('📊 localStorage keys check:');
    console.log('  - wdp_username:', localStorage.getItem(this.STORAGE_KEYS.USERNAME));
    console.log('  - wdp_password_hash:', localStorage.getItem(this.STORAGE_KEYS.PASSWORD_HASH) ? 'EXISTS' : 'MISSING');
    console.log('  - wdp_salt:', localStorage.getItem(this.STORAGE_KEYS.SALT) ? 'EXISTS' : 'MISSING');
    console.log('  - wdp_user_data:', localStorage.getItem(this.STORAGE_KEYS.USER_DATA) ? 'EXISTS' : 'MISSING');
    
    // Check if user is already logged in via localStorage
    let username = localStorage.getItem(this.STORAGE_KEYS.USERNAME);
    
    if (username) {
      console.log('✅ User logged in:', username);
      
      // V37.12.0: Set backward compatibility flags for old code
      localStorage.setItem('wdp_personalization_enabled', 'true');
      
      // User data already in localStorage, just apply personalization
      this.applyPersonalization();
      this.startAutoSync();
      this.showAccountIndicator(username);
      
      // V37.12.3: Notify other modules that user is logged in
      window.dispatchEvent(new CustomEvent('personalization:ready', {
        detail: { username, loggedIn: true }
      }));
      console.log('📢 [PersonalizationSystem] Dispatched personalization:ready event');
    } else {
      // Try to restore from backend session (Fire button recovery)
      console.log('🔍 Checking for backend session...');
      const restored = await this.restoreFromSession();
      
      if (restored) {
        console.log('✅ Session restored from backend!');
        username = localStorage.getItem(this.STORAGE_KEYS.USERNAME);
        // User data already restored to localStorage, just apply personalization
        this.applyPersonalization();
        this.startAutoSync();
        this.showAccountIndicator(username);
        
        // Show brief notification
        this.showNotification('Session restored! Your data is safe.', 'success');
      } else {
        console.log('👋 No user logged in');
        console.log('👋 Show welcome banner');
        this.showWelcomeBanner();
      }
    }
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!localStorage.getItem(this.STORAGE_KEYS.USERNAME);
  },

  /**
   * Get current username
   */
  getUsername() {
    return localStorage.getItem(this.STORAGE_KEYS.USERNAME);
  },

  // ============================================
  // USER REGISTRATION
  // ============================================

  /**
   * Validate username on client side
   * @param {string} u - Username to validate
   * @returns {Object} - { ok: boolean, msg?: string }
   */
  function validateUsernameClient(u) {
    if (!u || typeof u !== 'string') return { ok: false, msg: 'Username is required' };
    const trimmed = u.trim();
    if (trimmed.length < 3) return { ok: false, msg: 'Username must be at least 3 characters' };
    if (trimmed.length > 50) return { ok: false, msg: 'Username must be 50 characters or less' };
    if (!/^[a-zA-Z]/.test(trimmed)) return { ok: false, msg: 'Username must start with a letter' };
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { ok: false, msg: 'Only letters, numbers, underscores, and hyphens are allowed' };
    }
    if (/^(admin|test|root|sys|support)(\d+)?$/i.test(trimmed)) {
      return { ok: false, msg: 'Please choose a different username' };
    }
    return { ok: true };
  }

  /**
   * Register new user account (zero‑knowledge encryption)
   * @param {string} username
   * @param {string} password
   * @param {Object} [options]
   * @param {string|null} [options.email] Optional email for recovery delivery
   * @returns {Promise<Object>} - { success: boolean, recoveryKey?, error? }
   */
  async register(username, password, options = {}) {
    try {
      // Validate inputs
      const u = validateUsernameClient(username);
      if (!u.ok) throw new Error(u.msg);
      
      const passwordValidation = CryptoUtils.validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors[0]);
      }
      
      // Generate salt and recovery key
      const salt = CryptoUtils.generateSalt();
      const recoveryKey = CryptoUtils.generateRecoveryKey();
      
      // Hash password for local storage (not sent to server)
      const passwordHash = await CryptoUtils.hashPassword(password);
      
      // Create initial user data structure
      const initialData = this.createEmptyUserData();
      
      // Encrypt user data
      const { encrypted, iv } = await CryptoUtils.encrypt(initialData, password, salt);
      
      // Register with server
      const response = await fetch(`${this.API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: Allow cookies
        body: JSON.stringify({
          username,
          encrypted_data: encrypted,
          iv,
          encryption_salt: salt,
          recovery_hash: await CryptoUtils.hashPassword(recoveryKey),
          // Include optional email only if provided and non-empty
          ...(options.email ? { email: options.email } : {})
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }
      
      // Store password in memory for session (needed for re-encryption during sync)
      this.sessionPassword = password;
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEYS.USERNAME, username);
      localStorage.setItem(this.STORAGE_KEYS.PASSWORD_HASH, passwordHash);
      localStorage.setItem(this.STORAGE_KEYS.SALT, salt);
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(initialData));
      localStorage.setItem(this.STORAGE_KEYS.RECOVERY_KEY, recoveryKey);
      localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      console.log('✅ Registration successful');
      console.log('🔒 Session cookie set - you can use Fire button and still stay logged in!');
      console.log('💡 TIP: When you use Fire button, you\'ll be prompted for your password to decrypt your data');
      
      // V37.12.0: Set backward compatibility flags for old code
      localStorage.setItem('wdp_personalization_enabled', 'true');
      console.log('✅ Backward compatibility flags set for legacy code');
      
      // Store session token in URL hash as extra fallback
      if (result.session_token) {
        this.storeSessionTokenInURL(result.session_token);
      }
      
      // V37.12.6: Notify other modules that user is now registered/logged in
      window.dispatchEvent(new CustomEvent('personalization:ready', {
        detail: { username, loggedIn: true }
      }));
      console.log('📢 [PersonalizationSystem V37.12.6] Dispatched personalization:ready event after registration');
      
      return {
        success: true,
        recoveryKey: recoveryKey
      };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Initialize local‑only account (no network requests)
   * Stores minimal profile and encryption metadata locally.
   * @param {string} localPass
   */
  async localOnlyInit(localPass) {
    const alias = 'user-' + Math.random().toString(36).slice(2, 8);
    const salt = CryptoUtils.generateSalt();
    const recoveryKey = CryptoUtils.generateRecoveryKey();
    const passwordHash = await CryptoUtils.hashPassword(localPass);
    const initialData = this.createEmptyUserData();
    // Keep parity with existing applyPersonalization expectations
    // (user data is stored as JSON locally; encryption is applied for sync payloads)
    await CryptoUtils.encrypt(initialData, localPass, salt); // derive key once; result not stored

    this.sessionPassword = localPass;
    localStorage.setItem(this.STORAGE_KEYS.USERNAME, alias);
    localStorage.setItem(this.STORAGE_KEYS.PASSWORD_HASH, passwordHash);
    localStorage.setItem(this.STORAGE_KEYS.SALT, salt);
    localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(initialData));
    localStorage.setItem(this.STORAGE_KEYS.RECOVERY_KEY, recoveryKey);
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

    // Apply personalization immediately
    this.applyPersonalization();
    this.showAccountIndicator(alias);
    window.dispatchEvent(new CustomEvent('personalization:ready', {
      detail: { username: alias, loggedIn: true }
    }));
  },

  // ============================================
  // USER LOGIN
  // ============================================

  /**
   * Login existing user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>} - { success: boolean, error? }
   */
  async login(username, password) {
    try {
      // Fetch encrypted data from server
      const response = await fetch(`${this.API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: Allow cookies
        body: JSON.stringify({ username })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      const { encrypted_data, iv, encryption_salt } = result;
      
      // Try to decrypt data with provided password
      let userData;
      try {
        userData = await CryptoUtils.decrypt(encrypted_data, iv, password, encryption_salt);
      } catch (decryptError) {
        throw new Error('Invalid username or password');
      }
      
      // Store password in memory for session (needed for re-encryption during sync)
      this.sessionPassword = password;
      
      // Hash password for local storage
      const passwordHash = await CryptoUtils.hashPassword(password);
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEYS.USERNAME, username);
      localStorage.setItem(this.STORAGE_KEYS.PASSWORD_HASH, passwordHash);
      localStorage.setItem(this.STORAGE_KEYS.SALT, encryption_salt);
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, result.last_sync || new Date().toISOString());
      
      console.log('✅ Login successful');
      console.log('🔒 Session cookie set - you can use Fire button and still stay logged in!');
      
      // V37.12.0: Set backward compatibility flags for old code
      localStorage.setItem('wdp_personalization_enabled', 'true');
      console.log('✅ Backward compatibility flags set for legacy code');
      
      // Store session token in URL hash as extra fallback
      if (result.session_token) {
        this.storeSessionTokenInURL(result.session_token);
      }
      
      // Apply personalization immediately
      this.applyPersonalization();
      this.startAutoSync();
      
      // V37.12.6: Notify other modules that user is now logged in
      window.dispatchEvent(new CustomEvent('personalization:ready', {
        detail: { username, loggedIn: true }
      }));
      console.log('📢 [PersonalizationSystem V37.12.6] Dispatched personalization:ready event after login');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ============================================
  // SESSION RECOVERY (Fire Button Support)
  // ============================================

  /**
   * Restore session from backend after Fire button / cache clear
   * @returns {Promise<boolean>} - True if session restored successfully
   */
  async restoreFromSession() {
    try {
      const response = await fetch(`${this.API_BASE}/session`, {
        method: 'GET',
        credentials: 'include' // Important: Send cookies
      });

      if (!response.ok) {
        // No valid session
        return false;
      }

      const data = await response.json();
      
      if (!data.success || !data.username) {
        return false;
      }

      console.log('🔄 Restoring session for:', data.username);
      
      // We have encrypted data from backend, but we need the password to decrypt
      // Store the encrypted data and prompt for password
      this.pendingSessionRestore = {
        username: data.username,
        encrypted_data: data.encrypted_data,
        iv: data.iv,
        encryption_salt: data.encryption_salt
      };
      
      // Show password prompt to decrypt
      return await this.promptForPasswordToRestore();
      
    } catch (error) {
      console.warn('⚠️ Session restore failed:', error.message);
      return false;
    }
  },

  /**
   * Prompt user for password to decrypt restored session
   * @returns {Promise<boolean>}
   */
  async promptForPasswordToRestore() {
    return new Promise((resolve) => {
      // Show a simple prompt (in production, use a nicer modal)
      const password = prompt(
        `Welcome back, ${this.pendingSessionRestore.username}!\n\n` +
        `Enter your password to restore your session:\n\n` +
        `(Your data was safely encrypted on our server)`
      );
      
      if (!password) {
        console.log('❌ User cancelled password prompt');
        this.pendingSessionRestore = null;
        resolve(false);
        return;
      }
      
      // Try to decrypt with provided password
      this.decryptAndRestoreSession(password).then(success => {
        this.pendingSessionRestore = null;
        resolve(success);
      });
    });
  },

  /**
   * Decrypt session data and restore to localStorage
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  async decryptAndRestoreSession(password) {
    try {
      const { username, encrypted_data, iv, encryption_salt } = this.pendingSessionRestore;
      
      // Try to decrypt
      const userData = await CryptoUtils.decrypt(
        encrypted_data,
        iv,
        password,
        encryption_salt
      );
      
      if (!userData) {
        alert('❌ Incorrect password. Please try again.');
        return false;
      }
      
      // Store password in memory for session (needed for re-encryption during sync)
      this.sessionPassword = password;
      
      // Generate password hash for storage
      const passwordHash = await CryptoUtils.hashPassword(password);
      
      // Restore to localStorage
      localStorage.setItem(this.STORAGE_KEYS.USERNAME, username);
      localStorage.setItem(this.STORAGE_KEYS.PASSWORD_HASH, passwordHash);
      localStorage.setItem(this.STORAGE_KEYS.SALT, encryption_salt);
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      console.log('✅ Session restored successfully!');
      console.log('💡 TIP: Use normal refresh (F5) instead of Fire button to stay logged in');
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to decrypt session:', error);
      alert('❌ Failed to restore session. Please log in manually.');
      return false;
    }
  },

  /**
   * Store session token in URL hash (fallback for Fire button)
   * @param {string} token
   */
  storeSessionTokenInURL(token) {
    // Only store if URL doesn't already have a token
    if (!window.location.hash.includes('session=')) {
      window.location.hash = `session=${token}`;
      console.log('🔗 Session token stored in URL (backup)');
    }
  },

  /**
   * Get session token from URL hash
   * @returns {string|null}
   */
  getSessionTokenFromURL() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('session');
  },

  /**
   * Show a brief notification to user
   * @param {string} message
   * @param {string} type - 'success', 'error', 'info'
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `personalization-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  },

  // ============================================
  // USER LOGOUT
  // ============================================

  /**
   * Logout current user
   */
  async logout() {
    // Sync any pending changes before logout
    if (navigator.onLine) {
      await this.syncToServer();
    }
    
    // Clear session password from memory
    this.sessionPassword = null;
    
    // Clear localStorage (keep recovery key for reference)
    const recoveryKey = localStorage.getItem(this.STORAGE_KEYS.RECOVERY_KEY);
    
    Object.values(this.STORAGE_KEYS).forEach(key => {
      if (key !== this.STORAGE_KEYS.RECOVERY_KEY) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('👋 Logged out');
    
    // Reload page to reset state
    window.location.reload();
  },

  // ============================================
  // DATA MANAGEMENT
  // ============================================

  /**
   * Create empty user data structure
   */
  createEmptyUserData() {
    return {
      // Address & Location
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      
      // Congressional Districts
      district: {
        congressional: '',
        state_house: '',
        state_senate: ''
      },
      
      // Representatives
      representatives: {
        house: null,
        senate: [],
        state: []
      },
      
      // Preferences
      preferences: {
        language: 'en',
        theme: 'auto',
        notifications: true
      },
      
      // Activity Data
      bills_voted: [],
      faq_bookmarks: [],
      learning_progress: {},
      
      // Dashboard Stats
      stats: {
        total_votes: 0,
        alignment_score: 0,
        last_active: new Date().toISOString()
      },
      
      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  /**
   * Get user data from localStorage
   */
  getUserData() {
    const dataStr = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
    return dataStr ? JSON.parse(dataStr) : this.createEmptyUserData();
  },

  /**
   * Update user data in localStorage
   */
  setUserData(data) {
    data.updated_at = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    
    // Trigger auto-sync after short delay (debounced)
    this.scheduleSyncToServer();
  },

  /**
   * Update specific field in user data
   * @param {string} path - Dot notation path (e.g., 'address.zip')
   * @param {any} value - New value
   */
  updateField(path, value) {
    const data = this.getUserData();
    const keys = path.split('.');
    let current = data;
    
    // Navigate to parent object
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    // Set value
    current[keys[keys.length - 1]] = value;
    
    this.setUserData(data);
    console.log(`📝 Updated ${path}:`, value);
  },

  /**
   * Get specific field from user data
   * @param {string} path - Dot notation path
   * @returns {any} - Field value
   */
  getField(path) {
    const data = this.getUserData();
    const keys = path.split('.');
    let current = data;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  },

  /**
   * V37.12.5: Backward compatibility alias
   * Some older code calls setUserDataField instead of updateField
   */
  setUserDataField(path, value) {
    console.warn('[PersonalizationSystem] setUserDataField is deprecated, use updateField instead');
    return this.updateField(path, value);
  },

  // ============================================
  // SYNC MANAGEMENT
  // ============================================

  syncTimer: null,
  syncPending: false,

  /**
   * Schedule sync to server (debounced)
   */
  scheduleSyncToServer() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    
    this.syncTimer = setTimeout(() => {
      if (navigator.onLine) {
        this.syncToServer();
      } else {
        this.markOfflineChange();
      }
    }, 5000); // Sync 5 seconds after last change
  },

  /**
   * Sync user data to server
   */
  async syncToServer() {
    if (this.syncPending) return;
    
    try {
      this.syncPending = true;
      
      const username = this.getUsername();
      const salt = localStorage.getItem(this.STORAGE_KEYS.SALT);
      const userData = this.getUserData();
      
      if (!username || !salt || !userData) {
        console.warn('⚠️ Missing credentials, cannot sync');
        return;
      }
      
      // Check if we have password in memory for encryption
      if (!this.sessionPassword) {
        // Silent return - this is expected after page refresh
        // Password is intentionally NOT stored (security feature)
        return;
      }
      
      console.log('🔄 Syncing to server...');
      
      // Re-encrypt user data before sending to backend
      const { encrypted, iv } = await CryptoUtils.encrypt(userData, this.sessionPassword, salt);
      
      const response = await fetch(`${this.API_BASE}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          encrypted_data: encrypted,  // ✅ Now properly encrypted base64
          iv: iv,  // ✅ Include new IV
          last_sync: localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC) || new Date().toISOString()
        })
      });
      
      if (response.ok) {
        localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        console.log('✅ Sync complete');
      } else {
        console.error('❌ Sync failed:', await response.text());
      }
      
    } catch (error) {
      console.error('❌ Sync error:', error);
      this.markOfflineChange();
    } finally {
      this.syncPending = false;
    }
  },

  /**
   * Start automatic sync interval
   * Only runs if sessionPassword is available
   */
  startAutoSync() {
    // Only start auto-sync if we have sessionPassword in memory
    // After page refresh, password is not in memory (security feature)
    if (!this.sessionPassword) {
      console.log('ℹ️ Background sync disabled (password not in memory)');
      console.log('💡 Data is safe in localStorage. Sync will resume after next login.');
      return;
    }
    
    // Sync every 30 seconds if online and has changes
    setInterval(() => {
      if (navigator.onLine && this.getUserData()) {
        this.syncToServer();
      }
    }, 30000);
  },

  /**
   * Mark that offline changes exist
   */
  markOfflineChange() {
    localStorage.setItem(this.STORAGE_KEYS.OFFLINE_CHANGES, 'true');
  },

  /**
   * Handle coming back online
   */
  async handleOnline() {
    console.log('🌐 Back online');
    const hasOfflineChanges = localStorage.getItem(this.STORAGE_KEYS.OFFLINE_CHANGES);
    
    if (hasOfflineChanges) {
      console.log('📤 Syncing offline changes...');
      await this.syncToServer();
      localStorage.removeItem(this.STORAGE_KEYS.OFFLINE_CHANGES);
    }
  },

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('📴 Offline mode');
    // Data still works, just saved locally
  },

  // ============================================
  // UI INTEGRATION
  // ============================================

  /**
   * Apply personalization to page
   */
  applyPersonalization() {
    const data = this.getUserData();
    
    // Apply language
    if (data.preferences.language !== 'en') {
      // Trigger language change
      document.documentElement.lang = data.preferences.language;
    }
    
    // Auto-fill location fields if they exist
    if (data.address.zip) {
      const zipInputs = document.querySelectorAll('input[name="zip"], input[id*="zip"]');
      zipInputs.forEach(input => {
        if (!input.value) {
          input.value = data.address.zip;
        }
      });
    }
    
    // Load representatives if available
    if (data.representatives.house) {
      window.dispatchEvent(new CustomEvent('personalization:representatives-loaded', {
        detail: data.representatives
      }));
    }
    
    console.log('✨ Personalization applied');
  },

  /**
   * Show welcome banner for new users
   */
  showWelcomeBanner() {
    console.log('👋 Show welcome banner');
    // Delay to ensure DOM is fully ready
    setTimeout(() => {
      const banner = document.getElementById('welcome-banner');
      if (banner) {
        banner.style.display = 'block';
        console.log('✅ Welcome banner displayed!');
      } else {
        console.error('❌ Welcome banner element not found! Looking for id="welcome-banner"');
      }
    }, 100);
  },

  /**
   * Show account indicator in header
   */
  showAccountIndicator(username) {
    console.log('👤 Logged in as:', username);
    // Hide welcome banner if user is logged in
    const banner = document.getElementById('welcome-banner');
    if (banner) {
      banner.style.display = 'none';
    }
    // UI implementation in personalization-ui.js will handle account indicator display
  },

  // ============================================
  // DATA EXPORT & DELETE
  // ============================================

  /**
   * Export all user data as JSON
   */
  exportData() {
    const data = this.getUserData();
    const username = this.getUsername();
    
    const exportData = {
      username: username,
      exported_at: new Date().toISOString(),
      data: data
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workforce-democracy-data-${username}-${Date.now()}.json`;
    a.click();
    
    console.log('📥 Data exported');
  },

  /**
   * Delete account completely
   */
  async deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return { success: false, cancelled: true };
    }
    
    try {
      const username = this.getUsername();
      
      const response = await fetch(`${this.API_BASE}/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account from server');
      }
      
      // Clear all local data
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🗑️ Account deleted');
      
      // Reload page
      window.location.reload();
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// AUTO-INITIALIZATION REMOVED - Nov 16, 2025
// Reason: Triple initialization conflict causing banner to disappear
// Now initialized only once from index.html (line 3414-3416)
// 
// OLD CODE (causing conflict):
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', () => PersonalizationSystem.init());
// } else {
//   PersonalizationSystem.init();
// }
//
// Fix: Manual initialization in index.html provides single init point

// ============================================
// EXPOSE TO WINDOW (V37.12.2 - CRITICAL FIX!)
// ============================================

// This allows other modules (bills-section.js, rep-finder.js, etc.) to access PersonalizationSystem
window.PersonalizationSystem = PersonalizationSystem;

console.log('✅ [PersonalizationSystem V37.12.2] Exposed on window object - other modules can now access it');
