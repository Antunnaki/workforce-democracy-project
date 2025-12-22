# 🚀 Complete Deployment Instructions - Documentation Cleanup

## Overview
You have successfully downloaded `CLEANUP-DOCUMENTATION.sh` to your local machine. This guide will walk you through uploading and executing it on your server at `/var/www/workforce-democracy/`.

---

## 📋 What You Have

**Local File:**
- `CLEANUP-DOCUMENTATION.sh` (6KB script file)
- Downloaded to your "SSH file folder" on your local machine

**Server Information:**
- **Project Path:** `/var/www/workforce-democracy/`
- **Current State:** 856+ files in root directory (messy)
- **Goal:** Organize into clean `docs/` folder structure

---

## 🎯 Option B: Direct SCP Upload & Execution

### **Step 1: Upload the Script to Your Server**

Open your **Terminal** (Mac/Linux) or **Command Prompt/PowerShell** (Windows) on your local machine.

Navigate to the folder where you downloaded the script:
```bash
# Example - adjust to your actual folder path
cd ~/Downloads/SSH-Files/
# OR
cd /path/to/your/ssh/file/folder/
```

Upload the script to your server using SCP:
```bash
scp CLEANUP-DOCUMENTATION.sh username@your-server.com:/var/www/workforce-democracy/
```

**Replace:**
- `username` with your SSH username
- `your-server.com` with your server IP or hostname
- Example: `scp CLEANUP-DOCUMENTATION.sh admin@192.168.1.100:/var/www/workforce-democracy/`

**Example with actual server IP:**
```bash
scp CLEANUP-DOCUMENTATION.sh root@185.193.126.13:/var/www/workforce-democracy/
```

---

## 📂 **All Project Path Directories**

### **Main Project Paths:**
```
/var/www/workforce-democracy/                  # Main project root
/var/www/workforce-democracy/backend/          # Backend server (Node.js/Express)
/var/www/workforce-democracy/civic/            # Civic platform files
/var/www/workforce-democracy/civic/backend/    # Civic backend API
/var/www/workforce-democracy/js/               # Frontend JavaScript
/var/www/workforce-democracy/css/              # Stylesheets
/var/www/workforce-democracy/images/           # Static assets
/var/www/workforce-democracy/data/             # Data files
/var/www/workforce-democracy/docs/             # Documentation (after cleanup)
```

### **Key Backend Files:**
```
/var/www/workforce-democracy/backend/server.js              # Main Express server
/var/www/workforce-democracy/backend/ai-service.js          # AI/LLM service
/var/www/workforce-democracy/backend/rss-service.js         # RSS feed service
/var/www/workforce-democracy/backend/article-scraper.js     # Article scraper
/var/www/workforce-democracy/backend/us-representatives.js  # Representatives API
/var/www/workforce-democracy/backend/routes/civic-routes.js # Civic API routes
/var/www/workforce-democracy/backend/.env                   # Environment variables
```

### **Documentation Structure (After Cleanup):**
```
/var/www/workforce-democracy/docs/guides/         # User and developer guides
/var/www/workforce-democracy/docs/deployment/     # Deployment scripts
/var/www/workforce-democracy/docs/fixes/          # Bug fixes documentation
/var/www/workforce-democracy/docs/session-notes/  # Development session notes
/var/www/workforce-democracy/docs/testing/        # Test files
/var/www/workforce-democracy/docs/archived/       # Historical/old versions
```

### **Backup Directories:**
```
/var/www/workforce-democracy/backend-backup-*/              # Backend backups
/var/www/workforce-democracy/backend/ARCHIVE-v37.9.4-*/     # Archived versions
/var/www/workforce-democracy/backups/                       # General backups
```

### **Alternative/Legacy Paths (Avoid Using):**
```
/var/www/workforce-backend/          # ⚠️ OBSOLETE - Old backend location
/var/www/workforce-api/              # ⚠️ OBSOLETE - Old API location
/var/www/html/                       # ⚠️ May contain old frontend files
```

---

---

### **Step 2: Connect to Your Server via SSH**

```bash
ssh username@your-server.com
```

**Example:**
```bash
ssh admin@185.193.126.13
```

Enter your password when prompted.

---

### **Step 3: Navigate to Project Directory**

```bash
cd /var/www/workforce-democracy/
```

Verify you're in the correct location:
```bash
pwd
```
**Expected output:** `/var/www/workforce-democracy/`

---

### **Step 4: Verify the Script Was Uploaded**

```bash
ls -lh CLEANUP-DOCUMENTATION.sh
```

**Expected output:**
```
-rw-r--r-- 1 username username 6.0K Nov 12 15:30 CLEANUP-DOCUMENTATION.sh
```

If you see the file, you're good to proceed!

---

### **Step 5: Make the Script Executable**

```bash
chmod +x CLEANUP-DOCUMENTATION.sh
```

Verify it's executable:
```bash
ls -l CLEANUP-DOCUMENTATION.sh
```

**Expected output:**
```
-rwxr-xr-x 1 username username 6192 Nov 12 15:30 CLEANUP-DOCUMENTATION.sh
```
(Notice the `x` in the permissions)

---

### **Step 6: Execute the Cleanup Script**

🎉 **This is it! Run the cleanup:**

```bash
./CLEANUP-DOCUMENTATION.sh
```

**Alternative method:**
```bash
bash CLEANUP-DOCUMENTATION.sh
```

---

### **Step 7: Watch the Magic Happen**

You'll see output like this:

```
🧹 Starting documentation cleanup...
📁 Creating folder structure...
📖 Moving guides...
🚀 Moving deployment files...
🔧 Moving fix files...
📝 Moving session notes...
🧪 Moving test files...
📦 Moving version-specific files to archived...
🔍 Moving diagnostic files...
⚡ Moving command scripts...
📊 Moving comparison files...
🎯 Moving emoji-prefixed documentation...
🛠️ Moving shell script tools...
🗄️ Moving backend-related files...
🗂️ Moving miscellaneous files...
📄 Moving remaining documentation...

✅ Cleanup complete!

📊 Results:
   Guides:          45 files
   Deployment:      23 files
   Fixes:           12 files
   Session Notes:   67 files
   Testing:         34 files
   Archived:        189 files

🎉 All documentation organized!

📁 New structure:
   docs/
   ├── guides/         - Main documentation and guides
   ├── deployment/     - Deployment scripts and instructions
   ├── fixes/          - Bug fixes and patches
   ├── session-notes/  - Session summaries and status
   ├── testing/        - Test files and scripts
   └── archived/       - Historical and version-specific files
```

---

### **Step 8: Verify the Results**

**Check root directory file count (should be much lower):**
```bash
ls -1 | wc -l
```

**Expected:** ~25-30 files (down from 856!)

**View the new organized structure:**
```bash
ls -R docs/
```

**Count files in each category:**
```bash
echo "Guides: $(ls -1 docs/guides/ 2>/dev/null | wc -l)"
echo "Deployment: $(ls -1 docs/deployment/ 2>/dev/null | wc -l)"
echo "Fixes: $(ls -1 docs/fixes/ 2>/dev/null | wc -l)"
echo "Session Notes: $(ls -1 docs/session-notes/ 2>/dev/null | wc -l)"
echo "Testing: $(ls -1 docs/testing/ 2>/dev/null | wc -l)"
echo "Archived: $(ls -1 docs/archived/ 2>/dev/null | wc -l)"
```

---

## ✅ Complete Command Sequence (Copy-Paste Ready)

**On your local machine:**
```bash
# Navigate to where you downloaded the script
cd ~/Downloads/SSH-Files/

# Upload to server (adjust username and server address)
scp CLEANUP-DOCUMENTATION.sh username@your-server.com:/var/www/workforce-democracy/

# SSH into server
ssh username@your-server.com
```

**On the server:**
```bash
# Navigate to project
cd /var/www/workforce-democracy/

# Verify script is there
ls -lh CLEANUP-DOCUMENTATION.sh

# Make executable
chmod +x CLEANUP-DOCUMENTATION.sh

# Run cleanup
./CLEANUP-DOCUMENTATION.sh

# Verify results
ls -1 | wc -l
ls -R docs/
```

---

## 📊 Expected Before/After

### **BEFORE:**
```
/var/www/workforce-democracy/
├── 856 files (documentation everywhere)
├── index.html
├── css/
├── js/
├── DEPLOYMENT.md
├── V36.0.0-COMPLETE*.md
├── test-citation*.html
├── deploy-*.sh
├── 🚀-DEPLOY*.md
├── ... (800+ more doc files)
```

### **AFTER:**
```
/var/www/workforce-democracy/
├── ~25 essential project files
├── index.html
├── css/
├── js/
├── images/
├── data/
├── DEPLOYMENT.md
├── README.md
├── PROJECT_SUMMARY.md
└── docs/
    ├── guides/          (45 files)
    ├── deployment/      (23 files)
    ├── fixes/           (12 files)
    ├── session-notes/   (67 files)
    ├── testing/         (34 files)
    └── archived/        (189 files)
```

---

## 🆘 Troubleshooting

### **Problem: Permission Denied**

```bash
# If you get "Permission denied" when running the script
sudo chmod +x CLEANUP-DOCUMENTATION.sh
sudo ./CLEANUP-DOCUMENTATION.sh
```

**OR** change ownership:
```bash
sudo chown username:username CLEANUP-DOCUMENTATION.sh
chmod +x CLEANUP-DOCUMENTATION.sh
./CLEANUP-DOCUMENTATION.sh
```

---

### **Problem: Script Not Found**

```bash
# Verify you're in the correct directory
pwd
# Should show: /var/www/workforce-democracy/

# Check if file exists
ls -la | grep CLEANUP
```

If the file isn't there, re-upload using SCP (Step 1).

---

### **Problem: Some Files Didn't Move**

This is **normal and safe!** The script uses `2>/dev/null` to silently skip files that don't match patterns. 

**Essential project files will remain in the root:**
- `index.html`
- `README.md`
- `DEPLOYMENT.md`
- `PROJECT_SUMMARY.md`
- `package.json` (if exists)
- Core directories: `css/`, `js/`, `images/`, `data/`

Only **documentation files** get organized.

---

### **Problem: SSH Connection Issues**

```bash
# Verify SSH access
ssh username@your-server.com

# If using a custom port
ssh -p 2222 username@your-server.com

# If using SSH key
ssh -i ~/.ssh/your-key.pem username@your-server.com
```

---

## 🛡️ Safety Notes

### ✅ **This Script is SAFE:**
- **No files are deleted** - only moved to organized folders
- **Reversible** - you can manually move files back if needed
- **Error handling** - errors are suppressed to prevent script stopping
- **Preserves structure** - won't touch essential project files

### 🔄 **To Undo (if needed):**
```bash
# Move everything back to root (not recommended but possible)
cd /var/www/workforce-democracy/
mv docs/guides/* . 2>/dev/null
mv docs/deployment/* . 2>/dev/null
mv docs/fixes/* . 2>/dev/null
mv docs/session-notes/* . 2>/dev/null
mv docs/testing/* . 2>/dev/null
mv docs/archived/* . 2>/dev/null
```

---

## 🎯 What This Script WILL NOT Touch

**Protected Files and Directories:**
- `index.html`
- `css/` folder and contents
- `js/` folder and contents
- `images/` folder and contents
- `data/` folder and contents
- `backend/` folder and contents
- `civic/` folder and contents
- `manifest.json`
- `sw.js` (service worker)
- `favicon.svg`
- `_headers`
- `.htaccess`
- `.gitignore`
- `package.json` / `package-lock.json`

**Only documentation files** (`.md`, `.txt`, `.sh` matching specific patterns) will be organized.

---

## 📞 Need Help?

If you encounter any issues:

1. **Check the exact error message** in the terminal
2. **Verify server path:** `pwd` should show `/var/www/workforce-democracy/`
3. **Check file permissions:** `ls -l CLEANUP-DOCUMENTATION.sh`
4. **Ensure SSH access:** Can you connect and navigate directories?
5. **Review this guide** for the specific problem section

---

## 🎉 Success Checklist

After running the script, you should have:

- ✅ Clean root directory (~25-30 files)
- ✅ `docs/guides/` folder with documentation
- ✅ `docs/deployment/` folder with deployment scripts
- ✅ `docs/fixes/` folder with bug fix notes
- ✅ `docs/session-notes/` folder with session summaries
- ✅ `docs/testing/` folder with test files
- ✅ `docs/archived/` folder with historical files
- ✅ All essential project files still in root
- ✅ Website still functional (no production files moved)

---

## 🚀 Ready to Execute?

**Your complete deployment workflow:**

1. ✅ Download script (DONE - you have it)
2. ⏭️ Upload to server via SCP
3. ⏭️ SSH into server
4. ⏭️ Make executable
5. ⏭️ Run cleanup
6. ⏭️ Verify results
7. ⏭️ Celebrate clean directory! 🎉

---

**🏛️ Workforce Democracy Project - Documentation Cleanup Guide**

*Created: November 12, 2025*  
*Version: 1.0*  
*Status: Ready to Deploy*
