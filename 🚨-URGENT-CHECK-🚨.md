# 🚨 URGENT - VERIFY RSS-SERVICE.JS DEPLOYED

## PROBLEM: Logs still show threshold ≥10 (should be ≥5)

Run this command to check if the new threshold is on the server:

```bash
ssh root@185.193.126.13 'grep -A 2 "V37.18.29" /var/www/workforce-democracy/version-b/backend/rss-service.js | head -10'
```

**Password:** `YNWA1892LFC`

**Expected output:**
```
// V37.18.29: Lowered from 10 → 5 to allow more policy-related articles through
const minRelevanceScore = 5;
```

**If it shows `const minRelevanceScore = 10;`** → The file didn't update!

---

## ALSO CHECK: Node.js might be caching the old module

The service restarted, but Node might have cached the old code. Try:

```bash
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-b.service && sleep 2 && sudo systemctl start workforce-backend-b.service && sleep 3 && tail -30 /var/log/workforce-backend-b.log'
```

This does a FULL STOP then START (not just restart) to clear caches.
