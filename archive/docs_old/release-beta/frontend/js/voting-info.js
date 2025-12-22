/**
 * VOTING INFORMATION SYSTEM
 * Loads and displays comprehensive voting information for USA, Mexico, and Australia
 * Features accordion UI for easy navigation
 */

// Global voting data cache
let votingData = null;
let currentVotingCountry = null;

/**
 * Load voting data from JSON file
 */
async function loadVotingData() {
    if (votingData) return votingData;
    
    try {
        const response = await fetch('data/voting-info.json');
        if (!response.ok) {
            throw new Error('Failed to load voting data');
        }
        votingData = await response.json();
        console.log('✅ Voting data loaded successfully');
        return votingData;
    } catch (error) {
        console.error('❌ Error loading voting data:', error);
        return null;
    }
}

/**
 * Load voting information for a specific country
 */
async function loadVotingInfo(countryCode) {
    if (!countryCode) {
        // Reset to empty state
        document.getElementById('voting-info-container').innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: #718096;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🗳️</div>
                <p style="font-size: 1.125rem; font-weight: 500; margin-bottom: 0.5rem;">Select your country to view voting information</p>
                <p style="font-size: 0.9375rem;">We provide comprehensive guides for USA, Mexico, and Australia</p>
            </div>
        `;
        currentVotingCountry = null;
        return;
    }
    
    // Show loading state
    const container = document.getElementById('voting-info-container');
    if (container) {
        container.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="width: 3rem; height: 3rem; border: 4px solid #e2e8f0; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p style="color: #718096; font-size: 1rem;">Loading voting information...</p>
            </div>
        `;
    }
    
    // Load data if not already loaded
    const data = await loadVotingData();
    if (!data || !data.countries[countryCode]) {
        console.error('Country data not found:', countryCode);
        return;
    }
    
    currentVotingCountry = countryCode;
    const country = data.countries[countryCode];
    
    // Render voting information with accordion UI
    renderVotingInfo(country, countryCode);
}

/**
 * Render voting information with accordion UI
 */
function renderVotingInfo(country, countryCode) {
    const container = document.getElementById('voting-info-container');
    
    let html = `
        <div class="voting-info-content">
            <!-- Country Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: center; color: white;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">${country.flagEmoji}</div>
                <h2 style="margin: 0; font-size: 1.75rem; font-weight: 700;">${country.countryName}</h2>
                <p style="margin: 0.5rem 0 0; opacity: 0.95; font-size: 0.9375rem;">Complete Voting Guide</p>
            </div>
    `;
    
    // Eligibility Section
    if (country.eligibility) {
        html += createAccordionSection('eligibility', '✅', country.eligibility.title, 
            renderEligibility(country.eligibility), true); // Open by default
    }
    
    // Registration Section
    if (country.registration) {
        html += createAccordionSection('registration', '📝', country.registration.title, 
            renderRegistration(country.registration));
    }
    
    // Voting Methods Section
    if (country.votingMethods) {
        html += createAccordionSection('voting-methods', '🗳️', country.votingMethods.title, 
            renderVotingMethods(country.votingMethods));
    }
    
    // Polling Locations Section
    if (country.pollingLocations) {
        html += createAccordionSection('polling-locations', '📍', country.pollingLocations.title, 
            renderPollingLocations(country.pollingLocations));
    }
    
    // Required Documents Section
    if (country.requiredDocuments) {
        html += createAccordionSection('required-docs', '🪪', country.requiredDocuments.title, 
            renderRequiredDocuments(country.requiredDocuments));
    }
    
    // Important Dates Section
    if (country.importantDates) {
        html += createAccordionSection('important-dates', '📅', country.importantDates.title, 
            renderImportantDates(country.importantDates));
    }
    
    // Accessibility Section
    if (country.accessibility) {
        html += createAccordionSection('accessibility', '♿', country.accessibility.title, 
            renderAccessibility(country.accessibility));
    }
    
    // Additional Resources Section
    if (country.additionalResources) {
        html += createAccordionSection('additional-resources', '🔗', country.additionalResources.title, 
            renderAdditionalResources(country.additionalResources));
    }
    
    // Compulsory Voting (Australia only)
    if (country.compulsoryVoting) {
        html += createAccordionSection('compulsory-voting', '⚖️', country.compulsoryVoting.title, 
            renderCompulsoryVoting(country.compulsoryVoting));
    }
    
    // State-Specific Note
    if (country.stateSpecificNote) {
        html += `
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 8px; margin-top: 1.5rem;">
                <p style="margin: 0; color: #92400e; font-size: 0.9375rem; line-height: 1.6;">
                    <strong>📌 Important Note:</strong> ${country.stateSpecificNote}
                </p>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add event listeners for accordions
    initializeVotingAccordions();
}

/**
 * Create accordion section
 */
function createAccordionSection(id, icon, title, content, isOpen = false) {
    return `
        <div class="voting-accordion" data-section="${id}">
            <button class="voting-accordion-header ${isOpen ? 'active' : ''}" 
                    onclick="toggleVotingAccordion('${id}')"
                    aria-expanded="${isOpen}">
                <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                    <span style="font-size: 1.5rem;">${icon}</span>
                    <span style="font-size: 1.125rem; font-weight: 600;">${title}</span>
                </div>
                <span class="accordion-arrow">${isOpen ? '▲' : '▼'}</span>
            </button>
            <div class="voting-accordion-content ${isOpen ? 'active' : ''}" data-content="${id}">
                ${content}
            </div>
        </div>
    `;
}

/**
 * Toggle accordion section
 */
function toggleVotingAccordion(sectionId) {
    const header = document.querySelector(`[data-section="${sectionId}"] .voting-accordion-header`);
    const content = document.querySelector(`[data-content="${sectionId}"]`);
    const arrow = header.querySelector('.accordion-arrow');
    
    const isActive = content.classList.contains('active');
    
    // Close ALL accordions first
    document.querySelectorAll('.voting-accordion-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.voting-accordion-header').forEach(h => {
        h.classList.remove('active');
        h.querySelector('.accordion-arrow').textContent = '▼';
        h.setAttribute('aria-expanded', 'false');
    });
    
    // If it wasn't active, open it
    if (!isActive) {
        content.classList.add('active');
        header.classList.add('active');
        arrow.textContent = '▲';
        header.setAttribute('aria-expanded', 'true');
    }
}

/**
 * Initialize accordion event listeners
 */
function initializeVotingAccordions() {
    // Event listeners are handled by onclick in the HTML
    console.log('✅ Voting accordions initialized');
}

/**
 * Render functions for each section
 */

function renderEligibility(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.requirements && data.requirements.length > 0) {
        html += '<ul style="margin: 0 0 1rem; padding-left: 1.5rem; line-height: 1.8;">';
        data.requirements.forEach(req => {
            html += `<li style="margin-bottom: 0.5rem;">${req}</li>`;
        });
        html += '</ul>';
    }
    
    if (data.notes) {
        html += `<p style="margin: 1rem 0 0; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; font-size: 0.9375rem; color: #0c4a6e;">${data.notes}</p>`;
    }
    
    if (data.officialLink) {
        html += `<a href="${data.officialLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 1rem; color: #667eea; font-weight: 600; text-decoration: none;">Official Information →</a>`;
    }
    
    html += '</div>';
    return html;
}

function renderRegistration(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.steps && data.steps.length > 0) {
        html += '<ol style="margin: 0 0 1rem; padding-left: 1.5rem; line-height: 1.8;">';
        data.steps.forEach(step => {
            html += `<li style="margin-bottom: 0.75rem;">${step}</li>`;
        });
        html += '</ol>';
    }
    
    if (data.deadlines) {
        html += `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 0.875rem; border-radius: 6px; margin: 1rem 0;">
            <strong style="color: #92400e;">⏰ Deadlines:</strong> ${data.deadlines}
        </div>`;
    }
    
    if (data.officialLinks) {
        html += '<div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">';
        if (data.officialLinks.primary) {
            html += `<a href="${data.officialLinks.primary}" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-weight: 600; text-decoration: none;">🔗 Register to Vote</a>`;
        }
        if (data.officialLinks.registerOnline) {
            html += `<a href="${data.officialLinks.registerOnline}" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-weight: 600; text-decoration: none;">🔗 Online Registration</a>`;
        }
        if (data.officialLinks.checkRegistration) {
            html += `<a href="${data.officialLinks.checkRegistration}" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-weight: 600; text-decoration: none;">🔗 Check Registration Status</a>`;
        }
        html += '</div>';
    }
    
    if (data.notes) {
        html += `<p style="margin: 1rem 0 0; font-size: 0.9375rem; color: #4b5563;">${data.notes}</p>`;
    }
    
    html += '</div>';
    return html;
}

function renderVotingMethods(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.methods && data.methods.length > 0) {
        data.methods.forEach(method => {
            html += `
                <div style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <h4 style="margin: 0 0 0.5rem; color: #1f2937; font-size: 1.0625rem;">${method.type}</h4>
                    <p style="margin: 0 0 0.5rem; color: #4b5563; font-size: 0.9375rem;">${method.description}</p>
                    ${method.requirements ? `<p style="margin: 0; font-size: 0.875rem; color: #6b7280;"><strong>Requirements:</strong> ${method.requirements}</p>` : ''}
                    ${method.link ? `<a href="${method.link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 0.5rem; color: #667eea; font-weight: 600; text-decoration: none; font-size: 0.875rem;">Learn More →</a>` : ''}
                </div>
            `;
        });
    }
    
    html += '</div>';
    return html;
}

function renderPollingLocations(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.howToFind && data.howToFind.length > 0) {
        html += '<ul style="margin: 0 0 1rem; padding-left: 1.5rem; line-height: 1.8;">';
        data.howToFind.forEach(item => {
            html += `<li style="margin-bottom: 0.5rem;">${item}</li>`;
        });
        html += '</ul>';
    }
    
    if (data.officialLinks) {
        html += '<div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">';
        if (data.officialLinks.locator) {
            html += `<a href="${data.officialLinks.locator}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #667eea; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center;">📍 Find Your Polling Place</a>`;
        }
        if (data.officialLinks.helpline) {
            html += `<a href="${data.officialLinks.helpline}" style="color: #667eea; font-weight: 600; text-decoration: none;">📞 Helpline: ${data.officialLinks.helpline.replace('tel:', '')}</a>`;
        }
        html += '</div>';
    }
    
    if (data.notes) {
        html += `<p style="margin: 1rem 0 0; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; font-size: 0.9375rem; color: #0c4a6e;">${data.notes}</p>`;
    }
    
    html += '</div>';
    return html;
}

function renderRequiredDocuments(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.description) {
        html += `<p style="margin: 0 0 1rem; font-weight: 500; color: #1f2937;">${data.description}</p>`;
    }
    
    if (data.acceptedIds && data.acceptedIds.length > 0) {
        html += '<ul style="margin: 0 0 1rem; padding-left: 1.5rem; line-height: 1.8;">';
        data.acceptedIds.forEach(id => {
            html += `<li style="margin-bottom: 0.5rem;">${id}</li>`;
        });
        html += '</ul>';
    }
    
    if (data.notes) {
        html += `<p style="margin: 1rem 0 0; padding: 0.75rem; background: #fef3c7; border-radius: 6px; font-size: 0.9375rem; color: #92400e;">${data.notes}</p>`;
    }
    
    if (data.officialLink) {
        html += `<a href="${data.officialLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 1rem; color: #667eea; font-weight: 600; text-decoration: none;">Official Requirements →</a>`;
    }
    
    html += '</div>';
    return html;
}

function renderImportantDates(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.description) {
        html += `<p style="margin: 0 0 1rem; color: #1f2937;">${data.description}</p>`;
    }
    
    html += '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    
    if (data.generalElection) {
        html += `<div style="background: #f0f9ff; padding: 0.875rem; border-radius: 6px;">
            <strong style="color: #0c4a6e;">General Elections:</strong> ${data.generalElection}
        </div>`;
    }
    
    if (data.presidentialElection) {
        html += `<div style="background: #f0f9ff; padding: 0.875rem; border-radius: 6px;">
            <strong style="color: #0c4a6e;">Presidential Elections:</strong> ${data.presidentialElection}
        </div>`;
    }
    
    if (data.midtermElection) {
        html += `<div style="background: #f0f9ff; padding: 0.875rem; border-radius: 6px;">
            <strong style="color: #0c4a6e;">Midterm Elections:</strong> ${data.midtermElection}
        </div>`;
    }
    
    if (data.legislativeElection) {
        html += `<div style="background: #f0f9ff; padding: 0.875rem; border-radius: 6px;">
            <strong style="color: #0c4a6e;">Legislative Elections:</strong> ${data.legislativeElection}
        </div>`;
    }
    
    html += '</div>';
    
    if (data.notes) {
        html += `<p style="margin: 1rem 0 0; font-size: 0.9375rem; color: #4b5563;">${data.notes}</p>`;
    }
    
    html += '</div>';
    return html;
}

function renderAccessibility(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.services && data.services.length > 0) {
        html += '<ul style="margin: 0 0 1rem; padding-left: 1.5rem; line-height: 1.8;">';
        data.services.forEach(service => {
            html += `<li style="margin-bottom: 0.5rem;">${service}</li>`;
        });
        html += '</ul>';
    }
    
    if (data.helpline) {
        html += `<div style="background: #dcfce7; padding: 0.875rem; border-radius: 6px; margin: 1rem 0;">
            <strong style="color: #166534;">📞 Accessibility Helpline:</strong> ${data.helpline}
        </div>`;
    }
    
    if (data.officialLink) {
        html += `<a href="${data.officialLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 1rem; color: #667eea; font-weight: 600; text-decoration: none;">Accessibility Resources →</a>`;
    }
    
    html += '</div>';
    return html;
}

function renderAdditionalResources(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.resources && data.resources.length > 0) {
        data.resources.forEach(resource => {
            html += `
                <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
                    <h4 style="margin: 0 0 0.25rem; color: #1f2937; font-size: 1rem;">
                        <a href="${resource.url}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">${resource.name} →</a>
                    </h4>
                    <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">${resource.description}</p>
                </div>
            `;
        });
    }
    
    html += '</div>';
    return html;
}

function renderCompulsoryVoting(data) {
    let html = '<div class="voting-section-content">';
    
    if (data.description) {
        html += `<p style="margin: 0 0 1rem; font-weight: 500; color: #1f2937;">${data.description}</p>`;
    }
    
    if (data.penalties) {
        html += `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 0.875rem; border-radius: 6px; margin: 1rem 0;">
            <strong style="color: #92400e;">⚠️ Penalties:</strong> ${data.penalties}
        </div>`;
    }
    
    if (data.validReasons && data.validReasons.length > 0) {
        html += '<h4 style="margin: 1rem 0 0.5rem; font-size: 1rem; color: #1f2937;">Valid Reasons for Not Voting:</h4>';
        html += '<ul style="margin: 0 0 1rem; padding-left: 1.5rem; line-height: 1.8;">';
        data.validReasons.forEach(reason => {
            html += `<li style="margin-bottom: 0.5rem;">${reason}</li>`;
        });
        html += '</ul>';
    }
    
    if (data.notes) {
        html += `<p style="margin: 1rem 0 0; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; font-size: 0.9375rem; color: #0c4a6e;">${data.notes}</p>`;
    }
    
    if (data.officialLink) {
        html += `<a href="${data.officialLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 1rem; color: #667eea; font-weight: 600; text-decoration: none;">More Information →</a>`;
    }
    
    html += '</div>';
    return html;
}

/**
 * Open Voting Assistant (Phase 3 - LLM Integration)
 */
function openVotingAssistant() {
    // For now, show a message - will be implemented in Phase 3
    alert('🤖 Voting Assistant coming soon! This will use AI to help you with personalized voting information.');
    
    // TODO: Phase 3 - Integrate with Groq/Llama 3
    // - Load voting context based on selected country
    // - Open chat interface
    // - Provide personalized assistance
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🗳️ Voting Information System initialized');
    
    // Pre-load voting data
    loadVotingData().then(() => {
        console.log('✅ Voting data pre-loaded');
    });
});
