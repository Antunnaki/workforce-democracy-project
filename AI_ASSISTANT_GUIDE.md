# AI Assistant Server Access Guide

**Last Updated**: November 5, 2025  
**Server**: 185.193.126.13 (Workforce Democracy Backend)

---

## 🎯 CRITICAL INFORMATION FOR AI ASSISTANTS

This document explains how to **directly edit files on the production server** without requiring manual file uploads from the user.

---

## ✅ CAPABILITIES YOU HAVE

As an AI assistant helping with this project, you have **FULL SERVER ACCESS** through the user's SSH session. This means:

1. ✅ **Read any file** on the server
2. ✅ **Edit any file** on the server
3. ✅ **Create new files** on the server
4. ✅ **Delete files** on the server
5. ✅ **Run commands** (npm install, pm2 restart, etc.)
6. ✅ **Check logs** (pm2 logs, tail, grep)
7. ✅ **Verify changes** (cat, grep, diff)

### How It Works

**User is SSH'd into the server**:
```bash
ssh root@185.193.126.13
# You see: root@Workforce-Backend:/var/www/workforce-democracy/backend#
```

When you provide commands like:
```bash
sed -i 's/old-text/new-text/g' rss-service.js
```

**The command executes ON THE SERVER**, not on the user's local machine.

---

## 📁 ACTIVE PROJECT STRUCTURE

```
/var/www/workforce-democracy/
├── backend/                        # ⭐ MAIN BACKEND (PM2 process)
│   ├── server.js                   # Entry point
│   ├── ai-service.js               # AI/LLM integration
│   ├── rss-service.js              # Global RSS feeds (v37.3.0)
│   ├── .env                        # Environment variables
│   ├── package.json                # Dependencies
│   └── node_modules/               # Installed packages (owned by www-data)
│
├── [frontend HTML files]           # Public website
│
└── ACTIVE_PATHS.md                 # Documentation of current paths

/var/www/ARCHIVE/                   # ⚠️ DO NOT EDIT
└── civic-backend-old/              # Deprecated backend (archived)

/root/.pm2/                         # PM2 process manager data
├── logs/
│   ├── backend-out.log             # stdout logs
│   └── backend-error.log           # stderr logs
└── pm2.log                         # PM2 system logs
```

---

## 🔧 HOW TO EDIT FILES ON THE SERVER

### Method 1: Using `sed` (Simple Text Replacement)

**Best for**: Replacing specific text strings

```bash
# Backup first
cp rss-service.js rss-service.js.backup

# Replace text
sed -i 's/old-url.com/new-url.com/g' rss-service.js

# Verify change
grep "new-url.com" rss-service.js

# Restart service
pm2 restart backend
```

### Method 2: Using `cat` with Heredoc (Multi-line Replacement)

**Best for**: Replacing entire sections or adding new content

```bash
# Backup first
cp config.js config.js.backup

# Replace entire section (lines 100-120)
head -n 99 config.js > config.js.tmp
cat >> config.js.tmp << 'EOF'
// NEW SECTION CONTENT HERE
const newConfig = {
    setting1: 'value1',
    setting2: 'value2'
};
EOF
tail -n +121 config.js >> config.js.tmp
mv config.js.tmp config.js

# Restart service
pm2 restart backend
```

### Method 3: Using `echo` (Single Line Addition)

**Best for**: Adding environment variables or appending to files

```bash
# Add to .env file
echo "NEW_API_KEY=abc123" >> .env

# Verify
cat .env | grep NEW_API_KEY

# Restart with env refresh
pm2 restart backend --update-env
```

---

## ⚠️ CRITICAL RULES

### 1. ALWAYS Verify Current State First

```bash
# Check if file exists
ls -lah target-file.js

# Read specific section
sed -n '100,200p' target-file.js

# Search for pattern
grep -n "search-term" target-file.js
```

### 2. ALWAYS Create Backups Before Editing

```bash
# Backup with timestamp
cp important-file.js important-file.js.backup-$(date +%Y%m%d-%H%M%S)

# Or simple backup
cp important-file.js important-file.js.backup
```

### 3. ALWAYS Verify Changes After Editing

```bash
# Check specific change
grep "new-content" target-file.js

# Compare with backup
diff target-file.js.backup target-file.js

# Check syntax (for JS files)
node -c target-file.js
```

### 4. ALWAYS Restart Services After Changes

```bash
# For backend code changes
pm2 restart backend

# For environment variable changes
pm2 restart backend --update-env

# For dependency changes
npm install
pm2 restart backend
```

### 5. ALWAYS Check Logs After Restart

```bash
# View recent logs
pm2 logs backend --lines 50

# Filter for errors
pm2 logs backend --err --lines 30

# Watch logs in real-time
pm2 logs backend
```

---

## 🚨 TROUBLESHOOTING COMMON ISSUES

### Issue: Changes Not Taking Effect After PM2 Restart

**Problem**: Node.js module caching or PM2 not reloading

**Solution**:
```bash
# Hard restart (clears cache)
pm2 delete backend
pm2 start server.js --name backend

# Verify fresh startup
pm2 logs backend --lines 20
```

### Issue: Syntax Error After Editing

**Problem**: Invalid JavaScript syntax introduced

**Solution**:
```bash
# Check syntax
node -c problematic-file.js

# If errors, restore backup
cp problematic-file.js.backup problematic-file.js

# Fix syntax manually or re-edit carefully
```

---

## 🔄 COMMON WORKFLOWS

### Workflow 1: Update RSS Feed URL

```bash
# 1. Navigate to backend
cd /var/www/workforce-democracy/backend/

# 2. Backup file
cp rss-service.js rss-service.js.backup

# 3. Find current URL
grep -n "old-feed-url" rss-service.js

# 4. Replace URL
sed -i 's|old-feed-url.com|new-feed-url.com|g' rss-service.js

# 5. Verify change
grep "new-feed-url" rss-service.js

# 6. Test syntax
node -c rss-service.js

# 7. Restart backend
pm2 restart backend

# 8. Check logs for errors
pm2 logs backend --lines 30
```

### Workflow 2: Add New Environment Variable

```bash
# 1. Navigate to backend
cd /var/www/workforce-democracy/backend/

# 2. Backup .env
cp .env .env.backup

# 3. Add new variable
echo "NEW_API_KEY=your-key-here" >> .env

# 4. Verify it was added
cat .env | grep NEW_API_KEY

# 5. Restart with env refresh
pm2 restart backend --update-env

# 6. Check if backend loaded it
pm2 logs backend --lines 20 | grep "NEW_API_KEY\|Error"
```

---

## ✅ VERIFICATION CHECKLIST

After ANY file edit:

- [ ] Backup created (`.backup` file exists)
- [ ] Changes verified (`grep` or `cat` shows new content)
- [ ] Syntax checked (`node -c file.js` passes)
- [ ] Service restarted (`pm2 restart backend`)
- [ ] Logs checked (`pm2 logs backend --lines 30`)
- [ ] API tested (curl command succeeds)
- [ ] Documentation updated (if needed)

---

## 🎯 QUICK REFERENCE COMMANDS

```bash
# Navigate to backend
cd /var/www/workforce-democracy/backend/

# View file contents
cat file.js                    # Full file
sed -n '100,200p' file.js      # Lines 100-200
grep "search-term" file.js     # Search for text

# Edit files
sed -i 's/old/new/g' file.js   # Replace text
echo "content" >> file.js      # Append line

# Verify changes
diff old.js new.js             # Compare files
node -c file.js                # Check syntax

# PM2 management
pm2 status                     # Check process status
pm2 restart backend            # Restart service
pm2 logs backend --lines 50    # View logs
pm2 delete backend             # Stop process
pm2 start server.js --name backend  # Start process

# Check ownership/permissions
ls -lah file.js                # Show file details
chown www-data:www-data file   # Fix ownership
chmod 644 file.js              # Fix permissions
```

---

## 🚀 SUMMARY FOR FUTURE ASSISTANTS

**KEY POINT**: You are NOT editing files on the user's local computer. You are providing commands that execute **directly on the production server** at `185.193.126.13`.

**The user SSH's into the server, then pastes your commands. The commands run on the server and edit files in-place.**

**No file uploads needed. Changes are immediate. You have full control.**

**ALWAYS**:
1. Check current state before editing
2. Create backups before changes
3. Verify changes after editing
4. Restart services after edits
5. Check logs after restart
6. Test API endpoints

**This saves the user significant time and prevents upload/sync errors.**

---

**End of AI Assistant Guide**
