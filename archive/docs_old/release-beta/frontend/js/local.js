/**
 * LOCAL RESOURCES MODULE
 * Find ethical businesses and community services
 * User submission with verification system
 */

// Local resources database schema
const LOCAL_RESOURCE_TYPES = {
    cooperative: {
        name: 'Worker Cooperative',
        icon: '🤝',
        color: 'var(--primary)'
    },
    ethical_business: {
        name: 'Ethical Business',
        icon: '✅',
        color: 'var(--success)'
    },
    community_service: {
        name: 'Community Service',
        icon: '🆘',
        color: 'var(--info)'
    },
    social_enterprise: {
        name: 'Social Enterprise',
        icon: '🌱',
        color: 'var(--secondary)'
    }
};

/**
 * Derive location data (country, state, district) from postcode/ZIP
 * In production, this would call a geocoding API
 * For now, uses pattern matching for demo purposes
 */
function deriveLocationFromPostcode(postcode) {
    const cleanPostcode = postcode.trim().toUpperCase();
    
    // US ZIP code pattern (5 digits or 5+4)
    if (/^\d{5}(-?\d{4})?$/.test(cleanPostcode)) {
        const zip = cleanPostcode.substring(0, 5);
        const zipNum = parseInt(zip);
        
        // Sample mapping based on ZIP code ranges
        // In production, use a proper geocoding API
        if (zipNum >= 10000 && zipNum <= 14999) {
            return { country: 'US', state: 'New York', district: 'NY-' + Math.floor(zipNum / 1000) };
        } else if (zipNum >= 90000 && zipNum <= 96699) {
            return { country: 'US', state: 'California', district: 'CA-' + Math.floor((zipNum - 90000) / 100) };
        } else if (zipNum >= 60000 && zipNum <= 60699) {
            return { country: 'US', state: 'Illinois', district: 'IL-7' };
        } else if (zipNum >= 77000 && zipNum <= 77999) {
            return { country: 'US', state: 'Texas', district: 'TX-' + Math.floor((zipNum - 77000) / 100) };
        } else if (zipNum >= 30000 && zipNum <= 31999) {
            return { country: 'US', state: 'Georgia', district: 'GA-5' };
        } else {
            // Default for other US ZIP codes
            const stateNum = Math.floor(zipNum / 10000);
            return { country: 'US', state: 'District ' + stateNum, district: 'US-' + stateNum };
        }
    }
    
    // UK postcode pattern (e.g., SW1A 1AA)
    if (/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(cleanPostcode)) {
        const area = cleanPostcode.substring(0, 2).replace(/\d/, '');
        return { country: 'UK', state: area + ' Region', district: area + ' District' };
    }
    
    // Canadian postal code pattern (e.g., K1A 0B1)
    if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(cleanPostcode)) {
        const province = cleanPostcode.charAt(0);
        const provinceMap = {
            'K': 'Ontario', 'M': 'Ontario', 'L': 'Ontario',
            'V': 'British Columbia', 'T': 'Alberta', 'R': 'Manitoba',
            'S': 'Saskatchewan', 'E': 'New Brunswick', 'H': 'Quebec'
        };
        return { 
            country: 'Canada', 
            state: provinceMap[province] || 'Province', 
            district: province + ' District' 
        };
    }
    
    // Australian postcode pattern (4 digits)
    if (/^\d{4}$/.test(cleanPostcode)) {
        const postcodeNum = parseInt(cleanPostcode);
        if (postcodeNum >= 2000 && postcodeNum <= 2999) {
            return { country: 'Australia', state: 'New South Wales', district: 'NSW District' };
        } else if (postcodeNum >= 3000 && postcodeNum <= 3999) {
            return { country: 'Australia', state: 'Victoria', district: 'VIC District' };
        } else if (postcodeNum >= 4000 && postcodeNum <= 4999) {
            return { country: 'Australia', state: 'Queensland', district: 'QLD District' };
        }
    }
    
    // Default fallback
    return { 
        country: 'Unknown', 
        state: 'Your Area', 
        district: postcode 
    };
}

// Sample local resources (will be replaced with real data)
const SAMPLE_RESOURCES = [
    {
        id: '1',
        name: 'Community Food Co-op',
        type: 'cooperative',
        description: 'Worker-owned grocery store offering fresh, local, and organic products at fair prices.',
        address: '123 Main Street',
        city: 'Sample City',
        postcode: '12345',
        country: 'US',
        phone: '+1-555-0100',
        email: 'info@communityfood.coop',
        website: 'https://communityfood.coop',
        verified: true,
        workerOwned: true,
        delivery: true,
        categories: ['Food', 'Grocery', 'Organic']
    },
    {
        id: '2',
        name: 'Ethical Tech Repair',
        type: 'ethical_business',
        description: 'Fair-trade electronics repair with living wages, profit-sharing, and environmental responsibility.',
        address: '456 Tech Avenue',
        city: 'Sample City',
        postcode: '12345',
        country: 'US',
        phone: '+1-555-0200',
        email: 'repair@ethicaltech.com',
        website: 'https://ethicaltech.com',
        verified: true,
        workerOwned: false,
        delivery: false,
        categories: ['Technology', 'Repair', 'Sustainable']
    },
    {
        id: '3',
        name: 'Community Health Center',
        type: 'community_service',
        description: 'Non-profit health clinic offering affordable care, sliding-scale fees, and free services.',
        address: '789 Health Way',
        city: 'Sample City',
        postcode: '12345',
        country: 'US',
        phone: '+1-555-0300',
        email: 'info@commhealth.org',
        website: 'https://commhealth.org',
        verified: true,
        workerOwned: false,
        delivery: false,
        categories: ['Healthcare', 'Social Services', 'Non-Profit']
    }
];

/**
 * Search local resources
 */
async function searchLocalResources() {
    const postcodeInput = document.getElementById('userPostcode');
    const radiusSelect = document.getElementById('searchRadius');
    
    if (!postcodeInput || !radiusSelect) return;
    
    const postcode = postcodeInput.value.trim();
    const radius = radiusSelect.value;
    
    if (!postcode) {
        showNotification('Please enter your postcode/ZIP', 'error');
        postcodeInput.focus();
        return;
    }
    
    showLoading();
    
    try {
        // Save location preference
        if (AppState.personalizationEnabled) {
            AppState.preferences.location = {
                postcode,
                radius,
                savedAt: new Date().toISOString()
            };
            await saveUserPreferences();
        }
        
        // Derive district/state from postcode for civic dashboard integration
        const locationData = deriveLocationFromPostcode(postcode);
        
        // Update civic dashboard with location (if civic voting module is loaded)
        if (typeof CivicVotingState !== 'undefined' && typeof setUserDistrict === 'function') {
            setUserDistrict(locationData.country, locationData.state, locationData.district);
            
            // Refresh civic dashboard to show local representatives
            if (typeof displayPersonalDashboard === 'function') {
                displayPersonalDashboard();
            }
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In production, this would call a geolocation API
        // For now, display sample data
        displayLocalResults(SAMPLE_RESOURCES);
        
        hideLoading();
        showNotification(`Found ${SAMPLE_RESOURCES.length} resources within ${radius} miles. Your civic dashboard has been updated to show representatives for your area.`, 'success');
    } catch (error) {
        hideLoading();
        showNotification('😊 Oops! We couldn\'t search resources right now. Please try again in a moment. 💙', 'error');
        console.error('Search error:', error);
    }
}

/**
 * Display local results
 */
function displayLocalResults(resources) {
    const resultsContainer = document.getElementById('localResults');
    if (!resultsContainer) return;
    
    // Group by type
    const grouped = {};
    resources.forEach(resource => {
        if (!grouped[resource.type]) {
            grouped[resource.type] = [];
        }
        grouped[resource.type].push(resource);
    });
    
    let html = '';
    
    Object.entries(grouped).forEach(([type, items]) => {
        const typeInfo = LOCAL_RESOURCE_TYPES[type];
        html += `
            <div class="resource-category">
                <h3>${typeInfo.icon} ${typeInfo.name}s</h3>
                <div class="resource-cards">
                    ${items.map(resource => createResourceCard(resource)).join('')}
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
}

/**
 * Create resource card
 */
function createResourceCard(resource) {
    const typeInfo = LOCAL_RESOURCE_TYPES[resource.type];
    
    return `
        <div class="local-resource-card">
            <div class="resource-header">
                <div class="resource-icon" style="background: ${typeInfo.color};">
                    ${typeInfo.icon}
                </div>
                <div class="resource-title-area">
                    <h4>${resource.name}</h4>
                    ${resource.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                </div>
            </div>
            
            <div class="resource-badges">
                ${resource.workerOwned ? '<span class="badge badge-primary">🤝 Worker-Owned</span>' : ''}
                ${resource.delivery ? '<span class="badge badge-secondary">🚚 Delivery Available</span>' : ''}
            </div>
            
            <p class="resource-description">${resource.description}</p>
            
            <div class="resource-details">
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${resource.address}, ${resource.city} ${resource.postcode}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <a href="tel:${resource.phone}">${resource.phone}</a>
                </div>
                <div class="detail-item">
                    <i class="fas fa-envelope"></i>
                    <a href="mailto:${resource.email}">${resource.email}</a>
                </div>
                ${resource.website ? `
                    <div class="detail-item">
                        <i class="fas fa-globe"></i>
                        <a href="${resource.website}" target="_blank" rel="noopener noreferrer">
                            Visit Website <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                ` : ''}
            </div>
            
            <div class="resource-categories">
                ${resource.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
            </div>
        </div>
    `;
}

/**
 * Submit local business
 */
function submitLocalBusiness() {
    const content = `
        <div style="max-width: 700px;">
            <h2>Submit an Ethical Business</h2>
            <div style="text-align: right; margin-bottom: 20px;">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
            </div>
            
            <p>Help build our directory of ethical businesses and worker cooperatives! All submissions are reviewed to verify they meet our ethical standards.</p>
            
            <form id="businessSubmissionForm" onsubmit="handleBusinessSubmit(event)">
                <div style="margin-bottom: 20px;">
                    <label for="businessName">Business Name *</label>
                    <input type="text" id="businessName" required>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label for="businessType">Type *</label>
                    <select id="businessType" required>
                        <option value="">Select type...</option>
                        <option value="cooperative">Worker Cooperative</option>
                        <option value="ethical_business">Ethical Business</option>
                        <option value="community_service">Community Service</option>
                        <option value="social_enterprise">Social Enterprise</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label for="businessDescription">Description *</label>
                    <textarea id="businessDescription" rows="4" required placeholder="Describe the business and why it's ethical..."></textarea>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label for="businessAddress">Address *</label>
                    <input type="text" id="businessAddress" required>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label for="businessCity">City *</label>
                        <input type="text" id="businessCity" required>
                    </div>
                    <div>
                        <label for="businessPostcode">Postcode/ZIP *</label>
                        <input type="text" id="businessPostcode" required>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label for="businessPhone">Phone</label>
                    <input type="tel" id="businessPhone">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label for="businessEmail">Email *</label>
                    <input type="email" id="businessEmail" required>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label for="businessWebsite">Website</label>
                    <input type="url" id="businessWebsite" placeholder="https://">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>
                        <input type="checkbox" id="businessWorkerOwned"> 
                        This is a worker-owned cooperative
                    </label>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>
                        <input type="checkbox" id="businessDelivery"> 
                        Offers delivery or ships nationally
                    </label>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label for="ethicalPractices">Ethical Practices *</label>
                    <textarea id="ethicalPractices" rows="3" required placeholder="Describe how this business follows ethical practices (fair wages, profit sharing, environmental responsibility, etc.)"></textarea>
                </div>
                
                <div style="background: var(--background); padding: 20px; border-radius: var(--radius-md); margin-bottom: 20px;">
                    <h4>Verification Process</h4>
                    <p>All submissions are reviewed to verify:</p>
                    <ul>
                        <li>Fair wages and worker treatment</li>
                        <li>Transparent business practices</li>
                        <li>Environmental responsibility</li>
                        <li>Community benefit</li>
                    </ul>
                    <p style="margin-top: 10px; font-size: 0.875rem; color: var(--text-secondary);">
                        We may contact you for additional information during verification.
                    </p>
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    <i class="fas fa-paper-plane"></i> Submit for Verification
                </button>
            </form>
        </div>
    `;
    openModal(content);
}

/**
 * Handle business submission
 */
async function handleBusinessSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('businessName').value,
        type: document.getElementById('businessType').value,
        description: document.getElementById('businessDescription').value,
        address: document.getElementById('businessAddress').value,
        city: document.getElementById('businessCity').value,
        postcode: document.getElementById('businessPostcode').value,
        phone: document.getElementById('businessPhone').value,
        email: document.getElementById('businessEmail').value,
        website: document.getElementById('businessWebsite').value,
        workerOwned: document.getElementById('businessWorkerOwned').checked,
        delivery: document.getElementById('businessDelivery').checked,
        ethicalPractices: document.getElementById('ethicalPractices').value,
        submittedAt: new Date().toISOString(),
        verified: false
    };
    
    showLoading();
    
    try {
        // In production, this would send to a verification queue
        // For now, store locally
        const submissions = await securityManager.secureRetrieve('business_submissions') || [];
        submissions.push(formData);
        await securityManager.secureStore('business_submissions', submissions);
        
        hideLoading();
        closeModal();
        showNotification('Thank you! Your submission has been received and will be reviewed within 5 business days.', 'success');
    } catch (error) {
        hideLoading();
        showNotification('😊 Oops! We couldn\'t submit that right now. Please try again in a moment. 💙', 'error');
        console.error('Submission error:', error);
    }
}

// Inline styles removed - now using external CSS in main.css
// All local resources styles are in css/main.css for better maintainability

// Make functions globally available
window.searchLocalResources = searchLocalResources;
window.submitLocalBusiness = submitLocalBusiness;
window.handleBusinessSubmit = handleBusinessSubmit;
