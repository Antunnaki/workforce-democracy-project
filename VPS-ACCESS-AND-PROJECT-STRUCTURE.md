# 🔐 VPS Access & Project Structure - Workforce Democracy Project
## Complete Handover Documentation for AI Assistants

**Last Updated**: February 1, 2025  
**Purpose**: Provide complete context to any AI assistant working on this project

---

## 🖥️ VPS System Information

### Server Details
```
Hostname: Workforce-Backend
OS: Ubuntu 22.04.5 LTS
User: root
Node Version: v18.19.0
PM2: Installed at /opt/nodejs/bin/pm2
```

### Access Information
- **SSH Access**: User has root access
- **Working Directory**: User typically operates from `/var/www/workforce-backend/`
- **No Git Repository**: Project is NOT managed via git (direct file deployment)

---

## 📁 Project Directory Structure

### Critical Path Information

```
/var/www/
├── html/                                    # ✅ FRONTEND (Nginx serves from here)
│   ├── index.html                          # Main homepage
│   ├── css/                                # Stylesheets
│   │   ├── main.css
│   │   ├── community-services.css
│   │   └── [other CSS files]
│   ├── js/                                 # JavaScript files
│   │   ├── main.js
│   │   ├── community-services.js
│   │   ├── nonprofit-widgets.js
│   │   └── [other JS files]
│   └── [other frontend assets]
│
├── workforce-backend/                       # ⚠️ BACKEND API SERVER (PM2 runs from here)
│   ├── server.js                           # Main API server
│   ├── .env                                # Environment variables
│   ├── package.json
│   └── node_modules/
│
└── workforce-democracy/                     # 📦 ADDITIONAL BACKEND SERVICES
    └── backend/
        ├── ai-service.js                   # AI/Groq integration
        ├── server.js                       # Alternative server location
        └── [backup files]
```

### Key Paths to Remember

| Component | Path | Purpose |
|-----------|------|---------|
| **Frontend Files** | `/var/www/html/` | Nginx root - all HTML/CSS/JS |
| **Backend API** | `/var/www/workforce-backend/server.js` | Main Express server (PM2) |
| **AI Service** | `/var/www/workforce-democracy/backend/ai-service.js` | Groq AI integration |
| **Nginx Config** | `/etc/nginx/sites-enabled/default` | Web server configuration |
| **PM2 Binary** | `/opt/nodejs/bin/pm2` | Process manager |

---

## 🔧 Common Commands for AI Assistants

### Always Use These Commands First (Diagnostic)

```bash
# STEP 1: Get complete system overview
echo "=== VPS DIAGNOSTIC INFO ===" && \
echo "Hostname: $(hostname)" && \
echo "User: $(whoami)" && \
echo "Current Dir: $(pwd)" && \
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME)" && \
echo "" && \
echo "=== PM2 STATUS ===" && \
/opt/nodejs/bin/pm2 list && \
echo "" && \
echo "=== FRONTEND CHECK ===" && \
ls -la /var/www/html/ | grep -E "index.html|^d.*js|^d.*css" && \
echo "" && \
echo "=== BACKEND CHECK ===" && \
ls -la /var/www/workforce-backend/ | grep -E "server.js|.env" && \
echo "" && \
echo "=== AI SERVICE CHECK ===" && \
ls -la /var/www/workforce-democracy/backend/ | grep -E "ai-service.js$" | head -5
```

### Frontend Deployment Commands

```bash
# Deploy single frontend file
cat > /var/www/html/path/to/file.js << 'EOF'
[FILE CONTENT HERE]
EOF

# Deploy multiple frontend files using sed
sed -i.backup 's/OLD_TEXT/NEW_TEXT/g' /var/www/html/index.html

# Check frontend file
cat /var/www/html/index.html | grep -A 5 "search term"
```

### Backend Deployment Commands

```bash
# Backup current backend file
cp /var/www/workforce-backend/server.js /var/www/workforce-backend/server.js.backup-$(date +%Y%m%d-%H%M%S)

# Deploy backend changes using sed
sed -i 's/OLD_TEXT/NEW_TEXT/g' /var/www/workforce-backend/server.js

# Restart PM2 after backend changes
/opt/nodejs/bin/pm2 restart workforce-backend

# Check PM2 logs
/opt/nodejs/bin/pm2 logs workforce-backend --lines 50
```

### AI Service Deployment Commands

```bash
# Backup AI service
cp /var/www/workforce-democracy/backend/ai-service.js \
   /var/www/workforce-democracy/backend/ai-service.js.backup-$(date +%Y%m%d-%H%M%S)

# Deploy AI service changes
sed -i 's/OLD_TEXT/NEW_TEXT/g' /var/www/workforce-democracy/backend/ai-service.js

# Restart PM2 (AI service runs through main backend)
/opt/nodejs/bin/pm2 restart workforce-backend
```

---

## 🚀 Standard Deployment Workflow

### For Frontend Changes (HTML/CSS/JS)

1. **Verify file location**:
   ```bash
   ls -la /var/www/html/[path to file]
   ```

2. **Backup if modifying existing file**:
   ```bash
   cp /var/www/html/[file] /var/www/html/[file].backup-$(date +%Y%m%d-%H%M%S)
   ```

3. **Deploy new file** or **modify existing**:
   ```bash
   # New file
   cat > /var/www/html/[path] << 'EOF'
   [content]
   EOF
   
   # Or modify existing
   sed -i 's/OLD/NEW/g' /var/www/html/[file]
   ```

4. **Verify deployment**:
   ```bash
   cat /var/www/html/[file] | head -20
   ```

5. **No restart needed** for frontend (Nginx serves static files)

### For Backend Changes (server.js, ai-service.js)

1. **Backup current file**:
   ```bash
   cp /var/www/workforce-backend/server.js /var/www/workforce-backend/server.js.backup-$(date +%Y%m%d-%H%M%S)
   ```

2. **Deploy changes**:
   ```bash
   sed -i 's/OLD/NEW/g' /var/www/workforce-backend/server.js
   ```

3. **Validate syntax** (optional but recommended):
   ```bash
   node -c /var/www/workforce-backend/server.js
   ```

4. **Restart PM2**:
   ```bash
   /opt/nodejs/bin/pm2 restart workforce-backend
   ```

5. **Verify restart**:
   ```bash
   /opt/nodejs/bin/pm2 logs workforce-backend --lines 20
   ```

---

## 🎯 PM2 Process Management

### Current PM2 Configuration

```
Process Name: workforce-backend
Process ID: 0
Status: online
Restarts: 31 (as of last check)
Uptime: Variable
PID: 56967 (changes on restart)
Memory: ~67MB
```

### Essential PM2 Commands

```bash
# List all processes
/opt/nodejs/bin/pm2 list

# Get detailed info
/opt/nodejs/bin/pm2 info workforce-backend

# View logs (last 50 lines)
/opt/nodejs/bin/pm2 logs workforce-backend --lines 50

# View logs in real-time
/opt/nodejs/bin/pm2 logs workforce-backend

# Restart process
/opt/nodejs/bin/pm2 restart workforce-backend

# Stop process
/opt/nodejs/bin/pm2 stop workforce-backend

# Start process
/opt/nodejs/bin/pm2 start workforce-backend

# Clear logs
/opt/nodejs/bin/pm2 flush
```

---

## 🔍 Debugging Commands

### When Something Goes Wrong

```bash
# Check if backend is responding
curl -I http://localhost:3001/health

# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -50 /var/log/nginx/error.log

# Check PM2 errors
/opt/nodejs/bin/pm2 logs workforce-backend --err --lines 50

# Check system resources
free -h
df -h
top -bn1 | head -20

# Find process using port 3001
lsof -i :3001

# Check if Node is running
ps aux | grep node
```

---

## 📝 Environment Variables

### Backend Environment (.env location)

**File**: `/var/www/workforce-backend/.env`

**Known Variables**:
```bash
# Groq AI API
GROQ_API_KEY=...

# OpenAustralia API (may be unused/deprecated)
OPENAUSTRALIA_API_KEY=...

# Database (if applicable)
# Add database credentials here if used
```

**To view** (be careful with sensitive data):
```bash
cat /var/www/workforce-backend/.env
```

**To modify**:
```bash
nano /var/www/workforce-backend/.env
# Then restart PM2
/opt/nodejs/bin/pm2 restart workforce-backend
```

---

## 🌐 Nginx Configuration

### Current Configuration

**Config File**: `/etc/nginx/sites-enabled/default`

**Document Root**: `/var/www/html/`

**Key Settings**:
- Serves static files from `/var/www/html/`
- Proxy to backend API (if configured)
- Default index files: `index.html`, `index.htm`, `index.nginx-debian.html`

### Nginx Commands

```bash
# Test configuration
nginx -t

# Reload configuration (no downtime)
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx

# View error logs
tail -50 /var/log/nginx/error.log

# View access logs
tail -50 /var/log/nginx/access.log
```

---

## 🗄️ Database Information

### PostgreSQL (If Used)

```bash
# Check if PostgreSQL is running
systemctl status postgresql

# Connect to database (if credentials known)
psql -U [username] -d [database]

# Common database: cached_responses
# Used for: Caching AI responses from Groq
```

**Note**: Database credentials may be in `.env` or stored separately.

---

## 🔄 Common Deployment Scenarios

### Scenario 1: Frontend-Only Update (New CSS/JS)

```bash
# 1. Upload new files
cat > /var/www/html/css/new-file.css << 'EOF'
[CSS content]
EOF

cat > /var/www/html/js/new-file.js << 'EOF'
[JS content]
EOF

# 2. Update index.html to include new files
sed -i '/<\/head>/i <link rel="stylesheet" href="css/new-file.css">' /var/www/html/index.html
sed -i '/<\/body>/i <script src="js/new-file.js"><\/script>' /var/www/html/index.html

# 3. Verify
curl -I http://localhost/css/new-file.css
curl -I http://localhost/js/new-file.js

# 4. Done! (No restart needed)
```

### Scenario 2: Backend API Update

```bash
# 1. Backup
cp /var/www/workforce-backend/server.js /var/www/workforce-backend/server.js.backup-$(date +%Y%m%d-%H%M%S)

# 2. Make changes
sed -i 's/OLD_CODE/NEW_CODE/g' /var/www/workforce-backend/server.js

# 3. Validate syntax
node -c /var/www/workforce-backend/server.js

# 4. Restart
/opt/nodejs/bin/pm2 restart workforce-backend

# 5. Verify
/opt/nodejs/bin/pm2 logs workforce-backend --lines 30
curl http://localhost:3001/health
```

### Scenario 3: AI Service Update (Citation Fix, etc.)

```bash
# 1. Backup
cp /var/www/workforce-democracy/backend/ai-service.js \
   /var/www/workforce-democracy/backend/ai-service.js.backup-$(date +%Y%m%d-%H%M%S)

# 2. Make changes
sed -i 's/CITATION_OLD/CITATION_NEW/g' /var/www/workforce-democracy/backend/ai-service.js

# 3. Restart backend (AI service is imported by main backend)
/opt/nodejs/bin/pm2 restart workforce-backend

# 4. Clear cache if needed
# Connect to PostgreSQL and run:
# TRUNCATE TABLE cached_responses;

# 5. Verify
/opt/nodejs/bin/pm2 logs workforce-backend --lines 30
```

### Scenario 4: Full Stack Update (Frontend + Backend)

```bash
# 1. Deploy frontend files first
cat > /var/www/html/js/new-feature.js << 'EOF'
[content]
EOF

# 2. Update index.html
sed -i '/<\/body>/i <script src="js/new-feature.js"><\/script>' /var/www/html/index.html

# 3. Backup backend
cp /var/www/workforce-backend/server.js /var/www/workforce-backend/server.js.backup-$(date +%Y%m%d-%H%M%S)

# 4. Update backend
sed -i 's/OLD/NEW/g' /var/www/workforce-backend/server.js

# 5. Restart backend
/opt/nodejs/bin/pm2 restart workforce-backend

# 6. Verify both
curl -I http://localhost/js/new-feature.js
/opt/nodejs/bin/pm2 logs workforce-backend --lines 20
```

---

## ⚠️ Important Notes for AI Assistants

### 🔑 AI ASSISTANT DEPLOYMENT CAPABILITY

**AI Assistants CANNOT deploy directly to the VPS**

AI assistants working in GenSpark have:
- ✅ **File manipulation tools** - Read, Write, Edit files in GenSpark workspace
- ✅ **Documentation creation** - Create deployment guides and scripts
- ✅ **Code preparation** - Prepare all code ready for deployment
- ❌ **NO SSH/bash access** - Cannot execute commands on remote VPS
- ❌ **NO direct deployment** - Cannot run sed, cat, or PM2 restart

**What AI Assistants SHOULD do:**
- ✅ Prepare complete deployment-ready code
- ✅ Create clear step-by-step deployment scripts
- ✅ Provide exact copy/paste commands for user
- ✅ Create automated bash scripts user can run
- ✅ Document what needs to be deployed and how

**What USER needs to do:**
- ✅ SSH into VPS manually
- ✅ Run the deployment scripts AI assistant provides
- ✅ Copy/paste commands from deployment guides
- ✅ Report back success/errors to AI assistant
- ✅ Provide logs if troubleshooting needed

### Critical Rules

1. **ALWAYS backup before modifying files**
   ```bash
   cp [file] [file].backup-$(date +%Y%m%d-%H%M%S)
   ```

2. **Use absolute paths** (not relative)
   - ✅ `/var/www/html/index.html`
   - ❌ `html/index.html`

3. **Always use full PM2 path**: `/opt/nodejs/bin/pm2`
   - Not just `pm2` (may not be in PATH)

4. **Frontend changes = No restart needed**
   - HTML/CSS/JS served directly by Nginx

5. **Backend changes = PM2 restart required**
   - Always restart after modifying server.js or ai-service.js

6. **Validate syntax before deploying**
   ```bash
   node -c /path/to/file.js
   ```

7. **Check logs after restart**
   ```bash
   /opt/nodejs/bin/pm2 logs workforce-backend --lines 30
   ```

### User Preferences

- **User is root**: Full system access
- **No git**: Direct file deployment preferred
- **sed preferred** for inline edits
- **cat with heredoc** for new files
- **User wants both frontend and backend** handled simultaneously when applicable

---

## 🧪 Testing Commands

### After Deployment

```bash
# Frontend test
curl -I http://localhost/
curl -I http://localhost/js/community-services.js
curl -I http://localhost/css/community-services.css

# Backend test
curl http://localhost:3001/health
curl http://localhost:3001/api/status

# PM2 status
/opt/nodejs/bin/pm2 status

# Check for errors
/opt/nodejs/bin/pm2 logs workforce-backend --err --lines 20

# System health
free -h
df -h
```

---

## 📊 Known Recent Issues & Fixes

### Citation Format Issue (V36.8.4)
- **Problem**: Citations displaying as `__CITATION0__` instead of `[1]`
- **Fix Location**: `/var/www/workforce-democracy/backend/ai-service.js`
- **Function**: `fixCitationFormat()`
- **Applied to**: Lines 507, 516, 526 in response paths

### Nonprofit Widget Issue (V36.9.0)
- **Problem**: "Unable to load organizations"
- **Fix**: Replaced with community-services.js widget
- **Files**:
  - `/var/www/html/js/community-services.js`
  - `/var/www/html/css/community-services.css`
  - `/var/www/html/index.html` (updated to include new widget)

---

## 🔗 Related Documentation

Files that should be reviewed for context:

1. **README.md** - Project overview (if exists)
2. **COMMUNITY-SERVICES-IMPLEMENTATION-V36.9.md** - Latest feature
3. **DEPLOY-NOW-V36.9.0.md** - Deployment guide
4. **Previous conversation summaries** - For historical context

---

## 💬 Quick Reference for Common User Requests

| User Says | They Mean | Action |
|-----------|-----------|--------|
| "Deploy to VPS" | Update files on server | Use sed or cat to deploy |
| "Frontend changes" | HTML/CSS/JS updates | Deploy to `/var/www/html/` |
| "Backend changes" | API/server updates | Deploy to `/var/www/workforce-backend/` + restart PM2 |
| "Fix citations" | Update AI service | Modify `/var/www/workforce-democracy/backend/ai-service.js` |
| "Clear cache" | Reset AI responses | `TRUNCATE cached_responses` in PostgreSQL |
| "Restart backend" | Reload Node.js server | `/opt/nodejs/bin/pm2 restart workforce-backend` |

---

## 🎯 Workflow Summary for New Assistants

### When You Start a Session:

1. **Run diagnostic command** (see "Always Use These Commands First")
2. **Review this document** for paths and structure
3. **Ask user for clarification** on frontend vs backend changes
4. **Create backup** before making changes
5. **Deploy changes** using appropriate commands
6. **Restart if backend** (PM2 restart)
7. **Verify deployment** with test commands
8. **Report success** with clear summary

---

## 📞 Emergency Contacts / Rollback

### If Something Breaks

```bash
# 1. Check what's wrong
/opt/nodejs/bin/pm2 logs workforce-backend --err --lines 50

# 2. Restore from backup
cp /var/www/workforce-backend/server.js.backup-[TIMESTAMP] \
   /var/www/workforce-backend/server.js

# 3. Restart
/opt/nodejs/bin/pm2 restart workforce-backend

# 4. Verify
/opt/nodejs/bin/pm2 logs workforce-backend --lines 20
```

### List Available Backups

```bash
# Backend backups
ls -lht /var/www/workforce-backend/*.backup* | head -10

# AI service backups
ls -lht /var/www/workforce-democracy/backend/*.backup* | head -10
```

---

## ✅ Final Checklist for Assistants

Before ending a session, verify:

- [ ] All files deployed to correct locations
- [ ] Backups created for modified files
- [ ] PM2 restarted if backend changed
- [ ] No syntax errors in logs
- [ ] Frontend files accessible via curl
- [ ] Backend responding on port 3001
- [ ] Documentation updated (if major changes)
- [ ] User informed of changes made

---

**This document should be the FIRST thing provided to any AI assistant taking over this project.**

It contains everything needed to understand the VPS structure and deploy changes correctly.

**Last Updated**: February 1, 2025  
**Version**: 1.0  
**Maintainer**: User (root@Workforce-Backend)
