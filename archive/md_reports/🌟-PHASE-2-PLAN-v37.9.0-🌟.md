# 🌟 Phase 2 Implementation Plan - Charity Navigator Integration

## Version 37.9.0 - Enhanced Nonprofit Verification

**Date:** November 10, 2025  
**Status:** 🔄 Planning Phase  
**Goal:** Integrate Charity Navigator API for verified, rated nonprofit data

---

## Executive Summary

**Phase 2** enhances the community services feature by integrating **Charity Navigator API**, providing:
- ✅ Quality verification (≥3 star filter)
- ✅ Current ratings and accountability scores
- ✅ Better data than IRS 990 filings alone
- ✅ 30-day caching system
- ✅ User report system for outdated info

---

## Charity Navigator API Overview

### What is Charity Navigator?

**Charity Navigator** is America's largest and most-utilized independent nonprofit evaluator. They rate charities on:
- **Financial Health** (0-4 stars)
- **Accountability & Transparency** (0-4 stars)
- **Overall Rating** (0-4 stars)

**Coverage:** 200,000+ rated nonprofits (vs ProPublica's 1.8M unrated orgs)

### API Access

**Application Process:**
1. Apply at: https://www.charitynavigator.org/index.cfm?bay=content.view&cpid=1397
2. Free for civic/nonprofit projects
3. API key issued within 1-2 business days

**API Documentation:** https://charity.3scale.net/

**Rate Limits:**
- Free tier: 1,000 calls/day
- Enterprise: 10,000 calls/day (if needed)

**Our Strategy:** 30-day caching to stay well within limits

---

## Phase 2 Architecture

### Data Flow

```
User Search
    ↓
Backend Proxy (api.workforcedemocracyproject.org)
    ↓
Check Cache (30-day TTL)
    ↓
If Cached → Return cached data
    ↓
If Not Cached:
    ├→ ProPublica API (basic nonprofit data)
    ├→ Charity Navigator API (ratings)
    └→ Merge data + Cache for 30 days
    ↓
Return to Frontend
    ↓
Display with star ratings
```

### Database Schema

**New Tables:**

1. **nonprofit_cache** (caching layer)
```sql
CREATE TABLE nonprofit_cache (
    id SERIAL PRIMARY KEY,
    ein VARCHAR(20) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    charity_navigator_data JSONB,
    rating_stars INTEGER,
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    INDEX (ein),
    INDEX (expires_at)
);
```

2. **nonprofit_reports** (user reports)
```sql
CREATE TABLE nonprofit_reports (
    id SERIAL PRIMARY KEY,
    ein VARCHAR(20) NOT NULL,
    org_name VARCHAR(255),
    report_type VARCHAR(50), -- 'outdated_info', 'closed', 'wrong_location', etc.
    user_message TEXT,
    reported_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    INDEX (ein),
    INDEX (status),
    INDEX (reported_at)
);
```

---

## Implementation Steps

### Backend Changes

#### Step 1: Add Charity Navigator API Integration

**File:** `backend/services/charity-navigator-service.js` (NEW)

```javascript
/**
 * Charity Navigator API Service
 * Fetches ratings and detailed nonprofit data
 */

const fetch = require('node-fetch');

const CHARITY_NAVIGATOR_API = {
    BASE_URL: 'https://api.charitynavigator.org/v2',
    APP_ID: process.env.CHARITY_NAVIGATOR_APP_ID,
    APP_KEY: process.env.CHARITY_NAVIGATOR_APP_KEY
};

/**
 * Search Charity Navigator by EIN
 * @param {string} ein - Organization EIN
 * @returns {Promise<Object>} - Rating data or null
 */
async function getCharityByEIN(ein) {
    try {
        const url = `${CHARITY_NAVIGATOR_API.BASE_URL}/Organizations?ein=${ein}`;
        
        const response = await fetch(url, {
            headers: {
                'app_id': CHARITY_NAVIGATOR_API.APP_ID,
                'app_key': CHARITY_NAVIGATOR_API.APP_KEY
            }
        });
        
        if (!response.ok) {
            console.warn(`Charity Navigator API error for EIN ${ein}:`, response.status);
            return null;
        }
        
        const data = await response.json();
        
        // Return first result (EIN should be unique)
        if (data && data.length > 0) {
            return data[0];
        }
        
        return null;
        
    } catch (error) {
        console.error('Charity Navigator fetch error:', error);
        return null;
    }
}

/**
 * Get overall star rating
 * @param {Object} charityData - Charity Navigator data
 * @returns {number} - Star rating (0-4)
 */
function getOverallRating(charityData) {
    if (!charityData || !charityData.currentRating) return 0;
    
    return charityData.currentRating.rating || 0;
}

/**
 * Check if charity meets quality threshold (≥3 stars)
 * @param {Object} charityData - Charity Navigator data
 * @returns {boolean}
 */
function meetsQualityThreshold(charityData) {
    const rating = getOverallRating(charityData);
    return rating >= 3;
}

module.exports = {
    getCharityByEIN,
    getOverallRating,
    meetsQualityThreshold
};
```

---

#### Step 2: Update Backend Nonprofit Proxy

**File:** `backend/routes/nonprofit-proxy.js` (UPDATE)

Add caching and Charity Navigator integration:

```javascript
const express = require('express');
const router = express.Router();
const charityNavigator = require('../services/charity-navigator-service');
const db = require('../db'); // PostgreSQL connection

/**
 * Search nonprofits with caching and ratings
 * Enhanced with Charity Navigator integration
 */
router.get('/search', async (req, res) => {
    const { q, state, city } = req.query;
    
    try {
        // Step 1: Search ProPublica for basic data
        const propublicaUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(q)}`;
        const propublicaResponse = await fetch(propublicaUrl);
        const propublicaData = await propublicaResponse.json();
        
        const orgs = propublicaData.organizations || [];
        
        // Step 2: Enhance with Charity Navigator ratings (parallel requests)
        const enhancedOrgs = await Promise.all(
            orgs.map(async (org) => {
                // Check cache first
                const cached = await db.query(
                    'SELECT * FROM nonprofit_cache WHERE ein = $1 AND expires_at > NOW()',
                    [org.ein]
                );
                
                if (cached.rows.length > 0) {
                    console.log(`📦 Cache hit for EIN ${org.ein}`);
                    return cached.rows[0].data;
                }
                
                // Fetch from Charity Navigator
                const charityData = await charityNavigator.getCharityByEIN(org.ein);
                const rating = charityData ? charityNavigator.getOverallRating(charityData) : 0;
                
                // Merge data
                const enhanced = {
                    ...org,
                    charity_navigator: charityData,
                    rating_stars: rating,
                    has_rating: !!charityData
                };
                
                // Cache for 30 days
                await db.query(
                    `INSERT INTO nonprofit_cache (ein, data, charity_navigator_data, rating_stars, expires_at)
                     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')
                     ON CONFLICT (ein) DO UPDATE
                     SET data = $2, charity_navigator_data = $3, rating_stars = $4, cached_at = NOW(), expires_at = NOW() + INTERVAL '30 days'`,
                    [org.ein, JSON.stringify(enhanced), JSON.stringify(charityData), rating]
                );
                
                return enhanced;
            })
        );
        
        // Step 3: Filter to ≥3 stars (optional: can make this configurable)
        const qualityOrgs = enhancedOrgs.filter(org => {
            // If no rating, include (new/small nonprofits may not be rated yet)
            // If rated, must be ≥3 stars
            return !org.has_rating || org.rating_stars >= 3;
        });
        
        // Apply state/city filters
        let filtered = qualityOrgs;
        if (state) {
            filtered = filtered.filter(org => org.state && org.state.toUpperCase() === state.toUpperCase());
        }
        if (city) {
            filtered = filtered.filter(org => org.city && org.city.toLowerCase().includes(city.toLowerCase()));
        }
        
        res.json({
            success: true,
            data: filtered,
            total: filtered.length,
            query: q,
            filters: { state, city },
            quality_filter: '≥3 stars or unrated'
        });
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get single organization with full details
 */
router.get('/:ein', async (req, res) => {
    const { ein } = req.params;
    
    try {
        // Check cache first
        const cached = await db.query(
            'SELECT * FROM nonprofit_cache WHERE ein = $1 AND expires_at > NOW()',
            [ein]
        );
        
        if (cached.rows.length > 0) {
            console.log(`📦 Cache hit for EIN ${ein}`);
            return res.json({
                success: true,
                data: cached.rows[0].data
            });
        }
        
        // Fetch from ProPublica
        const propublicaUrl = `https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`;
        const propublicaResponse = await fetch(propublicaUrl);
        const propublicaData = await propublicaResponse.json();
        
        // Fetch from Charity Navigator
        const charityData = await charityNavigator.getCharityByEIN(ein);
        const rating = charityData ? charityNavigator.getOverallRating(charityData) : 0;
        
        const enhanced = {
            organization: {
                ...propublicaData.organization,
                charity_navigator: charityData,
                rating_stars: rating,
                has_rating: !!charityData
            }
        };
        
        // Cache for 30 days
        await db.query(
            `INSERT INTO nonprofit_cache (ein, data, charity_navigator_data, rating_stars, expires_at)
             VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')
             ON CONFLICT (ein) DO UPDATE
             SET data = $2, charity_navigator_data = $3, rating_stars = $4, cached_at = NOW(), expires_at = NOW() + INTERVAL '30 days'`,
            [ein, JSON.stringify(enhanced.organization), JSON.stringify(charityData), rating]
        );
        
        res.json({
            success: true,
            data: enhanced
        });
        
    } catch (error) {
        console.error('Organization fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
```

---

#### Step 3: Add Report System Endpoint

**File:** `backend/routes/nonprofit-proxy.js` (ADD)

```javascript
/**
 * Report outdated nonprofit information
 */
router.post('/report', async (req, res) => {
    const { ein, orgName, reportType, message } = req.body;
    
    if (!ein || !orgName) {
        return res.status(400).json({
            success: false,
            error: 'EIN and organization name are required'
        });
    }
    
    try {
        await db.query(
            `INSERT INTO nonprofit_reports (ein, org_name, report_type, user_message)
             VALUES ($1, $2, $3, $4)`,
            [ein, orgName, reportType || 'outdated_info', message || '']
        );
        
        // Optional: Send notification email to admin
        // await sendAdminNotification(ein, orgName);
        
        res.json({
            success: true,
            message: 'Report submitted successfully. Thank you for helping us maintain accurate information!'
        });
        
    } catch (error) {
        console.error('Report submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit report'
        });
    }
});
```

---

### Frontend Changes

#### Step 1: Update Organization Modal with Rating Display

**File:** `js/community-services.js` (UPDATE `renderOrganizationModal`)

Add rating display section:

```javascript
// After building full address, check for Charity Navigator rating
const charityNav = org.charity_navigator;
const ratingStars = org.rating_stars || 0;
const hasRating = org.has_rating;

// Build rating HTML
let ratingHTML = '';
if (hasRating && charityNav) {
    const starIcons = '⭐'.repeat(ratingStars) + '☆'.repeat(4 - ratingStars);
    
    ratingHTML = `
        <div class="modal-section rating-section">
            <h4>⭐ CHARITY NAVIGATOR RATING</h4>
            <div class="rating-display">
                <div class="star-rating">${starIcons}</div>
                <p class="rating-score">${ratingStars} out of 4 stars</p>
                ${charityNav.financialRating ? `
                    <div class="rating-details">
                        <span>💰 Financial Health: ${charityNav.financialRating.rating}/4</span>
                        <span>🔍 Accountability: ${charityNav.accountabilityRating?.rating || 'N/A'}/4</span>
                    </div>
                ` : ''}
                <a href="https://www.charitynavigator.org/ein/${org.ein}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="verify-link">
                    View Full Rating on Charity Navigator →
                </a>
            </div>
        </div>
    `;
}

// Insert rating section after address, before service categories
modal.innerHTML = `
    <div class="modal-overlay" onclick="closeOrganizationModal()"></div>
    <div class="modal-content">
        <div class="modal-header">
            <h3>🏛️ ${escapeHtml(org.name)}</h3>
            <button class="modal-close" onclick="closeOrganizationModal()">×</button>
        </div>
        <div class="modal-body">
            <!-- Address Section -->
            ${addressSectionHTML}
            
            <!-- Rating Section (NEW) -->
            ${ratingHTML}
            
            <!-- Service Categories -->
            ${serviceCategoriesHTML}
            
            <!-- Rest of modal... -->
        </div>
    </div>
`;
```

---

#### Step 2: Update Report Function to Connect to Backend

**File:** `js/community-services.js` (UPDATE `reportOutdatedInfo`)

```javascript
/**
 * Report outdated organization information
 * Phase 2: Connected to backend
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
            alert(`✅ Thank you for your report!\n\nOrganization: ${orgName}\n\nWe'll review this organization's details and update them as soon as possible. Your feedback helps keep our community informed!`);
        } else {
            alert(`❌ Unable to submit report at this time. Please try again later.\n\nOrganization: ${orgName}`);
        }
        
    } catch (error) {
        console.error('Report submission error:', error);
        alert(`❌ Network error. Please check your connection and try again.\n\nOrganization: ${orgName}`);
    }
}
```

---

#### Step 3: Add Rating Badge Styles

**File:** `css/community-services.css` (ADD)

```css
/* Charity Navigator Rating Section */
.rating-section {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid #f59e0b;
    border-radius: 12px;
    padding: 1.5rem;
}

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
    color: #92400e;
    margin: 0 0 1rem 0;
}

.rating-details {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin: 1rem 0;
    font-size: 0.95rem;
    color: #78350f;
    flex-wrap: wrap;
}

.rating-details span {
    font-weight: 600;
}

.verify-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: #f59e0b;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
}

.verify-link:hover {
    background: #d97706;
    transform: translateY(-2px);
}

/* Rating badge in card view */
.org-rating-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #f59e0b;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #92400e;
}
```

---

## Environment Variables

**File:** `backend/.env` (ADD)

```bash
# Charity Navigator API Credentials
CHARITY_NAVIGATOR_APP_ID=your_app_id_here
CHARITY_NAVIGATOR_APP_KEY=your_app_key_here
```

---

## Database Migrations

**File:** `backend/migrations/001_phase2_tables.sql` (NEW)

```sql
-- Phase 2: Nonprofit caching and reporting tables

-- Nonprofit cache table (30-day TTL)
CREATE TABLE IF NOT EXISTS nonprofit_cache (
    id SERIAL PRIMARY KEY,
    ein VARCHAR(20) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    charity_navigator_data JSONB,
    rating_stars INTEGER DEFAULT 0,
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    INDEX idx_ein (ein),
    INDEX idx_expires (expires_at)
);

-- Nonprofit user reports table
CREATE TABLE IF NOT EXISTS nonprofit_reports (
    id SERIAL PRIMARY KEY,
    ein VARCHAR(20) NOT NULL,
    org_name VARCHAR(255),
    report_type VARCHAR(50) DEFAULT 'outdated_info',
    user_message TEXT,
    reported_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_at TIMESTAMP,
    reviewer_notes TEXT,
    INDEX idx_ein_reports (ein),
    INDEX idx_status (status),
    INDEX idx_reported_at (reported_at)
);

-- Cleanup job (run daily via cron)
-- DELETE FROM nonprofit_cache WHERE expires_at < NOW();
```

---

## Deployment Steps

### Step 1: Apply for Charity Navigator API Key

1. Visit: https://www.charitynavigator.org/index.cfm?bay=content.view&cpid=1397
2. Fill out application (mention civic project for free access)
3. Wait 1-2 business days for approval
4. Add credentials to `backend/.env`

### Step 2: Create Database Tables

```bash
# SSH to VPS
ssh root@185.193.126.13

# Navigate to backend
cd /var/www/workforce-democracy/backend

# Run migration
psql -U your_db_user -d workforce_democracy -f migrations/001_phase2_tables.sql
```

### Step 3: Deploy Backend Code

```bash
# Create deployment script: DEPLOY-PHASE-2-v37.9.0.sh
# Include:
# - New charity-navigator-service.js file
# - Updated nonprofit-proxy.js routes
# - Migration script
# - .env updates (manual after deployment)
# - PM2 restart

# Upload and execute
scp DEPLOY-PHASE-2-v37.9.0.sh root@185.193.126.13:/tmp/
ssh root@185.193.126.13 'bash /tmp/DEPLOY-PHASE-2-v37.9.0.sh'
```

### Step 4: Deploy Frontend Code

```bash
# Git push to Netlify
git add js/community-services.js css/community-services.css
git commit -m "v37.9.0: Phase 2 - Charity Navigator integration"
git push origin main
```

---

## Testing Plan

### Backend Tests

1. **Cache functionality:**
   - First request → Fetches from APIs, caches data
   - Second request → Returns cached data
   - After 30 days → Re-fetches and updates cache

2. **Rating filter:**
   - Search returns only ≥3 star orgs (or unrated)
   - 1-2 star orgs excluded

3. **Report system:**
   - POST to /api/nonprofits/report
   - Verify row inserted in database

### Frontend Tests

1. **Rating display:**
   - Open organization modal
   - Verify star rating shown (if available)
   - Verify "View on Charity Navigator" link

2. **Report button:**
   - Click "Report Outdated Info"
   - Verify success message
   - Check backend database for new row

---

## Expected Improvements

### User Experience

**Before Phase 2:**
- ❓ No quality verification
- ❓ Outdated IRS data (1-2 years old)
- ❓ No way to report issues

**After Phase 2:**
- ✅ Only show ≥3 star rated orgs (or unrated new ones)
- ✅ Current ratings and accountability scores
- ✅ Users can report outdated info
- ✅ Better data quality overall

### Performance

**Caching Benefits:**
- 📉 Reduced API calls (stay within free tier)
- ⚡ Faster response times (cache hits)
- 💰 Cost savings (no need for paid API tier)

---

## Timeline

**Estimated Duration:** 1-2 days

- **Day 1:**
  - Apply for Charity Navigator API key (1-2 business days wait)
  - Create backend service files
  - Create database migrations
  - Create deployment script

- **Day 2:**
  - Receive API credentials
  - Deploy backend
  - Update frontend
  - Test integration
  - Deploy to production

---

## Success Metrics

### Quality Improvement
- ✅ X% of organizations have ratings
- ✅ Only ≥3 star orgs shown (quality filter active)

### User Engagement
- ✅ X reports submitted per week
- ✅ X users clicking "View on Charity Navigator"

### Performance
- ✅ Cache hit rate: >80%
- ✅ API calls: <500/day (well within 1,000 limit)

---

## Next Steps

**Immediate Actions:**

1. ✅ Apply for Charity Navigator API key
2. ✅ Create backend service files
3. ✅ Create database migration script
4. ✅ Test integration in development
5. ✅ Deploy to production

**After Phase 2:**

- Phase 3: Ethical Business Directory (7 countries)
- Phase 4: Advanced search filters
- Phase 5: Mobile app integration

---

*Phase 2 Planning Document*  
*Version 37.9.0 - November 10, 2025*  
*"Verified nonprofits for verified impact" 🌟*
