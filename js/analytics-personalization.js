/**
 * ANALYTICS-DRIVEN PERSONALIZATION ENGINE
 * Version: V36.9.10
 * 
 * Uses analytics data to personalize user experience on:
 * - Learning page (suggest resources based on interests)
 * - FAQ page (prioritize questions based on browsing history)
 * - Homepage (customize based on past behavior)
 */

class AnalyticsPersonalization {
    constructor() {
        this.analyticsKey = 'wdp_analytics_data';
        this.recommendationsKey = 'wdp_personalization_recs';
    }

    /**
     * Get user's browsing patterns from analytics
     */
    getBrowsingPatterns() {
        try {
            const analyticsData = localStorage.getItem(this.analyticsKey);
            if (!analyticsData) return null;
            
            const data = JSON.parse(analyticsData);
            return {
                pageViews: data.pageViews || [],
                events: data.events || [],
                totalVisits: data.metadata.totalPageViews || 0
            };
        } catch (error) {
            console.error('Error reading analytics for personalization:', error);
            return null;
        }
    }

    /**
     * Analyze user interests based on page views
     */
    analyzeInterests() {
        const patterns = this.getBrowsingPatterns();
        if (!patterns || patterns.totalVisits < 3) {
            return null; // Need at least 3 visits for personalization
        }

        const interests = {
            civic: 0,
            jobs: 0,
            learning: 0,
            cooperatives: 0,
            democracy: 0,
            privacy: 0,
            faq: 0
        };

        // Analyze page views
        patterns.pageViews.forEach(pv => {
            const url = pv.page.url.toLowerCase();
            const title = (pv.page.title || '').toLowerCase();
            
            if (url.includes('civic') || url.includes('#civic') || title.includes('civic')) {
                interests.civic++;
            }
            if (url.includes('jobs') || url.includes('#jobs') || title.includes('job')) {
                interests.jobs++;
            }
            if (url.includes('learning') || title.includes('learning') || title.includes('resource')) {
                interests.learning++;
            }
            if (title.includes('cooperative') || title.includes('coop')) {
                interests.cooperatives++;
            }
            if (title.includes('democracy') || title.includes('democratic')) {
                interests.democracy++;
            }
            if (url.includes('privacy') || title.includes('privacy')) {
                interests.privacy++;
            }
            if (url.includes('faq') || title.includes('faq')) {
                interests.faq++;
            }
        });

        // Analyze events for deeper insights
        patterns.events.forEach(evt => {
            if (evt.category === 'navigation' && evt.label) {
                const label = evt.label.toLowerCase();
                if (label.includes('civic')) interests.civic++;
                if (label.includes('job')) interests.jobs++;
                if (label.includes('coop')) interests.cooperatives++;
            }
        });

        // Normalize and rank interests
        const ranked = Object.entries(interests)
            .filter(([key, value]) => value > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value]) => key);

        return {
            topInterests: ranked.slice(0, 3),
            scores: interests,
            totalEngagement: patterns.totalVisits
        };
    }

    /**
     * Get personalized recommendations for Learning page
     */
    getLearningRecommendations() {
        const interests = this.analyzeInterests();
        if (!interests) return null;

        const recommendations = {
            suggestedTopics: [],
            reason: ''
        };

        // Based on top interest, suggest relevant topics
        if (interests.topInterests.includes('civic')) {
            recommendations.suggestedTopics.push(
                'Government Accountability',
                'Civic Participation',
                'Democratic Processes'
            );
            recommendations.reason = 'Based on your interest in civic engagement';
        }

        if (interests.topInterests.includes('jobs') || interests.topInterests.includes('cooperatives')) {
            recommendations.suggestedTopics.push(
                'Worker Cooperatives',
                'Democratic Workplaces',
                'Employee Ownership'
            );
            recommendations.reason = 'Based on your interest in democratic workplaces';
        }

        if (interests.topInterests.includes('democracy')) {
            recommendations.suggestedTopics.push(
                'Participatory Democracy',
                'Economic Democracy',
                'Collective Decision-Making'
            );
            recommendations.reason = 'Based on your interest in democracy';
        }

        if (interests.topInterests.includes('privacy')) {
            recommendations.suggestedTopics.push(
                'Data Privacy',
                'Digital Rights',
                'Privacy-First Technology'
            );
            recommendations.reason = 'Based on your interest in privacy';
        }

        return recommendations.suggestedTopics.length > 0 ? recommendations : null;
    }

    /**
     * Get personalized FAQ ordering
     */
    getFAQRecommendations() {
        const interests = this.analyzeInterests();
        if (!interests) return null;

        const priorityCategories = [];

        // Prioritize FAQ categories based on interests
        if (interests.topInterests.includes('civic')) {
            priorityCategories.push('voting', 'government', 'transparency');
        }

        if (interests.topInterests.includes('jobs') || interests.topInterests.includes('cooperatives')) {
            priorityCategories.push('cooperatives', 'jobs', 'workplaces');
        }

        if (interests.topInterests.includes('privacy')) {
            priorityCategories.push('privacy', 'data', 'security');
        }

        return {
            priorityCategories: priorityCategories,
            reason: `Showing FAQs relevant to your interests: ${interests.topInterests.join(', ')}`
        };
    }

    /**
     * Get "Continue where you left off" suggestion
     */
    getContinueSuggestion() {
        const patterns = this.getBrowsingPatterns();
        if (!patterns || patterns.pageViews.length < 2) return null;

        // Get last visited page (excluding current page)
        const currentUrl = window.location.pathname;
        const recentPages = patterns.pageViews
            .filter(pv => pv.page.url !== currentUrl)
            .slice(-5); // Last 5 pages

        if (recentPages.length === 0) return null;

        const lastPage = recentPages[recentPages.length - 1];
        
        return {
            url: lastPage.page.url,
            title: lastPage.page.title,
            timestamp: lastPage.timestamp
        };
    }

    /**
     * Get popular content for homepage personalization
     */
    getPopularContent() {
        const patterns = this.getBrowsingPatterns();
        if (!patterns || patterns.totalVisits < 5) return null;

        // Count page visits
        const pageCounts = {};
        patterns.pageViews.forEach(pv => {
            const url = pv.page.url;
            pageCounts[url] = (pageCounts[url] || 0) + 1;
        });

        // Get top 3 pages
        const topPages = Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([url, count]) => ({
                url: url,
                visits: count
            }));

        return topPages;
    }

    /**
     * Display personalization banner on Learning page
     */
    displayLearningBanner() {
        const recommendations = this.getLearningRecommendations();
        if (!recommendations) return;

        const banner = document.createElement('div');
        banner.className = 'personalization-banner';
        banner.innerHTML = `
            <div class="personalization-content">
                <h3>📚 Recommended for You</h3>
                <p>${recommendations.reason}</p>
                <div class="recommended-topics">
                    ${recommendations.suggestedTopics.map(topic => `
                        <span class="topic-badge">${topic}</span>
                    `).join('')}
                </div>
            </div>
            <button class="close-banner" onclick="this.parentElement.style.display='none'">×</button>
        `;

        // Insert at top of main content
        const mainContent = document.querySelector('main') || document.querySelector('.container');
        if (mainContent) {
            mainContent.insertBefore(banner, mainContent.firstChild);
        }
    }

    /**
     * Display "Continue where you left off" on homepage
     */
    displayContinueBanner() {
        const suggestion = this.getContinueSuggestion();
        if (!suggestion) return;

        const timeDiff = Date.now() - suggestion.timestamp;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        
        let timeText = '';
        if (hours < 1) {
            timeText = 'just now';
        } else if (hours < 24) {
            timeText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(hours / 24);
            timeText = `${days} day${days > 1 ? 's' : ''} ago`;
        }

        const banner = document.createElement('div');
        banner.className = 'continue-banner';
        banner.innerHTML = `
            <div class="continue-content">
                <span class="continue-icon">↩️</span>
                <div class="continue-text">
                    <strong>Continue where you left off</strong>
                    <p>${suggestion.title} • ${timeText}</p>
                </div>
                <a href="${suggestion.url}" class="continue-button">Continue</a>
            </div>
            <button class="close-banner" onclick="this.parentElement.style.display='none'">×</button>
        `;

        // Insert after header
        const header = document.querySelector('.site-header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(banner, header.nextSibling);
        }
    }

    /**
     * Initialize personalization features
     */
    init() {
        const currentPage = window.location.pathname;

        // Add personalization styles
        this.injectStyles();

        // Apply personalization based on page
        if (currentPage.includes('learning.html')) {
            this.displayLearningBanner();
        } else if (currentPage === '/' || currentPage.includes('index.html')) {
            this.displayContinueBanner();
        }

        console.log('📊 Analytics-driven personalization initialized');
    }

    /**
     * Inject personalization styles
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .personalization-banner,
            .continue-banner {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                border-left: 4px solid var(--primary, #667eea);
                padding: 1.5rem;
                margin: 2rem 0;
                border-radius: 8px;
                position: relative;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .personalization-content h3,
            .continue-content strong {
                color: var(--text, #2d3748);
                margin-bottom: 0.5rem;
                font-size: 1.25rem;
            }

            .personalization-content p,
            .continue-content p {
                color: var(--text-secondary, #4a5568);
                margin: 0.5rem 0;
            }

            .recommended-topics {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-top: 1rem;
            }

            .topic-badge {
                background: var(--primary, #667eea);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
            }

            .continue-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .continue-icon {
                font-size: 2rem;
            }

            .continue-text {
                flex: 1;
            }

            .continue-text strong {
                display: block;
                margin-bottom: 0.25rem;
            }

            .continue-text p {
                font-size: 0.875rem;
                margin: 0;
            }

            .continue-button {
                background: var(--primary, #667eea);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .continue-button:hover {
                background: var(--primary-dark, #764ba2);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            .close-banner {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-light, #718096);
                cursor: pointer;
                padding: 0.5rem;
                line-height: 1;
            }

            .close-banner:hover {
                color: var(--text, #2d3748);
            }

            @media (max-width: 768px) {
                .continue-content {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .continue-button {
                    width: 100%;
                    text-align: center;
                }

                .recommended-topics {
                    flex-direction: column;
                }

                .topic-badge {
                    display: block;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize personalization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for analytics to be initialized first
        setTimeout(() => {
            if (window.wdpAnalytics) {
                window.wdpPersonalization = new AnalyticsPersonalization();
                window.wdpPersonalization.init();
            }
        }, 1000);
    });
} else {
    setTimeout(() => {
        if (window.wdpAnalytics) {
            window.wdpPersonalization = new AnalyticsPersonalization();
            window.wdpPersonalization.init();
        }
    }, 1000);
}
