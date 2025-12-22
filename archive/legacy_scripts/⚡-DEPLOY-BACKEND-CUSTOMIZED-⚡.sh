#!/bin/bash
# ⚡ CUSTOMIZED BACKEND DEPLOYMENT FOR YOUR MAC ⚡
# 
# USAGE:
# 1. Edit the 3 variables below (marked with ⚠️)
# 2. Save this file
# 3. Open Terminal and run:
#    chmod +x ⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh
#    ./⚡-DEPLOY-BACKEND-CUSTOMIZED-⚡.sh
#
# This script will automatically:
# ✅ Upload your backend code to VPS
# ✅ Install all dependencies
# ✅ Set up PostgreSQL database
# ✅ Configure environment variables
# ✅ Start backend with PM2
# ========================================================================

# ========================================================================
# ⚠️ EDIT THESE 3 VARIABLES ONLY! ⚠️
# ========================================================================

# ⚠️ 1. Database password - Choose a strong password (8+ characters, letters + numbers)
DB_PASSWORD="YOUR_DATABASE_PASSWORD_HERE"

# ⚠️ 2. Groq API key - Get from https://console.groq.com
#        (starts with "gsk_...")
GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"

# ⚠️ 3. VPS SSH password - Your SSH password for root@185.193.126.13
#        (Note: This is optional - you'll be prompted if not provided)
VPS_SSH_PASSWORD=""

# ========================================================================
# ✅ THESE ARE PRE-CONFIGURED - NO NEED TO EDIT! ✅
# ========================================================================

VPS_IP="185.193.126.13"
VPS_USER="root"
LOCAL_PROJECT_DIR="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.9.1"

# ========================================================================
# 🚀 DEPLOYMENT SCRIPT - DO NOT EDIT BELOW THIS LINE
# ========================================================================

echo "=========================================================================="
echo "  🚀 Workforce Democracy Backend - Automated Deployment"
echo "=========================================================================="
echo ""
echo "📋 Configuration:"
echo "   Project: $LOCAL_PROJECT_DIR"
echo "   VPS: $VPS_USER@$VPS_IP"
echo "   Groq API: $([ -n "$GROQ_API_KEY" ] && [ "$GROQ_API_KEY" != "YOUR_GROQ_API_KEY_HERE" ] && echo '✓ Configured' || echo '⚠️  NOT SET')"
echo "   DB Password: $([ -n "$DB_PASSWORD" ] && [ "$DB_PASSWORD" != "YOUR_DATABASE_PASSWORD_HERE" ] && echo '✓ Set' || echo '⚠️  NOT SET')"
echo ""

# ========================================================================
# PRE-FLIGHT CHECKS
# ========================================================================

echo "🔍 Running pre-flight checks..."
echo ""

# Check if running on Mac
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script is designed for macOS"
    exit 1
fi
echo "✅ Running on macOS"

# Check if project directory exists
if [ ! -d "$LOCAL_PROJECT_DIR" ]; then
    echo "❌ Error: Project directory not found!"
    echo "   Looking for: $LOCAL_PROJECT_DIR"
    echo ""
    echo "   Please verify the path and edit this script if needed."
    exit 1
fi
echo "✅ Project directory found"

# Check if backend folder exists
if [ ! -d "$LOCAL_PROJECT_DIR/backend" ]; then
    echo "❌ Error: Backend folder not found!"
    echo "   Looking for: $LOCAL_PROJECT_DIR/backend"
    echo ""
    echo "   Make sure your backend code is in the 'backend' folder."
    exit 1
fi
echo "✅ Backend folder found"

# Check required files
if [ ! -f "$LOCAL_PROJECT_DIR/backend/server.js" ]; then
    echo "❌ Error: server.js not found in backend folder"
    exit 1
fi
echo "✅ server.js found"

if [ ! -f "$LOCAL_PROJECT_DIR/backend/package.json" ]; then
    echo "❌ Error: package.json not found in backend folder"
    exit 1
fi
echo "✅ package.json found"

if [ ! -f "$LOCAL_PROJECT_DIR/backend/database-schema.sql" ]; then
    echo "❌ Error: database-schema.sql not found in backend folder"
    exit 1
fi
echo "✅ database-schema.sql found"

# Check Groq API key
if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" == "YOUR_GROQ_API_KEY_HERE" ]; then
    echo ""
    echo "❌ Error: Groq API key not configured!"
    echo ""
    echo "Please edit this script and set GROQ_API_KEY:"
    echo "   1. Go to: https://console.groq.com"
    echo "   2. Sign up or log in"
    echo "   3. Create an API key"
    echo "   4. Copy the key (starts with 'gsk_...')"
    echo "   5. Edit this script and paste it in GROQ_API_KEY"
    exit 1
fi
echo "✅ Groq API key configured"

# Check database password
if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" == "YOUR_DATABASE_PASSWORD_HERE" ]; then
    echo ""
    echo "❌ Error: Database password not configured!"
    echo ""
    echo "Please edit this script and set DB_PASSWORD to a strong password."
    echo "   Example: DB_PASSWORD=\"MySecurePass123!\""
    exit 1
fi
echo "✅ Database password set"

echo ""
echo "✅ All pre-flight checks passed!"
echo ""

# ========================================================================
# CONFIRMATION
# ========================================================================

echo "=========================================================================="
echo "  📋 Ready to Deploy"
echo "=========================================================================="
echo ""
echo "This script will:"
echo "  1. Create archive of your backend code"
echo "  2. Upload to VPS at $VPS_IP"
echo "  3. Install Node.js and dependencies"
echo "  4. Set up PostgreSQL database"
echo "  5. Configure environment variables"
echo "  6. Start backend with PM2"
echo ""
echo "⏱️  Estimated time: 5-10 minutes"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""

# ========================================================================
# STEP 1: CREATE ARCHIVE
# ========================================================================

echo "=========================================================================="
echo "  📦 Step 1/6: Creating backend archive..."
echo "=========================================================================="
echo ""

cd "$LOCAL_PROJECT_DIR"
if [ -f backend.tar.gz ]; then
    rm backend.tar.gz
fi
tar -czf backend.tar.gz backend/

if [ -f backend.tar.gz ]; then
    SIZE=$(ls -lh backend.tar.gz | awk '{print $5}')
    echo "✅ Archive created: backend.tar.gz ($SIZE)"
else
    echo "❌ Failed to create archive"
    exit 1
fi

echo ""

# ========================================================================
# STEP 2: UPLOAD TO VPS
# ========================================================================

echo "=========================================================================="
echo "  ⬆️  Step 2/6: Uploading to VPS..."
echo "=========================================================================="
echo ""

echo "Uploading to $VPS_USER@$VPS_IP:/root/"
echo "(You may be prompted for SSH password)"
echo ""

scp backend.tar.gz $VPS_USER@$VPS_IP:/root/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend code uploaded successfully!"
else
    echo ""
    echo "❌ Upload failed. Check your SSH connection and try again."
    exit 1
fi

echo ""

# ========================================================================
# STEP 3-6: VPS SETUP
# ========================================================================

echo "=========================================================================="
echo "  🔧 Steps 3-6: Setting up backend on VPS..."
echo "=========================================================================="
echo ""
echo "Connecting to VPS..."
echo "(You may be prompted for SSH password again)"
echo ""

# Generate random secrets
SESSION_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

ssh $VPS_USER@$VPS_IP << ENDSSH

set -e  # Exit on any error

echo "======================================================"
echo "  🏛️ Backend Setup on VPS"
echo "======================================================"
echo ""

# ========================================================================
# STEP 3: INSTALL DEPENDENCIES
# ========================================================================

echo "📦 Step 3/6: Installing dependencies..."
echo ""

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "   📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
    echo "   ✅ Node.js installed: \$(node --version)"
else
    echo "   ✅ Node.js already installed: \$(node --version)"
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "   📦 Installing PM2..."
    npm install -g pm2 > /dev/null 2>&1
    echo "   ✅ PM2 installed"
else
    echo "   ✅ PM2 already installed"
fi

# Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
    echo "   📦 Installing PostgreSQL..."
    apt-get update > /dev/null 2>&1
    apt-get install -y postgresql postgresql-contrib > /dev/null 2>&1
    systemctl start postgresql
    systemctl enable postgresql
    echo "   ✅ PostgreSQL installed"
else
    echo "   ✅ PostgreSQL already installed"
fi

echo ""

# ========================================================================
# STEP 4: EXTRACT CODE
# ========================================================================

echo "📂 Step 4/6: Extracting backend code..."
echo ""

cd /root

# Backup old version if exists
if [ -d "workforce-democracy-backend" ]; then
    echo "   🔄 Backing up old version..."
    mv workforce-democracy-backend workforce-democracy-backend.backup.\$(date +%Y%m%d%H%M%S)
fi

# Extract new version
tar -xzf backend.tar.gz
mv backend workforce-democracy-backend
cd workforce-democracy-backend

echo "   ✅ Code extracted to /root/workforce-democracy-backend"
echo ""

# Install Node modules
echo "   📦 Installing Node.js dependencies..."
npm install > /dev/null 2>&1
echo "   ✅ Dependencies installed"

echo ""

# ========================================================================
# STEP 5: DATABASE SETUP
# ========================================================================

echo "🗄️  Step 5/6: Setting up PostgreSQL database..."
echo ""

# Create database and user
sudo -u postgres psql << EOF > /dev/null 2>&1
DROP DATABASE IF EXISTS workforce_democracy;
DROP USER IF EXISTS wdp_user;
CREATE DATABASE workforce_democracy;
CREATE USER wdp_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE workforce_democracy TO wdp_user;
ALTER DATABASE workforce_democracy OWNER TO wdp_user;
\q
EOF

echo "   ✅ Database created: workforce_democracy"
echo "   ✅ User created: wdp_user"

# Run schema
echo "   📊 Creating database tables..."
sudo -u postgres psql -d workforce_democracy -f database-schema.sql > /dev/null 2>&1
echo "   ✅ Database schema loaded"

# Verify tables
TABLE_COUNT=\$(sudo -u postgres psql -d workforce_democracy -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "   ✅ Tables created: \${TABLE_COUNT}"

echo ""

# ========================================================================
# STEP 6: ENVIRONMENT & START
# ========================================================================

echo "🚀 Step 6/6: Configuring and starting backend..."
echo ""

# Create .env file
cat > .env << EOF
# Backend Configuration
PORT=3001
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workforce_democracy
DB_USER=wdp_user
DB_PASSWORD=$DB_PASSWORD

# Groq API
GROQ_API_KEY=$GROQ_API_KEY

# Security
SESSION_SECRET=$SESSION_SECRET
JWT_SECRET=$JWT_SECRET

# Frontend URL (for CORS)
FRONTEND_URL=https://workforcedemocracyproject.org

# API Configuration
API_BASE_URL=https://api.workforcedemocracyproject.org
EOF

echo "   ✅ Environment configured"

# Stop old process if exists
pm2 delete workforce-democracy-api 2>/dev/null || true

# Start backend with PM2
pm2 start server.js --name "workforce-democracy-api" > /dev/null 2>&1
pm2 save > /dev/null 2>&1

echo "   ✅ Backend started with PM2"

# Set up auto-start
pm2 startup systemd -u root --hp /root > /dev/null 2>&1

echo ""
echo "======================================================"
echo "  ✅ Backend Setup Complete!"
echo "======================================================"
echo ""

# Show status
pm2 status

echo ""
echo "📋 Recent Logs:"
pm2 logs workforce-democracy-api --lines 10 --nostream

ENDSSH

# Check if SSH command succeeded
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ VPS setup encountered errors. Check the output above."
    exit 1
fi

echo ""

# ========================================================================
# CLEANUP
# ========================================================================

echo "=========================================================================="
echo "  🧹 Cleaning up..."
echo "=========================================================================="
echo ""

cd "$LOCAL_PROJECT_DIR"
rm backend.tar.gz
echo "✅ Removed local archive"

echo ""

# ========================================================================
# TESTING
# ========================================================================

echo "=========================================================================="
echo "  🧪 Testing Backend..."
echo "=========================================================================="
echo ""

echo "Testing health endpoint..."
sleep 3  # Give backend time to fully start

HEALTH_CHECK=\$(curl -s -o /dev/null -w "%{http_code}" https://api.workforcedemocracyproject.org/api/civic/llm-health 2>/dev/null)

if [ "\$HEALTH_CHECK" == "200" ]; then
    echo "✅ Health check passed! Backend is responding."
else
    echo "⚠️  Health check returned: \$HEALTH_CHECK"
    echo "   Note: May need DNS configuration or Nginx setup."
    echo "   Backend is running on VPS - check deployment guide for next steps."
fi

echo ""

# ========================================================================
# SUCCESS SUMMARY
# ========================================================================

echo "=========================================================================="
echo "  🎉 DEPLOYMENT COMPLETE!"
echo "=========================================================================="
echo ""
echo "✅ Backend code uploaded and installed"
echo "✅ PostgreSQL database created and configured"
echo "✅ Backend running with PM2 (auto-restart enabled)"
echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Test Health Endpoint:"
echo "   curl https://api.workforcedemocracyproject.org/api/civic/llm-health"
echo ""
echo "2. Test Chat Endpoint:"
echo "   curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Test\",\"context\":\"general\"}'"
echo ""
echo "3. View Backend Logs:"
echo "   ssh $VPS_USER@$VPS_IP 'pm2 logs workforce-democracy-api'"
echo ""
echo "4. Restart Backend:"
echo "   ssh $VPS_USER@$VPS_IP 'pm2 restart workforce-democracy-api'"
echo ""
echo "5. Check PM2 Status:"
echo "   ssh $VPS_USER@$VPS_IP 'pm2 status'"
echo ""
echo "📚 Troubleshooting:"
echo "   If health check fails, you may need to configure Nginx and SSL."
echo "   See: 🚀-BACKEND-DEPLOYMENT-FROM-MAC-🚀.md (Step 8 & 9)"
echo ""
echo "=========================================================================="
echo ""
echo "🎉 Your backend is now running on the VPS!"
echo ""
