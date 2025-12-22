# 👉 START HERE - Backend Deployment Guide 👈

**Your Issue:** Frontend shows "404 - Bills API error" because backend is NOT deployed yet.

**Solution:** Deploy backend to your VPS using ONE of the methods below.

---

## 🎯 Choose Your Deployment Method

### **Option 1: Automated Script** ⚡ (Easiest - 5 minutes)

**Best for:** Quick deployment, minimal configuration

1. Open file: `⚡-QUICK-BACKEND-DEPLOY-MAC-⚡.sh`
2. Edit these lines:
   ```bash
   GROQ_API_KEY="your_groq_api_key_here"
   DB_PASSWORD="choose_strong_password_here"
   LOCAL_PROJECT_DIR="/path/to/workforce-democracy-project"
   ```
3. Save file
4. Open Terminal, run:
   ```bash
   chmod +x ⚡-QUICK-BACKEND-DEPLOY-MAC-⚡.sh
   ./⚡-QUICK-BACKEND-DEPLOY-MAC-⚡.sh
   ```
5. Wait 5 minutes ✅

---

### **Option 2: Manual Step-by-Step** 📋 (Recommended - Full control)

**Best for:** Understanding each step, troubleshooting

1. Read complete guide: `🚀-BACKEND-DEPLOYMENT-FROM-MAC-🚀.md`
2. Follow 10 steps with copy-paste commands
3. Each step explained clearly
4. Takes ~15-20 minutes

**Quick Preview:**
```bash
# Step 1: Upload code to VPS
rsync -avz backend/ root@185.193.126.13:/root/workforce-democracy-backend/

# Step 2: SSH to VPS
ssh root@185.193.126.13

# Step 3: Install dependencies (on VPS)
cd /root/workforce-democracy-backend
npm install

# Step 4: Set up database (on VPS)
sudo -u postgres psql -d workforce_democracy -f database-schema.sql

# Step 5: Configure environment (on VPS)
nano .env  # Edit with your Groq API key

# Step 6: Start backend (on VPS)
pm2 start server.js --name "workforce-democracy-api"
```

---

### **Option 3: Super Quick Commands** ⚡ (10 minutes)

**Best for:** Experienced users, fast deployment

Copy-paste these commands **from your Mac Terminal**:

```bash
# 1. Navigate to your project
cd /path/to/workforce-democracy-project

# 2. Upload backend code
rsync -avz --progress backend/ root@185.193.126.13:/root/workforce-democracy-backend/

# 3. Connect to VPS and run setup
ssh root@185.193.126.13 << 'ENDSSH'

# Install dependencies
cd /root/workforce-democracy-backend
npm install

# Create database
sudo -u postgres psql << EOF
CREATE DATABASE workforce_democracy;
CREATE USER wdp_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE workforce_democracy TO wdp_user;
\q
EOF

# Run schema
sudo -u postgres psql -d workforce_democracy -f database-schema.sql

# Create .env file
cat > .env << EOF
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workforce_democracy
DB_USER=wdp_user
DB_PASSWORD=your_password_here
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=https://workforcedemocracyproject.org
API_BASE_URL=https://api.workforcedemocracyproject.org
EOF

# Start backend
pm2 start server.js --name "workforce-democracy-api"
pm2 save

# Show status
pm2 status
pm2 logs --lines 20 --nostream

ENDSSH

# 4. Test from Mac
curl https://api.workforcedemocracyproject.org/api/civic/llm-health
```

**Remember to replace:**
- `your_password_here` - Strong database password
- `your_groq_api_key_here` - Get from https://console.groq.com
- `/path/to/workforce-democracy-project` - Your actual project path

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] **Groq API Key**
  - Sign up: https://console.groq.com
  - Create API key
  - Copy key (starts with `gsk_...`)

- [ ] **VPS SSH Access**
  - Can connect: `ssh root@185.193.126.13`
  - Have password ready

- [ ] **Domain DNS Configured**
  - `api.workforcedemocracyproject.org` points to `185.193.126.13`
  - If not, add A record in your domain registrar

- [ ] **Backend Code Ready**
  - `backend/` folder exists in your project
  - Contains: `server.js`, `package.json`, `database-schema.sql`

---

## ✅ Post-Deployment Verification

After deployment, test these:

### **1. Health Check (Should return OK)**
```bash
curl https://api.workforcedemocracyproject.org/api/civic/llm-health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2025-11-10T..."}
```

### **2. Chat Endpoint (Should return AI response)**
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What is HR 1234?","context":"billExplanation"}'
```

**Expected response:**
```json
{
  "response": "HR 1234 is the Education Funding Equity Act...",
  "model": "llama-3.3-70b-versatile",
  "cached": false
}
```

### **3. Frontend Connection (Should see real data)**

1. Open: https://workforcedemocracyproject.org
2. Go to Civic section → Bills tab
3. Open browser console (F12)
4. Should see:
   ```
   ✅ Backend API Integration V37.0.2 Loaded
   ✅ [Backend API] Response source: groq-api
   ```
5. Should NOT see:
   ```
   ❌ Bills API error: 404
   ❌ Falling back to sample data
   ```

---

## 🆘 Troubleshooting

### **Issue: Can't connect to VPS**

```bash
# Test SSH connection
ssh root@185.193.126.13 "echo Connection successful"

# If fails, check:
# - Is VPS IP correct? (185.193.126.13)
# - Do you have the SSH password?
# - Is SSH port open? (default 22)
```

### **Issue: Health check returns 404**

**Possible causes:**
1. Backend not running
   ```bash
   ssh root@185.193.126.13 "pm2 status"
   # Should show "online"
   ```

2. Nginx not configured
   ```bash
   ssh root@185.193.126.13 "systemctl status nginx"
   # Should be "active (running)"
   ```

3. DNS not configured
   ```bash
   ping api.workforcedemocracyproject.org
   # Should resolve to 185.193.126.13
   ```

### **Issue: Chat endpoint returns errors**

**Check backend logs:**
```bash
ssh root@185.193.126.13 "pm2 logs workforce-democracy-api --lines 50"
```

**Common issues:**
- Missing Groq API key → Check `.env` file
- Database connection failed → Check PostgreSQL is running
- CORS errors → Check Nginx CORS headers

---

## 📚 Additional Resources

| File | Purpose |
|------|---------|
| `👉-START-HERE-BACKEND-DEPLOYMENT-👈.md` | **This file** - Quick start guide |
| `🚀-BACKEND-DEPLOYMENT-FROM-MAC-🚀.md` | Complete manual deployment (step-by-step) |
| `⚡-QUICK-BACKEND-DEPLOY-MAC-⚡.sh` | Automated deployment script |
| `⚡-QUICK-VPS-COMMANDS-⚡.txt` | Quick VPS commands reference |

---

## 🎯 Recommended Path

**For most users:**

1. **Start with:** Option 2 (Manual Step-by-Step)
   - Open: `🚀-BACKEND-DEPLOYMENT-FROM-MAC-🚀.md`
   - Follow 10 steps
   - Understand each command
   - Takes 15-20 minutes

2. **If successful:** Bookmark Option 3 (Quick Commands) for future updates

3. **If stuck:** Check troubleshooting section or ask for help

---

## ⏱️ Time Estimates

| Method | Time | Difficulty | Control |
|--------|------|------------|---------|
| Option 1 (Automated) | 5 min | Easy | Low |
| Option 2 (Manual) | 15-20 min | Medium | High |
| Option 3 (Quick) | 10 min | Medium | Medium |

---

## 🎉 Success Criteria

**You know deployment worked when:**

1. ✅ Health check returns `{"status":"ok"}`
2. ✅ Chat endpoint returns AI responses
3. ✅ Frontend shows real bill explanations (not sample data)
4. ✅ Browser console shows "Backend API Integration Loaded"
5. ✅ No more 404 errors in console

---

**Ready to deploy?** Pick your method above and get started! 🚀

**Questions?** Check the troubleshooting section or refer to the full deployment guide.
