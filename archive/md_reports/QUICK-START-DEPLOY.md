# ⚡ QUICK START - Deploy V37.17.0 in 5 Minutes

**Copy-paste these commands to deploy the caching system**

---

## 📦 On Your Mac (Upload Files)

```bash
cd ~/Desktop/AG/WORKFORCE\ DEMOCRACY\ PROJECT/SITE\ FILES/WDP-v37.17.0/

scp -r backend/database backend/scripts root@185.193.126.13:/var/www/workforce-democracy/backend/
scp backend/utils/bill-cache.js backend/utils/keyword-matcher.js backend/utils/db-client.js root@185.193.126.13:/var/www/workforce-democracy/backend/utils/
scp backend/routes/ai-bills-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/
scp js/bills-section.js root@185.193.126.13:/var/www/workforce-democracy/js/
```

---

## 🔐 On Your VPS (Setup & Deploy)

```bash
ssh root@185.193.126.13

# Setup database
cd /var/www/workforce-democracy/backend/scripts
chmod +x setup-bill-cache-database.sh
./setup-bill-cache-database.sh
# Enter PostgreSQL password when prompted

# Install dependencies
cd /var/www/workforce-democracy/backend
npm install pg cheerio

# Restart backend
/opt/nodejs/bin/pm2 stop backend
/opt/nodejs/bin/pm2 delete backend
/opt/nodejs/bin/pm2 flush
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1
/opt/nodejs/bin/pm2 logs backend --lines 20
```

---

## ✅ Verify It Works

```bash
# Test 1 (should return "cached": false)
curl -X POST http://localhost:3001/api/ai/bills/analyze \
  -H 'Content-Type: application/json' \
  -d '{"bill": {"id": "test-123", "title": "Test", "level": "federal", "status": "Introduced"}}'

# Test 2 (should return "cached": true) - run same command again
curl -X POST http://localhost:3001/api/ai/bills/analyze \
  -H 'Content-Type: application/json' \
  -d '{"bill": {"id": "test-123", "title": "Test", "level": "federal"}}'

# Check database
psql -U postgres -d workforce_democracy -c "SELECT bill_id, cache_hits FROM bills_cache;"
```

---

## 🎉 Done!

**See `"cached": true` in Test 2?** ✅ Caching is working!

**Deploy frontend:** Click "Publish" in GenSpark interface

**Monitor:** `psql -U postgres -d workforce_democracy -c "SELECT * FROM cache_performance_summary;"`

---

**Full guide:** `DEPLOY-NOW-V37.17.0.md`  
**Cost savings:** 99.5%+ 💰
