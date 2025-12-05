# 🔍 VERIFY DEPLOYMENT - v37.18.29

The policy bonus scoring isn't working. Let me verify the deployment.

## 🚨 CHECK IF NEW CODE DEPLOYED

Run this command to check if the new scoring code is on the server:

```bash
ssh root@185.193.126.13 'grep -n "V37.18.29: POLICY QUERY BONUS SCORING" /var/www/workforce-democracy/version-b/backend/keyword-extraction.js'
```

**Password:** `YNWA1892LFC`

**Expected output:** Should show line number with the comment.

**If empty:** The file didn't deploy correctly!

---

## 🔎 CHECK WHICH VERSION IS RUNNING

```bash
ssh root@185.193.126.13 'grep -n "V37.18.29" /var/www/workforce-democracy/version-b/backend/keyword-extraction.js | head -5'
```

**Expected:** Should show the new policy bonus code

---

## 📊 GET DETAILED SCORING DEBUG

We need to see WHY the 8 articles are scoring so low. Run:

```bash
ssh root@185.193.126.13 'tail -400 /var/log/workforce-backend-b.log | grep -B 2 -A 15 "Scoring 9 articles"'
```

This will show us what the 9 articles are and why they're failing.
