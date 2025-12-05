#!/bin/bash
# SSL Certificate Application Script - Option B (Nginx Reverse Proxy)
# Domain: api.workforcedemocracyproject.org
# Date: November 3, 2025

echo "🔒 SSL Certificate Application - Civic Platform v37.0.0"
echo "========================================================"
echo ""

# Step 1: Check Nginx installation
echo "📋 Step 1: Checking Nginx installation..."
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Installing..."
    apt update && apt install -y nginx
else
    echo "✅ Nginx is already installed"
    nginx -v
fi
echo ""

# Step 2: Check current Nginx configuration
echo "📋 Step 2: Checking Nginx configuration files..."
echo "Looking for Nginx config in common locations:"
if [ -f /etc/nginx/nginx.conf ]; then
    echo "✅ Found: /etc/nginx/nginx.conf"
fi
if [ -d /etc/nginx/sites-available ]; then
    echo "✅ Found: /etc/nginx/sites-available/"
    ls -la /etc/nginx/sites-available/
fi
if [ -d /etc/nginx/sites-enabled ]; then
    echo "✅ Found: /etc/nginx/sites-enabled/"
    ls -la /etc/nginx/sites-enabled/
fi
if [ -d /etc/nginx/conf.d ]; then
    echo "✅ Found: /etc/nginx/conf.d/"
    ls -la /etc/nginx/conf.d/
fi
echo ""

# Step 3: Verify SSL certificate
echo "📋 Step 3: Verifying SSL certificate..."
if [ -f /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem ]; then
    echo "✅ SSL certificate found"
    openssl x509 -in /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem -noout -dates
else
    echo "❌ SSL certificate not found at expected location"
    exit 1
fi
echo ""

# Step 4: Check backend status
echo "📋 Step 4: Checking backend status..."
/opt/nodejs/bin/pm2 list | grep workforce-democracy-backend
echo ""

# Step 5: Test backend on localhost:3001
echo "📋 Step 5: Testing backend on localhost:3001..."
curl -s http://localhost:3001/api/civic/llm-health | head -20
echo ""

echo "========================================================"
echo "✅ Diagnostic complete! Ready to create Nginx configuration."
echo ""
echo "Next: I'll create the Nginx SSL configuration based on what we found."
