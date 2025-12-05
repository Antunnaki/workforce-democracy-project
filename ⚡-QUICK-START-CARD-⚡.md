# ⚡ QUICK START CARD ⚡

**Print This, Laminate It, Keep It Handy!**

---

## 🎯 YOUR VPS ESSENTIALS

**VPS IP**: `185.193.126.13`  
**Version A (PROD)**: Port `3001` - **NEVER EDIT DIRECTLY**  
**Version B (TEST)**: Port `3002` - **EDIT HERE FIRST**  
**Database**: `workforce_democracy` (PostgreSQL, shared)  
**Node.js**: `v20.19.5`

---

## 🔴 GOLDEN RULES

1. ❌ **NEVER** edit Version A directly
2. ✅ **ALWAYS** edit Version B first
3. ✅ **ALWAYS** test on port 3002 before deploying
4. ✅ **ALWAYS** use `sync-b-to-a.sh` to deploy
5. ✅ **ALWAYS** check logs after deployment

---

## 📂 QUICK FILE DESTINATIONS

| **File Type** | **Upload To** |
|---------------|---------------|
| Backend JS | `version-b/backend/` |
| Frontend JS | `version-b/frontend/js/` |
| HTML/CSS | `version-b/frontend/` |
| Scripts | `deployment-scripts/` |
| Docs | `docs/` |

---

## 💻 QUICK COMMANDS

### **Upload File**
```bash
scp backend/civic-llm-async.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
```

### **SSH Connect**
```bash
ssh root@185.193.126.13
```

### **Restart Version B**
```bash
sudo systemctl restart workforce-backend-b.service
```

### **Check Status**
```bash
sudo systemctl status workforce-backend-b.service
```

### **View Logs**
```bash
tail -f /var/log/workforce-backend-b.log
```

### **Test API (Version B)**
```bash
curl http://localhost:3002/api/civic/representatives/search?zipCode=12061
```

### **Deploy to Production**
```bash
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

### **Verify Production**
```bash
sudo systemctl status workforce-backend-a.service
curl http://localhost:3001/api/civic/representatives/search?zipCode=12061
tail -f /var/log/workforce-backend-a.log
```

### **Emergency Rollback**
```bash
cd /var/www/workforce-democracy/deployment-scripts
ls -lt ../backups/  # Find latest backup timestamp
./rollback.sh 20251126-235959  # Use actual timestamp
```

---

## ✅ DEPLOYMENT WORKFLOW

```
1. Edit files locally
   ↓
2. Upload to Version B
   scp files → version-b/backend/
   ↓
3. SSH and restart Version B
   sudo systemctl restart workforce-backend-b.service
   ↓
4. Test on port 3002
   curl localhost:3002/api/...
   ↓
5. Check logs for errors
   tail -f /var/log/workforce-backend-b.log
   ↓
6. Deploy to Version A
   cd deployment-scripts/
   ./sync-b-to-a.sh
   ↓
7. Verify production (port 3001)
   curl localhost:3001/api/...
   tail -f /var/log/workforce-backend-a.log
```

---

## 🆘 EMERGENCY CONTACTS

### **Version A Crashed**
```bash
sudo systemctl restart workforce-backend-a.service
tail -100 /var/log/workforce-backend-a.log
```

### **Deployment Failed**
- `sync-b-to-a.sh` auto-rolls back on failure
- Or manually: `./rollback.sh [TIMESTAMP]`

### **Need to Check Database**
```bash
psql -U postgres -d workforce_democracy
SELECT COUNT(*) FROM bill_cache;
\q
```

---

## 📚 QUICK DOCUMENT LINKS

**Primary Guides**:
- 🎯-YOUR-PERSONALIZED-DEPLOYMENT-GUIDE-🎯.md
- 📂-PROJECT-STRUCTURE-UPLOAD-MAP-📂.md
- 📚-MASTER-DOCUMENTATION-INDEX-📚.md

**Reference**:
- PROJECT_SUMMARY.md (Project overview)
- PERSONALIZATION_SYSTEM.md (Privacy architecture)
- 📊-FIX-SUMMARY-v37.18.6-📊.md (Latest fixes)

---

## 🎯 PORTS QUICK REFERENCE

| **Service** | **Port** | **Environment** | **Edit?** |
|-------------|----------|-----------------|-----------|
| Version A | 3001 | Production | ❌ Never |
| Version B | 3002 | Development | ✅ Always |
| PostgreSQL | 5432 | Shared | - |

---

## 🔧 FILE TYPES → RESTART NEEDED?

| **File Type** | **Restart Backend?** |
|---------------|----------------------|
| Backend JS | ✅ Yes |
| Routes | ✅ Yes |
| Utils | ✅ Yes |
| Frontend HTML/CSS/JS | ❌ No |
| Docs | ❌ No |
| Scripts | ❌ No (chmod +x) |

---

## 📊 SUCCESS CHECKLIST

**After Upload to Version B**:
- [ ] File uploaded (check size/timestamp)
- [ ] Service restarted (if backend)
- [ ] Service status checked (running)
- [ ] Logs reviewed (no errors)
- [ ] API tested on port 3002
- [ ] Expected behavior verified

**After Deploy to Version A**:
- [ ] Deployment script completed
- [ ] Version A status checked (running)
- [ ] Logs reviewed (no new errors)
- [ ] API tested on port 3001
- [ ] Production verified
- [ ] Backup created

---

## 💡 PRO TIPS

1. **Always check logs first** when debugging
2. **Test multiple API endpoints** after deploy
3. **Keep recent backups** (auto-created by sync-b-to-a.sh)
4. **Monitor for 5-10 minutes** after production deploy
5. **Document all changes** in commit messages
6. **Never skip testing** in Version B

---

## 🎊 QUICK REFERENCE FOOTER

**Version A**: Production (3001) - **READ ONLY**  
**Version B**: Development (3002) - **EDIT HERE**  
**Deploy**: `./sync-b-to-a.sh` (auto-backup + auto-rollback)  
**Rollback**: `./rollback.sh [TIMESTAMP]`

---

🏛️ **Workforce Democracy Project - Quick Start Card**  
**Keep This Handy for Every Deployment!**

⚡ **Version A/B Deployment System** ⚡
