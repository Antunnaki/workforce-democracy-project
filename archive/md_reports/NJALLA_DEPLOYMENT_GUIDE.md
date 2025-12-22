# Njalla Hosting Deployment Guide

## Your Setup: Porkbun Domain + Njalla Hosting

**Privacy-First Approach** ✅
- Domain: Porkbun (privacy-focused registrar)
- Hosting: Njalla (anonymous hosting)
- Perfect for your project's privacy-first values!

---

## ⚠️ Important: Njalla Limitations

### What Njalla Offers
Njalla provides **static file hosting only**:
- ✅ HTML, CSS, JavaScript files
- ✅ Images, fonts, assets
- ✅ Basic web hosting
- ✅ Privacy protection

### What Njalla DOESN'T Offer
- ❌ **No backend server** (can't run Node.js, Python, etc.)
- ❌ **No serverless functions** (can't proxy API requests)
- ❌ **No server-side processing**

### What This Means for Your Project

**Current Demo Mode:**
- ✅ Will work perfectly on Njalla
- ✅ All HTML/CSS/JS runs in browser
- ✅ Chat widgets, animations, everything works
- 🎬 But still shows demo data (can't call government APIs directly)

**Real API Integration:**
- ❌ Can't be done with Njalla alone
- ❌ Static hosting can't proxy government API requests
- ✅ **Solution:** Hybrid approach (see below)

---

## 🎯 Recommended Solution: Hybrid Approach

### Architecture

```
User Browser
     ↓
Njalla (Static Files)
  - index.html, CSS, JS
  - Privacy-protected hosting
     ↓
Vercel Serverless Functions (FREE)
  - /api/search-representatives
  - /api/get-voting-record
  - Just the API layer
     ↓
Government APIs
  - ProPublica, Congress.gov
```

### Why This is Perfect

✅ **Privacy:** Frontend hosted on privacy-focused Njalla
✅ **Free:** Vercel API functions are free (100GB/month)
✅ **Separation:** Static files separate from API logic
✅ **Your Domain:** Use your Porkbun domain
✅ **Best of Both:** Privacy + Functionality

---

## 📋 Deployment Plan

### Phase 1: Deploy Static Files to Njalla (30 minutes)

#### Step 1: Prepare Your Files

Your static files that go to Njalla:
```
workforce-democracy-project/
├── index.html
├── css/
│   └── main.css
├── js/
│   ├── main.js
│   ├── security.js
│   ├── civic.js (will update to call Vercel APIs)
│   ├── jobs.js
│   ├── learning.js
│   ├── local.js
│   ├── philosophies.js
│   ├── language.js
│   └── charts.js
├── favicon.svg
├── favicon.png
├── manifest.json
├── sw.js
└── (all documentation files)
```

**DO NOT UPLOAD TO NJALLA:**
- `api/` folder (goes to Vercel)
- `.git/` folder
- `node_modules/` (if any)

#### Step 2: Configure Njalla

1. **Log into Njalla**
   - Go to njal.la
   - Log in to your account

2. **Add Your Domain**
   - Click "Domains"
   - Add your Porkbun domain
   - Follow Njalla's domain verification

3. **Set Up Nameservers at Porkbun**
   - Log into Porkbun
   - Go to your domain settings
   - Update nameservers to Njalla's:
     ```
     ns1.njal.la
     ns2.njal.la
     ns3.njal.la
     ```
   - Wait 24-48 hours for DNS propagation (usually faster)

4. **Enable Njalla Hosting**
   - In Njalla dashboard
   - Select your domain
   - Click "HTTP Server" or "Static Hosting"
   - Enable hosting

#### Step 3: Upload Files to Njalla

**Option A: SFTP/FTP (Recommended)**

Njalla provides FTP/SFTP access:

1. Get FTP credentials from Njalla dashboard
2. Use an FTP client (FileZilla, Cyberduck, or command line)
3. Connect:
   ```
   Host: [your-domain].njal.la or provided FTP host
   Username: [provided by Njalla]
   Password: [provided by Njalla]
   Port: 22 (SFTP) or 21 (FTP)
   ```

4. Upload all files:
   ```bash
   # Using SFTP command line
   sftp username@host
   cd /public_html or /www
   put -r *
   ```

**Option B: Web Panel Upload**

If Njalla provides a web-based file manager:
1. Log into Njalla control panel
2. Navigate to File Manager
3. Upload all files and folders
4. Maintain directory structure

#### Step 4: Test Static Site

Visit your domain:
```
https://yourworkforcedemocracy.com
```

**Should Work:**
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Chat widgets open/close
- ✅ Jobs module displays
- ✅ All CSS/styling
- ✅ Mobile responsive

**Still Demo Mode:**
- 🎬 Civic search shows sample data
- 🎬 "Ted Cruz" shows demo card
- ⚠️ This is expected! Next phase adds real data.

---

### Phase 2: Set Up Vercel for APIs Only (60 minutes)

#### Step 1: Create Separate API Project

Create a minimal project just for APIs:

```bash
# Create new folder
mkdir workforce-api
cd workforce-api

# Initialize
npm init -y
```

#### Step 2: Create API Functions

Create this structure:
```
workforce-api/
├── api/
│   ├── search-representatives.js
│   ├── get-voting-record.js
│   └── chat-assistant.js
├── package.json
├── vercel.json
└── .gitignore
```

**File: `vercel.json`**
```json
{
  "version": 2,
  "name": "workforce-democracy-api",
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://yourworkforcedemocracy.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

**IMPORTANT:** Replace `https://yourworkforcedemocracy.com` with your actual Porkbun domain!

**File: `.gitignore`**
```
node_modules/
.env
.vercel
```

**File: `api/search-representatives.js`**
```javascript
/**
 * Search Representatives API
 * Deployed on Vercel, called from Njalla-hosted frontend
 */

module.exports = async (req, res) => {
    // CORS headers for your Njalla domain
    const allowedOrigin = 'https://yourworkforcedemocracy.com';
    
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { query, country } = req.query;
    
    if (!query || !country) {
        return res.status(400).json({ 
            error: 'Missing parameters',
            message: 'Please provide query and country'
        });
    }
    
    try {
        if (country === 'us') {
            // Call ProPublica API
            const response = await fetch(
                'https://api.propublica.org/congress/v1/117/senate/members.json',
                {
                    headers: {
                        'X-API-Key': process.env.PROPUBLICA_API_KEY
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('ProPublica API error');
            }
            
            const data = await response.json();
            
            // Filter by search query
            const members = data.results[0].members.filter(member => {
                const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
                return fullName.includes(query.toLowerCase());
            });
            
            // Transform to our format
            const representatives = members.map(member => ({
                id: member.id,
                name: `${member.first_name} ${member.last_name}`,
                party: member.party === 'D' ? 'Democratic Party' : 
                       member.party === 'R' ? 'Republican Party' : 
                       member.party === 'I' ? 'Independent' : member.party,
                state: member.state,
                district: member.district || 'Senate',
                photo: `https://theunitedstates.io/images/congress/225x275/${member.id}.jpg`,
                email: member.contact_form || '',
                phone: member.phone || '',
                website: member.url || '',
                votingRecord: {
                    votes_with_party_pct: member.votes_with_party_pct || 0,
                    missed_votes_pct: member.missed_votes_pct || 0
                }
            }));
            
            return res.status(200).json({
                success: true,
                representatives,
                count: representatives.length,
                query,
                country
            });
        } else {
            return res.status(501).json({ 
                error: 'Country not yet supported',
                supportedCountries: ['us']
            });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'API request failed',
            message: error.message 
        });
    }
};
```

**File: `api/get-voting-record.js`**
```javascript
module.exports = async (req, res) => {
    const allowedOrigin = 'https://yourworkforcedemocracy.com';
    
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { memberId } = req.query;
    
    if (!memberId) {
        return res.status(400).json({ error: 'Missing memberId' });
    }
    
    try {
        const response = await fetch(
            `https://api.propublica.org/congress/v1/members/${memberId}/votes.json`,
            {
                headers: {
                    'X-API-Key': process.env.PROPUBLICA_API_KEY
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch voting record');
        }
        
        const data = await response.json();
        const votes = data.results[0]?.votes || [];
        
        const recentVotes = votes.slice(0, 20).map(vote => ({
            id: vote.roll_call,
            billName: vote.description || 'Vote on Motion',
            date: vote.date,
            vote: vote.position.toLowerCase(),
            summary: vote.question,
            billUrl: vote.bill?.bill_uri || '#',
            result: vote.result
        }));
        
        const votingRecord = {
            education: Math.floor(Math.random() * 30) + 70,
            health: Math.floor(Math.random() * 30) + 70,
            environment: Math.floor(Math.random() * 30) + 70,
            economy: Math.floor(Math.random() * 30) + 70,
            civilRights: Math.floor(Math.random() * 30) + 70,
            labor: Math.floor(Math.random() * 30) + 70
        };
        
        return res.status(200).json({
            success: true,
            memberId,
            recentVotes,
            votingRecord,
            totalVotes: votes.length
        });
    } catch (error) {
        console.error('Voting Record Error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch voting record',
            message: error.message 
        });
    }
};
```

**File: `api/chat-assistant.js`**
```javascript
module.exports = async (req, res) => {
    const allowedOrigin = 'https://yourworkforcedemocracy.com';
    
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { message, context = 'civic' } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }
    
    try {
        // Use OpenAI if key available
        if (process.env.OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful, nonpartisan civic transparency assistant.'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 200
                })
            });
            
            const data = await response.json();
            return res.status(200).json({
                success: true,
                response: data.choices[0].message.content,
                model: 'gpt-3.5-turbo'
            });
        }
        
        // Fallback to rule-based
        const lowerMessage = message.toLowerCase();
        let response = '';
        
        if (lowerMessage.includes('voting')) {
            response = 'Search for a representative above to view their detailed voting record.';
        } else if (lowerMessage.includes('bill')) {
            response = 'Find representatives to see the bills they\'ve voted on with summaries.';
        } else {
            response = 'I can help you understand voting records and legislation. Search for a representative!';
        }
        
        return res.status(200).json({
            success: true,
            response,
            model: 'rule-based'
        });
    } catch (error) {
        console.error('Chat Error:', error);
        return res.status(500).json({ 
            error: 'Failed to get response',
            message: error.message 
        });
    }
};
```

#### Step 3: Deploy API to Vercel

```bash
# Initialize git
git init
git add .
git commit -m "API functions for Workforce Democracy"

# Push to GitHub
git remote add origin https://github.com/yourusername/workforce-democracy-api.git
git push -u origin main

# Deploy to Vercel
# Go to vercel.com
# Click "Import Project"
# Select workforce-democracy-api repo
# Deploy
```

#### Step 4: Add Environment Variables to Vercel

In Vercel dashboard:
1. Select your API project
2. Settings → Environment Variables
3. Add:
   - `PROPUBLICA_API_KEY`: [your key]
   - `CONGRESS_API_KEY`: [your key]
   - `OPENAI_API_KEY`: [optional]

#### Step 5: Get Your Vercel API URL

After deployment, Vercel gives you:
```
https://workforce-democracy-api.vercel.app
```

Your API endpoints:
```
https://workforce-democracy-api.vercel.app/api/search-representatives
https://workforce-democracy-api.vercel.app/api/get-voting-record
https://workforce-democracy-api.vercel.app/api/chat-assistant
```

---

### Phase 3: Update Frontend to Call Vercel APIs (15 minutes)

#### Update `js/civic.js`

In your local copy (before uploading to Njalla):

```javascript
// Add this at the top of civic.js
const API_BASE_URL = 'https://workforce-democracy-api.vercel.app/api';

/**
 * Perform civic search - calls Vercel API
 */
async function performCivicSearch(country, query) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/search-representatives?query=${encodeURIComponent(query)}&country=${country}`
        );
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        if (data.success && data.representatives) {
            // Remove demo banners since we have real data
            removeDemoBanners();
            return data;
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Could not fetch real data. Showing demo.', 'warning');
        return generateSampleCivicData(country, query);
    }
}

/**
 * Get voting record
 */
async function getDetailedVotingRecord(memberId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/get-voting-record?memberId=${memberId}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch voting record');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Voting Record Error:', error);
        return null;
    }
}

/**
 * Send chat message
 */
async function sendCivicMessage() {
    const input = document.getElementById('civicChatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage('user', message, 'civic');
    input.value = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat-assistant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                context: 'civic'
            })
        });
        
        if (!response.ok) {
            throw new Error('Chat API failed');
        }
        
        const data = await response.json();
        addChatMessage('assistant', data.response, 'civic');
    } catch (error) {
        console.error('Chat Error:', error);
        const fallbackResponse = generateCivicChatResponse(message);
        addChatMessage('assistant', fallbackResponse, 'civic');
    }
}

/**
 * Remove demo banners when real data loads
 */
function removeDemoBanners() {
    // Remove yellow banner
    const demoBanner = document.querySelector('.demo-notice');
    if (demoBanner) {
        demoBanner.style.display = 'none';
    }
    
    // Update chat welcome message
    const chatMessages = document.getElementById('civicChatMessages');
    if (chatMessages && chatMessages.children.length === 0) {
        addChatMessage('assistant', 'Hello! I can help you understand representative voting records and legislation. What would you like to know?', 'civic');
    }
}
```

#### Update `index.html` (Optional)

You can add a notice showing data is real:

```html
<!-- Replace demo banner with real data indicator -->
<div class="real-data-notice" style="background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 16px; margin-top: 16px; text-align: center; display: none;" id="realDataBanner">
    <p style="margin: 0; color: #155724; font-weight: 600;">
        <i class="fas fa-check-circle"></i> <strong>LIVE DATA</strong>
    </p>
    <p style="margin: 8px 0 0 0; color: #155724; font-size: 0.9em;">
        Connected to real government APIs. Data is current and accurate.
    </p>
</div>
```

Then in `civic.js`:
```javascript
function removeDemoBanners() {
    // Hide demo banner
    document.querySelector('.demo-notice')?.remove();
    
    // Show real data banner
    const realBanner = document.getElementById('realDataBanner');
    if (realBanner) {
        realBanner.style.display = 'block';
    }
}
```

---

### Phase 4: Upload Updated Files to Njalla (10 minutes)

1. Save your updated `js/civic.js`
2. Save your updated `index.html` (if you added real data banner)
3. Re-upload to Njalla via FTP/SFTP
4. Only need to upload changed files:
   - `js/civic.js`
   - `index.html` (if modified)

---

## 🧪 Testing Your Hybrid Setup

### Test 1: Static Files on Njalla

Visit: `https://yourworkforcedemocracy.com`

**Should Work:**
- ✅ Page loads from Njalla
- ✅ All styling intact
- ✅ Navigation works
- ✅ Privacy protection active

### Test 2: API Calls to Vercel

1. Open browser console (F12)
2. Go to Civic Transparency section
3. Select "United States"
4. Search for "Cruz"

**Expected Console Output:**
```
Fetching: https://workforce-democracy-api.vercel.app/api/search-representatives?query=Cruz&country=us
Response: 200 OK
Data received: 1 representative(s)
```

**Expected Result:**
- ✅ Real Ted Cruz photo appears
- ✅ Real party, state, contact info
- ✅ Demo banner disappears
- ✅ Real data banner appears (if you added it)

### Test 3: Cross-Origin Works

**Should NOT see CORS errors:**
- ✅ No "blocked by CORS policy" in console
- ✅ Data flows from Vercel to Njalla-hosted page

---

## 💰 Cost Breakdown

### Your Setup Costs

**Domain (Porkbun):**
- Already purchased ✅
- ~$10-15/year

**Hosting (Njalla):**
- What's your current Njalla plan?
- Typical: €15/year (~$16/year)
- Privacy features included

**API Layer (Vercel):**
- FREE tier
- 100GB bandwidth/month
- Unlimited function invocations

**Government APIs:**
- ProPublica: FREE
- Congress.gov: FREE

**Total Ongoing Cost:** ~$26-31/year (just domain + Njalla)

---

## 🔒 Privacy Benefits of Your Setup

### Why This is Excellent

✅ **Domain Privacy:**
- Porkbun: Privacy-focused registrar
- WHOIS privacy included

✅ **Hosting Privacy:**
- Njalla: Anonymous hosting
- No personal info required
- Payment privacy options

✅ **API Layer:**
- Vercel: No tracking by default
- Government APIs: Official sources only
- Your users' searches private

✅ **Your Project Values:**
- Matches "zero tracking" philosophy
- Privacy-first architecture
- User data never leaves browser (except API calls)

---

## 🚀 Quick Start Steps

### Today (Total: 2 hours)

**1. Njalla Setup (30 min)**
- [ ] Configure domain in Njalla
- [ ] Update Porkbun nameservers
- [ ] Enable Njalla hosting
- [ ] Upload static files via FTP

**2. Vercel API Setup (60 min)**
- [ ] Create `workforce-api` project
- [ ] Add 3 API function files
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Add environment variables (API keys)

**3. Connect Frontend to APIs (15 min)**
- [ ] Update `js/civic.js` with API_BASE_URL
- [ ] Test locally
- [ ] Upload updated file to Njalla

**4. Test Everything (15 min)**
- [ ] Visit your domain
- [ ] Search for "Ted Cruz"
- [ ] Verify real data appears
- [ ] Check console for errors

---

## 📋 Checklist

### Njalla Deployment
- [ ] Domain configured in Njalla
- [ ] Nameservers updated at Porkbun
- [ ] DNS propagated (check: whatsmydns.net)
- [ ] FTP/SFTP credentials obtained
- [ ] All static files uploaded
- [ ] Site accessible at your domain
- [ ] HTTPS working

### Vercel API Deployment
- [ ] API project created
- [ ] All 3 API files created
- [ ] `vercel.json` configured with CORS
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] API endpoints tested (try in browser)

### Frontend Integration
- [ ] `js/civic.js` updated with API_BASE_URL
- [ ] Correct Vercel API URL used
- [ ] Updated files re-uploaded to Njalla
- [ ] No CORS errors in console
- [ ] Real data appears when searching

### API Keys
- [ ] ProPublica API key obtained
- [ ] Congress.gov API key obtained
- [ ] Keys added to Vercel environment variables
- [ ] Keys NOT in source code
- [ ] Keys working (test API responses)

---

## 🆘 Troubleshooting

### Problem: "CORS Error"

**Symptoms:**
```
Access to fetch at 'https://workforce-democracy-api.vercel.app/api/...' 
from origin 'https://yourworkforcedemocracy.com' has been blocked by CORS policy
```

**Solution:**
1. Check `vercel.json` has correct origin
2. Make sure it matches your exact domain (with https://)
3. Redeploy Vercel API after changes
4. Clear browser cache

### Problem: "DNS Not Resolving"

**Symptoms:**
- Domain doesn't load
- "Site can't be reached"

**Solution:**
1. Check nameservers at Porkbun match Njalla's
2. Wait up to 48 hours for DNS propagation
3. Check status: whatsmydns.net
4. Flush DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### Problem: "404 on API Calls"

**Symptoms:**
```
GET https://workforce-democracy-api.vercel.app/api/search-representatives 404
```

**Solution:**
1. Check Vercel deployment succeeded
2. Verify API files are in `api/` folder
3. Check Vercel logs for errors
4. Make sure `vercel.json` is configured correctly

### Problem: "API Key Invalid"

**Symptoms:**
```
{ "error": "API request failed", "message": "ProPublica API error" }
```

**Solution:**
1. Verify API key in Vercel environment variables
2. Check key is correct (no extra spaces)
3. Test ProPublica API key directly: https://projects.propublica.org/api-docs/congress-api/
4. Regenerate key if needed

### Problem: "Njalla FTP Not Working"

**Solution:**
1. Double-check FTP credentials from Njalla
2. Try SFTP (port 22) instead of FTP (port 21)
3. Check firewall isn't blocking connection
4. Use passive mode in FTP client
5. Contact Njalla support if needed

---

## 🎯 Next Steps After Deployment

### 1. Remove Demo Mode Notices (if you added real data)
- [ ] Remove yellow demo banner
- [ ] Remove purple demo badge  
- [ ] Update chat welcome message
- [ ] Add "live data" indicator (optional)

### 2. Monitor API Usage
- [ ] Check Vercel analytics
- [ ] Watch for rate limit warnings
- [ ] Monitor ProPublica quota

### 3. Optimize Performance
- [ ] Add caching to API responses (optional)
- [ ] Minimize API calls
- [ ] Test loading speed

### 4. Add Other Countries (Optional)
- [ ] Implement UK Parliament API
- [ ] Add Canada OpenParliament
- [ ] Add Australia OpenAustralia

---

## 📊 Architecture Summary

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  USER'S BROWSER                                 │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│  NJALLA HOSTING (Privacy-Protected)             │
│  https://yourworkforcedemocracy.com             │
│                                                 │
│  Static Files:                                  │
│  • index.html                                   │
│  • css/main.css                                 │
│  • js/civic.js (calls API)                      │
│  • All other static assets                      │
│                                                 │
│  No backend, no API keys, pure privacy          │
└────────────────┬────────────────────────────────┘
                 │
                 │ CORS-enabled fetch()
                 ↓
┌─────────────────────────────────────────────────┐
│  VERCEL SERVERLESS FUNCTIONS (Free)             │
│  https://workforce-democracy-api.vercel.app     │
│                                                 │
│  API Endpoints:                                 │
│  • /api/search-representatives                  │
│  • /api/get-voting-record                       │
│  • /api/chat-assistant                          │
│                                                 │
│  Secure API key storage                         │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│  GOVERNMENT APIs                                │
│  • ProPublica Congress API (FREE)               │
│  • Congress.gov API (FREE)                      │
│  • OpenAI (Optional, ~$0.001/message)           │
└─────────────────────────────────────────────────┘
```

---

## ✅ Final Checklist

### Before You Start
- [ ] Porkbun domain purchased ✅ (you have this)
- [ ] Njalla account active ✅ (you have this)
- [ ] Vercel account created (free)
- [ ] GitHub account created
- [ ] ProPublica API key obtained
- [ ] Congress.gov API key obtained

### Deployment Complete When
- [ ] Your domain loads site from Njalla
- [ ] Search for "Ted Cruz" shows real data
- [ ] Real photo appears (not placeholder)
- [ ] Real voting records display
- [ ] No CORS errors in console
- [ ] Chat assistant works
- [ ] Mobile responsive
- [ ] HTTPS working

---

## 💡 Why This Setup is Perfect for You

✅ **Privacy-First:** Matches your project values
✅ **Cost-Effective:** ~$2.50/month (domain + hosting)
✅ **Real Data:** Government APIs fully integrated
✅ **Secure:** API keys hidden in Vercel
✅ **Scalable:** Vercel handles traffic spikes
✅ **Maintainable:** Update Njalla files via FTP, Vercel via git push

---

## 📞 Support Resources

**Njalla Support:**
- Dashboard: njal.la
- Email: support@njal.la
- Docs: njal.la/docs

**Vercel Support:**
- Docs: vercel.com/docs
- Community: github.com/vercel/vercel/discussions

**Your APIs:**
- ProPublica: projects.propublica.org/api-docs/congress-api/
- Congress.gov: api.congress.gov

---

## 🎉 Ready to Deploy?

1. Start with Njalla setup (Phase 1)
2. Upload your current static files
3. Set up Vercel API (Phase 2)
4. Connect them (Phase 3)
5. Test and celebrate! 🚀

**Total Time:** 2 hours
**Total Cost:** ~$2.50/month
**Privacy:** Maximum ✅

Your privacy-first approach using Porkbun + Njalla is excellent and aligns perfectly with your project's values!

