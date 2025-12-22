# AI Handover - Workforce Democracy Project

## 🎯 Project Overview

**Workforce Democracy** is a civic engagement platform that helps citizens connect with representatives, understand legislation, and participate in democracy.

**Live Site**: https://workforcedemocracy.org  
**Stack**: Static HTML/CSS/JS frontend + Node.js Express backend

---

## 📁 Essential Directory Structure

```
/var/www/workforce-democracy/
│
├── index.html              # Main homepage
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── _headers               # Netlify headers config
│
├── css/                   # Stylesheets
│   ├── style.css          # Main styles
│   └── [other css files]
│
├── js/                    # JavaScript files
│   ├── main.js            # Main application logic
│   ├── chat-widget.js     # Chat functionality
│   └── [other js files]
│
├── backend/               # Node.js Express API server
│   ├── server.js          # Main server file
│   ├── package.json       # Dependencies
│   ├── .env               # Environment variables (sensitive)
│   └── [routes, middleware, etc.]
│
├── images/                # Image assets
│
└── docs/                  # Additional HTML pages
    ├── faq.html
    ├── privacy.html
    ├── learning.html
    └── [other pages]
```

---

## 🔑 Key Files to Know

### Frontend Core
- **index.html** - Main application entry point
- **css/style.css** - Primary stylesheet with all visual design
- **js/main.js** - Core application logic and interactions
- **manifest.json** - PWA configuration for "install app" feature

### Backend Core
- **backend/server.js** - Express API server with CORS, rate limiting, and proxy endpoints
- **backend/.env** - Environment variables (API keys, server config)
- **backend/package.json** - Node dependencies

### Configuration
- **_headers** - Netlify CDN headers (CSP, CORS, security)
- **sw.js** - Service worker for offline capability and caching

---

## 🚀 Quick Start Commands

### Frontend Development
```bash
# No build step needed - just serve the files
# Open index.html in browser or use local server
```

### Backend Development
```bash
cd /var/www/workforce-democracy/backend
npm install
node server.js
# Server runs on port 3000 (or PORT env variable)
```

### Deployment
```bash
# Frontend: Auto-deploys via Netlify from Git
# Backend: Manually restart if code changes
cd /var/www/workforce-democracy/backend
pm2 restart backend
```

---

## 🔧 Key Features

1. **Representative Finder** - Find elected officials by ZIP code
2. **AI Chat Assistants** - Context-aware chat for different topics
3. **Legislation Tracker** - View and discuss bills
4. **Community Services** - Find local nonprofit resources
5. **Civic Transparency** - Government data and voting info

---

## 🌐 Backend API Endpoints

The backend serves as a proxy for external APIs and provides:

- `/api/representatives` - Google Civic Information API proxy
- `/api/nonprofits` - Charity Navigator API proxy
- `/api/civic/llm-chat` - LLM chat endpoint (Groq AI - Llama 3.3 70B Versatile)
- `/health` - Backend health check endpoint
- CORS headers for cross-origin requests
- Rate limiting for API protection

---

## ⚠️ Important Notes

### 🔑 CRITICAL: AI Assistants Can Edit Backend Files Directly!

**YOU (the AI assistant) have DIRECT FILE EDITING ACCESS to the server.**

**This is the MOST IMPORTANT capability** - you can edit backend files using the tools available:
- ✅ `Read` - Read any file in the project
- ✅ `Write` - Create new files or overwrite existing files
- ✅ `Edit` - Make precise string replacements in files
- ✅ `MultiEdit` - Make multiple edits to a single file atomically

**Example Workflow:**
```javascript
// YOU do this (AI assistant):
1. Read('backend/ai-service.js', offset: 1200, limit: 50)  // Read the file
2. Edit('backend/ai-service.js', 
     old_string: 'const buggyCode = true;',
     new_string: 'const fixedCode = true;'
   )  // Fix it directly
3. Tell user: "✅ I've updated backend/ai-service.js. Please restart: pm2 restart backend"

// User does NOTHING except restart PM2!
```

**Benefits:**
- ✅ **INSTANT** - No waiting for user to paste commands
- ✅ **ACCURATE** - No copy-paste errors
- ✅ **VERIFIABLE** - You can read the file after to confirm changes
- ✅ **FAST** - Complete fixes in seconds

### Backend Consolidation (2025-11-07)
**CRITICAL**: There is only ONE backend process:
- **PM2 Process**: `backend` (id: 2)
- **Location**: `/var/www/workforce-democracy/backend/`
- **Port**: 3001
- **Status**: ✅ Running and healthy

**DO NOT**:
- Create duplicate backend processes
- Look for `/civic/backend/` (does not exist)
- Reference `workforce-backend` PM2 process (was removed due to port conflicts)

See `BACKEND-CONSOLIDATION-COMPLETE.md` for full details of the consolidation.

### What to Ignore
The project root contains **hundreds of old documentation files** (markdown files with version numbers, deployment guides, etc.). These are historical artifacts and can be safely ignored or archived.

**Focus only on**:
- The directories listed above
- README.md (if you need project history)
- This AI-HANDOVER-CLEAN.md file
- BACKEND-CONSOLIDATION-COMPLETE.md (recent backend fixes)

### Environment Variables
Backend requires `.env` file with:
- `GROQ_API_KEY` - For AI chat functionality (Groq Llama 3.3 70B Versatile)
- `CHARITY_NAVIGATOR_API_KEY` - For nonprofit lookup
- `GOOGLE_CIVIC_API_KEY` - For representative finder
- `PORT` - Server port (currently 3001)

### Security
- Never commit `.env` files
- API keys are proxied through backend to hide from frontend
- CSP headers in `_headers` file control content security

---

## 📝 Making Changes

### 🎯 How AI Assistants Edit Backend Files

**Method 1: AI Direct Editing (PREFERRED - FASTEST)**

You have access to file editing tools:

1. **Read the file** using Read tool:
   ```
   Read('backend/ai-service.js', offset: 1000, limit: 50)
   ```

2. **Edit the file** using Edit or MultiEdit tool:
   ```
   Edit('backend/ai-service.js',
     old_string: 'sources = await searchAdditionalSources(query, aiText);',
     new_string: 'sources = await searchAdditionalSources(query, query);'
   )
   ```

3. **Verify the change** by reading again:
   ```
   Read('backend/ai-service.js', offset: 1050, limit: 10)
   ```

4. **Tell user to restart:**
   ```
   "✅ I've updated backend/ai-service.js directly. Please restart:
   pm2 restart backend
   pm2 logs backend --lines 20"
   ```

**Method 2: SSH Commands (BACKUP - Only when AI tools can't handle it)**

Only use SSH commands for operations AI tools can't perform:
- Restarting PM2
- Checking logs
- Installing NPM packages
- Checking system status

### Frontend Changes
1. Use Write/Edit tools to update HTML/CSS/JS files
2. Tell user to hard refresh browser (Ctrl+Shift+R)
3. Netlify auto-deploys from Git (if connected)

### Backend Changes
1. **Use Edit/MultiEdit tools** to modify backend files (PREFERRED)
2. Tell user to restart: `pm2 restart backend`
3. Verify with: `pm2 logs backend --lines 20`

### Adding New Features
1. Use Write tool to create new files
2. Use Edit tool to update existing files
3. Update this handover doc using Edit tool
4. Test thoroughly before deployment

---

## 🐛 Troubleshooting

### Frontend Issues
- Check browser console for errors
- Verify `_headers` file for CSP violations
- Clear browser cache (service worker can cache aggressively)

### Backend Issues
- Check logs: `pm2 logs backend`
- Verify `.env` variables are set
- Check CORS configuration in `server.js`
- Verify backend health: `curl https://api.workforcedemocracyproject.org/health`

### Cache Issues
- Update version number in service worker `sw.js`
- Hard refresh browser (Ctrl+Shift+R)
- Clear service worker in DevTools

---

## 📞 Next Steps for New AI

1. Read this document fully
2. Explore the key directories listed above
3. Check `backend/server.js` for API structure
4. Review `index.html` and `css/style.css` for frontend structure
5. **Ignore all the versioned .md files in root** - they're historical noise

---

## 🖥️ Server Access & Technical Details

### Server Information
- **IP Address**: 185.193.126.13
- **SSH Access**: root@185.193.126.13
- **OS**: Ubuntu 22.04.5 LTS
- **Web Server**: Nginx (reverse proxy to port 3001)
- **Process Manager**: PM2 (runs as www-data user)

### Backend File Locations
```
/var/www/workforce-democracy/
├── backend/                        # ⭐ MAIN BACKEND
│   ├── server.js                   # Entry point
│   ├── ai-service.js               # AI/LLM integration
│   ├── rss-service.js              # Global RSS feeds
│   ├── .env                        # API keys
│   ├── package.json                # Dependencies
│   └── PROJECT_MASTER_GUIDE.md     # Detailed guide
│
├── index.html                      # Frontend homepage
└── [other frontend files]          # Public website
```

### File Ownership & Permissions
```bash
# Backend files owned by www-data (PM2 runs as www-data)
chown -R www-data:www-data /var/www/workforce-democracy/backend/

# .env file: readable/writable only by owner
chmod 600 /var/www/workforce-democracy/backend/.env

# JavaScript files: readable by all, writable by owner
chmod 644 /var/www/workforce-democracy/backend/*.js
```

### Common Commands (When AI Tools Can't Handle It)
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs backend --lines 50

# Restart backend
pm2 restart backend

# Test API health
curl https://api.workforcedemocracyproject.org/health
```

## 📚 Additional Resources

- **Live Site**: https://workforcedemocracy.org
- **API Backend**: https://api.workforcedemocracyproject.org
- **Current Focus**: Backend AI integration and civic data features
- **Tech Stack**: Vanilla JS, Node.js, Express, various civic APIs
- **Detailed Guide**: `/var/www/workforce-democracy/backend/PROJECT_MASTER_GUIDE.md`

## 📖 For Comprehensive Details

This is a **clean, focused handover**. For complete technical details, read:
- **PROJECT_MASTER_GUIDE.md** - Comprehensive 1,600+ line guide with:
  - Full API keys and environment variables
  - RSS feed configuration (50+ sources)
  - Detailed architecture diagrams
  - Complete troubleshooting guide
  - Session handover notes
  - Step-by-step workflows

**To access it:**
```bash
cat /var/www/workforce-democracy/backend/PROJECT_MASTER_GUIDE.md
```

---

*Last Updated: 2025-11-07*  
*Document Purpose: Clean, focused handover for AI assistants - ignore the documentation clutter in root directory*
