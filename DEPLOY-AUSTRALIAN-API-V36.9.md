# 🇦🇺 Australian Parliament API Integration - V36.9

**Date**: January 31, 2025  
**Version**: V36.9  
**Priority**: 🟢 NEW FEATURE - Australian representative support  
**API Key**: `CcmWo6CZ9gvhFUYiPtFeNiiw` (OpenAustralia.org)

---

## 🎯 What's New

### Australian Parliamentary Data Integration

Your Workforce Democracy Project now supports **Australian MPs and Senators**!

**Data Source**: OpenAustralia.org API (non-profit, privacy-focused)  
**Coverage**: Federal Parliament (House of Representatives + Senate)  
**Privacy**: ✅ Non-profit, no user tracking, open source

---

## 📦 Files Created/Modified

### New Files (1)
```
backend/australian-parliament-api.js
  → Complete OpenAustralia.org API integration
  → MP/Senator search, voting records, Hansard search
  → Policy analysis functions
```

### Modified Files (2)
```
backend/government-apis.js
  → Import australian-parliament-api.js
  → Export Australian functions

backend/server.js
  → Detect Australian queries
  → Call OpenAustralia.org API for Australian MPs
  → Fall back to web search for context
```

---

## 🚀 Deployment Steps (VPS)

### Step 1: Upload New Files to VPS

```bash
# SSH into VPS
ssh root@workforcedemocracyproject.org

# Navigate to backend directory
cd /var/www/workforce-democracy/backend/

# Upload australian-parliament-api.js
# (Use SFTP, SCP, or paste content directly)
nano australian-parliament-api.js
# Paste content, save with Ctrl+X, Y, Enter
```

### Step 2: Update Existing Files

```bash
# Still in /var/www/workforce-democracy/backend/

# Update government-apis.js
nano government-apis.js
# Add Australian imports and exports (see changes in file)

# Update server.js
nano server.js
# Add Australian query detection (see changes in file)
```

### Step 3: Add API Key to .env

```bash
# Edit .env file
nano /var/www/workforce-democracy/backend/.env

# Add this line at the end:
OPENAUSTRALIA_API_KEY=CcmWo6CZ9gvhFUYiPtFeNiiw

# Save with Ctrl+X, Y, Enter
```

### Step 4: Restart Backend

```bash
# Restart PM2 process
/opt/nodejs/bin/pm2 restart workforce-democracy-backend

# Check logs to verify
/opt/nodejs/bin/pm2 logs workforce-democracy-backend --lines 20
```

**Expected in logs**:
```
✅ Server running on port 3001
✅ OpenAustralia API key loaded successfully
```

---

## ✅ Testing

### Test 1: Anthony Albanese (Prime Minister)

**Query**: "Tell me about Anthony Albanese"

**Expected Backend Behavior**:
1. Detects Australian query (keyword: "Albanese")
2. Calls OpenAustralia.org API
3. Gets MP info: Name, party, electorate
4. Fetches recent voting record
5. Supplements with web search
6. AI synthesizes response

**Expected Response Includes**:
- Name: Anthony Norman Albanese
- Party: Australian Labor Party
- Electorate: Grayndler (NSW)
- House: Representatives
- Recent votes and speeches
- Policy positions
- News context from web search

### Test 2: Peter Dutton (Opposition Leader)

**Query**: "What is Peter Dutton's voting record?"

**Expected**:
- MP information
- Voting history
- Policy analysis
- Citations from OpenAustralia.org

### Test 3: Adam Bandt (Greens Leader)

**Query**: "Adam Bandt climate change policy"

**Expected**:
- MP information
- Hansard search for "climate change" speeches
- Voting record on climate bills
- Policy position analysis

---

## 🔍 How It Works

### Query Detection

**Australian Keywords**:
- Names: albanese, dutton, bandt, wong, chalmers
- Geographic: australia, nsw, victoria, queensland, etc.
- Political: mp, senator, labor, liberal, greens, nationals
- Institutional: house of representatives, senate, canberra

**Example**:
```javascript
isAustralianQuery("Tell me about Anthony Albanese")
// Returns: true (contains "Albanese")

isAustralianQuery("What is the MP from Victoria doing?")
// Returns: true (contains "MP" and "Victoria")
```

### Data Flow

```
User query: "Tell me about Anthony Albanese"
       ↓
Server detects: Australian query (keyword: "Albanese")
       ↓
Call OpenAustralia.org API:
  1. searchAustralianMP("Anthony Albanese")
     → Returns: person_id, name, party, electorate
       ↓
  2. getVotingRecord(person_id, 10)
     → Returns: Recent 10 votes/speeches
       ↓
  3. searchWebForCandidate("Anthony Albanese Australia")
     → Returns: News articles, context
       ↓
AI Analysis (Groq/Llama 3.3):
  → Synthesizes all data
  → Applies V36.8.5 philosophy (independent journalism priority)
  → Generates response with citations
       ↓
Response to user:
  → Comprehensive profile
  → Voting record
  → Policy positions
  → News context
  → Citations (OpenAustralia.org + news sources)
```

---

## 📊 API Endpoints Used

### OpenAustralia.org API Calls

```javascript
// 1. Search for MP by name
GET https://www.openaustralia.org.au/api/getMPs
    ?key=CcmWo6CZ9gvhFUYiPtFeNiiw
    &output=js

// 2. Get MP details
GET https://www.openaustralia.org.au/api/getMP
    ?key=CcmWo6CZ9gvhFUYiPtFeNiiw
    &id=10001
    &output=js

// 3. Get voting record (debates)
GET https://www.openaustralia.org.au/api/getDebates
    ?key=CcmWo6CZ9gvhFUYiPtFeNiiw
    &person=10001
    &num=20
    &output=js

// 4. Search Hansard
GET https://www.openaustralia.org.au/api/getHansard
    ?key=CcmWo6CZ9gvhFUYiPtFeNiiw
    &search=climate%20change
    &person=10001
    &num=10
    &output=js
```

---

## 🐛 Troubleshooting

### Issue: "OpenAustralia API key not configured"

**Solution**: Check .env file
```bash
cat /var/www/workforce-democracy/backend/.env | grep OPENAUSTRALIA
```

Expected output:
```
OPENAUSTRALIA_API_KEY=CcmWo6CZ9gvhFUYiPtFeNiiw
```

If missing, add it and restart PM2.

### Issue: API returns empty results

**Check 1**: Verify API key is working
```bash
curl "https://www.openaustralia.org.au/api/getMPs?key=CcmWo6CZ9gvhFUYiPtFeNiiw&output=js"
```

Should return JSON with MP list.

**Check 2**: Check API usage
Visit: https://www.openaustralia.org.au/api/key  
Your usage stats should show API calls.

### Issue: Backend doesn't detect Australian queries

**Check**: Look for Australian detection in logs
```bash
/opt/nodejs/bin/pm2 logs --lines 50 | grep "🇦🇺"
```

Should see:
```
🇦🇺 Detected Australian parliamentary query
🇦🇺 Searching OpenAustralia.org for: Anthony Albanese
```

If not appearing, query might not contain Australian keywords.

---

## 📈 API Usage Monitoring

Check your OpenAustralia.org API usage:
- Visit: https://www.openaustralia.org.au/api/key
- Login with your credentials
- View usage stats: last 24 hours, last week, last month

**Rate Limit**: Generous (hundreds of calls per hour)  
**Current Usage**: 0 calls (brand new key)

---

## 🎨 Frontend Updates (Optional)

No frontend changes required - Australian queries work automatically!

**Optional Enhancement**: Add Australian flag or indicator in UI to show support

---

## 🔐 Privacy & Attribution

### Privacy Compliance
- ✅ OpenAustralia.org: Non-profit, no user tracking
- ✅ API key stored server-side only
- ✅ No user data shared with OpenAustralia.org
- ✅ Queries not logged by OpenAustralia.org

### Attribution
AI responses automatically cite OpenAustralia.org:

Example citation:
```
"According to OpenAustralia.org, Anthony Albanese has been the Member for 
Grayndler since 1996 and served as Prime Minister since May 2022..."

Sources:
1. OpenAustralia.org - Anthony Albanese Profile
   URL: https://www.openaustralia.org.au/mp/?id=10001
```

---

## 📝 Example Queries to Test

### MPs and Senators
- "Tell me about Anthony Albanese"
- "What is Peter Dutton's voting record?"
- "Who is the Greens leader?"
- "Penny Wong foreign policy"

### Policy-Specific
- "Adam Bandt climate change voting"
- "Albanese housing policy"
- "Australian MPs on immigration"

### Hansard Search
- "Who talked about climate in parliament?"
- "Recent speeches on housing crisis"
- "What did senators say about Indigenous Voice?"

---

## 🌏 Coverage Scope

### ✅ Currently Supported
- **Federal MPs** (House of Representatives)
- **Federal Senators** (Senate)
- **Voting records** (divisions)
- **Hansard** (parliamentary debates)
- **Bills** (legislation)

### ⚠️ Not Yet Supported
- **State MPs** (NSW, VIC, QLD, etc.)
- **Local councils**
- **Territorial assemblies** (ACT, NT)

**Note**: Web search fallback still works for state/local candidates

---

## ✅ Deployment Checklist

- [ ] Upload `australian-parliament-api.js` to VPS
- [ ] Update `government-apis.js` with Australian imports
- [ ] Update `server.js` with Australian query detection
- [ ] Add `OPENAUSTRALIA_API_KEY` to `.env`
- [ ] Restart PM2 backend
- [ ] Check PM2 logs for successful startup
- [ ] Test query: "Tell me about Anthony Albanese"
- [ ] Verify response includes OpenAustralia.org data
- [ ] Check API usage stats on OpenAustralia.org

---

## 🎉 Summary

| Feature | Status |
|---------|--------|
| **Australian MP search** | ✅ Ready |
| **Voting records** | ✅ Ready |
| **Hansard search** | ✅ Ready |
| **Policy analysis** | ✅ Ready |
| **Web search fallback** | ✅ Already working |
| **Privacy compliance** | ✅ Non-profit API |
| **API key** | ✅ Obtained |
| **Backend code** | ✅ Created |
| **Deployment** | 🔄 Ready to deploy |

**Status**: 🚀 Ready for VPS deployment!

---

**Once deployed, your users can ask about Australian MPs and get comprehensive, cited information just like US representatives!** 🇦🇺🎉
