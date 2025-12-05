# ⚡ Deep Research Fix - Quick Deploy Card

```
╔═══════════════════════════════════════════════════════════════╗
║                  DEEP RESEARCH FIX v37.18.7                   ║
║                   1-Line Frontend Fix                         ║
╚═══════════════════════════════════════════════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🐛 THE BUG                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

File:    js/chat-clean.js
Line:    209
Issue:   Looking for .representative-card (doesn't exist)
         Should look for .rep-card (actual class)
Impact:  Only 1 RSS source instead of 7+ Congress bills

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✅ THE FIX                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Change .representative-card → .rep-card

That's it! 1 word changed.

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🚀 3-STEP DEPLOY                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

STEP 1: Upload (30 seconds)
───────────────────────────────────────────────────────────────
scp js/chat-clean.js \
  root@185.193.126.13:/var/www/workforce-democracy/version-b/js/

STEP 2: Test Version B (2 minutes)
───────────────────────────────────────────────────────────────
1. Open: http://185.193.126.13:3002
2. Go to "My Representatives"
3. Search: 12061
4. Ask: "How has Chuck Schumer voted on healthcare?"
5. ✅ Verify: 7+ sources with Congress.gov bills

STEP 3: Deploy to Production (30 seconds)
───────────────────────────────────────────────────────────────
ssh root@185.193.126.13
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh

TOTAL TIME: 3 minutes

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📊 SUCCESS CRITERIA                                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

✅ 7+ sources returned (not just 1)
✅ Congress.gov bills in sources
✅ Citations display as ¹ ² ³
✅ No "I couldn't find..." message
✅ Backend logs show "Deep Research enabled"

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🧪 AUTOMATED TEST (Optional)                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

scp ✅-TEST-DEEP-RESEARCH-✅.sh root@185.193.126.13:/tmp/
ssh root@185.193.126.13
chmod +x /tmp/✅-TEST-DEEP-RESEARCH-✅.sh
/tmp/✅-TEST-DEEP-RESEARCH-✅.sh

Expected: ✅ ALL TESTS PASSED - DEEP RESEARCH WORKING!

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔥 QUICK ROLLBACK                                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

cd /var/www/workforce-democracy/version-b/js
ls -la chat-clean.js*
cp chat-clean.js.backup-[DATE] chat-clean.js

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📞 TROUBLESHOOTING                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Still only 1 source?
  → Clear browser cache (Cmd+Shift+R)
  → Check file uploaded: 
    ssh root@185.193.126.13 'ls -lh /var/www/.../chat-clean.js'

Backend not running?
  → sudo systemctl status workforce-backend-b.service
  → sudo systemctl start workforce-backend-b.service

Need help?
  → Check logs: tail -50 /var/log/workforce-backend-b.log
  → See: ✅-DEPLOYMENT-CHECKLIST-✅.md

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📚 FULL DOCUMENTATION                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

README.md                              Main overview
🎯-SIMPLE-FIX-SUMMARY-🎯.md            Plain English guide
🚀-FIX-DEEP-RESEARCH-DEPLOYMENT-🚀.md  Detailed deployment
📊-BUG-DIAGRAM-📊.md                   Visual explanation
✅-DEPLOYMENT-CHECKLIST-✅.md          Step-by-step checklist
✅-TEST-DEEP-RESEARCH-✅.sh            Automated tests

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📊 RISK ASSESSMENT                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Complexity:         ⚫ VERY LOW (1 line)
Backend Changes:    ✅ NONE
Service Restarts:   ✅ NONE  
Rollback Time:      ⏱️  30 seconds
Success Rate:       📈 VERY HIGH
Impact:             💥 HIGH (fixes major feature)

Overall Risk:       🟢 VERY LOW ✅

╔═══════════════════════════════════════════════════════════════╗
║  READY TO DEPLOY - JUST 3 COMMANDS!                          ║
╚═══════════════════════════════════════════════════════════════╝
```

## Copy-Paste Commands

### Upload
```bash
scp js/chat-clean.js root@185.193.126.13:/var/www/workforce-democracy/version-b/js/chat-clean.js
```

### Deploy
```bash
ssh root@185.193.126.13 'cd /var/www/workforce-democracy/deployment-scripts && ./sync-b-to-a.sh'
```

### Test
```
Open: http://185.193.126.13:3002
Search: 12061
Ask: "How has Chuck Schumer voted on healthcare?"
Verify: 7+ sources ✅
```

---

**Print this card and keep it handy!** 📄
