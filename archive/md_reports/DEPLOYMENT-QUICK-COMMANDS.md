# ⚡ Quick Deployment Commands - Copy & Paste

**Use this for rapid deployment - see DEPLOYMENT-GUIDE-COMPLETE.md for detailed explanations**

---

## 🌐 PART 1: FRONTEND TO NETLIFY (5 minutes)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init
# Select: Create & configure new site
# Site name: workforce-democracy-project
# Build command: (leave empty)
# Deploy directory: (leave empty)

# Create netlify.toml
cat > netlify.toml << 'EOF'
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/api/*"
  to = "https://api.workforcedemocracyproject.org/:splat"
  status = 200
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
EOF

# Deploy
netlify deploy --prod

# Add custom domain (optional)
netlify domains:add workforcedemocracyproject.org
```

---

## 🖥️ PART 2: BACKEND TO NJALLA VPS (30-45 minutes)

### SSH Into VPS:

```bash
ssh root@YOUR_NJALLA_IP
```

### Install Everything:

```bash
# Update & install packages (5 min)
apt update && apt upgrade -y
apt install postgresql postgresql-contrib nginx certbot python3-certbot-nginx -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2
```

### Set Up Database:

```bash
# Create database
sudo -u postgres psql << 'EOSQL'
CREATE DATABASE workforce_democracy;
CREATE USER wdp_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE workforce_democracy TO wdp_user;
\c workforce_democracy
GRANT ALL ON SCHEMA public TO wdp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wdp_user;
\q
EOSQL
```

### Upload Backend (ON YOUR LOCAL MACHINE):

```bash
# Create archive
tar -czf backend.tar.gz backend/

# Upload
scp backend.tar.gz root@YOUR_NJALLA_IP:/var/www/
```

### Extract & Configure (BACK ON VPS):

```bash
# Create directory & extract
mkdir -p /var/www/workforce-democracy
cd /var/www/workforce-democracy
tar -xzf /var/www/backend.tar.gz
cd backend

# Configure environment
cp .env.example .env
nano .env
# UPDATE: DB_PASSWORD, GROQ_API_KEY, FRONTEND_URL
# GENERATE: SESSION_SECRET and JWT_SECRET with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Save: Ctrl+X, Y, Enter

# Install dependencies
npm install

# Initialize database
PGPASSWORD='YOUR_DB_PASSWORD' psql -U wdp_user -d workforce_democracy -f database-schema.sql

# Verify 5 cases loaded
PGPASSWORD='YOUR_DB_PASSWORD' psql -U wdp_user -d workforce_democracy -c "SELECT case_name FROM court_cases;"
```

### Start Server:

```bash
# Test run
npm start
# Press Ctrl+C to stop

# Start with PM2
pm2 start server.js --name workforce-democracy-backend
pm2 save
pm2 startup
# Run the command it outputs
```

### Configure Nginx:

```bash
# Create config
cat > /etc/nginx/sites-available/api.workforcedemocracyproject.org << 'EOF'
server {
    listen 80;
    server_name api.workforcedemocracyproject.org;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable & reload
ln -s /etc/nginx/sites-available/api.workforcedemocracyproject.org /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Install SSL:

```bash
# Get certificate
certbot --nginx -d api.workforcedemocracyproject.org
# Follow prompts

# Test auto-renewal
certbot renew --dry-run
```

### Test API:

```bash
# Health check
curl https://api.workforcedemocracyproject.org/health

# Supreme Court query
curl -X POST https://api.workforcedemocracyproject.org/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{"chat_type":"supreme-court","user_id":"test","query":"what is roe v wade?"}'
```

---

## ✅ VERIFICATION CHECKLIST

```bash
# Frontend
netlify open:site

# Backend
pm2 status
pm2 logs workforce-democracy-backend --lines 20

# Database
PGPASSWORD='YOUR_PASSWORD' psql -U wdp_user -d workforce_democracy -c "\dt"
PGPASSWORD='YOUR_PASSWORD' psql -U wdp_user -d workforce_democracy -c "SELECT COUNT(*) FROM court_cases;"
```

---

## 🔧 QUICK TROUBLESHOOTING

```bash
# Restart backend
pm2 restart workforce-democracy-backend

# View logs
pm2 logs --lines 50

# Check database connection
PGPASSWORD='YOUR_PASSWORD' psql -U wdp_user -d workforce_democracy -c "SELECT NOW();"

# Check Nginx
nginx -t
systemctl status nginx

# Check SSL
certbot certificates

# Redeploy frontend
netlify deploy --prod
```

---

## 📊 MONITORING COMMANDS

```bash
# PM2 monitoring
pm2 monit

# Database stats
PGPASSWORD='YOUR_PASSWORD' psql -U wdp_user -d workforce_democracy << 'EOSQL'
SELECT chat_type, source, COUNT(*), AVG(response_time_ms) 
FROM api_usage_metrics 
WHERE timestamp > NOW() - INTERVAL '1 day'
GROUP BY chat_type, source;
EOSQL

# Cache hit rate
PGPASSWORD='YOUR_PASSWORD' psql -U wdp_user -d workforce_democracy -c "SELECT * FROM cache_hit_rate;"

# Nginx access logs
tail -f /var/log/nginx/access.log

# Backend logs
pm2 logs workforce-democracy-backend
```

---

## 🎉 SUCCESS!

**Frontend**: https://workforcedemocracyproject.org  
**Backend API**: https://api.workforcedemocracyproject.org  
**Status**: https://api.workforcedemocracyproject.org/health

---

**See DEPLOYMENT-GUIDE-COMPLETE.md for detailed explanations of each command!**
