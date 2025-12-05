/**
 * SYNC MANAGER - Auto-sync and Conflict Resolution
 * Version: 1.0.0-PERSONALIZATION
 * Date: January 15, 2025
 * 
 * Handles automatic synchronization between devices
 * Uses session-based encryption key for seamless sync
 * No password re-prompts needed
 */

class SyncManager {
  constructor(personalizationSystem) {
    this.ps = personalizationSystem;
    this.apiBase = personalizationSystem.apiBase;
    this.syncInterval = 30000; // 30 seconds
    this.syncTimer = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.sessionKey = null; // Temporary encryption key stored in memory
  }

  /**
   * Initialize sync manager with session key
   * @param {string} password - User's password (only during login/register)
   */
  async initSession(password) {
    const auth = this.ps.getAuth();
    if (!auth) return;

    // Derive and store encryption key in memory (session only)
    this.sessionKey = await CryptoUtils.deriveKey(password, auth.salt);
    
    // Start auto-sync
    this.startAutoSync();
    
    // Sync immediately
    await this.syncNow();
  }

  /**
   * Clear session (on logout)
   */
  clearSession() {
    this.sessionKey = null;
    this.stopAutoSync();
  }

  /**
   * Start automatic sync timer
   */
  startAutoSync() {
    if (this.syncTimer) return;

    this.syncTimer = setInterval(() => {
      if (navigator.onLine && this.sessionKey) {
        this.syncNow();
      }
    }, this.syncInterval);

    // Listen for online/offline events
    window.addEventListener('online', () => this.syncNow());
  }

  /**
   * Stop automatic sync timer
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Sync now (manual trigger)
   */
  async syncNow() {
    if (this.isSyncing || !this.sessionKey || !this.ps.isLoggedIn()) {
      return;
    }

    this.isSyncing = true;

    try {
      const auth = this.ps.getAuth();
      
      // Encrypt current user data
      const encryptedData = await this.encryptWithSessionKey(this.ps.userData);

      // Send to server
      const response = await fetch(`${this.apiBase}/sync`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: auth.username,
          encrypted_data: encryptedData,
          last_sync: this.ps.userData.updated_at
        })
      });

      const result = await response.json();

      if (response.ok) {
        this.lastSyncTime = Date.now();
        this.ps.pendingChanges = false;

        // Check if server has newer data
        if (result.server_data_newer && result.encrypted_data) {
          await this.handleServerUpdate(result.encrypted_data);
        }

        // Dispatch sync success event
        document.dispatchEvent(new CustomEvent('syncComplete', {
          detail: { success: true, timestamp: this.lastSyncTime }
        }));

      } else {
        console.error('Sync failed:', result.error);
        this.handleSyncError(result.error);
      }

    } catch (error) {
      console.error('Sync error:', error);
      this.handleSyncError(error.message);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Encrypt data using session key
   * @param {object} data
   * @returns {Promise<string>}
   */
  async encryptWithSessionKey(data) {
    try {
      // Generate random IV
      const iv = new Uint8Array(12);
      crypto.getRandomValues(iv);

      // Convert data to JSON then to ArrayBuffer
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));

      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        this.sessionKey,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);

      return CryptoUtils.arrayBufferToBase64(combined);
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  /**
   * Decrypt data using session key
   * @param {string} encryptedData
   * @returns {Promise<object>}
   */
  async decryptWithSessionKey(encryptedData) {
    try {
      // Decode base64
      const combined = CryptoUtils.base64ToArrayBuffer(encryptedData);
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        this.sessionKey,
        data
      );

      // Convert to string then parse JSON
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decrypted);
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  /**
   * Handle server data update
   * @param {string} encryptedData
   */
  async handleServerUpdate(encryptedData) {
    try {
      const serverData = await this.decryptWithSessionKey(encryptedData);
      
      // Merge with local data
      const mergedData = this.ps.smartMerge(this.ps.userData, serverData);
      
      // Update local data
      this.ps.userData = mergedData;
      this.ps.saveUserDataLocally();

      console.log('Server data merged successfully');

    } catch (error) {
      console.error('Failed to merge server data:', error);
    }
  }

  /**
   * Handle sync errors
   * @param {string} error
   */
  handleSyncError(error) {
    // Dispatch sync error event
    document.dispatchEvent(new CustomEvent('syncError', {
      detail: { error, timestamp: Date.now() }
    }));

    // Show user-friendly error message
    if (error.includes('network') || error.includes('offline')) {
      console.log('Sync will retry when back online');
    } else {
      console.error('Sync error:', error);
    }
  }

  /**
   * Force sync (for user-triggered sync)
   */
  async forceSyncNow() {
    if (!this.sessionKey) {
      throw new Error('No active session - please log in again');
    }

    await this.syncNow();
    return { success: true, timestamp: this.lastSyncTime };
  }

  /**
   * Get sync status
   * @returns {object}
   */
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      hasSession: !!this.sessionKey,
      isOnline: navigator.onLine,
      hasPendingChanges: this.ps.pendingChanges
    };
  }

  /**
   * Show sync status in UI
   */
  showSyncStatus() {
    const status = this.getSyncStatus();
    const statusEl = document.getElementById('sync-status');
    
    if (!statusEl) return;

    if (status.isSyncing) {
      statusEl.textContent = '🔄 Syncing...';
      statusEl.className = 'sync-status syncing';
    } else if (!status.isOnline) {
      statusEl.textContent = '📴 Offline';
      statusEl.className = 'sync-status offline';
    } else if (status.lastSyncTime) {
      const timeAgo = this.getTimeAgo(status.lastSyncTime);
      statusEl.textContent = `✓ Synced ${timeAgo}`;
      statusEl.className = 'sync-status synced';
    } else {
      statusEl.textContent = '⚠️ Not synced';
      statusEl.className = 'sync-status not-synced';
    }
  }

  /**
   * Get time ago string
   * @param {number} timestamp
   * @returns {string}
   */
  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 7200) return '1 hour ago';
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  /**
   * Estimate data size
   * @returns {string} Human-readable size
   */
  getDataSize() {
    const bytes = CryptoUtils.estimateSize(this.ps.userData);
    
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// Initialize sync manager (will be used by personalization system)
let syncManager = null;

// Listen for personalization state changes to create sync manager
document.addEventListener('personalizationStateChanged', (event) => {
  if (event.detail.isLoggedIn && !syncManager) {
    syncManager = new SyncManager(personalization);
  } else if (!event.detail.isLoggedIn && syncManager) {
    syncManager.clearSession();
    syncManager = null;
  }
});

// Update sync status every 5 seconds
setInterval(() => {
  if (syncManager) {
    syncManager.showSyncStatus();
  }
}, 5000);
