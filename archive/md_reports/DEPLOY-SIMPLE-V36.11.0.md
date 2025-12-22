# 🚀 Simple Deployment - Copy & Paste These Commands

**Run these commands on your VPS via SSH**

---

## Step 1: Upload us-representatives.js

**Copy this ENTIRE block and paste into your SSH terminal:**

```bash
cat > /var/www/workforce-democracy/backend/us-representatives.js << 'ENDOFFILE'
```

**Then paste the entire contents of `backend/us-representatives.js` from this GenSpark project**

**Then add this line at the end:**
```bash
ENDOFFILE
```

---

## Step 2: Update server.js

```bash
# Backup first
cp /var/www/workforce-democracy/backend/server.js \
   /var/www/workforce-democracy/backend/server.js.backup-$(date +%Y%m%d-%H%M%S)

# Add require statement
sed -i "/const Groq = require('groq-sdk');/a const usReps = require('./us-representatives');" \
    /var/www/workforce-democracy/backend/server.js

# Verify it was added
grep "usReps" /var/www/workforce-democracy/backend/server.js
```

---

## Step 3: Replace the endpoint

**This part needs manual editing. Run:**

```bash
nano /var/www/workforce-democracy/backend/server.js
```

**Find the section that starts with:**
```javascript
app.post('/api/civic/representatives', async (req, res) => {
```

**Replace the ENTIRE function body with:**
```javascript
app.post('/api/civic/representatives', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { user_id, location } = req.body;
        
        if (!location || !location.zipCode) {
            return res.status(400).json({
                success: false,
                error: 'ZIP code is required'
            });
        }
        
        const zipCode = location.zipCode;
        console.log(`[Civic API] Looking up representatives for ZIP: ${zipCode}`);
        
        const result = await usReps.getRepresentativesByZip(zipCode);
        
        const responseTime = Date.now() - startTime;
        console.log(`[Civic API] Found ${result.representatives?.length || 0} representatives (${responseTime}ms)`);
        
        res.json({
            success: result.success,
            representatives: result.representatives || [],
            location_used: result.location_used,
            counts: result.counts,
            data_sources: result.data_sources,
            cached: result.cached || false,
            timestamp: result.timestamp
        });
        
    } catch (error) {
        console.error(`[Civic API] Error:`, error.message);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch representatives',
            message: error.message,
            representatives: [],
            timestamp: Date.now()
        });
    }
});
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## Step 4: Restart and Test

```bash
# Validate syntax
node -c /var/www/workforce-democracy/backend/server.js && echo "✅ Syntax OK"

# Restart
/opt/nodejs/bin/pm2 restart workforce-backend

# Test
sleep 3
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"location":{"zipCode":"90210"}}' | jq '.success, .representatives[0].name, .data_sources'
```

**If you see real names (not "Senator CA 1"), it worked!** 🎉

---

## Quick Rollback (if needed)

```bash
ls -lht /var/www/workforce-democracy/backend/*.backup* | head -1
cp /var/www/workforce-democracy/backend/server.js.backup-TIMESTAMP /var/www/workforce-democracy/backend/server.js
/opt/nodejs/bin/pm2 restart workforce-backend
```

---

**Ready? Start with Step 1!**
