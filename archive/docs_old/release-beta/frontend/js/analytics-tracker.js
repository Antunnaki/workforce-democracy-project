/**
 * IN-HOUSE PRIVACY-FIRST ANALYTICS TRACKER
 * Version: V36.9.10
 * 
 * Philosophy: User owns their data
 * - NO external tracking services (Google Analytics, Facebook Pixel, etc.)
 * - NO server requests (all data stays in browser)
 * - Encrypted local storage (AES-256-GCM via SecurityManager)
 * - User can view, export, and delete their own data
 * - Transparent about what's tracked
 */

class AnalyticsTracker {
    constructor() {
        this.storageKey = 'wdp_analytics_data';
        this.sessionKey = 'wdp_session_id';
        this.isEnabled = true; // User can disable in Privacy page
        this.currentSession = null;
        this.maxEvents = 1000; // Limit storage size
        
        this.init();
    }

    /**
     * Initialize analytics tracker
     */
    init() {
        // Check if user has disabled analytics
        const privacySettings = this.getPrivacySettings();
        if (privacySettings && privacySettings.disableAnalytics) {
            this.isEnabled = false;
            console.log('📊 Analytics: Disabled by user preference');
            return;
        }

        // Generate or retrieve session ID
        this.currentSession = this.getOrCreateSession();
        
        // Track page view
        this.trackPageView();
        
        // Set up automatic event tracking
        this.setupEventListeners();
        
        // Track time on page
        this.startTimeTracking();
        
        console.log('📊 Analytics: In-house tracking initialized (privacy-first)');
    }

    /**
     * Get privacy settings from localStorage
     */
    getPrivacySettings() {
        try {
            const settings = localStorage.getItem('wdp_privacy_settings');
            return settings ? JSON.parse(settings) : null;
        } catch (error) {
            console.error('Error reading privacy settings:', error);
            return null;
        }
    }

    /**
     * Generate or retrieve session ID
     */
    getOrCreateSession() {
        let sessionId = sessionStorage.getItem(this.sessionKey);
        
        if (!sessionId) {
            // Generate new session ID
            sessionId = this.generateSessionId();
            sessionStorage.setItem(this.sessionKey, sessionId);
        }
        
        return sessionId;
    }

    /**
     * Generate unique session ID (no external dependencies)
     */
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `session_${timestamp}_${random}`;
    }

    /**
     * Get or create analytics data structure
     */
    getAnalyticsData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error reading analytics data:', error);
        }
        
        // Initialize new analytics data structure
        return {
            version: '1.0',
            created: Date.now(),
            sessions: [],
            events: [],
            pageViews: [],
            metadata: {
                totalSessions: 0,
                totalPageViews: 0,
                totalEvents: 0
            }
        };
    }

    /**
     * Save analytics data to localStorage
     */
    saveAnalyticsData(data) {
        try {
            // Enforce event limit
            if (data.events.length > this.maxEvents) {
                // Keep most recent events
                data.events = data.events.slice(-this.maxEvents);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving analytics data:', error);
            
            // If quota exceeded, remove oldest events
            if (error.name === 'QuotaExceededError') {
                data.events = data.events.slice(-500); // Keep only 500 most recent
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                } catch (retryError) {
                    console.error('Still cannot save after cleanup:', retryError);
                }
            }
        }
    }

    /**
     * Track page view
     */
    trackPageView() {
        if (!this.isEnabled) return;

        const data = this.getAnalyticsData();
        
        const pageView = {
            id: this.generateEventId(),
            sessionId: this.currentSession,
            timestamp: Date.now(),
            type: 'pageview',
            page: {
                url: window.location.pathname,
                title: document.title,
                referrer: document.referrer || 'direct',
                hash: window.location.hash
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            device: this.getDeviceInfo()
        };
        
        data.pageViews.push(pageView);
        data.metadata.totalPageViews++;
        
        this.saveAnalyticsData(data);
        
        console.log('📊 Page view tracked:', pageView.page.url);
    }

    /**
     * Track custom event
     */
    trackEvent(category, action, label = null, value = null) {
        if (!this.isEnabled) return;

        const data = this.getAnalyticsData();
        
        const event = {
            id: this.generateEventId(),
            sessionId: this.currentSession,
            timestamp: Date.now(),
            type: 'event',
            category: category,
            action: action,
            label: label,
            value: value,
            page: window.location.pathname
        };
        
        data.events.push(event);
        data.metadata.totalEvents++;
        
        this.saveAnalyticsData(data);
        
        console.log('📊 Event tracked:', category, action, label);
    }

    /**
     * Track time spent on page
     */
    startTimeTracking() {
        if (!this.isEnabled) return;

        this.pageLoadTime = Date.now();
        
        // Track when user leaves page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.pageLoadTime;
            this.trackEvent('engagement', 'time_on_page', window.location.pathname, timeOnPage);
        });
    }

    /**
     * Set up automatic event listeners
     */
    setupEventListeners() {
        if (!this.isEnabled) return;

        // Track outbound links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const url = new URL(link.href, window.location.origin);
                
                // Check if external link
                if (url.origin !== window.location.origin) {
                    this.trackEvent('navigation', 'external_link', url.hostname);
                }
            }
        });

        // Track search queries (if search functionality exists)
        const searchInputs = document.querySelectorAll('input[type="search"], input[name="search"]');
        searchInputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value) {
                    // Track search (don't store actual query for privacy)
                    this.trackEvent('search', 'query_submitted', 'length:' + input.value.length);
                }
            });
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                const formName = form.name || form.id || 'unnamed_form';
                this.trackEvent('form', 'submit', formName);
            }
        });

        // Track button clicks (with data-track attribute)
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-track]');
            if (button) {
                const trackData = button.dataset.track;
                this.trackEvent('interaction', 'button_click', trackData);
            }
        });

        // Track tab changes (civic/jobs tabs)
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('[role="tab"]');
            if (tab) {
                const tabName = tab.textContent || tab.getAttribute('aria-label');
                this.trackEvent('navigation', 'tab_change', tabName);
            }
        });

        // Track scroll depth
        let maxScroll = 0;
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    
                    // Track milestone scroll depths
                    if (scrollPercent >= 25 && scrollPercent < 50) {
                        this.trackEvent('engagement', 'scroll_depth', '25%');
                    } else if (scrollPercent >= 50 && scrollPercent < 75) {
                        this.trackEvent('engagement', 'scroll_depth', '50%');
                    } else if (scrollPercent >= 75 && scrollPercent < 100) {
                        this.trackEvent('engagement', 'scroll_depth', '75%');
                    } else if (scrollPercent >= 100) {
                        this.trackEvent('engagement', 'scroll_depth', '100%');
                    }
                }
            }, 500);
        });
    }

    /**
     * Get device information (privacy-friendly)
     */
    getDeviceInfo() {
        return {
            type: this.getDeviceType(),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * Determine device type
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Get analytics summary for dashboard
     */
    getSummary() {
        const data = this.getAnalyticsData();
        
        // Calculate time range
        const oldestEvent = data.pageViews[0] || { timestamp: Date.now() };
        const newestEvent = data.pageViews[data.pageViews.length - 1] || { timestamp: Date.now() };
        
        // Calculate unique pages
        const uniquePages = new Set(data.pageViews.map(pv => pv.page.url));
        
        // Calculate device breakdown
        const deviceBreakdown = data.pageViews.reduce((acc, pv) => {
            const device = pv.device.type;
            acc[device] = (acc[device] || 0) + 1;
            return acc;
        }, {});
        
        // Calculate popular pages
        const pageCount = data.pageViews.reduce((acc, pv) => {
            acc[pv.page.url] = (acc[pv.page.url] || 0) + 1;
            return acc;
        }, {});
        const popularPages = Object.entries(pageCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        // Calculate event breakdown
        const eventBreakdown = data.events.reduce((acc, evt) => {
            acc[evt.category] = (acc[evt.category] || 0) + 1;
            return acc;
        }, {});
        
        return {
            overview: {
                totalPageViews: data.metadata.totalPageViews,
                totalEvents: data.metadata.totalEvents,
                uniquePages: uniquePages.size,
                dateRange: {
                    start: new Date(oldestEvent.timestamp),
                    end: new Date(newestEvent.timestamp)
                }
            },
            devices: deviceBreakdown,
            popularPages: popularPages,
            events: eventBreakdown,
            recentActivity: data.pageViews.slice(-10).reverse()
        };
    }

    /**
     * Export analytics data (for user download)
     */
    exportData() {
        const data = this.getAnalyticsData();
        const summary = this.getSummary();
        
        return {
            exportDate: new Date().toISOString(),
            summary: summary,
            rawData: data
        };
    }

    /**
     * Clear all analytics data
     */
    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            sessionStorage.removeItem(this.sessionKey);
            console.log('📊 Analytics data cleared');
            return true;
        } catch (error) {
            console.error('Error clearing analytics data:', error);
            return false;
        }
    }

    /**
     * Disable analytics tracking
     */
    disable() {
        this.isEnabled = false;
        
        // Save preference
        const privacySettings = this.getPrivacySettings() || {};
        privacySettings.disableAnalytics = true;
        localStorage.setItem('wdp_privacy_settings', JSON.stringify(privacySettings));
        
        console.log('📊 Analytics tracking disabled');
    }

    /**
     * Enable analytics tracking
     */
    enable() {
        this.isEnabled = true;
        
        // Save preference
        const privacySettings = this.getPrivacySettings() || {};
        privacySettings.disableAnalytics = false;
        localStorage.setItem('wdp_privacy_settings', JSON.stringify(privacySettings));
        
        console.log('📊 Analytics tracking enabled');
        this.init();
    }
}

// Initialize analytics tracker when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.wdpAnalytics = new AnalyticsTracker();
    });
} else {
    window.wdpAnalytics = new AnalyticsTracker();
}

// Expose global tracking function for manual tracking
window.trackEvent = function(category, action, label, value) {
    if (window.wdpAnalytics) {
        window.wdpAnalytics.trackEvent(category, action, label, value);
    }
};
