/**
 * Job Queue Service - v37.9.12
 * 
 * Manages async jobs for long-running LLM queries
 * Solves Netlify 26-second timeout limitation
 * 
 * Architecture:
 * 1. Client submits job → Get job ID immediately
 * 2. Backend processes job in background
 * 3. Client polls status every 5 seconds
 * 4. When complete, client fetches result
 */

const { v4: uuidv4 } = require('uuid');

class JobQueueService {
    constructor() {
        // In-memory storage (consider Redis for production)
        this.jobs = new Map();
        
        // Auto-cleanup completed jobs after 10 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
        
        console.log('[JobQueue] ✅ Initialized');
    }
    
    /**
     * Create a new job
     * @param {string} type - Job type (e.g., 'llm-chat')
     * @param {object} data - Job data (query, context, etc.)
     * @returns {string} jobId
     */
    createJob(type, data) {
        const jobId = uuidv4();
        
        const job = {
            id: jobId,
            type: type,
            data: data,
            status: 'pending',
            progress: 0,
            message: 'Job created, waiting to start...',
            result: null,
            error: null,
            createdAt: Date.now(),
            startedAt: null,
            completedAt: null
        };
        
        this.jobs.set(jobId, job);
        
        console.log(`[JobQueue] 📝 Created job ${jobId} (type: ${type})`);
        
        return jobId;
    }
    
    /**
     * Update job progress
     * @param {string} jobId - Job ID
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Progress message
     */
    updateProgress(jobId, progress, message) {
        const job = this.jobs.get(jobId);
        if (!job) {
            console.warn(`[JobQueue] ⚠️ Job ${jobId} not found`);
            return;
        }
        
        job.progress = progress;
        job.message = message;
        
        if (job.status === 'pending') {
            job.status = 'processing';
            job.startedAt = Date.now();
        }
        
        console.log(`[JobQueue] 📊 Job ${jobId}: ${progress}% - ${message}`);
    }
    
    /**
     * Mark job as complete with result
     * @param {string} jobId - Job ID
     * @param {object} result - Job result
     */
    completeJob(jobId, result) {
        const job = this.jobs.get(jobId);
        if (!job) {
            console.warn(`[JobQueue] ⚠️ Job ${jobId} not found`);
            return;
        }
        
        job.status = 'completed';
        job.progress = 100;
        job.message = 'Job completed successfully';
        job.result = result;
        job.completedAt = Date.now();
        
        const duration = ((job.completedAt - job.createdAt) / 1000).toFixed(1);
        console.log(`[JobQueue] ✅ Job ${jobId} completed in ${duration}s`);
    }
    
    /**
     * Mark job as failed with error
     * @param {string} jobId - Job ID
     * @param {Error} error - Error object
     */
    failJob(jobId, error) {
        const job = this.jobs.get(jobId);
        if (!job) {
            console.warn(`[JobQueue] ⚠️ Job ${jobId} not found`);
            return;
        }
        
        job.status = 'failed';
        job.message = error.message || 'Job failed';
        job.error = {
            message: error.message,
            stack: error.stack
        };
        job.completedAt = Date.now();
        
        console.error(`[JobQueue] ❌ Job ${jobId} failed: ${error.message}`);
    }
    
    /**
     * Get job status
     * @param {string} jobId - Job ID
     * @returns {object} Job status object
     */
    getStatus(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            return {
                exists: false,
                status: 'not_found',
                message: 'Job not found'
            };
        }
        
        return {
            exists: true,
            id: job.id,
            type: job.type,
            status: job.status,
            progress: job.progress,
            message: job.message,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            elapsedTime: job.startedAt ? ((Date.now() - job.startedAt) / 1000).toFixed(1) : null
        };
    }
    
    /**
     * Get job result
     * @param {string} jobId - Job ID
     * @returns {object} Job result or null
     */
    getResult(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        
        if (job.status !== 'completed') {
            throw new Error(`Job status is ${job.status}, not completed`);
        }
        
        return job.result;
    }
    
    /**
     * Clean up old completed jobs (older than 10 minutes)
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 10 * 60 * 1000; // 10 minutes
        
        let cleaned = 0;
        for (const [jobId, job] of this.jobs.entries()) {
            if (job.completedAt && (now - job.completedAt) > maxAge) {
                this.jobs.delete(jobId);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`[JobQueue] 🧹 Cleaned up ${cleaned} old jobs`);
        }
    }
    
    /**
     * Get statistics
     * @returns {object} Queue statistics
     */
    getStats() {
        let pending = 0;
        let processing = 0;
        let completed = 0;
        let failed = 0;
        
        for (const job of this.jobs.values()) {
            switch (job.status) {
                case 'pending': pending++; break;
                case 'processing': processing++; break;
                case 'completed': completed++; break;
                case 'failed': failed++; break;
            }
        }
        
        return {
            total: this.jobs.size,
            pending,
            processing,
            completed,
            failed
        };
    }
}

// Singleton instance
const jobQueue = new JobQueueService();

module.exports = jobQueue;
