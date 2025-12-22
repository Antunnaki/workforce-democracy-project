# ⚡ COPY-PASTE THESE 3 COMMANDS

**No chmod needed! Just copy and paste these one at a time.**

---

## 📋 THE COMMANDS

Open Terminal on your Mac and run these:

### **Command 1: Upload the fixed file**
```bash
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js
```

**When prompted for password, type:** `YNWA1892LFC`

✅ You'll see: `ai-service.js 100% 123KB 1.2MB/s 00:00`

---

### **Command 2: Restart the backend**
```bash
ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'
```

**Password again:** `YNWA1892LFC`

✅ No output = success (service restarted quietly)

---

### **Command 3: Check the logs**
```bash
ssh root@185.193.126.13 'tail -20 /var/log/workforce-backend-b.log'
```

**Password again:** `YNWA1892LFC`

✅ You'll see recent log messages (should show service starting)

---

## 🎯 THAT'S IT!

**What you just did:**
1. ✅ Uploaded the fixed ai-service.js to Version B
2. ✅ Restarted the backend service
3. ✅ Checked that it's running

**Now test on Netlify:**
- Find Chuck Schumer
- Ask about healthcare voting record
- Check for NO thinking blocks, NO wrong ending, BETTER contradictions

---

## 🐛 IF SOMETHING GOES WRONG

### **"backend/ai-service.js: No such file"**
First, navigate to your project folder:
```bash
cd ~/path/to/your/project
```

Or download the file and use full path:
```bash
scp ~/Downloads/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js
```

### **"Permission denied"**
Make sure you're typing the password exactly: `YNWA1892LFC`
(It's case-sensitive: capital Y, N, W, A, L, F, C)

### **"scp: command not found"**
Install Xcode command line tools:
```bash
xcode-select --install
```

---

## 📞 AFTER DEPLOYMENT

Tell me:
1. Did all 3 commands work?
2. What did the logs show?
3. Did the Netlify test work?

---

**That's the easiest way! No chmod, no scripts, just 3 commands. 🚀**
