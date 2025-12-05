# 🔧 Civic Platform Integration Guide

Step-by-step instructions for integrating v37.0.0 into your main site.

---

## 📋 Prerequisites

- ✅ All civic platform files uploaded to VPS
- ✅ civic-platform.html tested and working
- ✅ API keys configured (Groq, VoteSmart)
- ✅ Backend server running (PM2)

---

## 🎯 Integration Options

### Option A: Keep Separate (Recommended for Testing)

**Pros:**
- Safe - doesn't affect main site
- Easy to test and iterate
- Can deploy incrementally
- Rollback is simple

**Implementation:**
1. Keep civic-platform.html as-is
2. Add link from main site: "Try New Civic Platform (Beta)"
3. Test with users
4. Gather feedback
5. Iterate before full integration

### Option B: Full Integration

**Pros:**
- Unified experience
- Single navigation
- Consistent branding

**Cons:**
- More complex
- Higher risk
- Harder to rollback

---

## 📦 Full Integration Steps

### Step 1: Backend Integration

#### 1.1 Update server.js

```javascript
// backend/server.js

// Add at top with other requires
const civicApi = require('./civic/backend/civic-api');

// Add after existing routes, before error handlers
app.use('/api/civic', civicApi);

// That's it! Civic API is now available at /api/civic/*
```

#### 1.2 Install Dependencies (if needed)

```bash
cd /var/www/html/backend
npm install axios  # For API requests in civic services
```

#### 1.3 Restart Server

```bash
/opt/nodejs/bin/pm2 restart 0
/opt/nodejs/bin/pm2 logs 0  # Check for errors
```

### Step 2: Frontend Integration

#### 2.1 Add Component Scripts to Main index.html

```html
<!-- In index.html, before closing </body> tag -->

<!-- Civic Platform Components -->
<script src="civic/components/llm-assistant.js"></script>
<script src="civic/components/representative-profile.js"></script>
<script src="civic/components/civic-components.js"></script>

<!-- Initialize LLM Assistant globally -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
        window.llmAssistant = new LLMAssistantUI('llmAssistantWidget', window.GROQ_API_KEY);
    });
</script>

<!-- Add widget container -->
<div id="llmAssistantWidget"></div>
```

#### 2.2 Add Civic Platform Styles

```html
<!-- In index.html, in <head> section -->
<link rel="stylesheet" href="civic/styles/civic-platform.css">
```

### Step 3: Add Navigation Links

#### 3.1 Main Navigation

Add to your main site navigation:

```html
<li><a href="#civic-dashboard">Civic Dashboard</a></li>
<li><a href="#bill-tracker">Track Bills</a></li>
<li><a href="#fact-checker">Fact Check</a></li>
```

#### 3.2 Create Landing Sections

Add containers in your main page:

```html
<!-- Civic Dashboard Section -->
<section id="civic-dashboard" class="content-section" style="display: none;">
    <div id="dashboardContainer"></div>
</section>

<!-- Bill Tracker Section -->
<section id="bill-tracker" class="content-section" style="display: none;">
    <div id="billTrackerContainer"></div>
</section>

<!-- Fact Checker Section -->
<section id="fact-checker" class="content-section" style="display: none;">
    <div id="factCheckerContainer"></div>
</section>
```

#### 3.3 Initialize Components on Navigation

```javascript
// Add to your existing navigation handler
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        
        // Initialize civic components when shown
        if (sectionId === 'civic-dashboard' && !window.dashboardInitialized) {
            const dashboard = new UserDashboard('dashboardContainer');
            dashboard.render();
            window.dashboardInitialized = true;
        }
        else if (sectionId === 'bill-tracker' && !window.billTrackerInitialized) {
            const billTracker = new BillTracker('billTrackerContainer');
            billTracker.render();
            window.billTrackerInitialized = true;
        }
        else if (sectionId === 'fact-checker' && !window.factCheckerInitialized) {
            const factChecker = new FactChecker('factCheckerContainer');
            factChecker.render();
            window.factCheckerInitialized = true;
        }
    }
}
```

### Step 4: Add Representative Modal Trigger

Anywhere you want to show representative profiles:

```html
<button onclick="openRepProfile('BIOGUIDE_ID')">
    View Representative Profile
</button>

<script>
function openRepProfile(bioguideId) {
    const repProfile = new RepresentativeProfile();
    repProfile.open(bioguideId);
}
</script>
```

### Step 5: Add Fact-Check Quick Access

Add a floating button or prominent link:

```html
<!-- Quick Fact-Check Button -->
<button class="floating-fact-check-btn" onclick="openQuickFactCheck()">
    <i class="fas fa-search"></i>
    Quick Fact Check
</button>

<script>
function openQuickFactCheck() {
    // Show fact-checker section
    showSection('fact-checker');
    // Focus on claim input
    document.getElementById('claimInput')?.focus();
}
</script>

<style>
.floating-fact-check-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #2563eb, #1e40af);
    color: white;
    border: none;
    padding: 1rem 1.5rem;
    border-radius: 50px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    cursor: pointer;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
}
</style>
```

---

## 🎨 Styling Integration

### Option 1: Keep Civic Platform Styles Isolated

Already done! Civic CSS uses specific class names (`.rep-profile-*`, `.llm-*`, `.civic-*`) that won't conflict with your existing styles.

### Option 2: Merge with Main Styles

If you want consistent styling across the entire site:

1. Copy CSS variables from `civic/styles/civic-platform.css` to your main stylesheet
2. Adjust colors to match your brand
3. Test thoroughly

---

## 🔌 API Endpoints Available

After integration, these endpoints are available:

### Representatives
- `GET /api/civic/representatives/search` - Search representatives
- `GET /api/civic/representatives/:id` - Get full profile
- `GET /api/civic/representatives/:id/campaign-finance` - Campaign finance data

### Bills
- `GET /api/civic/bills/search` - Search bills
- `GET /api/civic/bills/:id` - Get bill details

### Fact-Checking
- `POST /api/civic/fact-check` - Verify a claim
- `GET /api/civic/fact-check/trending` - Trending misinformation
- `POST /api/civic/fact-check/batch` - Batch verify claims

### User Votes
- `POST /api/civic/user-votes` - Record user vote on bill
- `GET /api/civic/user-votes/:userId` - Get user's votes

### Alignment
- `GET /api/civic/alignment/:userId/:representativeId` - Calculate alignment

### Health
- `GET /api/civic/health` - Check if civic API is running

---

## 🧪 Testing After Integration

### 1. Backend Tests

```bash
# Test civic API health
curl https://workforcedemocracyproject.org/api/civic/health

# Test fact-check endpoint
curl -X POST https://workforcedemocracyproject.org/api/civic/fact-check \
  -H "Content-Type: application/json" \
  -d '{"claim":"Test claim"}'
```

### 2. Frontend Tests

- [ ] LLM assistant appears in bottom-right corner
- [ ] Click assistant, send a test message
- [ ] Navigate to civic dashboard
- [ ] Navigate to bill tracker
- [ ] Navigate to fact-checker, submit a claim
- [ ] Click a representative to open modal
- [ ] Test all 6 tabs in representative modal
- [ ] Test on mobile device

### 3. Browser Console

Check for errors:
```javascript
// Open browser console (F12)
// Look for any red errors
// All components should log initialization messages
```

---

## 🐛 Troubleshooting

### Issue: "Cannot read property 'render' of undefined"

**Cause:** Component script not loaded
**Fix:** Ensure all script tags are in correct order:
1. llm-assistant.js
2. representative-profile.js
3. civic-components.js

### Issue: Styles not applying

**Cause:** CSS not loaded or path incorrect
**Fix:** Check browser network tab, ensure civic-platform.css loads successfully

### Issue: API endpoints return 404

**Cause:** Backend not restarted after adding civic-api.js
**Fix:**
```bash
/opt/nodejs/bin/pm2 restart 0
```

### Issue: LLM assistant says "API key not configured"

**Cause:** GROQ_API_KEY not set
**Fix:**
```bash
nano /var/www/html/backend/.env
# Add: GROQ_API_KEY=your_key_here
/opt/nodejs/bin/pm2 restart 0
```

### Issue: Fact-checking returns "no sources found"

**Cause:** Rate limiting or internet connectivity
**Fix:** Wait 30 seconds and try again. Check backend logs:
```bash
/opt/nodejs/bin/pm2 logs 0
```

---

## 📊 Monitoring After Integration

### Check PM2 Logs

```bash
/opt/nodejs/bin/pm2 logs 0 --lines 100
```

Look for:
- `✓ Civic Platform API initialized`
- `✓ LLM Assistant initialized`
- Any error messages

### Check Browser Console

Press F12, look for:
- `🏛️ Initializing Civic Platform...`
- `✓ LLM Assistant initialized`
- `✓ Representative Profile initialized`

### Monitor API Usage

Civic API logs each request:
```bash
grep "civic" /var/www/html/backend/logs/*
```

---

## 🚀 Deployment Checklist

- [ ] Backup main site before integration
- [ ] Test civic-platform.html standalone first
- [ ] Add civic-api.js to server.js
- [ ] Restart backend server
- [ ] Add component scripts to index.html
- [ ] Add civic-platform.css to index.html
- [ ] Add navigation links
- [ ] Test all components
- [ ] Check browser console for errors
- [ ] Test on mobile
- [ ] Monitor logs for 24 hours
- [ ] Gather user feedback

---

## 🎯 Gradual Rollout Strategy

### Week 1: Beta Testing
- Keep on civic-platform.html
- Add "Beta" badge
- Invite select users
- Gather feedback

### Week 2: Soft Launch
- Add link from main site
- Announce in newsletter
- Monitor closely
- Fix any bugs

### Week 3: Full Integration
- Integrate into main navigation
- Remove beta badge
- Promote widely
- Celebrate! 🎉

---

## 🔄 Rollback Plan

If something goes wrong:

### Quick Rollback

```bash
# 1. Remove civic API from server.js
nano /var/www/html/backend/server.js
# Comment out: app.use('/api/civic', civicApi);

# 2. Restart server
/opt/nodejs/bin/pm2 restart 0

# 3. Remove civic scripts from index.html
nano /var/www/html/index.html
# Comment out civic script tags

# 4. Main site is back to normal
```

### Keep civic-platform.html

Even if you rollback main integration, civic-platform.html will still work as a standalone page.

---

## 💡 Pro Tips

1. **Start Small:** Integrate fact-checker first, then add other features

2. **User Testing:** Have 5-10 users test before full launch

3. **Mobile First:** Test on phone first - most users are mobile

4. **Monitor Logs:** Check PM2 logs daily for first week

5. **Iterate Fast:** Fix bugs quickly, users appreciate responsiveness

6. **Communicate:** Tell users about new features, educate on how to use

7. **Backup Everything:** Before any change, backup current state

---

## 📞 Support Resources

### Documentation
- `civic/README-DEPLOYMENT.md` - Deployment guide
- `civic/MORNING-SUMMARY-UPDATED.md` - Complete feature overview
- `civic/BUILD-STATUS.md` - Build progress

### API Documentation
- FEC: https://api.open.fec.gov/developers/
- OpenStates: https://docs.openstates.org/api-v3/
- VoteSmart: https://votesmart.org/share/api
- Groq: https://console.groq.com/docs

### Community
- Groq Discord: https://discord.gg/groq
- OpenStates GitHub: https://github.com/openstates

---

## ✅ Post-Integration Tasks

After successful integration:

- [ ] Update README.md with new features
- [ ] Create user guide/tutorial
- [ ] Add to sitemap
- [ ] Update meta tags for SEO
- [ ] Announce on social media
- [ ] Email newsletter
- [ ] Monitor analytics
- [ ] Gather user feedback
- [ ] Plan next iteration

---

## 🎉 You're Ready!

This integration guide covers everything you need to go from standalone test page to fully integrated civic platform.

**Take your time.** Test thoroughly. The modular design means you can:
- Deploy in phases
- Test each component
- Rollback easily
- Iterate quickly

**Good luck!** 🚀

You're building something special - a platform that empowers citizens with facts, transparency, and tools to engage with democracy.

---

Built with ❤️ for democracy
v37.0.0 - Truth & Democracy Platform
