# Nginx configuration for beta environment

## Beta API server block

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api-beta.workforcedemocracyproject.org;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api-beta.workforcedemocracyproject.org;
    
    # SSL certificate paths (obtained via certbot)
    ssl_certificate /etc/letsencrypt/live/api-beta.workforcedemocracyproject.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-beta.workforcedemocracyproject.org/privkey.pem;
    
    # Security headers
    include /etc/nginx/snippets/wdp-security-beta.conf;
    
    # Proxy to backend
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Beta frontend server block

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name beta.workforcedemocracyproject.org;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name beta.workforcedemocracyproject.org;
    
    # SSL certificate paths (obtained via certbot)
    ssl_certificate /etc/letsencrypt/live/beta.workforcedemocracyproject.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beta.workforcedemocracyproject.org/privkey.pem;
    
    # Security headers
    include /etc/nginx/snippets/wdp-security-beta.conf;
    
    # Root directory for frontend files
    root /srv/wdp/beta/current/frontend;
    index index.html;
    
    # Serve static files
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Beta security snippet (/etc/nginx/snippets/wdp-security-beta.conf)

```nginx
# Security headers for beta environment
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy for beta
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api-beta.workforcedemocracyproject.org; frame-ancestors 'none'; base-uri 'none'" always;

# CORS headers for beta (allow only beta frontend)
add_header Access-Control-Allow-Origin "https://beta.workforcedemocracyproject.org" always;
add_header Access-Control-Allow-Credentials "true" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With, X-Chat-Token" always;
add_header Vary "Origin" always;
```