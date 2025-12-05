# ⚡ Quick Deploy - V36.10.0 Phase 1
## Backend Deployment in 5 Minutes

**For:** Experienced developers who want the fastest path to deployment  
**Risk:** Low (new endpoint, non-breaking)  
**Time:** ~5 minutes

---

## 🚀 TL;DR - Copy/Paste Commands

### Option A: Automated (Recommended)

```bash
# 1. Copy script to VPS
scp BACKEND-DEPLOYMENT-V36.10.0.sh root@185.193.126.13:/root/

# 2. SSH and run
ssh root@185.193.126.13
chmod +x /root/BACKEND-DEPLOYMENT-V36.10.0.sh
/root/BACKEND-DEPLOYMENT-V36.10.0.sh
```

### Option B: Manual (5 Commands)

```bash
# 1. SSH to VPS
ssh root@185.193.126.13

# 2. Backup
cd /var/www/workforce-backend
cp server.js server.js.backup-$(date +%Y%m%d-%H%M%S)

# 3. Add endpoint (see code below)
nano server.js
# Insert code at line before app.listen()

# 4. Restart
/opt/nodejs/bin/pm2 restart workforce-backend

# 5. Test
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","location":{"zipCode":"90210"}}'
```

---

## 📝 Endpoint Code to Insert

**Location:** Before `app.listen()` in `/var/www/workforce-backend/server.js`

```javascript
/**
 * CIVIC REPRESENTATIVES LOOKUP - V36.10.0 PHASE 1
 */
app.post('/api/civic/representatives', async (req, res) => {
    const startTime = Date.now();
    try {
        const { user_id, location } = req.body;
        if (!location || !location.zipCode) {
            return res.status(400).json({ success: false, error: 'ZIP code is required' });
        }
        console.log(`[Civic API] 🔍 Looking up representatives for ZIP: ${location.zipCode}`);
        const representatives = getMockRepresentatives(location.zipCode);
        const responseTime = Date.now() - startTime;
        console.log(`[Civic API] ✅ Found ${representatives.length} representatives (${responseTime}ms)`);
        res.json({
            success: true,
            representatives: representatives,
            location_used: { zipCode: location.zipCode, city: location.city || null, state: location.state || null },
            data_sources: ['mock_data'],
            cached: false,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('[Civic API] ❌ Error:', error);
        res.status(500).json({ success: false, error: 'Failed to lookup representatives' });
    }
});

function getMockRepresentatives(zipCode) {
    const zipPrefix = zipCode.charAt(0);
    const zipToState = { '0': 'CT', '1': 'NY', '2': 'DC', '3': 'FL', '4': 'GA', '5': 'IA', '6': 'IL', '7': 'OH', '8': 'AZ', '9': 'CA' };
    const state = zipToState[zipPrefix] || 'CA';
    return [
        { id: `rep_senate_${state}_1`, name: `Senator ${state} (Senior)`, title: 'U.S. Senator', office: 'United States Senate', level: 'federal', party: 'D', district: `${state} (At-large)`, photo_url: null, phone: '(202) 224-0000', email: `senior.senator@${state.toLowerCase()}.senate.gov`, website: 'https://www.senate.gov', term_start: '2019-01-03', term_end: '2025-01-03' },
        { id: `rep_senate_${state}_2`, name: `Senator ${state} (Junior)`, title: 'U.S. Senator', office: 'United States Senate', level: 'federal', party: 'R', district: `${state} (At-large)`, photo_url: null, phone: '(202) 224-0001', email: `junior.senator@${state.toLowerCase()}.senate.gov`, website: 'https://www.senate.gov', term_start: '2021-01-20', term_end: '2027-01-03' },
        { id: `rep_house_${state}_01`, name: `Representative ${state} District 1`, title: 'U.S. Representative', office: 'U.S. House of Representatives', level: 'federal', party: 'D', district: `${state}'s 1st District`, photo_url: null, phone: '(202) 225-0000', email: `rep.district1@${state.toLowerCase()}.house.gov`, website: 'https://www.house.gov', term_start: '2021-01-03', term_end: '2025-01-03' }
    ];
}
```

---

## ✅ Success Check

```bash
# Should return JSON with 3 representatives
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","location":{"zipCode":"90210"}}'
```

**Expected:** `"success":true` with 3 representative objects

---

## 🐛 Quick Fixes

**404 Error:**
```bash
grep "civic/representatives" /var/www/workforce-backend/server.js
# If empty, endpoint wasn't added - add it again
```

**500 Error:**
```bash
/opt/nodejs/bin/node -c /var/www/workforce-backend/server.js
# Check for syntax errors
```

**PM2 Issues:**
```bash
/opt/nodejs/bin/pm2 status
/opt/nodejs/bin/pm2 logs workforce-backend --lines 20
```

---

## 🔄 Rollback

```bash
cd /var/www/workforce-backend
cp server.js.backup-[TIMESTAMP] server.js
/opt/nodejs/bin/pm2 restart workforce-backend
```

---

## 📚 Full Documentation

- **Automated Script:** `BACKEND-DEPLOYMENT-V36.10.0.sh`
- **Manual Guide:** `BACKEND-DEPLOYMENT-MANUAL.md`
- **API Docs:** `BACKEND-CIVIC-REPRESENTATIVES-API.md`
- **Full Instructions:** `DEPLOY-V36.10.0-PHASE1-INSTRUCTIONS.md`

---

**Done!** 🎉 Test at https://workforcedemocracyproject.org → Civic Engagement → My Reps
