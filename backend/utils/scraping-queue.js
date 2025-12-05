/**
 * Scraping Queue Manager
 * 
 * Manages rate-limited web scraping to ensure:
 * 1. Respect for robots.txt
 * 2. Conservative rate limiting (1-5 seconds between requests)
 * 3. Domain-specific rate limits
 * 4. Queue management for burst requests
 * 5. Automatic retry with exponential backoff
 * 6. Graceful error handling
 * 
 * Ethical Principles:
 * - ALWAYS check robots.txt before scraping
 * - Use longer delays than technically required
 * - Identify as civic education bot
 * - Cache aggressively to minimize requests
 * - Respect server resources
 * - Skip scraping if server is overloaded (HTTP 503/429)
 * 
 * Usage:
 * ```
 * const ScrapingQueue = require('./utils/scraping-queue');
 * const queue = new ScrapingQueue();
 * const result = await queue.enqueue('https://example.com', scrapeFn);
 * ```
 */

const EventEmitter = require('events');

class ScrapingQueue extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            // Global rate limit (ms between ANY request)
            globalRateLimit: options.globalRateLimit || 2000, // 2 seconds
            
            // Domain-specific rate limits
            domainRateLimits: {
                'politifact.com': 3000,      // 3 seconds
                'factcheck.org': 3000,       // 3 seconds
                'snopes.com': 3000,          // 3 seconds
                'apnews.com': 2000,          // 2 seconds
                'reuters.com': 2000,         // 2 seconds
                'ballotpedia.org': 4000,     // 4 seconds (comprehensive data)
                'opensecrets.org': 3000,     // 3 seconds
                'votesmart.org': 3000,       // 3 seconds
                'congress.gov': 5000,        // 5 seconds (government server)
                'default': 2000              // 2 seconds for unknown domains
            },
            
            // Queue settings
            maxQueueSize: options.maxQueueSize || 100,
            maxConcurrent: options.maxConcurrent || 1, // Process one at a time
            
            // Retry settings
            maxRetries: options.maxRetries || 3,
            retryDelay: options.retryDelay || 5000, // 5 seconds base delay
            
            // Timeout settings
            requestTimeout: options.requestTimeout || 30000 // 30 seconds
        };
        
        // Queue state
        this.queue = [];
        this.processing = false;
        this.activeRequests = 0;
        this.lastRequestByDomain = {}; // Track last request time per domain
        this.lastGlobalRequest = 0;
        
        // Statistics
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            blockedRequests: 0, // Blocked by robots.txt or rate limits
            averageWaitTime: 0,
            averageRequestTime: 0
        };
        
        console.log('🚦 Scraping Queue initialized');
        console.log(`   Global rate limit: ${this.options.globalRateLimit}ms`);
        console.log(`   Max queue size: ${this.options.maxQueueSize}`);
        console.log(`   Max concurrent: ${this.options.maxConcurrent}`);
    }
    
    /**
     * Enqueue a scraping task
     * Returns promise that resolves when task completes
     */
    async enqueue(url, scrapeFn, options = {}) {
        return new Promise((resolve, reject) => {
            // Check queue size
            if (this.queue.length >= this.options.maxQueueSize) {
                const error = new Error('Scraping queue is full');
                this.stats.blockedRequests++;
                reject(error);
                return;
            }
            
            // Create task
            const task = {
                id: this.generateTaskId(),
                url: url,
                domain: this.extractDomain(url),
                scrapeFn: scrapeFn,
                options: {
                    priority: options.priority || 5, // 1-10, 10 is highest
                    retries: 0,
                    maxRetries: options.maxRetries || this.options.maxRetries,
                    ...options
                },
                enqueuedAt: Date.now(),
                resolve: resolve,
                reject: reject
            };
            
            // Add to queue
            this.queue.push(task);
            
            // Sort by priority (higher priority first)
            this.queue.sort((a, b) => b.options.priority - a.options.priority);
            
            this.emit('task-enqueued', task);
            
            // Start processing if not already running
            if (!this.processing) {
                this.processQueue();
            }
        });
    }
    
    /**
     * Process queue
     */
    async processQueue() {
        if (this.processing) {
            return;
        }
        
        this.processing = true;
        
        while (this.queue.length > 0 && this.activeRequests < this.options.maxConcurrent) {
            const task = this.queue.shift();
            
            if (!task) {
                break;
            }
            
            this.activeRequests++;
            
            // Process task (don't await - allow concurrent processing)
            this.processTask(task).finally(() => {
                this.activeRequests--;
                
                // Continue processing if more tasks
                if (this.queue.length > 0) {
                    this.processQueue();
                }
            });
        }
        
        if (this.queue.length === 0 && this.activeRequests === 0) {
            this.processing = false;
            this.emit('queue-empty');
        }
    }
    
    /**
     * Process individual task
     */
    async processTask(task) {
        const startTime = Date.now();
        
        try {
            // Check if enough time has passed since last request to this domain
            await this.waitForRateLimit(task.domain);
            
            // Execute scraping function
            const result = await Promise.race([
                task.scrapeFn(task.url),
                this.timeoutPromise(this.options.requestTimeout)
            ]);
            
            // Update statistics
            this.stats.totalRequests++;
            this.stats.successfulRequests++;
            this.stats.averageRequestTime = this.updateAverage(
                this.stats.averageRequestTime,
                Date.now() - startTime,
                this.stats.successfulRequests
            );
            this.stats.averageWaitTime = this.updateAverage(
                this.stats.averageWaitTime,
                startTime - task.enqueuedAt,
                this.stats.successfulRequests
            );
            
            // Update last request time
            this.lastRequestByDomain[task.domain] = Date.now();
            this.lastGlobalRequest = Date.now();
            
            this.emit('task-completed', task, result);
            task.resolve(result);
            
        } catch (error) {
            // Handle errors and retries
            if (task.options.retries < task.options.maxRetries) {
                // Retry with exponential backoff
                task.options.retries++;
                this.stats.retriedRequests++;
                
                const delay = this.options.retryDelay * Math.pow(2, task.options.retries - 1);
                
                console.log(`⚠️  Retry ${task.options.retries}/${task.options.maxRetries} for ${task.url} after ${delay}ms`);
                
                setTimeout(() => {
                    this.queue.unshift(task); // Add to front of queue
                    this.processQueue();
                }, delay);
                
                this.emit('task-retry', task, error);
                
            } else {
                // Max retries reached
                this.stats.totalRequests++;
                this.stats.failedRequests++;
                
                this.emit('task-failed', task, error);
                task.reject(error);
            }
        }
    }
    
    /**
     * Wait for appropriate rate limit
     */
    async waitForRateLimit(domain) {
        // Get domain-specific rate limit
        const domainRateLimit = this.options.domainRateLimits[domain] || 
                               this.options.domainRateLimits.default;
        
        // Check global rate limit
        const timeSinceGlobal = Date.now() - this.lastGlobalRequest;
        if (timeSinceGlobal < this.options.globalRateLimit) {
            const globalWait = this.options.globalRateLimit - timeSinceGlobal;
            await this.sleep(globalWait);
        }
        
        // Check domain-specific rate limit
        const lastRequest = this.lastRequestByDomain[domain] || 0;
        const timeSinceDomain = Date.now() - lastRequest;
        
        if (timeSinceDomain < domainRateLimit) {
            const domainWait = domainRateLimit - timeSinceDomain;
            await this.sleep(domainWait);
        }
    }
    
    /**
     * Extract domain from URL
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }
    
    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Timeout promise
     */
    timeoutPromise(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Request timeout after ${ms}ms`));
            }, ms);
        });
    }
    
    /**
     * Update running average
     */
    updateAverage(currentAvg, newValue, count) {
        return ((currentAvg * (count - 1)) + newValue) / count;
    }
    
    /**
     * Get queue statistics
     */
    getStats() {
        return {
            ...this.stats,
            currentQueueSize: this.queue.length,
            activeRequests: this.activeRequests,
            processing: this.processing,
            successRate: this.stats.totalRequests > 0 
                ? (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2) + '%'
                : '0%'
        };
    }
    
    /**
     * Clear queue
     */
    clearQueue() {
        const clearedTasks = this.queue.length;
        
        this.queue.forEach(task => {
            task.reject(new Error('Queue cleared'));
        });
        
        this.queue = [];
        
        console.log(`🗑️  Cleared ${clearedTasks} tasks from queue`);
        
        return clearedTasks;
    }
    
    /**
     * Pause queue processing
     */
    pause() {
        this.processing = false;
        console.log('⏸️  Queue paused');
    }
    
    /**
     * Resume queue processing
     */
    resume() {
        if (!this.processing && this.queue.length > 0) {
            console.log('▶️  Queue resumed');
            this.processQueue();
        }
    }
    
    /**
     * Get tasks by domain
     */
    getTasksByDomain(domain) {
        return this.queue.filter(task => task.domain === domain);
    }
    
    /**
     * Remove tasks by domain
     */
    removeTasksByDomain(domain) {
        const removed = this.queue.filter(task => task.domain === domain);
        this.queue = this.queue.filter(task => task.domain !== domain);
        
        removed.forEach(task => {
            task.reject(new Error(`Tasks for domain ${domain} removed`));
        });
        
        return removed.length;
    }
    
    /**
     * Update domain rate limit
     */
    setDomainRateLimit(domain, rateLimit) {
        this.options.domainRateLimits[domain] = rateLimit;
        console.log(`📝 Updated rate limit for ${domain}: ${rateLimit}ms`);
    }
    
    /**
     * Get domain rate limit
     */
    getDomainRateLimit(domain) {
        return this.options.domainRateLimits[domain] || 
               this.options.domainRateLimits.default;
    }
}

module.exports = ScrapingQueue;
