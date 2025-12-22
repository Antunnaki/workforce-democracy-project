#!/bin/bash
# MASTER-VPS-FIX.sh
# Comprehensive fix for Nginx CORS and backend alignment on VPS
# Date: December 20, 2025

echo "🚀 Starting Master VPS Fix for Workforce Democracy Project"
echo "=========================================================="

# 1. Verify Nginx structure
echo "📋 Step 1: Verifying Nginx structure..."
if [ ! -d "/etc/nginx/conf.d" ]; then
    echo "Creating /etc/nginx/conf.d/ directory..."
    mkdir -p /etc/nginx/conf.d
fi

if [ ! -d "/etc/nginx/snippets" ]; then
    echo "Creating /etc/nginx/snippets/ directory..."
    mkdir -p /etc/nginx/snippets
fi

# Check if nginx.conf includes conf.d
if ! grep -q "include /etc/nginx/conf.d/\*.conf;" /etc/nginx/nginx.conf; then
    echo "⚠️ Warning: 'include /etc/nginx/conf.d/*.conf;' might be missing from /etc/nginx/nginx.conf"
    echo "Please ensure it exists inside the 'http {}' block."
fi

# 2. Create CORS Map
echo "📋 Step 2: Deploying CORS origin map..."
cat > /etc/nginx/conf.d/wdp-cors-map.conf << 'EOF'
# Map to handle multiple allowed origins for Workforce Democracy Project
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    "https://www.workforcedemocracyproject.org" $http_origin;
    "https://beta.workforcedemocracyproject.org" $http_origin;
    "https://api.workforcedemocracyproject.org" $http_origin;
    "https://api-beta.workforcedemocracyproject.org" $http_origin;
    "https://workforcedemocracyproject.netlify.app" $http_origin;
    "https://sxcrlfyt.gensparkspace.com" $http_origin;
    "https://workforce-democracy.njal.la" $http_origin;
}
EOF

# 3. Create Security Snippet for Beta
echo "📋 Step 3: Deploying Beta security snippet..."
cat > /etc/nginx/snippets/wdp-security-beta.conf << 'EOF'
# Security headers for beta environment
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy for beta
# Explicitly allowing both beta and production API domains
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api-beta.workforcedemocracyproject.org https://api.workforcedemocracyproject.org; frame-ancestors 'none'; base-uri 'none'" always;

# CORS headers using mapped origin
add_header Access-Control-Allow-Origin $cors_origin always;
add_header Access-Control-Allow-Credentials "true" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With, X-Chat-Token" always;
add_header Vary "Origin" always;

# Handle OPTIONS preflight
if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin $cors_origin always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
    add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With, X-Chat-Token" always;
    add_header Access-Control-Max-Age 1728000;
    add_header Content-Type text/plain;
    add_header Content-Length 0;
    return 204;
}
EOF

# 4. Test and Reload
echo "📋 Step 4: Testing Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid. Reloading..."
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully."
else
    echo "❌ Nginx configuration test failed! Please check your /etc/nginx/nginx.conf"
    exit 1
fi

# 5. Check Backend Status
echo "📋 Step 5: Verifying PM2 process status..."
pm2 status | grep -E "wdp|backend"

echo "=========================================================="
echo "✅ MASTER FIX APPLIED SUCCESSFULLY"
echo "Next: Visit https://beta.workforcedemocracyproject.org/diagnostic-v2.html"
echo "to verify the connection from your browser."
