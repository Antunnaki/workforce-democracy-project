# AI Assistant Troubleshooting Guide

## Current Issue

The AI assistant appears to be connected but is returning fallback messages instead of actual AI responses. The health check shows the service as available, but actual queries return a default message.

## Diagnostic Steps

### 1. Check Backend Logs
SSH into the backend server and check the application logs for specific error messages:
```bash
ssh root@185.193.126.13
# Password: YNWA1892LFC

# Check PM2 logs
pm2 logs

# Or check systemd logs if using systemd
journalctl -u workforce-backend -f
```

### 2. Verify Environment Variables
Check that the Groq API key is properly configured:
```bash
# On the backend server
cat /var/www/workforce-democracy/backend/.env | grep GROQ
```

### 3. Test Groq API Connectivity
Test if the server can reach the Groq API:
```bash
# On the backend server
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-70b-8192",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Environment Information

The Workforce Democracy Project uses an A/B deployment system:

### Production Environment
- **Domain**: https://workforcedemocracyproject.org
- **Backend**: https://api.workforcedemocracyproject.org (formerly Version A on port 3000)

### Testing Environment
- **Domain**: https://workforcedemocracyproject.netlify.app
- **Backend**: https://api.workforcedemocracyproject.org (formerly Version B on port 3001)

Note: Both environments now use the same backend endpoint (https://api.workforcedemocracyproject.org) rather than separate ports. The frontend used to differentiate based on hostname but now all traffic goes to the same endpoint.

## Common Issues and Solutions

### 1. Invalid API Key
Symptoms:
- Health check passes (key exists)
- Actual queries fail with fallback responses
- Logs show "401 Unauthorized" or "invalid_api_key" errors

Solution:
1. Obtain a valid Groq API key from https://groq.com/
2. Update the `.env` file on the backend server
3. Restart the backend service

### 2. Rate Limiting/Quota Exceeded
Symptoms:
- Logs show "429 Rate Limited" errors
- Health check passes but actual queries fail
- Previously working functionality suddenly stops working

Solution:
1. Check Groq dashboard for quota usage
2. Wait for quota reset (typically hourly/daily)
3. Upgrade Groq plan if needed
4. Implement rate limiting on the frontend

### 3. Authentication/Authorization Issues
Symptoms:
- Logs show "403 Forbidden" errors
- Health check passes but actual queries fail

Solution:
1. Verify API key permissions
2. Check if IP restrictions are in place
3. Confirm the API key is properly formatted in the .env file

### 4. Network Connectivity Issues
Symptoms:
- Timeouts in logs
- "ECONNREFUSED" or similar network errors

Solution:
1. Check firewall settings on the server
2. Verify DNS resolution
3. Test connectivity with curl or ping

### 5. Model Availability Issues
Symptoms:
- "model_not_found" errors
- Requests fail with specific model-related errors

Solution:
1. Check Groq documentation for available models
2. Update the model name in the backend configuration
3. Restart the service

### 6. Dependency Issues
Symptoms:
- "ReferenceError: File is not defined" or similar JavaScript errors
- Service crashes or restarts frequently

Solution:
1. Check package.json dependencies
2. Run npm install to ensure all dependencies are properly installed
3. Check for any incompatible package versions

## Backend Code Analysis

### Relevant Files
1. `backend/ai-service.js` - Contains the main AI integration logic
2. `backend/routes/civic-routes.js` - Defines the LLM chat endpoints
3. `backend/server.js` - Main server file with environment setup

### Key Functions
- `analyzeWithAI()` in `ai-service.js` - Main function that processes queries
- `/api/civic/llm-chat` endpoint in `civic-routes.js` - Handles chat requests
- Groq API call in `ai-service.js` around line 1627

## Testing Procedures

### 1. Health Checks
```bash
# Basic health check
curl https://api.workforcedemocracyproject.org/health

# LLM-specific health check
curl https://api.workforcedemocracyproject.org/api/civic/llm-health
```

### 2. Functional Tests
```bash
# Test chat endpoint
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is democracy?","context":"general"}'
```

## Frontend Integration Points

### Files to Check
1. `js/backend-api.js` - Frontend to backend communication
2. `js/civic-platform.js` - Civic platform chat widgets
3. `js/main.js` - Main application initialization

### Common Issues
- Incorrect endpoint URLs
- CORS configuration problems
- Response handling inconsistencies

## Deployment Checklist

After making changes:
1. [ ] Update `.env` file with correct API keys
2. [ ] Restart backend service with PM2
3. [ ] Test health endpoints
4. [ ] Test chat functionality
5. [ ] Check frontend console for errors
6. [ ] Verify network requests in browser dev tools