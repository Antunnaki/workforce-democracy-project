#!/bin/bash
# DEPLOY-CORS-FIX-BETA.sh
# Fixes CORS for Beta site by updating Nginx map and snippet on VPS
# Date: December 20, 2025

echo "🔧 Fixing CORS configuration for Beta environment"
echo "==============================================="

# 1. Update/Create the CORS map in Nginx main config or a separate file
# We'll put it in a dedicated file that can be included
echo "📋 Step 1: Creating Nginx origin map..."

cat > wdp-cors-map.conf << 'EOF'
# Map to handle multiple allowed origins for Workforce Democracy Project
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    "https://www.workforcedemocracyproject.org" $http_origin;
    "https://beta.workforcedemocracyproject.org" $http_origin;
    "https://api-beta.workforcedemocracyproject.org" $http_origin;
    "https://workforcedemocracyproject.netlify.app" $http_origin;
    "https://sxcrlfyt.gensparkspace.com" $http_origin;
    "https://workforce-democracy.njal.la" $http_origin;
}
EOF

# 2. Update the security snippet for Beta
echo "📋 Step 2: Creating updated security snippet..."

cat > wdp-security-beta.conf << 'EOF'
# Security headers for beta environment
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy for beta
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api-beta.workforcedemocracyproject.org https://api.workforcedemocracyproject.org; frame-ancestors 'none'; base-uri 'none'" always;

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

echo "✅ Local configuration files created."
echo ""
echo "🚀 NEXT STEPS (Run these on your VPS as root):"
echo "------------------------------------------------"
echo "1. Upload these files to your VPS:"
echo "   scp wdp-cors-map.conf root@185.193.126.13:/etc/nginx/conf.d/"
echo "   scp wdp-security-beta.conf root@185.193.126.13:/etc/nginx/snippets/"
echo ""
echo "2. Check Nginx configuration and reload:"
echo "   ssh root@185.193.126.13 'nginx -t && systemctl reload nginx'"
echo "------------------------------------------------"
echo ""
echo "NOTE: Ensure /etc/nginx/nginx.conf has 'include /etc/nginx/conf.d/*.conf;' inside the http {} block."
