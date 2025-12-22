# 🚀 Deploy V36.6.1 - Without ProPublica (For Now)

**Date**: January 29, 2025  
**Status**: Ready to deploy with 2 API keys (add ProPublica later)

---

## ✅ What You Have

1. **Groq API Key**: `[REDACTED]`
2. **Congress.gov API Key**: `[REDACTED_CONGRESS_API_KEY]`
3. **Court Listener API Key**: Get this now (5 minutes) ⬇️

---

## STEP 1: Get Court Listener API Key (5 minutes)

### A. Go to Court Listener
```
https://www.courtlistener.com/
```

### B. Sign Up
1. Click "Sign Up" (top right)
2. Fill out form:
   - Username: [your choice]
   - Email: [your email]
   - Password: [your choice]
3. Click "Sign Up"

### C. Confirm Email
- Check your inbox
- Click confirmation link
- You'll be logged in

### D. Get Your Token
**Method 1** - Direct page:
```
https://www.courtlistener.com/api/rest-info/
```
Your token will be shown on this page!

**Method 2** - Profile:
1. Click your username (top right)
2. Click "Profile"
3. Find "API Token" section
4. Copy the token

### E. Write It Down
Court Listener Token: `____________________________________`

---

## STEP 2: Create .env File

On your local computer, create this file:

**File name**: `.env` (in your `backend/` folder)

**Content** (copy and paste, then fill in):
```bash
# Database (WHAT'S YOUR POSTGRESQL PASSWORD?)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=workforce_democracy
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE
DB_PORT=5432

# Groq API
GROQ_API_KEY=[YOUR_GROQ_API_KEY_HERE]
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.1-70b-versatile

# Government APIs
CONGRESS_API_KEY=[REDACTED_CONGRESS_API_KEY]
PROPUBLICA_API_KEY=OPTIONAL_FOR_NOW
COURT_LISTENER_API_KEY=PASTE_YOUR_COURTLISTENER_TOKEN_HERE

# Server
PORT=3001
NODE_ENV=production
```

**Fill in these two**:
- `DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE`
- `COURT_LISTENER_API_KEY=PASTE_YOUR_COURTLISTENER_TOKEN_HERE`

**Save the file** in `backend/.env`

---

## STEP 3: Upload Files to VPS

### A. Open Terminal (on your computer)

### B. Navigate to your project
```bash
cd /path/to/your/workforce-democracy-project
```

### C. Upload .env file
```bash
scp backend/.env root@185.193.126.13:/var/www/workforce-democracy/backend/
```

### D. Upload updated backend files
```bash
scp backend/server.js root@185.193.126.13:/var/www/workforce-democracy/backend/

scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/

scp backend/government-apis.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

---

## STEP 4: SSH and Install Dependencies

### A. Connect to VPS
```bash
ssh root@185.193.126.13
```

### B. Navigate to backend
```bash
cd /var/www/workforce-democracy/backend
```

### C. Install axios
```bash
npm install axios
```

### D. Verify files
```bash
ls -lh
```

Look for:
- ✅ `.env`
- ✅ `server.js`
- ✅ `ai-service.js`
- ✅ `government-apis.js`

### E. Check .env has your keys
```bash
cat .env | grep API_KEY
```

Should show:
- `GROQ_API_KEY=gsk_...`
- `CONGRESS_API_KEY=ktub...`
- `COURT_LISTENER_API_KEY=...` (your token)
- `PROPUBLICA_API_KEY=OPTIONAL_FOR_NOW`

---

## STEP 5: Restart Backend

### A. Restart PM2
```bash
pm2 restart workforce-backend
```

### B. Check logs
```bash
pm2 logs workforce-backend --lines 50
```

**Look for**:
- ✅ "Connected to PostgreSQL database"
- ✅ "Server listening on port 3001"
- ✅ "ProPublica API key not configured - skipping" (this is OK!)

**Press Ctrl+C** to exit logs

---

## STEP 6: Test Backend

### A. Health check
```bash
curl https://api.workforcedemocracyproject.org/health
```

**Expected**:
```json
{"status":"ok","timestamp":"2025-01-29T..."}
```

### B. Test Supreme Court chat
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{"chat_type":"supreme_court","user_id":"test","query":"What is Roe v Wade?","context":{}}'
```

**Wait 2-5 seconds...**

**Check the response**:
- ✅ `"success": true`
- ✅ `"response":` contains detailed analysis (NOT placeholder!)
- ✅ `"sources":` array with Court Listener links
- ❌ NOT: "I'm currently operating in local knowledge base mode..."

### C. Test Bills chat
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{"chat_type":"bills","user_id":"test","query":"What is HR 1?","context":{}}'
```

**Expected**: Real AI analysis with Congress.gov data

---

## STEP 7: Deploy Frontend to Netlify

### Option A: Netlify UI
1. Go to: https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag and drop your project folder
4. Wait 2-3 minutes
5. Note the URL

### Option B: Netlify CLI
```bash
cd /path/to/your/workforce-democracy-project
netlify login
netlify deploy --prod
```

---

## STEP 8: Test Live Site

### A. Open your Netlify URL

### B. Test Supreme Court Chat
1. Navigate to Supreme Court section
2. Open chat widget
3. Ask: "What is Roe v Wade?"
4. ✅ Should get detailed AI response
5. ✅ Should see source citations
6. ✅ Should NOT see placeholder text

### C. Test Bills Chat
1. Navigate to Bills section
2. Open chat widget
3. Ask: "What is HR 1?"
4. ✅ Should get bill analysis

---

## ✅ What Works Without ProPublica

**WORKING**:
- ✅ Supreme Court decisions (Court Listener)
- ✅ Bills and legislation (Congress.gov)
- ✅ General representative info (from user's location)
- ✅ AI analysis with your philosophy
- ✅ Source citations
- ✅ Caching system

**LIMITED WITHOUT PROPUBLICA**:
- ⚠️ Representative voting records (less detailed)
- ⚠️ Representative party alignment percentages
- ⚠️ Missed votes statistics

**But 90% of functionality works!**

---

## 🔜 Adding ProPublica Later

When you get the ProPublica API key:

### Step 1: Update .env on VPS
```bash
ssh root@185.193.126.13
nano /var/www/workforce-democracy/backend/.env
```

Find this line:
```bash
PROPUBLICA_API_KEY=OPTIONAL_FOR_NOW
```

Replace with:
```bash
PROPUBLICA_API_KEY=your_actual_key
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 2: Restart backend
```bash
pm2 restart workforce-backend
```

### Step 3: Test it
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{"chat_type":"representatives","user_id":"test","query":"Who is Nancy Pelosi?","context":{}}'
```

Should now include voting records!

---

## 📧 Getting ProPublica Key

**Send email to**: `api@propublica.org`

**Subject**: `API Key Request - Workforce Democracy Project`

**Body**:
```
Hello ProPublica Team,

I am building the Workforce Democracy Project - an educational civic 
engagement platform to help citizens understand their representatives 
and voting records.

I would like to request an API key for the ProPublica Congress API.

Project: Workforce Democracy Project
Type: Educational, non-partisan civic engagement
URL: [your Netlify URL]

Thank you!
[Your Name]
```

**Response time**: Usually 1-2 business days

---

## 📊 Current Status

✅ **Code ready for deployment**  
✅ **2 of 3 government APIs configured**  
✅ **90% functionality available**  
⏳ **ProPublica to be added later**  

---

## 🎉 CHECKLIST

```
□ Got Court Listener API token
□ Created .env file with all keys
□ Uploaded .env to VPS
□ Uploaded server.js to VPS
□ Uploaded ai-service.js to VPS
□ Uploaded government-apis.js to VPS
□ Installed axios on VPS
□ Restarted PM2
□ Health check passed
□ AI query returned real response (not placeholder)
□ Deployed frontend to Netlify
□ Tested Supreme Court chat on live site
□ Tested Bills chat on live site
□ Sent email to ProPublica for API key
```

---

**Ready to proceed?** Get that Court Listener token and let's deploy! 🚀

**Questions?** Let me know if you need help with any step!
