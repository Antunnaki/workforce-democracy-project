# 🔧 Backend Diagnostic Commands

**Issue Identified:** PM2 process `workforce-backend` has **129 restarts** in 60 minutes, indicating repeated crashes.

---

## 🚨 Critical Commands to Run

### 1. Check Error Logs (Most Important)

```bash
pm2 logs workforce-backend --err --lines 100
```

This will show the **last 100 error messages** that caused the crashes.

---

### 2. Check All Recent Logs

```bash
pm2 logs workforce-backend --lines 100
```

This shows both stdout and stderr (normal logs + errors).

---

### 3. Check Current Process Info

```bash
pm2 describe workforce-backend
```

This shows detailed information about the process, including:
- Restart count
- Uptime
- Memory usage
- Error logs location

---

### 4. Check Server.js for Syntax Errors

```bash
cd /var/www/workforce-democracy/backend
node server.js
```

This will start the server directly (not through PM2) and show any immediate errors.

**Press `Ctrl+C` to stop after checking for errors.**

---

### 5. Check Environment Variables

```bash
cat /var/www/workforce-democracy/backend/.env
```

Make sure all required variables are set:
- `PORT` (should be 3000 or similar)
- `DATABASE_URL` (if using database)
- `GROQ_API_KEY` (for AI chat)
- `CONGRESS_API_KEY`
- `OPENSTATES_API_KEY`

---

### 6. Check Node.js Version

```bash
node --version
npm --version
```

Make sure you're running a compatible version (Node 16+ recommended).

---

### 7. Check for Port Conflicts

```bash
lsof -i :3000
```

If another process is using port 3000, that could cause crashes.

---

## 🔍 Common Issues & Fixes

### Issue 1: Missing Dependencies

**Symptom:** Error like `Cannot find module 'express'`

**Fix:**
```bash
cd /var/www/workforce-democracy/backend
npm install
pm2 restart workforce-backend
```

---

### Issue 2: Port Already in Use

**Symptom:** Error like `EADDRINUSE: address already in use :::3000`

**Fix:**
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Then restart
pm2 restart workforce-backend
```

---

### Issue 3: Missing Environment Variables

**Symptom:** Error like `Cannot read property 'GROQ_API_KEY' of undefined`

**Fix:**
```bash
# Check .env file
cat /var/www/workforce-democracy/backend/.env

# Make sure it has:
PORT=3000
GROQ_API_KEY=your_key_here
CONGRESS_API_KEY=your_key_here
OPENSTATES_API_KEY=your_key_here
```

---

### Issue 4: Database Connection Error

**Symptom:** Error like `ECONNREFUSED` or `PostgreSQL connection failed`

**Fix:**
```bash
# Check if PostgreSQL is running
systemctl status postgresql

# If stopped, start it
systemctl start postgresql
```

---

### Issue 5: Syntax Error in server.js

**Symptom:** Error like `SyntaxError: Unexpected token`

**Fix:**
```bash
# Check for syntax errors
node -c /var/www/workforce-democracy/backend/server.js

# If errors, edit the file
nano /var/www/workforce-democracy/backend/server.js
```

---

## 🚀 After Fixing Issues

Once you've identified and fixed the issue:

```bash
# Restart the backend
pm2 restart workforce-backend

# Watch logs in real-time
pm2 logs workforce-backend

# Check status
pm2 status
```

**Look for:**
- ✅ `Server running on port 3000`
- ✅ `0 restarts` after a few minutes
- ✅ Status: `online`

---

## 📊 What to Share

After running the diagnostic commands, share:

1. **Error logs:** Output from `pm2 logs workforce-backend --err --lines 100`
2. **Node version:** Output from `node --version`
3. **Environment check:** Confirm .env file exists and has required keys (don't share actual keys)
4. **Direct run result:** What happens when you run `node server.js` directly

This will help me provide specific fixes for your backend issues.

---

## 🎯 Expected Behavior (When Working)

```bash
pm2 status
```

Should show:
```
┌────┬───────────────────┬─────────┬─────────┬──────┬──────────┐
│ id │ name              │ status  │ restart │ cpu  │ memory   │
├────┼───────────────────┼─────────┼─────────┼──────┼──────────┤
│ 0  │ workforce-backend │ online  │ 0       │ 0%   │ 70.6mb   │
└────┴───────────────────┴─────────┴─────────┴──────┴──────────┘
```

**Key indicator:** `restart` should be **0** or very low (not 129).

---

**Start with command #1 (error logs) and share the output!** 🔍
