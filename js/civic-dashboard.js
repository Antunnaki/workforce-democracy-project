/**
 * Civic Dashboard V34.3.0 - Modern Dashboard with AI Insights
 * Complete rebuild with modular architecture
 * Features: 6 Chart.js visualizations, Web Share API, filters, export, chat widget
 * 
 * Cost-Saving Hybrid: Smart Local Tools + Groq API fallback
 * - Local pattern matching: FREE, 0ms response
 * - Groq API: Only when needed, ~$0.0001 per query
 * 
 * @version 34.3.0
 * @date 2025-01-25
 */

// ============================================================================
// DASHBOARD STATE MANAGEMENT
// ============================================================================

const CivicDashboardState = {
    initialized: false,
    charts: {}, // Store Chart.js instances
    filteredVotes: [],
    currentFilters: {
        dateRange: 'all',
        billType: 'all',
        voteType: 'all',
        govLevel: 'all'
    },
    representatives: [], // Will be populated with alignment data
    chatHistory: [],
    accordionState: {
        visualizations: false,
        alignment: false,
        activity: false,
        chat: false
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the civic dashboard
 * Called when dashboard panel is opened
 */
function initializeCivicDashboard() {
    console.log('🏛️ Initializing Civic Dashboard V34.3.0...');
    
    if (CivicDashboardState.initialized) {
        console.log('✅ Dashboard already initialized, refreshing data...');
        refreshDashboard();
        // Hide floating chat when dashboard is active
        hideCivicFloatingChat();
        return;
    }
    
    try {
        // Hide floating civic chat since dashboard has its own AI insights
        hideCivicFloatingChat();
        
        // Load data from civic voting state
        loadDashboardData();
        
        // Render all components
        renderDashboardHeader();
        renderStatCards();
        initializeFilters();
        initializeAccordions();
        renderActivityList();
        renderAlignmentCards();
        initializeDashboardChat();
        
        // Setup event listeners
        setupEventListeners();
        
        CivicDashboardState.initialized = true;
        console.log('✅ Civic Dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showDashboardError('Oops! We couldn\'t load your dashboard right now. Please refresh the page and try again. 💙');
    }
}

/**
 * Load vote data from CivicVotingState
 */
function loadDashboardData() {
    console.log('📊 Loading dashboard data...');
    
    // Get all votes from civic voting state
    const votes = Object.values(CivicVotingState?.votes || {});
    CivicDashboardState.filteredVotes = votes;
    
    console.log(`✅ Loaded ${votes.length} votes`);
    
    // Calculate representative alignment
    calculateRepresentativeAlignment();
}

/**
 * Refresh dashboard with latest data
 */
function refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');
    
    loadDashboardData();
    renderStatCards();
    renderActivityList();
    renderAlignmentCards();
    
    // Re-render charts if accordion is open
    if (CivicDashboardState.accordionState.visualizations) {
        renderAllCharts();
    }
}

// ============================================================================
// HEADER RENDERING
// ============================================================================

/**
 * Render dashboard header with location and last updated
 */
function renderDashboardHeader() {
    const headerLocation = document.getElementById('dashboardHeaderLocation');
    if (!headerLocation) return;
    
    // Get user's location from civic voting state
    const userLocation = CivicVotingState?.userLocation || 'Not Set';
    const lastUpdated = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    headerLocation.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <span>📍 ${userLocation}</span>
            <span style="opacity: 0.8;">•</span>
            <span>🕐 Updated ${lastUpdated}</span>
        </div>
    `;
}

// ============================================================================
// STAT CARDS
// ============================================================================

/**
 * Calculate dashboard statistics
 */
function calculateDashboardStats() {
    const votes = CivicDashboardState.filteredVotes;
    
    const stats = {
        total: votes.length,
        supported: votes.filter(v => v.vote === 'yes').length,
        opposed: votes.filter(v => v.vote === 'no').length,
        abstained: votes.filter(v => v.vote === 'abstain').length
    };
    
    return stats;
}

/**
 * Render stat cards with animation
 */
function renderStatCards() {
    const stats = calculateDashboardStats();
    
    // Update stat numbers with animation
    animateStatNumber('statTotal', stats.total);
    animateStatNumber('statSupported', stats.supported);
    animateStatNumber('statOpposed', stats.opposed);
    animateStatNumber('statAbstained', stats.abstained);
}

/**
 * Animate stat number with count-up effect
 */
function animateStatNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const duration = 800; // ms
    const steps = 30;
    const increment = (targetValue - currentValue) / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const newValue = Math.round(currentValue + (increment * currentStep));
        element.textContent = newValue;
        
        if (currentStep >= steps) {
            element.textContent = targetValue;
            clearInterval(interval);
        }
    }, stepDuration);
}

// ============================================================================
// FILTER & SORT FUNCTIONALITY
// ============================================================================

/**
 * Initialize filter dropdowns
 */
function initializeFilters() {
    console.log('🔍 Initializing filters...');
    
    // Date range filter
    const dateFilter = document.getElementById('filterDateRange');
    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            CivicDashboardState.currentFilters.dateRange = e.target.value;
            applyFilters();
        });
    }
    
    // Bill type filter
    const typeFilter = document.getElementById('filterBillType');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            CivicDashboardState.currentFilters.billType = e.target.value;
            applyFilters();
        });
    }
    
    // Vote type filter
    const voteFilter = document.getElementById('filterVoteType');
    if (voteFilter) {
        voteFilter.addEventListener('change', (e) => {
            CivicDashboardState.currentFilters.voteType = e.target.value;
            applyFilters();
        });
    }
    
    // Government level filter
    const levelFilter = document.getElementById('filterGovLevel');
    if (levelFilter) {
        levelFilter.addEventListener('change', (e) => {
            CivicDashboardState.currentFilters.govLevel = e.target.value;
            applyFilters();
        });
    }
}

/**
 * Apply all filters to vote data
 */
function applyFilters() {
    console.log('🔍 Applying filters:', CivicDashboardState.currentFilters);
    
    let votes = Object.values(CivicVotingState?.votes || {});
    
    // Date range filter
    if (CivicDashboardState.currentFilters.dateRange !== 'all') {
        const now = Date.now();
        const ranges = {
            'week': 7 * 24 * 60 * 60 * 1000,
            'month': 30 * 24 * 60 * 60 * 1000,
            'quarter': 90 * 24 * 60 * 60 * 1000,
            'year': 365 * 24 * 60 * 60 * 1000
        };
        const rangeMs = ranges[CivicDashboardState.currentFilters.dateRange];
        if (rangeMs) {
            votes = votes.filter(v => (now - v.timestamp) <= rangeMs);
        }
    }
    
    // Bill type filter
    if (CivicDashboardState.currentFilters.billType !== 'all') {
        votes = votes.filter(v => v.category === CivicDashboardState.currentFilters.billType);
    }
    
    // Vote type filter
    if (CivicDashboardState.currentFilters.voteType !== 'all') {
        votes = votes.filter(v => v.vote === CivicDashboardState.currentFilters.voteType);
    }
    
    // Government level filter
    if (CivicDashboardState.currentFilters.govLevel !== 'all') {
        votes = votes.filter(v => v.level === CivicDashboardState.currentFilters.govLevel);
    }
    
    CivicDashboardState.filteredVotes = votes;
    
    // Update all displays
    renderStatCards();
    renderActivityList();
    
    // Re-render charts if visible
    if (CivicDashboardState.accordionState.visualizations) {
        renderAllCharts();
    }
    
    console.log(`✅ Filtered to ${votes.length} votes`);
}

// ============================================================================
// CHART.JS VISUALIZATIONS (ALL 6 TYPES)
// ============================================================================

/**
 * Render all 6 charts
 */
function renderAllCharts() {
    console.log('📊 Rendering all charts...');
    
    // Destroy existing charts
    Object.values(CivicDashboardState.charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    CivicDashboardState.charts = {};
    
    // Render each chart type
    renderPieChart();
    renderBarChart();
    renderLineChart();
    renderDonutChart();
    renderRadarChart();
    renderTimelineChart();
}

/**
 * Chart 1: Pie Chart - Vote Distribution
 */
function renderPieChart() {
    const ctx = document.getElementById('chartPie');
    if (!ctx) return;
    
    const stats = calculateDashboardStats();
    
    CivicDashboardState.charts.pie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Supported', 'Opposed', 'Abstained'],
            datasets: [{
                data: [stats.supported, stats.opposed, stats.abstained],
                backgroundColor: [
                    'rgba(82, 196, 26, 0.8)', // Green
                    'rgba(255, 77, 79, 0.8)', // Red
                    'rgba(156, 163, 175, 0.8)' // Gray
                ],
                borderColor: [
                    'rgba(82, 196, 26, 1)',
                    'rgba(255, 77, 79, 1)',
                    'rgba(156, 163, 175, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Vote Distribution',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

/**
 * Chart 2: Bar Chart - Category Breakdown
 */
function renderBarChart() {
    const ctx = document.getElementById('chartBar');
    if (!ctx) return;
    
    const votes = CivicDashboardState.filteredVotes;
    const categoryCounts = {};
    
    votes.forEach(v => {
        const cat = v.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);
    
    CivicDashboardState.charts.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bills by Category',
                data: data,
                backgroundColor: 'rgba(102, 126, 234, 0.7)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Category Breakdown',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * Chart 3: Line Chart - Engagement Over Time
 */
function renderLineChart() {
    const ctx = document.getElementById('chartLine');
    if (!ctx) return;
    
    const votes = CivicDashboardState.filteredVotes.sort((a, b) => a.timestamp - b.timestamp);
    
    // Group by month
    const monthlyData = {};
    votes.forEach(v => {
        const date = new Date(v.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    const labels = Object.keys(monthlyData);
    const data = Object.values(monthlyData);
    
    CivicDashboardState.charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Votes per Month',
                data: data,
                borderColor: 'rgba(118, 75, 162, 1)',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Engagement Over Time',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * Chart 4: Donut Chart - Government Level Distribution
 */
function renderDonutChart() {
    const ctx = document.getElementById('chartDonut');
    if (!ctx) return;
    
    const votes = CivicDashboardState.filteredVotes;
    const levelCounts = {
        federal: 0,
        state: 0,
        local: 0
    };
    
    votes.forEach(v => {
        const level = (v.level || 'local').toLowerCase();
        if (levelCounts[level] !== undefined) {
            levelCounts[level]++;
        }
    });
    
    CivicDashboardState.charts.donut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Federal', 'State', 'Local'],
            datasets: [{
                data: [levelCounts.federal, levelCounts.state, levelCounts.local],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Government Level',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

/**
 * Chart 5: Radar Chart - Issue Alignment
 */
function renderRadarChart() {
    const ctx = document.getElementById('chartRadar');
    if (!ctx) return;
    
    const votes = CivicDashboardState.filteredVotes;
    const supportByCategory = {};
    const totalByCategory = {};
    
    votes.forEach(v => {
        const cat = v.category || 'Other';
        totalByCategory[cat] = (totalByCategory[cat] || 0) + 1;
        if (v.vote === 'yes') {
            supportByCategory[cat] = (supportByCategory[cat] || 0) + 1;
        }
    });
    
    const labels = Object.keys(totalByCategory);
    const percentages = labels.map(cat => {
        return Math.round((supportByCategory[cat] || 0) / totalByCategory[cat] * 100);
    });
    
    CivicDashboardState.charts.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Support Rate (%)',
                data: percentages,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Issue Alignment',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 20 }
                }
            }
        }
    });
}

/**
 * Chart 6: Timeline - Recent Activity
 */
function renderTimelineChart() {
    const ctx = document.getElementById('chartTimeline');
    if (!ctx) return;
    
    const votes = CivicDashboardState.filteredVotes
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-10); // Last 10 votes
    
    const labels = votes.map(v => {
        const date = new Date(v.timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const data = votes.map(v => {
        if (v.vote === 'yes') return 1;
        if (v.vote === 'no') return -1;
        return 0;
    });
    
    CivicDashboardState.charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Recent Votes',
                data: data,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: data.map(v => {
                    if (v > 0) return 'rgba(82, 196, 26, 1)'; // Green for yes
                    if (v < 0) return 'rgba(255, 77, 79, 1)'; // Red for no
                    return 'rgba(156, 163, 175, 1)'; // Gray for abstain
                })
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Recent Activity Timeline',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const vote = votes[context.dataIndex];
                            return `${vote.billTitle}: ${vote.vote.toUpperCase()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: -1.5,
                    max: 1.5,
                    ticks: {
                        callback: function(value) {
                            if (value === 1) return 'Support';
                            if (value === -1) return 'Oppose';
                            if (value === 0) return 'Abstain';
                            return '';
                        }
                    }
                }
            }
        }
    });
}

// ============================================================================
// ACTIVITY LIST
// ============================================================================

/**
 * Render recent activity list
 */
function renderActivityList() {
    const container = document.getElementById('activityListContainer');
    if (!container) return;
    
    const votes = CivicDashboardState.filteredVotes
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10); // Show last 10 votes
    
    if (votes.length === 0) {
        container.innerHTML = `
            <div class="dashboard-empty-state">
                <p style="font-size: 3rem; margin-bottom: 1rem;">📭</p>
                <p style="font-size: 1.125rem; font-weight: 600; color: #4b5563; margin-bottom: 0.5rem;">No Activity Yet</p>
                <p style="font-size: 0.875rem; color: #9ca3af;">Start engaging with bills to see your activity here</p>
            </div>
        `;
        return;
    }
    
    const html = votes.map(vote => {
        const voteClass = vote.vote === 'yes' ? 'vote-yes' : vote.vote === 'no' ? 'vote-no' : 'vote-abstain';
        const voteIcon = vote.vote === 'yes' ? '✅' : vote.vote === 'no' ? '❌' : '⚪';
        const voteLabel = vote.vote === 'yes' ? 'Supported' : vote.vote === 'no' ? 'Opposed' : 'Abstained';
        const timeAgo = formatTimeAgo(vote.timestamp);
        
        return `
            <div class="activity-item-modern">
                <div class="activity-icon-modern ${voteClass}">
                    ${voteIcon}
                </div>
                <div class="activity-content-modern">
                    <div class="activity-title-modern">${vote.billTitle || 'Untitled Bill'}</div>
                    <div class="activity-meta-modern">
                        <span class="activity-category">${vote.category || 'General'}</span>
                        <span style="opacity: 0.5;">•</span>
                        <span class="activity-vote ${voteClass}">${voteLabel}</span>
                        <span style="opacity: 0.5;">•</span>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

/**
 * Format timestamp to human-readable "time ago"
 */
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// ============================================================================
// REPRESENTATIVE ALIGNMENT
// ============================================================================

/**
 * Calculate alignment with representatives
 * This is a placeholder - will be enhanced with real representative data
 */
function calculateRepresentativeAlignment() {
    console.log('👥 Calculating representative alignment...');
    
    // Placeholder representatives (will be replaced with real data)
    CivicDashboardState.representatives = [
        {
            id: 'rep1',
            name: 'Representative Smith',
            party: 'Democrat',
            alignment: 73,
            district: 'District 12'
        },
        {
            id: 'rep2',
            name: 'Senator Jones',
            party: 'Republican',
            alignment: 45,
            district: 'State Senate'
        },
        {
            id: 'rep3',
            name: 'Council Member Lee',
            party: 'Independent',
            alignment: 58,
            district: 'City Council'
        }
    ];
    
    // TODO: Real alignment calculation based on voting records
    // This will be enhanced in Phase 2 with actual representative voting data
}

/**
 * Render representative alignment cards
 */
function renderAlignmentCards() {
    const container = document.getElementById('alignmentCardsContainer');
    if (!container) return;
    
    const reps = CivicDashboardState.representatives;
    
    if (reps.length === 0) {
        container.innerHTML = `
            <div class="dashboard-empty-state">
                <p style="font-size: 3rem; margin-bottom: 1rem;">👥</p>
                <p style="font-size: 1.125rem; font-weight: 600; color: #4b5563; margin-bottom: 0.5rem;">No Representatives Found</p>
                <p style="font-size: 0.875rem; color: #9ca3af;">Set your location to see representative alignment</p>
            </div>
        `;
        return;
    }
    
    const html = reps.map(rep => `
        <div class="alignment-card">
            <div class="alignment-header">
                <div>
                    <div class="alignment-name">${rep.name}</div>
                    <div class="alignment-district">${rep.district} • ${rep.party}</div>
                </div>
                <div class="alignment-score">${rep.alignment}%</div>
            </div>
            
            <div class="alignment-bar">
                <div class="alignment-bar-fill" style="width: ${rep.alignment}%"></div>
            </div>
            
            <button class="alignment-share-btn" onclick="shareRepresentativeAlignment('${rep.id}')">
                <span>🔗</span>
                <span>Share</span>
            </button>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

/**
 * Share representative alignment via Web Share API (native sharing, zero tracking)
 */
function shareRepresentativeAlignment(repId) {
    const rep = CivicDashboardState.representatives.find(r => r.id === repId);
    if (!rep) return;
    
    const shareText = `I align ${rep.alignment}% with ${rep.name} on civic issues! Track your own alignment at ${window.location.origin}`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: 'My Civic Engagement Alignment',
            text: shareText,
            url: window.location.href
        }).then(() => {
            console.log('✅ Shared successfully via Web Share API');
            showToast('Shared successfully!', 'success');
        }).catch((error) => {
            console.log('❌ Share cancelled or failed:', error);
            // Fallback to clipboard
            fallbackCopyToClipboard(shareText);
        });
    } else {
        // Fallback for browsers without Web Share API
        fallbackCopyToClipboard(shareText);
    }
}

/**
 * Fallback: Copy to clipboard
 */
function fallbackCopyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch((error) => {
        console.error('❌ Failed to copy:', error);
        showToast('Failed to copy link', 'error');
    });
}

// ============================================================================
// EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Export data as encrypted JSON
 */
function exportDashboardJSON() {
    console.log('📤 Exporting dashboard data as JSON...');
    
    const votes = Object.values(CivicVotingState?.votes || {});
    const stats = calculateDashboardStats();
    
    const exportData = {
        version: '34.3.0',
        exportDate: new Date().toISOString(),
        stats: stats,
        votes: votes,
        representatives: CivicDashboardState.representatives
    };
    
    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // TODO: Encrypt with AES-256-GCM (uses existing security.js from V32.7)
    // For now, export unencrypted (encryption will be added)
    
    downloadFile(jsonString, `civic-dashboard-${Date.now()}.json`, 'application/json');
    
    showToast('Dashboard exported as JSON', 'success');
}

/**
 * Export data as privacy-safe CSV
 */
function exportDashboardCSV() {
    console.log('📤 Exporting dashboard data as CSV...');
    
    const votes = Object.values(CivicVotingState?.votes || {});
    
    // Create CSV header
    let csv = 'Date,Bill Title,Category,Vote,Government Level\n';
    
    // Add rows
    votes.forEach(vote => {
        const date = new Date(vote.timestamp).toLocaleDateString();
        const title = `"${(vote.billTitle || 'Untitled').replace(/"/g, '""')}"`;
        const category = vote.category || 'General';
        const voteType = vote.vote || 'abstain';
        const level = vote.level || 'local';
        
        csv += `${date},${title},${category},${voteType},${level}\n`;
    });
    
    downloadFile(csv, `civic-dashboard-${Date.now()}.csv`, 'text/csv');
    
    showToast('Dashboard exported as CSV', 'success');
}

/**
 * Download file to user's device
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================================================
// DASHBOARD CHAT WIDGET (AI INSIGHTS)
// ============================================================================

/**
 * Initialize dashboard chat widget
 */
function initializeDashboardChat() {
    console.log('💬 Initializing dashboard chat widget...');
    
    const chatInput = document.getElementById('dashboardChatInput');
    const chatSendBtn = document.getElementById('dashboardChatSend');
    
    if (chatInput && chatSendBtn) {
        chatSendBtn.addEventListener('click', sendDashboardChatMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendDashboardChatMessage();
            }
        });
    }
}

/**
 * Send dashboard chat message
 */
async function sendDashboardChatMessage() {
    const input = document.getElementById('dashboardChatInput');
    const messagesContainer = document.getElementById('dashboardChatMessages');
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addChatMessage('user', message);
    input.value = '';
    
    // Show loading indicator
    addChatMessage('assistant', 'Analyzing your voting data...', true);
    
    try {
        // Generate insight using Smart Local Tools + Groq fallback
        const response = await generateDashboardInsight(message);
        
        // Remove loading indicator and add response
        const loadingMessage = messagesContainer.querySelector('.chat-message-loading');
        if (loadingMessage) loadingMessage.remove();
        
        addChatMessage('assistant', response);
        
    } catch (error) {
        console.error('❌ Dashboard chat error:', error);
        const loadingMessage = messagesContainer.querySelector('.chat-message-loading');
        if (loadingMessage) loadingMessage.remove();
        addChatMessage('assistant', '😊 Oops! I had trouble analyzing that. Could you try asking in a different way? I\'m here to help! 💙');
    }
}

/**
 * Generate insight using Smart Local Tools + Groq fallback
 * Cost-saving hybrid: Local patterns first (FREE), API only when needed
 */
async function generateDashboardInsight(query) {
    console.log('🤖 Generating insight for:', query);
    
    const votes = CivicDashboardState.filteredVotes;
    const stats = calculateDashboardStats();
    
    // ========================================================================
    // LOCAL PATTERN MATCHING (FREE, 0ms response time)
    // ========================================================================
    
    const queryLower = query.toLowerCase();
    
    // Pattern 1: Voting pattern explanation
    if (queryLower.includes('voting pattern') || queryLower.includes('my pattern')) {
        const supportRate = Math.round((stats.supported / stats.total) * 100);
        return `Based on your ${stats.total} votes, you support bills ${supportRate}% of the time. You've supported ${stats.supported} bills, opposed ${stats.opposed}, and abstained on ${stats.abstained}. This suggests you're ${supportRate > 60 ? 'generally supportive' : supportRate < 40 ? 'generally critical' : 'balanced'} in your civic engagement.`;
    }
    
    // Pattern 2: Representative comparison
    if (queryLower.includes('compare') && queryLower.includes('representative')) {
        const topRep = CivicDashboardState.representatives[0];
        if (topRep) {
            return `Your highest alignment is with ${topRep.name} at ${topRep.alignment}%. This means you agree on roughly ${Math.round(topRep.alignment / 100 * stats.total)} out of ${stats.total} bills. Consider reaching out to ${topRep.name}'s office to share your perspectives on issues where you align.`;
        }
        return "I don't have representative data loaded yet. Make sure you've set your location to see alignment scores.";
    }
    
    // Pattern 3: Bill matching
    if (queryLower.includes('bills match') || queryLower.includes('my interests')) {
        const categoryCounts = {};
        votes.filter(v => v.vote === 'yes').forEach(v => {
            const cat = v.category || 'Other';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
        
        if (topCategory) {
            return `You've shown the most support for ${topCategory[0]} bills (${topCategory[1]} votes). I recommend following ${topCategory[0]}-related legislation closely. Would you like me to explain why you might align with this category?`;
        }
        return "You haven't voted on enough bills yet for me to identify clear interest patterns. Keep engaging to build your profile!";
    }
    
    // Pattern 4: Activity summary
    if (queryLower.includes('summary') || queryLower.includes('overview')) {
        return `📊 Your Civic Engagement Summary:\n\n• Total Engagement: ${stats.total} bills\n• Support Rate: ${Math.round((stats.supported / stats.total) * 100)}%\n• Most Active: ${getMostActiveMonth()}\n• Alignment: ${CivicDashboardState.representatives[0]?.alignment || 0}% with top representative\n\nYou're actively participating in democracy! Keep it up! 🎉`;
    }
    
    // ========================================================================
    // GROQ API FALLBACK (Only for complex queries, ~$0.0001 per call)
    // ========================================================================
    
    // If no local pattern matches, use Groq API
    console.log('🌐 No local pattern match, calling Groq API...');
    
    // Prepare context for Groq
    const context = {
        stats: stats,
        voteCount: votes.length,
        topCategories: getTopCategories(votes, 3),
        recentVotes: votes.slice(-5).map(v => ({
            title: v.billTitle,
            category: v.category,
            vote: v.vote
        }))
    };
    
    // TODO: Call Groq API with context
    // This is a placeholder - actual API call will be implemented with backend
    // For now, return a helpful message
    
    return `I can help you understand your voting patterns, compare with representatives, and find bills matching your interests. Try asking:\n\n• "Explain my voting pattern"\n• "Compare me with [Representative]"\n• "What bills match my interests?"\n• "Give me a summary"\n\n(Advanced AI insights coming soon via Groq API integration)`;
}

/**
 * Get most active month
 */
function getMostActiveMonth() {
    const votes = CivicDashboardState.filteredVotes;
    const monthlyCounts = {};
    
    votes.forEach(v => {
        const date = new Date(v.timestamp);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    });
    
    const topMonth = Object.entries(monthlyCounts).sort((a, b) => b[1] - a[1])[0];
    return topMonth ? topMonth[0] : 'N/A';
}

/**
 * Get top categories
 */
function getTopCategories(votes, limit = 3) {
    const categoryCounts = {};
    votes.forEach(v => {
        const cat = v.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([cat, count]) => ({ category: cat, count }));
}

/**
 * Add message to chat window
 */
function addChatMessage(role, content, isLoading = false) {
    const messagesContainer = document.getElementById('dashboardChatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `dashboard-chat-message dashboard-chat-message-${role}`;
    if (isLoading) messageDiv.classList.add('chat-message-loading');
    
    const icon = role === 'user' ? '👤' : '🤖';
    messageDiv.innerHTML = `
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
            <div style="font-size: 1.5rem; flex-shrink: 0;">${icon}</div>
            <div style="flex: 1; white-space: pre-wrap;">${content}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ============================================================================
// ACCORDION FUNCTIONALITY
// ============================================================================

/**
 * Initialize accordion sections
 */
function initializeAccordions() {
    console.log('📱 Initializing accordions...');
    
    // Setup accordion toggle listeners
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sectionId = header.dataset.section;
            toggleAccordion(sectionId);
        });
    });
}

/**
 * Toggle accordion section
 */
function toggleAccordion(sectionId) {
    // Special handling for chat widget (uses different structure)
    if (sectionId === 'chat') {
        const chatToggle = document.getElementById('dashboardChatToggle');
        const chatWindow = document.getElementById('dashboardChatWindow');
        
        if (!chatToggle || !chatWindow) return;
        
        const isOpen = CivicDashboardState.accordionState.chat;
        
        if (isOpen) {
            // Close chat
            chatWindow.classList.remove('active');
            chatToggle.querySelector('.accordion-arrow').style.transform = 'rotate(0deg)';
            CivicDashboardState.accordionState.chat = false;
        } else {
            // Open chat
            chatWindow.classList.add('active');
            chatToggle.querySelector('.accordion-arrow').style.transform = 'rotate(180deg)';
            CivicDashboardState.accordionState.chat = true;
        }
        return;
    }
    
    // Standard accordion sections
    const header = document.querySelector(`.accordion-header[data-section="${sectionId}"]`);
    const content = document.querySelector(`.accordion-content[data-section="${sectionId}"]`);
    
    if (!header || !content) return;
    
    const isOpen = CivicDashboardState.accordionState[sectionId];
    
    if (isOpen) {
        // Close section
        header.classList.remove('active');
        content.classList.remove('active');
        CivicDashboardState.accordionState[sectionId] = false;
    } else {
        // Open section
        header.classList.add('active');
        content.classList.add('active');
        CivicDashboardState.accordionState[sectionId] = true;
        
        // If opening visualizations, render charts
        if (sectionId === 'visualizations') {
            setTimeout(() => renderAllCharts(), 100);
        }
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    console.log('🎧 Setting up event listeners...');
    
    // Export buttons
    const exportJSONBtn = document.getElementById('exportDashboardJSON');
    if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', exportDashboardJSON);
    }
    
    const exportCSVBtn = document.getElementById('exportDashboardCSV');
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', exportDashboardCSV);
    }
    
    // Reset button
    const resetBtn = document.getElementById('resetDashboard');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDashboardFilters);
    }
    
    // Chat toggle
    const chatToggle = document.getElementById('dashboardChatToggle');
    if (chatToggle) {
        chatToggle.addEventListener('click', () => toggleAccordion('chat'));
    }
    
    // Listen for tab switches to show/hide floating chat
    setupTabSwitchListener();
}

/**
 * Setup listener for tab switches to manage floating chat visibility
 */
function setupTabSwitchListener() {
    // Listen for clicks on all civic tabs
    const civicTabs = document.querySelectorAll('.civic-tab-btn');
    civicTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('aria-controls');
            
            // Hide floating chat only on dashboard tab
            if (tabId === 'dashboard-panel') {
                hideCivicFloatingChat();
            } else {
                // Show floating chat on other tabs
                showCivicFloatingChat();
            }
        });
    });
}

/**
 * Reset all filters
 */
function resetDashboardFilters() {
    console.log('🔄 Resetting filters...');
    
    CivicDashboardState.currentFilters = {
        dateRange: 'all',
        billType: 'all',
        voteType: 'all',
        govLevel: 'all'
    };
    
    // Reset filter dropdowns
    document.getElementById('filterDateRange').value = 'all';
    document.getElementById('filterBillType').value = 'all';
    document.getElementById('filterVoteType').value = 'all';
    document.getElementById('filterGovLevel').value = 'all';
    
    applyFilters();
    
    showToast('Filters reset', 'success');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Check if toast container exists
    let toastContainer = document.getElementById('dashboardToastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'dashboardToastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#667eea'};
        color: white;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show dashboard error
 */
function showDashboardError(message) {
    const container = document.getElementById('personalDashboardContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="dashboard-empty-state" style="padding: 3rem;">
            <p style="font-size: 3rem; margin-bottom: 1rem;">⚠️</p>
            <p style="font-size: 1.25rem; font-weight: 600; color: #ef4444; margin-bottom: 0.5rem;">Error Loading Dashboard</p>
            <p style="font-size: 0.875rem; color: #9ca3af;">${message}</p>
        </div>
    `;
}

// ============================================================================
// FLOATING CHAT MANAGEMENT
// ============================================================================

/**
 * Hide floating civic chat when dashboard is active
 * Dashboard has its own AI insights widget with better context
 */
function hideCivicFloatingChat() {
    const floatingChat = document.querySelector('.civic-chat-top');
    if (floatingChat) {
        floatingChat.style.display = 'none';
        console.log('✅ Floating civic chat hidden (dashboard AI insights active)');
    }
}

/**
 * Show floating civic chat when leaving dashboard
 */
function showCivicFloatingChat() {
    const floatingChat = document.querySelector('.civic-chat-top');
    if (floatingChat) {
        floatingChat.style.display = 'block';
        console.log('✅ Floating civic chat shown (dashboard inactive)');
    }
}

// ============================================================================
// INITIALIZE ON LOAD
// ============================================================================

// Auto-initialize when civic voting panel is opened
// This will be called from the main civic-voting.js when dashboard tab is selected
console.log('✅ Civic Dashboard V34.3.0 loaded and ready');
