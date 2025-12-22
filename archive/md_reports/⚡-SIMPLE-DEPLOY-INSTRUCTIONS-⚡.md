# ⚡ SIMPLE DEPLOY INSTRUCTIONS ⚡

**How to Deploy Civic LLM Fix v37.18.6 to Your VPS**  
**Date**: November 26, 2025

---

## 🎯 WHAT YOU'RE DEPLOYING

**The Fix**: Civic LLM Bug Fix v37.18.6
- **Problem**: Only 1 RSS article returned instead of Congress.gov bills
- **Solution**: Fixed function call in `backend/civic-llm-async.js`
- **Result**: Will return 7+ sources including 6+ Congress bills

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Download the Fixed File** 📥

The file you need is in your current directory:
```
FIX-CIVIC-LLM-COMPLETE-v37.18.6.js
```

This needs to replace the file on your VPS at:
```
/var/www/workforce-democracy/version-b/backend/civic-llm-async.js
```

---

### **STEP 2: Upload File to VPS** 📤

**Option A: Using SCP from your Mac** (Recommended)

Open Terminal on your Mac and run:

```bash
scp FIX-CIVIC-LLM-COMPLETE-v37.18.6.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js
```

**What this does**:
- Uploads the fixed file to your VPS
- Renames it to `civic-llm-async.js` (the correct filename)
- Places it in Version B (test environment)

---

### **STEP 3: Connect to VPS** 🔌

```bash
ssh root@185.193.126.13
```

---

### **STEP 4: Restart Version B Service** 🔄

```bash
sudo systemctl restart workforce-backend-b.service
```

**Check it's running**:
```bash
sudo systemctl status workforce-backend-b.service
```

You should see: `Active: active (running)`

---

### **STEP 5: Test on Version B (Port 3002)** 🧪

Submit a test query:

```bash
curl -X POST http://localhost:3002/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","zipCode":"12061"}'
```

**You'll get a response like**:
```json
{"jobId":"abc-123-def-456"}
```

**Copy the jobId**, then check the result:

```bash
curl http://localhost:3002/api/civic/llm-chat/result/abc-123-def-456
```

(Replace `abc-123-def-456` with your actual jobId)

**What to look for**:
- ✅ Should see multiple sources (7+)
- ✅ Should see Congress.gov bills
- ✅ Should see citations in response

---

### **STEP 6: Deploy to Production (Version A)** 🚀

Once testing looks good:

```bash
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

**What this script does automatically**:
1. ✅ Backs up Version A
2. ✅ Stops Version A gracefully
3. ✅ Copies Version B → Version A
4. ✅ Starts Version A
5. ✅ Verifies deployment
6. ✅ Auto-rollback if anything fails

---

### **STEP 7: Verify Production (Port 3001)** ✅

Test the production version:

```bash
curl -X POST http://localhost:3001/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","zipCode":"12061"}'
```

Get the jobId and check result:

```bash
curl http://localhost:3001/api/civic/llm-chat/result/[YOUR-JOB-ID]
```

**Success!** ✅ If you see 7+ sources with Congress bills, deployment is complete!

---

## 🎉 YOU'RE DONE!

Your Civic LLM is now fixed and deployed!

**Expected improvements**:
- ✅ 1 source → 7+ sources
- ✅ Only RSS → RSS + 6+ Congress bills  
- ✅ No citations → 3-6 citations in responses
- ✅ Generic answers → Specific, detailed answers

---

## 🆘 IF SOMETHING GOES WRONG

### **Version B won't start**:
```bash
# Check logs
tail -50 /var/log/workforce-backend-b.log

# Look for errors and tell me what you see
```

### **Deployment to Version A fails**:
```bash
# The script auto-rolls back, but if needed:
cd /var/www/workforce-democracy/deployment-scripts
ls -lt ../backups/  # Find latest backup
./rollback.sh 20251126-235959  # Use actual timestamp
```

### **Wrong file uploaded**:
```bash
# Just upload the correct file again and restart:
# (Repeat steps 2-4)
```

---

## 📞 NEED HELP?

Tell me:
1. Which step you're on
2. What command you ran
3. What error message you see

I'll help you fix it!

---

## 🎯 QUICK REFERENCE CARD

```bash
# 1. Upload file (from Mac)
scp FIX-CIVIC-LLM-COMPLETE-v37.18.6.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js

# 2. SSH to VPS
ssh root@185.193.126.13

# 3. Restart Version B
sudo systemctl restart workforce-backend-b.service

# 4. Test Version B
curl -X POST http://localhost:3002/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"test","zipCode":"12061"}'

# 5. Deploy to Production
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh

# 6. Verify Production
curl -X POST http://localhost:3001/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"test","zipCode":"12061"}'
```

---

**Total Time: ~10 minutes** ⏱️

🏛️ **Workforce Democracy Project - Simple Deployment Guide**  
*Version A/B System - Step by Step*
