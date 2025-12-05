# 📁 PROJECT DIRECTORY STRUCTURE - OFFICIAL REFERENCE

**Last Updated**: November 9, 2025  
**Status**: ✅ VERIFIED AND CONFIRMED

---

## 🎯 ACTIVE PRODUCTION DIRECTORIES

### **1. Frontend (Static Website)**
```
Location: /var/www/workforce-democracy/
Purpose:  Netlify-deployed static frontend
Files:    index.html, CSS, JS, images, etc.
```

### **2. Backend API (Node.js + PM2)**
```
Location: /var/www/workforce-democracy/backend/
Purpose:  Active backend API server
PM2 Name: backend
Main File: /var/www/workforce-democracy/backend/ai-service.js
Port:     3001
Status:   ✅ ACTIVE
```

**Key Backend Files:**
- `ai-service.js` - Main API router and AI integration
- `rss-service.js` - RSS feed aggregation
- `article-scraper.js` - Full article content extraction
- `server.js` - Express server entry point
- `ecosystem.config.js` - PM2 configuration
- `.env` - Environment variables (API keys)

---

## 🗂️ BACKUP DIRECTORIES

### **1. Latest Backend Backup**
```
Location: /var/www/workforce-democracy/backend-backup-20251106-223814/
Purpose:  Backup before November 6, 2025 changes
Status:   🔒 ARCHIVED - DO NOT MODIFY
```

---

## 🚫 ORPHANED FILES TO ARCHIVE

### **1. Root-level ai-service.js**
```
Location: /root/ai-service.js
Status:   ⚠️ ORPHANED - Should be archived
Action:   Move to archive directory
```

**Cleanup Command:**
```bash
mkdir -p /root/archive-old-files
mv /root/ai-service.js /root/archive-old-files/ai-service.js.$(date +%Y%m%d)
```

---

## 📊 PM2 PROCESS INFORMATION

### **Current Active Process:**
```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ backend            │ fork     │ 0    │ online    │ 0%       │ 88.9mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘

Process Name:    backend (NOT "news-backend")
Working Dir:     /var/www/workforce-democracy/backend/
Entry Point:     server.js
Configuration:   ecosystem.config.js
```

---

## 🔧 CRITICAL PM2 COMMANDS

**⚠️ IMPORTANT: Process name is `backend`, NOT `news-backend`**

```bash
# View logs
pm2 logs backend --lines 50

# Restart backend
pm2 restart backend

# Stop backend
pm2 stop backend

# Start backend
pm2 start backend

# Check status
pm2 info backend

# Nuclear restart (clears cache)
pm2 stop backend && pm2 flush backend && pm2 delete backend && pkill -9 node
sleep 2
cd /var/www/workforce-democracy/backend
pm2 start ecosystem.config.js
pm2 save
```

---

## 📝 FILE PATHS QUICK REFERENCE

| File Type | Path |
|-----------|------|
| **Backend Main** | `/var/www/workforce-democracy/backend/ai-service.js` |
| **RSS Service** | `/var/www/workforce-democracy/backend/rss-service.js` |
| **Article Scraper** | `/var/www/workforce-democracy/backend/article-scraper.js` |
| **Server Entry** | `/var/www/workforce-democracy/backend/server.js` |
| **Environment** | `/var/www/workforce-democracy/backend/.env` |
| **PM2 Config** | `/var/www/workforce-democracy/backend/ecosystem.config.js` |
| **Frontend Index** | `/var/www/workforce-democracy/index.html` |
| **Latest Backup** | `/var/www/workforce-democracy/backend-backup-20251106-223814/` |

---

## 🚨 COMMON MISTAKES TO AVOID

❌ **WRONG**: Using process name `news-backend`  
✅ **RIGHT**: Using process name `backend`

❌ **WRONG**: Editing files in `/root/`  
✅ **RIGHT**: Editing files in `/var/www/workforce-democracy/backend/`

❌ **WRONG**: Editing backup directories  
✅ **RIGHT**: Only edit active `/var/www/workforce-democracy/backend/`

---

## 🎯 DEPLOYMENT WORKFLOW

1. **SSH to server**: `ssh root@185.193.126.13`
2. **Navigate to backend**: `cd /var/www/workforce-democracy/backend`
3. **Create backup**: `cp ai-service.js ai-service.js.backup-$(date +%Y%m%d-%H%M%S)`
4. **Make changes**: Edit files with nano/vim or use deployment script
5. **Restart PM2**: `pm2 restart backend`
6. **Check logs**: `pm2 logs backend --lines 50`

---

## 📚 RELATED DOCUMENTATION

- `PROJECT_MASTER_GUIDE.md` - Complete project overview
- `AI-HANDOVER-COMPLETE.md` - AI assistant handover notes
- `START-HERE.md` - Quick start guide

---

**Generated**: November 9, 2025  
**Verified**: Directory structure confirmed via `find` command  
**PM2 Status**: Confirmed via `pm2 list` command
