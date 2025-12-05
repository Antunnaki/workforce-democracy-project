/**
 * BIAS LABELS SYSTEM
 * Helper functions for displaying source bias classification badges
 * 5-Tier Taxonomy from Workforce Democracy Project
 */

const BiasLabels = {
    /**
     * Source classification definitions
     * Matches backend rss-service.js taxonomy
     */
    classifications: {
        'independent_progressive': {
            label: 'Independent Progressive',
            icon: '✊',
            trustLevel: 'Highest',
            useForAnalysis: true,
            cssClass: 'badge-independent-progressive',
            description: 'Independent progressive journalism - highest trust',
            examples: ['Democracy Now', 'The Intercept', 'Common Dreams']
        },
        'state_nonwestern': {
            label: 'State Media (Non-Western)',
            icon: '🌍',
            trustLevel: 'High',
            useForAnalysis: true,
            cssClass: 'badge-state-nonwestern',
            description: 'Non-Western state media - provides alternative perspectives',
            examples: ['Al Jazeera', 'TRT World']
        },
        'wire_service': {
            label: 'Wire Service',
            icon: '📡',
            trustLevel: 'High',
            useForAnalysis: true,
            cssClass: 'badge-wire-service',
            description: 'Traditional wire services - factual reporting',
            examples: ['AP News', 'Reuters', 'UPI']
        },
        'establishment_liberal': {
            label: 'Establishment Liberal',
            icon: '⚠️',
            trustLevel: 'Medium',
            useForAnalysis: false,
            cssClass: 'badge-establishment-liberal',
            description: 'Pro-establishment bias - verify progressive claims',
            examples: ['The Guardian', 'NPR', 'Washington Post']
        },
        'state_western': {
            label: 'State Media (Western)',
            icon: '⚠️',
            trustLevel: 'Medium',
            useForAnalysis: false,
            cssClass: 'badge-state-western',
            description: 'Western state media - NATO bias warning',
            examples: ['BBC', 'Deutsche Welle', 'ABC Australia']
        }
    },

    /**
     * Create a bias badge element
     * @param {string} classification - Classification key (e.g., 'independent_progressive')
     * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
     * @returns {HTMLElement} Badge element
     */
    createBadge(classification, size = 'md') {
        const config = this.classifications[classification];
        if (!config) {
            console.warn(`Unknown classification: ${classification}`);
            return this.createUnknownBadge();
        }

        const badge = document.createElement('span');
        badge.className = `bias-badge ${config.cssClass}`;
        if (size !== 'md') {
            badge.classList.add(`bias-badge-${size}`);
        }

        badge.title = `${config.description} (Trust: ${config.trustLevel}, ` +
                      `Use for analysis: ${config.useForAnalysis ? 'Yes' : 'No'})`;

        badge.innerHTML = `
            <span class="bias-badge-icon">${config.icon}</span>
            <span class="bias-badge-text">${config.label}</span>
        `;

        return badge;
    },

    /**
     * Create an unknown/fallback badge
     * @returns {HTMLElement} Fallback badge
     */
    createUnknownBadge() {
        const badge = document.createElement('span');
        badge.className = 'bias-badge badge-establishment-liberal';
        badge.title = 'Unknown source classification';
        badge.innerHTML = `
            <span class="bias-badge-icon">❓</span>
            <span class="bias-badge-text">Unknown</span>
        `;
        return badge;
    },

    /**
     * Create a fact-checking warning badge
     * @param {string} message - Warning message
     * @returns {HTMLElement} Warning badge
     */
    createWarning(message) {
        const warning = document.createElement('div');
        warning.className = 'fact-check-warning';
        warning.innerHTML = `
            <span class="fact-check-warning-icon">⚠️</span>
            <span>${message}</span>
        `;
        return warning;
    },

    /**
     * Render source badges in a container
     * @param {Array} sources - Array of source objects with 'name' and 'classification' properties
     * @param {HTMLElement} container - Container element to render into
     * @param {string} size - Badge size
     */
    renderSourceBadges(sources, container, size = 'md') {
        container.innerHTML = '';

        sources.forEach(source => {
            const sourceItem = document.createElement('div');
            sourceItem.className = 'source-item';

            const sourceName = document.createElement('div');
            sourceName.className = 'source-name';
            sourceName.textContent = source.name;

            const badgesContainer = document.createElement('div');
            badgesContainer.className = 'source-badges';

            const badge = this.createBadge(source.classification, size);
            badgesContainer.appendChild(badge);

            // Add warning for sources not to use for analysis
            const config = this.classifications[source.classification];
            if (config && !config.useForAnalysis) {
                const warning = document.createElement('span');
                warning.className = 'bias-badge badge-legend-use use-no';
                warning.textContent = 'Verify claims';
                warning.title = 'Do not use for deep analysis - verify progressive claims';
                badgesContainer.appendChild(warning);
            }

            sourceItem.appendChild(sourceName);
            sourceItem.appendChild(badgesContainer);
            container.appendChild(sourceItem);
        });
    },

    /**
     * Render badge legend/key
     * @param {HTMLElement} container - Container element
     */
    renderLegend(container) {
        const legend = document.createElement('div');
        legend.className = 'badge-legend';

        const title = document.createElement('div');
        title.className = 'badge-legend-title';
        title.textContent = '📊 Source Classification Guide';
        legend.appendChild(title);

        Object.entries(this.classifications).forEach(([key, config]) => {
            const item = document.createElement('div');
            item.className = 'badge-legend-item';

            const badge = this.createBadge(key, 'sm');
            item.appendChild(badge);

            const description = document.createElement('div');
            description.className = 'badge-legend-description';
            description.textContent = config.description;
            item.appendChild(description);

            const useIndicator = document.createElement('span');
            useIndicator.className = `badge-legend-use ${config.useForAnalysis ? 'use-yes' : 'use-no'}`;
            useIndicator.textContent = config.useForAnalysis ? 'Use for analysis' : 'Do not use';
            item.appendChild(useIndicator);

            legend.appendChild(item);
        });

        container.appendChild(legend);
    },

    /**
     * Get color scheme for a classification
     * @param {string} classification - Classification key
     * @returns {Object} Color object with primary, secondary, text
     */
    getColors(classification) {
        const colorMap = {
            'independent_progressive': {
                primary: '#10b981',
                secondary: '#059669',
                text: '#ffffff'
            },
            'state_nonwestern': {
                primary: '#3b82f6',
                secondary: '#2563eb',
                text: '#ffffff'
            },
            'wire_service': {
                primary: '#8b5cf6',
                secondary: '#7c3aed',
                text: '#ffffff'
            },
            'establishment_liberal': {
                primary: '#f59e0b',
                secondary: '#d97706',
                text: '#ffffff'
            },
            'state_western': {
                primary: '#ef4444',
                secondary: '#dc2626',
                text: '#ffffff'
            }
        };

        return colorMap[classification] || {
            primary: '#6b7280',
            secondary: '#4b5563',
            text: '#ffffff'
        };
    },

    /**
     * Filter sources by trust level
     * @param {Array} sources - Array of source objects
     * @param {string} minTrust - Minimum trust level: 'Highest', 'High', 'Medium'
     * @returns {Array} Filtered sources
     */
    filterByTrust(sources, minTrust) {
        const trustOrder = ['Highest', 'High', 'Medium'];
        const minIndex = trustOrder.indexOf(minTrust);

        return sources.filter(source => {
            const config = this.classifications[source.classification];
            if (!config) return false;
            const sourceIndex = trustOrder.indexOf(config.trustLevel);
            return sourceIndex <= minIndex;
        });
    },

    /**
     * Filter sources suitable for analysis
     * @param {Array} sources - Array of source objects
     * @returns {Array} Filtered sources suitable for analysis
     */
    filterForAnalysis(sources) {
        return sources.filter(source => {
            const config = this.classifications[source.classification];
            return config && config.useForAnalysis;
        });
    },

    /**
     * Group sources by classification
     * @param {Array} sources - Array of source objects
     * @returns {Object} Sources grouped by classification
     */
    groupByClassification(sources) {
        const grouped = {};
        sources.forEach(source => {
            if (!grouped[source.classification]) {
                grouped[source.classification] = [];
            }
            grouped[source.classification].push(source);
        });
        return grouped;
    },

    /**
     * Get statistics about source diversity
     * @param {Array} sources - Array of source objects
     * @returns {Object} Statistics object
     */
    getStatistics(sources) {
        const stats = {
            total: sources.length,
            byClassification: {},
            trustLevels: { Highest: 0, High: 0, Medium: 0 },
            usableForAnalysis: 0
        };

        sources.forEach(source => {
            const config = this.classifications[source.classification];
            if (!config) return;

            // Count by classification
            if (!stats.byClassification[source.classification]) {
                stats.byClassification[source.classification] = 0;
            }
            stats.byClassification[source.classification]++;

            // Count by trust level
            stats.trustLevels[config.trustLevel]++;

            // Count usable for analysis
            if (config.useForAnalysis) {
                stats.usableForAnalysis++;
            }
        });

        return stats;
    }
};

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiasLabels;
}
