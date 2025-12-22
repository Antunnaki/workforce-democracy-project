# Fix VPS Backend Issues

This document explains how to fix the current issues with the VPS backend that are causing the 502 errors when accessing the API from the frontend.

## Issues Being Fixed

1. **CORS Configuration**: The Nginx configuration needs to be updated to allow requests from the Netlify frontend
2. **billData.committees.map is not a function**: This error occurs when the Congress.gov API returns unexpected data format
3. **Rate Limiting (429 errors)**: Implementing exponential backoff to handle API rate limits
4. **Web Search 403 Errors**: Adding proper headers to DuckDuckGo requests

## Deployment Instructions

### Step 1: Upload the Fix Script

From your local machine, upload the fix script to your VPS:

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/"

# Upload to VPS /tmp directory
scp 'FIX-VPS-BACKEND-CORS-AND-BILLDATA.sh' root@185.193.126.13:/tmp/
```

### Step 2: Execute the Fix Script

SSH into your VPS and run the script:

```bash
# SSH into VPS
ssh root@185.193.126.13

# Make executable and run
chmod +x /tmp/FIX-VPS-BACKEND-CORS-AND-BILLDATA.sh
/tmp/FIX-VPS-BACKEND-CORS-AND-BILLDATA.sh
```

### Step 3: Verify the Fix

After running the script, test the frontend to ensure the issues are resolved:

1. Visit: https://workforcedemocracyproject.netlify.app
2. Try searching for bills with ZIP code: 12061
3. Check browser console for 502 errors (should be resolved)

## What the Script Does

1. **Backs up current files** before making changes
2. **Updates ai-bills-routes.js** to fix the committees.map error by checking if committees is an array before mapping
3. **Adds proper headers** to web search requests to prevent 403 errors
4. **Implements exponential backoff** to handle rate limiting (429 errors)
5. **Updates Nginx configuration** to allow CORS requests from the Netlify frontend
6. **Performs a nuclear PM2 restart** to ensure changes are loaded

## Troubleshooting

If you still encounter issues after running the script:

1. Check PM2 logs:
   ```bash
   pm2 logs backend
   ```

2. Verify the backend is running:
   ```bash
   pm2 list
   ```

3. Test the backend directly:
   ```bash
   curl http://localhost:3001/health
   ```

4. Check Nginx configuration:
   ```bash
   nginx -t
   ```