#🔑 API KEYS QUICK REFERENCE

**Location on VPS**: `/var/www/workforce-democracy/backend/.env`

---

## ⚠️ CRITICAL (Platform Won't Work)

### **Groq API** - LLM for all chat features
```bash
GROQ_API_KEY=[REDACTED_GROQ_API_KEY]
```
✅ **Status**: ✅ ACTIVE ON VPS (verified Nov 20, 2025)  
🔗 **Get Key**: https://groq.com/  
📦 **Used By**: All AI chat assistants

---

## 🔴 HIGH PRIORITY (Bills/Reps Won't Load)

### **Congress.gov API** - Federal bills + representatives
```bash
CONGRESS_API_KEY=[REDACTED_CONGRESS_API_KEY]
```
✅ **Status**: ✅ ACTIVE ON VPS (verified Dec15, 2025)  
🔗 **Get Key**: https://api.congress.gov/sign-up/  
📦 **Used By**: Bills API (federal), Representatives (federal)

### **OpenStates API** - State bills + legislators
```bash
OPENSTATES_API_KEY=[REDACTED_OPENSTATES_API_KEY]
```
✅ **Status**: ✅ ACTIVE ON VPS (verified Dec 15, 2025)  
🔗 **Get Key**: https://openstates.org/api/register/  
📦 **Used By**: Bills API (state), Representatives (state)

---

## 🟡 MEDIUM PRIORITY (Improves Accuracy)

### **Google Civic API** - ZIP → Congressional district
```bash
GOOGLE_CIVIC_API_KEY=your_google_civic_api_key_here
```
🟡 **Status**: OPTIONAL (has FCC fallback)  
🔗 **Get Key**: https://console.cloud.google.com/apis/credentials  
📦 **Used By**: Bills API, Representatives API (ZIP lookups)

---

##🟢 LOW PRIORITY (Optional Features)

### **Guardian API** - News articles
```bash
GUARDIAN_API_KEY=[REDACTED_GUARDIAN_API_KEY]
```
✅ **Status**: ✅ ACTIVE ON VPS (verified Nov 20, 2025)  
📝 **Note**: Hardcoded fallback in `rss-service.js`: `c38c6351-3dab-4d74-a1c4-061e9479a11b`  
🔗 **Get Key**: https://open-platform.theguardian.com/access/  
📦**Used By**: RSS service

### **ProPublica API** - Voting records
```bash
PROPUBLICA_API_KEY=your_propublica_api_key_here
```
🟢**Status**: OPTIONAL (API discontinued)  
🔗 **Get Key**: ~~Discontinued~~  
📦 **Used By**: Representative voting records(legacy)

### **OpenAustralia API** - Australian parliament
```bash
OPENAUSTRALIA_API_KEY=your_openaustralia_api_key_here
```
🟢 **Status**: OPTIONAL (only for Australian users)  
🔗 **Get Key**: https://www.openaustralia.org.au/api/  
📦**Used By**: Australian Parliament module

### **Court Listener API** - Supreme Court decisions
```bash
COURT_LISTENER_API_KEY=your_court_listener_api_key_here
```
🟢 **Status**: OPTIONAL  
🔗 **Get Key**: https://www.courtlistener.com/api/  
📦 **Used By**: Supreme Court section

---

## 🧪 CHECK WHICH KEYS ARE SET

```bash
ssh root@185.193.126.13

# Quick check all keys
cat /var/www/workforce-democracy/backend/.env | grep API_KEY

# Check specific keys (shows ✅/❌ without revealing values)
grep -q "GROQ_API_KEY=" /var/www/workforce-democracy/backend/.env && echo "✅ GROQ" ||echo "❌ GROQ"
grep -q "CONGRESS_API_KEY=" /var/www/workforce-democracy/backend/.env &&echo "✅ CONGRESS" || echo "❌ CONGRESS"
grep -q "OPENSTATES_API_KEY=" /var/www/workforce-democracy/backend/.env && echo "✅ OPENSTATES" || echo "❌ OPENSTATES"
grep -q "GOOGLE_CIVIC_API_KEY=" /var/www/workforce-democracy/backend/.env && echo "✅ GOOGLE_CIVIC" || echo "❌ GOOGLE_CIVIC"
```

---

## ➕ ADD/UPDATE KEYS

```bash# SSH into VPS
ssh root@185.193.126.13

# Edit .env file
nano /var/www/workforce-democracy/backend/.env

# Add/update keys (example):
CONGRESS_API_KEY=your_actual_key_here
OPENSTATES_API_KEY=your_actual_key_here
GOOGLE_CIVIC_API_KEY=your_actual_key_here

# Save: Ctrl+O → Enter →Ctrl+X

# Restart backend
/opt/nodejs/bin/pm2 restart backend

# Verify loaded successfully
/opt/nodejs/bin/pm2 logs backend --lines 30
```

---

## 🎯 RECOMMENDED SETUP ORDER

1. ✅ **GROQ_API_KEY** - Get this first (nothing works without it)
2. ✅ **CONGRESS_API_KEY** - Federal bills/reps
3. ✅ **OPENSTATES_API_KEY** - State bills/reps4. 🟡 **GOOGLE_CIVIC_API_KEY** - Better ZIP accuracy (optional)
5. 🟢 Others asneeded

---

## 📊 IMPACT ON BILLS API (v37.12.5)

**With CONGRESS + OPENSTATES keys**:
-✅ Real federal bills from Congress.gov
- ✅ Real state bills from OpenStates
- ✅ Full Bills API functionality

**Without keys**:
- ❌ Bills API returns empty array
- ❌ Frontend falls back to sample data
- ⚠️ Users see fake bills instead of real ones

---

---

## ✅ VPS VERIFICATION SUMMARY (Dec 15, 2025)

**All keys verified via**: `sshroot@185.193.126.13 → cat /var/www/workforce-democracy/backend/.env | grep API_KEY`

| API Key| Status | Value Preview |
|---------|--------|---------------|
| GROQ_API_KEY | ✅ ACTIVE | `gsk_hmQr...YhhO` |
| CONGRESS_API_KEY | ✅ ACTIVE | `oTg6JWA...2Wks37` |
| OPENSTATES_API_KEY | ✅ ACTIVE | `7234b76...ecba94fd` |
| VOTESMART_API_KEY | ⏳ PENDING | `pending_request` |
| FEC_API_KEY | ⚠️ DEMO | `DEMO_KEY` |
| GUARDIAN_API_KEY | ✅ ACTIVE | `629f22...c1740` |
| GOOGLE_CIVIC_API_KEY | ❌ NOT SET | - |
| OPENAUSTRALIA_API_KEY | ❌ NOT SET | - |
| COURT_LISTENER_API_KEY | ❌ NOT SET | - |

**🎯 Bills API (v37.12.5) Status**: ✅ FULLY FUNCTIONAL
- ✅ GROQ_API_KEY present (LLM chat works)
- ✅ CONGRESS_API_KEY present (federal bills work)
- ✅ OPENSTATES_API_KEY present (state bills work)
- ✅ Full functionality - federal and state data available

---

##📚REFERENCE

**Primary Source of Truth**: See `🔒-CRITICAL-DEPLOYMENT-ARCHITECTURE-🔒.md` (v2.0) for complete infrastructure details.

**This document provides**: Quick API key lookup table withverification status. For full deployment workflows, file paths, and infrastructure details, always refer to the main Critical Deployment Architecture document.