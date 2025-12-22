# TrackAIPAC Integration Guide

**Website:** https://www.trackaipac.com/  
**Purpose:** Track AIPAC campaign donations and their impact on representative voting records  
**Date:** November 2, 2025

---

## Overview

TrackAIPAC tracks:
- AIPAC (American Israel Public Affairs Committee) donations to politicians
- How these donations correlate with votes on Israel/Palestine-related legislation
- Representatives who receive AIPAC funding
- Voting patterns on Middle East foreign policy

---

## Integration Strategy

### Option 1: Web Scraping (If No API Available)

TrackAIPAC doesn't appear to have a public API, so we'll need to scrape their data.

**Target Pages:**
- Individual representative pages: `https://www.trackaipac.com/representative/[name]`
- Search/directory pages with donation data

**Data to Extract:**
- Total AIPAC donations received
- Donation timeline
- Vote alignment with AIPAC positions
- Specific votes on Middle East policy
- Donor committees (AIPAC PAC contributions)

### Option 2: Use OpenSecrets API

OpenSecrets.org provides comprehensive campaign finance data including PAC contributions:

**API Endpoint:**
```
https://www.opensecrets.org/api/?method=candContrib&cid=[CID]&apikey=[API_KEY]
```

**Benefits:**
- Official API with structured data
- Includes AIPAC and all other PAC contributions
- Historical data available
- More reliable than scraping

---

## Implementation Plan

### Backend Module: `aipac-tracker.js`

```javascript
/**
 * AIPAC TRACKER - Campaign Finance Integration
 * Tracks AIPAC donations and voting patterns on Middle East policy
 * 
 * Data Sources:
 * 1. OpenSecrets API - Official PAC contribution data
 * 2. TrackAIPAC.com - Specialized AIPAC tracking (scraped if needed)
 * 3. Congress.gov API - Voting records on relevant bills
 * 
 * Features:
 * - Get AIPAC donations by representative
 * - Identify votes influenced by AIPAC
 * - Show donation-to-vote correlations
 * - Track historical funding patterns
 */

const axios = require('axios');
const cheerio = require('cheerio'); // For web scraping if needed

// OpenSecrets API key
const OPENSECRETS_API_KEY = process.env.OPENSECRETS_API_KEY;

/**
 * Get AIPAC-related contributions for a representative
 * Uses OpenSecrets API to get PAC contributions
 */
async function getAIPACContributions(representativeName, opensecretsCID) {
    try {
        // Step 1: Get all PAC contributions via OpenSecrets
        const response = await axios.get('https://www.opensecrets.org/api/', {
            params: {
                method: 'candContrib',
                cid: opensecretsCID,
                cycle: '2024', // Current election cycle
                apikey: OPENSECRETS_API_KEY,
                output: 'json'
            },
            timeout: 10000
        });

        // Step 2: Filter for AIPAC and related organizations
        const allContributions = response.data.response.contributors?.contributor || [];
        
        const aipacRelated = allContributions.filter(contrib => {
            const orgName = contrib['@attributes']?.org_name?.toLowerCase() || '';
            return orgName.includes('aipac') || 
                   orgName.includes('pro-israel') ||
                   orgName.includes('american israel');
        });

        // Step 3: Calculate totals
        const totalAIPAC = aipacRelated.reduce((sum, contrib) => {
            const amount = parseInt(contrib['@attributes']?.total || 0);
            return sum + amount;
        }, 0);

        return {
            success: true,
            representative: representativeName,
            opensecretsCID: opensecretsCID,
            totalAIPACContributions: totalAIPAC,
            contributions: aipacRelated.map(contrib => ({
                organization: contrib['@attributes']?.org_name,
                amount: contrib['@attributes']?.total,
                individuals: contrib['@attributes']?.indivs,
                pacs: contrib['@attributes']?.pacs
            })),
            source: 'OpenSecrets API'
        };
    } catch (error) {
        console.error('Error fetching AIPAC contributions:', error.message);
        return {
            success: false,
            error: error.message,
            fallback: 'Unable to retrieve AIPAC contribution data'
        };
    }
}

/**
 * Scrape TrackAIPAC.com for specific representative data
 * Fallback method if OpenSecrets doesn't have complete data
 */
async function scrapeTrackAIPAC(representativeName) {
    try {
        // Construct TrackAIPAC URL
        const searchName = representativeName.toLowerCase().replace(/\s+/g, '-');
        const url = `https://www.trackaipac.com/representative/${searchName}`;

        // Fetch page
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WorkforceDemocracyBot/1.0)'
            }
        });

        // Parse HTML
        const $ = cheerio.load(response.data);

        // Extract data (adjust selectors based on actual page structure)
        const totalDonations = $('[data-donations-total]').text().trim();
        const voteAlignment = $('[data-vote-alignment]').text().trim();
        const keyVotes = [];

        $('.vote-record-item').each((i, elem) => {
            keyVotes.push({
                bill: $(elem).find('.bill-name').text().trim(),
                vote: $(elem).find('.vote-position').text().trim(),
                aipacPosition: $(elem).find('.aipac-stance').text().trim(),
                aligned: $(elem).find('.aligned').length > 0
            });
        });

        return {
            success: true,
            representative: representativeName,
            totalDonations: totalDonations,
            voteAlignment: voteAlignment,
            keyVotes: keyVotes,
            source: 'TrackAIPAC.com',
            url: url
        };
    } catch (error) {
        console.error('Error scraping TrackAIPAC:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get comprehensive AIPAC influence analysis
 * Combines OpenSecrets data + TrackAIPAC data + voting records
 */
async function getAIPACInfluenceAnalysis(representative) {
    const { name, bioguideId, opensecretsCID } = representative;

    // Get data from multiple sources
    const [opensecrets, trackaipac] = await Promise.all([
        getAIPACContributions(name, opensecretsCID),
        scrapeTrackAIPAC(name)
    ]);

    // Combine data
    return {
        representative: {
            name: name,
            bioguideId: bioguideId,
            opensecretsCID: opensecretsCID
        },
        aipacDonations: {
            total: opensecrets.totalAIPACContributions || trackaipac.totalDonations,
            breakdown: opensecrets.contributions || [],
            source: opensecrets.success ? 'OpenSecrets' : 'TrackAIPAC'
        },
        voteAnalysis: {
            alignment: trackaipac.voteAlignment,
            keyVotes: trackaipac.keyVotes || [],
            source: 'TrackAIPAC'
        },
        insights: generateAIPACInsights(opensecrets, trackaipac)
    };
}

/**
 * Generate insights about AIPAC influence
 */
function generateAIPACInsights(opensecrets, trackaipac) {
    const insights = [];

    if (opensecrets.totalAIPACContributions > 0) {
        insights.push({
            type: 'funding',
            severity: opensecrets.totalAIPACContributions > 100000 ? 'high' : 'medium',
            message: `Received $${opensecrets.totalAIPACContributions.toLocaleString()} from AIPAC-related sources`,
            source: 'OpenSecrets'
        });
    }

    if (trackaipac.voteAlignment) {
        const alignmentPercent = parseFloat(trackaipac.voteAlignment);
        if (alignmentPercent > 80) {
            insights.push({
                type: 'voting',
                severity: 'high',
                message: `Votes align ${alignmentPercent}% with AIPAC positions on Middle East policy`,
                source: 'TrackAIPAC'
            });
        }
    }

    // Check for potential conflicts of interest
    if (opensecrets.totalAIPACContributions > 50000 && trackaipac.keyVotes?.length > 0) {
        const alignedVotes = trackaipac.keyVotes.filter(v => v.aligned).length;
        const totalVotes = trackaipac.keyVotes.length;
        const alignmentRate = (alignedVotes / totalVotes) * 100;

        if (alignmentRate > 75) {
            insights.push({
                type: 'conflict',
                severity: 'critical',
                message: `High correlation between AIPAC funding and voting patterns: ${alignedVotes}/${totalVotes} votes aligned`,
                recommendation: 'Voters should scrutinize the relationship between campaign contributions and legislative actions'
            });
        }
    }

    return insights;
}

module.exports = {
    getAIPACContributions,
    scrapeTrackAIPAC,
    getAIPACInfluenceAnalysis
};
```

---

## Server Endpoint

Add to `backend/server.js`:

```javascript
const aipacTracker = require('./aipac-tracker');

// Get AIPAC influence analysis for a representative
app.get('/api/aipac/representative/:bioguideId', async (req, res) => {
    try {
        const { bioguideId } = req.params;
        
        // Get representative info first
        const representative = await getRepresentativeByBioguideId(bioguideId);
        
        if (!representative) {
            return res.status(404).json({
                success: false,
                error: 'Representative not found'
            });
        }
        
        // Get AIPAC analysis
        const analysis = await aipacTracker.getAIPACInfluenceAnalysis(representative);
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('AIPAC analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve AIPAC analysis'
        });
    }
});
```

---

## Frontend Integration

### Display AIPAC Data in Representative Cards

Update `js/rep-finder-simple.js` to include AIPAC data:

```javascript
async function fetchRepresentatives(zipCode) {
    // ... existing code ...
    
    // For each federal representative, fetch AIPAC data
    for (const rep of representatives) {
        if (rep.level === 'federal') {
            try {
                const aipacResponse = await fetch(`https://api.workforcedemocracyproject.org/api/aipac/representative/${rep.bioguideId}`);
                if (aipacResponse.ok) {
                    const aipacData = await aipacResponse.json();
                    rep.aipacData = aipacData.data;
                }
            } catch (error) {
                console.warn('Could not fetch AIPAC data:', error);
            }
        }
    }
    
    // ... display representatives with AIPAC badges ...
}

function displayRepresentatives(representatives) {
    // Add AIPAC funding badge to representative cards
    if (rep.aipacData?.aipacDonations?.total > 0) {
        html += `
            <div class="aipac-badge" style="
                background: #fee2e2;
                border: 1px solid #dc2626;
                border-radius: 4px;
                padding: 0.5rem;
                margin-top: 0.5rem;
                font-size: 0.875rem;
            ">
                <strong>⚠️ AIPAC Funded:</strong> $${rep.aipacData.aipacDonations.total.toLocaleString()}
                <br>
                <small>Vote alignment: ${rep.aipacData.voteAnalysis?.alignment || 'Unknown'}</small>
            </div>
        `;
    }
}
```

---

## AI Prompt Integration

Update `backend/ai-service.js` to include AIPAC data in prompts:

```javascript
// In SYSTEM_PROMPTS.representatives, add:

**Campaign Finance Red Flags:**
- When discussing representatives, ALWAYS check for AIPAC contributions
- If AIPAC funding > $50,000, note this prominently
- Highlight correlation between AIPAC donations and Middle East policy votes
- Be especially critical of representatives who vote consistently with donor interests
- Cite TrackAIPAC.com and OpenSecrets for campaign finance data

**Example Analysis:**
"Representative [Name] has received $[amount] from AIPAC-related sources according to OpenSecrets[1]. 
Their voting record shows [percentage]% alignment with AIPAC positions on Middle East policy according 
to TrackAIPAC.com[2]. This raises concerns about potential conflicts of interest, as voters should 
consider whether policy positions are driven by constituent needs or donor influence."
```

---

## Environment Variables

Add to `backend/.env`:

```bash
# OpenSecrets API (for campaign finance data)
OPENSECRETS_API_KEY=your_opensecrets_api_key_here

# Optional: TrackAIPAC API if they provide one in the future
TRACKAIPAC_API_KEY=
```

---

## Dependencies

Install required packages:

```bash
cd backend
npm install cheerio  # For web scraping if needed
```

---

## Data Sources

### OpenSecrets.org
- **API Docs:** https://www.opensecrets.org/api/admin/index.php?function=candContrib
- **Provides:** PAC contributions, donor data, spending
- **Free tier:** Yes, with API key
- **Get API key:** https://www.opensecrets.org/api/admin/index.php

### TrackAIPAC.com
- **URL:** https://www.trackaipac.com/
- **Provides:** AIPAC-specific tracking, vote alignment
- **API:** None (scraping required)
- **Legal:** Check robots.txt and terms of service before scraping

### Congress.gov
- **Already integrated**
- **Provides:** Voting records, bill sponsorships
- **Use for:** Cross-referencing AIPAC positions with actual votes

---

## Ethical Considerations

1. **Transparency:** Always cite sources (OpenSecrets, TrackAIPAC)
2. **Accuracy:** Cross-reference data from multiple sources
3. **Context:** Explain what AIPAC is and why donations matter
4. **Fairness:** Note that accepting donations doesn't automatically mean corruption
5. **Critical Analysis:** Highlight patterns and let users form their own conclusions

---

## Testing

### Test with Known AIPAC Recipients

Representatives known to receive significant AIPAC funding (as of 2024):
- Chuck Schumer (D-NY)
- Mitch McConnell (R-KY)
- Nancy Pelosi (D-CA)
- Ted Cruz (R-TX)

**Test queries:**
```bash
# Get AIPAC data
curl "https://api.workforcedemocracyproject.org/api/aipac/representative/S000148"  # Chuck Schumer

# Expected response:
{
  "success": true,
  "data": {
    "representative": { "name": "Charles Schumer", ... },
    "aipacDonations": {
      "total": 150000,
      "breakdown": [...]
    },
    "voteAnalysis": {
      "alignment": "95%",
      "keyVotes": [...]
    },
    "insights": [...]
  }
}
```

---

## Deployment Checklist

- [ ] Add `aipac-tracker.js` to backend
- [ ] Update `server.js` with `/api/aipac/representative/:bioguideId` endpoint
- [ ] Add OpenSecrets API key to `.env`
- [ ] Install cheerio: `npm install cheerio`
- [ ] Update AI prompts to mention AIPAC funding
- [ ] Add AIPAC badges to representative cards (frontend)
- [ ] Test with known AIPAC recipients
- [ ] Deploy backend changes
- [ ] Deploy frontend changes

---

## Future Enhancements

1. **Historical Tracking:** Show AIPAC funding over time (2010-2024)
2. **Comparison Tool:** Compare AIPAC influence across multiple representatives
3. **Alert System:** Notify users when their representative receives AIPAC money
4. **Voting Correlation:** Statistical analysis of donation-to-vote correlation
5. **Other PACs:** Expand to track NRA, pharmaceutical, oil & gas donations

---

**Status:** 📋 Implementation Guide Ready  
**Next Step:** Create `backend/aipac-tracker.js` module  
**Estimated Time:** 2-3 hours for full integration
