# 🗂️ Backend Consolidation Plan

**Date:** November 4, 2025  
**Issue:** Multiple backend instances causing confusion and duplicate work  
**Goal:** Consolidate everything into ONE backend at `/var/www/workforce-democracy/backend/`

---

## Problem Identified

You have **MULTIPLE backend locations**:

### 1. Main Backend (PRIMARY - Keep This)
```
Location: /var/www/workforce-democracy/backend/
Running on: VPS (185.193.126.13)
Port: 3001
PM2 Process: "backend"
Status: ✅ ACTIVE (This is your working backend)
```

**Files:**
- `server.js` (main server)
- `ai-service.js` (Groq LLM integration)
- `government-apis.js` (Congress, ProPublica, Court APIs)
- `us-representatives.js` (Federal + State representatives)
- `australian-parliament-api.js` (AU parliament)
- `nonprofit-proxy.js` (nonprofit search)

### 2. Civic Backend (DUPLICATE - Merge & Archive)
```
Location: civic/backend/
Status: ❌ STANDALONE - Should be integrated into main backend
```

**Files:**
- `civic-api.js` (Express router - duplicate functionality)
- `llm-proxy.js` (Groq proxy - DUPLICATE of ai-service.js!)
- `scraping-queue.js` (web scraping service)

### 3. Loose Backend Files (OLD VERSIONS - Archive)
```
Location: Root directory
Status: ❌ OLD VERSIONS - Should be deleted
```

**Files:**
- `backend-server-example.js` (example/template file)
- `civic-api-CORRECTED-v37.0.2.js` (old version)
- `us-representatives-FIXED-v37.0.2.js` (old version)
- `us-representatives-FINAL-FIX-v37.0.2.js` (old version)
- `us-representatives-NAME-FIX-v37.0.2.js` (old version)

---

## The Duplication Problem

### GROQ API Called from 2 Places! ❌

**Location 1:** `backend/ai-service.js` (PRIMARY)
```javascript
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
```

**Location 2:** `civic/backend/llm-proxy.js` (DUPLICATE!)
```javascript
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const MODEL = 'llama3-70b-8192';
```

**Problem:** Different models! Different code! Updates to one don't affect the other!

---

### Representative Lookup in 2 Places! ❌

**Location 1:** `backend/us-representatives.js` (PRIMARY)
- Uses Congress.gov API
- Uses OpenStates API
- Comprehensive, well-documented

**Location 2:** `civic/backend/civic-api.js` (imports from #1)
```javascript
const { getRepresentativesByZip } = require('../../backend/us-representatives');
```

**Status:** This one is OK - it imports from the main one, so not truly duplicate.

---

## Consolidation Strategy

### Phase 1: Merge Civic Backend into Main Backend ✅

**Move these features from `civic/backend/` to `backend/`:**

1. **Scraping Queue** (`civic/backend/scraping-queue.js`)
   - Move to: `backend/scraping-queue.js`
   - Update: `backend/server.js` to import it

2. **LLM Proxy** (`civic/backend/llm-proxy.js`)
   - **DELETE** - Functionality already in `backend/ai-service.js`
   - Update frontend to use `/api/civic/llm-chat` from main backend

3. **Civic API Router** (`civic/backend/civic-api.js`)
   - Keep as router: `backend/civic-router.js`
   - Import into `backend/server.js`

### Phase 2: Archive Old Versions ✅

**Create archive folder:**
```
/ARCHIVED-BACKEND-FILES/
```

**Move these files there:**
- `backend-server-example.js` → Archive
- `civic-api-CORRECTED-v37.0.2.js` → Archive
- `us-representatives-FIXED-v37.0.2.js` → Archive
- `us-representatives-FINAL-FIX-v37.0.2.js` → Archive
- `us-representatives-NAME-FIX-v37.0.2.js` → Archive
- `civic/backend/llm-proxy.js` → Archive (after verifying ai-service.js has all features)

### Phase 3: Update All References ✅

**Frontend files that need updating:**
- `js/backend-api.js`
- `civic/components/llm-assistant.js`
- Any files importing from `civic/backend/`

**Change all references to point to:**
```
/api/civic/llm-chat  → Handled by backend/server.js
```

---

## Implementation Steps

### Step 1: Audit What civic/backend Actually Does

Let me check if `civic/backend/llm-proxy.js` has features that `backend/ai-service.js` doesn't:

**civic/backend/llm-proxy.js features:**
- Source search & caching
- News source filtering
- OpenSecrets integration
- DuckDuckGo search

**backend/ai-service.js features:**
- Groq LLM calls
- System prompts for each chat type
- Source extraction
- **Current date injection** (NEW - we just added this!)

**Conclusion:** `llm-proxy.js` has MORE features! We need to MERGE them, not delete.

---

### Step 2: Create Unified Backend

**Merge Strategy:**

1. **Keep:** `backend/server.js` as main server
2. **Merge:** `civic/backend/llm-proxy.js` features into `backend/ai-service.js`
3. **Move:** `civic/backend/scraping-queue.js` to `backend/scraping-queue.js`
4. **Rename:** `civic/backend/civic-api.js` to `backend/civic-router.js`
5. **Delete:** Duplicate/old versions
6. **Archive:** Everything else in `ARCHIVED-BACKEND-FILES/`

---

## Files to Create

### 1. New Structure for `backend/server.js`

```javascript
// Import all routers
const civicRouter = require('./civic-router');
const aiService = require('./ai-service');
const govAPIs = require('./government-apis');
const usReps = require('./us-representatives');
const nonprofitProxy = require('./nonprofit-proxy');

// Mount routers
app.use('/api/civic', civicRouter);
app.use('/api/ai', aiService.router);
app.use('/api/gov', govAPIs.router);
```

### 2. Merged `backend/ai-service.js`

Combine features from:
- Current `backend/ai-service.js` (has current date)
- `civic/backend/llm-proxy.js` (has source search, news filtering)

**Result:** One comprehensive AI service with ALL features

### 3. New `backend/civic-router.js`

Moved from `civic/backend/civic-api.js`:
- Representative search endpoints
- Bill tracking endpoints
- Fact-check endpoints
- Alignment calculation endpoints

---

## Archive Structure

```
ARCHIVED-BACKEND-FILES/
├── README-ARCHIVE.md (explains what's here and why)
├── old-versions/
│   ├── backend-server-example.js
│   ├── civic-api-CORRECTED-v37.0.2.js
│   ├── us-representatives-FIXED-v37.0.2.js
│   ├── us-representatives-FINAL-FIX-v37.0.2.js
│   └── us-representatives-NAME-FIX-v37.0.2.js
├── civic-backend-merged/
│   ├── llm-proxy.js (features merged into backend/ai-service.js)
│   └── civic-api.js (moved to backend/civic-router.js)
└── consolidation-date.txt (Nov 4, 2025)
```

---

## Benefits After Consolidation

✅ **Single source of truth** - No confusion about which backend to update  
✅ **No duplicate work** - Update once, works everywhere  
✅ **Easier deployment** - One backend to deploy  
✅ **Better code organization** - Clear structure  
✅ **No version conflicts** - One version of each file  
✅ **Simpler debugging** - One place to check logs  

---

## Next Steps

**I need your approval to proceed with this plan.**

**Option A: Full Consolidation (Recommended)**
- Merge all backends into one
- Archive old files
- Update all references
- Test thoroughly
- Deploy unified backend

**Option B: Quick Cleanup Only**
- Just archive the old version files
- Leave civic/backend alone for now
- Clean up later when you have time

**Which would you prefer?**

---

## Questions Before I Start

1. **Are you actively using the civic/backend files?**
   - If yes, which features?
   - If no, safe to merge?

2. **Do you want me to create a backup before consolidating?**
   - I recommend: Yes

3. **Should I do this all at once or step-by-step?**
   - All at once: Faster, but riskier
   - Step-by-step: Slower, but safer

4. **Any specific features you want to preserve?**
   - Source search from llm-proxy.js?
   - Scraping queue functionality?
   - Civic API endpoints?

---

## My Recommendation

**Do this consolidation in 3 phases:**

### Phase 1 (Today): Archive Old Versions ✅ Low Risk
- Move all old version files to ARCHIVED-BACKEND-FILES/
- No functional changes
- Easy to rollback

### Phase 2 (Next): Merge LLM Services ⚠️ Medium Risk
- Combine ai-service.js + llm-proxy.js
- Keep best features from both
- Test thoroughly before deploying

### Phase 3 (Later): Full Integration ⚠️ Higher Risk
- Move civic-api.js to backend/civic-router.js
- Update all frontend references
- Comprehensive testing

**Want me to start with Phase 1 (archiving old files)?**

This is safest and gives immediate cleanup without risk!
