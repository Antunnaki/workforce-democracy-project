#!/bin/bash
# ⚡ QUICK BACKEND DEPLOYMENT FROM MAC ⚡
# 
# USAGE:
# 1. Edit the variables below (Groq API key, DB password)
# 2. Save this file
# 3. Run: chmod +x ⚡-QUICK-BACKEND-DEPLOY-MAC-⚡.sh
# 4. Run: ./⚡-QUICK-BACKEND-DEPLOY-MAC-⚡.sh
#
# This script will:
# - Upload backend code to VPS
# - Install dependencies
# - Set up database
# - Start backend with PM2
# ========================================================================

# ========================================================================
# CONFIGURATION - EDIT THESE!
# ========================================================================

VPS_IP="185.193.126.13"
VPS_USER="root"
VPS_PASSWORD="your_vps_ssh_password_here"

# Database password (choose a strong password)
DB_PASSWORD="choose_strong_password_here"

# Groq API key (get from https://console.groq.com)
GROQ_API_KEY="your_groq_api_key_here"

# Local project directory (EDIT THIS PATH!)
LOCAL_PROJECT_DIR="/path/to/workforce-democracy-project"

# ========================================================================
# PRE-FLIGHT CHECKS
# ========================================================================

echo "=========================================================================="
echo "  🚀 Workforce Democracy Backend - Quick Deployment"
echo "=========================================================================="
echo ""

# Check if running on Mac
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script is designed for macOS"
    echo "For other systems, use the manual deployment guide."
    exit 1
fi

# Check if project directory exists
if [ ! -d "$LOCAL_PROJECT_DIR/backend" ]; then
    echo "❌ Error: Backend directory not found at: $LOCAL_PROJECT_DIR/backend"
    echo ""
    echo "Please edit this script and set LOCAL_PROJECT_DIR to your project location."
    echo "Example: LOCAL_PROJECT_DIR=\"/Users/yourname/projects/workforce-democracy\""
    exit 1
fi

# Check configuration
if [[ "$GROQ_API_KEY" == "your_groq_api_key_here" ]]; then
    echo "❌ Error: Please edit this script and set your GROQ_API_KEY"
    echo "Get your API key from: https://console.groq.com"
    exit 1
fi

if [[ "$DB_PASSWORD" == "choose_strong_password_here" ]]; then
    echo "❌ Error: Please edit this script and set a DB_PASSWORD"
    exit 1
fi

echo "✅ Configuration looks good!"
echo ""
echo "📋 Deployment Settings:"
echo "   VPS: $VPS_USER@$VPS_IP"
echo "   Project: $LOCAL_PROJECT_DIR"
echo "   Groq API: Configured ✓"
echo "   DB Password: Set ✓"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "=========================================================================="
echo "  Step 1: Creating backend archive..."
echo "=========================================================================="
echo ""

cd "$LOCAL_PROJECT_DIR"
tar -czf backend.tar.gz backend/
echo "✅ Archive created: backend.tar.gz"

echo ""
echo "=========================================================================="
echo "  Step 2: Uploading to VPS..."
echo "=========================================================================="
echo ""

scp backend.tar.gz $VPS_USER@$VPS_IP:/root/
echo "✅ Backend code uploaded!"

echo ""
echo "=========================================================================="
echo "  Step 3: Setting up backend on VPS..."
echo "=========================================================================="
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

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js already installed: \$(node --version)"
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
else
    echo "✅ PostgreSQL already installed"
fi

# Extract backend code
echo ""
echo "📂 Extracting backend code..."
cd /root
rm -rf workforce-democracy-backend  # Remove old version if exists
tar -xzf backend.tar.gz
mv backend workforce-democracy-backend
cd workforce-democracy-backend

# Install dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

# Set up database
echo ""
echo "🗄️ Setting up PostgreSQL database..."

# Create database and user
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS workforce_democracy;
DROP USER IF EXISTS wdp_user;
CREATE DATABASE workforce_democracy;
CREATE USER wdp_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE workforce_democracy TO wdp_user;
\q
EOF

# Run schema
echo "📊 Creating database tables..."
sudo -u postgres psql -d workforce_democracy -f database-schema.sql

# Create .env file
echo ""
echo "🔧 Creating environment configuration..."
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

# Start backend with PM2
echo ""
echo "🚀 Starting backend with PM2..."
pm2 delete workforce-democracy-api 2>/dev/null || true
pm2 start server.js --name "workforce-democracy-api"
pm2 save

# Set up auto-start
pm2 startup systemd -u root --hp /root

echo ""
echo "======================================================"
echo "  ✅ Backend Setup Complete!"
echo "======================================================"
echo ""
pm2 status
echo ""
pm2 logs workforce-democracy-api --lines 10 --nostream

ENDSSH

echo ""
echo "=========================================================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "=========================================================================="
echo ""
echo "🧪 Test your backend:"
echo ""
echo "1. Health Check:"
echo "   curl https://api.workforcedemocracyproject.org/api/civic/llm-health"
echo ""
echo "2. Chat Test:"
echo "   curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Test\",\"context\":\"general\"}'"
echo ""
echo "📊 View Backend Logs:"
echo "   ssh $VPS_USER@$VPS_IP 'pm2 logs workforce-democracy-api'"
echo ""
echo "🔄 Restart Backend:"
echo "   ssh $VPS_USER@$VPS_IP 'pm2 restart workforce-democracy-api'"
echo ""
echo "=========================================================================="
echo ""

# Cleanup
rm backend.tar.gz
echo "✅ Cleaned up local archive"
echo ""
echo "🎉 Deployment successful! Your backend is now running on the VPS."
echo ""
