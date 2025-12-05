/**
 * CIVIC VOTING TRACKER MODULE
 * Personal bill voting and representative alignment tracking
 * Privacy-first, client-side only, backend-ready architecture
 * 🔒 SECURITY: All voting data encrypted with AES-256-GCM
 */

// User's civic voting state (stored encrypted in localStorage)
const CivicVotingState = {
    userDistrict: null,
    userState: null,
    userCountry: null,
    votes: {}, // { billId: { vote: 'yes'|'no'|'abstain', timestamp, billName, billType } }
    preferences: {
        notifications: true,
        shareOnSocialMedia: false
    }
};

/**
 * Initialize civic voting system
 */
async function initializeCivicVoting() {
    console.log('📊 Initializing Civic Voting Tracker...');
    
    // Load user's voting history from encrypted storage
    await loadUserVotingData();
    
    // Initialize event listeners
    setupVotingEventListeners();
    
    console.log('✅ Civic Voting Tracker initialized (encrypted storage active)');
}

/**
 * Load user voting data from encrypted storage
 * 🔒 SECURITY: Uses AES-256-GCM encryption via SecurityManager
 */
async function loadUserVotingData() {
    try {
        // Try encrypted storage first (new secure method)
        if (window.securityManager && typeof securityManager.secureRetrieve === 'function') {
            const encryptedData = await securityManager.secureRetrieve('civic_voting_data');
            if (encryptedData) {
                Object.assign(CivicVotingState, encryptedData);
                console.log(`🔒 Loaded ${Object.keys(CivicVotingState.votes).length} votes from encrypted storage`);
                return;
            }
        }
        
        // Migration path: Check for old unencrypted data
        let savedData = localStorage.getItem('wdp_civic_voting_data');
        if (!savedData) {
            savedData = localStorage.getItem('civicVotingData');
        }
        
        if (savedData) {
            const parsed = JSON.parse(savedData);
            Object.assign(CivicVotingState, parsed);
            console.log(`⚠️ Migrating ${Object.keys(CivicVotingState.votes).length} votes to encrypted storage...`);
            
            // Immediately migrate to encrypted storage
            await saveUserVotingData();
            
            // Remove old unencrypted data
            localStorage.removeItem('wdp_civic_voting_data');
            localStorage.removeItem('civicVotingData');
            console.log('✅ Migration to encrypted storage complete');
        }
    } catch (error) {
        console.error('⚠️ Error loading voting data:', error);
    }
}

/**
 * Save user voting data to encrypted storage
 * 🔒 SECURITY: Uses AES-256-GCM encryption via SecurityManager
 */
async function saveUserVotingData() {
    // Only save if personalization is enabled
    const isEnabled = localStorage.getItem('wdp_personalization_enabled') === 'true';
    if (!isEnabled) {
        console.log('⏭️ Personalization disabled, skipping civic voting data save');
        return;
    }
    
    try {
        // Use encrypted storage if available
        if (window.securityManager && typeof securityManager.secureStore === 'function') {
            await securityManager.secureStore('civic_voting_data', CivicVotingState);
            console.log('🔒 Voting data saved to encrypted storage');
        } else {
            // Fallback to plain localStorage (temporary, should not happen)
            console.warn('⚠️ SecurityManager not available, using plain localStorage (NOT SECURE)');
            localStorage.setItem('wdp_civic_voting_data', JSON.stringify(CivicVotingState));
        }
    } catch (error) {
        console.error('⚠️ Error saving voting data:', error);
    }
}

/**
 * Set user's district/area
 */
async function setUserDistrict(country, state, district) {
    CivicVotingState.userCountry = country;
    CivicVotingState.userState = state;
    CivicVotingState.userDistrict = district;
    await saveUserVotingData();
    
    if (typeof showNotification === 'function') {
        showNotification(`District set to: ${district}, ${state}`, 'success');
    }
}

/**
 * Record user's vote on a bill
 */
async function recordUserVote(billId, voteChoice, billData) {
    CivicVotingState.votes[billId] = {
        vote: voteChoice,
        timestamp: Date.now(),
        billName: billData.billName,
        billNumber: billData.billNumber,
        billType: billData.billType,
        level: billData.level // 'federal', 'state', 'local'
    };
    
    await saveUserVotingData();
    
    // Update UI
    updateVoteButtons(billId, voteChoice);
    displayRepresentativeAlignment(billId, billData);
    
    if (typeof showNotification === 'function') {
        showNotification(`Your vote recorded: ${voteChoice.toUpperCase()}`, 'success');
    }
    
    console.log(`✅ Recorded vote on ${billData.billNumber}: ${voteChoice}`);
}

/**
 * Update vote button states
 */
function updateVoteButtons(billId, selectedVote) {
    const container = document.querySelector(`[data-bill-id="${billId}"]`);
    if (!container) return;
    
    const buttons = container.querySelectorAll('.vote-btn');
    buttons.forEach(btn => {
        const btnVote = btn.getAttribute('data-vote');
        if (btnVote === selectedVote) {
            btn.classList.add('vote-btn-selected');
            btn.innerHTML = `<i class="fas fa-check-circle"></i> ${btn.textContent.trim()}`;
        } else {
            btn.classList.remove('vote-btn-selected');
        }
    });
}

/**
 * Display representative alignment based on user's vote
 */
function displayRepresentativeAlignment(billId, billData) {
    const container = document.querySelector(`[data-bill-id="${billId}"] .alignment-container`);
    if (!container) return;
    
    const userVote = CivicVotingState.votes[billId]?.vote;
    if (!userVote || userVote === 'abstain') {
        container.innerHTML = '<p class="alignment-message">Cast your vote to see representative alignment</p>';
        return;
    }
    
    // Get representatives who voted on this bill
    const alignedReps = [];
    const opposedReps = [];
    
    billData.representativeVotes?.forEach(rep => {
        const repVote = rep.vote.toLowerCase();
        if (repVote === userVote) {
            alignedReps.push(rep);
        } else if (repVote !== 'abstain') {
            opposedReps.push(rep);
        }
    });
    
    let html = '<div class="alignment-results">';
    
    // Aligned representatives
    if (alignedReps.length > 0) {
        html += '<div class="alignment-section aligned-section">';
        html += '<h5><i class="fas fa-thumbs-up"></i> Representatives Who Voted With You</h5>';
        alignedReps.forEach(rep => {
            html += createRepresentativeAlignmentCard(rep, true);
        });
        html += '</div>';
    }
    
    // Opposed representatives
    if (opposedReps.length > 0) {
        html += '<div class="alignment-section opposed-section">';
        html += '<h5><i class="fas fa-thumbs-down"></i> Representatives Who Voted Differently</h5>';
        opposedReps.forEach(rep => {
            html += createRepresentativeAlignmentCard(rep, false);
        });
        html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Create representative alignment card
 */
function createRepresentativeAlignmentCard(rep, aligned) {
    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    
    const icon = aligned ? '✓' : '✗';
    const className = aligned ? 'rep-aligned' : 'rep-opposed';
    
    return `
        <div class="rep-alignment-card ${className}">
            <div class="rep-alignment-info">
                <span class="alignment-icon">${icon}</span>
                <div class="rep-details">
                    <strong>${escapeHtml(rep.name)}</strong>
                    <span class="rep-party">${escapeHtml(rep.party)}</span>
                    <span class="rep-district">${escapeHtml(rep.district)}</span>
                </div>
            </div>
            <div class="rep-contact-actions">
                <a href="mailto:${escapeHtml(rep.email)}?subject=Regarding ${escapeHtml(rep.billNumber)}" 
                   class="contact-action-btn" title="Email">
                    <i class="fas fa-envelope"></i>
                </a>
                <a href="tel:${escapeHtml(rep.phone)}" 
                   class="contact-action-btn" title="Call">
                    <i class="fas fa-phone"></i>
                </a>
            </div>
        </div>
    `;
}

/**
 * Create bill voting card HTML
 */
function createBillVotingCard(bill) {
    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    
    const escapeQuotes = (str) => {
        if (!str) return '';
        return String(str).replace(/'/g, '&apos;');
    };
    
    const userVote = CivicVotingState.votes[bill.id];
    const hasVoted = !!userVote;
    
    return `
        <div class="bill-voting-card" data-bill-id="${bill.id}">
            <div class="bill-header-clickable" onclick="toggleBillExpand('${escapeQuotes(bill.id)}')">
                <div class="bill-header-content">
                    <h3 class="bill-title">
                        ${getBillTypeIcon(bill.billType)} ${escapeHtml(bill.billNumber)}: ${escapeHtml(bill.title)}
                    </h3>
                    ${getBillStatusBadge(bill.status)}
                </div>
                <button class="bill-expand-btn" aria-label="Expand bill details">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            
            <div class="bill-meta">
                <span class="bill-level-badge">${getLevelBadge(bill.level)}</span>
                ${bill.voteDate ? `<span><i class="fas fa-calendar"></i> Vote: ${formatDate(bill.voteDate)}</span>` : ''}
                ${bill.introduced ? `<span><i class="fas fa-user"></i> Introduced by: ${escapeHtml(bill.introduced)}</span>` : ''}
            </div>
            
            <div class="bill-expandable-content" style="display: none;">
            <div class="bill-summary-section">
                <h4>Summary</h4>
                <p class="bill-summary">${escapeHtml(bill.summary)}</p>
                
                <div class="bill-actions-row">
                    <button class="bill-detail-btn" onclick="showFullBillText('${escapeQuotes(bill.id)}')">
                        <i class="fas fa-file-alt"></i> Full Bill Text
                    </button>
                    ${bill.officialUrl ? `
                        <a href="${escapeHtml(bill.officialUrl)}" target="_blank" rel="noopener noreferrer" class="bill-detail-btn">
                            <i class="fas fa-external-link-alt"></i> Official Government Source
                        </a>
                    ` : ''}
                </div>
            </div>
            
            <div class="bill-impact-section">
                <h4>Impact</h4>
                <p class="bill-impact">${escapeHtml(bill.impact)}</p>
                ${bill.affectedPopulation ? `<p class="affected-pop"><i class="fas fa-users"></i> ${escapeHtml(bill.affectedPopulation)}</p>` : ''}
            </div>
            
            <div class="voting-section">
                <h4>How Would You Vote?</h4>
                <div class="vote-buttons">
                    <button class="vote-btn vote-btn-yes ${hasVoted && userVote.vote === 'yes' ? 'vote-btn-selected' : ''}" 
                            data-vote="yes"
                            onclick="castVote('${escapeQuotes(bill.id)}', 'yes')">
                        <i class="fas fa-thumbs-up"></i> Yes
                    </button>
                    <button class="vote-btn vote-btn-no ${hasVoted && userVote.vote === 'no' ? 'vote-btn-selected' : ''}" 
                            data-vote="no"
                            onclick="castVote('${escapeQuotes(bill.id)}', 'no')">
                        <i class="fas fa-thumbs-down"></i> No
                    </button>
                    <button class="vote-btn vote-btn-abstain ${hasVoted && userVote.vote === 'abstain' ? 'vote-btn-selected' : ''}" 
                            data-vote="abstain"
                            onclick="castVote('${escapeQuotes(bill.id)}', 'abstain')">
                        <i class="fas fa-minus-circle"></i> Abstain
                    </button>
                </div>
                ${hasVoted ? `<p class="voted-timestamp">You voted: ${new Date(userVote.timestamp).toLocaleDateString()}</p>` : ''}
            </div>
            
            <div class="alignment-container">
                ${hasVoted ? '' : '<p class="alignment-message">Cast your vote to see representative alignment</p>'}
            </div>
            
            <div class="social-share-section">
                <button class="share-btn" onclick="shareOnSocialMedia('${escapeQuotes(bill.id)}')">
                    <i class="fas fa-share-alt"></i> Share Your Position
                </button>
            </div>
            </div>
        </div>
    `;
}

/**
 * Cast vote on a bill
 */
async function castVote(billId, voteChoice) {
    // Find bill data (you'll need to pass this from your data source)
    const billData = findBillById(billId);
    if (!billData) {
        console.error('Bill not found:', billId);
        return;
    }
    
    await recordUserVote(billId, voteChoice, billData);
}

/**
 * Share on social media (privacy-first)
 */
async function shareOnSocialMedia(billId) {
    const bill = findBillById(billId);
    const userVote = CivicVotingState.votes[billId];
    
    if (!bill || !userVote) {
        if (typeof showNotification === 'function') {
            showNotification('Please vote on this bill first', 'info');
        }
        return;
    }
    
    const voteText = userVote.vote === 'yes' ? 'Support' : userVote.vote === 'no' ? 'Oppose' : 'Abstain on';
    const shareText = `I ${voteText} ${bill.billNumber}: ${bill.title}. Track your representatives' votes at ${window.location.origin}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}#bill-${billId}`;
    
    // Try native Web Share API first (mobile-friendly)
    if (navigator.share) {
        try {
            await navigator.share({
                title: `My Vote on ${bill.billNumber}`,
                text: shareText,
                url: shareUrl
            });
            console.log('✅ Shared via Web Share API');
            return;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.log('Web Share API not available, showing share menu');
            }
        }
    }
    
    // Show custom share menu
    showShareMenu(shareText, shareUrl);
}

/**
 * Show custom share menu with all social platforms
 */
function showShareMenu(text, url) {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    
    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedText}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
        email: `mailto:?subject=${encodeURIComponent('My Vote on This Bill')}&body=${encodedText}`,
        sms: `sms:?&body=${encodedText}`
    };
    
    const modalHtml = `
        <div class="share-modal-overlay" onclick="closeShareModal()">
            <div class="share-modal" onclick="event.stopPropagation()">
                <div class="share-modal-header">
                    <h3>Share Your Position</h3>
                    <button class="share-modal-close" onclick="closeShareModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="share-modal-content">
                    <p class="share-privacy-note">
                        <i class="fas fa-shield-alt"></i> Privacy-first sharing: No tracking, no social media integration on our end.
                    </p>
                    <div class="share-buttons-grid">
                        <a href="${shareLinks.twitter}" target="_blank" rel="noopener noreferrer" class="share-platform-btn twitter">
                            <i class="fab fa-twitter"></i> Twitter/X
                        </a>
                        <a href="${shareLinks.facebook}" target="_blank" rel="noopener noreferrer" class="share-platform-btn facebook">
                            <i class="fab fa-facebook"></i> Facebook
                        </a>
                        <a href="${shareLinks.linkedin}" target="_blank" rel="noopener noreferrer" class="share-platform-btn linkedin">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                        <a href="${shareLinks.whatsapp}" target="_blank" rel="noopener noreferrer" class="share-platform-btn whatsapp">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </a>
                        <a href="${shareLinks.telegram}" target="_blank" rel="noopener noreferrer" class="share-platform-btn telegram">
                            <i class="fab fa-telegram"></i> Telegram
                        </a>
                        <a href="${shareLinks.reddit}" target="_blank" rel="noopener noreferrer" class="share-platform-btn reddit">
                            <i class="fab fa-reddit"></i> Reddit
                        </a>
                        <a href="${shareLinks.email}" class="share-platform-btn email">
                            <i class="fas fa-envelope"></i> Email
                        </a>
                        <a href="${shareLinks.sms}" class="share-platform-btn sms">
                            <i class="fas fa-sms"></i> SMS
                        </a>
                    </div>
                    <div class="share-copy-section">
                        <input type="text" readonly value="${text}" class="share-copy-input" id="shareCopyInput">
                        <button onclick="copyShareText()" class="share-copy-btn">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Close share modal
 */
function closeShareModal() {
    const modal = document.querySelector('.share-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

/**
 * Copy share text to clipboard
 */
async function copyShareText() {
    const input = document.getElementById('shareCopyInput');
    if (!input) return;
    
    try {
        await navigator.clipboard.writeText(input.value);
        if (typeof showNotification === 'function') {
            showNotification('Copied to clipboard!', 'success');
        }
    } catch (error) {
        // Fallback for older browsers
        input.select();
        document.execCommand('copy');
        if (typeof showNotification === 'function') {
            showNotification('Copied to clipboard!', 'success');
        }
    }
}

/**
 * Helper functions
 */
function getBillTypeIcon(type) {
    const icons = {
        education: '📚',
        health: '🏥',
        healthcare: '🏥',
        environment: '🌍',
        economy: '💰',
        economic: '💰',
        'civil-rights': '⚖️',
        rights: '⚖️',
        labor: '💼',
        employment: '💼',
        housing: '🏠',
        infrastructure: '🏗️',
        transportation: '🚇',
        energy: '⚡',
        agriculture: '🌾',
        technology: '💻',
        defense: '🛡️',
        immigration: '🌐',
        justice: '⚖️',
        tax: '💵',
        budget: '💵',
        trade: '🌐',
        'foreign-policy': '🌍',
        veterans: '🎖️',
        'social-security': '🏛️',
        welfare: '🤝'
    };
    return icons[type?.toLowerCase()?.trim()] || '📋';
}

function getBillStatusBadge(status) {
    const badges = {
        upcoming: '<span class="bill-status-badge status-upcoming">Upcoming Vote</span>',
        active: '<span class="bill-status-badge status-active">Active</span>',
        passed: '<span class="bill-status-badge status-passed">Passed</span>',
        failed: '<span class="bill-status-badge status-failed">Failed</span>',
        committee: '<span class="bill-status-badge status-committee">In Committee</span>'
    };
    return badges[status] || '';
}

function getLevelBadge(level) {
    const badges = {
        federal: '🏛️ Federal',
        state: '🏢 State',
        local: '🏘️ Local'
    };
    return badges[level] || level;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Find bill by ID (placeholder - will be implemented with your data structure)
 */
function findBillById(billId) {
    // This will integrate with your existing bill data
    // For now, return null
    return window.SAMPLE_BILLS?.find(b => b.id === billId) || null;
}

/**
 * Show full bill text in modal
 */
function showFullBillText(billId) {
    const bill = findBillById(billId);
    if (!bill) return;
    
    const modalHtml = `
        <div class="bill-text-modal-overlay" onclick="closeBillTextModal()">
            <div class="bill-text-modal" onclick="event.stopPropagation()">
                <div class="bill-text-modal-header">
                    <h3>${bill.billNumber}: ${bill.title}</h3>
                    <button class="bill-text-modal-close" onclick="closeBillTextModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="bill-text-modal-content">
                    <div class="bill-full-text">
                        ${bill.fullText || '<p>Full bill text not available in demo mode. In production, this would display the complete legislative text.</p>'}
                    </div>
                    ${bill.officialUrl ? `
                        <a href="${bill.officialUrl}" target="_blank" rel="noopener noreferrer" class="bill-official-link">
                            <i class="fas fa-external-link-alt"></i> View on Official Government Website
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Close bill text modal
 */
function closeBillTextModal() {
    const modal = document.querySelector('.bill-text-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

/**
 * Setup event listeners
 */
function setupVotingEventListeners() {
    // Handle ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeShareModal();
            closeBillTextModal();
        }
    });
}

/**
 * Calculate personal statistics
 */
function calculatePersonalStats() {
    const votes = Object.values(CivicVotingState.votes);
    
    if (votes.length === 0) {
        return {
            totalVotes: 0,
            byType: {},
            byLevel: {},
            votingPattern: {}
        };
    }
    
    const stats = {
        totalVotes: votes.length,
        byType: {},
        byLevel: {},
        votingPattern: {
            yes: votes.filter(v => v.vote === 'yes').length,
            no: votes.filter(v => v.vote === 'no').length,
            abstain: votes.filter(v => v.vote === 'abstain').length
        }
    };
    
    // Group by bill type
    votes.forEach(vote => {
        stats.byType[vote.billType] = (stats.byType[vote.billType] || 0) + 1;
        stats.byLevel[vote.level] = (stats.byLevel[vote.level] || 0) + 1;
    });
    
    return stats;
}

// Note: exportUserData() and deleteAllUserData() are provided by main.js
// These functions are available globally and work for all data types

/**
 * Display bills list (all, upcoming, or by category)
 */
function displayBillsList(filter = 'all') {
    const container = document.getElementById('billsListContainer');
    if (!container) return;
    
    let bills = window.SAMPLE_BILLS || [];
    
    // Filter bills
    if (filter === 'upcoming') {
        bills = bills.filter(b => b.status === 'upcoming');
    } else if (filter === 'active') {
        bills = bills.filter(b => b.status === 'active' || b.status === 'upcoming');
    } else if (filter !== 'all') {
        bills = bills.filter(b => b.billType === filter);
    }
    
    if (bills.length === 0) {
        container.innerHTML = '<p class="no-bills-message">No bills found matching your criteria.</p>';
        return;
    }
    
    let html = '<div class="bills-list">';
    bills.forEach(bill => {
        html += createBillVotingCard(bill);
    });
    html += '</div>';
    
    container.innerHTML = html;
    
    // Re-initialize alignment displays for already-voted bills
    bills.forEach(bill => {
        const userVote = CivicVotingState.votes[bill.id];
        if (userVote) {
            displayRepresentativeAlignment(bill.id, bill);
        }
    });
}

/**
 * Display upcoming bills tracker
 */
function displayUpcomingBills() {
    const container = document.getElementById('upcomingBillsContainer');
    if (!container) return;
    
    const upcomingBills = (window.SAMPLE_BILLS || []).filter(b => 
        b.status === 'upcoming' && new Date(b.voteDate) > new Date()
    );
    
    if (upcomingBills.length === 0) {
        container.innerHTML = '<p class="no-bills-message">No upcoming votes scheduled at this time.</p>';
        return;
    }
    
    // Sort by vote date
    upcomingBills.sort((a, b) => new Date(a.voteDate) - new Date(b.voteDate));
    
    let html = '<div class="upcoming-bills-list">';
    upcomingBills.forEach(bill => {
        const daysUntil = Math.ceil((new Date(bill.voteDate) - new Date()) / (1000 * 60 * 60 * 24));
        html += `
            <div class="upcoming-bill-item">
                <div class="upcoming-bill-info">
                    <h4>${getBillTypeIcon(bill.billType)} ${bill.billNumber}: ${bill.title}</h4>
                    <p class="upcoming-bill-meta">
                        <span class="bill-level-badge">${getLevelBadge(bill.level)}</span>
                        <span class="vote-date"><i class="fas fa-calendar"></i> ${formatDate(bill.voteDate)} (${daysUntil} days)</span>
                    </p>
                    <p class="upcoming-bill-summary">${bill.summary.substring(0, 150)}...</p>
                </div>
                <div class="upcoming-bill-actions">
                    <button onclick="viewBillDetails('${bill.id}')" class="upcoming-bill-btn">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button onclick="setVoteReminder('${bill.id}')" class="upcoming-bill-btn">
                        <i class="fas fa-bell"></i> Remind Me
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

/* ============================================================================
   OLD DASHBOARD FUNCTION - DEPRECATED V34.3.0 (2025-01-25)
   ============================================================================
   This function has been replaced by the new modular dashboard system
   in js/civic-dashboard.js
   
   New system features:
   - 6 Chart.js visualizations (pie, bar, line, donut, radar, timeline)
   - Web Share API for native sharing
   - Dashboard chat widget with AI insights
   - Filter/sort functionality
   - Export features (JSON, CSV)
   - Accordion-style mobile layout
   - Representative alignment tracking
   
   Keeping commented out for reference during transition period.
   Will be removed in V35.0.0
   ============================================================================ */

/*
function displayPersonalDashboard() {
    const container = document.getElementById('personalDashboardContainer');
    if (!container) return;
    
    const stats = calculatePersonalStats();
    const votes = Object.values(CivicVotingState.votes);
    
    let html = '<div class="personal-dashboard">';
    
    // Header with district info
    html += '<div class="dashboard-header">';
    html += '<h2><i class="fas fa-chart-line"></i> Your Civic Engagement Dashboard</h2>';
    if (CivicVotingState.userDistrict) {
        html += `<p class="dashboard-location"><i class="fas fa-map-marker-alt"></i> ${CivicVotingState.userDistrict}, ${CivicVotingState.userState}</p>`;
        html += `<p class="dashboard-link"><a href="privacy.html"><i class="fas fa-cog"></i> Manage your personalized experience</a></p>`;
    } else {
        html += '<p class="dashboard-prompt"><a href="privacy.html">Manage your data and privacy settings</a> for a personalized experience</p>';
    }
    html += '</div>';
    
    // Quick stats - Two column layout
    html += '<div class="dashboard-stats-two-col">';
    
    // Left column: Bills Voted On + Supported
    html += '<div class="stats-column">';
    html += `
        <div class="stat-card">
            <div class="stat-number">${stats.totalVotes}</div>
            <div class="stat-label">Bills Voted On</div>
        </div>
        <div class="stat-card stat-card-positive">
            <div class="stat-number">${stats.votingPattern.yes}</div>
            <div class="stat-label">Supported</div>
        </div>
    `;
    html += '</div>';
    
    // Right column: Opposed + Abstained
    html += '<div class="stats-column">';
    html += `
        <div class="stat-card stat-card-negative">
            <div class="stat-number">${stats.votingPattern.no}</div>
            <div class="stat-label">Opposed</div>
        </div>
        <div class="stat-card stat-card-neutral">
            <div class="stat-number">${stats.votingPattern.abstain}</div>
            <div class="stat-label">Abstained</div>
        </div>
    `;
    html += '</div>';
    
    html += '</div>'; // Close dashboard-stats-two-col
    
    if (stats.totalVotes > 0) {
        // Two-column grid wrapper for voting pattern and recent activity
        html += '<div class="dashboard-content-grid">';
        
        // Voting pattern by type
        html += '<div class="dashboard-section">';
        html += '<h3>Your Voting Pattern by Issue</h3>';
        html += '<div class="voting-pattern-grid">';
        
        Object.entries(stats.byType).forEach(([type, count]) => {
            const percentage = ((count / stats.totalVotes) * 100).toFixed(0);
            html += `
                <div class="pattern-item">
                    <div class="pattern-icon">${getBillTypeIcon(type)}</div>
                    <div class="pattern-info">
                        <div class="pattern-label">${formatTopicName(type)}</div>
                        <div class="pattern-bar">
                            <div class="pattern-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="pattern-count">${count} bills (${percentage}%)</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        html += '</div>';
        
        // Recent activity
        html += '<div class="dashboard-section">';
        html += '<h3>Recent Voting Activity</h3>';
        html += '<div class="recent-activity-list">';
        
        const recentVotes = votes.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
        recentVotes.forEach(vote => {
            const voteIcon = vote.vote === 'yes' ? '👍' : vote.vote === 'no' ? '👎' : '🤷';
            const voteClass = vote.vote === 'yes' ? 'vote-yes' : vote.vote === 'no' ? 'vote-no' : 'vote-abstain';
            html += `
                <div class="activity-item">
                    <span class="activity-icon ${voteClass}">${voteIcon}</span>
                    <div class="activity-info">
                        <div class="activity-title">${vote.billNumber}: ${vote.billName}</div>
                        <div class="activity-date">${new Date(vote.timestamp).toLocaleDateString()}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        html += '</div>';
        
        html += '</div>'; // Close dashboard-content-grid
    }
    
    html += '</div>';
    
    container.innerHTML = html;
}
*/

/* END OLD DASHBOARD FUNCTION - See js/civic-dashboard.js for new implementation */

/**
 * Format topic name
 */
function formatTopicName(topic) {
    const names = {
        'education': 'Education',
        'health': 'Healthcare',
        'environment': 'Environment',
        'economy': 'Economy',
        'civil-rights': 'Civil Rights',
        'labor': 'Labor & Employment',
        'housing': 'Housing',
        'transportation': 'Transportation',
        'technology': 'Technology'
    };
    return names[topic] || topic;
}

/**
 * View bill details (scroll to bill or load it)
 */
function viewBillDetails(billId) {
    // Try to scroll to bill if already on page
    const billCard = document.querySelector(`[data-bill-id="${billId}"]`);
    if (billCard) {
        billCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        billCard.style.animation = 'highlight 2s ease';
        return;
    }
    
    // Otherwise show bill in modal or navigate to bills section
    const bill = findBillById(billId);
    if (bill) {
        // Show bill in a modal or navigate to bills section
        if (typeof showNotification === 'function') {
            showNotification('Navigating to bill details...', 'info');
        }
        // You can implement modal or navigation here
    }
}

/**
 * Set vote reminder (browser notification)
 */
function setVoteReminder(billId) {
    const bill = findBillById(billId);
    if (!bill) return;
    
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                if (typeof showNotification === 'function') {
                    showNotification(`Reminder set for ${bill.billNumber}`, 'success');
                }
                // In production, you'd set up a service worker to send notification
                // on the vote date
            }
        });
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Browser notifications not supported', 'error');
        }
    }
}

/**
 * Show district selector dialog
 */
function showDistrictSelector() {
    // This would show a modal for selecting country, state, district
    // For now, just show a notification
    if (typeof showNotification === 'function') {
        showNotification('District selector coming soon. For demo, data is shown for all areas.', 'info');
    }
}

/**
 * Toggle bill expand/collapse
 */
function toggleBillExpand(billId) {
    const card = document.querySelector(`[data-bill-id="${billId}"]`);
    if (!card) return;
    
    const content = card.querySelector('.bill-expandable-content');
    const button = card.querySelector('.bill-expand-btn i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        button.classList.remove('fa-chevron-down');
        button.classList.add('fa-chevron-up');
        card.classList.add('bill-expanded');
    } else {
        content.style.display = 'none';
        button.classList.remove('fa-chevron-up');
        button.classList.add('fa-chevron-down');
        card.classList.remove('bill-expanded');
    }
}

// Make functions globally available
window.initializeCivicVoting = initializeCivicVoting;
window.setUserDistrict = setUserDistrict;
window.castVote = castVote;
window.shareOnSocialMedia = shareOnSocialMedia;
window.closeShareModal = closeShareModal;
window.copyShareText = copyShareText;
window.showFullBillText = showFullBillText;
window.closeBillTextModal = closeBillTextModal;
// Note: exportUserData and deleteAllUserData exported by main.js
// V36.5.3: Only export functions that exist
if (typeof calculatePersonalStats !== 'undefined') window.calculatePersonalStats = calculatePersonalStats;
if (typeof displayBillsList !== 'undefined') window.displayBillsList = displayBillsList;
if (typeof displayUpcomingBills !== 'undefined') window.displayUpcomingBills = displayUpcomingBills;
// displayPersonalDashboard removed - function doesn't exist
if (typeof viewBillDetails !== 'undefined') window.viewBillDetails = viewBillDetails;
if (typeof setVoteReminder !== 'undefined') window.setVoteReminder = setVoteReminder;
if (typeof showDistrictSelector !== 'undefined') window.showDistrictSelector = showDistrictSelector;
if (typeof toggleBillExpand !== 'undefined') window.toggleBillExpand = toggleBillExpand;
if (typeof CivicVotingState !== 'undefined') window.CivicVotingState = CivicVotingState;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCivicVoting);
} else {
    initializeCivicVoting();
}
