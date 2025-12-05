/**
 * Smart Cache Manager - Multi-Tier Caching for Campaign Analysis
 * 
 * Optimized for:
 * - Long-term campaign tracking (months to years)
 * - Cost-effective storage (compressed, extracted data only)
 * - Ethical scraping (aggressive caching, rate limiting)
 * - Historical analysis (permanent storage of key data)
 * 
 * Cache Tiers:
 * 1. Live (5 min) - Election night results
 * 2. Daily (24 hours) - Breaking news, daily polls
 * 3. Weekly (7 days) - News roundups, trend updates
 * 4. Campaign (90 days) - Major announcements, endorsements
 * 5. Historical (permanent) - Final results, voting records
 * 6. Computed (permanent) - Trend analysis, aggregates
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SmartCacheManager {
    constructor(options = {}) {
        this.cacheDir = options.cacheDir || './cache';
        this.tiers = {
            LIVE: 5 * 60 * 1000,              // 5 minutes
            DAILY: 24 * 60 * 60 * 1000,       // 24 hours
            WEEKLY: 7 * 24 * 60 * 60 * 1000,  // 7 days
            CAMPAIGN: 90 * 24 * 60 * 60 * 1000, // 90 days
            HISTORICAL: Infinity,              // Permanent
            COMPUTED: Infinity                 // Permanent (derived data)
        };
        
        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            writes: 0,
            bytesStored: 0,
            cacheEfficiency: 0
        };
        
        this.init();
    }
    
    async init() {
        // Create cache directories
        const dirs = [
            'live',
            'daily', 
            'weekly',
            'campaign',
            'historical',
            'computed'
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(path.join(this.cacheDir, dir), { recursive: true });
        }
        
        console.log('📦 Smart Cache Manager initialized');
        console.log(`   Cache directory: ${this.cacheDir}`);
    }
    
    /**
     * Get cached data
     */
    async get(key, tier = 'DAILY') {
        try {
            const cacheFile = this.getCacheFilePath(key, tier);
            const data = await fs.readFile(cacheFile, 'utf8');
            const cached = JSON.parse(data);
            
            // Check if expired
            const maxAge = this.tiers[tier];
            const age = Date.now() - cached.timestamp;
            
            if (age > maxAge) {
                console.log(`⏰ Cache expired: ${key} (${tier})`);
                this.stats.misses++;
                return null;
            }
            
            this.stats.hits++;
            this.updateCacheEfficiency();
            
            console.log(`✅ Cache hit: ${key} (${tier}, ${this.getAgeString(age)} old)`);
            return cached.data;
            
        } catch (error) {
            this.stats.misses++;
            this.updateCacheEfficiency();
            return null;
        }
    }
    
    /**
     * Store data in cache
     */
    async set(key, data, tier = 'DAILY', metadata = {}) {
        try {
            const cacheFile = this.getCacheFilePath(key, tier);
            
            // Compress data (store only what's needed)
            const compressed = this.compressData(data, metadata);
            
            const cacheEntry = {
                key: key,
                tier: tier,
                timestamp: Date.now(),
                data: compressed,
                metadata: {
                    ...metadata,
                    originalSize: JSON.stringify(data).length,
                    compressedSize: JSON.stringify(compressed).length,
                    compressionRatio: this.getCompressionRatio(data, compressed)
                }
            };
            
            await fs.writeFile(
                cacheFile, 
                JSON.stringify(cacheEntry, null, 2), 
                'utf8'
            );
            
            this.stats.writes++;
            this.stats.bytesStored += JSON.stringify(cacheEntry).length;
            
            console.log(`💾 Cached: ${key} (${tier}, ${cacheEntry.metadata.compressionRatio}x compression)`);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Cache write error: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Compress data - extract only essential information
     */
    compressData(data, metadata) {
        // If it's already compressed, return as-is
        if (metadata.compressed) {
            return data;
        }
        
        // For news articles
        if (metadata.type === 'news_article') {
            return {
                title: data.title,
                date: data.date || data.publishedAt,
                source: data.source?.name || data.source,
                url: data.url,
                keyPoints: this.extractKeyPoints(data.description || data.content),
                category: metadata.category,
                sentiment: metadata.sentiment
            };
        }
        
        // For election results
        if (metadata.type === 'election_results') {
            return {
                race: data.race,
                date: data.date,
                candidates: data.candidates.map(c => ({
                    name: c.name,
                    party: c.party,
                    votes: c.votes,
                    percentage: c.percentage
                })),
                totalVotes: data.totalVotes,
                precincts: data.precinctsReporting
            };
        }
        
        // For campaign finance
        if (metadata.type === 'campaign_finance') {
            return {
                candidate: data.candidate,
                period: data.period,
                raised: data.totalRaised,
                spent: data.totalSpent,
                cash: data.cashOnHand,
                topDonors: data.topDonors?.slice(0, 10), // Top 10 only
                date: data.filingDate
            };
        }
        
        // For poll data
        if (metadata.type === 'poll') {
            return {
                pollster: data.pollster,
                date: data.date,
                sampleSize: data.sampleSize,
                results: data.results,
                marginOfError: data.marginOfError
            };
        }
        
        // Default: return as-is
        return data;
    }
    
    /**
     * Extract key points from text (simple version)
     */
    extractKeyPoints(text) {
        if (!text) return [];
        
        // Split into sentences
        const sentences = text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20);
        
        // Return first 3 sentences as key points
        return sentences.slice(0, 3);
    }
    
    /**
     * Get compression ratio
     */
    getCompressionRatio(original, compressed) {
        const originalSize = JSON.stringify(original).length;
        const compressedSize = JSON.stringify(compressed).length;
        return (originalSize / compressedSize).toFixed(1);
    }
    
    /**
     * Get cache file path
     */
    getCacheFilePath(key, tier) {
        const hash = crypto.createHash('md5').update(key).digest('hex');
        const tierDir = tier.toLowerCase();
        return path.join(this.cacheDir, tierDir, `${hash}.json`);
    }
    
    /**
     * Get human-readable age string
     */
    getAgeString(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    }
    
    /**
     * Update cache efficiency metric
     */
    updateCacheEfficiency() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.cacheEfficiency = total > 0 
            ? ((this.stats.hits / total) * 100).toFixed(1)
            : 0;
    }
    
    /**
     * Get campaign trend data (computed cache)
     */
    async getCampaignTrend(campaignId, dataType) {
        const key = `trend_${campaignId}_${dataType}`;
        
        // Check if we have computed trend
        const cached = await this.get(key, 'COMPUTED');
        if (cached) return cached;
        
        // Build trend from historical cache
        // This aggregates data over time without re-scraping
        console.log(`📊 Computing trend: ${campaignId} (${dataType})`);
        
        // Return placeholder - real implementation would aggregate cached data
        return {
            computed: true,
            message: 'Trend computation logic here'
        };
    }
    
    /**
     * Clean up expired cache entries
     */
    async cleanup() {
        console.log('🧹 Starting cache cleanup...');
        
        let cleaned = 0;
        const dirs = ['live', 'daily', 'weekly', 'campaign'];
        
        for (const dir of dirs) {
            const dirPath = path.join(this.cacheDir, dir);
            const files = await fs.readdir(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
                
                const maxAge = this.tiers[data.tier];
                const age = Date.now() - data.timestamp;
                
                if (age > maxAge) {
                    await fs.unlink(filePath);
                    cleaned++;
                }
            }
        }
        
        console.log(`✅ Cleaned ${cleaned} expired cache entries`);
    }
    
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            ...this.stats,
            storageKB: (this.stats.bytesStored / 1024).toFixed(2),
            storageMB: (this.stats.bytesStored / 1024 / 1024).toFixed(2)
        };
    }
}

// Auto-cleanup every hour
setInterval(() => {
    const cache = new SmartCacheManager();
    cache.cleanup();
}, 60 * 60 * 1000);

module.exports = SmartCacheManager;
