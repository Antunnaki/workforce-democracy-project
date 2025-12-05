# 🔑 Complete API Keys Reference - Workforce Democracy Project

**Date:** November 4, 2025  
**Location:** `/var/www/workforce-democracy/.env` on VPS (185.193.126.13)

---

## Current API Status

Based on your PM2 logs, here's what's configured and what's missing:

### ✅ Currently Configured (Working)

| API | Status | Purpose |
|-----|--------|---------|
| **GROQ API** | ✅ Working | AI/LLM queries (Llama 3.3) |
| **Database** | ✅ Working | PostgreSQL connection |
| **FCC Area API** | ✅ Working | ZIP → Congressional District (no key needed) |

### ⚠️ Not Configured (Optional Features Limited)

| API | Status | Impact |
|-----|--------|--------|
| **OpenStates API** | ❌ Missing | State legislator data limited |
| **VoteSmart API** | ❌ Missing | Some voting record features limited |
| **Congress.gov API** | ⚠️ Unknown | Federal bills/legislation (may be configured) |
| **ProPublica API** | 🚫 Discontinued | No longer needed (sunset Nov 2024) |

---

## All APIs Your Backend Uses

### 1. GROQ API (AI/LLM) ✅ WORKING

**Purpose:** Powers all chat assistants with AI responses  
**Status:** ✅ Configured and working  
**Used in:** `backend/ai-service.js`

**Environment Variables:**
```bash
GROQ_API_KEY=gsk_... (your key)
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile
```

**How to check if working:**
```bash
# On VPS
cd /var/www/workforce-democracy
grep GROQ_API_KEY .env
```

---

### 2. OpenStates API ⚠️ NOT CONFIGURED

**Purpose:** State legislators, state bills, state voting records  
**Status:** ❌ Not configured (warning in PM2 logs)  
**Used in:** `backend/us-representatives.js`

**Environment Variable Needed:**
```bash
OPENSTATES_API_KEY=your_openstates_key_here
```

**Where to get key:**
- Website: https://openstates.org/accounts/profile/
- Sign up for free
- Get API key from profile page

**How to add:**
```bash
# SSH to VPS
ssh root@185.193.126.13

# Edit .env file
nano /var/www/workforce-democracy/.env

# Add this line:
OPENSTATES_API_KEY=your_actual_key_here

# Save (Ctrl+O, Enter, Ctrl+X)

# Restart backend
pm2 restart backend
```

---

### 3. VoteSmart API ⚠️ NOT CONFIGURED

**Purpose:** Politician voting records, ratings, issue positions  
**Status:** ❌ Not configured (warning in PM2 logs)  
**Used in:** Referenced in government-apis.js

**Environment Variable Needed:**
```bash
VOTESMART_API_KEY=your_votesmart_key_here
```

**Where to get key:**
- Website: https://votesmart.org/share/api
- Request free API key
- Free for non-commercial/educational use

**How to add:**
```bash
# Same process as OpenStates above
nano /var/www/workforce-democracy/.env
# Add: VOTESMART_API_KEY=your_key
# Save, restart PM2
```

---

### 4. Congress.gov API (Federal Legislature) 🤔 UNKNOWN STATUS

**Purpose:** Federal bills, legislation, congressional votes  
**Status:** ⚠️ May be configured (no warning in logs)  
**Used in:** `backend/government-apis.js`, `backend/us-representatives.js`

**Environment Variable:**
```bash
CONGRESS_API_KEY=your_congress_key_here
```

**Where to get key:**
- Website: https://api.congress.gov/sign-up/
- Free API key
- Official US government API

**Check if configured:**
```bash
# On VPS
grep CONGRESS_API_KEY /var/www/workforce-democracy/.env
```

---

### 5. ProPublica Congress API 🚫 DISCONTINUED

**Purpose:** Representative voting records (OLD)  
**Status:** 🚫 API sunset November 2024 - NO LONGER AVAILABLE  
**Used in:** `backend/government-apis.js` (legacy code)

**Action:** Remove references to this API (it's dead)

---

### 6. Court Listener API (Supreme Court) 📝 OPTIONAL

**Purpose:** Supreme Court decisions and case law  
**Status:** ❌ Not configured (optional)  
**Used in:** `backend/government-apis.js`

**Environment Variable:**
```bash
COURT_LISTENER_API_KEY=your_courtlistener_key_here
```

**Where to get key:**
- Website: https://www.courtlistener.com/api/
- Create account and get API key
- Free for moderate use

---

### 7. OpenAustralia API (Australian Parliament) 🇦🇺 OPTIONAL

**Purpose:** Australian parliamentary data  
**Status:** ❌ Not configured (only needed for AU users)  
**Used in:** `backend/australian-parliament-api.js`

**Environment Variable:**
```bash
OPENAUSTRALIA_API_KEY=your_openaustralia_key_here
```

**Where to get key:**
- Website: https://www.openaustralia.org.au/api/
- Free API key for developers

---

### 8. OpenSecrets API (Campaign Finance) 💰 MENTIONED BUT NOT IMPLEMENTED

**Purpose:** Campaign finance data, AIPAC tracking  
**Status:** ❌ Not implemented yet (mentioned in docs)  
**Mentioned in:** `backend/TRACKAIPAC-INTEGRATION.md`

**Environment Variable (if implemented):**
```bash
OPENSECRETS_API_KEY=your_opensecrets_key_here
```

**Where to get key:**
- Website: https://www.opensecrets.org/api/admin/index.php
- Request API key (may require approval)

---

### 9. FCC Area API (ZIP Code Lookup) ✅ NO KEY NEEDED

**Purpose:** Convert ZIP codes to Congressional Districts  
**Status:** ✅ Working (no API key required)  
**Used in:** `backend/us-representatives.js`

**API Endpoint:**
```
https://geo.fcc.gov/api/census
```

**No configuration needed!**

---

## How to Check Your Current .env File

**SSH to VPS:**
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy
cat .env
```

**Look for these lines:**
```bash
GROQ_API_KEY=...         # Should be configured
CONGRESS_API_KEY=...     # Check if configured
OPENSTATES_API_KEY=...   # Probably missing
VOTESMART_API_KEY=...    # Probably missing
```

---

## Recommended Actions

### Priority 1: Add Missing APIs (Critical for Full Functionality)

**1. OpenStates API** - Get state legislator data
```bash
# Sign up: https://openstates.org/accounts/profile/
# Get API key
# Add to .env: OPENSTATES_API_KEY=your_key
```

**2. Congress.gov API** - Get federal bills/legislation
```bash
# Sign up: https://api.congress.gov/sign-up/
# Get API key
# Add to .env: CONGRESS_API_KEY=your_key
```

### Priority 2: Add Optional APIs (Enhanced Features)

**3. VoteSmart API** - Better voting records
```bash
# Request: https://votesmart.org/share/api
# Add to .env: VOTESMART_API_KEY=your_key
```

**4. Court Listener API** - Supreme Court data
```bash
# Sign up: https://www.courtlistener.com/api/
# Add to .env: COURT_LISTENER_API_KEY=your_key
```

---

## Step-by-Step: Add Missing API Keys

### Step 1: Get the API Keys

Visit these websites and sign up:
1. **OpenStates:** https://openstates.org/accounts/profile/
2. **Congress.gov:** https://api.congress.gov/sign-up/
3. **VoteSmart:** https://votesmart.org/share/api

### Step 2: SSH to VPS

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy
```

### Step 3: Edit .env File

```bash
nano .env
```

### Step 4: Add API Keys

**Add these lines (or update if they exist):**

```bash
# OpenStates API (State Legislators)
OPENSTATES_API_KEY=your_actual_openstates_key_here

# Congress.gov API (Federal Bills)
CONGRESS_API_KEY=your_actual_congress_key_here

# VoteSmart API (Voting Records)
VOTESMART_API_KEY=your_actual_votesmart_key_here

# Court Listener API (Supreme Court - optional)
COURT_LISTENER_API_KEY=your_actual_courtlistener_key_here
```

### Step 5: Save and Restart

```bash
# Save: Ctrl+O, Enter, Ctrl+X

# Restart backend
pm2 restart backend

# Check logs
pm2 logs backend --lines 20
```

**You should NO LONGER see the warnings:**
```
⚠️ OpenStates API key not configured
⚠️ VoteSmart API key not configured
```

---

## Quick Copy-Paste Template for .env

**Copy this and fill in your actual keys:**

```bash
# =============================================================================
# WORKFORCE DEMOCRACY PROJECT - API KEYS
# =============================================================================

# AI/LLM (REQUIRED)
GROQ_API_KEY=gsk_your_actual_groq_key_here
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile

# Government Data APIs (RECOMMENDED)
CONGRESS_API_KEY=your_actual_congress_gov_key_here
OPENSTATES_API_KEY=your_actual_openstates_key_here
VOTESMART_API_KEY=your_actual_votesmart_key_here

# Supreme Court (OPTIONAL)
COURT_LISTENER_API_KEY=your_actual_courtlistener_key_here

# Australian Parliament (OPTIONAL - only if serving AU users)
OPENAUSTRALIA_API_KEY=your_actual_openaustralia_key_here

# Campaign Finance (FUTURE - not implemented yet)
OPENSECRETS_API_KEY=your_actual_opensecrets_key_here
```

---

## How to Verify APIs are Working

### Test 1: Check .env File
```bash
ssh root@185.193.126.13
grep -E "API_KEY|GROQ" /var/www/workforce-democracy/.env
```

### Test 2: Check PM2 Logs
```bash
pm2 logs backend --lines 30
```

**Look for:**
- ❌ No more "API key not configured" warnings
- ✅ "Server running on port 3001"
- ✅ "Connected to PostgreSQL database"

### Test 3: Test API Endpoints
```bash
# Test representative lookup (uses Congress.gov + OpenStates)
curl http://localhost:3001/api/representatives/lookup?zip=10001

# Test bill lookup (uses Congress.gov)
curl http://localhost:3001/api/bills/HR1234

# Test AI chat (uses Groq)
curl http://localhost:3001/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Tell me about the Senate","chatType":"general"}'
```

---

## Summary

**Currently Working:**
- ✅ GROQ API (AI/LLM)
- ✅ PostgreSQL Database
- ✅ FCC Area API (no key needed)

**Need to Add:**
- ⚠️ OpenStates API (state legislators)
- ⚠️ Congress.gov API (federal bills)
- ⚠️ VoteSmart API (voting records)

**Optional:**
- 📝 Court Listener API (Supreme Court)
- 🇦🇺 OpenAustralia API (Australian users)
- 💰 OpenSecrets API (future feature)

**Deprecated:**
- 🚫 ProPublica API (service discontinued Nov 2024)

---

## Next Steps

1. **Sign up for missing APIs** (OpenStates, Congress.gov, VoteSmart)
2. **Add keys to .env file** on VPS
3. **Restart backend** with `pm2 restart backend`
4. **Verify** no more warnings in logs
5. **Test** API endpoints to confirm working

Let me know which APIs you want to prioritize and I'll help you get them configured! 🚀
