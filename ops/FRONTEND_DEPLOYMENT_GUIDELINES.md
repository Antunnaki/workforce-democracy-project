# Frontend Deployment Guidelines

## Overview
This document outlines the guidelines for deploying the Workforce Democracy Project frontend to production and beta environments.

## Hosting Strategy
- **Production**: Hosted directly on the VPS (185.193.126.13) via Nginx
- **Beta/Preview**: Hosted on Netlify for quick previews and PR builds

## Production Deployment Process

### 1. Prepare Frontend Files
Ensure all frontend files are built and ready for deployment:
```bash
# In the project root directory
ls -la frontend/
# Should show index.html and config/ directory
```

### 2. Sync Files to Server
Use rsync to deploy frontend files to the production server:
```bash
# From your local machine
rsync -av --delete frontend/ root@185.193.126.13:/var/www/workforcedemocracyproject.org/
```

### 3. Verify Deployment
Check that files are properly deployed:
```bash
# On the server
ls -la /var/www/workforcedemocracyproject.org/
ls -la /var/www/workforcedemocracyproject.org/config/
```

### 4. Test Accessibility
Verify files are accessible via HTTPS:
```bash
curl -I https://workforcedemocracyproject.org/
curl -I https://workforcedemocracyproject.org/config/index.js
```

## Beta/Preview Deployment Process
For beta and preview deployments, use Netlify:
1. Push changes to a feature branch
2. Create a pull request
3. Netlify will automatically create a preview deployment
4. Review and test the preview
5. Merge to deploy to beta environment

## Configuration Management
The frontend uses environment-specific configuration files:
- `frontend/config/production.js` - Production environment settings
- `frontend/config/beta.js` - Beta environment settings
- `frontend/config/index.js` - Dynamic configuration loader

The configuration loader automatically selects the appropriate config based on the hostname:
- Hostnames containing 'beta' use beta configuration
- Hostnames 'localhost' use beta configuration (for local development)
- All other hostnames use production configuration

## Security Considerations
1. All frontend files are served over HTTPS
2. Content Security Policy (CSP) headers are configured in Nginx
3. HSTS headers are enabled for production
4. No user data is stored on the server
5. All external CDNs are explicitly allowed in CSP headers

## Troubleshooting

### 404 Errors for Config Files
If you see 404 errors for configuration files:
1. Verify the entire frontend directory was synced to the server
2. Check file permissions on the server
3. Hard-refresh the browser (Ctrl/Cmd+Shift+R) to bypass cache

### CSP Errors
If you see CSP errors in the browser console:
1. Verify Nginx is serving the correct CSP headers
2. Check for conflicting meta CSP tags in HTML files
3. Ensure all required CDNs are included in the CSP policy

### Process.env Undefined Errors
If you see "process is not defined" errors:
1. Update the config loader to guard against undefined process.env
2. Use the pattern: `typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development'`

## Maintenance
Regular maintenance tasks:
1. Monitor server logs for 404 errors
2. Check SSL certificate expiration dates
3. Review and update CSP policies as needed
4. Update frontend dependencies periodically

## Rollback Procedure
In case of issues with a deployment:
1. Identify the last working version
2. Restore files from backup or previous commit
3. Redeploy the known working version
4. Verify functionality after rollback