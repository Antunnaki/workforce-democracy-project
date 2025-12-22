/**
 * Consolidated Civic Platform Components
 * 
 * This file contains the remaining frontend components:
 * - UserDashboard: Civic engagement tracking hub
 * - BillTracker: Browse and track legislation
 * - FactChecker: User-submitted claim verification
 * 
 * These are streamlined versions ready for immediate use.
 * Each can be split into separate files later if needed.
 */

/**
 * User Dashboard Component
 * Central hub for civic engagement
 */
class UserDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.userId = this.getUserId();
        this.userVotes = [];
        this.representatives = [];
        this.preferences = {};
    }
    
    getUserId() {
        // Get or create user ID from localStorage
        let userId = localStorage.getItem('civic_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(7);
            localStorage.setItem('civic_user_id', userId);
        }
        return userId;
    }
    
    async loadUserData() {
        try {
            // Fetch user votes
            const votesResponse = await fetch(`/api/civic/user-votes/${this.userId}`);
            const votesData = await votesResponse.json();
            this.userVotes = votesData.data?.votes || [];
            
            // Load preferences from localStorage
            const savedPrefs = localStorage.getItem('civic_preferences');
            this.preferences = savedPrefs ? JSON.parse(savedPrefs) : {
                issuesPriority: ['worker_rights', 'healthcare', 'environment', 'education']
            };
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    async render() {
        await this.loadUserData();
        
        this.container.innerHTML = `
            <div class="user-dashboard">
                <div class="dashboard-header">
                    <h1><i class="fas fa-tachometer-alt"></i> My Civic Dashboard</h1>
                    <p>Track your engagement and representative alignment</p>
                </div>
                
                <div class="dashboard-grid">
                    <!-- Engagement Stats -->
                    <div class="dashboard-card">
                        <h3><i class="fas fa-chart-line"></i> Your Engagement</h3>
                        <div class="engagement-stats">
                            <div class="stat-box">
                                <span class="stat-number">${this.userVotes.length}</span>
                                <span class="stat-label">Bills Voted On</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-number">${this.representatives.length}</span>
                                <span class="stat-label">Representatives Tracked</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-number">0</span>
                                <span class="stat-label">Claims Fact-Checked</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Your Representatives -->
                    <div class="dashboard-card">
                        <h3><i class="fas fa-users"></i> Your Representatives</h3>
                        <button class="btn btn-primary" id="findMyReps">
                            <i class="fas fa-search"></i> Find My Representatives
                        </button>
                        <div id="repsList"></div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="dashboard-card">
                        <h3><i class="fas fa-history"></i> Recent Activity</h3>
                        ${this.userVotes.length > 0 ? `
                            <div class="activity-list">
                                ${this.userVotes.slice(0, 5).map(vote => `
                                    <div class="activity-item">
                                        <i class="fas fa-vote-yea"></i>
                                        <span>Voted ${vote.position} on ${vote.billId}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="no-activity">No activity yet. Start by voting on bills!</p>
                        `}
                    </div>
                    
                    <!-- Issue Priorities -->
                    <div class="dashboard-card">
                        <h3><i class="fas fa-star"></i> Your Issue Priorities</h3>
                        <div class="priorities-list">
                            ${this.preferences.issuesPriority?.map((issue, index) => `
                                <div class="priority-item">
                                    <span class="priority-rank">${index + 1}</span>
                                    <span class="priority-name">${this.formatIssueName(issue)}</span>
                                </div>
                            `).join('') || '<p>Set your priorities to find aligned representatives</p>'}
                        </div>
                        <button class="btn btn-secondary" id="editPriorities">
                            <i class="fas fa-edit"></i> Edit Priorities
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        document.getElementById('findMyReps')?.addEventListener('click', () => {
            this.findRepresentatives();
        });
        
        document.getElementById('editPriorities')?.addEventListener('click', () => {
            this.editPriorities();
        });
    }
    
    findRepresentatives() {
        const address = prompt('Enter your address or ZIP code:');
        if (address) {
            // TODO: Integrate with Congress.gov representative lookup
            alert('Representative lookup coming soon! Address: ' + address);
        }
    }
    
    editPriorities() {
        alert('Priority editing interface coming soon!');
    }
    
    formatIssueName(issue) {
        return issue.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

/**
 * Bill Tracker Component
 * Browse and track legislation
 */
class BillTracker {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.bills = [];
        this.filters = {
            category: 'all',
            status: 'all',
            search: ''
        };
    }
    
    async loadBills() {
        try {
            const response = await fetch('/api/civic/bills/search?' + new URLSearchParams(this.filters));
            const data = await response.json();
            this.bills = data.results || [];
        } catch (error) {
            console.error('Error loading bills:', error);
        }
    }
    
    async render() {
        await this.loadBills();
        
        this.container.innerHTML = `
            <div class="bill-tracker">
                <div class="tracker-header">
                    <h1><i class="fas fa-gavel"></i> Federal Legislation Tracker</h1>
                    <p>Track bills and compare your positions to your representatives</p>
                </div>
                
                <!-- Filters -->
                <div class="bill-filters">
                    <input 
                        type="text" 
                        id="billSearch" 
                        placeholder="Search bills..." 
                        class="search-input"
                        value="${this.filters.search}"
                    >
                    
                    <select id="billCategory" class="filter-select">
                        <option value="all">All Categories</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="labor">Labor & Employment</option>
                        <option value="environment">Environment</option>
                        <option value="education">Education</option>
                        <option value="economy">Economy</option>
                        <option value="civil_rights">Civil Rights</option>
                    </select>
                    
                    <select id="billStatus" class="filter-select">
                        <option value="all">All Statuses</option>
                        <option value="introduced">Introduced</option>
                        <option value="committee">In Committee</option>
                        <option value="passed_house">Passed House</option>
                        <option value="passed_senate">Passed Senate</option>
                        <option value="enacted">Enacted</option>
                    </select>
                </div>
                
                <!-- Bills List -->
                <div class="bills-list">
                    ${this.bills.length === 0 ? `
                        <div class="no-bills">
                            <i class="fas fa-inbox fa-3x"></i>
                            <p>Bills data integration in progress</p>
                            <p><small>Congress.gov API integration pending</small></p>
                        </div>
                    ` : this.renderBillsList()}
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    renderBillsList() {
        return this.bills.map(bill => `
            <div class="bill-card">
                <div class="bill-header">
                    <span class="bill-number">${bill.number}</span>
                    <span class="bill-status status-${bill.status}">${bill.status}</span>
                </div>
                <h3>${bill.title}</h3>
                <p class="bill-summary">${bill.summary || 'Summary not available'}</p>
                <div class="bill-actions">
                    <button class="btn btn-sm btn-vote-yea" data-bill="${bill.id}">
                        <i class="fas fa-thumbs-up"></i> Support
                    </button>
                    <button class="btn btn-sm btn-vote-nay" data-bill="${bill.id}">
                        <i class="fas fa-thumbs-down"></i> Oppose
                    </button>
                    <button class="btn btn-sm btn-neutral" data-bill="${bill.id}">
                        <i class="fas fa-info-circle"></i> Learn More
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    attachEventListeners() {
        // Search input
        document.getElementById('billSearch')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.debounceSearch();
        });
        
        // Category filter
        document.getElementById('billCategory')?.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.render();
        });
        
        // Status filter
        document.getElementById('billStatus')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.render();
        });
        
        // Vote buttons
        this.container.querySelectorAll('.btn-vote-yea, .btn-vote-nay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const billId = e.target.closest('button').dataset.bill;
                const position = e.target.closest('button').classList.contains('btn-vote-yea') ? 'yea' : 'nay';
                this.recordVote(billId, position);
            });
        });
    }
    
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.render();
        }, 500);
    }
    
    async recordVote(billId, position) {
        try {
            const userId = localStorage.getItem('civic_user_id');
            const response = await fetch('/api/civic/user-votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billId, position, userId })
            });
            
            if (response.ok) {
                alert(`Vote recorded: ${position.toUpperCase()} on ${billId}`);
            }
        } catch (error) {
            console.error('Error recording vote:', error);
        }
    }
}

/**
 * Fact Checker Component
 * User-submitted claim verification
 */
class FactChecker {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.llmAssistant = null; // Will be initialized with LLM assistant
    }
    
    render() {
        this.container.innerHTML = `
            <div class="fact-checker">
                <div class="fact-checker-header">
                    <h1><i class="fas fa-search"></i> Fact Check Claims</h1>
                    <p>Combat misinformation with multi-source verification</p>
                </div>
                
                <!-- Submit Claim Form -->
                <div class="fact-check-form">
                    <h3>Submit a Claim to Verify</h3>
                    <textarea 
                        id="claimInput" 
                        placeholder="Enter a political claim to fact-check (max 500 characters)..."
                        maxlength="500"
                        rows="4"
                    ></textarea>
                    <div class="form-footer">
                        <span class="char-count">
                            <span id="charCount">0</span>/500 characters
                        </span>
                        <button class="btn btn-primary" id="factCheckBtn">
                            <i class="fas fa-check-circle"></i> Fact Check
                        </button>
                    </div>
                </div>
                
                <!-- Results Container -->
                <div class="fact-check-results" id="factCheckResults" style="display: none;">
                    <!-- Results will be inserted here -->
                </div>
                
                <!-- Trending Misinformation -->
                <div class="trending-section">
                    <h3><i class="fas fa-fire"></i> Trending Fact-Checks</h3>
                    <div id="trendingTopics">
                        <p class="loading">Loading trending topics...</p>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
        this.loadTrendingTopics();
    }
    
    attachEventListeners() {
        // Character counter
        document.getElementById('claimInput').addEventListener('input', (e) => {
            document.getElementById('charCount').textContent = e.target.value.length;
        });
        
        // Fact check button
        document.getElementById('factCheckBtn').addEventListener('click', () => {
            this.factCheckClaim();
        });
    }
    
    async factCheckClaim() {
        const claim = document.getElementById('claimInput').value.trim();
        
        if (!claim) {
            alert('Please enter a claim to fact-check');
            return;
        }
        
        if (claim.length < 10) {
            alert('Claim must be at least 10 characters');
            return;
        }
        
        // Show loading
        const resultsDiv = document.getElementById('factCheckResults');
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-circle-notch fa-spin fa-3x"></i>
                <p>Checking claim across multiple fact-checking sources...</p>
                <small>This may take 10-20 seconds</small>
            </div>
        `;
        
        try {
            // Call fact-check API
            const response = await fetch('/api/civic/fact-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    claim,
                    options: { includeContext: true }
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayFactCheckResults(data.data);
            } else {
                throw new Error(data.error || 'Fact-check failed');
            }
            
        } catch (error) {
            console.error('Fact-check error:', error);
            resultsDiv.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <p>Error: ${error.message}</p>
                    <button class="btn btn-secondary" onclick="document.getElementById('factCheckResults').style.display='none';">
                        Close
                    </button>
                </div>
            `;
        }
    }
    
    displayFactCheckResults(results) {
        const resultsDiv = document.getElementById('factCheckResults');
        
        const statusIcons = {
            'true': 'check-circle',
            'false': 'times-circle',
            'mixed': 'exclamation-circle',
            'unverifiable': 'question-circle'
        };
        
        const statusColors = {
            'true': 'success',
            'false': 'danger',
            'mixed': 'warning',
            'unverifiable': 'neutral'
        };
        
        resultsDiv.innerHTML = `
            <div class="fact-check-result">
                <div class="result-header status-${statusColors[results.status]}">
                    <i class="fas fa-${statusIcons[results.status]} fa-3x"></i>
                    <div>
                        <h2>Status: ${results.status.toUpperCase()}</h2>
                        <p class="confidence">Confidence: ${results.confidence}%</p>
                    </div>
                </div>
                
                <div class="result-claim">
                    <h4>Claim Checked:</h4>
                    <p>"${results.claim}"</p>
                </div>
                
                <div class="result-message">
                    <p>${results.message}</p>
                </div>
                
                ${results.context?.summary ? `
                    <div class="result-context">
                        <h4><i class="fas fa-robot"></i> AI Context Analysis:</h4>
                        <p>${results.context.summary}</p>
                        <small>Powered by ${results.context.provider} ${results.context.model}</small>
                    </div>
                ` : ''}
                
                ${results.sources && results.sources.length > 0 ? `
                    <div class="result-sources">
                        <h4><i class="fas fa-link"></i> Sources (${results.sources.length}):</h4>
                        <div class="sources-list">
                            ${results.sources.map(source => `
                                <div class="source-item">
                                    <div class="source-header">
                                        <strong>${source.source}</strong>
                                        ${source.rating ? `<span class="rating-badge rating-${source.rating}">${source.rating}</span>` : ''}
                                    </div>
                                    <a href="${source.url}" target="_blank">${source.title}</a>
                                    ${source.snippet ? `<p class="source-snippet">${source.snippet}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="result-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('claimInput').value=''; document.getElementById('factCheckResults').style.display='none';">
                        <i class="fas fa-redo"></i> Check Another Claim
                    </button>
                    <button class="btn btn-secondary" onclick="navigator.share ? navigator.share({text: document.getElementById('claimInput').value}) : alert('Share not supported')">
                        <i class="fas fa-share-alt"></i> Share Results
                    </button>
                </div>
            </div>
        `;
    }
    
    async loadTrendingTopics() {
        try {
            const response = await fetch('/api/civic/fact-check/trending');
            const data = await response.json();
            
            const trendingDiv = document.getElementById('trendingTopics');
            
            if (data.success && data.data.topics && data.data.topics.length > 0) {
                trendingDiv.innerHTML = `
                    <div class="trending-topics">
                        ${data.data.topics.map(topic => `
                            <button class="topic-badge" data-topic="${topic.topic}">
                                ${topic.topic} (${topic.count})
                            </button>
                        `).join('')}
                    </div>
                `;
                
                // Add click handlers
                trendingDiv.querySelectorAll('.topic-badge').forEach(badge => {
                    badge.addEventListener('click', (e) => {
                        document.getElementById('claimInput').value = e.target.dataset.topic;
                    });
                });
            } else {
                trendingDiv.innerHTML = '<p class="no-data">No trending topics available</p>';
            }
        } catch (error) {
            console.error('Error loading trending topics:', error);
            document.getElementById('trendingTopics').innerHTML = '<p class="error">Failed to load trending topics</p>';
        }
    }
}

// Export components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserDashboard, BillTracker, FactChecker };
}
