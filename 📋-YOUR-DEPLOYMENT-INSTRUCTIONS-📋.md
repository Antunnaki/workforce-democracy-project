# 📋 YOUR BACKEND DEPLOYMENT INSTRUCTIONS

**Your Project Path:** `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.9.1`

**VPS:** `185.193.126.13`

**Deployment Method:** Automated `.sh` script (safest, as you requested)

---

## 🚀 QUICK START (3 Steps)

### **Step 1: Get Your Groq API Key** 🔑

1. Open browser → Go to: **https://console.groq.com**
2. Sign up or log in
3. Click **"API Keys"** in left sidebar
4. Click **"Create API Key"**
5. **Copy the key** (starts with `gsk_...`)
6. **Save it somewhere** - you'll need it in Step 2

**Example key format:** `gsk_abc123def456ghi789...`

---

### **Step 2: Edit the Deployment Script** ✏️

1. Open the file: **`⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh`**

2. Find these lines (around line 18-27):

```bash
# ⚠️ 1. Database password - Choose a strong password (8+ characters, letters + numbers)
DB_PASSWORD="YOUR_DATABASE_PASSWORD_HERE"

# ⚠️ 2. Groq API key - Get from https://console.groq.com
#        (starts with "gsk_...")
GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
```

3. **Replace the placeholder values:**

```bash
# ⚠️ 1. Database password - Choose a strong password
DB_PASSWORD="MyStrongPassword123!"

# ⚠️ 2. Groq API key - Paste your actual key here
GROQ_API_KEY="gsk_YOUR_ACTUAL_KEY_HERE"
```

4. **Save the file** (`Cmd+S`)

**That's it!** Everything else is pre-configured for your Mac path.

---

### **Step 3: Run the Script** ▶️

1. Open **Terminal** on your Mac:
   - Press `Cmd+Space`
   - Type "Terminal"
   - Press Enter

2. Navigate to your project:
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.9.1"
```

3. Make the script executable:
```bash
chmod +x ⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh
```

4. Run the script:
```bash
./⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh
```

5. **Enter your VPS SSH password when prompted**

6. **Wait 5-10 minutes** while the script:
   - ✅ Uploads your backend code
   - ✅ Installs Node.js and dependencies
   - ✅ Sets up PostgreSQL database
   - ✅ Configures environment
   - ✅ Starts backend with PM2

7. **Done!** Script will show success message when complete.

---

## ✅ What the Script Does Automatically

The script is **pre-configured** with your exact setup:

| Setting | Value | Status |
|---------|-------|--------|
| Project Path | `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.9.1` | ✅ Pre-configured |
| VPS IP | `185.193.126.13` | ✅ Pre-configured |
| VPS User | `root` | ✅ Pre-configured |
| Database Password | ⚠️ You set this | Edit script |
| Groq API Key | ⚠️ You set this | Edit script |

**You only need to set 2 things:**
1. Database password (choose any strong password)
2. Groq API key (get from console.groq.com)

---

## 🧪 After Deployment - Testing

### **Test 1: Health Check**

From your Mac Terminal:
```bash
curl https://api.workforcedemocracyproject.org/api/civic/llm-health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2025-11-10T..."}
```

---

### **Test 2: Chat Endpoint**

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

---

### **Test 3: Frontend Connection**

1. Open: **https://workforcedemocracyproject.org**
2. Go to **Civic** section → **Bills** tab
3. Press `F12` to open browser console
4. Look for:
   ```
   ✅ Backend API Integration V37.0.2 Loaded
   ✅ [Backend API] Response source: groq-api
   ```
5. Should **NOT** see:
   ```
   ❌ Bills API error: 404
   ❌ Falling back to sample data
   ```

---

## 🆘 Troubleshooting

### **Issue: "Permission denied" when running script**

**Solution:**
```bash
chmod +x ⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh
```

---

### **Issue: "Project directory not found"**

**Check your path:**
```bash
ls "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.9.1/backend"
```

If this fails, your project might be in a different location. Find it:
```bash
# Search for your project
find ~/Desktop -name "WDP-v37.9.1" -type d
```

Then edit the script and update `LOCAL_PROJECT_DIR` with the correct path.

---

### **Issue: "Groq API key not configured"**

**Solution:**
1. Make sure you edited the script
2. Make sure you saved the file after editing
3. Make sure the key starts with `gsk_`
4. Make sure there are no extra spaces or quotes

**Correct format:**
```bash
GROQ_API_KEY="gsk_abc123def456..."
```

**Wrong formats:**
```bash
GROQ_API_KEY=""                          # Empty
GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"   # Not replaced
GROQ_API_KEY=" gsk_abc123..."           # Extra space at start
```

---

### **Issue: SSH password prompt doesn't work**

**Solution:**
The script will prompt you for SSH password. If it doesn't work, you can add it to the script:

```bash
# Find this line in the script:
VPS_SSH_PASSWORD=""

# Change to (optional):
VPS_SSH_PASSWORD="your_actual_ssh_password"
```

---

### **Issue: Health check fails after deployment**

**This is normal!** You may need to configure Nginx and SSL certificates.

**Next steps:**
1. SSH to VPS: `ssh root@185.193.126.13`
2. Check backend is running: `pm2 status`
3. Should see "workforce-democracy-api" as "online"

If backend is running but health check fails, you need Nginx configuration:
- See: `🚀-BACKEND-DEPLOYMENT-FROM-MAC-🚀.md` (Steps 8 & 9)

---

## 📊 Useful Commands After Deployment

### **View Backend Logs:**
```bash
ssh root@185.193.126.13 "pm2 logs workforce-democracy-api --lines 20"
```

### **Restart Backend:**
```bash
ssh root@185.193.126.13 "pm2 restart workforce-democracy-api"
```

### **Check Backend Status:**
```bash
ssh root@185.193.126.13 "pm2 status"
```

### **Check Database:**
```bash
ssh root@185.193.126.13 "sudo -u postgres psql -d workforce_democracy -c 'SELECT COUNT(*) FROM bill_cache;'"
```

---

## 📝 Quick Reference

### **Files You Need:**
1. **`⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh`** - The deployment script
2. **`📋-YOUR-DEPLOYMENT-INSTRUCTIONS-📋.md`** - This file

### **What You Need to Get:**
1. ✅ Groq API key from https://console.groq.com
2. ✅ VPS SSH password (you should already have this)

### **What You Need to Edit:**
1. ✅ `DB_PASSWORD` in the script (choose any strong password)
2. ✅ `GROQ_API_KEY` in the script (paste your key from Groq)

### **Commands to Run:**
```bash
# Navigate to project
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.9.1"

# Make executable
chmod +x ⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh

# Run deployment
./⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh
```

---

## ⏱️ Timeline

| Step | Time | What Happens |
|------|------|-------------|
| Get Groq API key | 2 min | Sign up, create key, copy |
| Edit script | 1 min | Paste API key and set password |
| Run script | 5-10 min | Automated deployment |
| Test | 2 min | Verify endpoints work |
| **Total** | **10-15 min** | **Backend fully deployed!** |

---

## 🎯 Success Checklist

After running the script, verify:

- [ ] Script shows "✅ DEPLOYMENT COMPLETE!"
- [ ] Health check returns `{"status":"ok"}`
- [ ] PM2 shows backend as "online"
- [ ] Frontend console shows "Backend API Integration Loaded"
- [ ] No more "404 - Bills API error" messages

---

## 🎉 What You'll Get

**Before deployment:**
```
❌ Bills API error: 404
❌ Failed to fetch bills from backend
⚠️ Falling back to sample data
```

**After deployment:**
```
✅ Backend API Integration V37.0.2 Loaded
✅ Response source: groq-api
✅ AI-powered bill explanations (Llama 3.3-70b)
✅ PostgreSQL caching (bills cached forever)
✅ Real civic engagement data
```

---

## 💡 Pro Tips

1. **Keep your Groq API key safe** - Don't share it or commit it to Git
2. **Use a strong database password** - Mix letters, numbers, symbols
3. **Save your passwords** - You'll need them if you restart the VPS
4. **Bookmark these commands** - For managing your backend later

---

## 📞 Need Help?

If you get stuck:

1. **Check the error message** - Script will tell you what's wrong
2. **Read troubleshooting section** - Common issues listed above
3. **Check detailed guide** - `🚀-BACKEND-DEPLOYMENT-FROM-MAC-🚀.md`
4. **Ask for help** - Provide the error message you're seeing

---

**Ready to deploy?** 🚀

1. Get Groq API key
2. Edit script (2 variables)
3. Run script
4. Wait 10 minutes
5. Test endpoints
6. Done!

**Your backend will be live!** 🎉
