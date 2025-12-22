# Backend Civic Representatives API
## V36.10.0 Phase 1

This document describes the backend API endpoint for looking up representatives using Congress.gov API and other government data sources.

---

## 🔧 Backend Endpoint

### `POST /api/civic/representatives`

Looks up federal, state, and local representatives based on ZIP code or full address.

**Request Body:**
```json
{
  "user_id": "user_abc123",
  "location": {
    "zipCode": "90210",
    "streetAddress": "123 Main St",  // Optional
    "city": "Beverly Hills",         // Optional
    "state": "CA",                   // Optional
    "fullAddress": true              // Optional - indicates full address provided
  }
}
```

**Response:**
```json
{
  "success": true,
  "representatives": [
    {
      "id": "rep_senate_ca_1",
      "name": "Alex Padilla",
      "title": "U.S. Senator",
      "office": "United States Senate",
      "level": "federal",
      "party": "D",
      "district": "California (At-large)",
      "photo_url": "https://theunitedstates.io/images/congress/450x550/P000145.jpg",
      "phone": "(202) 224-3553",
      "email": "senator@padilla.senate.gov",
      "website": "https://www.padilla.senate.gov",
      "office_address": {
        "street": "112 Hart Senate Office Building",
        "city": "Washington",
        "state": "DC",
        "zip": "20510"
      },
      "term_start": "2021-01-20",
      "term_end": "2027-01-03",
      "social_media": {
        "twitter": "@SenAlexPadilla",
        "facebook": "SenAlexPadilla"
      }
    },
    {
      "id": "rep_house_ca_33",
      "name": "Ted Lieu",
      "title": "U.S. Representative",
      "office": "U.S. House of Representatives",
      "level": "federal",
      "party": "D",
      "district": "California's 33rd District",
      "photo_url": "https://theunitedstates.io/images/congress/450x550/L000582.jpg",
      "phone": "(202) 225-3976",
      "email": "congressman@lieu.house.gov",
      "website": "https://lieu.house.gov"
    }
  ],
  "location_used": {
    "zipCode": "90210",
    "city": "Beverly Hills",
    "state": "CA",
    "coordinates": {
      "lat": 34.0901,
      "lon": -118.4065
    }
  },
  "data_sources": [
    "congress.gov",
    "google_civic_api"
  ],
  "cached": false,
  "timestamp": 1730505600000
}
```

---

## 🔌 Data Sources

### Primary: Congress.gov API
- **Endpoint**: `https://api.congress.gov/v3/member`
- **Authentication**: API key (already configured)
- **Data**: Federal representatives (House + Senate)
- **Advantages**: Official, up-to-date, free

### Secondary: Google Civic Information API
- **Endpoint**: `https://www.googleapis.com/civicinfo/v2/representatives`
- **Authentication**: API key
- **Data**: Federal + state + local representatives
- **Advantages**: Single endpoint for all levels, includes photos

### Fallback: ProPublica Congress API
- **Endpoint**: `https://api.propublica.org/congress/v1/members`
- **Authentication**: API key
- **Data**: Federal representatives only
- **Advantages**: Good historical data, voting records

---

## 📋 Implementation Steps

### Step 1: Add Endpoint to server.js

Add this to `/var/www/workforce-backend/server.js`:

```javascript
/**
 * CIVIC REPRESENTATIVES LOOKUP
 * POST /api/civic/representatives
 */
app.post('/api/civic/representatives', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { user_id, location } = req.body;
        
        if (!location || !location.zipCode) {
            return res.status(400).json({
                success: false,
                error: 'ZIP code is required'
            });
        }
        
        console.log(`[Civic API] 🔍 Looking up representatives for ZIP: ${location.zipCode}`);
        
        // Check cache first (7 day expiry)
        const cacheKey = `civic_reps_${location.zipCode}`;
        const cached = await getCachedData(cacheKey, 7 * 24 * 60 * 60 * 1000);
        
        if (cached) {
            console.log('[Civic API] ✅ Returning cached representatives');
            return res.json({
                success: true,
                representatives: cached.representatives,
                location_used: cached.location_used,
                cached: true,
                timestamp: cached.timestamp
            });
        }
        
        // Fetch from Congress.gov API
        const representatives = await fetchRepresentativesByZip(location.zipCode);
        
        // If full address provided, also fetch local reps
        if (location.fullAddress && location.streetAddress && location.city && location.state) {
            const localReps = await fetchLocalRepresentatives(location);
            representatives.push(...localReps);
        }
        
        // Cache the results
        await cacheData(cacheKey, {
            representatives: representatives,
            location_used: {
                zipCode: location.zipCode,
                city: location.city || null,
                state: location.state || null
            },
            timestamp: Date.now()
        });
        
        const responseTime = Date.now() - startTime;
        
        console.log(`[Civic API] ✅ Found ${representatives.length} representatives (${responseTime}ms)`);
        
        res.json({
            success: true,
            representatives: representatives,
            location_used: {
                zipCode: location.zipCode,
                city: location.city || null,
                state: location.state || null
            },
            data_sources: ['congress.gov'],
            cached: false,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error('[Civic API] ❌ Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to lookup representatives'
        });
    }
});

/**
 * Fetch representatives by ZIP code from Congress.gov API
 */
async function fetchRepresentativesByZip(zipCode) {
    try {
        // Step 1: Geocode ZIP to state
        const stateInfo = await getStateFromZip(zipCode);
        
        if (!stateInfo || !stateInfo.stateCode) {
            throw new Error('Unable to determine state from ZIP code');
        }
        
        console.log(`[Congress.gov] ZIP ${zipCode} → State: ${stateInfo.stateCode}`);
        
        // Step 2: Fetch senators (2 per state)
        const senators = await fetchSenators(stateInfo.stateCode);
        
        // Step 3: Fetch House representative by ZIP
        const houseRep = await fetchHouseRepByZip(zipCode, stateInfo.stateCode);
        
        const representatives = [
            ...senators,
            ...(houseRep ? [houseRep] : [])
        ];
        
        return representatives;
        
    } catch (error) {
        console.error('[Congress.gov] Error fetching representatives:', error);
        return [];
    }
}

/**
 * Get state from ZIP code (using free ZIP code database)
 */
async function getStateFromZip(zipCode) {
    // Simple ZIP to state mapping (first digit determines region)
    // For production, use a proper ZIP database or API
    const zipPrefixToState = {
        '0': 'CT', '1': 'NY', '2': 'DC', '3': 'FL', '4': 'GA',
        '5': 'IA', '6': 'IL', '7': 'OH', '8': 'AZ', '9': 'CA'
    };
    
    const prefix = zipCode.charAt(0);
    const stateCode = zipPrefixToState[prefix];
    
    // TODO: Replace with proper ZIP geocoding API
    // Options: https://www.zippopotam.us/{zipCode}
    
    return {
        stateCode: stateCode,
        zipCode: zipCode
    };
}

/**
 * Fetch senators from Congress.gov API
 */
async function fetchSenators(stateCode) {
    try {
        const apiKey = process.env.CONGRESS_GOV_API_KEY;
        
        if (!apiKey) {
            console.warn('[Congress.gov] No API key configured');
            return [];
        }
        
        const url = `https://api.congress.gov/v3/member?currentMember=true&limit=250&api_key=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.members) {
            return [];
        }
        
        // Filter for senators from this state
        const senators = data.members
            .filter(m => m.state === stateCode && m.terms?.some(t => t.chamber === 'Senate'))
            .slice(0, 2)
            .map(senator => formatRepresentative(senator, 'federal'));
        
        return senators;
        
    } catch (error) {
        console.error('[Congress.gov] Error fetching senators:', error);
        return [];
    }
}

/**
 * Fetch House representative by ZIP code
 */
async function fetchHouseRepByZip(zipCode, stateCode) {
    try {
        const apiKey = process.env.CONGRESS_GOV_API_KEY;
        
        if (!apiKey) {
            return null;
        }
        
        // TODO: Implement proper district lookup
        // For now, return placeholder
        // In production, use: https://api.congress.gov/v3/member with district filter
        
        return null;
        
    } catch (error) {
        console.error('[Congress.gov] Error fetching House rep:', error);
        return null;
    }
}

/**
 * Format representative data
 */
function formatRepresentative(member, level) {
    const party = member.partyName?.charAt(0) || 'I';
    
    return {
        id: `rep_${level}_${member.bioguideId}`,
        name: `${member.firstName} ${member.lastName}`,
        title: member.terms?.[0]?.chamber === 'Senate' ? 'U.S. Senator' : 'U.S. Representative',
        office: member.terms?.[0]?.chamber === 'Senate' ? 'United States Senate' : 'U.S. House of Representatives',
        level: level,
        party: party,
        district: member.state + (member.district ? `'s ${member.district} District` : ' (At-large)'),
        photo_url: `https://theunitedstates.io/images/congress/450x550/${member.bioguideId}.jpg`,
        phone: member.phone || null,
        email: member.email || null,
        website: member.url || null,
        term_start: member.terms?.[0]?.startYear || null,
        term_end: member.terms?.[0]?.endYear || null
    };
}

/**
 * Fetch local representatives (city, county)
 */
async function fetchLocalRepresentatives(location) {
    // TODO: Implement using Google Civic API or OpenStates
    return [];
}

/**
 * Cache data helper
 */
async function cacheData(key, data) {
    try {
        // Store in PostgreSQL cache table
        await db.query(
            `INSERT INTO response_cache (cache_key, cached_data, created_at) 
             VALUES ($1, $2, NOW()) 
             ON CONFLICT (cache_key) 
             DO UPDATE SET cached_data = $2, created_at = NOW()`,
            [key, JSON.stringify(data)]
        );
    } catch (error) {
        console.error('[Cache] Error saving:', error);
    }
}

/**
 * Get cached data helper
 */
async function getCachedData(key, maxAge) {
    try {
        const result = await db.query(
            `SELECT cached_data, created_at FROM response_cache 
             WHERE cache_key = $1 
             AND created_at > NOW() - INTERVAL '${maxAge} milliseconds'`,
            [key]
        );
        
        if (result.rows.length > 0) {
            return JSON.parse(result.rows[0].cached_data);
        }
        
        return null;
    } catch (error) {
        console.error('[Cache] Error reading:', error);
        return null;
    }
}
```

---

## 🔑 Environment Variables

Add to `/var/www/workforce-backend/.env`:

```bash
# Congress.gov API
CONGRESS_GOV_API_KEY=your_existing_api_key_here

# Optional: Google Civic Information API
GOOGLE_CIVIC_API_KEY=optional_google_api_key

# Optional: ProPublica Congress API
PROPUBLICA_API_KEY=optional_propublica_key
```

---

## 📊 Database Schema

The response_cache table should already exist. If not, create it:

```sql
CREATE TABLE IF NOT EXISTS response_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cached_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cache_created_at ON response_cache(created_at);
```

---

## 🚀 Deployment Commands

### 1. Backup existing server.js
```bash
ssh workforce-backend
cd /var/www/workforce-backend
cp server.js server.js.backup-v36.9.15-$(date +%Y%m%d-%H%M%S)
```

### 2. Update server.js
```bash
nano server.js
# Add the endpoint code above
```

### 3. Restart backend
```bash
/opt/nodejs/bin/pm2 restart workforce-backend
/opt/nodejs/bin/pm2 logs workforce-backend --lines 50
```

### 4. Test endpoint
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "location": {
      "zipCode": "90210"
    }
  }'
```

---

## 📝 Notes

1. **Congress.gov API Key**: User already has this configured
2. **ZIP to District Mapping**: Need to implement proper ZIP → Congressional District lookup
3. **Photo URLs**: Using theunitedstates.io project (public domain)
4. **Caching**: 7-day cache for representative data (they don't change often)
5. **Privacy**: Only ZIP code sent to backend, full address optional
6. **Rate Limiting**: Congress.gov API has 5000 requests/hour limit

---

## 🎯 Next Steps

1. ✅ Frontend component created (civic-representative-finder.js)
2. ⏳ Backend endpoint implementation (this document)
3. ⏳ Deploy to VPS
4. ⏳ Test with real Congress.gov API
5. ⏳ Add proper ZIP → District mapping
6. ⏳ Enhance with Google Civic API for local reps

---

## 🐛 Troubleshooting

### Representatives not found
- Check Congress.gov API key is valid
- Verify ZIP code is in correct format (5 digits)
- Check backend logs: `pm2 logs workforce-backend`

### Slow response times
- Check if caching is working
- Verify database connection
- Consider adding Redis for faster caching

### Missing photos
- Photos from theunitedstates.io may not exist for all members
- Fallback to placeholder icon implemented in frontend

---

Created: November 1, 2025
Version: V36.10.0 Phase 1
