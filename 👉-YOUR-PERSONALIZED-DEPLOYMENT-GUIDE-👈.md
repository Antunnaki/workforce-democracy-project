# 👉 YOUR PERSONALIZED DEPLOYMENT GUIDE 👈

## 🎯 CUSTOMIZED FOR YOUR SETUP

**Date**: November 13, 2025  
**Version**: v37.9.14-OPTION-A  
**Your Setup**: Local project files → VPS at 64.23.145.7

---

## 📂 YOUR DIRECTORY STRUCTURE

### Local (Where you are now)
```
workforce-democracy/
├── backend/
│   ├── ai-service.js          ← This file was updated to v37.9.14
│   ├── server.js
│   ├── rss-service.js
│   └── ... (other files)
├── js/
│   └── chat-clean.js          ← Already deployed to Netlify (v37.9.13)
└── index.html
```

### VPS (Where it needs to go)
```
/var/www/workforce-democracy/
└── backend/
    ├── ai-service.js          ← Will be updated here
    ├── server.js
    ├── rss-service.js
    └── ecosystem.config.js    ← PM2 uses this to restart
```

---

## 🚀 DEPLOYMENT STEPS (PERSONALIZED)

### Method 1: Automated Script (RECOMMENDED) ⭐

#### Step 1: Make Script Executable
```bash
# In your local project directory:
cd ~/workforce-democracy  # Or wherever your project is
chmod +x 🚀-DEPLOY-v37.9.14-OPTION-A-🚀.sh
```

#### Step 2: Run the Script
```bash
./🚀-DEPLOY-v37.9.14-OPTION-A-🚀.sh
```

**What this does**:
1. Uses `scp` to upload `backend/ai-service.js` to `root@64.23.145.7:/var/www/workforce-democracy/backend/`
2. SSHs into your VPS
3. Runs nuclear PM2 restart:
   - `pm2 delete all` - Stops all processes
   - `pm2 kill` - Kills PM2 daemon
   - `pm2 flush` - Clears logs
   - `pm2 start ecosystem.config.js` - Restarts backend
   - `pm2 save` - Saves configuration
4. Shows you the PM2 status and logs

---

### Method 2: Manual Commands (If script doesn't work)

#### Step 1: Upload the File
```bash
# From your local project directory:
scp backend/ai-service.js root@64.23.145.7:/var/www/workforce-democracy/backend/ai-service.js
```

**What this does**: Copies your local `backend/ai-service.js` (v37.9.14) to the VPS, replacing the old version.

#### Step 2: SSH into VPS
```bash
ssh root@64.23.145.7
```

#### Step 3: Navigate to Backend Directory
```bash
cd /var/www/workforce-democracy/backend
```

#### Step 4: Nuclear PM2 Restart
```bash
# Stop all PM2 processes
pm2 delete all

# Kill PM2 daemon (clears memory cache)
pm2 kill

# Flush PM2 logs
pm2 flush

# Start backend again
pm2 start ecosystem.config.js

# Save configuration
pm2 save
```

**Why "nuclear"?** Because PM2 caches code in memory. Regular `pm2 restart` doesn't always reload new code. This ensures the new code is loaded.

#### Step 5: Verify It's Running
```bash
pm2 list
```

**Expected output**: Should show `backend` as `online`.

#### Step 6: Check Logs for Version
```bash
pm2 logs backend --lines 30 --nostream
```

**Look for**:
```
🚀🚀🚀 AI-SERVICE.JS v37.9.14 LOADED - OPTION A: DEDUPLICATION ACTIVE 🚀🚀🚀
```

---

## 🔍 VERIFICATION STEPS

### On the VPS

#### Check PM2 Status
```bash
ssh root@64.23.145.7 "pm2 list"
```

**Expected**: `backend` should be `online` with `0` restarts (or low number).

#### Check Version in Logs
```bash
ssh root@64.23.145.7 "pm2 logs backend --lines 30 --nostream" | grep "v37.9.14"
```

**Expected output**:
```
🚀🚀🚀 AI-SERVICE.JS v37.9.14 LOADED - OPTION A: DEDUPLICATION ACTIVE 🚀🚀🚀
🎯 OPTION A: Threshold=30 + Post-process deduplication (removes [4][4][4] → [4])
```

#### Check for Errors
```bash
ssh root@64.23.145.7 "pm2 logs backend --err --lines 20"
```

**Expected**: No recent errors. If you see errors, share them for troubleshooting.

---

### On Your Website

#### Step 1: Go to Your Site
Open your Workforce Democracy website in a browser.

#### Step 2: Open Browser Console
- **Chrome/Edge**: Press F12 → Console tab
- **Firefox**: Press F12 → Console tab
- **Safari**: Develop → Show JavaScript Console

#### Step 3: Ask a Question
Ask the **same question you used in Test 3 or Test 4**.

Example: "What is Gavin Newsom's record on homelessness?"

#### Step 4: Watch the Console
Look for these lines:
```javascript
[CleanChat] 📊 Citations found in text: – 6
[CleanChat] 📚 Backend provided: 6 source(s)
```

**SUCCESS**: If both numbers match (citations = sources), Option A is working! ✅

**STILL BROKEN**: If you see:
```javascript
[Error] 🛑 BACKEND DATA MISMATCH DETECTED!
[Error] 📄 Text contains: 8 citation(s)
[Error] 📚 Backend provided: 6 source(s)
[Error] ❌ Gap: 2 MISSING source(s)
```

This means the old code is still running. Go back and do the nuclear PM2 restart again.

---

## 🔧 TROUBLESHOOTING

### Issue 1: "scp: Permission denied"

**Problem**: Can't upload file to VPS.

**Solution**:
1. Check you can SSH: `ssh root@64.23.145.7`
2. Check the path exists: `ssh root@64.23.145.7 "ls -la /var/www/workforce-democracy/backend/"`
3. Try uploading to /tmp first: `scp backend/ai-service.js root@64.23.145.7:/tmp/`
   Then move it: `ssh root@64.23.145.7 "mv /tmp/ai-service.js /var/www/workforce-democracy/backend/"`

---

### Issue 2: Script says "backend/ai-service.js: No such file"

**Problem**: Script can't find the local file.

**Solution**: Make sure you're running the script from your project root directory:
```bash
# Check where you are:
pwd

# Should show something like:
/Users/yourname/workforce-democracy

# If not, navigate there:
cd /path/to/workforce-democracy

# Verify file exists:
ls -la backend/ai-service.js

# Then run script:
./🚀-DEPLOY-v37.9.14-OPTION-A-🚀.sh
```

---

### Issue 3: PM2 shows "errored" status

**Problem**: Backend crashed after restart.

**Solution**: Check error logs:
```bash
ssh root@64.23.145.7 "pm2 logs backend --err --lines 50"
```

Common issues:
- **Syntax error**: Check if `ai-service.js` uploaded completely (85,903 bytes)
- **Missing dependency**: Run `npm install` in backend directory
- **Port already in use**: Another process is using the port

---

### Issue 4: Still seeing v37.9.13 in logs

**Problem**: Old code is cached in memory.

**Solution**: Nuclear restart wasn't nuclear enough:
```bash
ssh root@64.23.145.7

# Kill everything more aggressively:
pm2 delete all
pm2 kill
sleep 2
pm2 flush

# Verify PM2 is dead:
pm2 list  # Should say "PM2 is not running"

# Start fresh:
cd /var/www/workforce-democracy/backend
pm2 start ecosystem.config.js
pm2 save

# Check version:
pm2 logs backend --lines 20 | grep "v37.9.14"
```

---

### Issue 5: Citations still don't match sources

**Problem**: Gap still exists after deployment.

**Diagnostic**:
1. **Check version first**: Make sure v37.9.14 is actually running
2. **Check deduplication logs**: Look for "DUPLICATE CITATIONS REMOVED" in PM2 logs
3. **Test with multiple queries**: Try 3-5 different questions

**If gap reduced** (e.g., from 2 to 1): That's progress! Keep testing.

**If gap unchanged**: Share the following:
- PM2 logs showing version
- Browser console output showing citation/source counts
- The exact question you asked

---

## 📊 EXPECTED RESULTS

### Before Option A
```
User asks: "What is Gavin Newsom's record on homelessness?"

Backend logs:
  ✅ Providing 6 validated sources to LLM

Frontend console:
  📊 Citations found in text: – 8
  📚 Backend provided: 6 source(s)
  ❌ Gap: 2 MISSING source(s)

Why: LLM generated [1][2][3][4][4][5][6][6]
     Duplicates: [4] appears twice, [6] appears twice
```

### After Option A
```
User asks: "What is Gavin Newsom's record on homelessness?"

Backend logs:
  ✅ Providing 6 validated sources to LLM
  🔄 DUPLICATE CITATIONS REMOVED: 2 duplicate(s) stripped
  📊 Unique citations kept: 6 (from 8 total)

Frontend console:
  📊 Citations found in text: – 6
  📚 Backend provided: 6 source(s)
  ✅ Gap: 0 MISSING source(s)  ← SUCCESS!

Why: Deduplication removed the duplicate [4] and [6]
     Final: [1][2][3][4][5][6]
```

---

## 🎯 YOUR NEXT STEPS

1. **Deploy**:
   ```bash
   chmod +x 🚀-DEPLOY-v37.9.14-OPTION-A-🚀.sh
   ./🚀-DEPLOY-v37.9.14-OPTION-A-🚀.sh
   ```

2. **Verify version**:
   ```bash
   ssh root@64.23.145.7 "pm2 logs backend --lines 20 | grep v37.9.14"
   ```

3. **Test on your site**:
   - Open browser console (F12)
   - Ask a question
   - Check if citations = sources

4. **Check backend logs**:
   ```bash
   ssh root@64.23.145.7 "pm2 logs backend --lines 100"
   ```
   Look for: "DUPLICATE CITATIONS REMOVED"

5. **Report back**:
   - ✅ If gap = 0: Celebrate! It worked!
   - 🟡 If gap reduced (e.g., 2→1): Progress! Test more.
   - ❌ If gap unchanged: Share logs for analysis.

---

## 📞 QUICK COMMANDS REFERENCE

```bash
# Deploy
chmod +x 🚀-DEPLOY-v37.9.14-OPTION-A-🚀.sh
./🚀-DEPLOY-v37.9.14-OPTION-A-🚀.sh

# Check PM2 status
ssh root@64.23.145.7 "pm2 list"

# Check version
ssh root@64.23.145.7 "pm2 logs backend --lines 20 | grep v37.9.14"

# View recent logs
ssh root@64.23.145.7 "pm2 logs backend --lines 100"

# Nuclear restart (if needed)
ssh root@64.23.145.7 "pm2 delete all && pm2 kill && pm2 flush && cd /var/www/workforce-democracy/backend && pm2 start ecosystem.config.js && pm2 save"
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Local file `backend/ai-service.js` shows v37.9.14 in header
- [ ] Deployment script is executable
- [ ] Script runs without errors
- [ ] PM2 shows backend as "online"
- [ ] PM2 logs show "v37.9.14 LOADED"
- [ ] PM2 logs show "OPTION A: DEDUPLICATION ACTIVE"
- [ ] Website console shows citations = sources
- [ ] Backend logs show "DUPLICATE CITATIONS REMOVED"
- [ ] Gap is 0 or 1 ✅

---

**You're ready!** Just run the deployment script and follow the verification steps. 🚀

Good luck! 🍀
