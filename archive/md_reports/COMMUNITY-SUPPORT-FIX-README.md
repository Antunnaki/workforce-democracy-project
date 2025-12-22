# 🆘 Community Support Feature Fix - v37.8.4

## 📋 Problem Identified

When users try to use the **"Find Community Support"** feature on the homepage:
- Enter a postcode/ZIP code
- Click search or select a category
- **Error appears:** "Unable to reach community services database"

## 🔍 Root Cause

The backend server (`/var/www/workforce-democracy/backend/server.js`) is **missing the nonprofit API endpoints** that the frontend expects:

```javascript
// Missing endpoints:
GET /api/nonprofits/search?q=food&state=NY
GET /api/nonprofits/:ein
```

The frontend (`js/community-services.js`) tries to call:
```javascript
const NONPROFIT_API = {
    BASE_URL: 'https://api.workforcedemocracyproject.org',
    SEARCH: '/api/nonprofits/search'  // ← This endpoint doesn't exist!
};
```

## ✅ Solution

Deploy **v37.8.4** which adds the missing nonprofit proxy endpoints to the backend server.

### What the Fix Does:

1. **Adds nonprofit-proxy require statement** to server.js
2. **Creates `/api/nonprofits/search` endpoint** - searches nonprofit organizations
3. **Creates `/api/nonprofits/:ein` endpoint** - gets nonprofit details
4. **Restarts PM2** to apply changes

### Files Modified:

- `backend/server.js` - adds nonprofit endpoints

### Files Used (already exist):

- `backend/nonprofit-proxy.js` - handles ProPublica API calls
- `js/community-services.js` - frontend community support widget

## 🚀 Deployment Instructions

### Step 1: Upload Script to VPS

From your Mac:
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/"
scp 'DEPLOY-COMMUNITY-SUPPORT-FIX-v37.8.4.sh' root@185.193.126.13:/tmp/
```

### Step 2: Execute on VPS

In your VPS SSH session:
```bash
chmod +x /tmp/DEPLOY-COMMUNITY-SUPPORT-FIX-v37.8.4.sh
/tmp/DEPLOY-COMMUNITY-SUPPORT-FIX-v37.8.4.sh
```

### Step 3: Verify Deployment

The script will:
- ✅ Create backup of server.js
- ✅ Add nonprofit endpoints
- ✅ Verify syntax
- ✅ Restart PM2
- ✅ Show verification results

## 🧪 Testing After Deployment

1. **Go to homepage:** https://workforcedemocracyproject.org
2. **Scroll down** to "Find Community Support" section
3. **Test ZIP search:**
   - Enter ZIP code: `10001` (New York)
   - Click "Search My State"
   - Should show list of nonprofit organizations
   
4. **Test category search:**
   - Click any category card (e.g., "Food Banks", "Legal Aid")
   - Should load organizations for that category

5. **Expected Results:**
   - ✅ Organizations appear with names, locations, ZIP codes
   - ✅ Click organization to view details on ProPublica
   - ✅ No "Unable to reach community services database" error

## 📊 API Endpoints Added

### Search Nonprofits
```
GET /api/nonprofits/search?q={query}&state={STATE}&city={CITY}

Example:
GET /api/nonprofits/search?q=food+bank&state=NY

Response:
{
  "success": true,
  "data": [
    {
      "ein": "123456789",
      "name": "Example Food Bank",
      "city": "New York",
      "state": "NY",
      "zipcode": "10001",
      "revenue_amount": 5000000
    }
  ],
  "total": 1,
  "query": "food bank"
}
```

### Get Nonprofit Details
```
GET /api/nonprofits/:ein

Example:
GET /api/nonprofits/123456789

Response:
{
  "success": true,
  "data": {
    "organization": {
      "ein": "123456789",
      "name": "Example Food Bank",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipcode": "10001"
    }
  }
}
```

## 🛠️ How It Works

### Backend Flow:

1. User enters ZIP code on frontend
2. Frontend calls: `GET /api/nonprofits/search?q=food&state=NY`
3. Backend receives request at new endpoint
4. Backend calls `searchNonprofits()` from nonprofit-proxy.js
5. nonprofit-proxy.js calls ProPublica API
6. Results returned to frontend with ZIP codes enriched
7. Frontend displays organizations with proximity sorting

### Data Sources:

- **ProPublica Nonprofit Explorer API** - https://projects.propublica.org/nonprofits/api
- Provides access to IRS Form 990 data for all US nonprofits
- Includes name, location, revenue, mission statements

## 📁 Related Files

### Backend:
- `backend/server.js` - main server file (now includes nonprofit endpoints)
- `backend/nonprofit-proxy.js` - ProPublica API wrapper

### Frontend:
- `js/community-services.js` - community support widget
- `index.html` - homepage (contains community support section)

## 🔄 Rollback Instructions

If something goes wrong:

```bash
cd /var/www/workforce-democracy/backend
ls -lt server.js.backup-*  # Find latest backup
cp server.js.backup-TIMESTAMP server.js  # Replace TIMESTAMP with actual
pm2 restart backend
```

## 📞 Support

If the deployment fails or community support still doesn't work:

1. **Check PM2 logs:**
   ```bash
   pm2 logs backend --lines 50
   ```

2. **Test endpoint directly:**
   ```bash
   curl https://api.workforcedemocracyproject.org/api/nonprofits/search?q=food
   ```

3. **Verify nonprofit-proxy.js exists:**
   ```bash
   ls -lh /var/www/workforce-democracy/backend/nonprofit-proxy.js
   ```

---

**Deployment Status:** ⏳ Pending  
**Version:** v37.8.4  
**Date:** November 9, 2025  
**Priority:** High - User-facing feature broken
