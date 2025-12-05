# 🧹 Project Cleanup & Sync - V36.11.9

**Issue**: VPS server has OLD backend code, project workspace has NEW code. They're out of sync.

**Goal**: Ensure ONE source of truth for all files, with proper deployment workflow.

---

## 🔍 Current State Analysis

### ✅ What's Correct (Project Files Here):

| File | Location | Status | Version |
|------|----------|--------|---------|
| `backend/server.js` | This workspace | ✅ **UP TO DATE** | V36.11.9 with fixes |
| `index.html` | This workspace | ✅ **UP TO DATE** | V36.11.9 with CSP meta tag |
| `css/contrast-fix-v36.8.5.css` | This workspace | ✅ **UP TO DATE** | V36.11.9 with targeted selectors |
| `js/rep-finder-simple.js` | This workspace | ✅ **UP TO DATE** | V36.11.9 with debugging |
| `js/backend-api.js` | This workspace | ✅ **UP TO DATE** | V36.11.9 with error logging |

### ❌ What's Outdated (VPS Server):

| File | Location | Status | Issue |
|------|----------|--------|-------|
| `server.js` | `/var/www/workforce-democracy/backend/` | ❌ **OUTDATED** | OLD CORS code crashes server |
| `index.html` | GenSpark/Netlify | ❓ **UNKNOWN** | May not have CSP meta tag |
| Frontend JS/CSS | GenSpark/Netlify | ❓ **UNKNOWN** | May not have V36.11.9 fixes |

---

## 🎯 Cleanup Action Plan

### Phase 1: Backend Sync (URGENT - Fixes 129 restarts)

**Action**: Copy updated `backend/server.js` to VPS

**Steps**:

1. **View the correct file**:
   - In this workspace, open `backend/CORS-FIX-COPY-PASTE.txt`
   - This contains the EXACT code to paste

2. **Edit VPS file**:
   ```bash
   ssh root@185.193.126.13
   cd /var/www/workforce-democracy/backend
   nano server.js
   ```

3. **Find the CORS section** (starts around line 28):
   ```javascript
   app.use(cors({
   ```

4. **Delete from** `app.use(cors({` **down to** `}));` (about 10 lines)

5. **Paste the content** from `CORS-FIX-COPY-PASTE.txt`

6. **Save**: `Ctrl+X`, `Y`, `Enter`

7. **Restart**:
   ```bash
   pm2 restart workforce-backend
   pm2 status
   ```

**Success Criteria**:
- ✅ `restarts: 0` (stops at 0, doesn't keep increasing)
- ✅ No "CORS policy violation" errors in logs

---

### Phase 2: Frontend Sync (Fixes photos, CSS contrast)

**Action**: Deploy updated frontend files to GenSpark/Netlify

**Files to Deploy**:
- `index.html` (CSP meta tag for photos)
- `css/contrast-fix-v36.8.5.css` (targeted selectors, no global div rule)
- `js/rep-finder-simple.js` (debugging logs)
- `js/backend-api.js` (CORS/HTTP error logging)

**Steps** (depends on your deployment method):

#### Option A: GenSpark Web UI
1. Go to GenSpark dashboard
2. Find your project
3. Upload/drag-drop the updated files
4. Publish/deploy

#### Option B: Netlify (if using)
1. `git add .`
2. `git commit -m "V36.11.9: CSS fixes + backend sync"`
3. `git push origin main`
4. Netlify auto-deploys

#### Option C: Manual FTP/SFTP
1. Use FileZilla or similar
2. Upload files to web server
3. Overwrite existing files

**Success Criteria**:
- ✅ Header statistics show WHITE text on dark backgrounds
- ✅ Representative photos load (not just gradients)
- ✅ All 7 representative cards visible

---

### Phase 3: Documentation Cleanup

**Remove Duplicate/Outdated Docs**:

These files were created during debugging but may cause confusion:

- `BACKEND-DIAGNOSTIC-COMMANDS.md` - Keep (useful reference)
- `backend/BACKEND-FIX-V36.11.9.md` - Keep (deployment guide)
- `backend/deploy-fix.sh` - Keep (automation script)
- `V36.11.9-CONSOLE-DIAGNOSIS.md` - Keep (diagnostic reference)
- `V36.11.9-DEPLOYMENT-CHECKLIST.md` - Keep (testing guide)
- `V36.11.9-FINAL-STATUS.md` - Archive (historical record)
- `V36.11.9-SUMMARY.md` - Archive (historical record)
- `CSS-CONFLICT-DIAGRAM.md` - Keep (educational)

**Keep only active guides**, archive historical summaries.

---

## 📋 Single Source of Truth Workflow

Going forward, follow this workflow to avoid sync issues:

### 1. Make Changes HERE (Project Workspace)
- ✅ Edit files in this workspace
- ✅ Test locally if possible
- ✅ Commit to version control (Git)

### 2. Deploy to Servers
- **Backend**: Copy `backend/server.js` to VPS → restart PM2
- **Frontend**: Deploy to GenSpark/Netlify

### 3. Verify Deployment
- **Backend**: Check PM2 logs, restart count
- **Frontend**: Hard refresh browser, test features

### 4. Document Changes
- Update README.md with version notes
- Create deployment guides for complex changes

---

## 🔧 Quick Fix Commands (Copy/Paste)

### Backend Fix (On VPS):
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
nano server.js
# Paste content from CORS-FIX-COPY-PASTE.txt
# Save: Ctrl+X, Y, Enter
pm2 restart workforce-backend
pm2 logs workforce-backend --lines 20
```

### Frontend Deploy (GenSpark):
- Download files from this workspace
- Upload to GenSpark dashboard
- Publish/deploy

---

## ✅ Verification Checklist

After deploying all fixes:

### Backend:
- [ ] PM2 shows `restarts: 0`
- [ ] No CORS errors in logs
- [ ] Server uptime stable (not restarting every 30 seconds)
- [ ] Chat backend responds (not 404)

### Frontend:
- [ ] Header statistics: WHITE text on DARK backgrounds
- [ ] All 7 representative cards visible
- [ ] Photos load from government sites
- [ ] Chat assistant connects to backend

### Testing:
- [ ] Hard refresh browser (`Ctrl+Shift+R`)
- [ ] Open console, search for representatives
- [ ] Check console for 📊 🎴 logs (debugging working)
- [ ] Try chat assistant (should get real AI response)

---

## 🆘 If You Need Help

**I can**:
1. Show you EXACT line-by-line instructions
2. Create downloadable file packages
3. Set up Git deployment workflow
4. Remote troubleshooting via console logs

**You need to**:
1. Copy the CORS fix to VPS `server.js`
2. Deploy frontend files to GenSpark
3. Share verification results

---

**The fixes are ready - they just need to be deployed to the servers!** 🚀

**Start with Phase 1 (Backend) - that's the most critical (stops the 129 restarts).** Then do Phase 2 (Frontend) to fix photos and CSS.
