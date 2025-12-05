# 🚀 HOTFIX - v37.18.33 - DUCKDUCKGO TIMEOUT FIX

## 🚨 BUG FOUND IN v37.18.32

Logs showed ALL DuckDuckGo searches timing out:
```
⚠️ Zeteo: timeout of 5000ms exceeded
⚠️ Breaking Points: timeout of 5000ms exceeded
⚠️ The Intercept: timeout of 5000ms exceeded
⚠️ Democracy Now: timeout of 5000ms exceeded
⚠️ ProPublica: timeout of 5000ms exceeded
⚠️ Drop Site News: timeout of 5000ms exceeded
⚠️ Common Dreams: timeout of 5000ms exceeded
⚠️ Truthout: timeout of 5000ms exceeded
```

**ALL 8 searches failed!**

---

## 🔍 ROOT CAUSE

**DuckDuckGo is:**
1. **Slow to respond** (takes > 5 seconds)
2. **Rate-limiting** (2 second delays between requests not enough)
3. **Blocking bot User-Agents** (needs more realistic User-Agent)

---

## ✅ THE FIX (v37.18.33)

### 1️⃣ **Increased Timeout: 5s → 15s**
```javascript
// BEFORE
timeout: 5000  // 5 seconds

// AFTER  
timeout: 15000 // 15 seconds (DuckDuckGo can be slow)
```

### 2️⃣ **Longer Delays: 2s → 5s**
```javascript
// BEFORE
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds

// AFTER
await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds (avoid rate limits)
```

### 3️⃣ **Better User-Agent**
```javascript
// BEFORE
'User-Agent': 'WorkforceDemocracyBot/1.0 (Educational; contact@workforcedemocracyproject.org)'

// AFTER
'User-Agent': 'Mozilla/5.0 (compatible; WorkforceDemocracyBot/1.0; +https://workforcedemocracy.org)'
'Accept-Language': 'en-US,en;q=0.9'
```

---

## 🚀 DEPLOYMENT

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.33"

scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ && ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service && sleep 3 && tail -50 /var/log/workforce-backend-b.log'
```

**Password:** `YNWA1892LFC`

---

## ✅ EXPECTED LOG OUTPUT

```
🚀🚀🚀 AI-SERVICE.JS v37.18.33 LOADED - DUCKDUCKGO TIMEOUT FIX (5s→15s) 🚀🚀🚀
🔎 Searching Democracy Now/Intercept/Jacobin archives via DuckDuckGo
🔍 Searching news sources for: "what are mamdani's policies?"
  ✅ Found: Zeteo - http://...
  ✅ Found: Breaking Points - http://...
  ✅ Found: The Intercept - http://...
  ✅ Found: Democracy Now - http://...
📚 Found 5+ sources to provide to LLM
```

---

## 🧪 TEST AFTER DEPLOYMENT

1. **Query:** `what are mamdani's policies?`

2. **Check for timeout errors:**
```bash
ssh root@185.193.126.13 'tail -200 /var/log/workforce-backend-b.log | grep "timeout\|Found:"'
```

**Expected:**
- ❌ **NO** "timeout of 5000ms exceeded" errors
- ✅ **YES** "✅ Found: Democracy Now - ..." success messages

3. **Check frontend:**
   - ✅ Should see **5-8 sources**
   - ✅ Sources from DuckDuckGo (not just RSS)
   - ✅ Multiple citations

---

## ⚠️ NOTE: THIS WILL BE SLOWER

With 15s timeouts and 5s delays between requests, DuckDuckGo searches will take **60-120 seconds** total (8 sources × 5s delay + timeouts).

**This is a tradeoff:** Slower response BUT more comprehensive sources.

If it's too slow, we can:
- Reduce maxResults from 8 → 5
- Run searches in parallel (but might trigger rate limits)
- Use a different search provider

---

**Deploy and test!** This should stop the timeouts. 🚀
