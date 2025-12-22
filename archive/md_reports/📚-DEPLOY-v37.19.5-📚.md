# 🚀 DEPLOY v37.19.5: PERSON-NAME BONUS + ANTI-CONTRADICTION

## 🎯 WHAT'S NEW IN v37.19.5

### **Problem Solved:**
v37.19.4 had self-contradictory citations:
- ❌ AI cited Source #4: "Grassroots Democratic Base"
- ❌ Then said: "does not mention Mamdani or his policies [4]"
- ❌ Result: User clicks [4], finds nothing about Mamdani, loses trust

### **Solution Implemented:**

**Option B: Person-Name Relevance Bonus** ✅
- Name in title: +200 score
- Name in excerpt: +100 score
- Name NOT in title/excerpt: -50 score
- Result: Sources without person's name get filtered out

**Option C: Anti-Self-Contradiction Rules** ✅
- Explicit prompt rules forbid citing then dismissing sources
- "NEVER cite [N] and then say it doesn't mention the subject"
- Forces AI to skip irrelevant sources entirely

---

## 📊 CHANGES MADE

### **File 1: `backend/services/article-search-service.js`**

**Lines 59-98: Enhanced relevance scoring**

```javascript
// V37.19.5: PERSON-NAME BONUS
if (personKeywords.length > 0) {
    personKeywords.forEach(personName => {
        // MAJOR BOOST if person's name in TITLE
        if (titleLower.includes(personName)) {
            relevanceScore += 200; // This article is ABOUT this person
        }
        // LARGE BOOST if person's name in EXCERPT
        else if (excerptLower.includes(personName)) {
            relevanceScore += 100; // Person mentioned in summary
        }
        // NOT in title/excerpt = NOT about them
        else {
            relevanceScore -= 50; // Penalty
        }
    });
}

// Cap score at 200 (increased from 100)
relevanceScore = Math.min(200, Math.max(0, relevanceScore));
```

### **File 2: `backend/ai-service.js`**

**Lines 1898-1935: Anti-self-contradiction rules**

```
🚨 FORBIDDEN: SELF-CONTRADICTORY CITATIONS (v37.19.5)

❌ NEVER cite a source and then say it's irrelevant:
• Wrong: "Source [4] doesn't mention Mamdani [4]"
• Right: Don't cite [4] at all

✅ CORRECT APPROACH:
• If source doesn't mention person → Don't cite it
• Don't acknowledge irrelevant sources
• Simply skip them and use only relevant ones
```

---

## 📈 EXPECTED IMPROVEMENTS

### **Source #4 Example:**

| Metric | v37.19.4 | v37.19.5 |
|--------|----------|----------|
| **Source #4 Score** | 80 (passed filter) | **30 (filtered out)** ✅ |
| **Why** | Generic keyword matches | **Name "Mamdani" NOT in title/excerpt (-50)** |
| **AI Behavior** | Cited, then said "doesn't mention" | **Won't see this source at all** ✅ |
| **User Experience** | Confused by contradiction | **Clean, relevant sources only** ✅ |

### **Analysis Quality:**

| Aspect | v37.19.4 | v37.19.5 |
|--------|----------|----------|
| **Self-Contradictions** | 1 per response | **0** ✅ |
| **Irrelevant Sources** | Acknowledged | **Ignored** ✅ |
| **Analysis Depth** | Weak (spread thin) | **Strong (focused)** ✅ |
| **Source Count** | 4 (1 irrelevant) | **3 (all relevant)** ✅ |

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Download Updated Files**

From GenSpark file list, download:
1. `ai-service-v37.19.5-READY.js`
2. `article-search-service-v37.19.5-READY.js`

### **Step 2: Prepare Files on Mac**

```bash
# Navigate to project folder
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.0/backend"

# Rename downloaded files
mv ~/Downloads/ai-service-v37.19.5-READY.js ai-service.js
mv ~/Downloads/article-search-service-v37.19.5-READY.js services/article-search-service.js
```

### **Step 3: Deploy to Version B (Test)**

```bash
# Upload both files
scp ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js

scp services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-search-service.js

# Stop Version B
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-b.service'

# Start Version B
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-b.service'

# Verify v37.19.5 loaded
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log | grep "v37.19"'
```

**Expected output:**
```
🚀🚀🚀 AI-SERVICE.JS v37.19.5 LOADED - PERSON-NAME BONUS + ANTI-CONTRADICTION 🚀🚀🚀
🎯 v37.19.5: PERSON-NAME BONUS - Name in title +200, excerpt +100; forbid self-contradictions
```

### **Step 4: Test Version B**

Test on: `https://sxcrlfyt.gensparkspace.com/`

**Query**: "What are Mamdani's policies?"

**Expected results:**
- ✅ 3 sources (not 4) - Source #4 filtered out
- ✅ All 3 sources mention "Mamdani" in title
- ✅ No self-contradictory statements
- ✅ Deeper analysis of the 3 relevant sources
- ✅ No "Source [X] doesn't mention..." statements

### **Step 5: Deploy to Version A (Production)**

```bash
# Backup Version A
ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-a/backend && sudo cp ai-service.js ai-service.js.backup-v37.19.4-$(date +%Y%m%d-%H%M%S)'

ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-a/backend/services && sudo cp article-search-service.js article-search-service.js.backup-$(date +%Y%m%d-%H%M%S)'

# Copy from Version B to Version A
ssh root@185.193.126.13 'sudo cp /var/www/workforce-democracy/version-b/backend/ai-service.js /var/www/workforce-democracy/version-a/backend/ai-service.js'

ssh root@185.193.126.13 'sudo cp /var/www/workforce-democracy/version-b/backend/services/article-search-service.js /var/www/workforce-democracy/version-a/backend/services/article-search-service.js'

# Restart Version A
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-a.service'
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-a.service'

# Verify
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-a.log | grep "v37.19"'
```

### **Step 6: Test Production**

Go to: `https://workforcedemocracyproject.org/`

Ask: "What are Mamdani's policies?"

Verify:
- ✅ 3 highly relevant sources
- ✅ All mention "Mamdani"
- ✅ No Source #4
- ✅ No self-contradictions
- ✅ Strong, focused analysis

---

## 🔍 VERIFICATION CHECKLIST

- [ ] v37.19.5 loaded in Version B logs
- [ ] v37.19.5 loaded in Version A logs
- [ ] Test query returns 3 sources (not 4)
- [ ] All sources mention "Mamdani" in title
- [ ] No "doesn't mention" statements
- [ ] Analysis quality improved
- [ ] No errors in logs

---

## 📊 SCORING EXAMPLES

### **Query: "What are Mamdani's policies?"**

**Source #1**: "Mamdani's Affordability Agenda"
- Base: 50
- Person name in title: +200 → **250**
- Filtered to: **200 (max)**
- **Result: PASSES (score 200 > threshold 60)**

**Source #2**: "Historic Rise of Zohran Mamdani"  
- Base: 50
- Person name in title: +200 → **250**
- Filtered to: **200 (max)**
- **Result: PASSES (score 200 > threshold 60)**

**Source #3**: "Trump-Mamdani Meeting"
- Base: 50
- Person name in title: +200 → **250**
- Filtered to: **200 (max)**
- **Result: PASSES (score 200 > threshold 60)**

**Source #4**: "Grassroots Democratic Base Warning"
- Base: 50
- Person name NOT in title: -50 → **0**
- Person name NOT in excerpt: (already 0)
- Generic keyword matches: +30 → **30**
- **Result: FILTERED OUT (score 30 < threshold 60)** ✅

---

## 🎯 SUCCESS CRITERIA

**v37.19.5 is successful when:**

1. ✅ Source #4 doesn't appear in results
2. ✅ No self-contradictory citations
3. ✅ All cited sources mention person's name
4. ✅ Analysis quality improved
5. ✅ No errors in logs
6. ✅ Both files deployed to Version B and A

---

## 🚨 ROLLBACK (if needed)

```bash
# Rollback Version A
ssh root@185.193.126.13 'sudo cp /var/www/workforce-democracy/version-a/backend/ai-service.js.backup-v37.19.4-* /var/www/workforce-democracy/version-a/backend/ai-service.js'
ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-a.service'
```

---

**Status**: READY FOR DEPLOYMENT  
**Files**: 2 (ai-service.js + article-search-service.js)  
**Risk**: Low (easy rollback)  
**Impact**: High (eliminates contradictions, improves quality)

---

*Deployment Guide v37.19.5*  
*Created: 2025-12-01*
