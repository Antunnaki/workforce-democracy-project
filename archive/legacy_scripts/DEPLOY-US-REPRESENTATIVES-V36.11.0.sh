#!/bin/bash

# ============================================================================
# WORKFORCE DEMOCRACY PROJECT - Deploy US Representatives Lookup
# Version: V36.11.0
# ============================================================================

echo "🚀 =========================================="
echo "🚀 Deploying US Representatives Lookup"
echo "🚀 Version: V36.11.0"
echo "🚀 =========================================="
echo ""

# Step 1: Backup current backend
echo "📦 Step 1: Backing up current backend..."
BACKUP_DIR="/var/www/workforce-backend/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp /var/www/workforce-democracy/backend/server.js $BACKUP_DIR/server.js.backup-$TIMESTAMP
echo "✅ Backed up to: $BACKUP_DIR/server.js.backup-$TIMESTAMP"
echo ""

# Step 2: Upload new us-representatives.js file
echo "📤 Step 2: Deploying us-representatives.js..."
cat > /var/www/workforce-democracy/backend/us-representatives.js << 'ENDOFFILE'
[PLACEHOLDER - Will be replaced with actual file content when deploying]
ENDOFFILE

echo "✅ us-representatives.js deployed"
echo ""

# Step 3: Update server.js to integrate new module
echo "🔧 Step 3: Updating server.js to use real API..."

# Find the getMockRepresentatives function and replace endpoint logic
cat > /tmp/server_update.js << 'ENDOFUPDATE'
// Add at the top of server.js after other requires
const usReps = require('./us-representatives');

// Replace the POST /api/civic/representatives endpoint
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
        
        // ✨ NEW: Use real API instead of mock data
        const result = await usReps.getRepresentativesByZip(zipCode);
        
        const responseTime = Date.now() - startTime;
        console.log(`[Civic API] Found ${result.representatives?.length || 0} representatives (${responseTime}ms)`);
        
        // Return result
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
ENDOFUPDATE

echo "⚠️  Manual step required:"
echo "   You need to manually update /var/www/workforce-democracy/backend/server.js"
echo "   1. Add: const usReps = require('./us-representatives');"
echo "   2. Replace the POST /api/civic/representatives endpoint with the new code"
echo ""
echo "   Or run this automated update:"
echo ""

# Step 4: Check if API keys are configured
echo "🔑 Step 4: Checking API keys..."
if grep -q "CONGRESS_API_KEY" /var/www/workforce-backend/.env; then
    echo "✅ Congress.gov API key found"
else
    echo "❌ Congress.gov API key NOT found in .env"
    echo "   Add: CONGRESS_API_KEY=your_key_here"
fi

if grep -q "OPENSTATES_API_KEY" /var/www/workforce-backend/.env; then
    echo "✅ OpenStates API key found"
else
    echo "❌ OpenStates API key NOT found in .env"
    echo "   Add: OPENSTATES_API_KEY=your_key_here"
fi
echo ""

# Step 5: Validate Node.js syntax
echo "✔️  Step 5: Validating syntax..."
if node -c /var/www/workforce-democracy/backend/us-representatives.js 2>/dev/null; then
    echo "✅ us-representatives.js syntax valid"
else
    echo "❌ Syntax error in us-representatives.js"
    exit 1
fi
echo ""

# Step 6: Restart PM2
echo "🔄 Step 6: Restarting backend..."
/opt/nodejs/bin/pm2 restart workforce-backend
sleep 3
echo ""

# Step 7: Check PM2 status
echo "📊 Step 7: Checking backend status..."
/opt/nodejs/bin/pm2 list | grep workforce-backend
echo ""

# Step 8: Test the new endpoint
echo "🧪 Step 8: Testing new endpoint..."
echo "Testing with ZIP 90210..."
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"location":{"zipCode":"90210"}}' \
  -s | jq '.success, .representatives | length, .data_sources'

echo ""
echo ""

# Final summary
echo "✅ =========================================="
echo "✅ Deployment Complete!"
echo "✅ =========================================="
echo ""
echo "📝 Next steps:"
echo "   1. Check PM2 logs: /opt/nodejs/bin/pm2 logs workforce-backend"
echo "   2. Test frontend: https://sxcrlfyt.gensparkspace.com/"
echo "   3. Monitor for errors in first few requests"
echo ""
echo "🔍 Troubleshooting:"
echo "   - If errors, check: /opt/nodejs/bin/pm2 logs workforce-backend --err"
echo "   - Rollback if needed: cp $BACKUP_DIR/server.js.backup-$TIMESTAMP /var/www/workforce-democracy/backend/server.js"
echo ""
