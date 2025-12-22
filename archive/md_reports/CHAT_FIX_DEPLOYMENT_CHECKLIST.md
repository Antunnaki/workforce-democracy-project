# CHAT FIX DEPLOYMENT CHECKLIST
Version: December 6, 2025

## ISSUE DESCRIPTION
The AI chat assistant was failing with CORS errors when trying to access `https://api.workforcedemocracyproject.org/test/api/civic/llm-chat/submit`. This was happening because:

1. A test backend override script was redirecting all API calls to the `/test` route
2. The async job endpoint was returning 404 errors
3. The frontend was still trying to use the async endpoint instead of the direct endpoint

## FIXES APPLIED

### 1. Removed Test Backend Override Script
- **File**: `index.html`
- **Change**: Commented out the script tag that loads `js/test-backend-override.js`
- **Reason**: This script was meant only for testing and was redirecting API calls to the wrong endpoint

### 2. Verified Direct Endpoint Usage
- **File**: `js/chat-clean.js`
- **Change**: Confirmed that the `sendQuery` function is using the direct endpoint (`/api/civic/llm-chat`)
- **Reason**: The direct endpoint is working correctly and doesn't require async job processing

### 3. Updated Configuration
- **File**: `js/config.js`
- **Change**: Updated `getBackendUrl()` function to always return the production endpoint
- **Reason**: Ensures consistent API endpoint usage across all environments

## DEPLOYMENT STEPS

### 1. Frontend Deployment
- [ ] Commit changes to Git repository
- [ ] Push changes to remote repository
- [ ] Trigger Netlify deployment
- [ ] Verify deployment completed successfully

### 2. Backend Verification
- [ ] SSH into backend server (185.193.126.13)
- [ ] Verify backend services are running correctly
- [ ] Check PM2 logs for any errors
- [ ] Verify Qwen API integration is working

### 3. Testing
- [ ] Test chat functionality on the live site
- [ ] Verify that the chat widget loads correctly
- [ ] Send a test message and verify it gets a response
- [ ] Check browser console for any errors

## VERIFICATION COMMANDS

### Backend Health Check
```bash
curl -X GET "https://api.workforcedemocracyproject.org/api/civic/health"
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "representatives": "operational",
    "llmChat": "operational"
  }
}
```

### AI Service Health Check
```bash
curl -X GET "https://api.workforcedemocracyproject.org/api/civic/llm-health"
```

Expected response:
```json
{
  "success": true,
  "available": true,
  "model": "qwen-plus",
  "provider": "Tongyi Lab",
  "message": "LLM service is available"
}
```

### Direct Chat Test
```bash
curl -X POST "https://api.workforcedemocracyproject.org/api/civic/llm-chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, who are you?"}'
```

Should return an actual AI-generated response, not a fallback message.

### Frontend Test
1. Visit https://workforcedemocracyproject.netlify.app
2. Open browser developer tools
3. Click on the chat widget
4. Send a message
5. Verify that:
   - No CORS errors appear in the console
   - The message is processed correctly
   - An AI response is received
   - No 404 errors occur

## ROLLBACK PLAN

If issues occur after deployment:

1. **Revert Frontend Changes**
   - Uncomment the test backend override script in `index.html`
   - Revert the `getBackendUrl()` function in `js/config.js`

2. **Monitor Backend**
   - Check PM2 logs for any errors
   - Verify all services are running correctly

3. **Communicate Issues**
   - Notify stakeholders of any problems
   - Document the issue and solution for future reference

## SUCCESS CRITERIA

- [ ] No CORS errors in browser console
- [ ] No 404 errors when accessing API endpoints
- [ ] Chat widget loads and functions correctly
- [ ] AI responses are received (not fallback messages)
- [ ] All existing functionality remains intact

---

*This checklist should be followed to ensure the chat fix is properly deployed and functioning.*