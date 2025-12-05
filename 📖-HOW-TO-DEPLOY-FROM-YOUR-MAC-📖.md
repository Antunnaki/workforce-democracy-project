# 📖 How to Deploy Deep Research Fix from Your Mac

## 🎯 Quick Answer

**Copy this ONE command** and paste it into your Mac Terminal:

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend" && scp DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh FIX-DEEP-RESEARCH-CALL-v37.18.4.js DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ && ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-b/backend && chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh && ./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh'
```

**That's it!** Everything else is automatic.

---

## 📚 Files Created for You

I've created **4 deployment guides** for you:

| File | What It's For |
|------|---------------|
| **⚡-ONE-COMMAND-DEPLOY-⚡.txt** | Single command to copy/paste |
| **COPY-PASTE-THIS-ON-MAC.sh** | Interactive shell script |
| **🚀-UPLOAD-AND-DEPLOY-DEEP-RESEARCH-FROM-MAC-🚀.md** | Detailed step-by-step guide |
| **📖-HOW-TO-DEPLOY-FROM-YOUR-MAC-📖.md** | This file (overview) |

**Plus** the 3 fix scripts that will be uploaded:
- `DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh`
- `FIX-DEEP-RESEARCH-CALL-v37.18.4.js`
- `DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh`

---

## 🗺️ Your Deployment Path

### Your Mac:
```
/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend/
├── DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
├── FIX-DEEP-RESEARCH-CALL-v37.18.4.js
└── DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
```

### VPS - Version B (Testing):
```
root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
├── DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh ← Uploaded
├── FIX-DEEP-RESEARCH-CALL-v37.18.4.js ← Uploaded
├── DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh ← Uploaded & Executed
└── deep-research.js ← FIXED by the script
```

### VPS - Version A (Production):
```
root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/
└── deep-research.js ← Updated AFTER sync-b-to-a.sh
```

---

## 🎬 Step-by-Step (What Happens)

### When you run the one-line command:

1. **Changes directory** to your project folder on Mac
2. **Uploads 3 files** via SCP to VPS Version B
3. **SSHs into VPS** automatically
4. **Makes deployment script executable**
5. **Runs the deployment script** which:
   - Diagnoses the issue
   - Backs up `deep-research.js`
   - Inserts the missing code
   - Restarts Version B backend
   - Tests with a real query
   - Shows you the results

**Total time:** ~1 minute

---

## ✅ What Success Looks Like

### During Upload:
```
DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh      100%   3KB   1.5MB/s   00:00
FIX-DEEP-RESEARCH-CALL-v37.18.4.js      100%   6KB   3.0MB/s   00:00
DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh    100%   3KB   1.5MB/s   00:00
```

### During Deployment:
```
🔧 DEEP RESEARCH FIX DEPLOYMENT - v37.18.4
✅ deep-research.js EXISTS
✅ FIX APPLIED: Added searchCongressGovBills call
✅ Syntax check passed
✅ Service restarted
```

### In the Results:
```
🏛️ Checking for Congress.gov sources:
{
  "title": "H.R. 6249 - Substance Use Services Act",
  "url": "https://api.congress.gov/v3/bill/118/hr/6249",
  "relevanceScore": 500
}

🎉 DEPLOYMENT COMPLETE!
```

---

## 🎯 After Deployment

### 1. Test on GenSpark (Version B Frontend)

1. Visit: `https://sxcrlfyt.gensparkspace.com`
2. Enter ZIP: `12061`
3. Ask: "How has Chuck Schumer voted on healthcare?"
4. **Expected:** AI cites specific Congress.gov bills with URLs

Example response:
> "Senator Schumer has supported healthcare legislation including:
> - **H.R. 6249** (Substance Use Services Act) [link to Congress.gov]
> - **S. 1932** (Affordable Care Act Amendment) [link to Congress.gov]"

### 2. Deploy to Production (Version A)

**⚠️ ONLY after Version B is fully tested!**

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

This syncs Version B → Version A (production)

### 3. Test Live Site

Visit: `https://workforcedemocracyproject.org`

---

## 🔒 Safety Features

1. **Automatic Backup:** Every file is backed up before modification
2. **Version B First:** Changes only affect testing environment
3. **Easy Rollback:** Restore from backup in 10 seconds
4. **Syntax Check:** Prevents broken code from being deployed
5. **Auto-Rollback on Failure:** `sync-b-to-a.sh` rolls back if deployment fails

---

## 🆘 Troubleshooting

### "Permission denied (publickey)"

**Solution:** Check SSH access first
```bash
ssh root@185.193.126.13 'echo "SSH works!"'
```

If this fails, you may need to add your SSH key or use password authentication.

### "No such file or directory"

**Solution:** Make sure files are in the correct location
```bash
ls "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"
```

You should see the 3 `.sh` and `.js` files.

### Files uploaded but deployment failed

**Solution:** Check VPS logs
```bash
ssh root@185.193.126.13
tail -100 /var/log/workforce-backend-b.log
```

### Still getting 0 sources after fix

**Possible causes:**
1. Version B service didn't restart
2. Congress.gov API key not set
3. Network connectivity issue

**Quick fix:**
```bash
ssh root@185.193.126.13
sudo systemctl restart workforce-backend-b.service
tail -50 /var/log/workforce-backend-b.log | grep -i "deep research"
```

---

## 📋 Pre-Deployment Checklist

Before running the command:

- [ ] Files downloaded to your Mac project folder
- [ ] SSH access to VPS verified (`ssh root@185.193.126.13`)
- [ ] Mac Terminal open
- [ ] Ready to copy/paste the one-liner

After deployment:

- [ ] Logs show "Searching Congress.gov"
- [ ] API returns Congress.gov sources
- [ ] Sources have `relevanceScore: 500`
- [ ] GenSpark test shows bill citations
- [ ] No errors in Version B logs

---

## 🎓 Understanding the Deployment

### Why Version B First?

Version B is your **testing environment** (port 3002). It's connected to GenSpark:
- **URL:** `https://sxcrlfyt.gensparkspace.com`
- **Purpose:** Test changes before going live
- **Safe:** Doesn't affect production users

Version A is **production** (port 3001):
- **URL:** `https://workforcedemocracyproject.org`
- **Purpose:** Live site for public users
- **Critical:** Only deploy tested code here

### The Deployment Flow:

```
Your Mac
   ↓ (upload files via SCP)
Version B (Testing - Port 3002)
   ↓ (test and verify)
   ↓ (sync-b-to-a.sh)
Version A (Production - Port 3001)
```

---

## 🎉 Ready to Deploy?

### OPTION 1: One Command (Easiest)

Copy this and paste into Mac Terminal:
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend" && scp DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh FIX-DEEP-RESEARCH-CALL-v37.18.4.js DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ && ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-b/backend && chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh && ./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh'
```

### OPTION 2: Interactive Script

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"
chmod +x COPY-PASTE-THIS-ON-MAC.sh
./COPY-PASTE-THIS-ON-MAC.sh
```

### OPTION 3: Step-by-Step

See `🚀-UPLOAD-AND-DEPLOY-DEEP-RESEARCH-FROM-MAC-🚀.md` for detailed manual steps.

---

## 📞 Need Help?

1. **Check the guides:**
   - `⚡-ONE-COMMAND-DEPLOY-⚡.txt` - Fastest method
   - `🚀-UPLOAD-AND-DEPLOY-DEEP-RESEARCH-FROM-MAC-🚀.md` - Detailed guide
   - `👉-START-HERE-DEEP-RESEARCH-FIX-👈.md` - Understanding the fix

2. **Test SSH first:**
   ```bash
   ssh root@185.193.126.13 'pwd'
   ```

3. **Verify files are there:**
   ```bash
   ls "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"
   ```

---

**Ready?** Copy the command and let's fix Deep Research! 🚀

