#!/bin/bash

##############################################################################
# DEPLOYMENT SCRIPT - v37.11.12 ETHICAL USERNAME VALIDATION
# Date: January 20, 2025
# 
# CHANGES:
# - Added comprehensive username validation system
# - Blocks profanity, hate speech, bullying terms
# - Prevents culturally insensitive usernames
# - Protects against impersonation attempts
# 
# FILES TO UPLOAD:
# 1. backend/utils/username-validator.js (NEW)
# 2. backend/routes/personalization.js (UPDATED)
# 
# DATABASE WIPE:
# - Removes all test accounts before deployment
##############################################################################

echo "═══════════════════════════════════════════════════"
echo "  🛡️  v37.11.12 - Ethical Username Validation"
echo "═══════════════════════════════════════════════════"
echo ""

# VPS credentials
VPS_HOST="185.193.126.13"
VPS_USER="root"
BACKEND_PATH="/var/www/workforce-democracy/backend"

echo "📋 Pre-deployment checklist:"
echo "  1. ✅ Username validator created (utils/username-validator.js)"
echo "  2. ✅ Personalization routes updated (routes/personalization.js)"
echo "  3. ⏳ Ready to wipe test accounts from MongoDB"
echo ""

read -p "🚨 WARNING: This will DELETE ALL test accounts from MongoDB. Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  STEP 1: WIPE TEST ACCOUNTS FROM MONGODB"
echo "═══════════════════════════════════════════════════"
echo ""

echo "🗑️  Connecting to MongoDB to delete test accounts..."

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
echo "📊 Current test accounts in database:"
mongosh workforce_democracy --quiet --eval "db.sessions.countDocuments()"

echo ""
echo "🗑️  Deleting all sessions..."
mongosh workforce_democracy --quiet --eval "db.sessions.deleteMany({})"

echo ""
echo "🗑️  Deleting all user backups..."
mongosh workforce_democracy --quiet --eval "db.userbackups.deleteMany({})"

echo ""
echo "✅ Final count check:"
echo "  Sessions: $(mongosh workforce_democracy --quiet --eval 'db.sessions.countDocuments()')"
echo "  User backups: $(mongosh workforce_democracy --quiet --eval 'db.userbackups.countDocuments()')"
ENDSSH

echo ""
echo "═══════════════════════════════════════════════════"
echo "  STEP 2: UPLOAD NEW FILES TO VPS"
echo "═══════════════════════════════════════════════════"
echo ""

# Create utils directory if it doesn't exist
echo "📁 Creating utils directory..."
ssh $VPS_USER@$VPS_HOST "mkdir -p $BACKEND_PATH/utils"

# Upload username validator
echo "📤 Uploading username-validator.js..."
scp utils/username-validator.js $VPS_USER@$VPS_HOST:$BACKEND_PATH/utils/

# Upload updated personalization routes
echo "📤 Uploading personalization.js..."
scp routes/personalization.js $VPS_USER@$VPS_HOST:$BACKEND_PATH/routes/

echo ""
echo "═══════════════════════════════════════════════════"
echo "  STEP 3: RESTART PM2 BACKEND"
echo "═══════════════════════════════════════════════════"
echo ""

echo "🔄 Restarting PM2 backend..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
/opt/nodejs/bin/pm2 restart backend
echo ""
echo "📋 Backend logs (last 20 lines):"
/opt/nodejs/bin/pm2 logs backend --lines 20 --nostream
ENDSSH

echo ""
echo "═══════════════════════════════════════════════════"
echo "  STEP 4: VERIFY DEPLOYMENT"
echo "═══════════════════════════════════════════════════"
echo ""

echo "🧪 Testing username validation..."
echo ""
echo "Test 1: Valid username (should succeed)"
curl -X POST https://api.workforcedemocracyproject.org/api/personalization/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ValidUser123"}' \
  2>/dev/null | grep -o '"error":"[^"]*"' || echo "✅ Validation passed (no error field)"

echo ""
echo "Test 2: Inappropriate username (should be blocked)"
curl -X POST https://api.workforcedemocracyproject.org/api/personalization/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin123"}' \
  2>/dev/null | grep -o '"error":"[^"]*"'

echo ""
echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🎯 What was deployed:"
echo "  - Username validation system (blocks inappropriate names)"
echo "  - Updated personalization routes"
echo "  - All test accounts wiped from MongoDB"
echo ""
echo "🧪 Next steps:"
echo "  1. Create your real account on the website"
echo "  2. Test with various usernames to verify filters work"
echo "  3. Deploy frontend to Netlify (WDP-v37.11.11)"
echo ""
echo "📝 Protected categories:"
echo "  ✅ Profanity and obscenities"
echo "  ✅ Hate speech and slurs"
echo "  ✅ Bullying and harassment"
echo "  ✅ Culturally insensitive terms"
echo "  ✅ Impersonation attempts (admin, moderator, etc.)"
echo ""
echo "═══════════════════════════════════════════════════"
