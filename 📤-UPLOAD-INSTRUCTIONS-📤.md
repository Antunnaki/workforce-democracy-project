# 📤 UPLOAD INSTRUCTIONS - .SH FILES TO VPS 📤

**Date**: November 10, 2025  
**Your Local Directory**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files`

---

## 🎯 COMPLETE WORKFLOW

### **Overview:**
1. AI creates `.sh` deployment file in chat
2. You download to Mac
3. You save to your SH-Files directory
4. You upload to VPS (using upload script)
5. You execute on VPS

---

## 📂 YOUR LOCAL DIRECTORY

**All .sh deployment files should be saved here:**
```
/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files
```

**Files in This Directory:**
- ✅ `🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh` - Deploy PROJECT_MASTER_GUIDE.md v37.9.1
- ✅ `📤-UPLOAD-TO-VPS-v37.9.1.sh` - Upload script (automates upload process)
- ✅ Future deployment .sh files from AI assistants

---

## 🚀 METHOD 1: USING UPLOAD SCRIPT (RECOMMENDED)

### **Step 1: Open Terminal**
```bash
# Navigate to your SH-Files directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files"
```

### **Step 2: Make Upload Script Executable (First Time Only)**
```bash
chmod +x 📤-UPLOAD-TO-VPS-v37.9.1.sh
```

### **Step 3: Run Upload Script**
```bash
./📤-UPLOAD-TO-VPS-v37.9.1.sh
```

**What It Does:**
- ✅ Checks if deployment file exists locally
- ✅ Uploads to VPS using scp
- ✅ Shows next steps (SSH and execute)
- ✅ Confirms successful upload

### **Step 4: SSH Into VPS**
```bash
ssh root@185.193.126.13
```

### **Step 5: Execute Deployment Script**
```bash
chmod +x 🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
./🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
```

**Done!** ✅

---

## 🔧 METHOD 2: MANUAL SCP UPLOAD

### **Step 1: Open Terminal**
```bash
# Upload directly using scp
scp "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh" root@185.193.126.13:/root/
```

### **Step 2: SSH Into VPS**
```bash
ssh root@185.193.126.13
```

### **Step 3: Execute Deployment Script**
```bash
chmod +x 🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
./🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
```

**Done!** ✅

---

## 📋 CURRENT DEPLOYMENT: PROJECT_MASTER_GUIDE.md v37.9.1

### **Files You Have:**
1. **`🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh`** - Deployment script
2. **`📤-UPLOAD-TO-VPS-v37.9.1.sh`** - Upload helper script

### **Complete Commands (Copy-Paste Ready):**

```bash
# Navigate to SH-Files directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files"

# Make upload script executable (first time only)
chmod +x 📤-UPLOAD-TO-VPS-v37.9.1.sh

# Run upload script
./📤-UPLOAD-TO-VPS-v37.9.1.sh

# SSH into VPS (when upload completes)
ssh root@185.193.126.13

# On VPS: Execute deployment
chmod +x 🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
./🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
```

---

## 🔍 EXPECTED OUTPUT

### **Upload Script Output:**
```
============================================================================
📤 UPLOADING DEPLOYMENT SCRIPT TO VPS
============================================================================

📂 Local directory: /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files
📁 File to upload: 🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
🌐 VPS server: 185.193.126.13
👤 VPS user: root
📍 VPS destination: /root/

✅ File found locally

📤 Uploading file to VPS...
Command: scp "..." root@185.193.126.13:/root/

============================================================================
✅ UPLOAD COMPLETE
============================================================================

📋 Next Steps:
  1. SSH into your VPS:
     ssh root@185.193.126.13

  2. Make the script executable:
     chmod +x 🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh

  3. Run the deployment script:
     ./🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh

🎉 File successfully uploaded to VPS!

============================================================================
```

### **Deployment Script Output:**
```
============================================================================
🚀 UPDATING PROJECT_MASTER_GUIDE.md TO v37.9.1
============================================================================

📂 Current directory: /var/www/workforce-democracy/backend

💾 Creating backup: PROJECT_MASTER_GUIDE.md.backup-20251110-HHMMSS
✅ Backup created

📝 Creating updated PROJECT_MASTER_GUIDE.md...
✅ PROJECT_MASTER_GUIDE.md created

✅ Verification: File exists
📊 File size: XXXXX bytes

============================================================================
✅ DEPLOYMENT COMPLETE
============================================================================

📋 Summary:
  ✅ Backup created: PROJECT_MASTER_GUIDE.md.backup-20251110-HHMMSS
  ✅ PROJECT_MASTER_GUIDE.md updated to v37.9.1
  ✅ Version: 37.9.1 - Civic Platform Consolidation + Nuclear CSS Fix
  ✅ Date: November 10, 2025

📖 Changes:
  ✅ Updated version header to v37.9.1
  ✅ Added deployment workflow documentation (.sh script method)
  ✅ Added user's local directory path
  ✅ Added upload script instructions
  ✅ Added civic platform consolidation details
  ✅ Added nuclear CSS fix explanation
  ✅ Added November 10, 2025 handover notes
  ✅ Updated current status with civic platform items

🎉 PROJECT_MASTER_GUIDE.md is now up to date on VPS!

============================================================================
```

---

## 🎓 FUTURE DEPLOYMENTS

**For All Future .sh Files from AI:**

1. **AI creates deployment .sh file in chat**
2. **You download to Mac**
3. **You save to**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files`
4. **You run upload script**: `./📤-UPLOAD-TO-VPS-v37.9.1.sh`
   - (Or use manual scp command with new filename)
5. **You SSH to VPS**: `ssh root@185.193.126.13`
6. **You execute**: `chmod +x SCRIPT-NAME.sh && ./SCRIPT-NAME.sh`

**This workflow is now documented in PROJECT_MASTER_GUIDE.md!**

---

## 📊 VPS DETAILS

**Server**: `185.193.126.13`  
**User**: `root`  
**Upload Destination**: `/root/` (scripts navigate to correct directories)  
**Backend Directory**: `/var/www/workforce-democracy/backend/`

---

## ✅ BENEFITS

**Why This Method Works:**
- ✅ **Organized**: All .sh files in one local directory
- ✅ **Automated Upload**: Upload script handles scp command
- ✅ **Self-Executing**: Scripts include all steps (backup, update, verify)
- ✅ **No Copy-Paste Errors**: Complete file transfer
- ✅ **Minimal Manual Steps**: Just download → upload → execute
- ✅ **Documented**: Workflow saved in PROJECT_MASTER_GUIDE.md
- ✅ **Repeatable**: Same process for all future deployments

---

## 🚨 TROUBLESHOOTING

### **Upload Script Can't Find File**
```bash
# Make sure you're in the correct directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files"

# Check if file exists
ls -la 🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
```

### **SCP Permission Denied**
```bash
# You may need to enter your VPS password
# Or verify SSH key is set up correctly
```

### **Script Not Executable**
```bash
# On Mac (before upload):
chmod +x 📤-UPLOAD-TO-VPS-v37.9.1.sh

# On VPS (after upload):
chmod +x 🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh
```

---

## 🎉 YOU'RE ALL SET!

**Current Deployment:**
- File: `🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh`
- Updates: PROJECT_MASTER_GUIDE.md to v37.9.1
- Location: Your SH-Files directory

**Next Steps:**
1. Run upload script (or use manual scp)
2. SSH to VPS
3. Execute deployment script

**Questions?** All commands are provided above - just copy and paste!

---

**📤 Happy deploying! 📤**
