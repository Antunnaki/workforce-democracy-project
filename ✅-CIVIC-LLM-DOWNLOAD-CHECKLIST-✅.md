# ✅ CIVIC-LLM FIX - DOWNLOAD CHECKLIST

## 📥 FILES TO DOWNLOAD

Download these 4 files from the chat and save them to:

```
/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend/
```

---

### ☐ File 1: Main Deployment Script

**Filename:** `⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh`

**What it does:**
- Uploads all fix files to VPS
- Executes deployment automatically
- Shows real-time progress

**Size:** ~4.5 KB

---

### ☐ File 2: Diagnostic Script

**Filename:** `DIAGNOSE-CIVIC-LLM-v37.18.5.sh`

**What it does:**
- Checks if civic-llm-async.js has correct function call
- Reports: using generateResponse() or analyzeWithAI()
- Runs on VPS before applying fix

**Size:** ~2 KB

---

### ☐ File 3: Fix Script

**Filename:** `FIX-CIVIC-LLM-ASYNC-v37.18.5.js`

**What it does:**
- Node.js script that changes the function call
- Replaces: `aiService.generateResponse()` → `aiService.analyzeWithAI()`
- Validates before and after

**Size:** ~2.5 KB

---

### ☐ File 4: VPS Deployment Script

**Filename:** `DEPLOY-CIVIC-LLM-FIX-v37.18.5.sh`

**What it does:**
- Orchestrates entire deployment on VPS
- Creates backup of original file
- Applies fix, verifies syntax
- Restarts backend service
- Submits test query
- Shows results with sources

**Size:** ~6 KB

---

## 🔍 VERIFICATION

After downloading, verify all files are present:

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"

ls -lh ⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh \
       DIAGNOSE-CIVIC-LLM-v37.18.5.sh \
       FIX-CIVIC-LLM-ASYNC-v37.18.5.js \
       DEPLOY-CIVIC-LLM-FIX-v37.18.5.sh
```

**Expected output:**
```
-rw-r--r--  1 user  staff  4.5K  ⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh
-rw-r--r--  1 user  staff  2.0K  DIAGNOSE-CIVIC-LLM-v37.18.5.sh
-rw-r--r--  1 user  staff  2.5K  FIX-CIVIC-LLM-ASYNC-v37.18.5.js
-rw-r--r--  1 user  staff  6.0K  DEPLOY-CIVIC-LLM-FIX-v37.18.5.sh
```

✅ All 4 files present = Ready to deploy!

---

## 🚀 NEXT STEP

Once all files are downloaded and verified:

```bash
chmod +x ⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh

./⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh
```

**The script will handle everything automatically!** 🎯

---

## 📂 FILE STRUCTURE

After download, your backend folder should have:

```
backend/
├── ⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh  ← Run this one!
├── DIAGNOSE-CIVIC-LLM-v37.18.5.sh
├── FIX-CIVIC-LLM-ASYNC-v37.18.5.js
├── DEPLOY-CIVIC-LLM-FIX-v37.18.5.sh
├── civic-llm-async.js                         (existing file)
├── ai-service.js                              (existing file)
└── ... (other backend files)
```

---

## ⚠️ COMMON ISSUES

### Issue: "No such file or directory"

**Cause:** Files not saved to correct location

**Fix:**
```bash
# Check where you are:
pwd

# Should show:
# /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend

# If not, navigate there:
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"
```

---

### Issue: "Permission denied"

**Cause:** Script not executable

**Fix:**
```bash
chmod +x ⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh
```

---

### Issue: Can't find file in chat to download

**Fix:**
1. Scroll up in chat to find the code block
2. Look for: `⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh`
3. Copy entire code block contents
4. Save to file with exact filename

Or ask AI to show the file again.

---

## 🎯 READY TO DEPLOY?

**Checklist:**

- ☐ All 4 files downloaded
- ☐ Saved to correct directory
- ☐ File sizes match (~2-6 KB each)
- ☐ Main script is executable (`chmod +x`)
- ☐ In correct directory (`pwd` shows backend/)

✅ **All checked?** → Run deployment script! 🚀

```bash
./⚡-UPLOAD-EXECUTE-CIVIC-LLM-FIX-MAC-⚡.sh
```
