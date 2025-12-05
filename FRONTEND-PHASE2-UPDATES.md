# Frontend Phase 2 Updates - Transparent Rating Display

## Changes to js/community-services.js

### 1. Update renderOrganizationModal() Function

Add after the address section (around line 895):

```javascript
// ===== PHASE 2: CHARITY NAVIGATOR RATING SECTION =====
// Build transparent rating display
let ratingHTML = '';

if (org.has_rating && org.charity_navigator) {
    // Organization HAS a Charity Navigator rating
    const rating = org.rating_stars || 0;
    const status = org.rating_status || 'unrated';
    const stars = '⭐'.repeat(rating) + '☆'.repeat(4 - rating);
    
    // Determine badge color based on rating
    let badgeClass = 'rating-good';
    if (rating < 3) badgeClass = 'rating-warning';
    if (rating < 2) badgeClass = 'rating-poor';
    
    ratingHTML = `
        <div class="modal-section rating-section ${badgeClass}">
            <h4>⭐ CHARITY NAVIGATOR RATING</h4>
            
            <div class="rating-display">
                <div class="star-rating">${stars}</div>
                <p class="rating-score">${rating} out of 4 stars</p>
                
                ${org.rating_message ? `
                    <p class="rating-message">${escapeHtml(org.rating_message)}</p>
                ` : ''}
                
                <!-- Transparency Disclosure -->
                ${org.rating_disclosure ? `
                    <div class="rating-disclosure">
                        <p><strong>📋 What this means:</strong></p>
                        <p>${escapeHtml(org.rating_disclosure)}</p>
                    </div>
                ` : ''}
                
                <!-- Financial & Accountability Breakdown -->
                ${org.charity_navigator.currentRating ? `
                    <div class="rating-details">
                        ${org.charity_navigator.currentRating.financialRating ? `
                            <div class="rating-detail-item">
                                <span class="detail-label">💰 Financial Health:</span>
                                <span class="detail-value">${org.charity_navigator.currentRating.financialRating.rating}/4 stars</span>
                            </div>
                        ` : ''}
                        ${org.charity_navigator.currentRating.accountabilityRating ? `
                            <div class="rating-detail-item">
                                <span class="detail-label">🔍 Accountability & Transparency:</span>
                                <span class="detail-value">${org.charity_navigator.currentRating.accountabilityRating.rating}/4 stars</span>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <!-- Action Links -->
                <div class="rating-actions">
                    <a href="${org.charity_navigator_url}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="rating-link verify-link">
                        📊 View Full Report on Charity Navigator →
                    </a>
                    
                    <!-- User Feedback Link -->
                    <a href="${org.user_review_url}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="rating-link feedback-link">
                        💬 Had a Different Experience? Share on Charity Navigator →
                    </a>
                </div>
                
                <p class="rating-note">
                    <small>
                        ℹ️ Charity Navigator is an independent nonprofit evaluator. 
                        Your experience may differ - we encourage you to share your feedback to help others!
                    </small>
                </p>
            </div>
        </div>
    `;
    
} else {
    // Organization is UNRATED (transparent disclosure)
    ratingHTML = `
        <div class="modal-section rating-section rating-unrated">
            <h4>⭐ CHARITY NAVIGATOR RATING</h4>
            
            <div class="rating-display">
                <p class="rating-message">
                    ${org.rating_message || 'This organization has not been rated by Charity Navigator yet.'}
                </p>
                
                <!-- Transparency Disclosure for Unrated -->
                <div class="rating-disclosure">
                    <p><strong>📋 What this means:</strong></p>
                    <p>
                        ${org.rating_disclosure || "This doesn't mean the organization isn't trustworthy - many small, local, or newer nonprofits aren't rated. We still include them to ensure you have access to community resources."}
                    </p>
                    <p style="margin-top: 0.75rem;">
                        <strong>Why include unrated organizations?</strong>
                    </p>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem; text-align: left;">
                        <li>Many effective small nonprofits aren't yet rated</li>
                        <li>Newer organizations need time to establish rating history</li>
                        <li>Local community groups may be too small for national rating</li>
                        <li>We prioritize accessibility to community resources</li>
                    </ul>
                </div>
                
                <!-- User Due Diligence Guidance -->
                <div class="unrated-guidance">
                    <p><strong>🔍 We recommend:</strong></p>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem; text-align: left;">
                        <li>Check their website for mission and financials</li>
                        <li>Ask about their programs and impact</li>
                        <li>Look for local reviews or testimonials</li>
                        <li>Start with small engagement before major donations</li>
                    </ul>
                </div>
                
                <!-- Action Links -->
                <div class="rating-actions">
                    <a href="${charityNavigator.getCharityNavigatorURL(org.ein)}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="rating-link verify-link">
                        📊 Check if Rating Available on Charity Navigator →
                    </a>
                    
                    <!-- User Feedback Link -->
                    <a href="${charityNavigator.getUserReviewURL(org.ein)}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="rating-link feedback-link">
                        💬 Share Your Experience on Charity Navigator →
                    </a>
                </div>
                
                <p class="rating-note">
                    <small>
                        ℹ️ Your feedback helps others! Share your experience on Charity Navigator to build community knowledge.
                    </small>
                </p>
            </div>
        </div>
    `;
}

// Insert rating section into modal HTML
// (Add ${ratingHTML} after address section, before service categories)
```

---

### 2. Update reportOutdatedInfo() Function

Replace the Phase 1 placeholder with backend connection (around line 1209):

```javascript
/**
 * Report outdated organization information
 * Phase 2: Connected to backend database
 */
async function reportOutdatedInfo(orgName, ein) {
    try {
        const response = await fetch(`${NONPROFIT_API.BASE_URL}/api/nonprofits/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ein: ein,
                orgName: orgName,
                reportType: 'outdated_info',
                message: 'User reported outdated information via community services widget'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Thank you for your report!\n\nOrganization: ${orgName}\n\n${result.message}\n\nYour feedback helps keep our community informed and up-to-date. We'll review this organization's information as soon as possible.`);
        } else {
            alert(`❌ Unable to submit report at this time.\n\nOrganization: ${orgName}\n\nPlease try again later or contact us directly if the issue persists.`);
        }
        
    } catch (error) {
        console.error('Report submission error:', error);
        alert(`❌ Network error. Please check your connection and try again.\n\nOrganization: ${orgName}`);
    }
}
```

---

## Changes to css/community-services.css

### Add Phase 2 Rating Styles

Add at the end of the file (after line 942):

```css
/* ============================================================================
   Phase 2: Charity Navigator Rating Styles
   ============================================================================ */

/* Rating Section Container */
.rating-section {
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.rating-section h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #374151;
}

/* Rating Good (≥3 stars) */
.rating-section.rating-good {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border: 2px solid #10b981;
}

.rating-section.rating-good h4 {
    color: #065f46;
}

/* Rating Warning (2 stars) */
.rating-section.rating-warning {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid #f59e0b;
}

.rating-section.rating-warning h4 {
    color: #92400e;
}

/* Rating Poor (1 star) */
.rating-section.rating-poor {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border: 2px solid #ef4444;
}

.rating-section.rating-poor h4 {
    color: #991b1b;
}

/* Rating Unrated */
.rating-section.rating-unrated {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border: 2px solid #9ca3af;
}

.rating-section.rating-unrated h4 {
    color: #374151;
}

/* Rating Display */
.rating-display {
    text-align: center;
}

.star-rating {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    letter-spacing: 0.25rem;
}

.rating-score {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.75rem 0;
}

.rating-message {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
}

/* Transparency Disclosure Box */
.rating-disclosure {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    text-align: left;
}

.rating-disclosure p {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
    color: #374151;
    line-height: 1.6;
}

.rating-disclosure p:last-child {
    margin-bottom: 0;
}

.rating-disclosure strong {
    color: #1f2937;
}

.rating-disclosure ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.rating-disclosure li {
    margin: 0.25rem 0;
    line-height: 1.5;
    font-size: 0.9rem;
}

/* Rating Details Breakdown */
.rating-details {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
}

.rating-detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.rating-detail-item:last-child {
    border-bottom: none;
}

.detail-label {
    font-size: 0.9rem;
    color: #374151;
    font-weight: 500;
}

.detail-value {
    font-size: 0.95rem;
    color: #1f2937;
    font-weight: 700;
}

/* Unrated Guidance Box */
.unrated-guidance {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid #3b82f6;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    text-align: left;
}

.unrated-guidance p {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
    color: #1e40af;
    font-weight: 600;
}

.unrated-guidance ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
    color: #1e3a8a;
}

.unrated-guidance li {
    margin: 0.25rem 0;
    line-height: 1.5;
    font-size: 0.9rem;
}

/* Action Links */
.rating-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1.5rem 0 1rem 0;
}

.rating-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s;
    text-align: center;
}

.verify-link {
    background: #3b82f6;
    color: white;
}

.verify-link:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.feedback-link {
    background: white;
    color: #3b82f6;
    border: 2px solid #3b82f6;
}

.feedback-link:hover {
    background: #eff6ff;
    transform: translateY(-2px);
}

.rating-note {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 1rem 0 0 0;
    line-height: 1.5;
    font-style: italic;
}

.rating-note small {
    font-size: inherit;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .rating-section {
        padding: 1.25rem;
    }
    
    .star-rating {
        font-size: 1.75rem;
    }
    
    .rating-score {
        font-size: 1.125rem;
    }
    
    .rating-details {
        padding: 0.75rem;
    }
    
    .rating-detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }
    
    .rating-actions {
        gap: 0.5rem;
    }
    
    .rating-link {
        font-size: 0.9rem;
        padding: 0.625rem 1.25rem;
    }
}
```

---

## Implementation Notes

### Transparency Features Implemented

1. ✅ **Clear rating status** - Visual star display with numeric score
2. ✅ **Explanation for ALL ratings** - "What this means" disclosure box
3. ✅ **Low rating warning** - Special styling and detailed explanation
4. ✅ **Unrated transparency** - Explains why unrated orgs are included
5. ✅ **User guidance** - Recommendations for unrated organizations
6. ✅ **Direct links** - Both to view full report AND share feedback
7. ✅ **Feedback encouragement** - "Had a Different Experience?" link
8. ✅ **Independent source note** - Clarifies Charity Navigator is separate

### User Experience Flow

**For Rated Organization (≥3 stars):**
1. See star rating with visual badge (green)
2. Read "Highly rated" message
3. See "What this means" explanation
4. View financial/accountability breakdown
5. Click to view full report
6. Click to share feedback if experience differs

**For Low-Rated Organization (<3 stars):**
1. See star rating with warning badge (yellow/red)
2. Read rating concerns
3. See detailed "What this means" explanation
4. Understand why still included
5. Click to review full concerns
6. Share feedback to help others

**For Unrated Organization:**
1. See "Not yet rated" message
2. Read why unrated orgs are included
3. See due diligence recommendations
4. Understand it's not negative
5. Check if rating now available
6. Share experience to help build knowledge

---

*Frontend Phase 2 Implementation Guide*  
*Version 37.9.0 - November 10, 2025*
