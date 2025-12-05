/**
 * CACHE MANAGER
 * v37.0.0 - 7-day caching for expensive API calls and web scraping
 * 
 * Features:
 * - In-memory caching with TTL
 * - Persistent storage backup (filesystem)
 * - Automatic cleanup of expired entries
 * - Smart cache invalidation
 * - Compression for large data
 */

const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class CacheManager {
    constructor(options = {}) {
        this.cache = new Map();
        this.defaultTTL = options.ttl || (7 * 24 * 60 * 60 * 1000); // 7 days
        this.cacheDir = options.cacheDir || path.join(__dirname, '../../cache');
        this.maxMemorySize = options.maxMemorySize || 100 * 1024 * 1024; // 100MB
        this.currentMemorySize = 0;
        
        // Initialize cache directory
        this.initCacheDir();
        
        // Start cleanup interval (every hour)
        this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000);
        
        console.log('📦 Cache Manager initialized');
    }

    /**
     * Initialize cache directory
     */
    async initCacheDir() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
            console.log(`  ✅ Cache directory: ${this.cacheDir}`);
        } catch (error) {
            console.error('❌ Cache directory creation failed:', error.message);
        }
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {Promise<any>} - Cached data or null
     */
    async get(key) {
        // Check memory cache first
        if (this.cache.has(key)) {
            const cached = this.cache.get(key);
            
            // Check if expired
            if (Date.now() < cached.expiry) {
                console.log(`📦 Memory cache hit: ${key}`);
                return cached.data;
            } else {
                // Expired - remove from memory
                this.cache.delete(key);
                this.currentMemorySize -= this.estimateSize(cached.data);
            }
        }
        
        // Check persistent storage
        try {
            const filePath = this.getFilePath(key);
            const compressed = await fs.readFile(filePath);
            const buffer = await gunzip(compressed);
            const cached = JSON.parse(buffer.toString());
            
            // Check if expired
            if (Date.now() < cached.expiry) {
                console.log(`💾 Disk cache hit: ${key}`);
                
                // Load back into memory
                this.cache.set(key, cached);
                this.currentMemorySize += this.estimateSize(cached.data);
                
                return cached.data;
            } else {
                // Expired - delete file
                await fs.unlink(filePath).catch(() => {});
            }
        } catch (error) {
            // Cache miss
        }
        
        return null;
    }

    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live (milliseconds)
     */
    async set(key, data, ttl = this.defaultTTL) {
        const cached = {
            data: data,
            expiry: Date.now() + ttl,
            created: Date.now()
        };
        
        const size = this.estimateSize(data);
        
        // Store in memory if space available
        if (this.currentMemorySize + size < this.maxMemorySize) {
            this.cache.set(key, cached);
            this.currentMemorySize += size;
            console.log(`📦 Cached in memory: ${key} (${this.formatSize(size)})`);
        } else {
            console.log(`⚠️ Memory full, caching to disk only: ${key}`);
        }
        
        // Also persist to disk (compressed)
        try {
            const filePath = this.getFilePath(key);
            const json = JSON.stringify(cached);
            const compressed = await gzip(Buffer.from(json));
            await fs.writeFile(filePath, compressed);
            console.log(`💾 Cached to disk: ${key}`);
        } catch (error) {
            console.error(`❌ Disk cache write failed for ${key}:`, error.message);
        }
    }

    /**
     * Delete cached data
     * @param {string} key - Cache key
     */
    async delete(key) {
        // Remove from memory
        if (this.cache.has(key)) {
            const cached = this.cache.get(key);
            this.currentMemorySize -= this.estimateSize(cached.data);
            this.cache.delete(key);
        }
        
        // Remove from disk
        try {
            const filePath = this.getFilePath(key);
            await fs.unlink(filePath);
            console.log(`🗑️ Deleted cache: ${key}`);
        } catch (error) {
            // File might not exist
        }
    }

    /**
     * Clear all cache
     */
    async clear() {
        console.log('🧹 Clearing all cache...');
        
        // Clear memory
        this.cache.clear();
        this.currentMemorySize = 0;
        
        // Clear disk
        try {
            const files = await fs.readdir(this.cacheDir);
            await Promise.all(
                files.map(file => fs.unlink(path.join(this.cacheDir, file)))
            );
            console.log(`  ✅ Cleared ${files.length} cache files`);
        } catch (error) {
            console.error('❌ Cache clear failed:', error.message);
        }
    }

    /**
     * Cleanup expired entries
     */
    async cleanup() {
        console.log('🧹 Running cache cleanup...');
        
        const now = Date.now();
        let cleaned = 0;
        
        // Cleanup memory
        for (const [key, cached] of this.cache.entries()) {
            if (now >= cached.expiry) {
                this.currentMemorySize -= this.estimateSize(cached.data);
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        // Cleanup disk
        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                const filePath = path.join(this.cacheDir, file);
                try {
                    const compressed = await fs.readFile(filePath);
                    const buffer = await gunzip(compressed);
                    const cached = JSON.parse(buffer.toString());
                    
                    if (now >= cached.expiry) {
                        await fs.unlink(filePath);
                        cleaned++;
                    }
                } catch (error) {
                    // Corrupted file - delete it
                    await fs.unlink(filePath).catch(() => {});
                    cleaned++;
                }
            }
        } catch (error) {
            console.error('❌ Cleanup error:', error.message);
        }
        
        if (cleaned > 0) {
            console.log(`  ✅ Cleaned ${cleaned} expired cache entries`);
        }
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache stats
     */
    async getStats() {
        const memoryEntries = this.cache.size;
        
        let diskEntries = 0;
        try {
            const files = await fs.readdir(this.cacheDir);
            diskEntries = files.length;
        } catch (error) {
            // Directory might not exist
        }
        
        return {
            memory_entries: memoryEntries,
            disk_entries: diskEntries,
            memory_size_mb: (this.currentMemorySize / 1024 / 1024).toFixed(2),
            max_memory_mb: (this.maxMemorySize / 1024 / 1024).toFixed(2)
        };
    }

    /**
     * Get file path for cache key
     * @param {string} key - Cache key
     * @returns {string} - File path
     */
    getFilePath(key) {
        // Sanitize key for filename
        const sanitized = key.replace(/[^a-z0-9_-]/gi, '_');
        return path.join(this.cacheDir, `${sanitized}.cache.gz`);
    }

    /**
     * Estimate size of data in bytes
     * @param {any} data - Data to estimate
     * @returns {number} - Estimated size
     */
    estimateSize(data) {
        try {
            return Buffer.byteLength(JSON.stringify(data), 'utf8');
        } catch {
            return 1000; // Fallback estimate
        }
    }

    /**
     * Format size for display
     * @param {number} bytes - Size in bytes
     * @returns {string} - Formatted size
     */
    formatSize(bytes) {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
    }

    /**
     * Cleanup on shutdown
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        console.log('📦 Cache Manager destroyed');
    }
}

module.exports = CacheManager;
