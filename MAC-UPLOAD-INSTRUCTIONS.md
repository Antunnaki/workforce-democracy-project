# 🍎 MAC UPLOAD INSTRUCTIONS - Complete Path

**Your Mac Project Location:**
```
/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/
```

---

## 🚀 STEP 1: Upload Backend Files (2 Commands)

Open **Terminal** on your Mac and run:

### **Command 1: Upload Updated server.js**

```bash
scp -P 22 "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/backend/server-UPDATED-WITH-PERSONALIZATION.js" root@185.193.126.13:/var/www/workforce-democracy/backend/server.js
```

### **Command 2: Upload Personalization Route**

```bash
scp -P 22 "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/backend/routes/personalization.js" root@185.193.126.13:/var/www/workforce-democracy/backend/routes/personalization.js
```

---

## ✅ STEP 2: Verify Upload & Restart Backend

SSH into your VPS:

```bash
ssh root@185.193.126.13 -p 22
```

### **Check Files Uploaded:**

```bash
ls -lh /var/www/workforce-democracy/backend/server.js
ls -lh /var/www/workforce-democracy/backend/routes/personalization.js
```

**Expected output:**
```
-rw-r--r-- 1 root root 34K Nov 15 12:00 server.js
-rw-r--r-- 1 root root  3K Nov 15 12:00 personalization.js
```

### **Restart Backend:**

```bash
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 restart 0
/opt/nodejs/bin/pm2 logs 0 --lines 30
```

### **Look for Success Messages:**

```
✅ Connected to PostgreSQL database
🏛️  Civic Platform API loaded (v37.0.0)
🔐 Personalization API loaded (v37.11.4)
Server running on port 3001
```

---

## 🧪 STEP 3: Test the API

Still on VPS, run:

```bash
curl http://localhost:3001/api/personalization/health
```

**Expected response:**
```json
{
  "status": "ok",
  "users": 0,
  "timestamp": "2025-11-15T..."
}
```

✅ **If you see this, backend is working!**

---

## 🌐 STEP 4: Update Frontend API Endpoint

Your frontend is on **Netlify**, so it needs to point to your VPS backend.

### **What's your Netlify URL?**

It should be something like:
- `https://workforcedemocracyproject.netlify.app`
- Or your custom domain

Once I know that, I'll help you configure the frontend to talk to the VPS backend at:
- `http://185.193.126.13:3001/api/personalization`

---

## 🔧 TROUBLESHOOTING

### **Issue: "Permission denied" when uploading**

**Solution:** Make sure you're using the correct path:
```bash
# Check if files exist first
ls -la "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/backend/server-UPDATED-WITH-PERSONALIZATION.js"
```

### **Issue: "No such file or directory"**

**Check your current directory:**
```bash
pwd
```

**Navigate to the right place:**
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES"
```

### **Issue: Backend won't restart**

**Check PM2 status:**
```bash
/opt/nodejs/bin/pm2 status
```

**Try deleting and restarting:**
```bash
/opt/nodejs/bin/pm2 delete 0
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 start server.js --name workforce-backend
```

---

## 📋 QUICK CHECKLIST

- [ ] Run Command 1 (upload server.js)
- [ ] Run Command 2 (upload personalization.js)
- [ ] SSH into VPS
- [ ] Verify files uploaded
- [ ] Restart PM2
- [ ] Check PM2 logs for success messages
- [ ] Test health endpoint
- [ ] Provide Netlify URL for frontend config

---

## 🎯 NEXT STEP

Once backend is running, tell me your **Netlify URL** and I'll help you configure the frontend to connect to the backend!

Your Netlify URL is: _____________________________ (fill this in)

---

**Ready to upload? Copy and paste Command 1 into Terminal!** 🚀
