# 📦 VPS Deployment Workflow (AI Handover Resilient)

## 🎯 Overview
All deployment scripts are stored as `.sh` files in this project. User maintains a local folder synchronized with these files for easy VPS upload.

---

## 📁 User's Local Setup

**Local Folder Path:** `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/`

All deployment scripts are downloaded here for version control and easy VPS upload.

**Workflow:**
1. AI creates deployment script as `.sh` file in project
2. User downloads `.sh` file to local folder
3. User uploads from local machine → VPS
4. User executes on VPS
5. User reports results back to chat

---

## 🚀 Standard Upload Commands

### From User's Local Machine to VPS:

```bash
# Navigate to local deployment scripts folder
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/"

# Upload .sh file to VPS /tmp directory
scp 'DEPLOY-v37.8.3-HEREDOC-FIX.sh' root@185.193.126.13:/tmp/
```

### Execute on VPS:

```bash
# SSH into VPS
ssh root@185.193.126.13

# Make script executable
chmod +x /tmp/DEPLOY-v37.8.3-HEREDOC-FIX.sh

# Run it
/tmp/DEPLOY-v37.8.3-HEREDOC-FIX.sh
```

---

## ✅ Advantages of This Approach

1. **AI Handover Safe**: All scripts persist in project files
2. **Version Control**: Complete deployment history
3. **No Chat Clutter**: Code stays in files, not chat messages  
4. **Audit Trail**: Future AI assistants can review all deployments
5. **User Control**: You verify scripts locally before upload
6. **Reusable**: Can re-run old deployments anytime

---

## 📋 File Naming Convention

```
DEPLOY-v{VERSION}-{DESCRIPTION}.sh
VERIFY-v{VERSION}-{CHECK}.sh
HOTFIX-{DATE}-{ISSUE}.sh
```

Examples:
- `DEPLOY-v37.8.3-POLITICAL-QUERY-FIX.sh`
- `VERIFY-v37.8.3-STATUS.sh`
- `HOTFIX-20251109-RSS-FEEDS.sh`

---

## 🔄 Standard Deployment Cycle

1. **User reports issue** → AI analyzes
2. **AI creates `.sh` file** → Stores in project
3. **User downloads to local folder** → Reviews content
4. **User SCPs to VPS** → Uses commands above
5. **User executes on VPS** → Monitors output
6. **User reports results** → AI confirms/troubleshoots

---

## 📊 Current Deployment Status

- ✅ v37.8.2: RSS feeds fixed (13 diverse sources, Jacobin deduplicated)
- ❌ v37.8.3: isPoliticalQuery fix - FAILED (pattern mismatch)

Next: Need to inspect actual VPS `ai-service.js` structure to create working deployment
