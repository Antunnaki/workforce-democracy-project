# 🎯 AI Handover - Workforce Democracy Project (v37.6.1)
**Last Updated**: November 8, 2025  
**Current Version**: Backend v37.6.1 (Policy Keywords Added + Citation System Fixed)  
**Next Version**: v37.7.0 (Source Relevance Filtering - READY TO DEPLOY)

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Server Access & Direct File Editing](#server-access--direct-file-editing)
3. [🛡️ **DEPLOYMENT SAFEGUARDS** (READ THIS FIRST!)](#deployment-safeguards)
4. [Recent Fixes (v37.5.0 → v37.6.1)](#recent-fixes-v3750--v3761)
5. [Project Structure](#project-structure)
6. [Key Files Reference](#key-files-reference)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Workforce Democracy** is a civic engagement platform that helps citizens connect with representatives, understand legislation, and participate in democracy.

**Live Site**: https://workforcedemocracy.org (Frontend hosted on Netlify)  
**Backend**: VPS at 185.193.126.13 (Node.js Express on port 3001)  
**Stack**: Static HTML/CSS/JS frontend + Node.js Express backend with PostgreSQL

### Core Philosophy
- **Compassionate AI**: Meet anger with patience, provide factual information
- **Independent Journalism**: Prioritize Democracy Now!, Truthout, Common Dreams over corporate media
- **Worker-Centered**: Focus on labor rights, economic justice, transparency
- **Evidence-Based**: Citations, sources, verifiable facts

---

## 🔐 Server Access & Direct File Editing

### SSH Access
```bash
ssh root@185.193.126.13
```
**Password**: [User has access]

### **CRITICAL: AI Assistants CAN Directly Edit Backend Files!**

Previous AI assistants can use `sed`, `echo`, `cat`, and heredoc commands to directly modify backend files without file upload/download!

#### ✅ Proven Working Methods:

**1. Using `sed` for single-line replacements:**
```bash
cd /var/www/workforce-democracy/backend
sed -i 's/old text/new text/g' ai-service.js
```

**2. Using `cat` with heredoc for multi-line insertions:**
```bash
cat > /tmp/new-code.txt << 'ENDCODE'
// Your multi-line code here
function example() {
    console.log('This works!');
}
ENDCODE

# Insert at specific line number
LINE_NUM=1234
sed -i "${LINE_NUM}r /tmp/new-code.txt" ai-service.js
```

**3. Using `echo` with `-e` for line breaks:**
```bash
echo -e "Line 1\nLine 2\nLine 3" >> ai-service.js
```

**4. Finding and replacing blocks:**
```bash
# Find line number
grep -n "search text" ai-service.js

# Replace range
sed -i '100,150d' ai-service.js  # Delete lines 100-150
sed -i '100r /tmp/new-code.txt' ai-service.js  # Insert at line 100
```

### After Editing Files:
```bash
# CRITICAL: Use this sequence (not just pm2 restart!)
pm2 stop backend
pm2 flush               # Clear old logs
pm2 delete backend      # Remove cached process
pm2 start server.js --name backend  # Start fresh
pm2 logs backend --lines 50
```

**Why?** PM2 can cache old code/logs. Always stop→flush→delete→start for clean deployment.

---

## 🛡️ DEPLOYMENT SAFEGUARDS

### ⚠️ CRITICAL: Read Before Making Backend Changes!

**Problem We Solved (Nov 8, 2025):**
- Multiple deployment attempts caused orphaned code
- PM2 cache showed old errors even after file was fixed
- Line number confusion from sed insertions
- Code accidentally inserted outside function scope

**Solution: Pre-Deployment Checklist**

```bash
# 1. ALWAYS create backup first
cd /var/www/workforce-democracy/backend
cp ai-service.js "ai-service-BACKUP-$(date +%Y%m%d-%H%M%S).js"

# 2. Verify current file state
bash verify-backend-files.sh

# 3. Test current syntax
node -c ai-service.js

# 4. STOP PM2 (don't restart)
pm2 stop backend

# 5. Make your changes
# ... edit file ...

# 6. Test new syntax
node -c ai-service.js

# 7. Clear PM2 cache and start fresh
pm2 flush
pm2 delete backend
pm2 start server.js --name backend

# 8. Verify clean logs
pm2 logs backend --lines 50
```

### File Verification Script

**Location**: `/var/www/workforce-democracy/backend/verify-backend-files.sh`

**Usage**:
```bash
cd /var/www/workforce-democracy/backend
bash verify-backend-files.sh
```

**What it checks**:
- ✅ Policy keywords present (v37.6.1+)
- ✅ Correct number of references (2)
- ✅ No orphaned code between functions
- ✅ JavaScript syntax valid
- ✅ Code is inside function scope (not outside)
- ✅ File size reasonable (~58KB)

**Add to .bashrc for easy access:**
```bash
echo "alias check-backend='cd /var/www/workforce-democracy/backend && bash verify-backend-files.sh'" >> ~/.bashrc
source ~/.bashrc

# Now just run:
check-backend
```

### PM2 Cache Management

**If you see persistent errors after fixing code:**

```bash
# PM2 is loading cached version!
pm2 stop backend
pm2 flush               # Clear log files
pm2 delete backend      # Remove process entry
pm2 start server.js --name backend  # Start fresh
```

**Never use `pm2 restart` after code fixes - always stop→delete→start!**

### Emergency Rollback

```bash
# Quick rollback to last backup
cd /var/www/workforce-democracy/backend
pm2 stop backend
cp "$(ls -t ai-service-BACKUP-*.js | head -1)" ai-service.js
pm2 flush
pm2 delete backend
pm2 start server.js --name backend
pm2 logs backend --lines 30
```

### File Synchronization Protocol

**Before AI makes changes:**
1. Document current file state (checksum, line count)
2. Create timestamped backup
3. Verify with `verify-backend-files.sh`

**After AI makes changes:**
1. Test syntax: `node -c ai-service.js`
2. Verify file: `bash verify-backend-files.sh`
3. Clear PM2 cache completely
4. Check logs for clean start

**See**: `DEPLOYMENT-SAFEGUARDS.md` for comprehensive guide

---

## 🚀 Recent Fixes (v37.5.0 → v37.6.1)

### **v37.6.1: Policy Keywords Added** (Nov 8, 2025) ✅ DEPLOYED
**Problem**: SNAP and welfare queries weren't triggering pre-search because `needsCurrentInfo()` was missing policy keyword detection.

**Root Cause**: Production file at v37.6.0 was missing code that should have been added in v37.6.1.

**Solution**: Added policy keywords check to `needsCurrentInfo()` function:
```javascript
// Policy and benefits queries (SNAP, welfare, healthcare, etc.) - v37.6.1
const isPolicyQuery = messageLower.match(
    /snap|food stamp|benefit|welfare|medicaid|medicare|social security|unemployment|housing assistance|policy|cut|reduce|increase|expand|program|assistance|aid|support|subsidy/
);

return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov || isPolicyQuery;
```

**Impact**: 
- ✅ SNAP queries now trigger pre-search
- ✅ Welfare/Medicare queries now trigger pre-search  
- ✅ Policy-related queries get real-time sources

**Deployed**: November 8, 2025  
**Status**: ✅ WORKING - Backend running clean

**See**: `✅-v37.6.0-POLICY-KEYWORDS-FIXED.md` for full documentation

---

## 🚀 Recent Fixes (v37.5.0 → v37.6.0)

### **v37.5.0: Citation Fix - Phase 1 Pre-Search** (Nov 7, 2025)
**Problem**: LLM generated many citations (e.g., [1] through [15]), but backend only provided 3 sources, causing broken citations.

**Initial Solution**: Pre-search sources BEFORE calling LLM
- Added Phase 1 pre-search in `analyzeWithAI()` (lines ~1020-1060)
- Modified `buildContextualPrompt()` to accept `preFetchedSources` parameter
- Inject sources into LLM prompt with explicit count
- Return same sources given to LLM (no post-search extraction)

**Key Code Locations**:
- `backend/ai-service.js` lines 1020-1060: Phase 1 pre-search
- `backend/ai-service.js` lines 320-361: Policy keyword triggers in `needsCurrentInfo()`

**Runtime Logs**:
```
🔍 Pre-searching sources before LLM call...
📚 Found 3 sources to provide to LLM
✅ Providing 3 validated sources to LLM
```

**Result**: ✅ Pre-search working, but ❌ LLM still used [2] citation 12 times despite only 3 sources

---

### **v37.6.0: Option A - Simplified Citation System** (Nov 8, 2025)
**Problem**: Despite v37.5.0 fixes, LLM continued to ignore numbered citation limits [1], [2], [3]

**User Decision**: After extensive troubleshooting, user chose to **abandon numbered citations** in favor of natural source name citations.

**Solution**: Complete removal of [1], [2] citation numbering system
- ✅ Instruct LLM to cite by source name (e.g., "According to Truthout...")
- ✅ No numbered citations in response text
- ✅ Sources appear in collapsible menu at end (already working)
- ✅ No citation/source count matching required

**Changes** (`ai-service.js` lines ~1146-1165):
```javascript
// OPTION A: Simplified source system - NO citation numbers
if (preFetchedSources && preFetchedSources.length > 0) {
    prompt += `\nAvailable Sources (cite by name, NOT by number):\n`;
    prompt += `You have ${preFetchedSources.length} trusted sources below.\n`;
    prompt += `CRITICAL: Cite sources by NAME (e.g., "According to Truthout..." or "Common Dreams reports...")\n`;
    prompt += `FORBIDDEN: Do NOT use [1], [2], [3] citation numbers!\n`;
    prompt += `FORBIDDEN: Do NOT invent sources - only use the ones listed below.\n\n`;
    
    preFetchedSources.forEach((result, i) => {
        prompt += `Source: ${result.source || result.title}\n`;
        prompt += `    Title: ${result.title}\n`;
        prompt += `    Content: ${result.excerpt ? result.excerpt.substring(0, 400) : 'No excerpt available'}\n`;
        prompt += `\n`;
    });
    
    prompt += `REMINDER: Cite sources by their NAME, not by numbers.\n`;
    prompt += `Example: "According to Truthout, SNAP cuts affect..." NOT "SNAP cuts affect [1]..."\n\n`;
}
```

**Frontend Behavior** (v37.6.0):
- No numbered citations to convert
- Frontend logs show `Citations found: 0` (expected)
- Sources display in collapsible menu (unchanged)
- No citation/source mismatch errors

**Benefits**:
- ✅ More stable - no complex citation matching
- ✅ Better UX - no superscript interruptions
- ✅ LLM naturally good at citing by source name
- ✅ Eliminates possibility of citation/source count mismatch

---

### **Deferred Features** (Pending User Prioritization)

#### **Analytical Frameworks** (NOT YET IMPLEMENTED)
**Status**: ⏳ Deferred to focus on citation system stability

**Planned Implementation**:
1. **ECONOMIC_SOCIAL_POLICY**: SNAP, housing, wages, welfare
   - Follow causal chains: policy change → direct impact → desperation → survival crimes
   - Challenge false framings ("market alternatives" to survival needs)
   - Emphasize concrete examples over abstractions

2. **CRIMINAL_JUSTICE**: Policing, incarceration, crime policy
3. **HEALTHCARE**: Medical care, insurance, accessibility
4. **LABOR_ANALYSIS**: Worker rights, unions, workplace safety

**Banned Phrases to Add**:
- ❌ "It is essential to note that..."
- ❌ "In conclusion..."
- ❌ "Moreover..." / "Furthermore..."
- ❌ "This raises concerns..."
- ❌ "Market-based solutions" (for survival needs)

**Implementation Guide**: See `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` Section 5 for complete code examples

---

## 📁 Project Structure

```
/var/www/workforce-democracy/
│
├── Frontend (Static HTML/CSS/JS - Deployed to Netlify)
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── chat-clean.js (v37.4.5 - Citation handling)
│   │   └── [other modules]
│   └── manifest.json
│
├── Backend (Node.js Express - Running on VPS)
│   ├── server.js (Port 3001, managed by PM2)
│   ├── ai-service.js (v37.6.1 - LLM integration + frameworks)
│   ├── rss-service.js (News source aggregation)
│   ├── keyword-extraction.js (Query analysis)
│   ├── package.json
│   ├── .env (API keys - NEVER commit!)
│   └── routes/
│       ├── nonprofit-routes.js
│       ├── reps-routes.js
│       └── [other routes]
│
└── Documentation
    ├── PROJECT_MASTER_GUIDE.md (1,600+ lines - COMPREHENSIVE)
    ├── AI-HANDOVER-V37.6-COMPLETE.md (this file)
    └── [session handover docs]
```

---

## 🔑 Key Files Reference

### **backend/ai-service.js** (Current: v37.6.1)
**Purpose**: Core LLM integration with Groq (Llama 3.3 70B)

**Critical Sections**:
- **Lines 20-22**: Startup markers (v37.6.0 announcement)
- **Lines 60-214**: ANALYTICAL_FRAMEWORKS object
- **Lines 215-xxx**: SYSTEM_PROMPTS for different chat types
- **Lines 1020-1060**: Phase 1 pre-search (v37.5.0 fix)
- **Lines 1150-1180**: Pre-fetched sources injection in prompt
- **Lines 1240-1245**: `buildContextualPrompt()` with framework integration
- **Lines 1315+**: `buildContextualPrompt()` function definition

**Key Functions**:
```javascript
analyzeWithAI(query, context, chatType) // Main LLM call with pre-search
buildContextualPrompt(query, context, chatType, preFetchedSources) // Prompt builder
getAnalyticalFramework(query, chatType) // Framework selector
searchAdditionalSources(query, aiText) // Source search function
```

**Environment Variables** (in `.env`):
```
GROQ_API_KEY=xxx
GROQ_MODEL=llama-3.3-70b-versatile
```

---

### **backend/server.js**
**Purpose**: Express API server, PM2 managed

**Key Features**:
- Port 3001
- Module cache clearing (v37.5.0): `delete require.cache[require.resolve('./ai-service')]`
- CORS handling via Nginx reverse proxy
- Rate limiting
- Database connection (PostgreSQL)

**PM2 Management**:
```bash
pm2 list                    # Show running processes
pm2 restart backend         # Restart after code changes
pm2 logs backend            # View logs
pm2 stop backend            # Stop process
pm2 delete backend          # Remove from PM2
pm2 start server.js --name backend  # Fresh start
```

---

### **frontend/js/chat-clean.js** (v37.4.5)
**Purpose**: Frontend chat UI with citation handling

**Citation Mismatch Detection** (Lines ~480-510):
```javascript
// Logs mismatch between citations in text vs sources from backend
// User requirement: "If no source, don't include citation"
// Removes citations without matching sources (Option D implementation)
```

**Expected Console Logs**:
- ✅ Good: `citationCount === sources.length`
- ❌ Bad: `Text contains 15 citations, backend provided 3 sources`

---

## 🛠️ Common Tasks

### **Add a New Analytical Framework**

1. Edit `backend/ai-service.js`, find `ANALYTICAL_FRAMEWORKS` object (~line 60)
2. Add new framework:
```bash
cd /var/www/workforce-democracy/backend

cat >> /tmp/new-framework.txt << 'ENDFRAME'
    // Framework for Education Policy
    EDUCATION: `
EDUCATION POLICY ANALYSIS FRAMEWORK:

1. IDENTIFY ACCESS BARRIERS
   - Cost (tuition, fees, materials)
   - Geographic (school closures, transportation)
   - Systemic (tracking, segregation, funding inequality)

2. TRACE IMPACT PATHWAYS
   - Immediate: Student access to resources
   - Medium-term: Educational outcomes, graduation rates
   - Long-term: Economic mobility, career opportunities

3. CONNECT TO BROADER INEQUALITY
   - School funding tied to property taxes = wealth inequality
   - Student debt = lifetime economic burden
   - Private vs public school divide = class stratification
`,
ENDFRAME

# Find the closing brace of ANALYTICAL_FRAMEWORKS
LINE_NUM=$(grep -n "^};" ai-service.js | head -1 | cut -d: -f1)
sed -i "$((LINE_NUM - 1))r /tmp/new-framework.txt" ai-service.js

pm2 restart backend
```

3. Update `getAnalyticalFramework()` function to detect education queries:
```bash
# Find the function
grep -n "function getAnalyticalFramework" ai-service.js

# Add education trigger
sed -i '/Labor triggers/i\    // Education triggers\n    if (queryLower.match(/education|school|student|tuition|college|university/)) {\n        return ANALYTICAL_FRAMEWORKS.EDUCATION;\n    }\n' ai-service.js

pm2 restart backend
```

---

### **Strengthen Citation Instructions**

If LLM still ignores citation limits:

```bash
cd /var/www/workforce-democracy/backend

# Find the citation instruction section
grep -n "CRITICAL CITATION RULES" ai-service.js

# Add more explicit warnings
# Edit around line 1156-1175 using sed or cat with heredoc
```

---

### **Improve Source Relevance Filtering**

Problem: Irrelevant articles getting high scores

Solution: Add topic-specific keyword penalties

```bash
cd /var/www/workforce-democracy/backend

# The topic boost code is already in v37.6.1
# To adjust penalties, find this section:
grep -n "Topic-specific keyword boosting" ai-service.js

# Modify penalty values (currently -50 for missing SNAP mention)
sed -i 's/relevanceScore - 50/relevanceScore - 100/' ai-service.js  # Harsher penalty
```

---

### **Add Logging to Debug LLM Prompt**

```bash
cd /var/www/workforce-democracy/backend

# Find where userMessage is created
LINE_NUM=$(grep -n "const userMessage = buildContextualPrompt" ai-service.js | head -1 | cut -d: -f1)

# Add logging
sed -i "$((LINE_NUM + 1))i\\        console.log(\`📋 Full LLM Prompt:\`, userMessage);" ai-service.js

pm2 restart backend
pm2 logs backend  # Will now show full prompt
```

---

## 🐛 Troubleshooting

### **Problem: PM2 Shows Old Code Despite File Changes**

**Symptoms**:
- File changes verified with `grep`
- But logs show old behavior
- Startup markers don't appear

**Solution**:
```bash
# Nuclear option - force fresh load
cd /var/www/workforce-democracy/backend
pm2 stop backend
pm2 delete backend
pm2 cleardump
pm2 start server.js --name backend

# Check logs
pm2 logs backend --lines 50 | grep "🚀"
```

**If still failing**:
- Check for duplicate `ai-service.js` files: `find /var/www -name "ai-service.js"`
- Verify PM2 working directory: `pm2 info backend | grep "exec cwd"`
- Check Node.js module cache clearing in `server.js` line 20-22

---

### **Problem: Natural Citations Not Appearing** (v37.6.0)

**Symptoms**:
- No source names mentioned in AI response
- Sources appear in menu but not cited in text

**Diagnosis**:
```bash
pm2 logs backend --lines 200 | grep -E "📚 Found|✅ Providing"
```

**Check**:
1. Are sources being found? Should see `📚 Found X sources`
2. Are sources injected? Should see `Available Sources (cite by name, NOT by number)` in prompt
3. Is LLM following instructions?

**If LLM not citing sources by name**:
- Add more explicit examples in prompt
- Strengthen "cite by name" instruction
- Consider increasing source excerpt length (more content = more likely to cite)

---

### **Problem: AI Responses Still Generic**

**Check**:
```bash
pm2 logs backend | grep "🧠 Using analytical framework"
```

**If missing**:
- Framework selection isn't triggering
- Check `getAnalyticalFramework()` regex patterns
- Add more trigger keywords

**If present but response still generic**:
- LLM may need stronger banned phrase penalties
- Consider adding examples of good vs bad analysis in framework
- Increase temperature/top_p for more creative responses (currently 0.7/0.9)

---

### **Problem: Source Search Finds Irrelevant Articles**

**Example**: Boeing article for SNAP query

**Solution**: Topic-specific filtering (v37.6.1)
```bash
# Check if topic boost is active
grep -A 10 "Topic-specific keyword boosting" backend/ai-service.js

# Adjust penalty values or add more topic checks
```

---

## 📚 Additional Resources

### **Master Documentation**
- **PROJECT_MASTER_GUIDE.md**: 1,600+ line comprehensive guide
  - Full API reference
  - All environment variables
  - RSS feed sources
  - Database schema
  - Complete architecture diagrams

### **Session Handover Documents**
- **📖-HANDOVER-COMPLETE-SESSION-NOV-6-2025.md**: Previous session notes
- **🎯-COMPLETE-FIX-v37.4.1-HANDOVER.md**: Citation fix history
- **HANDOVER-SESSION-2025-11-06-CITATION-FIX.md**: Detailed debugging notes

### **Environment Files**
- **backend/.env**: API keys, secrets (NEVER commit!)
- **backend/.env.example**: Template for environment variables

---

## ⚙️ PM2 Quick Reference

```bash
# Status
pm2 list
pm2 info backend
pm2 monit  # Real-time monitor

# Logs
pm2 logs backend            # Tail logs
pm2 logs backend --lines 100
pm2 logs backend --err      # Only errors
pm2 flush backend           # Clear logs

# Control
pm2 restart backend
pm2 stop backend
pm2 start server.js --name backend
pm2 delete backend
pm2 save                    # Save current process list
pm2 startup                 # Auto-start on reboot

# Debug
pm2 describe backend        # Full process info
pm2 env 0                   # Environment variables
```

---

## 🎯 Testing v37.6.0 (Option A)

### **Test Natural Citation System**:
1. Open frontend chat at https://workforcedemocracy.org
2. Ask: "What happens if SNAP benefits are cut?"
3. Check frontend console (F12):
   - Should show `Citations found in text: 0` (expected - no numbered citations)
   - Should show `Sources provided by backend: 2-3` (or however many sources found)
   - Should NOT show mismatch errors
4. Check AI response text:
   - ✅ Should contain natural citations like "According to Truthout..." or "Common Dreams reports..."
   - ❌ Should NOT contain [1], [2], [3] numbered citations
5. Check sources collapsible menu:
   - ✅ Should show 2-3 clickable source links
   - ✅ Sources should be relevant to SNAP query
6. Check backend logs:
   ```bash
   pm2 logs backend --lines 0
   ```
   - Should show: `🔍 Pre-searching sources before LLM call...`
   - Should show: `📚 Found X sources to provide to LLM`
   - Should show: `✅ Providing X validated sources to LLM`

### **Expected Results (v37.6.0)**:
- ✅ Natural source name citations in response text
- ✅ 0 numbered citations (by design)
- ✅ Sources appear in collapsible menu
- ✅ No citation/source mismatch errors
- ✅ Stable and working system

### **If Analytical Frameworks Are Implemented Later**:
1. Ask: "What happens if SNAP benefits are cut?"
2. Backend logs should show: `🧠 Using analytical framework for query topic`
3. Response should:
   - ✅ Use direct cause-effect language
   - ✅ Challenge false framings
   - ✅ Provide concrete examples
   - ❌ NOT use "It is essential to note..."
   - ❌ NOT use "In conclusion..."
   - ❌ NOT mention "market-based solutions" for SNAP

---

## 🚨 Critical Notes for Next AI Assistant

1. **You CAN directly edit backend files** using sed/cat/heredoc! Don't ask user to do it manually.

2. **Always restart PM2** after backend changes:
   ```bash
   pm2 restart backend
   ```

3. **The citation system is now SIMPLIFIED (v37.6.0 Option A)**:
   - ✅ No numbered citations [1], [2], [3]
   - ✅ Natural source name citations ("According to Truthout...")
   - ✅ Sources in collapsible menu at end
   - ❌ **DO NOT** try to "fix" it back to numbered citations!
   - ❌ User specifically chose this simpler approach for stability

4. **Pre-search is working** - check logs:
   ```bash
   pm2 logs backend | grep -E "🔍 Pre-searching|📚 Found|✅ Providing"
   ```
   - Should see sources being found before LLM call
   - If missing, check `needsCurrentInfo()` function

5. **Source relevance matters** - if irrelevant articles appear:
   - Implement topic-specific filtering (deferred feature)
   - Check relevance scoring in `rss-service.js`
   - Consider stricter keyword penalties

6. **Analytical frameworks NOT YET IMPLEMENTED** - user wants deep causal analysis:
   - This is a deferred feature - ask user to prioritize
   - See `📖-AI-HANDOVER-SUMMARY-NOV-8-2025.md` Section 5 for implementation guide
   - Will eliminate generic responses like "market-based solutions" for SNAP

7. **Always backup before major changes**:
   ```bash
   cp ai-service.js ai-service-BACKUP-$(date +%Y%m%d-%H%M%S).js
   ```

8. **User values** (in priority order):
   - **Stability over complexity** (chose Option A for this reason)
   - Direct file editing via echo/sed (very handy!)
   - Deep causal analysis over generic responses
   - Natural, readable citations
   - Independent progressive journalism sources
   - Worker/people-centered perspective

9. **Ask before assuming next priority**:
   - User spent significant time on citations
   - Now that stability is achieved, ask what to work on next
   - Options: source relevance, analytical frameworks, or generic phrase removal

---

**Good luck, next AI assistant! You've got powerful tools - use them well! 🚀**
