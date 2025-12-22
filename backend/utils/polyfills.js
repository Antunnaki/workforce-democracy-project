/**
 * WORKFORCE DEMOCRACY PROJECT - Node.js Polyfills
 * 
 * Centralized polyfills for Node.js environments.
 * Specifically handles the missing 'File' object in Node.js < 20
 * which is required by some versions of axios and form-data.
 */

// 1. File Polyfill
if (typeof global.File === 'undefined') {
    try {
        // Try to get File from buffer (Node.js 18+)
        const { File } = require('buffer');
        if (File) {
            global.File = File;
            console.log('✅ global.File polyfilled from buffer');
        } else {
            throw new Error('File not in buffer');
        }
    } catch (e) {
        // Fallback: minimal File mock
        global.File = class File extends Blob {
            constructor(parts, filename, options = {}) {
                super(parts, options);
                this.name = filename;
                this.lastModified = options.lastModified || Date.now();
            }
        };
        console.log('⚠️ global.File polyfilled with minimal mock');
    }
}

// 2. Blob Polyfill (if needed)
if (typeof global.Blob === 'undefined') {
    try {
        const { Blob } = require('buffer');
        global.Blob = Blob;
        console.log('✅ global.Blob polyfilled from buffer');
    } catch (e) {
        console.log('❌ global.Blob polyfill failed');
    }
}

module.exports = {
    applied: true,
    timestamp: new Date().toISOString()
};
