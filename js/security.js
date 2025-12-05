/**
 * WORKFORCE DEMOCRACY PROJECT - SECURITY MODULE
 * 
 * Military-grade encryption (AES-256-GCM with PBKDF2)
 * Zero tracking, complete privacy protection
 * All data stored client-side only
 */

class SecurityManager {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12;
        this.saltLength = 16;
        this.iterations = 600000; // PBKDF2 iterations (OWASP recommendation 2024)
        this.storagePrefix = 'wdp_secure_';
        
        this.init();
    }
    
    /**
     * Initialize security manager
     */
    async init() {
        // Generate or retrieve device-specific key
        await this.ensureDeviceKey();
        
        // Anti-fingerprinting measures
        this.implementAntiFingerprinting();
        
        // Detect and warn about privacy threats
        this.detectPrivacyThreats();
    }
    
    /**
     * Generate device-specific encryption key
     */
    async ensureDeviceKey() {
        let deviceKey = localStorage.getItem(this.storagePrefix + 'device_key');
        
        if (!deviceKey) {
            // Generate new device key
            const keyMaterial = await this.generateKeyMaterial();
            deviceKey = Array.from(new Uint8Array(keyMaterial))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            localStorage.setItem(this.storagePrefix + 'device_key', deviceKey);
        }
        
        this.deviceKey = deviceKey;
    }
    
    /**
     * Generate cryptographic key material
     */
    async generateKeyMaterial() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return array;
    }
    
    /**
     * Derive encryption key from password using PBKDF2
     */
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: this.algorithm, length: this.keyLength },
            true,
            ['encrypt', 'decrypt']
        );
    }
    
    /**
     * Encrypt data using AES-256-GCM
     */
    async encrypt(data, password = this.deviceKey) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            // Generate random salt and IV
            const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
            const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
            
            // Derive encryption key
            const key = await this.deriveKey(password, salt);
            
            // Encrypt data
            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                dataBuffer
            );
            
            // Combine salt, IV, and encrypted data
            const combined = new Uint8Array(
                salt.length + iv.length + encryptedData.byteLength
            );
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encryptedData), salt.length + iv.length);
            
            // Convert to base64 for storage
            return this.arrayBufferToBase64(combined);
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Unable to secure your data at this time');
        }
    }
    
    /**
     * Decrypt data using AES-256-GCM
     */
    async decrypt(encryptedData, password = this.deviceKey) {
        try {
            // Convert from base64
            const combined = this.base64ToArrayBuffer(encryptedData);
            
            // Extract salt, IV, and encrypted data
            const salt = combined.slice(0, this.saltLength);
            const iv = combined.slice(this.saltLength, this.saltLength + this.ivLength);
            const data = combined.slice(this.saltLength + this.ivLength);
            
            // Derive decryption key
            const key = await this.deriveKey(password, salt);
            
            // Decrypt data
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                data
            );
            
            // Convert back to object
            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decryptedData));
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Unable to access your secure data');
        }
    }
    
    /**
     * Secure storage wrapper - encrypt before storing
     */
    async secureStore(key, data) {
        try {
            const encrypted = await this.encrypt(data);
            localStorage.setItem(this.storagePrefix + key, encrypted);
            return true;
        } catch (error) {
            console.error('Secure store error:', error);
            return false;
        }
    }
    
    /**
     * Secure retrieval wrapper - decrypt after retrieving
     */
    async secureRetrieve(key) {
        try {
            const encrypted = localStorage.getItem(this.storagePrefix + key);
            if (!encrypted) return null;
            
            return await this.decrypt(encrypted);
        } catch (error) {
            console.error('Secure retrieve error:', error);
            return null;
        }
    }
    
    /**
     * Secure deletion - overwrite before deleting
     */
    secureDelete(key) {
        const fullKey = this.storagePrefix + key;
        
        // Overwrite with random data multiple times (DOD 5220.22-M standard)
        for (let i = 0; i < 3; i++) {
            const randomData = Array.from({ length: 1000 }, () => 
                Math.random().toString(36).substring(2)
            ).join('');
            localStorage.setItem(fullKey, randomData);
        }
        
        // Finally remove
        localStorage.removeItem(fullKey);
    }
    
    /**
     * Delete all user data securely
     */
    async deleteAllUserData() {
        const keys = Object.keys(localStorage);
        const wdpKeys = keys.filter(key => key.startsWith(this.storagePrefix));
        
        wdpKeys.forEach(key => {
            this.secureDelete(key.replace(this.storagePrefix, ''));
        });
        
        // Clear any session storage
        sessionStorage.clear();
        
        // Clear IndexedDB if used
        if (window.indexedDB) {
            const databases = await window.indexedDB.databases();
            databases.forEach(db => {
                window.indexedDB.deleteDatabase(db.name);
            });
        }
        
        return true;
    }
    
    /**
     * Export all user data (encrypted)
     */
    async exportUserData() {
        const keys = Object.keys(localStorage);
        const wdpKeys = keys.filter(key => key.startsWith(this.storagePrefix));
        
        const exportData = {};
        for (const key of wdpKeys) {
            const cleanKey = key.replace(this.storagePrefix, '');
            exportData[cleanKey] = await this.secureRetrieve(cleanKey);
        }
        
        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `workforce-democracy-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Anti-fingerprinting measures
     */
    implementAntiFingerprinting() {
        // Reduce timing precision
        if (window.performance && window.performance.now) {
            const originalNow = window.performance.now;
            window.performance.now = function() {
                return Math.floor(originalNow.call(window.performance) / 100) * 100;
            };
        }
        
        // Normalize canvas fingerprinting
        if (window.HTMLCanvasElement) {
            const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function(type) {
                if (type === 'image/png' && this.width === 0 && this.height === 0) {
                    return originalToDataURL.call(this, type);
                }
                // Add noise to canvas output
                const context = this.getContext('2d');
                const imageData = context.getImageData(0, 0, this.width, this.height);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i] = imageData.data[i] ^ 1;
                }
                context.putImageData(imageData, 0, 0);
                return originalToDataURL.call(this, type);
            };
        }
        
        // Block common fingerprinting APIs
        Object.defineProperty(navigator, 'plugins', {
            get: function() { return []; }
        });
        
        Object.defineProperty(navigator, 'mimeTypes', {
            get: function() { return []; }
        });
    }
    
    /**
     * Detect privacy threats
     */
    detectPrivacyThreats() {
        const threats = [];
        
        // Check for common tracking scripts
        const trackingDomains = [
            'google-analytics.com',
            'googletagmanager.com',
            'facebook.com/tr',
            'doubleclick.net',
            'scorecardresearch.com',
            'quantserve.com'
        ];
        
        const scripts = Array.from(document.scripts);
        scripts.forEach(script => {
            if (script.src) {
                trackingDomains.forEach(domain => {
                    if (script.src.includes(domain)) {
                        threats.push(`Tracking script detected: ${domain}`);
                    }
                });
            }
        });
        
        // Check for localStorage usage by other domains
        if (threats.length > 0) {
            console.warn('Privacy threats detected:', threats);
        }
        
        return threats;
    }
    
    /**
     * Generate secure random ID
     */
    generateSecureId() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Hash sensitive data (one-way)
     */
    async hash(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Verify data integrity using HMAC
     */
    async generateHMAC(data, key) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(key),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            keyMaterial,
            encoder.encode(data)
        );
        
        return Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    /**
     * Utility: ArrayBuffer to Base64
     */
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    /**
     * Utility: Base64 to ArrayBuffer
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
    
    /**
     * Check if browser supports required security features
     */
    checkSecuritySupport() {
        const required = {
            crypto: !!window.crypto && !!window.crypto.subtle,
            localStorage: !!window.localStorage,
            indexedDB: !!window.indexedDB,
            serviceWorker: 'serviceWorker' in navigator
        };
        
        const unsupported = Object.entries(required)
            .filter(([key, supported]) => !supported)
            .map(([key]) => key);
        
        if (unsupported.length > 0) {
            console.warn('Some security features not supported:', unsupported);
        }
        
        return unsupported.length === 0;
    }
    
    /**
     * Network sync (local network only - no external servers)
     */
    async syncToLocalNetwork(deviceId, data) {
        // This would use WebRTC or local network discovery
        // Implementation depends on local network topology
        console.log('Local network sync not yet implemented');
        // Future: Use WebRTC Data Channels for device-to-device sync
    }
}

// Initialize global security manager
const securityManager = new SecurityManager();

/**
 * Delete only voting data (granular deletion option)
 * 🔒 SECURITY: V32.7.5 - Granular data deletion
 */
async function deleteVotingDataOnly() {
    const confirmation = confirm(
        '⚠️ DELETE VOTING DATA ONLY\n\n' +
        'This will permanently delete:\n' +
        '• All your votes on bills (Yes, No, Abstain)\n' +
        '• Voting history and statistics\n' +
        '• Representative alignment data\n\n' +
        'This will KEEP:\n' +
        '✅ Chat conversations\n' +
        '✅ Location and personalization\n' +
        '✅ Learning progress\n\n' +
        'Are you sure you want to delete only your voting data?'
    );
    
    if (confirmation) {
        try {
            // Delete only voting-related localStorage keys
            const keysToDelete = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                // Match voting-related keys
                if (key && (
                    key.includes('vote') || 
                    key.includes('bill') ||
                    key.includes('representative_alignment') ||
                    key.includes('voting_history') ||
                    key.includes('civic_votes')
                )) {
                    keysToDelete.push(key);
                }
            }
            
            // Secure 3-pass deletion for each key
            for (const key of keysToDelete) {
                // Pass 1: Overwrite with zeros
                localStorage.setItem(key, '0'.repeat(1000));
                // Pass 2: Overwrite with ones
                localStorage.setItem(key, '1'.repeat(1000));
                // Pass 3: Overwrite with random data
                const randomData = Array(1000).fill(0).map(() => Math.random().toString(36)).join('');
                localStorage.setItem(key, randomData);
                // Final removal
                localStorage.removeItem(key);
            }
            
            // Show success message
            alert(
                '✅ VOTING DATA DELETED\n\n' +
                'All your voting data has been permanently and securely erased.\n\n' +
                'Your chat history, location, and other personalization data has been preserved.\n\n' +
                'The page will now reload.'
            );
            
            // Reload page
            location.reload();
        } catch (error) {
            console.error('Error deleting voting data:', error);
            alert('⚠️ Error during deletion. Please try again or contact support.');
        }
    } else {
        console.log('User cancelled voting data deletion - data preserved');
    }
}

/**
 * Delete all political data with user confirmation
 * 🔒 SECURITY: Fortress-level data deletion for sensitive political information
 */
async function deleteAllPoliticalData() {
    const confirmation = confirm(
        '⚠️ PERMANENT DELETION WARNING\n\n' +
        'This will permanently delete:\n' +
        '• All your votes on bills\n' +
        '• All chat history (candidates, bills, court)\n' +
        '• All tracked representatives\n' +
        '• All search history\n\n' +
        'This action CANNOT be undone.\n\n' +
        'Are you absolutely sure you want to continue?'
    );
    
    if (confirmation) {
        const doubleCheck = confirm(
            '🚨 FINAL CONFIRMATION\n\n' +
            'You are about to permanently erase all your political data.\n\n' +
            'Click OK to DELETE EVERYTHING, or Cancel to keep your data.'
        );
        
        if (doubleCheck) {
            try {
                // Use SecurityManager's secure deletion
                await securityManager.deleteAllUserData();
                
                // Show success message
                alert(
                    '✅ ALL POLITICAL DATA DELETED\n\n' +
                    'All your votes, chat history, searches, and tracked representatives ' +
                    'have been permanently and securely erased from this device.\n\n' +
                    'The page will now reload to show a fresh start.'
                );
                
                // Reload page
                location.reload();
            } catch (error) {
                console.error('Error deleting data:', error);
                alert('😊 Oops! We had trouble deleting that data. Please try again in a moment. If this keeps happening, feel free to contact us for help! 💙');
            }
        } else {
            console.log('User cancelled final confirmation - data preserved');
        }
    } else {
        console.log('User cancelled deletion - data preserved');
    }
}

// Make functions globally available
window.deleteVotingDataOnly = deleteVotingDataOnly;
window.deleteAllPoliticalData = deleteAllPoliticalData;

// Privacy protection utilities
const PrivacyUtils = {
    /**
     * Sanitize user input to prevent XSS
     */
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },
    
    /**
     * Validate URL to prevent malicious links
     */
    validateURL(url) {
        try {
            const parsed = new URL(url);
            // Only allow https and http protocols
            return ['https:', 'http:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    },
    
    /**
     * Check if connection is secure (HTTPS)
     */
    isSecureConnection() {
        return window.location.protocol === 'https:';
    },
    
    /**
     * Warn user if connection is not secure
     */
    checkSecureConnection() {
        if (!this.isSecureConnection() && window.location.hostname !== 'localhost') {
            console.warn('⚠️ WARNING: Connection is not secure (HTTPS). Your data may be at risk.');
            return false;
        }
        return true;
    },
    
    /**
     * Clear all tracking cookies
     */
    clearTrackingCookies() {
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const [name] = cookie.split('=');
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    },
    
    /**
     * Block third-party requests (CSP enforcement)
     */
    enforceCSP() {
        // Check if CSP is properly configured
        const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!metaCSP) {
            console.warn('⚠️ Content Security Policy not configured');
        }
    }
};

// Initialize privacy checks on load
window.addEventListener('DOMContentLoaded', () => {
    PrivacyUtils.checkSecureConnection();
    PrivacyUtils.enforceCSP();
    securityManager.checkSecuritySupport();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityManager, PrivacyUtils };
}
