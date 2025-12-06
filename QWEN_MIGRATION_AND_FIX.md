# Qwen Migration and Chat Fix

## Overview

This document describes the migration from Groq/Llama to Qwen and the fixes applied to resolve the chat assistant issues.

## Issues Identified

1. **Model Reporting Inconsistency**: Health check was reporting "llama-3.3-70b-versatile" even though the system had been migrated to Qwen
2. **API Integration**: The backend was still attempting to use Groq API endpoints instead of Qwen
3. **Fallback Responses**: Users were receiving fallback messages instead of actual AI responses
4. **Configuration Drift**: Environment variables and code were not aligned with the Qwen migration

## Changes Made

### 1. New AI Service Implementation (`ai-service-qwen.js`)

Created a new AI service module specifically for Qwen integration:
- Replaced Groq API calls with Qwen API calls
- Maintained the same function signatures for compatibility
- Added proper error handling and fallback mechanisms
- Preserved core philosophy and prompting approach

### 2. Updated Server Configuration (`server.js`)

Modified the server to use the new Qwen AI service:
- Updated the import statement to use `./ai-service-qwen`
- Maintained all existing functionality while enabling Qwen integration

### 3. Fixed Health Check Endpoint (`routes/civic-routes.js`)

Updated the health check to properly report Qwen model information:
- Checks for `QWEN_API_KEY` first, then falls back to `GROQ_API_KEY`
- Reports `QWEN_MODEL` or defaults to "qwen-plus"
- Correctly identifies provider as "Tongyi Lab"

### 4. Environment Configuration (`.env.example`)

Updated environment variable documentation:
- Added `QWEN_API_KEY`, `QWEN_MODEL`, and `QWEN_API_URL`
- Marked Groq variables as deprecated but kept for reference
- Provided default values and descriptions

## Deployment Instructions

### 1. Backend Deployment

1. SSH into the VPS:
   ```bash
   ssh root@185.193.126.13
   ```

2. Navigate to the backend directory:
   ```bash
   cd /path/to/workforce-democracy-project/backend
   ```

3. Copy the new files:
   - `ai-service-qwen.js`
   - Update `server.js`
   - Update `routes/civic-routes.js`

4. Update the environment variables in `.env`:
   ```
   QWEN_API_KEY=your_actual_qwen_api_key
   QWEN_MODEL=qwen-plus
   ```

5. Install any new dependencies (if needed):
   ```bash
   npm install
   ```

6. Restart the services:
   ```bash
   pm2 restart workforce-democracy-a  # Port 3000
   pm2 restart workforce-democracy-b  # Port 3001
   ```

### 2. Frontend Validation

1. The frontend configuration in `js/chat-clean.js` was already corrected in a previous fix
2. No additional frontend changes are required

### 3. Verification Steps

1. Check the health endpoint:
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

2. Test the chat endpoint:
   ```bash
   curl -X POST "https://api.workforcedemocracyproject.org/api/civic/llm-chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, who are you?"}'
   ```
   Should return an actual AI-generated response, not a fallback message.

## Rollback Plan

If issues occur after deployment:

1. Revert to the previous version:
   ```bash
   # Restore previous server.js
   # Restore previous civic-routes.js
   # Remove ai-service-qwen.js
   ```

2. Restore environment variables:
   ```
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

3. Restart services:
   ```bash
   pm2 restart workforce-democracy-a
   pm2 restart workforce-democracy-b
   ```

## Future Considerations

1. Monitor API usage and costs with Qwen
2. Evaluate response quality and adjust prompting as needed
3. Consider implementing caching for frequently asked questions
4. Update all documentation to reflect Qwen as the primary model