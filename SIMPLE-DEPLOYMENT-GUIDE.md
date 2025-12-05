# 🚀 Simple VPS Deployment Guide - v37.0.2

## Quick Summary
You need to replace the civic-api.js file on your VPS with the corrected version that includes real representative data integration.

---

## Option 1: Direct Edit on VPS (Easiest)

### Step 1: SSH into VPS
```bash
ssh your-username@your-vps-ip
```

### Step 2: Backup Current File
```bash
sudo cp /var/www/workforce-democracy/civic/backend/civic-api.js /var/www/workforce-democracy/civic/backend/civic-api.js.backup
```

### Step 3: Edit the File
```bash
sudo nano /var/www/workforce-democracy/civic/backend/civic-api.js
```

### Step 4: Find Line 28
Look for this line:
```javascript
const ScrapingQueue = require('./scraping-queue');
```

### Step 5: Add New Line After Line 28
Add this line:
```javascript
const { getRepresentativesByZip } = require('../../backend/us-representatives');
```

So it looks like:
```javascript
const ScrapingQueue = require('./scraping-queue');
const { getRepresentativesByZip } = require('../../backend/us-representatives');
```

### Step 6: Find the ZIP Code Section
Scroll down to around line 46-48, find this:
```javascript
// Accept ZIP code searches
```

### Step 7: Replace the Entire `if (zip) { ... }` Block

**DELETE everything from** `if (zip) {` **to the closing** `}`

**REPLACE WITH:**
```javascript
if (zip) {
    console.log(`🔍 ZIP code search: ${zip}`);
    
    // Validate ZIP code
    if (!/^\d{5}$/.test(zip)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid ZIP code format. Please provide a 5-digit ZIP code.'
        });
    }
    
    // V37.0.2: Use REAL representative data from us-representatives.js
    console.log(`📡 Fetching real representatives for ZIP: ${zip}`);
    const result = await getRepresentativesByZip(zip);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error || 'Failed to fetch representatives',
            query: { zip }
        });
    }
    
    console.log(`✅ Found ${result.representatives?.length || 0} representatives for ZIP ${zip}`);
    
    return res.json({
        success: true,
        query: { zip },
        results: result.representatives,
        location: {
            state: result.state,
            district: result.district
        },
        sources: result.sources,
        message: 'Real data from Congress.gov & OpenStates APIs'
    });
}
```

### Step 8: Save the File
- Press `Ctrl+O` (save)
- Press `Enter` (confirm)
- Press `Ctrl+X` (exit)

### Step 9: Restart Backend
```bash
sudo /opt/nodejs/bin/pm2 restart workforce-democracy-backend
```

### Step 10: Check Logs
```bash
sudo /opt/nodejs/bin/pm2 logs workforce-democracy-backend --lines 30
```

**Look for:**
- ✅ "🏛️  Civic Platform API initialized"
- ✅ "Server running on port 3001"
- ❌ Any errors

### Step 11: Test It
```bash
# Test LLM chat
curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health

# Test representatives
curl -s "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=10001"
```

---

## Option 2: Upload Complete File (If Direct Edit is Confusing)

### Step 1: Download the Corrected File
I've created `civic-api-CORRECTED-v37.0.2.js` for you.

### Step 2: Upload to VPS
From your local machine:
```bash
scp civic-api-CORRECTED-v37.0.2.js your-username@your-vps:/tmp/
```

### Step 3: SSH into VPS
```bash
ssh your-username@your-vps-ip
```

### Step 4: Backup and Replace
```bash
# Backup original
sudo cp /var/www/workforce-democracy/civic/backend/civic-api.js /var/www/workforce-democracy/civic/backend/civic-api.js.backup

# Replace with new file
sudo mv /tmp/civic-api-CORRECTED-v37.0.2.js /var/www/workforce-democracy/civic/backend/civic-api.js

# Set permissions
sudo chown www-data:www-data /var/www/workforce-democracy/civic/backend/civic-api.js
sudo chmod 644 /var/www/workforce-democracy/civic/backend/civic-api.js
```

### Step 5: Restart Backend
```bash
sudo /opt/nodejs/bin/pm2 restart workforce-democracy-backend
```

### Step 6: Check Logs
```bash
sudo /opt/nodejs/bin/pm2 logs workforce-democracy-backend --lines 30
```

---

## ⚠️ Important: API Keys

Before testing, verify API keys are configured:

```bash
sudo cat /var/www/workforce-democracy/backend/.env | grep API_KEY
```

**You MUST have:**
- ✅ `GROQ_API_KEY=gsk_...` (for chat)
- ✅ `CONGRESS_API_KEY=...` (for real representative data)
- ✅ `OPENSTATES_API_KEY=...` (for state legislators)

**If missing, get keys from:**
- Congress.gov: https://api.congress.gov/sign-up/
- OpenStates: https://openstates.org/accounts/profile/

**Add to .env:**
```bash
sudo nano /var/www/workforce-democracy/backend/.env
```

Add missing keys, then save and restart.

---

## ✅ Success Checklist

After deployment, verify:

- [ ] No errors in PM2 logs
- [ ] `/api/civic/llm-health` returns `"available": true`
- [ ] Representative search returns real senators (Schumer, Gillibrand for ZIP 10001)
- [ ] Chat responds without "Load failed" error
- [ ] ZIP search shows "Real data from Congress.gov & OpenStates APIs"

---

## 🆘 If You Get Stuck

**Send me:**
1. Output of: `sudo /opt/nodejs/bin/pm2 logs workforce-democracy-backend --lines 30`
2. Output of: `curl -s "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=10001"`
3. Which step you're stuck on

I'll help immediately!

---

## What Fixed

### Before:
- Chat showed "Load failed" (endpoint exists, should work if API key is set)
- Representative search returned mock/hardcoded data
- No real API integration

### After:
- Chat works (assuming GROQ_API_KEY is configured)
- Representative search calls real Congress.gov API
- Returns actual senators and representatives
- Uses cached data to avoid rate limits
