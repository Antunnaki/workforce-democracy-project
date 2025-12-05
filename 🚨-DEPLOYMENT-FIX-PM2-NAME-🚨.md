# 🚨 DEPLOYMENT FIX - PM2 Process Name Issue

**Date**: November 16, 2025  
**Issue**: PM2 process "workforce-backend" not found  
**Status**: 🔧 **QUICK FIX NEEDED**

---

## 🎯 THE PROBLEM

You successfully completed the backup and file replacement, but PM2 doesn't have a process named "workforce-backend".

**What you saw**:
```
[PM2][ERROR] Process or Namespace workforce-backend not found
```

---

## ✅ WHAT WAS SUCCESSFUL

Good news - these steps worked perfectly! ✅

```bash
✅ Backup created: server-BACKUP-20251116-HHMMSS.js
✅ Files replaced: server.js (now v37.11.4)
✅ Files replaced: routes/personalization.js (corrected version)
```

**Your backend files are updated!** Now we just need to restart PM2 with the correct process name.

---

## 🔍 FIND THE CORRECT PM2 PROCESS NAME

Run this command on your VPS (you're already SSH'd in):

```bash
pm2 status
```

**Expected output**:
```
┌─────┬────────┬─────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name   │ namespace   │ version │ mode    │ pid      │ status │
├─────┼────────┼─────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ server │ default     │ N/A     │ fork    │ 12345    │ online │
└─────┴────────┴─────────────┴─────────┴─────────┴──────────┴────────┘
```

Look for the backend process - it might be named:
- `server`
- `backend`
- `workforce`
- Or an **ID number** like `0` or `1`

---

## 🚀 RESTART COMMANDS (Use the correct name/ID)

### Option 1: If process name is "server"
```bash
pm2 restart server
pm2 logs server --lines 20
```

### Option 2: If process ID is 0
```bash
pm2 restart 0
pm2 logs 0 --lines 20
```

### Option 3: If process ID is 1
```bash
pm2 restart 1
pm2 logs 1 --lines 20
```

### Option 4: If no PM2 process exists (start fresh)
```bash
# Start the backend server
pm2 start server.js --name workforce-backend

# Check status
pm2 status

# View logs
pm2 logs workforce-backend --lines 20
```

### Option 5: Restart all PM2 processes (if unsure)
```bash
pm2 restart all
pm2 logs --lines 20
```

---

## 📋 STEP-BY-STEP FIX

**You're currently SSH'd into the VPS in the correct directory.**

### Step 1: Check PM2 Status
```bash
pm2 status
```

**Copy the output and look for the backend process.**

### Step 2: Restart Using Correct Name/ID

**If you see name "server"**:
```bash
pm2 restart server
```

**If you see ID "0"**:
```bash
pm2 restart 0
```

**If you see nothing**:
```bash
pm2 start server.js --name workforce-backend
```

### Step 3: Verify Deployment
```bash
# Check logs (use correct name/ID)
pm2 logs [NAME_OR_ID] --lines 50
```

**Expected to see**:
```
═══════════════════════════════════════════════════
  🏛️  Workforce Democracy Project - Backend API
═══════════════════════════════════════════════════
  Version: 37.11.4-PERSONALIZATION
  Server running on port 3001
  
  🔐 Personalization: ENABLED
  🏛️  Civic Platform: ENABLED (consolidated routes)
═══════════════════════════════════════════════════
```

### Step 4: Test Health Endpoints
```bash
# Test main health
curl http://localhost:3001/health

# Test personalization health
curl http://localhost:3001/api/personalization/health
```

**Expected**:
```json
{"success":true,"status":"healthy",...}
```

---

## 🎯 QUICK COPY-PASTE COMMANDS

**Run these in order** (you're already in the right directory):

```bash
# 1. Check what PM2 processes exist
pm2 status

# 2. Restart (replace [NAME] with actual name from step 1)
pm2 restart [NAME]

# 3. Check logs
pm2 logs [NAME] --lines 50

# 4. Test health
curl http://localhost:3001/health
curl http://localhost:3001/api/personalization/health
```

---

## 💡 COMMON PM2 PROCESS NAMES

Based on your project, it's likely one of these:

1. **`server`** (most common)
   ```bash
   pm2 restart server
   pm2 logs server --lines 20
   ```

2. **Process ID `0`** (if first process)
   ```bash
   pm2 restart 0
   pm2 logs 0 --lines 20
   ```

3. **`backend`**
   ```bash
   pm2 restart backend
   pm2 logs backend --lines 20
   ```

---

## ✅ VERIFICATION AFTER RESTART

### Check 1: PM2 Status
```bash
pm2 status
```
**Should show**: Status = "online" ✅

### Check 2: Logs
```bash
pm2 logs [NAME] --lines 50
```
**Should show**: Version 37.11.4-PERSONALIZATION ✅

### Check 3: Health Endpoints
```bash
curl http://localhost:3001/health
```
**Should return**: `{"status":"healthy","version":"37.11.4-PERSONALIZATION",...}` ✅

---

## 🚨 IF STILL STUCK

**Show me the output of**:
```bash
pm2 status
```

Then I can give you the exact restart command to use!

---

## 📝 WHAT HAPPENED

**Summary**:
1. ✅ You successfully uploaded files
2. ✅ You successfully created backup
3. ✅ You successfully replaced files
4. ⏸️ PM2 process name is different than expected
5. 🔧 Need to restart with correct name

**Current status**: Files updated, just need correct PM2 restart command!

---

## 🎯 MOST LIKELY SOLUTION

Based on typical PM2 setups, try this first:

```bash
# Check status
pm2 status

# If you see "server" or ID "0", run:
pm2 restart 0

# Check logs
pm2 logs 0 --lines 50

# Test
curl http://localhost:3001/health
```

---

**You're 95% done!** Just need to restart PM2 with the correct process name. Run `pm2 status` and let me know what you see! 🚀
