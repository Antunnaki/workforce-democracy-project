# 🖥️ Terminal Commands - Quick Reference

**For**: Workforce Democracy Project v37.1.0  
**Purpose**: Copy/paste commands for common tasks  
**Updated**: November 4, 2025

---

## 🚀 Deployment Commands

### **Option 1: Automated Deployment** (Recommended)

```bash
# From your local machine
cd ~/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/WDP-V37.1.0/

# Make script executable (first time only)
chmod +x DEPLOY-ENHANCED-AI-v37.1.0.sh

# Run deployment
./DEPLOY-ENHANCED-AI-v37.1.0.sh
```

**Note**: Script currently tries to restart `workforce-democracy-backend`, but actual process name is `backend`. If script fails at restart step, use manual commands below.

---

### **Option 2: Manual Deployment** (If script fails)

**Step 1: SSH into VPS**
```bash
ssh root@185.193.126.13
```

**Step 2: Backup current ai-service.js**
```bash
cd /var/www/workforce-democracy/backend
cp ai-service.js ai-service-BACKUP-$(date +%Y%m%d-%H%M%S).js
```

**Step 3: Exit SSH and upload from local machine**
```bash
exit  # Exit SSH first

# From your local machine
cd ~/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/WDP-V37.1.0/
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

**Step 4: SSH back in and restart PM2**
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 restart backend
```

**Step 5: Check logs**
```bash
/opt/nodejs/bin/pm2 logs backend --lines 30
```

**Expected**: No errors, server running on port 3001

---

## 🔍 Diagnostic Commands

### **Check PM2 Status**

```bash
ssh root@185.193.126.13
/opt/nodejs/bin/pm2 list
```

**Expected**:
```
┌────┬────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name   │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ backend│ fork     │ XX   │ online    │ 0%       │ XX.Xmb   │
└────┴────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

**IMPORTANT**: Process name is `backend`, NOT `workforce-democracy-backend`

---

### **View Logs**

```bash
# Last 30 lines
/opt/nodejs/bin/pm2 logs backend --lines 30

# Real-time logs (Ctrl+C to exit)
/opt/nodejs/bin/pm2 logs backend

# Errors only
/opt/nodejs/bin/pm2 logs backend --err --lines 20
```

**Expected**:
```
✅ No ReferenceError
✅ "🏛️ Civic Platform API Routes initialized"
✅ "Server running on port 3001"
```

---

### **Check Backend Files**

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend

# List key files
ls -lh server.js ai-service.js routes/civic-routes.js

# Check ai-service.js version
head -20 ai-service.js | grep -i version
```

---

## 🧪 Testing Commands

### **Test 1: Health Check**

```bash
curl https://api.workforcedemocracyproject.org/api/civic/health
```

**Expected**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-04T...",
  "services": {
    "representatives": "operational",
    "llmChat": "operational"
  },
  "version": "37.1.0"
}
```

---

### **Test 2: LLM Health**

```bash
curl https://api.workforcedemocracyproject.org/api/civic/llm-health
```

**Expected**:
```json
{
  "success": true,
  "available": true,
  "model": "llama-3.3-70b-versatile",
  "provider": "Groq",
  "message": "LLM service is available"
}
```

---

### **Test 3: Representative Search**

```bash
curl "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061"
```

**Expected**: Returns real representatives for ZIP 12061

---

### **Test 4: Enhanced Temporal Detection**

```bash
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is happening with the NYC mayoral race tonight?", "context": "general"}'
```

**Expected**: Source search triggered, current news returned

---

### **Test 5: Dynamic Date Injection**

```bash
# Check PM2 logs for current date
ssh root@185.193.126.13
/opt/nodejs/bin/pm2 logs backend --lines 20 | grep -i "current date"
```

**Expected**: Logs show current date (November 4, 2025), not old date

---

### **Test 6: Smart Caching**

```bash
# Run same query twice
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is democracy?", "context": "general"}'

# Wait 2 seconds, then run again
sleep 2

curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is democracy?", "context": "general"}'

# Check logs for cache hit
ssh root@185.193.126.13
/opt/nodejs/bin/pm2 logs backend --lines 10 | grep -i "cache"
```

**Expected**: Second call shows "✅ Cache hit"

---

## 🛠️ Troubleshooting Commands

### **Backend Not Starting**

```bash
# Check PM2 status
/opt/nodejs/bin/pm2 list

# If status is "errored"
/opt/nodejs/bin/pm2 logs backend --err --lines 50

# Check for common errors
/opt/nodejs/bin/pm2 logs backend --lines 100 | grep -i "error\|reference"
```

---

### **CORS Errors**

```bash
# Check Nginx CORS configuration
cat /etc/nginx/sites-enabled/default | grep -A 10 "add_header Access-Control"

# Check backend CORS (should be commented out)
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
grep -n "cors" server.js
```

**Expected**: Backend CORS middleware should be commented out (Nginx handles CORS)

---

### **API Key Issues**

```bash
# Check if GROQ_API_KEY is set
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
grep GROQ_API_KEY .env

# Restart after changing .env
/opt/nodejs/bin/pm2 restart backend --update-env
```

---

### **Module Not Found Errors**

```bash
# Check if civic-routes.js exists
ls -lh /var/www/workforce-democracy/backend/routes/civic-routes.js

# Check server.js for correct require path
grep -n "civic-routes" /var/www/workforce-democracy/backend/server.js
```

**Expected**: Should be `./routes/civic-routes`, not `../civic/backend/civic-api`

---

## 🔄 Rollback Commands

### **If Something Breaks**

```bash
# SSH into VPS
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend

# List backups
ls -lht ai-service-BACKUP-*.js

# Restore backup (replace TIMESTAMP with actual timestamp)
cp ai-service-BACKUP-YYYYMMDD-HHMMSS.js ai-service.js

# Restart PM2
/opt/nodejs/bin/pm2 restart backend

# Check logs
/opt/nodejs/bin/pm2 logs backend --lines 30
```

---

## 📊 Monitoring Commands

### **System Resource Check**

```bash
ssh root@185.193.126.13

# Memory usage
free -h

# Disk usage
df -h

# CPU usage
top -bn1 | head -20

# Backend process
ps aux | grep node
```

---

### **Check Backend Port**

```bash
# Check if port 3001 is in use
lsof -i :3001

# Test backend locally on VPS
curl http://localhost:3001/api/civic/health
```

---

### **Check Nginx**

```bash
# Nginx status
systemctl status nginx

# Nginx error logs
tail -50 /var/log/nginx/error.log

# Nginx access logs
tail -50 /var/log/nginx/access.log
```

---

## 🔐 Environment Variable Commands

### **View .env File**

```bash
ssh root@185.193.126.13
cat /var/www/workforce-democracy/backend/.env
```

**CAUTION**: Contains sensitive API keys. Do not share.

---

### **Edit .env File**

```bash
ssh root@185.193.126.13
nano /var/www/workforce-democracy/backend/.env

# After saving (Ctrl+X, Y, Enter), restart PM2
/opt/nodejs/bin/pm2 restart backend --update-env
```

---

## 📋 Quick Cheatsheet

### **Essential Commands**

| Task | Command |
|------|---------|
| SSH into VPS | `ssh root@185.193.126.13` |
| Check PM2 status | `/opt/nodejs/bin/pm2 list` |
| View logs | `/opt/nodejs/bin/pm2 logs backend --lines 30` |
| Restart backend | `/opt/nodejs/bin/pm2 restart backend` |
| Test health | `curl https://api.workforcedemocracyproject.org/api/civic/health` |
| Upload file | `scp local-file root@185.193.126.13:/remote/path/` |
| Backup file | `cp file file-BACKUP-$(date +%Y%m%d-%H%M%S)` |

---

## ⚠️ Common Mistakes to Avoid

1. **Wrong PM2 process name**: Use `backend`, NOT `workforce-democracy-backend`
2. **Wrong backend path**: Use `/var/www/workforce-democracy/backend/`, NOT `civic/backend/`
3. **Forgot to backup**: Always backup before modifying files
4. **Forgot to restart PM2**: Backend changes require PM2 restart
5. **Running local commands on VPS**: SSH first if modifying VPS files

---

## ✅ Success Indicators

After deployment, you should see:

✅ **PM2 Status**: `online`, not `errored`  
✅ **Zero Restarts**: Or very few restarts after initial deployment  
✅ **Health Check**: Returns `{"success": true, "status": "healthy"}`  
✅ **LLM Available**: Returns `{"available": true, "model": "llama-3.3-70b-versatile"}`  
✅ **No Errors in Logs**: No `ReferenceError` or `Module not found`  
✅ **Representative Search**: Returns real data for ZIP code  
✅ **Chat Works**: LLM returns intelligent responses  

---

**Last Updated**: November 4, 2025  
**Version**: v37.1.0  
**Maintainer**: User (root@Workforce-Backend)
