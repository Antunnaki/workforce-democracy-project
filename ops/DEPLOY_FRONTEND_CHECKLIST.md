# Frontend Deployment Checklist

## Prerequisites
- [ ] SSH access to the server (root or sudo privileges)
- [ ] Built frontend files ready for deployment
- [ ] Nginx configuration properly set up for the domain
- [ ] SSL certificate obtained and configured

## Deployment Steps

### 1. Prepare Frontend Files
- [ ] Build production version of frontend (if needed)
- [ ] Optimize assets for web delivery
- [ ] Verify all links and API endpoints are correctly configured

### 2. Upload Files to Server
```bash
# From your local machine, upload files to server
rsync -avz --exclude='.git' --exclude='node_modules' /path/to/local/frontend/ root@185.193.126.13:/var/www/workforcedemocracyproject.org/
```

Or using scp:
```bash
# Create a tarball of your frontend files
tar -czf frontend.tar.gz -C /path/to/local/frontend .

# Upload to server
scp frontend.tar.gz root@185.193.126.13:/tmp/

# On the server, extract files
ssh root@185.193.126.13
cd /var/www
tar -xzf /tmp/frontend.tar.gz -C workforcedemocracyproject.org/
```

### 3. Set Proper Permissions
```bash
# On the server
chown -R www-data:www-data /var/www/workforcedemocracyproject.org/
chmod -R 755 /var/www/workforcedemocracyproject.org/
```

### 4. Verify Configuration
- [ ] Check that `index.html` is in the root directory
- [ ] Verify that all assets (CSS, JS, images) are in correct locations
- [ ] Confirm API endpoints in frontend config point to `https://api.workforcedemocracyproject.org`

### 5. Test Deployment
- [ ] Restart Nginx: `systemctl reload nginx`
- [ ] Visit `https://workforcedemocracyproject.org` in browser
- [ ] Check for any broken assets or JavaScript errors
- [ ] Test API connectivity through the frontend

### 6. Verify Security Headers
```bash
curl -I https://workforcedemocracyproject.org | grep -E "(content-security-policy|strict-transport-security|x-frame-options)"
```

Should show proper security headers.

### 7. Mobile Testing
- [ ] Test website on various mobile devices
- [ ] Verify responsive design works correctly
- [ ] Check that all interactive elements are functional

## Post-Deployment Verification

### Browser Testing
- [ ] Chrome (desktop and mobile)
- [ ] Firefox (desktop and mobile)
- [ ] Safari (desktop and mobile)
- [ ] Edge (desktop)

### Performance Checks
- [ ] Page load time under 3 seconds
- [ ] All assets loading correctly
- [ ] No console errors

### Security Verification
- [ ] No mixed content warnings
- [ ] Valid SSL certificate
- [ ] Proper CSP implementation
- [ ] HSTS headers present

## Rollback Plan

If issues are discovered after deployment:

1. Backup current deployment:
```bash
tar -czf /tmp/frontend-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /var/www workforcedemocracyproject.org
```

2. Restore previous version (if available):
```bash
# Stop web server
systemctl stop nginx

# Restore from backup
rm -rf /var/www/workforcedemocracyproject.org/*
tar -xzf /path/to/previous/frontend.tar.gz -C /var/www/workforcedemocracyproject.org/

# Start web server
systemctl start nginx
```

## Automation Script

Consider creating a deployment script for future updates:

```bash
#!/bin/bash
# deploy-frontend.sh

# Variables
SERVER="root@185.193.126.13"
REMOTE_PATH="/var/www/workforcedemocracyproject.org"
LOCAL_PATH="./dist"  # Your built frontend files

# Build frontend (if needed)
npm run build

# Create archive
tar -czf /tmp/frontend-deploy.tar.gz -C $LOCAL_PATH .

# Upload to server
scp /tmp/frontend-deploy.tar.gz $SERVER:/tmp/

# Deploy on server
ssh $SERVER "
  # Backup current deployment
  tar -czf /tmp/frontend-backup-\$(date +%Y%m%d-%H%M%S).tar.gz -C /var/www workforcedemocracyproject.org
  
  # Deploy new version
  rm -rf $REMOTE_PATH/*
  tar -xzf /tmp/frontend-deploy.tar.gz -C $REMOTE_PATH
  
  # Set permissions
  chown -R www-data:www-data $REMOTE_PATH
  chmod -R 755 $REMOTE_PATH
  
  # Reload web server
  systemctl reload nginx
"

# Clean up
rm /tmp/frontend-deploy.tar.gz
```