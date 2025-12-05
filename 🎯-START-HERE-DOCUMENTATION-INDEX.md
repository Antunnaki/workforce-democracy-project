# 🎯 START HERE - Documentation Index

**Workforce Democracy Project v37.1.0**  
**Last Updated**: November 4, 2025

---

## 📚 Essential Documentation (Read These First)

### **1. Complete Overview**
📄 **[PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md](PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md)**
- **What it is**: Complete project documentation in ONE file
- **When to read**: Starting any session, onboarding new AI assistants
- **Contains**:
  - Current architecture (v37.1.0)
  - API endpoints and examples
  - Enhanced AI features explained
  - File locations and structure
  - Cost analysis
  - FAQ

### **2. Quick Command Reference**
🖥️ **[TERMINAL-COMMANDS-QUICK-REFERENCE.md](TERMINAL-COMMANDS-QUICK-REFERENCE.md)**
- **What it is**: Copy/paste terminal commands
- **When to use**: Deploying, testing, troubleshooting
- **Contains**:
  - Deployment commands (automated & manual)
  - Testing commands for all features
  - Troubleshooting commands
  - Rollback commands
  - Monitoring commands

### **3. VPS Access Guide**
🔐 **[VPS-ACCESS-AND-PROJECT-STRUCTURE.md](VPS-ACCESS-AND-PROJECT-STRUCTURE.md)**
- **What it is**: VPS structure and paths
- **When to read**: Working with backend files, SSH access
- **Contains**:
  - Server details (Ubuntu 22.04, Node v18)
  - Directory structure (`/var/www/`)
  - PM2 process management
  - Nginx configuration
  - Common workflows

---

## 🎯 Quick Start (New Session)

### **For Users**

**1. Deploy Enhanced AI** (if not already done):
```bash
cd ~/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/WDP-V37.1.0/
chmod +x DEPLOY-ENHANCED-AI-v37.1.0.sh
./DEPLOY-ENHANCED-AI-v37.1.0.sh
```

**2. Test Enhanced Features**:
```bash
# Health check
curl https://api.workforcedemocracyproject.org/api/civic/health

# LLM health
curl https://api.workforcedemocracyproject.org/api/civic/llm-health

# Representative search
curl "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061"

# Enhanced temporal detection
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is happening with the NYC mayoral race tonight?", "context": "general"}'
```

---

### **For AI Assistants**

**1. Read This First**:
- [ ] [PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md](PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md) - Complete overview

**2. Understand Backend Structure**:
```
/var/www/workforce-democracy/backend/  ← SINGLE SOURCE OF TRUTH
├── server.js (v37.0.1)
├── ai-service.js (v37.1.0 - ENHANCED)
├── routes/civic-routes.js
└── utils/
    ├── scraping-queue.js
    ├── smart-cache-manager.js (optional)
    └── chart-generator.js (optional)

ARCHIVED-CIVIC-BACKEND-20251104/  ← DO NOT EDIT (reference only)
```

**3. Remember Key Facts**:
- ✅ **PM2 process name**: `backend` (NOT `workforce-democracy-backend`)
- ✅ **Backend path**: `/var/www/workforce-democracy/backend/`
- ✅ **Civic routes**: Consolidated in `routes/civic-routes.js`
- ✅ **AI service**: Enhanced with v37.1.0 features
- ✅ **Domain**: TBD (user to confirm actual domain)

**4. Common Tasks**:
- Check status: `/opt/nodejs/bin/pm2 list`
- View logs: `/opt/nodejs/bin/pm2 logs backend --lines 30`
- Restart: `/opt/nodejs/bin/pm2 restart backend`

---

## 📖 Additional Documentation

### **Backend Consolidation**
📄 **[BACKEND-CONSOLIDATION-v37.1.0.md](BACKEND-CONSOLIDATION-v37.1.0.md)**
- Details of backend consolidation (user requested "aggressive" approach)
- Before/after architecture
- Files merged and archived

### **Complete Status Report**
✅ **[COMPLETE-STATUS-v37.1.0.md](COMPLETE-STATUS-v37.1.0.md)**
- Task completion summary (6/7 tasks complete)
- What was accomplished
- Enhanced AI features explained
- Optional modules created
- Deployment instructions
- Testing checklist

### **Session Summary**
📋 **[SESSION-SUMMARY-v37.1.0.md](SESSION-SUMMARY-v37.1.0.md)**
- Session duration: ~45 minutes
- Tasks completed
- Files created/modified

### **Deployment Guide**
🚀 **[START-HERE-v37.1.0-DEPLOYMENT.md](START-HERE-v37.1.0-DEPLOYMENT.md)**
- Deployment instructions
- Testing procedures
- Rollback plan

### **Main README**
📘 **[README.md](README.md)**
- Project overview
- Version history
- Feature list
- API endpoints

---

## 🔧 Troubleshooting Guides

### **Common Issues**

| Issue | Documentation | Solution |
|-------|---------------|----------|
| PM2 not starting | [TERMINAL-COMMANDS-QUICK-REFERENCE.md](TERMINAL-COMMANDS-QUICK-REFERENCE.md) | Check logs for errors |
| CORS errors | [PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md](PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md) | Nginx handles CORS, not backend |
| Module not found | [BACKEND-CONSOLIDATION-v37.1.0.md](BACKEND-CONSOLIDATION-v37.1.0.md) | Use `./routes/civic-routes` |
| Wrong PM2 name | [TERMINAL-COMMANDS-QUICK-REFERENCE.md](TERMINAL-COMMANDS-QUICK-REFERENCE.md) | Use `backend`, not `workforce-democracy-backend` |

---

## 📊 Current Status (v37.1.0)

### **✅ Complete**
- [x] Backend consolidated to single location
- [x] Enhanced AI service with temporal detection
- [x] Dynamic date injection (calculated per request)
- [x] Smart multi-tier caching (7d news, 90d finance)
- [x] Latest Llama 3.3-70b-versatile model
- [x] Badge colors fixed (inline styles)
- [x] civic/backend archived
- [x] Documentation complete

### **⏳ Pending**
- [ ] Deploy enhanced AI to VPS (user action)
- [ ] Test enhanced features (user action)
- [ ] Optional: Integrate smart-cache-manager.js
- [ ] Optional: Integrate chart-generator.js

### **📈 Next Steps**
1. **Deploy enhanced AI** using automated script
2. **Test temporal detection** with NYC mayoral query
3. **Verify dynamic date** in PM2 logs
4. **Test smart caching** with repeated queries

---

## 💡 Quick Reference

### **Key Paths**
- **Backend**: `/var/www/workforce-democracy/backend/`
- **Frontend**: `/var/www/html/` (or Netlify deployment)
- **PM2 Binary**: `/opt/nodejs/bin/pm2`
- **Nginx Config**: `/etc/nginx/sites-enabled/default`

### **Key Files**
- `server.js` - Main Express server (v37.0.1)
- `ai-service.js` - Enhanced AI service (v37.1.0)
- `routes/civic-routes.js` - Consolidated civic endpoints
- `.env` - API keys (GROQ_API_KEY)

### **API Endpoints**
- `GET /api/civic/health` - Health check
- `GET /api/civic/llm-health` - LLM availability
- `POST /api/civic/llm-chat` - AI chat with source search
- `GET /api/civic/representatives/search?zip=12061` - Find reps by ZIP

### **Essential Commands**
```bash
# SSH
ssh root@185.193.126.13

# PM2 status
/opt/nodejs/bin/pm2 list

# View logs
/opt/nodejs/bin/pm2 logs backend --lines 30

# Restart
/opt/nodejs/bin/pm2 restart backend

# Test health
curl https://api.workforcedemocracyproject.org/api/civic/health
```

---

## 🎓 For New AI Assistants

**Welcome! Here's what you need to know:**

1. **Read [PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md](PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md) first** - Complete overview in ONE file

2. **Backend is consolidated** - All code in `/var/www/workforce-democracy/backend/`, NOT `civic/backend/`

3. **PM2 process is named `backend`** - NOT `workforce-democracy-backend`

4. **AI service is enhanced** - v37.1.0 with temporal detection, dynamic date, smart caching

5. **User is root** - Full VPS access, prefers direct file deployment (not git)

6. **Use [TERMINAL-COMMANDS-QUICK-REFERENCE.md](TERMINAL-COMMANDS-QUICK-REFERENCE.md)** for all deployment/testing commands

---

## 📞 Quick Help

### **"I need to deploy changes"**
→ Read: [TERMINAL-COMMANDS-QUICK-REFERENCE.md](TERMINAL-COMMANDS-QUICK-REFERENCE.md) (Deployment section)

### **"I need to understand the architecture"**
→ Read: [PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md](PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md) (Architecture section)

### **"I need to troubleshoot"**
→ Read: [TERMINAL-COMMANDS-QUICK-REFERENCE.md](TERMINAL-COMMANDS-QUICK-REFERENCE.md) (Troubleshooting section)

### **"I need VPS paths"**
→ Read: [VPS-ACCESS-AND-PROJECT-STRUCTURE.md](VPS-ACCESS-AND-PROJECT-STRUCTURE.md)

### **"What's the current status?"**
→ Read: [COMPLETE-STATUS-v37.1.0.md](COMPLETE-STATUS-v37.1.0.md)

---

## 🎉 Summary

**Everything you need is in these 3 files:**

1. **[PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md](PROJECT-DOCUMENTATION-SUMMARY-v37.1.0.md)** - Complete overview
2. **[TERMINAL-COMMANDS-QUICK-REFERENCE.md](TERMINAL-COMMANDS-QUICK-REFERENCE.md)** - All commands
3. **[VPS-ACCESS-AND-PROJECT-STRUCTURE.md](VPS-ACCESS-AND-PROJECT-STRUCTURE.md)** - VPS details

**Start with #1, use #2 for commands, reference #3 for paths.**

---

**Version**: v37.1.0  
**Status**: ✅ READY FOR DEPLOYMENT  
**Last Updated**: November 4, 2025
