/**
 * WORKFORCE DEMOCRACY PROJECT - Learning Path Engine
 * Version: 37.17.0-LEARNING-ENGINE
 * Date: November 25, 2025
 * 
 * Purpose: Provide personalized learning recommendations WITHOUT AI costs
 * Method: Rule-based logic, client-side tracking, progressive disclosure
 * Cost: $0 (no API calls)
 * 
 * Philosophy: Guide users through civic education organically
 */

class LearningPathEngine {
    constructor() {
        this.userProgress = this.loadProgress();
        this.learningPaths = this.initializePaths();
        this.recommendations = [];
    }
    
    /**
     * Initialize learning paths
     * Organized by user journey stage
     */
    initializePaths() {
        return {
            // BEGINNER PATH: Understanding the System
            beginner: {
                id: 'beginner',
                name: 'Understanding Democracy',
                description: 'Learn the basics of how government works',
                stages: [
                    {
                        id: 'find-reps',
                        title: 'Find Your Representatives',
                        description: 'Discover who represents you',
                        resource: '/index.html#civic-platform',
                        requiredActions: ['view-representatives'],
                        completed: false
                    },
                    {
                        id: 'understand-roles',
                        title: 'Understanding Representative Roles',
                        description: 'Learn what each level of government does',
                        resource: '/learning.html#government-structure',
                        requiredActions: ['read-roles'],
                        completed: false
                    },
                    {
                        id: 'contact-basics',
                        title: 'How to Contact Representatives',
                        description: 'Learn effective ways to make your voice heard',
                        resource: '/learning.html#contacting-reps',
                        requiredActions: ['view-contact-info'],
                        completed: false
                    }
                ]
            },
            
            // INTERMEDIATE PATH: Active Engagement
            intermediate: {
                id: 'intermediate',
                name: 'Active Civic Engagement',
                description: 'Take action on issues you care about',
                stages: [
                    {
                        id: 'explore-bills',
                        title: 'Explore Current Legislation',
                        description: 'Understand bills being debated',
                        resource: '/index.html#bills-section',
                        requiredActions: ['view-bills'],
                        completed: false
                    },
                    {
                        id: 'analyze-bills',
                        title: 'Analyze Bill Impacts',
                        description: 'Learn to evaluate legislation effects',
                        resource: '/learning.html#bill-analysis',
                        requiredActions: ['request-bill-analysis'],
                        completed: false
                    },
                    {
                        id: 'voting-records',
                        title: 'Review Voting Records',
                        description: 'See how representatives vote',
                        resource: '/index.html#voting-records',
                        requiredActions: ['view-voting-records'],
                        completed: false
                    },
                    {
                        id: 'make-contact',
                        title: 'Contact Your Representative',
                        description: 'Reach out on an issue you care about',
                        resource: '/index.html#contact',
                        requiredActions: ['click-contact'],
                        completed: false
                    }
                ]
            },
            
            // ADVANCED PATH: Deep Civic Literacy
            advanced: {
                id: 'advanced',
                name: 'Civic Leadership',
                description: 'Become a community advocate',
                stages: [
                    {
                        id: 'comparative-analysis',
                        title: 'Compare Representatives',
                        description: 'Analyze different approaches to issues',
                        resource: '/learning.html#comparative-analysis',
                        requiredActions: ['compare-reps'],
                        completed: false
                    },
                    {
                        id: 'local-engagement',
                        title: 'Community Organizing',
                        description: 'Connect with local civic groups',
                        resource: '/learning.html#community-organizing',
                        requiredActions: ['explore-local-resources'],
                        completed: false
                    },
                    {
                        id: 'advocacy',
                        title: 'Effective Advocacy',
                        description: 'Learn strategies for policy change',
                        resource: '/learning.html#advocacy',
                        requiredActions: ['read-advocacy-guide'],
                        completed: false
                    }
                ]
            }
        };
    }
    
    /**
     * Track user action and update progress
     */
    trackAction(action, metadata = {}) {
        const timestamp = Date.now();
        
        // Record action
        this.userProgress.actions.push({
            action,
            metadata,
            timestamp
        });
        
        // Update counters
        this.userProgress.counters[action] = (this.userProgress.counters[action] || 0) + 1;
        
        // Check for stage completions
        this.checkProgressions(action);
        
        // Save progress
        this.saveProgress();
        
        // Generate new recommendations
        this.updateRecommendations();
        
        console.log(`📚 [Learning] Tracked: ${action}`, metadata);
    }
    
    /**
     * Check if action completes any learning stages
     */
    checkProgressions(action) {
        for (const [pathKey, path] of Object.entries(this.learningPaths)) {
            for (const stage of path.stages) {
                if (stage.requiredActions.includes(action) && !stage.completed) {
                    stage.completed = true;
                    this.userProgress.completedStages.push(stage.id);
                    
                    console.log(`🎓 [Learning] Completed stage: ${stage.title}`);
                    
                    // Show completion notification
                    this.showCompletionNotification(stage);
                }
            }
        }
    }
    
    /**
     * Generate next recommendations based on current progress
     */
    updateRecommendations() {
        this.recommendations = [];
        
        // Determine current path level
        const level = this.determineLevel();
        
        // Get current path
        const currentPath = this.learningPaths[level];
        
        // Find next incomplete stage
        const nextStage = currentPath.stages.find(s => !s.completed);
        
        if (nextStage) {
            this.recommendations.push({
                priority: 'high',
                stage: nextStage,
                path: currentPath,
                reason: `Continue your ${currentPath.name} journey`
            });
        }
        
        // Add contextual recommendations
        this.addContextualRecommendations();
        
        return this.recommendations;
    }
    
    /**
     * Add recommendations based on recent activity
     */
    addContextualRecommendations() {
        const counters = this.userProgress.counters;
        
        // If viewed many bills but no analysis
        if (counters['view-bills'] >= 3 && !counters['request-bill-analysis']) {
            this.recommendations.push({
                priority: 'medium',
                title: 'Analyze Bill Impacts',
                description: 'You\'ve viewed several bills. Try getting an AI analysis!',
                resource: '/index.html#bills-section',
                action: 'request-bill-analysis',
                reason: 'Natural next step from bill browsing'
            });
        }
        
        // If viewed reps but not contacted
        if (counters['view-representatives'] >= 1 && !counters['click-contact']) {
            this.recommendations.push({
                priority: 'medium',
                title: 'Contact Your Representative',
                description: 'Make your voice heard on issues you care about',
                resource: '/index.html#contact',
                action: 'click-contact',
                reason: 'You\'ve identified your representatives'
            });
        }
        
        // If analyzed bills but not checked voting records
        if (counters['request-bill-analysis'] >= 2 && !counters['view-voting-records']) {
            this.recommendations.push({
                priority: 'high',
                title: 'Check Voting Records',
                description: 'See how your representatives voted on these bills',
                resource: '/index.html#voting-records',
                action: 'view-voting-records',
                reason: 'Connect bills to representative actions'
            });
        }
    }
    
    /**
     * Determine user's current level
     */
    determineLevel() {
        const totalActions = Object.keys(this.userProgress.counters).length;
        const completedStages = this.userProgress.completedStages.length;
        
        if (completedStages >= 6 || totalActions >= 15) {
            return 'advanced';
        } else if (completedStages >= 3 || totalActions >= 7) {
            return 'intermediate';
        } else {
            return 'beginner';
        }
    }
    
    /**
     * Get current recommendations
     */
    getRecommendations() {
        if (this.recommendations.length === 0) {
            this.updateRecommendations();
        }
        return this.recommendations;
    }
    
    /**
     * Show completion notification
     */
    showCompletionNotification(stage) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'learning-completion-notification';
        notification.innerHTML = `
            <div class="completion-content">
                <span class="completion-icon">🎓</span>
                <div class="completion-text">
                    <strong>Progress!</strong>
                    <p>${stage.title} completed</p>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const stored = localStorage.getItem('wdp_learning_progress');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not load learning progress');
        }
        
        // Default progress structure
        return {
            actions: [],
            counters: {},
            completedStages: [],
            startedAt: Date.now(),
            lastActive: Date.now()
        };
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        this.userProgress.lastActive = Date.now();
        
        try {
            localStorage.setItem('wdp_learning_progress', JSON.stringify(this.userProgress));
        } catch (e) {
            console.warn('Could not save learning progress');
        }
    }
    
    /**
     * Get user's progress summary
     */
    getProgressSummary() {
        const level = this.determineLevel();
        const currentPath = this.learningPaths[level];
        const completed = currentPath.stages.filter(s => s.completed).length;
        const total = currentPath.stages.length;
        
        return {
            level,
            currentPath: currentPath.name,
            progress: `${completed}/${total}`,
            percentage: Math.round((completed / total) * 100),
            totalActions: Object.keys(this.userProgress.counters).length,
            recommendations: this.getRecommendations()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningPathEngine;
}
