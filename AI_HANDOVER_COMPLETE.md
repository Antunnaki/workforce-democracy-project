# COMPLETE AI HANDOVER DOCUMENTATION
Version: December 6, 2025

## TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Current Issues](#current-issues)
5. [API Configuration](#api-configuration)
6. [Deployment Structure](#deployment-structure)
7. [Model Transition (Llama to Qwen)](#model-transition)
8. [Frontend Components](#frontend-components)
9. [Backend Components](#backend-components)
10. [Debugging Guide](#debugging-guide)
11. [Fix Recommendations](#fix-recommendations)
12. [Deployment Instructions](#deployment-instructions)

---

## SYSTEM OVERVIEW

The Workforce Democracy Project is a civic engagement platform that provides citizens with information about their representatives, bills, and democratic processes. It includes an AI assistant powered by large language models to answer user questions contextually.

Key features:
- Representative finder by ZIP code
- Bill tracking and analysis
- AI-powered chat assistant with citations
- Ethical business locator
- Civic education resources

---

## TECHNOLOGY STACK

### Frontend
- HTML5/CSS3/JavaScript
- Responsive design
- Floating chat widget
- Inline chat widgets
- Progressive Web App (PWA) capabilities

### Backend
- Node.js with Express.js
- PostgreSQL database
- MongoDB for user sessions
- Nginx reverse proxy
- PM2 process manager

### AI Services
- **Current Model**: Qwen Plus (Tongyi Lab)
- **Previous Model**: Llama 3.3 70B (Groq)
- **API Integration**: Direct API calls via DashScope

### Hosting
- **Frontend**: Netlify
- **Backend**: Njalla VPS (185.193.126.13)
- **Ports**: 
  - Version A (Production): 3000
  - Version B (Development): 3001

---

## ARCHITECTURE

### Network Flow
```
User Browser → Netlify (Frontend) → Nginx Proxy → Node.js Backend
                                   ↑
                              SSL Termination
```

### Backend API Structure
```
/api/civic/
├── /representatives/search     (Rep finder by ZIP)
├── /llm-chat                  (Direct LLM chat)
├── /llm-chat/submit           (Async job submission)
├── /llm-chat/status/:jobId    (Job status checking)
├── /llm-chat/result/:jobId    (Job result retrieval)
├── /llm-chat/stats            (Queue statistics)
├── /llm-health                (Health check)
└── /health                    (General health)

/api/bills/                    (Bill tracking APIs)
/api/personalization/          (User preferences)
/api/chat/query                (Universal chat endpoint)
```

---

## CURRENT ISSUES

### Primary Issue
The AI chat assistant is returning fallback messages instead of actual AI responses, despite the health check indicating the service is available.

### Root Causes Identified
1. **Model Transition Inconsistency**: System reports using Llama 3.3-70b but has been migrated to Qwen
2. **API Endpoint Mismatch**: Async job endpoints returning 404 errors
3. **Configuration Drift**: Frontend and backend configurations not aligned

### Error Details
- Frontend console shows CORS errors when trying to access `/test/api/civic/llm-chat/submit`
- Direct endpoint (`/api/civic/llm-chat`) works but returns fallback messages
- Health check shows service available with incorrect model name

---

## API CONFIGURATION

### Environment Variables (.env file)
```
QWEN_API_KEY=your_qwen_api_key     # Replaces GROQ_API_KEY
QWEN_MODEL=qwen-plus               # Replaces GROQ_MODEL
MONGODB_URI=mongodb://...
DB_USER=...
DB_PASSWORD=...
DB_HOST=localhost
DB_NAME=workforce_democracy
DB_PORT=5432
```

### API Endpoints
- **Base URL**: `https://api.workforcedemocracyproject.org`
- **Health Check**: `GET /api/civic/llm-health`
- **Direct Chat**: `POST /api/civic/llm-chat`
- **Async Submit**: `POST /api/civic/llm-chat/submit`
- **Async Status**: `GET /api/civic/llm-chat/status/:jobId`
- **Async Result**: `GET /api/civic/llm-chat/result/:jobId`

---

## DEPLOYMENT STRUCTURE

### File Organization
```
Root Directory/
├── backend/
│   ├── ai-service-qwen.js     (NEW Qwen AI service implementation)
│   ├── ai-service.js          (Old/placeholder file)
│   ├── civic-llm-async.js     (Async job processing)
│   ├── job-queue-service.js   (In-memory job queue)
│   ├── routes/
│   │   └── civic-routes.js    (API route definitions)
│   └── server.js              (Main server file)
├── js/
│   ├── chat-clean.js          (Frontend chat implementation)
│   └── config.js              (Frontend configuration)
└── index.html                 (Main page)
```

### Ports Configuration
- Port 3000: Production version (Version A)
- Port 3001: Development version (Version B)

### Reverse Proxy (Nginx)
Handles CORS and SSL termination. Configuration ensures:
- Requests to `/test` route to port 3001
- Requests to root route to port 3000
- Proper CORS headers

---

## MODEL TRANSITION (Llama to Qwen)

### Timeline
- **Previous**: Llama 3.3-70b via Groq API (Deprecated)
- **Current**: Qwen Plus via Tongyi Lab API (DashScope)
- **Transition Date**: Recent (exact date unknown)

### Impact Areas
1. **API Keys**: Need to update from Groq to Qwen keys
2. **Environment Variables**: QWEN_MODEL should reflect Qwen model
3. **Health Checks**: Should report Qwen model, not Llama
4. **Documentation**: All references to Llama should be updated

### Configuration Mismatch
The system is reporting it's using "llama-3.3-70b-versatile" in health checks, but actually using Qwen. This inconsistency causes confusion during troubleshooting.

---

## FRONTEND COMPONENTS

### Chat Implementation ([js/chat-clean.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/js/chat-clean.js))
- Uses direct API calls to backend
- Implements floating chat widget
- Handles inline chat widgets
- Processes citations and sources
- No typewriter effect (removed for stability)

### Configuration ([js/config.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/js/config.js))
- Dynamic backend URL detection (Netlify vs production)
- Feature flag management
- Endpoint construction

### Key Settings
```javascript
API_BASE_URL: 'https://api.workforcedemocracyproject.org'
GROQ_ENABLED: true  // This should be reviewed for Qwen
```

---

## BACKEND COMPONENTS

### Main Server ([backend/server.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/server.js))
- Registers all API routes
- Initializes databases (PostgreSQL, MongoDB)
- Configures middleware
- CORS handled by Nginx (disabled in Express)
- Now imports Qwen AI service

### Civic Routes ([backend/routes/civic-routes.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/routes/civic-routes.js))
- Defines all civic platform endpoints
- Integrates with LLM async processing
- Health check implementation (updated to report Qwen)

### AI Service ([backend/ai-service-qwen.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/ai-service-qwen.js))
- NEW: Main Qwen AI processing logic
- Source searching and validation
- Response generation with citations
- Replaces previous Groq/Llama implementation

### Async Processing ([backend/civic-llm-async.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/civic-llm-async.js))
- Job queue implementation
- Background processing for long queries
- Status tracking and result retrieval

---

## DEBUGGING GUIDE

### Health Check Verification
```bash
# Check if LLM service is available
curl -X GET "https://api.workforcedemocracyproject.org/api/civic/llm-health"

# Expected response after fix:
# {"success":true,"available":true,"model":"qwen-plus","provider":"Tongyi Lab","message":"LLM service is available"}
```

### Direct Chat Test
```bash
# Test direct chat endpoint
curl -X POST "https://api.workforcedemocracyproject.org/api/civic/llm-chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, who are you?"}'

# Should return actual AI response, not fallback message
```

### Async Endpoint Test
```bash
# Submit job
curl -X POST "https://api.workforcedemocracyproject.org/api/civic/llm-chat/submit" \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the legislative process"}'

# Check if endpoint is accessible
```

---

## FIX RECOMMENDATIONS

### Implemented Fixes

1. **Created New Qwen AI Service**
   File: [backend/ai-service-qwen.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/ai-service-qwen.js)
   Issue: No proper Qwen integration existed
   Fix: Created new service with Qwen API integration

2. **Updated Server Import**
   File: [backend/server.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/server.js)
   Issue: Still importing old Groq service
   Fix: Updated to import new Qwen service

3. **Fixed Health Check Response**
   File: [backend/routes/civic-routes.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/routes/civic-routes.js)
   Issue: Reports Llama model instead of Qwen
   Fix: Updated to correctly report Qwen model

4. **Updated Environment Documentation**
   File: [backend/.env.example](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/.env.example)
   Issue: Referenced deprecated Groq variables
   Fix: Added Qwen variables, marked Groq as deprecated

### Secondary Fixes Needed

5. **Verify API Key Configuration**
   Issue: Actual Qwen API key needs to be configured on server
   Action: Add QWEN_API_KEY to server environment

6. **Update Frontend Configuration Flag**
   File: [js/config.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/js/config.js)
   Issue: GROQ_ENABLED flag may be misleading
   Fix: Consider renaming to AI_ENABLED or similar

7. **Restore Async Job Endpoints**
   Issue: Async endpoints may still have issues
   Investigation needed: Check route registration in [server.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/server.js)

8. **Update Documentation References**
   Issue: Multiple documents reference deprecated Llama model
   Fix: Comprehensive audit and update

---

## DEPLOYMENT INSTRUCTIONS

### Backend Deployment
1. SSH into VPS: `ssh root@185.193.126.13`
2. Navigate to project directory
3. Copy new files:
   - [backend/ai-service-qwen.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/ai-service-qwen.js)
   - Update [backend/server.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/server.js)
   - Update [backend/routes/civic-routes.js](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/routes/civic-routes.js)
   - Update [backend/.env.example](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/backend/.env.example)

4. Update environment variables in `.env` file:
   ```
   QWEN_API_KEY=your_qwen_api_key
   QWEN_MODEL=qwen-plus
   ```

5. Restart services:
   ```bash
   pm2 restart workforce-democracy-a  # Port 3000
   pm2 restart workforce-democracy-b  # Port 3001
   ```

### Frontend Deployment
1. Update files in repository
2. Deploy to Netlify via Git push
3. No additional steps required (static hosting)

### Verification Steps
1. Check health endpoint returns correct model
2. Test direct chat returns actual AI response
3. Verify frontend chat widget functions correctly
4. Confirm citations and sources display properly

---

*Document created to provide complete context for AI assistant handover and troubleshooting*