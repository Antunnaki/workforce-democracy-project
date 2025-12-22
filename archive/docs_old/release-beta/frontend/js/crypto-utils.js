/**
 * CRYPTO UTILITIES - Zero-Knowledge Encryption
 * Version: 38.0.0-PERSONALIZATION
 * Date: January 15, 2025
 * 
 * Provides client-side encryption for user data using Web Crypto API.
 * Zero-knowledge architecture: server never sees unencrypted data or password.
 * 
 * Security Features:
 * - AES-256-GCM encryption
 * - PBKDF2 key derivation (100,000 iterations)
 * - Random salt per user
 * - Random IV per encryption
 * 
 * Privacy Guarantees:
 * - Password never leaves device
 * - Server stores only encrypted blobs
 * - No way to decrypt without user's password
 */

const CryptoUtils = {
  /**
   * Derive encryption key from password using PBKDF2
   * @param {string} password - User's password
   * @param {string} saltHex - Salt in hex format (generated once per user)
   * @returns {Promise<CryptoKey>} - Derived encryption key
   */
  async deriveKey(password, saltHex) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const salt = this.hexToBuffer(saltHex);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive AES-256-GCM key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  },

  /**
   * Generate random salt for new user
   * @returns {string} - Salt in hex format
   */
  generateSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return this.bufferToHex(salt);
  },

  /**
   * Generate random recovery key (64 characters)
   * @returns {string} - Recovery key in hex format
   */
  generateRecoveryKey() {
    const key = crypto.getRandomValues(new Uint8Array(32));
    return this.bufferToHex(key);
  },

  /**
   * Encrypt user data object
   * @param {Object} data - User's personalization data
   * @param {string} password - User's password
   * @param {string} saltHex - User's salt
   * @returns {Promise<Object>} - { encrypted: base64, iv: hex }
   */
  async encrypt(data, password, saltHex) {
    try {
      const key = await this.deriveKey(password, saltHex);
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(data);
      const dataBuffer = encoder.encode(dataString);
      
      // Generate random IV for this encryption
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        dataBuffer
      );
      
      return {
        encrypted: this.bufferToBase64(encryptedBuffer),
        iv: this.bufferToHex(iv)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  },

  /**
   * Decrypt user data
   * @param {string} encryptedBase64 - Encrypted data in base64
   * @param {string} ivHex - Initialization vector in hex
   * @param {string} password - User's password
   * @param {string} saltHex - User's salt
   * @returns {Promise<Object>} - Decrypted user data object
   */
  async decrypt(encryptedBase64, ivHex, password, saltHex) {
    try {
      const key = await this.deriveKey(password, saltHex);
      const encryptedBuffer = this.base64ToBuffer(encryptedBase64);
      const iv = this.hexToBuffer(ivHex);
      
      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encryptedBuffer
      );
      
      const decoder = new TextDecoder();
      const dataString = decoder.decode(decryptedBuffer);
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Invalid password or corrupted data');
    }
  },

  /**
   * Hash password for client-side verification (not sent to server)
   * @param {string} password - User's password
   * @returns {Promise<string>} - Hashed password in hex
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  },

  /**
   * Verify password against stored hash
   * @param {string} password - Password to verify
   * @param {string} storedHash - Previously hashed password
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(password, storedHash) {
    const hash = await this.hashPassword(password);
    return hash === storedHash;
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Convert ArrayBuffer to hex string
   */
  bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Convert hex string to ArrayBuffer
   */
  hexToBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  },

  /**
   * Convert ArrayBuffer to base64 string
   */
  bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  /**
   * Convert base64 string to ArrayBuffer
   */
  base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  },

  /**
   * Generate secure random string for IDs
   * @param {number} length - Length of random string
   * @returns {string} - Random hex string
   */
  generateId(length = 16) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return this.bufferToHex(bytes);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain number');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CryptoUtils;
}
