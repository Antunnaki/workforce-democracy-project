/**
 * News Feed UI Controller
 * Handles news display, filtering, and user interactions
 * 
 * Version: 1.0.0
 * Last Updated: 2026-01-13
 */

class NewsUI {
    constructor() {
        this.newsFeed = new NewsFeed();
        this.currentFilters = {};
        this.init();
    }

    async init() {
        console.log('[NewsUI] Initializing...');
        
        // Load sources first
        const sourcesLoaded = await this.newsFeed.loadSources();
        
        if (!sourcesLoaded) {
            this.showError('Failed to load news sources. Please try again.');
            return;
        }

        // Load initial articles
        await this.loadArticles();

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Filter changes
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value || null;
            this.applyFilters();
        });

        document.getElementById('countryFilter').addEventListener('change', (e) => {
            this.currentFilters.country = e.target.value || null;
            this.applyFilters();
        });

        document.getElementById('biasFilter').addEventListener('change', (e) => {
            this.currentFilters.bias = e.target.value || null;
            this.applyFilters();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.newsFeed.clearCache();
            this.loadArticles();
        });

        // Clear cache button
        document.getElementById('clearCacheBtn').addEventListener('click', () => {
            this.newsFeed.clearCache();
            alert('✅ Cache cleared! Click "Refresh News" to load fresh articles.');
        });
    }

    async loadArticles() {
        this.showLoading();

        try {
            // Fetch articles with current filters
            const filters = {};
            if (this.currentFilters.category) filters.category = this.currentFilters.category;
            if (this.currentFilters.country) filters.country = this.currentFilters.country;

            await this.newsFeed.fetchArticles(filters);
            
            // Apply additional client-side filters (bias)
            this.applyFilters();

        } catch (error) {
            console.error('[NewsUI] Error loading articles:', error);
            this.showError(error.message);
        }
    }

    applyFilters() {
        let articles = this.newsFeed.articles;

        // Filter by bias if selected
        if (this.currentFilters.bias) {
            articles = articles.filter(a => a.source.bias === this.currentFilters.bias);
        }

        this.displayArticles(articles);
    }

    displayArticles(articles) {
        const grid = document.getElementById('articlesGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const errorState = document.getElementById('errorState');

        // Hide all states
        loadingState.classList.add('hidden');
        emptyState.classList.add('hidden');
        errorState.classList.add('hidden');
        grid.classList.add('hidden');

        // Update stats
        this.updateStats(articles);

        if (articles.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        // Clear grid
        grid.innerHTML = '';

        // Create article cards
        articles.forEach(article => {
            const card = this.createArticleCard(article);
            grid.appendChild(card);
        });

        grid.classList.remove('hidden');
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = `article-card bg-white rounded-lg shadow-md overflow-hidden ${this.getAccuracyClass(article.source.factualAccuracy)}`;

        const biasClass = this.getBiasClass(article.source.bias);
        const timeAgo = this.getTimeAgo(new Date(article.pubDate));

        card.innerHTML = `
            ${article.image ? `
                <div class="h-48 bg-gray-200 overflow-hidden">
                    <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover" 
                         onerror="this.parentElement.style.display='none'">
                </div>
            ` : ''}
            
            <div class="p-5">
                <!-- Source Info -->
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-semibold text-gray-700">${article.source.name}</span>
                        <span class="bias-label ${biasClass}">${article.source.bias}</span>
                    </div>
                    <span class="text-xs text-gray-500">${timeAgo}</span>
                </div>

                <!-- Title -->
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    ${article.title}
                </h3>

                <!-- Description -->
                <p class="text-sm text-gray-600 mb-4 line-clamp-3">
                    ${article.description}
                </p>

                <!-- Footer -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2 text-xs text-gray-500">
                        ${article.category.map(cat => `
                            <span class="bg-gray-100 px-2 py-1 rounded">${this.getCategoryIcon(cat)} ${cat}</span>
                        `).join('')}
                    </div>
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" 
                       class="text-purple-600 hover:text-purple-800 font-semibold text-sm">
                        Read More →
                    </a>
                </div>

                <!-- Accuracy Badge -->
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <span class="text-xs text-gray-600">
                        ✅ Factual Accuracy: <strong>${article.source.factualAccuracy}</strong>
                    </span>
                </div>
            </div>
        `;

        return card;
    }

    getBiasClass(bias) {
        const normalized = bias.toLowerCase().replace(/\s+/g, '-');
        return `bias-${normalized}`;
    }

    getAccuracyClass(accuracy) {
        const normalized = accuracy.toLowerCase().replace(/\s+/g, '-');
        return `accuracy-${normalized}`;
    }

    getCategoryIcon(category) {
        const icons = {
            civic: '🏛️',
            labor: '💼',
            business: '🌱',
            investigative: '🔍',
            general: '📰',
            government: '🏛️',
            democracy: '🗳️',
            workplace: '💼',
            education: '📚',
            progressive: '🌟'
        };
        return icons[category] || '📰';
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    updateStats(articles) {
        // Count unique sources
        const uniqueSources = new Set(articles.map(a => a.source.id));
        
        document.getElementById('articleCount').textContent = articles.length;
        document.getElementById('sourceCount').textContent = uniqueSources.size;
    }

    showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('articlesGrid').classList.add('hidden');
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('errorState').classList.remove('hidden');
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('articlesGrid').classList.add('hidden');
        document.getElementById('emptyState').classList.add('hidden');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[NewsUI] DOM ready, initializing...');
    window.newsUI = new NewsUI();
});
