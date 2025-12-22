# 🚀 HOTFIX - v37.18.32 - DUCKDUCKGO SEARCH FIX

## 🚨 BUG FOUND IN v37.18.31

The logs showed:
```
🔎 Searching Democracy Now archive via DuckDuckGo (historical articles)
🔍 Searching news sources for: "site:democracynow.org what are mamdani's policies?"
🔍 Searching news sources for: "site:theintercept.com what are mamdani's policies?"
🔍 Searching news sources for: "site:jacobin.com what are mamdani's policies?"
```

**But no results found!**

### ROOT CAUSE:

**v37.18.31 code:**
```javascript
searchPromises.push(searchDuckDuckGo(`site:democracynow.org ${userMessage}`, 5));
```

**searchDuckDuckGo() function already adds `site:` prefix:**
```javascript
const searchUrl = `https://duckduckgo.com/html/?q=site:${source.domain}+${encodeURIComponent(query)}`;
```

**Result:** Malformed URL with duplicate `site:` prefix:
```
site:democracynow.org+site:democracynow.org+what+are+mamdani's+policies
```

DuckDuckGo returns 0 results for malformed URLs!

---

## ✅ THE FIX (v37.18.32)

### Change:
```javascript
// BEFORE (v37.18.31) - Duplicate site: prefix
searchPromises.push(searchDuckDuckGo(`site:democracynow.org ${userMessage}`, 5));
searchPromises.push(searchDuckDuckGo(`site:theintercept.com ${userMessage}`, 3));
searchPromises.push(searchDuckDuckGo(`site:jacobin.com ${userMessage}`, 3));

// AFTER (v37.18.32) - Let function add site: automatically
searchPromises.push(searchDuckDuckGo(userMessage, 8)); // Searches all NEWS_SOURCES.independent
```

**Bonus:** `searchDuckDuckGo()` already loops through:
- Democracy Now
- The Intercept
- ProPublica
- Drop Site News
- Common Dreams
- Truthout
- Zeteo
- Breaking Points

So we get **8 sources** instead of just 3!

---

## 🚀 DEPLOYMENT

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.32"

scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ && ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service && sleep 3 && tail -50 /var/log/workforce-backend-b.log'
```

**Password:** `YNWA1892LFC`

---

## ✅ EXPECTED LOG OUTPUT

```
🚀🚀🚀 AI-SERVICE.JS v37.18.32 LOADED - DUCKDUCKGO FIX (NO DUPLICATE SITE:) 🚀🚀🚀
🔎 Searching Democracy Now/Intercept/Jacobin archives via DuckDuckGo
🔍 Searching news sources for: "what are mamdani's policies?"
  ✅ Found: Democracy Now - <article URL>
  ✅ Found: The Intercept - <article URL>
  ✅ Found: ProPublica - <article URL>
📚 Found 5+ sources to provide to LLM
```

---

## 🧪 TEST AFTER DEPLOYMENT

1. **Query:** `what are mamdani's policies?`

2. **Check logs:**
```bash
ssh root@185.193.126.13 'tail -200 /var/log/workforce-backend-b.log | grep -A 10 "Found:"'
```

**Expected:**
```
✅ Found: Democracy Now - http://...
✅ Found: The Intercept - http://...
✅ Found: ProPublica - http://...
```

3. **Check frontend:**
   - ✅ Should see **5-8 sources** (not just 1!)
   - ✅ Sources from different outlets (Democracy Now, Intercept, ProPublica)
   - ✅ Specific policy details with multiple citations

---

**This is a one-line fix that unblocks DuckDuckGo searches!** 🚀
