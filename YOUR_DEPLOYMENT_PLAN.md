# Your Deployment Plan: Porkbun Domain + Njalla Hosting

## 🎯 Your Specific Setup

**Domain:** Porkbun (privacy-focused) ✅ You have this  
**Hosting:** Njalla (anonymous hosting) ✅ You have this  
**API Layer:** Vercel Serverless Functions (FREE)  

**Privacy Level:** 🔒🔒🔒🔒🔒 Maximum

---

## ⚡ Quick Summary

### The Problem
- Njalla = Static hosting only (no backend)
- Government APIs = Need backend to proxy requests
- Your project = Needs both privacy AND real data

### The Solution: Hybrid Approach

```
Your Domain (Porkbun)
        ↓
Njalla Hosting (Static Files - Privacy Protected)
        ↓ [calls API via JavaScript]
Vercel Functions (Just API Layer - FREE)
        ↓
Government APIs (ProPublica, Congress.gov)
```

**Result:** Privacy-first frontend + Free API backend = Perfect! ✅

---

## 📋 Your 2-Hour Deployment Plan

### Step 1: Njalla Setup (30 minutes)

**What to do:**
1. Log into Njalla dashboard
2. Add your Porkbun domain to Njalla
3. Update nameservers at Porkbun:
   ```
   ns1.njal.la
   ns2.njal.la
   ns3.njal.la
   ```
4. Enable hosting in Njalla
5. Get FTP credentials
6. Upload all your files via FTP:
   - index.html
   - css/ folder
   - js/ folder
   - All other files

**Test:** Visit your domain - should load your site

---

### Step 2: Create API Project (15 minutes)

**On your computer:**

```bash
# Create new folder
mkdir workforce-api
cd workforce-api

# Create structure
mkdir api
```

**Create these 4 files:**

**1. `package.json`:**
```json
{
  "name": "workforce-democracy-api",
  "version": "1.0.0",
  "description": "API functions for Workforce Democracy Project"
}
```

**2. `vercel.json`:**
```json
{
  "version": 2,
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://YOUR-ACTUAL-DOMAIN.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        }
      ]
    }
  ]
}
```
⚠️ **REPLACE** `YOUR-ACTUAL-DOMAIN.com` with your real Porkbun domain!

**3. `api/search-representatives.js`** - Copy from NJALLA_DEPLOYMENT_GUIDE.md

**4. `api/get-voting-record.js`** - Copy from NJALLA_DEPLOYMENT_GUIDE.md

---

### Step 3: Deploy API to Vercel (15 minutes)

```bash
# In workforce-api folder
git init
git add .
git commit -m "API functions"

# Create GitHub repo
# (Go to github.com, create new repo: workforce-democracy-api)

git remote add origin https://github.com/YOUR-USERNAME/workforce-democracy-api.git
git push -u origin main
```

**Then:**
1. Go to vercel.com
2. Click "Import Project"
3. Select your `workforce-democracy-api` repo
4. Click "Deploy"
5. Wait 60 seconds
6. **Copy your Vercel URL:** `https://workforce-democracy-api.vercel.app`

---

### Step 4: Add API Keys to Vercel (5 minutes)

**Get API keys first:**
- ProPublica: https://www.propublica.org/datastore/api/propublica-congress-api
- Congress.gov: https://api.congress.gov/sign-up/

**In Vercel dashboard:**
1. Go to your API project
2. Settings → Environment Variables
3. Add:
   - `PROPUBLICA_API_KEY` = [your key]
   - `CONGRESS_API_KEY` = [your key]
4. Click Save

---

### Step 5: Update Frontend (20 minutes)

**On your computer, edit `js/civic.js`:**

Add at the very top:
```javascript
// Your Vercel API endpoint
const API_BASE_URL = 'https://workforce-democracy-api.vercel.app/api';
```

**Replace the `performCivicSearch` function:**
```javascript
async function performCivicSearch(country, query) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/search-representatives?query=${encodeURIComponent(query)}&country=${country}`
        );
        
        if (!response.ok) {
            throw new Error('API failed');
        }
        
        const data = await response.json();
        
        if (data.success && data.representatives) {
            // Hide demo banner
            const demoBanner = document.querySelector('.demo-notice');
            if (demoBanner) demoBanner.style.display = 'none';
            
            return data;
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return generateSampleCivicData(country, query);
    }
}
```

**Save the file.**

---

### Step 6: Upload Updated File to Njalla (10 minutes)

**Using FTP/SFTP:**
1. Connect to your Njalla FTP
2. Navigate to `js/` folder
3. Upload the updated `civic.js`
4. Overwrite the old file

**Done!**

---

### Step 7: Test Everything (10 minutes)

1. **Visit your domain:** https://your-domain.com
2. **Go to Civic Transparency section**
3. **Select "United States"**
4. **Search for "Cruz"**

**Expected Result:**
- ✅ Real Ted Cruz photo appears
- ✅ Real Texas, Republican Party
- ✅ Real voting data
- ✅ Demo banner disappears

**Check browser console (F12):**
- ✅ Should see API call to Vercel
- ✅ Should see `Response: 200 OK`
- ✅ NO CORS errors

---

## ⏱️ Time Breakdown

| Task | Time |
|------|------|
| Njalla setup + file upload | 30 min |
| Create API project files | 15 min |
| Deploy to Vercel | 15 min |
| Add API keys | 5 min |
| Update frontend code | 20 min |
| Re-upload to Njalla | 10 min |
| Testing | 10 min |
| **TOTAL** | **~2 hours** |

---

## 💰 Your Costs

**Domain (Porkbun):**
- Already paid ✅
- ~$10-15/year

**Hosting (Njalla):**
- Your current plan: €?/year
- Typical: €15/year (~$16)

**API Backend (Vercel):**
- **FREE** ✅
- 100GB bandwidth/month
- Unlimited serverless functions

**Government APIs:**
- **FREE** ✅

**Total Ongoing:** ~$26-31/year (just domain + Njalla)

---

## 🔒 Privacy Benefits

**Your Setup = Maximum Privacy:**

✅ **Porkbun:** Privacy-focused registrar, WHOIS protection  
✅ **Njalla:** Anonymous hosting, no personal data required  
✅ **Vercel:** No tracking, secure API key storage  
✅ **Project:** Zero tracking, client-side encryption  

**Perfect alignment with your "privacy-first" values!**

---

## 🆘 Quick Troubleshooting

### "Can't connect to Njalla FTP"
→ Check credentials, try SFTP (port 22), use passive mode

### "CORS error when calling API"
→ Check `vercel.json` has correct domain with `https://`

### "API returns 401/403"
→ Check API keys in Vercel environment variables

### "DNS not resolving"
→ Wait up to 48 hours, check nameservers at Porkbun

### "Ted Cruz shows demo data"
→ Check console for errors, verify API_BASE_URL is correct

---

## ✅ Success Checklist

### Njalla
- [ ] Domain added to Njalla
- [ ] Nameservers updated at Porkbun
- [ ] Hosting enabled
- [ ] Files uploaded via FTP
- [ ] Site accessible at your domain

### Vercel
- [ ] API project created
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] API endpoints tested
- [ ] CORS configured correctly

### Integration
- [ ] `js/civic.js` updated with API_BASE_URL
- [ ] Updated file uploaded to Njalla
- [ ] Search for "Cruz" shows real data
- [ ] No CORS errors in console

---

## 📁 Files You Need

### On Njalla (Static Files):
```
your-domain.com/
├── index.html
├── css/main.css
├── js/
│   ├── civic.js (UPDATED with API calls)
│   ├── jobs.js
│   ├── main.js
│   └── (all other JS files)
├── favicon.svg
├── manifest.json
└── (all other static files)
```

### On Vercel (API Only):
```
workforce-democracy-api/
├── api/
│   ├── search-representatives.js
│   └── get-voting-record.js
├── package.json
└── vercel.json
```

---

## 🎯 What Each Part Does

**Njalla:**
- Hosts your HTML/CSS/JavaScript
- Users download files from here
- Privacy-protected, anonymous
- No backend, just static files

**Vercel:**
- Runs API functions when frontend calls them
- Hides API keys securely
- Proxies requests to government APIs
- Returns data to frontend

**User's Browser:**
- Loads site from Njalla
- Runs JavaScript locally
- Calls Vercel API when needed
- Displays real government data

---

## 🚀 Start Now

1. **Read:** NJALLA_DEPLOYMENT_GUIDE.md (full details)
2. **Begin:** Step 1 - Njalla setup
3. **Continue:** Steps 2-7 in order
4. **Test:** Search for "Ted Cruz"
5. **Celebrate:** You have real data! 🎉

---

## 📞 Need Help?

**Detailed Guide:** NJALLA_DEPLOYMENT_GUIDE.md (28KB, everything explained)

**Stuck?**
- Njalla support: support@njal.la
- Vercel docs: vercel.com/docs
- Check browser console for errors

---

## 🎉 End Goal

**When you're done:**
- ✅ Site hosted on privacy-focused Njalla
- ✅ Your Porkbun domain working
- ✅ Real government data from APIs
- ✅ No tracking, maximum privacy
- ✅ Total cost: ~$2.50/month
- ✅ Ted Cruz search shows real photo and data

**Your privacy-first deployment is ready!** 🔒🚀

---

**TIME TO COMPLETE:** 2 hours  
**DIFFICULTY:** Medium  
**COST:** ~$2.50/month  
**PRIVACY:** Maximum  
**RESULT:** Real government data, privacy-protected hosting

**Let's do this!** Open NJALLA_DEPLOYMENT_GUIDE.md for detailed step-by-step instructions.
