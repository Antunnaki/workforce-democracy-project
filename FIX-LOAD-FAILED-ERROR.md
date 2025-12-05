# 🔧 Fix "Load Failed" Error - Enhanced Debugging

## The Error You're Seeing

```
❌ Error loading representatives
Load failed
```

This is a generic network error that can have several causes. I've enhanced the error handling to show exactly what's wrong.

## What I Fixed

### 1. Enhanced Error Logging
Added detailed console logs to show:
- Exact API URL being called
- Response status code
- Response headers
- Detailed error messages

### 2. Better Error Messages
Now shows specific errors:
- **Network Error** - Can't connect to backend
- **404** - Endpoint not found
- **500** - Server error
- **CORS** - Cross-origin blocking

### 3. Created Backend Test Tool
Added `test-backend-connection.html` to diagnose backend issues

## Files Modified

1. ✅ `js/civic-representative-finder-v2.js` - Enhanced error handling
2. ✅ `test-backend-connection.html` - NEW diagnostic tool

## How to Use the Test Tool

### Step 1: Deploy the test file
Upload `test-backend-connection.html` to your server

### Step 2: Open it in browser
Go to: `https://workforcedemocracyproject.org/test-backend-connection.html`

### Step 3: Run the tests
Click each test button:
1. **🏥 Test Health Endpoint** - Tests if backend is reachable
2. **🔍 Test Representatives** - Tests the specific endpoint
3. **🌐 Test CORS** - Tests if CORS is configured

### Step 4: Check the results

#### If Health Check FAILS:
```
❌ ERROR
Failed to fetch
```
**Problem:** Backend is not running or not accessible
**Solution:** Start your backend server

#### If Health Check SUCCEEDS but Reps FAILS:
```
Status: 404 Not Found
```
**Problem:** `/api/representatives` endpoint not implemented
**Solution:** Add the endpoint to your backend

#### If you see CORS Error:
```
❌ CORS not configured properly
```
**Problem:** Backend not allowing requests from your domain
**Solution:** Add CORS headers to backend

## Deploy These Files

1. **js/civic-representative-finder-v2.js** (updated with better error handling)
2. **test-backend-connection.html** (new diagnostic tool)

## After Deploying

1. **Test with diagnostic tool first:**
   ```
   https://workforcedemocracyproject.org/test-backend-connection.html
   ```

2. **Look at console logs:**
   - Open browser console (F12)
   - Try the Rep Finder again
   - Look for detailed `📡 [V2]` logs

3. **Share the error details:**
   - Screenshot of test results
   - Console logs
   - This will tell us exactly what's wrong!

## Common Issues & Solutions

### Issue 1: "Failed to fetch" or "NetworkError"
**Cause:** Can't connect to backend at all
**Solution:** 
- Check if backend server is running
- Verify URL: `https://api.workforcedemocracyproject.org`
- Check firewall/network settings

### Issue 2: "404 Not Found"
**Cause:** Endpoint `/api/representatives` doesn't exist
**Solution:** 
- Implement the endpoint in your backend
- Should accept `?zip=12061` query parameter
- Should return JSON with representatives array

### Issue 3: "CORS policy error"
**Cause:** Backend not configured to allow requests from your domain
**Solution:**
Add these headers to your backend:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Issue 4: "500 Internal Server Error"
**Cause:** Backend code has an error
**Solution:**
- Check backend logs
- Fix the error in backend code
- Test endpoint directly with curl or Postman

## Backend Endpoint Requirements

Your backend needs to implement:

```
GET /api/representatives?zip={zip}

Example: GET /api/representatives?zip=12061

Response:
{
  "representatives": [
    {
      "name": "Senator Name",
      "title": "U.S. Senator",
      "party": "Democratic",
      "phone": "(202) 224-xxxx",
      "url": "https://..."
    }
  ]
}
```

## Testing Workflow

1. **Deploy updated files**
2. **Open test-backend-connection.html**
3. **Run all 3 tests**
4. **Share results with me**
5. **I'll tell you exactly what to fix!**

---

**Next Step:** Deploy the files and run the diagnostic tool, then show me the results!
