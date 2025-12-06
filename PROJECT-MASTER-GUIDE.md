# Workforce Democracy Project - Master Guide

## Project Overview

The Workforce Democracy Project is a civic engagement platform that helps citizens understand government processes, track representatives, explore democratic workplaces, and participate in democracy. It combines government data with AI assistance to provide personalized civic information.

## Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design for all devices
- Netlify hosting

### Backend
- Node.js with Express.js
- PostgreSQL for relational data
- MongoDB for personalization features
- Nginx reverse proxy
- Hosted on Njalla VPS (185.193.126.13)

### AI Integration
- Qwen API via DashScope (Tongyi Lab)
- Qwen Plus model (formerly used Groq API with Llama 3.3 70B)
- Custom prompt engineering for factual accuracy
- Source-based responses with citations

### APIs and Data Sources
- Congress.gov for federal representative data
- OpenStates for state legislature data
- Various news sources for current events

## Project Structure

```
├── backend/                 # Backend API server
│   ├── ai-service-qwen.js   # NEW: Qwen AI integration and prompt engineering
│   ├── ai-service.js        # Old/placeholder AI service file
│   ├── server.js            # Main Express server
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic modules
│   ├── utils/               # Utility functions
│   └── .env.example         # Environment variable template
├── js/                      # Frontend JavaScript
│   ├── chat-clean.js        # Chat UI and widget implementation
│   ├── config.js            # Frontend configuration
│   └── main.js              # Main application initialization
├── css/                     # Stylesheets
└── index.html               # Main HTML file
```

## Deployment Process

### Frontend Deployment
- Hosted on Netlify
- Auto-deploys from Git repository
- Custom domain: workforcedemocracyproject.org

### Backend Deployment
- Hosted on Njalla VPS (185.193.126.13)
- Uses PM2 for process management
- Nginx reverse proxy for CORS handling
- Single endpoint: https://api.workforcedemocracyproject.org (used for both production and testing)
- Previously had Version A (port 3000) and Version B (port 3001) but now consolidated

SSH Command:
```bash
ssh root@185.193.126.13
Password: YNWA1892LFC
```

## API Endpoints

### Civic Platform Endpoints
- `POST /api/civic/llm-chat` - AI chat with context
- `GET /api/civic/llm-health` - AI service health check
- `GET /api/civic/health` - Overall API health
- `GET /api/civic/representatives/search` - Search representatives by ZIP

### Environment Variables
Required environment variables are documented in `backend/.env.example`:

```
# Qwen API Configuration (replaces Groq)
QWEN_API_KEY=your_qwen_api_key_here
QWEN_MODEL=qwen-plus
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation

# Backwards compatibility - these are no longer used but kept for reference
# GROQ_API_KEY=your_old_groq_api_key
# GROQ_MODEL=llama-3.3-70b-versatile
```

## AI Assistant Integration

### Current Status
The AI assistant has been successfully migrated from Groq/Llama to Qwen (Tongyi Lab). The system now properly integrates with the Qwen API and provides actual AI responses instead of fallback messages.

### Troubleshooting Steps
1. SSH into backend server
2. Check application logs for Qwen API errors
3. Verify Qwen API key validity and quota
4. Test direct API connectivity from server:
   ```bash
   curl -X GET "https://api.workforcedemocracyproject.org/api/civic/llm-health"
   ```
5. Test chat functionality:
   ```bash
   curl -X POST "https://api.workforcedemocracyproject.org/api/civic/llm-chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, who are you?"}'
   ```

## Common Development Tasks

### Adding New Chat Contexts
1. Update context mapping in `chat-clean.js`
2. Add system prompt in `ai-service-qwen.js`
3. Implement frontend UI elements
4. Test integration

### Adding New Data Sources
1. Create new service in `backend/services/`
2. Add routes in `backend/routes/`
3. Update frontend to consume new endpoints
4. Document API in this guide

## Future Improvements

1. Enhanced personalization features
2. More comprehensive government data integration
3. Expanded ethical business database
4. Improved offline capabilities
5. Better error handling and monitoring
6. Rate limiting implementation