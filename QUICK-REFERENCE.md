# ⚡ Quick Reference - Version A/B System

## 🚀 Common Commands

### Deploy Version B → Version A
```bash
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

### Rollback Version A
```bash
cd /var/www/workforce-democracy/deployment-scripts
./rollback.sh
```

### Manual Backup
```bash
cd /var/www/workforce-democracy/deployment-scripts
./backup.sh both
```

---

## 🔍 Monitoring

### Check Services
```bash
sudo systemctl status workforce-backend-a.service
sudo systemctl status workforce-backend-b.service
```

### View Logs
```bash
tail -f /var/log/workforce-backend-a.log
tail -f /var/log/workforce-backend-b.log
```

### Restart Services
```bash
sudo systemctl restart workforce-backend-a.service
sudo systemctl restart workforce-backend-b.service
```

---

## 🧪 Testing

### Test Version A (Live - Port 3001)
```bash
curl http://localhost:3001/api/civic/representatives/search?zip=12061
```

### Test Version B (Test - Port 3002)
```bash
curl http://localhost:3002/api/civic/representatives/search?zip=12061
```

### Check PostgreSQL Cache
```bash
psql -U postgres -d workforce_democracy -h localhost
SELECT bill_id, cache_hits FROM bills_cache ORDER BY cached_at DESC LIMIT 5;
```

---

## 🎯 Golden Rules

1. ❌ **NEVER edit Version A directly**
2. ✅ **ALL changes go to Version B first**
3. ✅ **Test in Version B (port 3002)**
4. ✅ **Deploy using ./sync-b-to-a.sh**
5. ✅ **Rollback if anything breaks**

---

## 📁 Key Locations

- **Version A (Live):** `/var/www/workforce-democracy/version-a/backend`
- **Version B (Test):** `/var/www/workforce-democracy/version-b/backend`
- **Scripts:** `/var/www/workforce-democracy/deployment-scripts`
- **Backups:** `/var/www/workforce-democracy/backups`

---

## 🆘 Emergency

### Version A Crashed?
```bash
sudo systemctl restart workforce-backend-a.service
```

### Still broken?
```bash
cd /var/www/workforce-democracy/deployment-scripts
./rollback.sh
```
