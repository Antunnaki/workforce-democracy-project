# 🚀 Backend Knowledge Base - Quick Start Guide

**Date**: January 28, 2025  
**Status**: Ready to Deploy!  
**Time to Deploy**: ~30-60 minutes

---

## 🎯 What You Now Have

✅ **Complete database schema** (9 tables, 3 views, 5 famous cases pre-loaded)  
✅ **Node.js API server** with intelligent routing (cache→database→AI)  
✅ **Dependencies configured** (package.json ready)  
✅ **Environment template** (.env.example with all variables)  
✅ **Documentation** (backend/README.md with full details)

---

## 📦 Files Created

```
backend/
├── database-schema.sql       (18,902 chars) - PostgreSQL schema
├── server.js                 (20,210 chars) - API server
├── package.json              (1,248 chars) - Dependencies
├── .env.example              (2,075 chars) - Environment template
└── README.md                 (9,447 chars) - Full documentation
```

---

## ⚡ Quick Deploy to Njalla VPS

### **Step 1: SSH into Your Njalla VPS**
```bash
ssh root@your-njalla-vps-ip
```

### **Step 2: Install PostgreSQL** (if not already installed)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Step 3: Install Node.js 18+** (if not already installed)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should be 18+
npm --version
```

### **Step 4: Create Database**
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE workforce_democracy;
CREATE USER wdp_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE workforce_democracy TO wdp_user;
\q
```

### **Step 5: Upload Backend Files**
```bash
# On your local machine, compress backend folder
cd /path/to/project
tar -czf backend.tar.gz backend/

# Upload to VPS
scp backend.tar.gz root@your-vps-ip:/var/www/

# On VPS, extract
cd /var/www
tar -xzf backend.tar.gz
cd backend
```

### **Step 6: Install Dependencies**
```bash
npm install
```

### **Step 7: Configure Environment**
```bash
# Copy env template
cp .env.example .env

# Edit with your values
nano .env

# Required variables:
# - DB_PASSWORD (PostgreSQL password you created)
# - GROQ_API_KEY (sign up at https://groq.com/)
# - SESSION_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - JWT_SECRET (generate with same command)
# - FRONTEND_URL (https://workforcedemocracyproject.org)
```

### **Step 8: Initialize Database**
```bash
# Run schema
psql -U wdp_user -d workforce_democracy -f database-schema.sql

# Verify tables created
psql -U wdp_user -d workforce_democracy -c "\dt"

# Should see: bills, representatives, court_cases, cooperatives, user_contexts, conversation_memory, cached_responses, faq_content, api_usage_metrics
```

### **Step 9: Start Server**
```bash
# Test run
npm start

# Should see:
# ═══════════════════════════════════════════════════
#   🏛️  Workforce Democracy Project - Backend API
# ═══════════════════════════════════════════════════
#   Server running on port 3001
#   ✅ Connected to PostgreSQL database
```

### **Step 10: Set Up PM2** (keeps server running)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name workforce-democracy-backend

# Save PM2 config
pm2 save

# Auto-start on boot
pm2 startup
```

### **Step 11: Configure Nginx Reverse Proxy**
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/api.workforcedemocracyproject.org

# Add this configuration:
server {
    listen 80;
    server_name api.workforcedemocracyproject.org;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/api.workforcedemocracyproject.org /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### **Step 12: Set Up SSL** (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.workforcedemocracyproject.org

# Auto-renewal is set up automatically!
```

### **Step 13: Test API**
```bash
# Health check
curl https://api.workforcedemocracyproject.org/health

# Should return:
# {"status":"ok","timestamp":"2025-01-28T..."}

# Test famous case query
curl -X POST https://api.workforcedemocracyproject.org/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "chat_type": "supreme-court",
    "user_id": "test-user",
    "query": "what is roe v wade?"
  }'

# Should return detailed case information!
```

---

## ✅ Deployment Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js 18+ installed
- [ ] Database created (`workforce_democracy`)
- [ ] Database user created (`wdp_user`)
- [ ] Backend files uploaded to `/var/www/backend`
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured with all variables
- [ ] Database schema initialized
- [ ] Server starts successfully (`npm start`)
- [ ] PM2 configured for auto-restart
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Health check endpoint works
- [ ] Chat query endpoint works

---

## 🔧 Post-Deployment

### **Monitor Logs**:
```bash
# PM2 logs
pm2 logs workforce-democracy-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Check Performance**:
```bash
# PM2 status
pm2 status

# PM2 monitoring
pm2 monit
```

### **Check Database**:
```bash
# Connect to database
psql -U wdp_user -d workforce_democracy

# Check cache hit rate
SELECT * FROM cache_hit_rate;

# Check cost summary
SELECT * FROM cost_summary;

# Check API metrics
SELECT chat_type, source, COUNT(*), AVG(response_time_ms)
FROM api_usage_metrics
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY chat_type, source;
```

---

## 📊 Expected Results

After deployment, you should see:

**Cache Hit Rate**: Will start at 0% and increase to 80-90% over time as queries are cached

**Response Times**:
- Cache hits: 0-50ms ✨
- Database hits: 50-200ms ✅
- AI queries: 500-2000ms 🤖

**Cost Per Query**:
- Cached: $0 (FREE!)
- Database: $0 (FREE!)
- AI: ~$0.0001

**Monthly Costs** (estimated):
- With 90% cache hit: ~$1-2/month for AI queries
- Infrastructure: €0 additional (using existing Njalla VPS)

---

## 🎉 Success!

Once deployed, update your frontend to call the backend API:

```javascript
// In js/inline-civic-chat.js and other chat files:
const BACKEND_API = 'https://api.workforcedemocracyproject.org';

async function queryBackend(chatType, query, userId, context) {
    const response = await fetch(`${BACKEND_API}/api/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_type: chatType,
            user_id: userId,
            query: query,
            context: context
        })
    });
    
    return await response.json();
}
```

---

## 🆘 Troubleshooting

### **Database Connection Failed**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U wdp_user -d workforce_democracy -c "SELECT NOW();"
```

### **Port 3001 Already in Use**:
```bash
# Find process
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

### **PM2 Not Starting**:
```bash
# Delete old PM2 process
pm2 delete workforce-democracy-backend

# Restart
pm2 start server.js --name workforce-democracy-backend
```

### **Nginx 502 Bad Gateway**:
```bash
# Check backend is running
pm2 status

# Check Nginx config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 Next Steps

1. **Populate Data**: Run data population scripts
   ```bash
   node scripts/populate-court-cases.js
   node scripts/populate-bills.js
   node scripts/populate-cooperatives.js
   ```

2. **Monitor Performance**: Check cache hit rates and costs

3. **Iterate**: Optimize based on real usage patterns

4. **Expand**: Add more government data sources

---

## 🎯 Success Metrics to Track

- **Cache Hit Rate**: Target 80-90%
- **Response Time**: Target <100ms for cached queries
- **Monthly Costs**: Target <$5/month for AI queries
- **User Satisfaction**: Monitor via feedback

---

**You're ready to deploy!** 🚀

Any questions? Check `backend/README.md` for full documentation or ask me!
