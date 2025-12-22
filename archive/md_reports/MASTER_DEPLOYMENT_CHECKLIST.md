# MASTER DEPLOYMENT CHECKLIST
Version: December 6, 2025

## TABLE OF CONTENTS
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Automated Frontend Deployment](#automated-frontend-deployment)
3. [Manual Backend Deployment](#manual-backend-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Rollback Procedure](#rollback-procedure)

---

## PRE-DEPLOYMENT CHECKLIST

### Environment Preparation
- [ ] Verify access to Njalla VPS (185.193.126.13)
- [ ] Confirm SSH credentials are available
- [ ] Verify Git repository access
- [ ] Check Netlify deployment access
- [ ] Prepare Qwen API key from DashScope

### Code Review
- [ ] Review recent changes in Git repository
- [ ] Check for any breaking changes
- [ ] Verify all tests pass locally
- [ ] Confirm documentation is up to date

### Backup
- [ ] Create backup of current production database
- [ ] Backup current backend files
- [ ] Document current version numbers

---

## AUTOMATED FRONTEND DEPLOYMENT

### 1. Git Deployment
```bash
# Navigate to project directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project"

# Add all changed files to git
git add .

# Commit changes with descriptive message
git commit -m "Deploy chat fixes - Remove test backend override and update API configuration"

# Push to GitHub (triggers Netlify auto-deployment)
git push origin main
```

### 2. Monitor Deployment
- [ ] Check Netlify dashboard for deployment status
- [ ] Wait for deployment to complete (typically 1-2 minutes)
- [ ] Verify deployment was successful

### 3. Specific Chat Fixes Verification
- [ ] Verify test backend override script is commented out in `index.html`
- [ ] Confirm `CleanChat.apiBase` is set correctly in `js/chat-clean.js`
- [ ] Verify `getBackendUrl()` in `js/config.js` returns production endpoint

---

## MANUAL BACKEND DEPLOYMENT

### 1. Access Server
```bash
ssh root@185.193.126.13
# Password: YNWA1892LFC
```

### 2. Navigate to Project Directory
```bash
cd /var/www/workforce-democracy/backend
```

### 3. Pull Latest Code
```bash
git pull origin main
```

### 4. Update Dependencies
```bash
npm install
```

### 5. Update Environment Variables (if needed)
Edit `.env` file and ensure the following variables are correctly set:
```bash
# Qwen API Configuration (Primary AI Service)
QWEN_API_KEY=your_actual_qwen_api_key_from_dashscope
QWEN_MODEL=qwen-plus

# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_NAME=workforce_democracy
DB_PORT=5432

# MongoDB for session storage
MONGODB_URI=mongodb://localhost:27017/workforce_democracy
```

### 6. Restart Services
```bash
pm2 restart workforce-democracy-a
pm2 restart workforce-democracy-b
```

### 7. Verify Services
```bash
pm2 list
pm2 logs workforce-democracy-a
```

---

## POST-DEPLOYMENT VERIFICATION

### Health Checks
- [ ] Verify backend health endpoint:
  ```bash
  curl -X GET "https://api.workforcedemocracyproject.org/api/civic/health"
  ```
  
- [ ] Verify AI service health endpoint:
  ```bash
  curl -X GET "https://api.workforcedemocracyproject.org/api/civic/llm-health"
  ```
  
  Expected response:
  ```json
  {
    "success": true,
    "available": true,
    "model": "qwen-plus",
    "provider": "Tongyi Lab",
    "message": "LLM service is available"
  }
  ```

### Functional Tests
- [ ] Test representative search by ZIP code:
  ```bash
  curl -X GET "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=10001"
  ```

- [ ] Test AI chat functionality:
  ```bash
  curl -X POST "https://api.workforcedemocracyproject.org/api/civic/llm-chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Who are the US senators for New York?"}'
  ```

- [ ] Verify frontend chat widget loads correctly
- [ ] Test chat functionality through frontend UI
- [ ] Verify citations and sources are properly displayed

### Performance Monitoring
- [ ] Monitor server resource usage (CPU, memory, disk)
- [ ] Check application logs for errors
- [ ] Verify response times are acceptable
- [ ] Confirm no rate limiting issues

---

## TROUBLESHOOTING GUIDE

### Common Issues and Solutions

#### 1. AI Service Returning Fallback Messages
**Symptoms**: Chat responses are generic fallback messages instead of AI-generated content

**Diagnosis**:
```bash
# Check backend logs for Qwen API errors
pm2 logs workforce-democracy-a | grep -i qwen

# Test Qwen API connectivity directly
curl -X GET "https://api.workforcedemocracyproject.org/api/civic/llm-health"
```

**Solutions**:
- [ ] Verify Qwen API key is correctly set in `.env` file
- [ ] Check Qwen API key has not expired or been revoked
- [ ] Verify Qwen API quota has not been exceeded
- [ ] Check for network connectivity issues to DashScope

#### 2. CORS Errors
**Symptoms**: Frontend cannot communicate with backend API

**Diagnosis**:
- Check browser console for CORS errors
- Verify Nginx configuration

**Solutions**:
- [ ] Confirm Nginx reverse proxy is properly configured
- [ ] Verify `FRONTEND_URL` in `.env` matches actual frontend domain
- [ ] Check that CORS headers are being set correctly by Nginx
- [ ] Verify test backend override script is not active in production

#### 3. Database Connection Issues
**Symptoms**: Application fails to start or returns 500 errors

**Diagnosis**:
```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# Check MongoDB service status
sudo systemctl status mongod

# Check backend logs for database errors
pm2 logs workforce-democracy-a | grep -i database
```

**Solutions**:
- [ ] Verify database credentials in `.env` file
- [ ] Confirm PostgreSQL and MongoDB services are running
- [ ] Check firewall settings for database ports
- [ ] Verify database user permissions

#### 4. PM2 Service Issues
**Symptoms**: Services not starting or crashing

**Diagnosis**:
```bash
# Check PM2 status
pm2 list

# Check detailed logs
pm2 logs workforce-democracy-a
```

**Solutions**:
- [ ] Check for missing environment variables
- [ ] Verify all required dependencies are installed
- [ ] Check for syntax errors in configuration files
- [ ] Review PM2 configuration in `ecosystem.config.js`

#### 5. Chat Widget Not Working
**Symptoms**: Chat widget fails to load or send messages

**Diagnosis**:
- Check browser console for JavaScript errors
- Verify API endpoint URLs are correct
- Check network tab for failed requests

**Solutions**:
- [ ] Confirm test backend override script is commented out in `index.html`
- [ ] Verify `CleanChat.apiBase` is set correctly
- [ ] Check that frontend is using direct API endpoint, not async
- [ ] Verify Nginx configuration allows access to API endpoints

---

## ROLLBACK PROCEDURE

### If Issues Occur Within 30 Minutes of Deployment

1. **Stop Current Services**
   ```bash
   pm2 stop workforce-democracy-a
   pm2 stop workforce-democracy-b
   ```

2. **Revert Code Changes**
   ```bash
   git reset --hard HEAD~1
   ```

3. **Restore Previous Environment**
   ```bash
   # If you backed up .env file
   cp .env.backup .env
   ```

4. **Start Previous Version**
   ```bash
   pm2 start workforce-democracy-a
   pm2 start workforce-democracy-b
   ```

### If Issues Occur After 30 Minutes

1. **Deploy Previous Known Good Version**
   ```bash
   git checkout <known-good-commit-hash>
   ```

2. **Follow Standard Deployment Process**
   - Update dependencies if needed
   - Verify environment variables
   - Start services
   - Perform verification tests

### Emergency Rollback

If the site is completely down:

1. **Restore from Backup**
   - Restore database from backup
   - Restore backend files from backup

2. **Contact Stakeholders**
   - Notify team of downtime
   - Provide estimated time to resolution

3. **Document Incident**
   - Record what went wrong
   - Document steps taken to resolve
   - Identify preventive measures for future

---

*This checklist should be followed for every deployment to ensure consistency and minimize risk.*