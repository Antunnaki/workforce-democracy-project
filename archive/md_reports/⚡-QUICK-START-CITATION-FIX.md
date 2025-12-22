# ⚡ Quick Start: Citation Fix v37.4.0

## 🎯 What This Fixes

**Before**: Citations [3]-[12] show as plain text `[3]`, links go to wrong sources  
**After**: Only citations [1]-[2] show (matching 2 sources found), all links correct

---

## 🚀 Deploy in 3 Steps

### Step 1: Upload Files (From Your Local Machine)
```bash
chmod +x 📤-UPLOAD-CITATION-FIX.sh
./📤-UPLOAD-CITATION-FIX.sh
```
*Enter your SSH passphrase when prompted*

### Step 2: Deploy on VPS
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
bash ~/🚀-DEPLOY-CITATION-FIX-v37.4.0.sh
```

### Step 3: Test
1. Go to https://workforcedemocracy.com
2. Open Universal Chat
3. Ask: "What would happen if the 19th amendment was repealed?"
4. **Verify**:
   - ✅ Citations [1] and [2] are clickable blue superscripts
   - ✅ Clicking opens correct Democracy Now and Common Dreams articles
   - ✅ No `[3]` through `[12]` appear as plain text

---

## 📊 Expected PM2 Logs

After deployment, you should see:
```
🔧 [CITATION FIX] Starting citation validation...
   AI response length: 850 chars
   Sources available: 2
✅ Removed 10 invalid citations
✅ [CITATION FIX] Complete!
```

---

## ⚠️ Troubleshooting

**If citations still broken**:
```bash
pm2 logs backend --lines 50 | grep "CITATION FIX"
```

**If no "[CITATION FIX]" appears**:
- File not uploaded correctly
- Run: `ls -la /var/www/workforce-democracy/backend/citation-validator-v37.4.0.js`

**If PM2 won't start**:
```bash
pm2 logs backend --err --lines 20
```

---

## 📁 Files Deployed

1. `backend/citation-validator-v37.4.0.js` (NEW)
2. `backend/ai-service.js` (MODIFIED - added 3 lines)

---

**For full details**, see: `📋-CITATION-FIX-README-v37.4.0.md`
