# 🚀 Simple Deployment - v37.3.0 Global News

## **What This Adds**

50+ independent global news sources via RSS + Guardian API

**Replaces**: Failing DuckDuckGo scraping (403 errors)  
**Cost**: $0/month

---

## 📋 **Quick Deploy (7 Steps)**

### **Step 1: Install Package**

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
npm install rss-parser
```

### **Step 2: Add API Key**

```bash
nano .env
```

Add this line (if not already there):
```
GUARDIAN_API_KEY=[REDACTED_GUARDIAN_API_KEY]
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### **Step 3: Backup**

```bash
cp ai-service.js ai-service.js.v37.2.1.backup
```

### **Step 4: Upload Files**

```bash
# Exit SSH (type 'exit')
# From your Mac:
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.3.0"

# Upload NEW rss-service.js
scp backend/rss-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/

# Upload MODIFIED ai-service.js
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

### **Step 5: Verify Upload**

```bash
ssh root@185.193.126.13 "ls -lh /var/www/workforce-democracy/backend/rss-service.js"
```

Should show the file with recent timestamp.

### **Step 6: Restart Backend**

```bash
ssh root@185.193.126.13 "pm2 restart backend"
```

### **Step 7: Check Logs**

```bash
ssh root@185.193.126.13 "pm2 logs backend --lines 30"
```

**Look for**:
- ✅ No errors about 'rss-parser'
- ✅ Server started successfully

---

## 🧪 **Test It Works**

### **Test 1: Palestine Query**

**In Terminal**:
```bash
ssh root@185.193.126.13 "pm2 logs backend --lines 0"
```

**On Website**: **"What's happening in Palestine?"**

**Expected Logs**:
```
🌍 Global news search: "What's happening in Palestine?"
📡 Fetching RSS: Al Jazeera English
  ✅ Al Jazeera English: Found 3 articles
📡 Fetching RSS: Middle East Eye
✅ Global news: Found 9 sources
```

### **Test 2: Labor Query**

**Ask**: **"UAW strike news"**

**Expected Logs**:
```
🌍 Global news search: "UAW strike news"
📡 Fetching RSS: Labor Notes
📡 Fetching RSS: Jacobin
✅ Global news: Found 7 sources
```

### **Test 3: Australian News**

**Ask**: **"Australian climate policy"**

**Expected Logs**:
```
🌍 Global news search: "Australian climate policy"
📡 Fetching RSS: Guardian Australia
📡 Fetching RSS: ABC News Australia
✅ Global news: Found 8 sources
```

---

## 📊 **What You Get**

### **50+ News Sources**:
- ✅ Democracy Now, Intercept, ProPublica (US Independent)
- ✅ Al Jazeera (Middle East)
- ✅ TeleSUR (Latin America)
- ✅ Guardian Australia (Australia)
- ✅ Labor Notes, Grist (Specialized)
- ✅ BBC, Reuters (With bias warnings)

### **Source Bias Tracking**:
- Independent Progressive (Highest trust)
- Alternative Perspective (High trust)
- Establishment Liberal (Fact-check required)
- State Media (Bias warnings)

### **Smart Routing**:
- Palestine queries → Al Jazeera, Middle East Eye
- Labor queries → Labor Notes, Jacobin
- Australian queries → Guardian Australia, ABC Australia

---

## ⚠️ **Troubleshooting**

### **Error: Cannot find module 'rss-parser'**

Means Step 1 wasn't completed. Run:
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
npm install rss-parser
pm2 restart backend
```

### **Guardian API Error**

Check .env file:
```bash
ssh root@185.193.126.13
cat /var/www/workforce-democracy/backend/.env | grep GUARDIAN
```

Should show the API key.

### **No RSS Sources**

Check internet connectivity and RSS feed URLs are accessible.

---

## ✅ **Success Indicators**

- [ ] npm install rss-parser succeeded
- [ ] Guardian API key in .env
- [ ] Both files uploaded successfully
- [ ] Backend restarted with no errors
- [ ] Test queries show RSS fetching logs
- [ ] Sources include Al Jazeera, Democracy Now, etc.

---

## 📊 **Before vs After**

### **Before v37.3.0**:
```
Query: "Palestine news"
Sources: 0 (DuckDuckGo blocked - 403 errors)
```

### **After v37.3.0**:
```
Query: "Palestine news"
Sources: 9
  - Al Jazeera
  - Middle East Eye
  - Electronic Intifada
  - Democracy Now
  - The Guardian
```

---

**Time**: 10 minutes  
**Cost**: $0/month  
**Big Tech**: 0% (100% independent)
