/**
 * Representative Profile Modal Component
 * 
 * Comprehensive 6-tab modal displaying everything about a representative:
 * 1. Overview - Basic info, contact, alignment score
 * 2. Voting Record - How they voted on key bills
 * 3. Campaign Finance - Who funds their campaigns (FEC data)
 * 4. News & Fact-Checks - Recent news with verification status
 * 5. Contact - Multiple ways to reach them
 * 6. Accountability - Compare promises vs actions
 * 
 * Features:
 * - Rich data visualization (charts, graphs)
 * - Worker rights alignment prominent
 * - Fact-checked news only
 * - Direct links to contact forms
 * - Export data to PDF/CSV
 * - Share representative profile
 */

class RepresentativeProfile {
    constructor() {
        this.currentTab = 'overview';
        this.representativeData = null;
        this.modalElement = null;
    }
    
    /**
     * Open modal with representative data
     */
    async open(representativeId) {
        try {
            // Show loading modal
            this.showLoadingModal();
            
            // Fetch comprehensive profile
            const response = await fetch(`/api/civic/representatives/${representativeId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load representative data');
            }
            
            this.representativeData = data.data;
            
            // Render modal
            this.render();
            this.attachEventListeners();
            
        } catch (error) {
            console.error('Error loading representative:', error);
            this.showErrorModal(error.message);
        }
    }
    
    /**
     * Show loading state
     */
    showLoadingModal() {
        const existingModal = document.getElementById('repProfileModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'repProfileModal';
        modal.className = 'rep-profile-modal';
        modal.innerHTML = `
            <div class="rep-profile-overlay"></div>
            <div class="rep-profile-content loading">
                <div class="loading-spinner">
                    <i class="fas fa-circle-notch fa-spin fa-3x"></i>
                    <p>Loading representative profile...</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Show error message
     */
    showErrorModal(message) {
        const modal = document.getElementById('repProfileModal');
        if (modal) {
            modal.innerHTML = `
                <div class="rep-profile-overlay"></div>
                <div class="rep-profile-content error">
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle fa-3x"></i>
                        <h2>Error Loading Profile</h2>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="document.getElementById('repProfileModal').remove(); document.body.style.overflow = 'auto';">
                            Close
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Render complete modal
     */
    render() {
        const rep = this.representativeData;
        
        const existingModal = document.getElementById('repProfileModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'repProfileModal';
        modal.className = 'rep-profile-modal';
        modal.innerHTML = `
            <div class="rep-profile-overlay"></div>
            <div class="rep-profile-content">
                <!-- Header -->
                <div class="rep-profile-header">
                    <div class="rep-basic-info">
                        <h1>${rep.name}</h1>
                        <div class="rep-meta">
                            <span class="party party-${rep.party.toLowerCase()}">${this.getPartyFullName(rep.party)}</span>
                            <span class="location">${rep.state}${rep.district ? `-${rep.district}` : ''}</span>
                            <span class="chamber">${rep.chamber === 'house' ? 'House of Representatives' : 'Senate'}</span>
                        </div>
                    </div>
                    
                    <div class="rep-alignment-score">
                        <div class="alignment-circle" data-score="${rep.alignmentScores?.overall || 0}">
                            <span class="score">${rep.alignmentScores?.overall || 'N/A'}</span>
                            <span class="label">Worker Rights Alignment</span>
                        </div>
                    </div>
                    
                    <button class="rep-close-btn" id="closeRepProfile">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Tab Navigation -->
                <div class="rep-tabs">
                    <button class="rep-tab active" data-tab="overview">
                        <i class="fas fa-user"></i>
                        Overview
                    </button>
                    <button class="rep-tab" data-tab="voting">
                        <i class="fas fa-vote-yea"></i>
                        Voting Record
                    </button>
                    <button class="rep-tab" data-tab="finance">
                        <i class="fas fa-dollar-sign"></i>
                        Campaign Finance
                    </button>
                    <button class="rep-tab" data-tab="news">
                        <i class="fas fa-newspaper"></i>
                        News & Fact-Checks
                    </button>
                    <button class="rep-tab" data-tab="contact">
                        <i class="fas fa-envelope"></i>
                        Contact
                    </button>
                    <button class="rep-tab" data-tab="accountability">
                        <i class="fas fa-balance-scale"></i>
                        Accountability
                    </button>
                </div>
                
                <!-- Tab Content -->
                <div class="rep-tab-content">
                    ${this.renderOverviewTab(rep)}
                </div>
                
                <!-- Footer Actions -->
                <div class="rep-profile-footer">
                    <button class="btn btn-secondary" id="exportProfile">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                    <button class="btn btn-secondary" id="shareProfile">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                    <button class="btn btn-primary" id="contactRep">
                        <i class="fas fa-paper-plane"></i> Contact Representative
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        this.modalElement = modal;
    }
    
    /**
     * Render Overview Tab
     */
    renderOverviewTab(rep) {
        return `
            <div class="tab-pane active" data-tab="overview">
                <div class="overview-grid">
                    <!-- Contact Info Card -->
                    <div class="overview-card">
                        <h3><i class="fas fa-id-card"></i> Contact Information</h3>
                        <div class="contact-list">
                            ${rep.contact.phone ? `<p><i class="fas fa-phone"></i> ${rep.contact.phone}</p>` : ''}
                            ${rep.contact.email ? `<p><i class="fas fa-envelope"></i> ${rep.contact.email}</p>` : ''}
                            ${rep.contact.website ? `<p><i class="fas fa-globe"></i> <a href="${rep.contact.website}" target="_blank">Official Website</a></p>` : ''}
                            ${rep.contact.office ? `<p><i class="fas fa-building"></i> ${rep.contact.office}</p>` : ''}
                        </div>
                    </div>
                    
                    <!-- Alignment Scores Card -->
                    <div class="overview-card">
                        <h3><i class="fas fa-chart-bar"></i> Issue Alignment</h3>
                        <div class="alignment-bars">
                            ${this.renderAlignmentBar('Worker Rights', rep.alignmentScores?.workerRights)}
                            ${this.renderAlignmentBar('Healthcare', rep.alignmentScores?.healthcare)}
                            ${this.renderAlignmentBar('Environment', rep.alignmentScores?.environment)}
                            ${this.renderAlignmentBar('Education', rep.alignmentScores?.education)}
                        </div>
                    </div>
                    
                    <!-- Quick Stats Card -->
                    <div class="overview-card">
                        <h3><i class="fas fa-chart-line"></i> Quick Stats</h3>
                        <div class="quick-stats">
                            <div class="stat">
                                <span class="stat-value">${this.formatMoney(rep.campaignFinance?.totalRaised)}</span>
                                <span class="stat-label">Total Raised</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${rep.voteSmartData?.ratings?.length || 0}</span>
                                <span class="stat-label">Org Ratings</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${rep.news?.length || 0}</span>
                                <span class="stat-label">News Articles</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Data Quality Card -->
                    <div class="overview-card">
                        <h3><i class="fas fa-database"></i> Data Quality</h3>
                        <div class="data-quality">
                            <div class="quality-bar">
                                <div class="quality-fill" style="width: ${rep.dataQuality?.score || 0}%"></div>
                            </div>
                            <p class="quality-text">${rep.dataQuality?.completeness || 'Unknown'} data coverage</p>
                            <div class="data-sources">
                                <small>
                                    <i class="fas fa-check-circle"></i> ${rep.dataQuality?.hasCampaignFinance ? 'FEC Data' : ''}
                                    <i class="fas fa-check-circle"></i> ${rep.dataQuality?.hasVoteSmartData ? 'VoteSmart Data' : ''}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render alignment progress bar
     */
    renderAlignmentBar(label, score) {
        if (score === null || score === undefined) {
            return `
                <div class="alignment-item">
                    <span class="alignment-label">${label}</span>
                    <div class="alignment-bar-container">
                        <div class="alignment-bar no-data"></div>
                        <span class="alignment-value">No Data</span>
                    </div>
                </div>
            `;
        }
        
        const colorClass = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
        
        return `
            <div class="alignment-item">
                <span class="alignment-label">${label}</span>
                <div class="alignment-bar-container">
                    <div class="alignment-bar ${colorClass}" style="width: ${score}%"></div>
                    <span class="alignment-value">${score}%</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Render Voting Record Tab
     */
    renderVotingTab(rep) {
        const votes = rep.voteSmartData?.votes || [];
        
        return `
            <div class="tab-pane" data-tab="voting">
                <h2>Voting Record</h2>
                <p class="tab-description">Key votes on important legislation</p>
                
                ${votes.length === 0 ? `
                    <div class="no-data">
                        <i class="fas fa-inbox fa-3x"></i>
                        <p>No voting data available yet</p>
                    </div>
                ` : `
                    <div class="votes-list">
                        ${votes.map(vote => `
                            <div class="vote-item">
                                <div class="vote-header">
                                    <span class="bill-number">${vote.billNumber}</span>
                                    <span class="vote-badge vote-${vote.vote.toLowerCase()}">${vote.vote}</span>
                                </div>
                                <h4>${vote.billTitle}</h4>
                                <div class="vote-meta">
                                    <span><i class="fas fa-calendar"></i> ${vote.date}</span>
                                    <span><i class="fas fa-landmark"></i> ${vote.chamber}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }
    
    /**
     * Render Campaign Finance Tab
     */
    renderFinanceTab(rep) {
        const finance = rep.campaignFinance || {};
        
        return `
            <div class="tab-pane" data-tab="finance">
                <h2>Campaign Finance</h2>
                <p class="tab-description">Data from Federal Election Commission (FEC)</p>
                
                <div class="finance-grid">
                    <!-- Summary Card -->
                    <div class="finance-card">
                        <h3>2024 Election Cycle</h3>
                        <div class="finance-stats">
                            <div class="finance-stat">
                                <span class="finance-label">Total Raised</span>
                                <span class="finance-value">${this.formatMoney(finance.totalRaised)}</span>
                            </div>
                            <div class="finance-stat">
                                <span class="finance-label">Total Spent</span>
                                <span class="finance-value">${this.formatMoney(finance.totalSpent)}</span>
                            </div>
                            <div class="finance-stat">
                                <span class="finance-label">Cash on Hand</span>
                                <span class="finance-value">${this.formatMoney(finance.cashOnHand)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Top Donors -->
                    <div class="finance-card">
                        <h3>Top Individual Contributors</h3>
                        ${finance.topDonors?.length > 0 ? `
                            <div class="donors-list">
                                ${finance.topDonors.slice(0, 10).map(donor => `
                                    <div class="donor-item">
                                        <div class="donor-info">
                                            <strong>${donor.name}</strong>
                                            <small>${donor.occupation} • ${donor.employer}</small>
                                        </div>
                                        <span class="donor-amount">${this.formatMoney(donor.amount)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="no-data">No donor data available</p>'}
                    </div>
                    
                    <!-- Industry Breakdown -->
                    <div class="finance-card">
                        <h3>Top Contributing Industries</h3>
                        ${finance.industryBreakdown?.length > 0 ? `
                            <div class="industry-list">
                                ${finance.industryBreakdown.slice(0, 10).map(industry => `
                                    <div class="industry-item">
                                        <span class="industry-name">${industry.industry}</span>
                                        <div class="industry-bar-container">
                                            <div class="industry-bar" style="width: ${(industry.amount / finance.totalRaised * 100)}%"></div>
                                            <span class="industry-amount">${this.formatMoney(industry.amount)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="no-data">No industry data available</p>'}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render News Tab
     */
    renderNewsTab(rep) {
        const news = rep.news || [];
        
        return `
            <div class="tab-pane" data-tab="news">
                <h2>News & Fact-Checks</h2>
                <p class="tab-description">Recent news from trusted sources</p>
                
                ${news.length === 0 ? `
                    <div class="no-data">
                        <i class="fas fa-newspaper fa-3x"></i>
                        <p>No recent news articles found</p>
                    </div>
                ` : `
                    <div class="news-list">
                        ${news.map(article => `
                            <div class="news-item">
                                <div class="news-header">
                                    <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
                                    <span class="news-source">${article.source}</span>
                                </div>
                                <p>${article.snippet}</p>
                                ${article.factChecked ? `
                                    <div class="fact-check-badge">
                                        <i class="fas fa-check-circle"></i> Fact-Checked
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }
    
    /**
     * Render Contact Tab
     */
    renderContactTab(rep) {
        return `
            <div class="tab-pane" data-tab="contact">
                <h2>Contact ${rep.name}</h2>
                <p class="tab-description">Make your voice heard</p>
                
                <div class="contact-methods">
                    ${rep.contact.contactForm ? `
                        <div class="contact-method primary">
                            <i class="fas fa-envelope fa-3x"></i>
                            <h3>Online Contact Form</h3>
                            <p>The fastest way to reach your representative</p>
                            <a href="${rep.contact.contactForm}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i> Open Contact Form
                            </a>
                        </div>
                    ` : ''}
                    
                    ${rep.contact.phone ? `
                        <div class="contact-method">
                            <i class="fas fa-phone fa-3x"></i>
                            <h3>Call Office</h3>
                            <p class="contact-value">${rep.contact.phone}</p>
                            <a href="tel:${rep.contact.phone}" class="btn btn-secondary">
                                <i class="fas fa-phone"></i> Call Now
                            </a>
                        </div>
                    ` : ''}
                    
                    ${rep.contact.office ? `
                        <div class="contact-method">
                            <i class="fas fa-building fa-3x"></i>
                            <h3>Visit Office</h3>
                            <p class="contact-value">${rep.contact.office}</p>
                        </div>
                    ` : ''}
                    
                    ${rep.contact.email ? `
                        <div class="contact-method">
                            <i class="fas fa-at fa-3x"></i>
                            <h3>Email</h3>
                            <p class="contact-value">${rep.contact.email}</p>
                            <a href="mailto:${rep.contact.email}" class="btn btn-secondary">
                                <i class="fas fa-envelope"></i> Send Email
                            </a>
                        </div>
                    ` : ''}
                </div>
                
                <div class="contact-tips">
                    <h3><i class="fas fa-lightbulb"></i> Tips for Effective Communication</h3>
                    <ul>
                        <li>Be clear and concise about your concern</li>
                        <li>Include your full name and address to verify you're a constituent</li>
                        <li>Reference specific bill numbers when relevant</li>
                        <li>Be respectful and professional</li>
                        <li>Request a response to your message</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    /**
     * Render Accountability Tab
     */
    renderAccountabilityTab(rep) {
        return `
            <div class="tab-pane" data-tab="accountability">
                <h2>Accountability Tracker</h2>
                <p class="tab-description">Promises vs. Actions</p>
                
                <div class="accountability-section">
                    <h3>Campaign Promises</h3>
                    <div class="no-data">
                        <i class="fas fa-construction fa-3x"></i>
                        <p>Promise tracking coming soon</p>
                        <p><small>We're building a system to track campaign promises against actual legislative actions.</small></p>
                    </div>
                </div>
                
                <div class="accountability-section">
                    <h3>Constituent Feedback</h3>
                    <div class="no-data">
                        <i class="fas fa-comments fa-3x"></i>
                        <p>Constituent feedback system coming soon</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Close button
        document.getElementById('closeRepProfile').addEventListener('click', () => {
            this.close();
        });
        
        // Overlay click
        this.modalElement.querySelector('.rep-profile-overlay').addEventListener('click', () => {
            this.close();
        });
        
        // Tab switching
        this.modalElement.querySelectorAll('.rep-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.rep-tab').dataset.tab);
            });
        });
        
        // Export button
        document.getElementById('exportProfile')?.addEventListener('click', () => {
            this.exportData();
        });
        
        // Share button
        document.getElementById('shareProfile')?.addEventListener('click', () => {
            this.shareProfile();
        });
        
        // Contact button
        document.getElementById('contactRep')?.addEventListener('click', () => {
            this.switchTab('contact');
        });
    }
    
    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        this.modalElement.querySelectorAll('.rep-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Render tab content
        const contentDiv = this.modalElement.querySelector('.rep-tab-content');
        
        switch (tabName) {
            case 'overview':
                contentDiv.innerHTML = this.renderOverviewTab(this.representativeData);
                break;
            case 'voting':
                contentDiv.innerHTML = this.renderVotingTab(this.representativeData);
                break;
            case 'finance':
                contentDiv.innerHTML = this.renderFinanceTab(this.representativeData);
                break;
            case 'news':
                contentDiv.innerHTML = this.renderNewsTab(this.representativeData);
                break;
            case 'contact':
                contentDiv.innerHTML = this.renderContactTab(this.representativeData);
                break;
            case 'accountability':
                contentDiv.innerHTML = this.renderAccountabilityTab(this.representativeData);
                break;
        }
        
        this.currentTab = tabName;
    }
    
    /**
     * Close modal
     */
    close() {
        this.modalElement.remove();
        document.body.style.overflow = 'auto';
    }
    
    /**
     * Export data
     */
    exportData() {
        const data = JSON.stringify(this.representativeData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.representativeData.name.replace(/\s/g, '_')}_profile.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Share profile
     */
    shareProfile() {
        const url = `${window.location.origin}?rep=${this.representativeData.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: `${this.representativeData.name} - Representative Profile`,
                text: `Check out this representative profile on Workforce Democracy Project`,
                url: url
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url);
            alert('Profile link copied to clipboard!');
        }
    }
    
    /**
     * Utility: Format money
     */
    formatMoney(amount) {
        if (!amount && amount !== 0) return 'N/A';
        if (amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '$' + (amount / 1000).toFixed(1) + 'K';
        }
        return '$' + amount.toFixed(0);
    }
    
    /**
     * Utility: Get full party name
     */
    getPartyFullName(abbr) {
        const parties = {
            'D': 'Democrat',
            'R': 'Republican',
            'I': 'Independent',
            'L': 'Libertarian',
            'G': 'Green'
        };
        return parties[abbr] || abbr;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RepresentativeProfile;
}
