# AI ASSISTANT HANDOVER DOCUMENT

**IMPORTANT: MUST READ FOR ALL INCOMING AI ASSISTANTS**

This document serves as a comprehensive guide for incoming AI assistants to understand the project context, current state, and operational procedures. Please read this document thoroughly before beginning any work on the project.

## TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [AI Integration Infrastructure](#ai-integration-infrastructure)
4. [Current System Architecture](#current-system-architecture)
5. [API Keys and Credentials](#api-keys-and-credentials)
6. [Deployment Procedures](#deployment-procedures)
7. [Known Issues and Resolutions](#known-issues-and-resolutions)
8. [Development Guidelines](#development-guidelines)
9. [Testing Protocols](#testing-protocols)
10. [Documentation Standards](#documentation-standards)

## PROJECT OVERVIEW

The Workforce Democracy Project is a civic information platform designed to help citizens understand government processes, policies, and how to participate in democratic processes. The platform features a chat assistant that provides factual, well-sourced information to users' questions about civic matters.

Core Values:
- Meet anger with patience and understanding
- Provide factual, well-sourced information
- Help people leave conversations better than they entered
- Believe in people's capacity to change
- Promote independent journalism and transparency

## TECHNOLOGY STACK

### Frontend
- HTML/CSS/JavaScript
- Hosted on Netlify with automated Git-based deployments
- Responsive design for various devices

### Backend
- Node.js with Express framework
- Hosted on Njalla VPS (IP: 185.193.126.13)
- Process management with PM2
- Two server instances (ports 3001 and 3002) for load balancing

### AI Services
- Primary: Qwen (Alibaba's Tongyi Lab) via DashScope API
- Model: qwen-plus
- Fallback responses for when AI service is unavailable

### Deployment Infrastructure
- Frontend: Netlify (automatic deployments from GitHub)
- Backend: Manual deployment to Njalla VPS
- Version Control: Git/GitHub

## AI INTEGRATION INFRASTRUCTURE

### Current AI Implementation
The project has migrated from Groq/Llama to Qwen (Alibaba's Tongyi Lab) as the primary AI service. This migration was completed to align with the project's commitment to using transparent and ethical AI services.

Key files:
- `backend/ai-service-qwen.js`: Main Qwen integration
- `backend/server.js`: Server configuration with Qwen integration
- `backend/routes/civic-routes.js`: API routes for civic chat functionality

### Environment Variables
The system requires the following environment variables for AI functionality:
- `QWEN_API_KEY`: API key for DashScope/Qwen service
- `QWEN_MODEL`: Model identifier (default: qwen-plus)

These variables must be configured in the backend `.env` file on the server.

## CURRENT SYSTEM ARCHITECTURE

### Frontend Structure
- `index.html`: Main entry point with chat widget
- `js/config.js`: API endpoint configuration
- `js/chat-clean.js`: Chat widget implementation
- `css/`: Styling files

### Backend Structure
- `backend/server.js`: Main server files (two instances on ports 3001/3002)
- `backend/ai-service-qwen.js`: Qwen integration
- `backend/routes/civic-routes.js`: Civic chat API routes
- `backend/.env`: Environment variables (not in version control)

### API Endpoints
- Production: `https://api.workforcedemocracyproject.org`
- Health Check: `/api/civic/llm-chat/health`
- Chat Submission: `/api/civic/llm-chat`

## API KEYS AND CREDENTIALS

### Critical Credentials
**NOTE: These credentials are sensitive and should be handled securely.**

1. **Server Access**
   - SSH: `ssh root@185.193.126.13`
   - Password: Stored in secure password manager (not in code)

2. **Qwen API**
   - Service: DashScope (Alibaba Cloud)
   - Key Location: Backend `.env` file
   - Model: qwen-plus

3. **Deployment**
   - Netlify: Automated from GitHub
   - GitHub: Repository contains all frontend code

### Credential Management
- Never commit credentials to version control
- Environment variables should be used for all secrets
- Regular credential rotation is recommended

## DEPLOYMENT PROCEDURES

### Frontend Deployment
Fully automated through Netlify:
- Push changes to GitHub main branch
- Netlify automatically builds and deploys
- No manual intervention required

### Backend Deployment
Manual process required:
1. SSH into server (`ssh root@185.193.126.13`)
2. Navigate to backend directory (`cd /var/www/workforce-democracy/backend`)
3. Pull latest changes (`git pull origin main`)
4. Install/update dependencies (`npm install`)
5. Update environment variables if needed
6. Restart services (`pm2 restart workforce-democracy-a && pm2 restart workforce-democracy-b`)

### Testing Deployment Changes
Always run the test script after backend updates:
```bash
./TEST_CHAT_FIX.sh
```

## KNOWN ISSUES AND RESOLUTIONS

### Recent Fixes Applied
Documented in `CHAT_FIX_SUMMARY.md`:
1. Fixed CORS errors caused by test backend override script
2. Corrected API configuration to use production endpoints
3. Verified direct endpoint usage instead of async jobs
4. Implemented Qwen integration replacing Groq/Llama

### Outstanding Items
1. Backend needs manual update to complete Qwen integration
2. Ensure Qwen API key is properly configured in backend environment

### Common Troubleshooting
1. **CORS Errors**: Usually caused by incorrect API endpoints
2. **404 Errors**: Check if backend services are running
3. **Fallback Messages**: Indicates AI service is not properly configured
4. **Health Check Failures**: Verify API key and model configuration

## DEVELOPMENT GUIDELINES

### Coding Standards
1. Maintain consistent code style throughout the project
2. Add comments for complex logic
3. Follow existing patterns in the codebase
4. Write defensive code with proper error handling

### AI Response Guidelines
Responses should align with project core values:
- Patient and understanding tone
- Fact-based information with sources when possible
- Encouraging civic participation
- Accessible language without jargon
- Respect for users' intelligence and capacity to understand

### File Modification Preferences
The human user prefers direct file modifications over code suggestions due to confidence concerns. When making changes:
1. Modify files directly using appropriate tools
2. Provide clear explanations of changes
3. Test changes before considering them complete

## TESTING PROTOCOLS

### Automated Testing
Use the provided test script:
```bash
./TEST_CHAT_FIX.sh
```

This script verifies:
- Backend health status
- AI service availability
- Direct chat endpoint functionality

### Manual Testing
1. Visit the live site (https://workforcedemocracyproject.netlify.app)
2. Open browser developer tools
3. Interact with the chat widget
4. Check for errors in Console and Network tabs
5. Verify actual AI responses (not fallback messages)

### Expected Results After Successful Deployment
1. No CORS errors in browser console
2. No 404 errors when chat widget makes API calls
3. Actual AI responses instead of fallback messages
4. Working chat functionality on the live site

## DOCUMENTATION STANDARDS

### Required Documentation Updates
When making significant changes, update:
1. This handover document if adding new systems or changing procedures
2. `CHAT_FIX_SUMMARY.md` with details of fixes applied
3. `BACKEND_UPDATE_INSTRUCTIONS.md` if backend deployment process changes
4. Any relevant README files

### Memory Management
Important project information should be stored in the memory system:
- User preferences and working styles
- Project configuration and technology stack
- Experience and lessons learned from previous tasks

This ensures continuity when switching between AI assistants.

---

**DOCUMENT VERSION:** 1.0
**LAST UPDATED:** December 6, 2025
**AUTHOR:** AI Assistant Team

**REMEMBER:** Always check the memory module first for project-specific information and user preferences before beginning any work.