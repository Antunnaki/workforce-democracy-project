# 🗺️ Backend Implementation Roadmap

**Your Request**: "Could you please map out the next steps I need to follow for backend implementation."

**Answer**: Here's your complete roadmap with 3 phases: Deploy Frontend → Fix Backend URLs → Optional Improvements

---

## 📊 **CURRENT STATUS**

| Component | Status | Action Needed |
|-----------|--------|---------------|
| **Frontend Fixes** | ✅ Complete | Deploy to GenSpark |
| **Backend URL Fix** | ✅ Complete | Deploy to VPS |
| **Contact Links** | ℹ️ Already Present | No changes needed |
| **Photo Proxy** | ⚠️ State photos 404 | Optional future fix |

---

## 🎯 **ROADMAP OVERVIEW**

```
Phase 1: Deploy Frontend (REQUIRED)
├─ Time: 5 minutes
├─ Impact: Fixes photo overlay + text contrast
└─ Users see: Clean photos, readable text

Phase 2: Deploy Backend (REQUIRED)  
├─ Time: 10 minutes
├─ Impact: Fixes website URL routing
└─ Users see: Website links go to actual rep sites

Phase 3: Optional Improvements (FUTURE)
├─ Time: 1-2 hours
├─ Impact: Email data + state photos
└─ Users see: More contact info, state rep photos
```

---

## 📋 **PHASE 1: Deploy Frontend Fixes** ⚡ REQUIRED

### **What Gets Fixed**
✅ Photo overlay bug (letters no longer show over photos)  
✅ Text contrast (ZIP description + header now crisp white)  
✅ Version tracking (console shows V36.12.3)

### **Files Changed**
```
js/rep-finder-simple.js  ← Main fixes
index.html              ← Cache-busting
```

### **Implementation Steps**

#### **Step 1.1: Deploy via Publish Tab** (2 min)
1. Go to **Publish tab** in your development environment
2. Click **Publish** or **Deploy** button
3. Wait for deployment to complete

#### **Step 1.2: Verify Deployment** (2 min)
1. Open live site in browser
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Open console (`F12`)
4. Look for: `🚀 [REP-FINDER V36.12.3] Loading`

#### **Step 1.3: Test Fixes** (1 min)
Enter ZIP `10001` and verify:
- ✅ Photos load cleanly (no letter "S" over Chuck Schumer's photo)
- ✅ Text above ZIP entry is crisp white
- ✅ "Found 7 representatives" header is crisp white

### **Success Criteria**
```javascript
// Console should show:
🚀 [REP-FINDER V36.12.3] Loading - Contrast fixes, photo overlay removed
📊 [REP-FINDER V36.12.3] Received 7 representatives: [...]
```

### **Troubleshooting**
| Problem | Solution |
|---------|----------|
| Still shows V36.12.2 | Hard refresh or clear cache |
| Photos still have letters | Check console version, try incognito mode |
| Text still low contrast | Verify cache-busting query param updated |

**Time**: 5 minutes  
**Difficulty**: Easy  
**User Impact**: Immediate visual improvements

---

## 🔧 **PHASE 2: Deploy Backend Website URL Fix** ⚡ REQUIRED

### **What Gets Fixed**
✅ Website links route to actual representative websites  
✅ No more congress.gov profile page redirects

### **Current Problem**
```
User clicks "Website" button
❌ Goes to: https://www.congress.gov/member/S000148 (profile page)
✅ Should go to: https://www.schumer.senate.gov (actual website)
```

### **The Fix**
Backend now generates actual website URLs using standard naming pattern:
- Senators: `https://www.lastname.senate.gov`
- House: `https://lastname.house.gov`

### **Implementation Steps**

#### **Step 2.1: Access Backend Server** (1 min)
```bash
# SSH into your VPS
ssh your-username@api.workforcedemocracyproject.org

# Navigate to backend directory
cd /var/www/workforce-democracy/backend
```

#### **Step 2.2: Backup Current File** (1 min)
```bash
# Create backup
cp us-representatives.js us-representatives.js.backup-v36.12.2

# Verify backup exists
ls -la *.backup*
```

#### **Step 2.3: Edit Function** (5 min)

Open file:
```bash
nano us-representatives.js
# Or: vim us-representatives.js
# Or: code us-representatives.js
```

Find the `formatCongressMember` function (around line 359).

**Current code (BEFORE):**
```javascript
function formatCongressMember(member, chamber) {
    const latestTerm = member.terms && member.terms.length > 0 ? member.terms[member.terms.length - 1] : {};
    
    return {
        id: `congress_${member.bioguideId}`,
        name: `${member.firstName || ''} ${member.middleName || ''} ${member.lastName || ''}`.trim(),
        // ... other fields ...
        website: member.officialWebsiteUrl || `https://www.congress.gov/member/${member.bioguideId}`,
        // ... rest ...
    };
}
```

**Replace with (AFTER):**
```javascript
function formatCongressMember(member, chamber) {
    const latestTerm = member.terms && member.terms.length > 0 ? member.terms[member.terms.length - 1] : {};
    
    // 🔧 FIX: Build actual website URL if officialWebsiteUrl is missing
    let websiteUrl = member.officialWebsiteUrl;
    
    // If congress.gov doesn't provide website, construct senator/house website
    if (!websiteUrl || websiteUrl.trim() === '') {
        const lastName = (member.lastName || '').toLowerCase();
        
        if (chamber === 'Senate') {
            // Senate website pattern: https://www.lastname.senate.gov
            websiteUrl = `https://www.${lastName}.senate.gov`;
            console.log(`📝 [WEBSITE FIX] Generated Senate URL for ${member.firstName} ${member.lastName}: ${websiteUrl}`);
        } else {
            // House website pattern: https://lastname.house.gov
            websiteUrl = `https://${lastName}.house.gov`;
            console.log(`📝 [WEBSITE FIX] Generated House URL for ${member.firstName} ${member.lastName}: ${websiteUrl}`);
        }
    }
    
    return {
        id: `congress_${member.bioguideId}`,
        name: `${member.firstName || ''} ${member.middleName || ''} ${member.lastName || ''}`.trim(),
        title: chamber === 'Senate' ? 'U.S. Senator' : 'U.S. Representative',
        office: chamber === 'Senate' ? 'United States Senate' : 'U.S. House of Representatives',
        level: 'federal',
        party: member.partyName || latestTerm.party || 'Unknown',
        state: member.state,
        district: chamber === 'House' ? `${member.state}-${member.district}` : `${member.state} (At-large)`,
        photo_url: member.depiction?.imageUrl || null,
        phone: latestTerm.office || null,
        email: null, // Congress.gov doesn't provide direct email
        website: websiteUrl, // ✅ FIXED: Now uses constructed URL
        term_start: latestTerm.startYear || null,
        term_end: latestTerm.endYear || null,
        bioguide_id: member.bioguideId,
        source: 'congress.gov',
        verified: true
    };
}
```

Save and exit:
- `Ctrl+X` then `Y` then `Enter` (nano)
- `:wq` (vim)

#### **Step 2.4: Restart Backend** (2 min)

Using PM2:
```bash
# Restart backend
pm2 restart workforce-democracy-backend

# Verify it's running
pm2 status

# Check logs for errors
pm2 logs workforce-democracy-backend --lines 20
```

Using systemd:
```bash
sudo systemctl restart workforce-democracy-backend
sudo systemctl status workforce-democracy-backend
```

#### **Step 2.5: Test Backend** (1 min)

Test the API directly:
```bash
curl "https://api.workforcedemocracyproject.org/api/query" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "find representatives for 10001"}' \
  | grep -A 5 "website"

# Expected output:
# "website": "https://www.schumer.senate.gov"  ✅ CORRECT
# NOT: "website": "https://www.congress.gov/member/S000148"  ❌ OLD
```

Check logs for URL generation:
```bash
pm2 logs | grep "WEBSITE FIX"

# Should see:
# 📝 [WEBSITE FIX] Generated Senate URL for Charles Schumer: https://www.schumer.senate.gov
```

### **Success Criteria**
```javascript
// Backend logs should show:
📝 [WEBSITE FIX] Generated Senate URL for Charles Schumer: https://www.schumer.senate.gov
📝 [WEBSITE FIX] Generated Senate URL for Kirsten Gillibrand: https://www.gillibrand.senate.gov
```

### **End-to-End Test**
1. Go to live site
2. Enter ZIP `10001`
3. Find Chuck Schumer
4. Click **🌐 Website** button
5. Should open: `https://www.schumer.senate.gov` ✅
6. Should NOT open: `https://www.congress.gov/member/S000148` ❌

### **Troubleshooting**
| Problem | Solution |
|---------|----------|
| PM2 restart fails | Check syntax errors: `node us-representatives.js` |
| Still goes to congress.gov | Check backend logs for "WEBSITE FIX" messages |
| 500 server error | Check PM2 logs: `pm2 logs --lines 50` |
| Backend not generating URLs | Verify `officialWebsiteUrl` is empty in API response |

**Time**: 10 minutes  
**Difficulty**: Medium  
**User Impact**: Website links route correctly

---

## 🚀 **PHASE 3: Optional Improvements** 🔮 FUTURE

These improvements are **NOT REQUIRED** but will enhance the user experience.

### **Improvement 1: Add Email Data via ProPublica API**

**Current Status**: Email hardcoded to `null` (line 373)

**Why It's Missing**: Congress.gov API doesn't provide email addresses

**Solution**: Add ProPublica Congress API integration

#### **Implementation**

**Step 3.1.1: Get ProPublica API Key** (5 min)
1. Go to https://www.propublica.org/datastore/api/propublica-congress-api
2. Request API key (free, instant approval)
3. Add to `.env` file:
```bash
PROPUBLICA_API_KEY=your-key-here
```

**Step 3.1.2: Create ProPublica Integration** (15 min)

Add to `backend/us-representatives.js`:

```javascript
const PROPUBLICA_API_BASE = 'https://api.propublica.org/congress/v1';
const PROPUBLICA_API_KEY = process.env.PROPUBLICA_API_KEY;

/**
 * Enrich member data with ProPublica API (email, better contact info)
 */
async function enrichWithProPublica(bioguideId) {
    try {
        if (!PROPUBLICA_API_KEY || PROPUBLICA_API_KEY === 'OPTIONAL_FOR_NOW') {
            return null;
        }
        
        const response = await axios.get(
            `${PROPUBLICA_API_BASE}/members/${bioguideId}.json`,
            { headers: { 'X-API-Key': PROPUBLICA_API_KEY } }
        );
        
        return response.data.results[0];
    } catch (error) {
        console.error(`⚠️ ProPublica API error for ${bioguideId}:`, error.message);
        return null;
    }
}
```

**Step 3.1.3: Update formatCongressMember** (10 min)

Change from synchronous to async:
```javascript
async function formatCongressMember(member, chamber) {
    const latestTerm = member.terms && member.terms.length > 0 ? member.terms[member.terms.length - 1] : {};
    
    // Website URL logic (keep existing code)
    let websiteUrl = member.officialWebsiteUrl;
    // ... existing website generation code ...
    
    // NEW: Enrich with ProPublica data
    const propublicaData = await enrichWithProPublica(member.bioguideId);
    
    return {
        id: `congress_${member.bioguideId}`,
        name: `${member.firstName || ''} ${member.middleName || ''} ${member.lastName || ''}`.trim(),
        title: chamber === 'Senate' ? 'U.S. Senator' : 'U.S. Representative',
        office: chamber === 'Senate' ? 'United States Senate' : 'U.S. House of Representatives',
        level: 'federal',
        party: member.partyName || latestTerm.party || 'Unknown',
        state: member.state,
        district: chamber === 'House' ? `${member.state}-${member.district}` : `${member.state} (At-large)`,
        photo_url: member.depiction?.imageUrl || null,
        phone: propublicaData?.phone || latestTerm.office || null, // ✅ Better phone
        email: propublicaData?.contact_form || propublicaData?.email || null, // ✅ Now has email!
        website: websiteUrl,
        term_start: latestTerm.startYear || null,
        term_end: latestTerm.endYear || null,
        bioguide_id: member.bioguideId,
        source: 'congress.gov',
        verified: true
    };
}
```

**Step 3.1.4: Update Function Calls** (10 min)

Since `formatCongressMember` is now async, update callers:
```javascript
// OLD
.map(member => formatCongressMember(member, 'Senate'));

// NEW
const promises = members.map(member => formatCongressMember(member, 'Senate'));
const senators = await Promise.all(promises);
```

**Benefits**:
- ✅ Email contact links will appear for representatives
- ✅ Better phone number accuracy
- ✅ More complete contact information

**Time**: 40 minutes  
**Difficulty**: Medium-Hard

---

### **Improvement 2: Fix State Representative Photos**

**Current Status**: State photos (e.g., nysenate.gov) return 404 through photo proxy

**Why It's Broken**: Photo proxy may only whitelist federal government domains

**Solution**: Update photo proxy to allow state legislature domains

#### **Implementation**

**Step 3.2.1: Find Photo Proxy Code** (5 min)

The photo proxy is at `https://api.workforcedemocracyproject.org/api/photo-proxy`

Likely in `backend/server.js` or separate file. Search for:
```bash
grep -r "photo-proxy" /var/www/workforce-democracy/backend/
```

**Step 3.2.2: Add State Domains to Whitelist** (10 min)

Find domain whitelist in photo proxy code:
```javascript
// Current (federal only)
const allowedDomains = [
    'congress.gov',
    'bioguide.congress.gov',
    'api.congress.gov'
];

// Updated (includes state)
const allowedDomains = [
    'congress.gov',
    'bioguide.congress.gov',
    'api.congress.gov',
    // State legislatures
    'nysenate.gov',
    'assembly.ca.gov',
    'senate.ca.gov',
    'legislature.ca.gov',
    'ilga.gov', // Illinois
    'flsenate.gov', // Florida
    'flhouse.gov',
    'txlege.state.tx.us', // Texas
    // Add more as needed
];
```

**Step 3.2.3: Test State Photos** (5 min)

Test Alexis Weik's photo (reported as broken):
```bash
curl "https://api.workforcedemocracyproject.org/api/photo-proxy?url=https://www.nysenate.gov/sites/default/files/styles/160x160/..." \
  -I

# Should return: 200 OK (not 404)
```

**Benefits**:
- ✅ State representative photos will load
- ✅ Better visual consistency across all reps

**Time**: 20 minutes  
**Difficulty**: Easy-Medium

---

### **Improvement 3: Verify Phone Number Field**

**Current Status**: Using `latestTerm.office` which might be office address, not phone

**Investigation Needed**:
```javascript
// Add debug logging temporarily
console.log('Term fields:', Object.keys(latestTerm));
console.log('Office value:', latestTerm.office);
console.log('All term data:', JSON.stringify(latestTerm, null, 2));
```

**Possible Fields to Check**:
- `latestTerm.phone`
- `latestTerm.contact.phone`
- `member.phone`
- `member.contact.phone`

**If Wrong Field**:
Update line 372:
```javascript
// OLD
phone: latestTerm.office || null,

// NEW (if better field exists)
phone: latestTerm.phone || member.phone || latestTerm.office || null,
```

**Benefits**:
- ✅ Accurate phone numbers
- ✅ More representatives have phone data

**Time**: 15 minutes  
**Difficulty**: Easy

---

## 📊 **COMPLETE ROADMAP SUMMARY**

### **Required Phases** (Must Do Now)

| Phase | Time | Difficulty | User Impact |
|-------|------|----------|-------------|
| **Phase 1: Frontend** | 5 min | Easy | Photo overlay fixed, text readable |
| **Phase 2: Backend** | 10 min | Medium | Website links work correctly |
| **Total** | **15 min** | - | **All critical issues fixed** |

### **Optional Improvements** (Future Enhancement)

| Improvement | Time | Difficulty | User Impact |
|-------------|------|----------|-------------|
| **ProPublica Email** | 40 min | Medium-Hard | Email links appear |
| **State Photo Proxy** | 20 min | Easy-Medium | State rep photos load |
| **Phone Field Fix** | 15 min | Easy | More accurate phones |
| **Total** | **75 min** | - | **Enhanced user experience** |

---

## ✅ **DEPLOYMENT CHECKLIST**

Use this to track your progress:

### **Phase 1: Frontend** ⚡ REQUIRED
- [ ] Open Publish tab
- [ ] Click Publish/Deploy
- [ ] Wait for completion
- [ ] Hard refresh live site
- [ ] Console shows V36.12.3
- [ ] Photos are clean (no letters)
- [ ] Text is crisp white

### **Phase 2: Backend** ⚡ REQUIRED
- [ ] SSH into VPS
- [ ] Backup `us-representatives.js`
- [ ] Edit `formatCongressMember` function
- [ ] Add website URL generation logic
- [ ] Save file
- [ ] Restart PM2/systemd
- [ ] Check logs for errors
- [ ] Test URL generation with curl
- [ ] Test Chuck Schumer website link

### **Phase 3: Optional** 🔮 FUTURE
- [ ] Get ProPublica API key
- [ ] Add `enrichWithProPublica` function
- [ ] Update `formatCongressMember` to async
- [ ] Update function callers
- [ ] Find photo proxy code
- [ ] Add state domains to whitelist
- [ ] Test state rep photos
- [ ] Investigate phone number field
- [ ] Update phone field if needed

---

## 📞 **NEED HELP?**

### **Quick Guides**
- **Fast deployment**: [QUICK-START-V36.12.3.md](QUICK-START-V36.12.3.md)
- **Detailed guide**: [🚀-V36.12.3-DEPLOYMENT-ROADMAP.md](🚀-V36.12.3-DEPLOYMENT-ROADMAP.md)

### **Troubleshooting**
- Check console logs (frontend)
- Check PM2 logs (backend): `pm2 logs --lines 50`
- Test in incognito mode (cache issues)
- Verify versions match (V36.12.3)

### **Common Issues**
| Problem | Quick Fix |
|---------|-----------|
| Old version showing | Hard refresh + clear cache |
| Backend won't restart | Check syntax: `node us-representatives.js` |
| Photos still broken | Check console for V36.12.3 |
| Website still wrong | Check backend logs for "WEBSITE FIX" |

---

## 🎯 **SUCCESS!**

You'll know you're done when:

1. ✅ Console shows `🚀 [REP-FINDER V36.12.3]`
2. ✅ Photos load cleanly (no letters)
3. ✅ Text is crisp and readable
4. ✅ Chuck Schumer's website goes to `schumer.senate.gov`
5. ✅ Backend logs show `📝 [WEBSITE FIX] Generated Senate URL...`

---

**Total Required Time**: 15 minutes  
**Total Optional Time**: 75 minutes  
**Difficulty**: Easy to Medium  
**Status**: Ready to deploy!
