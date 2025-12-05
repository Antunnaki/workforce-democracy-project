# 👉 START HERE - Personalization System Deployment 👈

**Quick Status:**
- ✅ Frontend deployed to Netlify
- ⏳ Backend needs 2 files uploaded to VPS
- ⏱️ **Time needed: 5 minutes**

---

## 🚀 STEP 1: Upload 2 Files (Mac Terminal)

Open **Terminal** and copy-paste these **2 commands**:

### **Command 1: Upload server.js**
```bash
scp -P 22 "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION/backend/server-UPDATED-WITH-PERSONALIZATION.js" root@185.193.126.13:/var/www/workforce-democracy/backend/server.js
```

### **Command 2: Upload personalization.js**
```bash
scp -P 22 "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION/backend/routes/personalization.js" root@185.193.126.13:/var/www/workforce-democracy/backend/routes/personalization.js
```

✅ **Done with uploads!**

---

## 🔄 STEP 2: Restart Backend (VPS)

SSH into VPS:
```bash
ssh root@185.193.126.13 -p 22
```

Restart backend:
```bash
/opt/nodejs/bin/pm2 restart 0
/opt/nodejs/bin/pm2 logs 0 --lines 30
```

**Look for:**
```
✅ Connected to PostgreSQL database
🏛️  Civic Platform API loaded (v37.0.0)
🔐 Personalization API loaded (v37.11.4)  ← NEW!
Server running on port 3001
```

---

## 🧪 STEP 3: Test Backend

Still on VPS:
```bash
curl http://localhost:3001/api/personalization/health
```

**Should return:**
```json
{
  "status": "ok",
  "users": 0,
  "timestamp": "2025-11-15T..."
}
```

✅ **Backend is working!**

---

## 🌐 STEP 4: Configure Frontend

**What's your Netlify URL?**

Tell me and I'll give you the config to connect frontend to backend!

Your Netlify URL: ______________________________

---

## ❌ IF SOMETHING GOES WRONG

### **Files didn't upload?**

Check they exist:
```bash
ls -la "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION/backend/server-UPDATED-WITH-PERSONALIZATION.js"
ls -la "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION/backend/routes/personalization.js"
```

### **PM2 won't restart?**

Try this:
```bash
/opt/nodejs/bin/pm2 delete 0
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 start server.js --name workforce-backend
```

### **Health check fails?**

Check logs:
```bash
/opt/nodejs/bin/pm2 logs 0 --lines 100
```

---

## 📋 CHECKLIST

- [ ] ✅ Ran Command 1 (server.js uploaded)
- [ ] ✅ Ran Command 2 (personalization.js uploaded)
- [ ] ✅ SSH'd into VPS
- [ ] ✅ Restarted PM2
- [ ] ✅ Saw "Personalization API loaded" in logs
- [ ] ✅ Health check returned `"status": "ok"`
- [ ] ⏳ Provided Netlify URL (next step)

---

## 🎯 WHAT YOU GET

Once everything is deployed:
1. ✅ Users can register with username/password
2. ✅ Zero-knowledge encryption (server can't see their data)
3. ✅ Auto-sync across devices every 30 seconds
4. ✅ Recovery key for password reset
5. ✅ Complete offline support
6. ✅ Privacy guaranteed

**Storage cost: $0.10/month for 100,000 users!**

---

## 💡 HELP

- **Full guide:** `PERSONALIZATION-DEPLOYMENT-GUIDE.md`
- **Mac-specific:** `MAC-UPLOAD-INSTRUCTIONS.md`
- **Easy version:** `EASY-VPS-UPLOAD-INSTRUCTIONS.md`

---

**Ready? Copy Command 1 into Terminal and let's go!** 🚀
