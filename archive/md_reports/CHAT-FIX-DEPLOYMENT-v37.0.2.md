# Chat Fix Deployment - v37.0.2

## Problem
Home page chat calling wrong endpoint:
- ❌ Frontend calls: `/api/backend/query` (doesn't exist - 404)
- ✅ Backend has: `/api/civic/llm-chat` (working endpoint)

## Solution
Updated `js/backend-api.js` to use the working civic LLM endpoint.

## Changes Made

### File: `js/backend-api.js`

**Line 29:** Changed endpoint
```javascript
// OLD:
query: '/api/backend/query',

// NEW:
query: '/api/civic/llm-chat',
```

**Line 30:** Updated health endpoint
```javascript
// NEW:
health: '/api/civic/llm-health',
```

**Lines 86-95:** Updated request body format
```javascript
// OLD:
{
    chat_type: chatType,
    user_id: options.userId || BackendAPI.getUserId(),
    query: query,
    context: {...},
    session_id: options.sessionId || null
}

// NEW:
{
    message: query,  // Changed from 'query' to 'message'
    context: contextMap[chatType] || 'general',  // Use civic context types
    conversationHistory: conversationHistory.slice(-5)
}
```

**Lines 141-148:** Updated response handling
```javascript
// OLD:
response: data.response,
source: data.source,
cost: data.cost || 0,

// NEW:
response: data.message,  // Civic LLM returns 'message' not 'response'
source: 'llm',
cost: 0,
```

## Testing

After deployment, test on home page:

1. Open https://workforcedemocracyproject.org/
2. Scroll to "Find Your Representatives" section
3. Click chat icon
4. Type: "can you tell me about representatives?"
5. Send message

**Expected:**
- ✅ Chat responds within 3-5 seconds
- ✅ No 404 errors in console
- ✅ Intelligent response about representatives

**Before Fix:**
- ❌ 404 error: `/api/backend/query` not found
- ❌ Falls back to generic offline response

**After Fix:**
- ✅ Calls `/api/civic/llm-chat` successfully
- ✅ Real LLM response from Groq

## Deploy to Netlify

Since `js/backend-api.js` is a frontend file, this will auto-deploy when pushed to main branch.

**OR manually upload via Netlify:**
1. Go to Netlify dashboard
2. Deploys → Drag & Drop
3. Upload updated `js/backend-api.js`

## Verification

Check browser console for:
```
[Backend API] 📤 Sending query to backend
[Backend API] ✅ Response received
```

Should NOT see:
```
[Backend API] ❌ HTTP 404
```
