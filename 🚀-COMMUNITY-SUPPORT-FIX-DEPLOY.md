# 🚀 Community Support System - Deployment Guide

**Version**: V36.11.16  
**Date**: November 3, 2025  
**Status**: ✅ **READY TO DEPLOY**

---

## 🎯 What This Fixes

### **Problem**:
When users click on Community Support categories (Legal Aid, Housing, etc.), they get an error:
```
😊 Oops! We couldn't load organizations right now
```

### **Root Cause**:
Frontend calls `/api/nonprofits/search` but this endpoint doesn't exist in the backend!

### **Solution**:
Add ProPublica API proxy endpoints with AI-powered recommendations.

---

## 📦 What's Included

### **1. Backend Proxy Module** (`backend/nonprofit-proxy.js`):
- ✅ ProPublica Nonprofit Explorer API integration
- ✅ 15-minute caching system
- ✅ Search by term, state, city
- ✅ Get organization details by EIN
- ✅ Automatic cache cleanup

### **2. API Endpoints** (`backend/NONPROFIT-ENDPOINTS-ADD.js`):
- ✅ `GET /api/nonprofits/search` - Search organizations
- ✅ `GET /api/nonprofits/:ein` - Get details
- ✅ `POST /api/nonprofits/recommend` - AI-powered recommendations

### **3. Features**:
- ✅ CORS-safe proxy (no browser errors)
- ✅ Intelligent caching (faster responses)
- ✅ AI personalization (optional)
- ✅ Error handling with friendly messages
- ✅ Development mode debug info

---

## 🛠️ Installation Steps

### **Step 1: Add Proxy Module**

1. Upload `backend/nonprofit-proxy.js` to your VPS:
   ```bash
   scp backend/nonprofit-proxy.js root@YOUR_VPS_IP:/var/www/workforce-democracy/backend/
   ```

### **Step 2: Update server.js**

2. SSH into your VPS:
   ```bash
   ssh root@YOUR_VPS_IP
   cd /var/www/workforce-democracy/backend
   ```

3. Open `server.js` for editing:
   ```bash
   nano server.js
   ```

4. **At the top** (with other requires, around line 17-18):
   ```javascript
   const { searchNonprofits, getNonprofitDetails } = require('./nonprofit-proxy');
   ```

5. **After the `/api/backend/query` endpoint** (around line 600, before `app.listen()`):

   Copy and paste the entire contents of `backend/NONPROFIT-ENDPOINTS-ADD.js`

6. Save and exit (`Ctrl+X`, `Y`, `Enter`)

### **Step 3: Restart Backend**

```bash
pm2 restart backend
# Or if using different process name:
pm2 restart all
```

### **Step 4: Verify Backend**

```bash
pm2 logs backend --lines 50
```

Look for:
```
✅ Nonprofit API endpoints registered
   - GET  /api/nonprofits/search?q=term
   - GET  /api/nonprofits/:ein
   - POST /api/nonprofits/recommend
```

---

## 🧪 Testing

### **Test 1: Direct API Call**

```bash
curl "https://api.workforcedemocracyproject.org/api/nonprofits/search?q=legal+aid" | jq
```

**Expected response**:
```json
{
  "success": true,
  "data": [
    {
      "ein": "123456789",
      "name": "Legal Aid Society",
      "city": "New York",
      "state": "NY",
      "revenue_amount": 50000000
    }
  ],
  "total": 15,
  "query": "legal aid"
}
```

### **Test 2: Frontend UI**

1. Go to your website
2. Scroll to "Community Support" section
3. Click **"Legal Aid"** button
4. **Verify**:
   - ✅ Loading spinner appears
   - ✅ Results load: "Found X organizations"
   - ✅ Cards display with org names
   - ✅ Can click "View Details"
   - ✅ No error messages

### **Test 3: All Categories**

Test each button:
- [ ] Legal Aid ⚖️
- [ ] Housing Support 🏠
- [ ] Healthcare 🏥
- [ ] Food Banks 🍽️
- [ ] Workers' Rights ✊
- [ ] Mental Health 🧠

### **Test 4: Error Handling**

```bash
# Test with no query parameter
curl "https://api.workforcedemocracyproject.org/api/nonprofits/search" | jq
```

**Expected**:
```json
{
  "success": false,
  "error": "Search query (q) is required",
  "example": "/api/nonprofits/search?q=legal+aid&state=NY"
}
```

---

## 🎨 Expected User Experience

### **Before Fix**:
```
User clicks "Legal Aid"
   ↓
❌ Error: "We're having trouble connecting..."
```

### **After Fix**:
```
User clicks "Legal Aid"
   ↓
Loading spinner (●●●)
   ↓
"Found 15 organizations"
   ↓
Cards display:
┌─────────────────────────────┐
│ Legal Aid Society           │
│ 📍 New York, NY             │
│ 📊 $50.0M annual revenue    │
│ [View Details →]            │
└─────────────────────────────┘
   ↓
User clicks "View Details"
   ↓
Opens ProPublica page in new tab
```

---

## 🤖 AI Recommendations (Optional)

If you want AI-powered personalized recommendations:

### **How It Works**:
1. User clicks category
2. Backend searches ProPublica
3. AI analyzes top 10 results
4. Ranks organizations by relevance
5. Provides personalized advice

### **Example AI Response**:
```json
{
  "recommendations": [
    {
      "name": "Legal Aid Society",
      "rank": 1,
      "reason": "Best match - largest provider of free legal services in NYC with strong tenant rights support",
      "highlights": [
        "$50M annual revenue shows strong capacity",
        "Specializes in housing and tenant issues"
      ]
    }
  ],
  "advice": "Based on your location in NYC, these organizations have the resources and expertise to help with housing issues. Start with the Legal Aid Society as they have the most comprehensive services."
}
```

---

## 📊 System Architecture

### **Before (Broken)**:
```
Frontend → Direct ProPublica API → ❌ CORS Error
```

### **After (Working)**:
```
Frontend 
   ↓
Backend Proxy (/api/nonprofits/search)
   ↓
ProPublica API
   ↓
Cache Results (15 min)
   ↓
[Optional: AI Analysis]
   ↓
Return to Frontend
   ↓
Beautiful Cards Display
```

---

## 🔍 Troubleshooting

### **Issue: Still getting errors**

**Check 1: Is backend running?**
```bash
pm2 status
```

**Check 2: Are endpoints registered?**
```bash
pm2 logs backend | grep "Nonprofit API"
```
Should see: "✅ Nonprofit API endpoints registered"

**Check 3: Test endpoint directly**
```bash
curl "https://api.workforcedemocracyproject.org/api/nonprofits/search?q=food"
```

**Check 4: Check CORS**
```bash
curl -H "Origin: https://sxcrlfyt.gensparkspace.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.workforcedemocracyproject.org/api/nonprofits/search
```

Should see: `access-control-allow-origin` header

### **Issue: No results found**

This could mean:
1. ProPublica API is down (rare)
2. Search term too specific
3. Network issues

**Solution**: Check ProPublica API status:
```bash
curl "https://projects.propublica.org/nonprofits/api/v2/search.json?q=food"
```

### **Issue: Slow responses**

**Check cache**:
- First search: ~2-3 seconds (fetches from ProPublica)
- Repeated search: <100ms (from cache)

**If always slow**:
- Check backend server resources
- Check internet connection speed
- Consider adding more caching layers

---

## 📋 Deployment Checklist

### **Backend**:
- [ ] Upload `nonprofit-proxy.js` to VPS
- [ ] Add require statement to `server.js`
- [ ] Add API endpoints to `server.js`
- [ ] Restart backend (`pm2 restart backend`)
- [ ] Verify endpoints registered (check logs)

### **Testing**:
- [ ] Test API endpoint with curl
- [ ] Test Legal Aid category
- [ ] Test Housing category
- [ ] Test Healthcare category
- [ ] Test Food Banks category
- [ ] Test Workers' Rights category
- [ ] Test Mental Health category
- [ ] Test error handling (invalid query)

### **Frontend**:
- [ ] No changes needed! (Already configured)
- [ ] Clear browser cache if testing
- [ ] Verify UI displays results
- [ ] Check cards are clickable

---

## 🎉 Success Indicators

### ✅ **Working System**:
- Clicking categories loads organizations
- Results display in cards
- Cards show name, location, revenue
- "View Details" links work
- No error messages
- Fast responses (cached searches)

### ❌ **Still Broken**:
- Error messages appear
- No results load
- 404 errors in console
- Infinite loading spinner

---

## 📝 Files Summary

### **Created**:
- `backend/nonprofit-proxy.js` (4.7 KB)
- `backend/NONPROFIT-ENDPOINTS-ADD.js` (8.3 KB)
- `🔍-COMMUNITY-SUPPORT-ANALYSIS.md` (9.5 KB)
- `🚀-COMMUNITY-SUPPORT-FIX-DEPLOY.md` (this file)

### **Modified**:
- `backend/server.js` (add require + endpoints)

### **No Changes Needed**:
- `js/community-services.js` (already perfect)
- `css/community-services.css` (already perfect)
- `index.html` (already has widget)

---

## 🎯 Next Steps

1. **Deploy backend changes** (Steps 1-3 above)
2. **Test one category** (Legal Aid)
3. **If working, test all categories**
4. **Enjoy functional Community Support!** 🎉

Optional enhancements for future:
- Add location detection (user's current location)
- Add distance calculation (miles to each org)
- Add "Save favorites" feature
- Add filtering options (by size, type, etc.)
- Mobile app integration

---

**Ready to deploy!** This will make Community Support fully functional. 🚀
