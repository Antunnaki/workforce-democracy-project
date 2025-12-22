# 🏗️ **WORKFORCE DEMOCRACY PROJECT - COMPLETE SYSTEM ARCHITECTURE**
**Version: 37.17.0-CONTACT-ENHANCEMENT**  
**Last Updated: November 24, 2025**  
**VPS: 185.193.126.13**

---

## 📖 **PURPOSE OF THIS DOCUMENT**

This is a **CRITICAL HANDOVER DOCUMENT** for AI assistants working on this project.  
Read this FIRST before making ANY changes to understand:
- Complete frontend and backend structure
- How components interact
- Where to find specific functionality
- How to safely make changes using the A/B system

---

## 🎯 **PROJECT OVERVIEW**

**Workforce Democracy Project** is a comprehensive civic engagement platform that helps citizens:
- Find and contact their elected representatives (federal & state)
- Analyze bills and legislation with AI-powered summaries
- Access voting information and district office locations
- Understand economic impacts of legislation
- Make informed democratic participation decisions

**Tech Stack:**
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS, no frameworks)
- **Backend**: Node.js 20.19.5 + Express.js
- **Database**: PostgreSQL (shared cache) + MongoDB
- **Deployment**: VPS 185.193.126.13, systemd services, A/B testing infrastructure
- **APIs**: Congress.gov, OpenStates, Groq AI, various civic data sources

---

## 🏛️ **SYSTEM ARCHITECTURE - A/B DEPLOYMENT**

### **Critical Rule #1: NEVER EDIT VERSION A DIRECTLY**

The system uses **dual backend** architecture for safe development:

| Version | Port | Environment | Purpose | Service Name |
|---------|------|-------------|---------|--------------|
| **Version A** | 3001 | Production | LIVE SITE | `workforce-backend-a.service` |
| **Version B** | 3002 | Development | Testing | `workforce-backend-b.service` |

### **Directory Structure:**
```
/var/www/workforce-democracy/
├── version-a/
│   └── backend/          # LIVE production backend (port 3001)
│       ├── server.js
│       ├── routes/
│       ├── utils/
│       └── .env (PORT=3001, NODE_ENV=production)
│
├── version-b/
│   └── backend/          # TEST development backend (port 3002)
│       ├── server.js
│       ├── routes/
│       ├── utils/
│       └── .env (PORT=3002, NODE_ENV=development)
│
├── deployment-scripts/
│   ├── sync-b-to-a.sh   # Deploy B → A (with auto-backup & rollback)
│   ├── rollback.sh      # Restore from backup
│   └── backup.sh        # Manual backups
│
├── backups/             # Timestamped backups
│
└── [FRONTEND FILES]     # Shared across both backends
    ├── index.html
    ├── civic-platform-production.html
    ├── js/
    ├── css/
    └── images/
```

### **Shared Resources:**
- **PostgreSQL Database**: `workforce_democracy` (ports 3001 & 3002 share cache)
- **Frontend Files**: Located in `/var/www/workforce-democracy/` root (served by both backends)
- **MongoDB**: Shared connection (legacy data)

### **Standard Development Workflow:**
```bash
# 1. Make changes in VERSION B
nano /var/www/workforce-democracy/version-b/backend/routes/YOUR_FILE.js

# 2. Restart Version B
sudo systemctl restart workforce-backend-b.service

# 3. Test on port 3002
curl http://localhost:3002/api/civic/representatives/search?zip=12061

# 4. Deploy to Version A (auto-backup + auto-rollback on failure)
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh

# 5. Verify live site
curl http://localhost:3001/api/civic/representatives/search?zip=12061
```

---

## 📂 **FRONTEND STRUCTURE**

### **Core HTML Pages:**

| File | Purpose | Key Features |
|------|---------|--------------|
| `index.html` | Landing page | Hero, feature overview, navigation |
| `civic-platform-production.html` | Main civic platform | Rep finder, bills, voting info |
| `learning.html` | Educational resources | Civics education, how government works |
| `news.html` | Project updates | Version history, changelog |
| `faq.html` | Help & support | Common questions, troubleshooting |
| `privacy.html` | Privacy policy | Data handling, no tracking |

### **JavaScript Architecture:**

#### **Representative Finder System:**
```
js/civic-representative-finder.js    # Main rep finder (V37.17.0 - Enhanced Contact)
├── Handles ZIP code → representatives lookup
├── Renders representative cards with smart contact buttons
├── NEW: 3-tier contact system (direct/fallback/search)
└── Integrates with backend /api/civic/representatives/search

js/rep-finder-simple.js              # Simplified lookup widget
js/rep-finder-helper-functions.js    # Shared utilities
```

**Key Functions in `civic-representative-finder.js`:**
- `handleZipLookup()` - Process ZIP code searches
- `renderRepresentativeCard(rep)` - Display rep cards
- `renderSmartContactButtons(rep)` - **V37.17.0 NEW:** Smart contact buttons with fallbacks
- `formatParty(party)` - Format party affiliations

#### **Bills & Legislation System:**
```
js/bills-section.js                  # Bill browsing, AI analysis
├── Fetches bills from /api/bills
├── Triggers AI summaries via /api/ai/analyze-bill
├── Manages bill cache (PostgreSQL)
└── Cost tracking ($0.0001 per cache hit savings)

js/civic-platform.js                 # Main platform coordinator
js/personalization-system.js         # User preferences (localStorage)
```

#### **Support Systems:**
```
js/community-services.js             # Local resources lookup
js/civic-voting.js                   # Voting information
civic/services/data-aggregator.js    # Multi-API data aggregation
```

### **CSS Architecture:**

#### **Core Styles:**
```
css/core/
├── variables.css           # CSS custom properties (colors, spacing)
├── base.css               # Reset, global styles
├── typography.css         # Font definitions
└── layout.css            # Grid, flex utilities
```

#### **Component Styles:**
```
css/components/
├── representative-cards.css        # Rep card styling
├── civic-voting.css               # Voting info components
├── forms.css                      # Form inputs
├── buttons.css                    # Button styles
├── modals.css                     # Modal dialogs
└── responsive.css                 # Mobile breakpoints

css/civic-representative-finder.css  # V37.17.0 Enhanced contact buttons
├── .contact-link-direct          # Direct contact (blue)
├── .contact-link-fallback        # Contact form (orange)
├── .contact-link-enhanced        # District office (green)
└── .contact-link-search          # DuckDuckGo search (purple)
```

#### **Platform Styles:**
```
css/civic-platform.css              # Main platform layout
css/bills-section.css              # Bill browsing UI
css/personalization.css            # User preference UI
```

---

## 🔧 **BACKEND STRUCTURE**

### **Main Server:**
```
backend/server.js                   # Express server entry point
├── Port configuration (3001 or 3002 from .env)
├── Middleware setup (CORS, body-parser, rate limiting)
├── Route mounting
├── Database connections (PostgreSQL + MongoDB)
└── Error handling
```

### **API Routes:**

#### **Civic API Routes (`backend/routes/civic-routes.js`):**
```javascript
GET  /api/civic/representatives/search?zip={zipCode}
├── Uses: backend/us-representatives.js
├── Returns: Federal + State reps with enhanced contact info
└── V37.17.0: Now includes contactInfo object

GET  /api/civic/llm-chat
├── TEMPORARILY DISABLED (V37.16.2 - causing crashes)
└── Future: AI chat for civic questions

GET  /api/civic/health
└── Health check endpoint
```

#### **Bills API Routes (`backend/routes/bills-routes.js`):**
```javascript
GET  /api/bills
├── Fetch federal bills from Congress.gov
├── State filtering by user's location
└── Pagination support

POST /api/ai/analyze-bill
├── AI-powered bill analysis (Groq)
├── PostgreSQL cache check (saves $$$)
├── Economic impact analysis
└── Returns summary, key points, voting suggestions
```

### **Core Backend Modules:**

#### **Representative Lookup:**
```
backend/us-representatives.js        # V37.17.0 - Contact Enhancement
├── getRepresentativesByZip(zipCode)
│   ├── Uses: Congress.gov API (federal)
│   ├── Uses: OpenStates API (state)
│   └── Returns: Enhanced with contactInfo
│
├── formatCongressMember(member)     # Enhanced in V37.17.0
│   └── Now calls enhanceContactInfo()
│
└── formatStateLegislator(person)    # Enhanced in V37.17.0
    └── Now calls enhanceContactInfo()
```

#### **Contact Info Enhancement (NEW V37.17.0):**
```
backend/utils/contact-info-enhancer.js
├── enhanceContactInfo(rep)
│   ├── Adds contactPageUrl (e.g., website.gov/contact)
│   ├── Adds contactFormUrl (e.g., website.gov/contact/email-me)
│   ├── Adds districtOfficeUrl (e.g., website.gov/offices)
│   └── Adds ddgSearchUrl (DuckDuckGo fallback)
│
├── getSmartContactButtons(contactInfo)
│   └── Returns button configs for frontend
│
├── getCongressContactUrls(rep)
│   ├── Senate-specific patterns
│   └── House-specific patterns
│
└── createContactBundle(rep)
    └── Complete contact info package
```

#### **Utilities:**
```
backend/utils/
├── location-lookup.js              # Privacy-first ZIP→District
│   ├── Uses offline Census data
│   ├── FCC API fallback
│   └── NO Google tracking
│
├── bill-cache.js                   # PostgreSQL bill cache
│   ├── Cache hit = $0 cost
│   ├── Cache miss = $0.0001 cost
│   └── Shared between Version A & B
│
├── economic-analysis.js            # Bill economic impact
│
└── contact-info-enhancer.js        # V37.17.0 NEW: Contact enhancement
```

### **Database Connections:**

#### **PostgreSQL (`workforce_democracy`):**
```javascript
// Shared cache between Version A (3001) and Version B (3002)
Tables:
├── bills_cache           # AI-analyzed bills
│   ├── bill_id (unique)
│   ├── analysis_json
│   ├── cache_hits (cost tracking)
│   └── created_at
│
└── [Future tables for voting records, user preferences]
```

#### **MongoDB:**
```javascript
// Legacy connection, minimal use
// Future: Consider migrating all to PostgreSQL
```

---

## 🎨 **V37.17.0 FEATURE: ENHANCED CONTACT BUTTONS**

### **Problem Solved:**
Previously, only representatives with **direct phone/email** showed contact buttons.  
Most federal reps don't provide emails → users couldn't contact them!

### **Solution: 3-Tier Smart Fallback System**

#### **Tier 1: Direct Contact (Blue)**
If phone/email available → Direct `tel:` or `mailto:` link

#### **Tier 2: Contact Form Fallback (Orange)**
If no direct contact → Link to:
- `{website}/contact/email-me` (contact form)
- `{website}/contact` (contact page)
- `{website}/offices` (district offices)

#### **Tier 3: Search Fallback (Purple)**
If no website → DuckDuckGo search:
```
"[Rep Name]" contact phone email site:{their-website.gov}
```

### **Implementation:**

**Backend (`backend/us-representatives.js`):**
```javascript
// Enhanced in formatCongressMember() and formatStateLegislator()
const enhanced = enhanceContactInfo(baseRep);
// Returns rep with contactInfo object
```

**Frontend (`js/civic-representative-finder.js`):**
```javascript
renderSmartContactButtons(rep) {
    // Always renders 4 buttons:
    // 📞 Phone (direct or "Find Phone")
    // ✉️ Email (direct or "Contact Form")
    // 🌐 Website (always available)
    // 🏢 Local Office (federal reps only)
}
```

**Styling (`css/civic-representative-finder.css`):**
```css
.contact-link-direct    { color: #3b82f6; }  /* Blue - direct contact */
.contact-link-fallback  { color: #f59e0b; }  /* Orange - contact form */
.contact-link-enhanced  { color: #10b981; }  /* Green - district office */
.contact-link-search    { color: #8b5cf6; }  /* Purple - search */
```

---

## 🔄 **API DATA FLOW**

### **Representative Lookup Flow:**
```
User enters ZIP → Frontend → Backend API → Multiple Sources → Enhanced Data → Frontend Display

1. Frontend (js/civic-representative-finder.js)
   └── User enters ZIP: 12061

2. API Request
   └── GET /api/civic/representatives/search?zip=12061

3. Backend (backend/routes/civic-routes.js)
   └── Calls getRepresentativesByZip(12061)

4. Location Lookup (backend/utils/location-lookup.js)
   ├── ZIP 12061 → Albany, NY
   ├── State: NY
   └── District: NY-20

5. Federal Reps (backend/us-representatives.js)
   ├── Congress.gov API
   ├── Returns: 2 Senators + 1 House Rep
   └── Formats with formatCongressMember()

6. State Reps (backend/us-representatives.js)
   ├── OpenStates API
   ├── Returns: 5 State legislators
   └── Formats with formatStateLegislator()

7. Contact Enhancement (backend/utils/contact-info-enhancer.js)
   ├── For each rep: enhanceContactInfo()
   ├── Adds contactPageUrl
   ├── Adds contactFormUrl
   ├── Adds districtOfficeUrl
   └── Adds ddgSearchUrl

8. Response to Frontend
   └── JSON with 15 reps + enhanced contactInfo

9. Frontend Rendering (js/civic-representative-finder.js)
   ├── For each rep: renderRepresentativeCard()
   └── Calls renderSmartContactButtons()

10. Display
    └── User sees all 4 contact buttons with smart fallbacks
```

### **Bill Analysis Flow (with Caching):**
```
User requests bill analysis → Cache check → AI analysis (if needed) → Display

1. Frontend Request
   └── POST /api/ai/analyze-bill { bill_id: "hr1234-118" }

2. Cache Check (backend/utils/bill-cache.js)
   ├── Query PostgreSQL: bills_cache table
   ├── IF FOUND → Cache hit! ($0 cost)
   │   └── Increment cache_hits counter
   │   └── Return cached analysis
   │
   └── IF NOT FOUND → Cache miss ($0.0001 cost)
       ├── Call Groq AI API
       ├── Store in PostgreSQL
       └── Return fresh analysis

3. PostgreSQL Cache (SHARED between Version A & B!)
   ├── Version B tests bill → Cached
   └── Version A requests same bill → Cache HIT! (instant + free)
```

---

## 🗂️ **KEY FILES REFERENCE**

### **Must-Read Files for AI Assistants:**

| File | Purpose | Read When... |
|------|---------|-------------|
| `AB-DEPLOYMENT-SYSTEM.md` | A/B deployment rules | Making backend changes |
| `FRONTEND-BACKEND-STRUCTURE.md` | This file | Starting any task |
| `QUICK-REFERENCE.md` | Common commands | Need deployment commands |
| `backend/us-representatives.js` | Rep lookup logic | Working on rep finder |
| `backend/utils/contact-info-enhancer.js` | Contact enhancement | Adding contact features |
| `js/civic-representative-finder.js` | Frontend rep display | Updating UI |

### **Configuration Files:**

| File | Purpose | Location |
|------|---------|----------|
| `.env` (Version A) | Production config | `/var/www/workforce-democracy/version-a/backend/.env` |
| `.env` (Version B) | Development config | `/var/www/workforce-democracy/version-b/backend/.env` |
| `package.json` | Dependencies | `backend/package.json` |

### **Critical Environment Variables:**
```bash
# Backend Ports
PORT=3001                  # Version A (live)
PORT=3002                  # Version B (test)

# Database
DB_NAME=workforce_democracy     # SHARED PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres

# API Keys
CONGRESS_API_KEY=[REDACTED_CONGRESS_API_KEY]
OPENSTATES_API_KEY=[REDACTED_OPENSTATES_API_KEY]
GROQ_API_KEY=[REDACTED_GROQ_API_KEY]
```

---

## 🚀 **COMMON TASKS FOR AI ASSISTANTS**

### **Task 1: Fix a Bug**
```bash
# 1. Make changes in VERSION B
ssh root@185.193.126.13
cd /var/www/workforce-democracy/version-b/backend
nano routes/YOUR_FILE.js

# 2. Restart Version B
sudo systemctl restart workforce-backend-b.service

# 3. Test
curl http://localhost:3002/api/YOUR_ENDPOINT

# 4. Deploy if successful
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

### **Task 2: Add a New API Endpoint**
```javascript
// File: version-b/backend/routes/YOUR_ROUTE.js

router.get('/api/your-endpoint', async (req, res) => {
    try {
        // Your logic here
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Then mount in server.js:
const yourRoute = require('./routes/YOUR_ROUTE');
app.use('/api', yourRoute);
```

### **Task 3: Update Frontend Styling**
```bash
# Frontend files are SHARED - edit directly
nano /var/www/workforce-democracy/css/YOUR_FILE.css

# Changes take effect immediately (no restart needed)
# Just refresh browser
```

### **Task 4: Check Backend Logs**
```bash
# Version A (Live)
tail -f /var/log/workforce-backend-a.log

# Version B (Test)
tail -f /var/log/workforce-backend-b.log

# Service status
systemctl status workforce-backend-a.service
systemctl status workforce-backend-b.service
```

### **Task 5: Rollback Failed Deployment**
```bash
cd /var/www/workforce-democracy/deployment-scripts

# List backups
ls -la /var/www/workforce-democracy/backups

# Rollback to specific backup
./rollback.sh 20251124-235200

# Or rollback to latest
./rollback.sh
```

---

## 📊 **MONITORING & VERIFICATION**

### **Quick System Health Check:**
```bash
# All-in-one verification script
cd /var/www/workforce-democracy

# Check services
systemctl status workforce-backend-a.service --no-pager
systemctl status workforce-backend-b.service --no-pager

# Check ports
ss -tulpn | grep :300

# Test APIs
curl http://localhost:3001/api/civic/representatives/search?zip=12061 | jq '.counts'
curl http://localhost:3002/api/civic/representatives/search?zip=12061 | jq '.counts'

# PostgreSQL cache check
psql -U postgres -d workforce_democracy -c "SELECT bill_id, cache_hits FROM bills_cache ORDER BY cache_hits DESC LIMIT 5;"
```

### **Expected Results:**
- Both services: `active (running)`
- Both ports: Listening on 3001 and 3002
- API returns: 15 representatives (2 federal senators + 1 house + ~12 state)
- PostgreSQL: Cache entries with hit counts

---

## 🎯 **PROJECT ROADMAP & FUTURE FEATURES**

### **✅ Completed (V37.17.0):**
- [x] A/B deployment infrastructure
- [x] Shared PostgreSQL cache
- [x] Enhanced contact buttons with 3-tier fallbacks
- [x] Privacy-first representative lookup (no Google tracking)
- [x] Bill cache system (cost savings)
- [x] Deployment automation (sync, rollback, backup)

### **🚧 In Progress:**
- [ ] Voting records feature
- [ ] District office physical locations (map integration)
- [ ] Mobile-responsive improvements

### **📋 Planned:**
- [ ] User accounts (optional, privacy-first)
- [ ] Bill tracking notifications
- [ ] Legislative alert system
- [ ] Multilingual support (Spanish, Chinese)
- [ ] Congressional district boundary visualization

---

## 🆘 **TROUBLESHOOTING**

### **Problem: Backend won't start**
```bash
# Check logs
journalctl -u workforce-backend-b.service -n 50

# Common issues:
# - Port already in use
# - Missing .env file
# - Database connection failed
```

### **Problem: API returns empty results**
```bash
# Check API keys in .env
grep API_KEY /var/www/workforce-democracy/version-b/backend/.env

# Test Congress.gov API directly
curl "https://api.congress.gov/v3/member?format=json&api_key=YOUR_KEY&limit=1"
```

### **Problem: Frontend shows old data**
```bash
# Clear browser cache
# Or use hard refresh: Ctrl+Shift+R (Chrome/Firefox)

# Check if frontend is loading from correct backend
# Open browser console, check Network tab
```

---

## 📚 **ADDITIONAL DOCUMENTATION**

- **Deployment**: `AB-DEPLOYMENT-SYSTEM.md`
- **Quick Commands**: `QUICK-REFERENCE.md`
- **Version History**: `news.html` or `V37.x.x.md` files
- **API Documentation**: See route files in `backend/routes/`
- **Privacy Policy**: `privacy.html`

---

## 🤝 **FOR AI ASSISTANTS: BEST PRACTICES**

1. **ALWAYS read this document first** before making changes
2. **ALWAYS work in Version B** for backend changes
3. **ALWAYS test in Version B** before deploying to Version A
4. **NEVER edit Version A directly** - use sync-b-to-a.sh
5. **ALWAYS update documentation** when adding features
6. **ALWAYS check logs** after deployments
7. **ASK USER before deploying** - confirm testing is complete

---

**🎉 You now have a complete understanding of the Workforce Democracy Project!**  
Use this as your primary reference for all development tasks.

**Questions? Check:**
- `AB-DEPLOYMENT-SYSTEM.md` for deployment details
- `QUICK-REFERENCE.md` for common commands
- Backend route files for API specifics
- Frontend JS files for UI logic

**Happy coding! 🚀**
