#!/bin/bash
# MASTER-VPS-FIX.sh
# Comprehensive fix for Nginx CORS and backend alignment on VPS
# Date: December 21, 2025

echo "🚀 Starting Master VPS Fix for Workforce Democracy Project"
echo "=========================================================="

# 1. Create CORS Map
echo "📋 Step 1: Deploying CORS origin map..."
cat > /etc/nginx/conf.d/wdp-cors-map.conf << 'EOF'
# Increase bucket size for the map
map_hash_bucket_size 128;

# Map to handle multiple allowed origins for Workforce Democracy Project
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    "https://www.workforcedemocracyproject.org" $http_origin;
    "https://beta.workforcedemocracyproject.org" $http_origin;
    "https://api.workforcedemocracyproject.org" $http_origin;
    "https://api-beta.workforcedemocracyproject.org" $http_origin;
    "https://workforcedemocracyproject.netlify.app" $http_origin;
    "https://api-beta--workforcedemocracyproject.netlify.app" $http_origin;
    "https://api--workforcedemocracyproject.netlify.app" $http_origin;
    "https://sxcrlfyt.gensparkspace.com" $http_origin;
    "https://workforce-democracy.njal.la" $http_origin;
}
EOF

# 2. Create Security Snippet for Beta
echo "📋 Step 2: Deploying Beta security snippet..."
cat > /etc/nginx/snippets/wdp-security-beta.conf << 'EOF'
# Security headers for beta environment
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy for beta
# Explicitly allowing both beta and production API domains and AI services
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.tailwindcss.com https://fonts.googleapis.com https://api.workforcedemocracyproject.org https://api-beta.workforcedemocracyproject.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: https: https://www.congress.gov https://www.senate.ca.gov https://www.assembly.ca.gov https://www.joincalifornia.com https://bioguide.congress.gov https://api.workforcedemocracyproject.org https://api-beta.workforcedemocracyproject.org; connect-src 'self' https://workforcedemocracyproject.org https://www.workforcedemocracyproject.org https://api.workforcedemocracyproject.org https://api-beta.workforcedemocracyproject.org https://api.groq.com https://*.netlify.app https://*.gensparkspace.com https://projects.propublica.org https://dashscope.aliyuncs.com; frame-ancestors 'none'; base-uri 'none'" always;
EOF

# 3. Create CORS Options Snippet (To be included inside location blocks)
echo "📋 Step 3: Deploying CORS options snippet..."
cat > /etc/nginx/snippets/wdp-cors-options.conf << 'EOF'
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

# 4. Update Backend Site Configuration
echo "📋 Step 4: Updating wdp-backend.conf..."
cat > /etc/nginx/sites-available/wdp-backend.conf << 'EOF'
# Unified Backend Configuration for Workforce Democracy Project
# CORS and Security are handled via snippets

server {
    server_name api.workforcedemocracyproject.org;

    # Include strict security profile for production
    include /etc/nginx/snippets/wdp-security-beta.conf;

    location / {
        include /etc/nginx/snippets/wdp-cors-options.conf;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_pass http://127.0.0.1:3000;
    }
    
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.workforcedemocracyproject.org/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    server_name api-beta.workforcedemocracyproject.org;

    # Include consolidated security and CORS profile for beta
    include /etc/nginx/snippets/wdp-security-beta.conf;

    location / {
        include /etc/nginx/snippets/wdp-cors-options.conf;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_pass http://127.0.0.1:3001;
    }

    location = / {
        return 302 /health;
    }
    
    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api-beta.workforcedemocracyproject.org/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api-beta.workforcedemocracyproject.org/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = api.workforcedemocracyproject.org) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    listen 80;
    listen [::]:80;
    server_name api.workforcedemocracyproject.org;
    return 404; # managed by Certbot
}

server {
    if ($host = api-beta.workforcedemocracyproject.org) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    listen 80;
    listen [::]:80;
    server_name api-beta.workforcedemocracyproject.org;
    return 404; # managed by Certbot
}
EOF

# Ensure sites-enabled is updated
cp /etc/nginx/sites-available/wdp-backend.conf /etc/nginx/sites-enabled/wdp-backend.conf

# 5. Test and Reload
echo "📋 Step 5: Testing Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid. Reloading..."
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully."
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

echo "=========================================================="
echo "✅ MASTER FIX APPLIED SUCCESSFULLY"
echo "Next: Visit https://beta.workforcedemocracyproject.org/diagnostic-v2.html"
echo "to verify the connection from your browser."
