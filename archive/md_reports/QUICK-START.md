# 🚀 QUICK START - Deploy Nonprofit API Proxy

## The 30-Second Version

### What's Wrong
Community services widget shows but clicking categories doesn't load organizations (CORS blocking ProPublica API)

### The Fix
Route nonprofit searches through your VPS backend (same as chat assistant)

---

## ⚡ DEPLOY NOW (3 steps)

### 1️⃣ SSH into VPS
```bash
ssh root@workforcedemocracyproject.org
```

### 2️⃣ Copy & Paste
Open **`DEPLOY-ONE-PASTE.sh`** → Select ALL → Copy → Paste into terminal → Press Enter

### 3️⃣ Publish Frontend
GenSpark **Publish tab** → Click **Publish**

---

## ✅ Done!

Visit https://workforcedemocracyproject.org and click any service category (Legal Aid, Housing, Healthcare, etc.)

Organizations should load successfully! 🎉

---

## 📚 Full Documentation

- **`DEPLOY-INSTRUCTIONS.md`** - Complete step-by-step guide
- **`V36.9.2-DEPLOYMENT-SUMMARY.md`** - Technical details and architecture
- **`BACKEND-NONPROFIT-PROXY.js`** - Backend proxy code reference
- **`README.md`** - V36.9.2 section for project status

---

**Questions?** Check PM2 logs: `/opt/nodejs/bin/pm2 logs workforce-backend --lines 50`
