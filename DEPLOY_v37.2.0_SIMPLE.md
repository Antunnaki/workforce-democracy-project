# 🚀 Simple Deployment Guide - v37.2.0

## **What This Update Does**

Adds **independent local election sources** so users can learn about candidates like Dorcey Applyrs (Albany mayor) without relying on Big Tech.

**New Sources**:
- ✅ Ballotpedia (non-profit)
- ✅ Wikipedia (Wikimedia Foundation)  
- ✅ Times Union, Gothamist, The City (local news)
- ✅ Hand-curated local race links

**Zero Big Tech APIs!**

---

## 📋 **Quick Deploy (5 Commands)**

### **1. Backup**
```bash
ssh root@185.193.126.13 "cd /var/www/workforce-democracy/backend && cp ai-service.js ai-service.js.v37.1.4.backup"
```

### **2. Upload**
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.2.0"
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

### **3. Verify**
```bash
ssh root@185.193.126.13 "grep -c 'V37.2.0' /var/www/workforce-democracy/backend/ai-service.js"
```
**Expected**: Should show a number (15+)

### **4. Restart**
```bash
ssh root@185.193.126.13 "pm2 restart backend"
```

### **5. Check Logs**
```bash
ssh root@185.193.126.13 "pm2 logs backend --lines 30"
```

---

## 🧪 **Test It Works**

### **Test on Website**:

1. Go to: https://workforcedemocracyproject.org
2. Open chat
3. Ask: **"Tell me about Dorcey Applyrs"**

**Expected**:
- ✅ Gets Ballotpedia sources
- ✅ Shows candidate information
- ✅ Multiple sources listed

### **Check Backend Logs**:

```bash
ssh root@185.193.126.13 "pm2 logs backend --lines 0"
```

Then ask the question on the website. You should see:
```
📌 Found 2 curated sources for local race
📖 Searching Wikipedia for: Dorcey Applyrs
🗳️  Searching Ballotpedia for: Dorcey Applyrs
✅ Found 4 total sources (2 curated, 2 searched)
```

---

## ✅ **Success Checklist**

- [ ] Backup created
- [ ] File uploaded (showed 100%)
- [ ] v37.2.0 markers found (grep showed number)
- [ ] Backend restarted (PM2 shows "online")
- [ ] Logs show no errors
- [ ] Test query returns sources
- [ ] Backend logs show new emojis (📌, 📖, 🗳️, 📰)

---

## ⚠️ **Rollback if Needed**

```bash
ssh root@185.193.126.13 "cd /var/www/workforce-democracy/backend && cp ai-service.js.v37.1.4.backup ai-service.js && pm2 restart backend"
```

---

## 📊 **What's Different**

### **Before v37.2.0**:
```
User: "Tell me about Dorcey Applyrs"
AI: "Dorcey Applyrs is not a known candidate..."
Sources: None
```

### **After v37.2.0**:
```
User: "Tell me about Dorcey Applyrs"  
AI: "Dorcey Applyrs is the mayor-elect of Albany..."
Sources:
  [1] Dorcey Applyrs - Ballotpedia
  [2] Albany mayoral election, 2025 - Ballotpedia
  [3] Dorcey Applyrs - Wikipedia (if available)
```

---

## 🎯 **Key New Features**

1. **Local News Scraping**:
   - Times Union (Albany)
   - Gothamist (NYC)
   - The City (NYC)
   - Syracuse.com, Buffalo News

2. **Wikipedia Integration**:
   - Candidate biographies
   - Background info
   - Non-profit source

3. **Enhanced Ballotpedia**:
   - Candidate profiles
   - Election results
   - Local race coverage

4. **Curated Sources**:
   - Hand-picked links for known races
   - Currently: Albany Mayor 2025
   - Easy to expand

---

## 📝 **Questions to Answer After Testing**

1. Did "Dorcey Applyrs" query work? YES / NO
2. How many sources were returned? _____
3. Did backend logs show new emojis (📌, 📖, etc.)? YES / NO
4. Any errors in PM2 logs? YES / NO

---

**Time Required**: 5 minutes  
**Risk Level**: Low (can easily rollback)  
**Big Tech Free**: 100% ✅
