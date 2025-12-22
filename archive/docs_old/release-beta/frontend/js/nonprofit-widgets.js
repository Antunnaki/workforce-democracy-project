/**
 * Nonprofit Widgets Integration
 * Compact nonprofit search widgets for ethical business, jobs, and civic sections
 * Workforce Democracy Project
 */

// ============================================================================
// Shared API Functions (lightweight versions)
// ============================================================================

const NonprofitAPI = {
    BASE_URL: 'https://projects.propublica.org/nonprofits/api/v2',
    
    async search(query, limit = 5) {
        try {
            const url = `${this.BASE_URL}/search.json?q=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.organizations?.slice(0, limit) || [];
            
        } catch (error) {
            console.error('Nonprofit search error:', error);
            throw error;
        }
    },
    
    formatCurrency(amount) {
        if (!amount || amount === 0) return 'N/A';
        
        const num = parseInt(amount);
        if (isNaN(num)) return 'N/A';
        
        if (num >= 1000000000) {
            return `$${(num / 1000000000).toFixed(1)}B`;
        } else if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(0)}K`;
        } else {
            return `$${num.toLocaleString()}`;
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
};

// ============================================================================
// Ethical Business Section - Nonprofit Verification Widget
// ============================================================================

class EthicalNonprofitWidget {
    constructor() {
        this.searchInput = document.getElementById('ethicalNonprofitSearch');
        this.searchBtn = document.getElementById('ethicalNonprofitSearchBtn');
        this.resultsContainer = document.getElementById('ethicalNonprofitResults');
        
        if (this.searchInput && this.searchBtn) {
            this.init();
        }
    }
    
    init() {
        // Search button click
        this.searchBtn.addEventListener('click', () => this.performSearch());
        
        // Enter key in search input
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }
    
    async performSearch() {
        const query = this.searchInput.value.trim();
        
        if (query.length < 2) {
            this.showMessage('Please enter at least 2 characters');
            return;
        }
        
        this.showLoading();
        
        try {
            const results = await NonprofitAPI.search(query, 5);
            
            if (results.length === 0) {
                this.showEmpty();
            } else {
                this.displayResults(results);
            }
            
        } catch (error) {
            this.showError('😊 Oops! We couldn\'t search nonprofits right now. Please try again in a moment. 💙');
        }
    }
    
    showLoading() {
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.innerHTML = `
            <div class="nonprofit-widget-loading">
                <div class="nonprofit-widget-spinner"></div>
                <p>Searching nonprofits...</p>
            </div>
        `;
    }
    
    showEmpty() {
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.innerHTML = `
            <div class="nonprofit-widget-empty">
                <i class="fas fa-search"></i>
                <p>No nonprofits found. Try a different search term.</p>
            </div>
        `;
    }
    
    showError(message) {
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.innerHTML = `
            <div class="nonprofit-widget-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${NonprofitAPI.escapeHtml(message)}</p>
            </div>
        `;
    }
    
    showMessage(message) {
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.innerHTML = `
            <div class="nonprofit-widget-empty">
                <p>${NonprofitAPI.escapeHtml(message)}</p>
            </div>
        `;
    }
    
    displayResults(results) {
        this.resultsContainer.style.display = 'block';
        
        const html = results.map(org => {
            const revenue = NonprofitAPI.formatCurrency(org.revenue_amount);
            const assets = NonprofitAPI.formatCurrency(org.asset_amount);
            const city = org.city || 'Unknown';
            const state = org.state || '';
            const location = state ? `${city}, ${state}` : city;
            
            return `
                <div class="nonprofit-result-card-compact" onclick="window.open('https://projects.propublica.org/nonprofits/organizations/${org.ein}', '_blank')">
                    <div class="nonprofit-result-header-compact">
                        <div class="nonprofit-result-icon-compact">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <div class="nonprofit-result-info-compact">
                            <h4 class="nonprofit-result-name-compact">${NonprofitAPI.escapeHtml(org.name)}</h4>
                            <p class="nonprofit-result-location-compact">
                                <i class="fas fa-map-marker-alt"></i>
                                ${NonprofitAPI.escapeHtml(location)}
                            </p>
                        </div>
                    </div>
                    <div class="nonprofit-result-stats-compact">
                        ${revenue !== 'N/A' ? `
                            <div class="nonprofit-stat-compact">
                                <span class="nonprofit-stat-label-compact">Revenue</span>
                                <span class="nonprofit-stat-value-compact">${revenue}</span>
                            </div>
                        ` : ''}
                        ${assets !== 'N/A' ? `
                            <div class="nonprofit-stat-compact">
                                <span class="nonprofit-stat-label-compact">Assets</span>
                                <span class="nonprofit-stat-value-compact">${assets}</span>
                            </div>
                        ` : ''}
                        <div class="nonprofit-stat-compact">
                            <span class="nonprofit-stat-label-compact">EIN</span>
                            <span class="nonprofit-stat-value-compact">${NonprofitAPI.escapeHtml(org.ein)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.resultsContainer.innerHTML = html;
    }
}

// ============================================================================
// Jobs Section - Nonprofit Employers Widget
// ============================================================================

class NonprofitEmployersWidget {
    constructor() {
        this.container = document.getElementById('nonprofitEmployersWidget');
        
        if (this.container) {
            this.init();
        }
    }
    
    async init() {
        try {
            // Search for employment-focused nonprofits
            const results = await NonprofitAPI.search('employment services', 6);
            this.displayEmployers(results);
            
        } catch (error) {
            console.error('Failed to load nonprofit employers:', error);
        }
    }
    
    displayEmployers(orgs) {
        if (orgs.length === 0) return;
        
        const html = `
            <div class="nonprofit-employers-widget">
                <div class="widget-header">
                    <i class="fas fa-building"></i>
                    <h3>Nonprofit Employers</h3>
                    <p>Explore job opportunities at mission-driven nonprofit organizations</p>
                </div>
                
                <div class="nonprofit-employers-grid">
                    ${orgs.slice(0, 6).map(org => `
                        <div class="nonprofit-employer-card" onclick="window.open('https://projects.propublica.org/nonprofits/organizations/${org.ein}', '_blank')">
                            <h4 class="nonprofit-employer-name">${NonprofitAPI.escapeHtml(org.name)}</h4>
                            <p class="nonprofit-employer-mission">
                                ${NonprofitAPI.escapeHtml(org.city || '')}, ${NonprofitAPI.escapeHtml(org.state || '')}
                            </p>
                            <div class="nonprofit-employer-stats">
                                ${org.revenue_amount ? `
                                    <span class="nonprofit-employer-stat">
                                        Revenue: ${NonprofitAPI.formatCurrency(org.revenue_amount)}
                                    </span>
                                ` : ''}
                                ${org.ntee_code ? `
                                    <span class="nonprofit-employer-stat">
                                        ${NonprofitAPI.escapeHtml(org.ntee_code)}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="nonprofit-widget-cta">
                    <a href="nonprofits.html?category=employment" class="btn-explore-nonprofits">
                        <i class="fas fa-briefcase"></i>
                        Explore More Nonprofit Employers
                    </a>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }
}

// ============================================================================
// Civic Engagement Section - Advocacy Organizations Widget
// ============================================================================

class AdvocacyOrgsWidget {
    constructor() {
        this.container = document.getElementById('advocacyOrgsWidget');
        this.currentCategory = 'civil rights';
        
        if (this.container) {
            this.init();
        }
    }
    
    async init() {
        this.render();
        await this.loadOrganizations(this.currentCategory);
    }
    
    render() {
        this.container.innerHTML = `
            <div class="advocacy-orgs-widget">
                <div class="widget-header">
                    <i class="fas fa-bullhorn"></i>
                    <h3>Advocacy Organizations</h3>
                    <p>Connect with nonprofits working to protect your rights and serve communities</p>
                </div>
                
                <div class="advocacy-orgs-categories">
                    <button class="advocacy-category-btn active" data-category="civil rights">
                        Civil Rights
                    </button>
                    <button class="advocacy-category-btn" data-category="voting rights">
                        Voting Rights
                    </button>
                    <button class="advocacy-category-btn" data-category="labor">
                        Labor Rights
                    </button>
                    <button class="advocacy-category-btn" data-category="community">
                        Community Action
                    </button>
                </div>
                
                <div id="advocacyOrgsResults" class="nonprofit-employers-grid">
                    <!-- Results loaded here -->
                </div>
                
                <div class="nonprofit-widget-cta">
                    <a href="nonprofits.html?category=advocacy" class="btn-explore-nonprofits">
                        <i class="fas fa-users"></i>
                        Explore All Advocacy Organizations
                    </a>
                </div>
            </div>
        `;
        
        // Add category button listeners
        const buttons = this.container.querySelectorAll('.advocacy-category-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                this.loadOrganizations(category);
            });
        });
    }
    
    async loadOrganizations(category) {
        const resultsContainer = document.getElementById('advocacyOrgsResults');
        
        resultsContainer.innerHTML = `
            <div class="nonprofit-widget-loading">
                <div class="nonprofit-widget-spinner"></div>
                <p>Loading organizations...</p>
            </div>
        `;
        
        try {
            const results = await NonprofitAPI.search(category, 6);
            this.displayOrganizations(results);
            
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="nonprofit-widget-empty" style="text-align: center; padding: 2rem;">
                    <span style="font-size: 2rem; display: block; margin-bottom: 0.75rem;">😊</span>
                    <p style="font-weight: 600; margin-bottom: 0.5rem;">Oops! We couldn't load organizations right now</p>
                    <p style="font-size: 0.9rem; color: #6b7280;">Please try again in a moment. 💙</p>
                </div>
            `;
        }
    }
    
    displayOrganizations(orgs) {
        const resultsContainer = document.getElementById('advocacyOrgsResults');
        
        if (orgs.length === 0) {
            resultsContainer.innerHTML = `
                <div class="nonprofit-widget-empty">
                    <p>No organizations found for this category.</p>
                </div>
            `;
            return;
        }
        
        const html = orgs.map(org => `
            <div class="nonprofit-employer-card" onclick="window.open('https://projects.propublica.org/nonprofits/organizations/${org.ein}', '_blank')">
                <h4 class="nonprofit-employer-name">${NonprofitAPI.escapeHtml(org.name)}</h4>
                <p class="nonprofit-employer-mission">
                    ${NonprofitAPI.escapeHtml(org.city || '')}, ${NonprofitAPI.escapeHtml(org.state || '')}
                </p>
                <div class="nonprofit-employer-stats">
                    ${org.revenue_amount ? `
                        <span class="nonprofit-employer-stat">
                            Revenue: ${NonprofitAPI.formatCurrency(org.revenue_amount)}
                        </span>
                    ` : ''}
                    ${org.ntee_code ? `
                        <span class="nonprofit-employer-stat">
                            ${NonprofitAPI.escapeHtml(org.ntee_code)}
                        </span>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        resultsContainer.innerHTML = html;
    }
}

// ============================================================================
// Initialize All Widgets on Page Load
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Initializing nonprofit widgets...');
    
    // Ethical Business section widget
    new EthicalNonprofitWidget();
    
    // Jobs section widget (if container exists)
    new NonprofitEmployersWidget();
    
    // Civic engagement section widget (if container exists)
    new AdvocacyOrgsWidget();
    
    console.log('✅ Nonprofit widgets initialized');
});
