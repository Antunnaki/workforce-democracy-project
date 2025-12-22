#Manual Deployment Instructions

## Overview
Due to permission restrictions on the server, we'll need to manually deploy the updated files. This document provides step-by-step instructions for deploying the privacy-first signup flow updates.

## Files to Deploy
The following files contain the updated privacy-first signup flow:
- `index.html` - Contains theupdated HTML structure for the signup wizard
- `js/personalization-ui.js` - Contains the wizard controller logic
- `js/personalization-system.js` - Contains the enhanced personalization system

## Deployment Steps

### 1. Package the Files
First, create a deployment package on your local machine:

```bash
tar -czf wdp-frontend-update.tar.gz index.html js/personalization-ui.js js/personalization-system.js datashasum -a 256 wdp-frontend-update.tar.gz > wdp-frontend-update.tar.gz.sha256
```

###2. Upload the Package
Upload the package to the server using SCP:

```bash
scp -i ~/.ssh/id_ed25519_njallawdp-frontend-update.tar.gz wdp-frontend-update.tar.gz.sha256 deploy@185.193.126.13:/tmp/
```

### 3. Extract and Deploy on Server
SSH into the server and run these commands:

```bash
# SSH into theserver
ssh -i ~/.ssh/id_ed25519_njalla deploy@185.193.126.13

# Once connected to the server, verifythe checksum and run deployment:
cd /var/www/workforcedemocracyproject.org
sha256sum -c /tmp/wdp-frontend-update.tar.gz.sha256 || { echo "Checksum verification failed!"; exit 1; }

sudo /usr/local/bin/wdp-frontend-deploy.sh extract /tmp/wdp-frontend-update.tar.gz /var/www/workforcedemocracyproject.org

# Set proper ownership and permissions
sudo /usr/local/bin/wdp-frontend-deploy.sh permissions /var/www/workforcedemocracyproject.org

# Clean up
rm /tmp/wdp-frontend-update.tar.gz /tmp/wdp-frontend-update.tar.gz.sha256

# Reload nginx
sudo /usr/local/bin/wdp-frontend-deploy.sh reload
```

###4. Verify Deployment
After deployment, verify that the changes are working correctly:

1. Visit https://workforcedemocracyproject.org in your browser
2. Open the developer console (F12)
3. Test the new signup flow:
   - Check that the privacy mode selection appears first
   - Verify thatLocal-only mode works without network calls
   - Confirm that Sync mode properly calls the register endpoint
   -Ensure the recovery kit is displayed and required for both modes

### 5. Troubleshooting
If you encounter issues:

1. Check nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. Check that files were extracted correctly:
   ```bash
  ls -la /var/www/workforcedemocracyproject.org/
   ```

3. Verify nginx configuration:
   ```bash
   sudo nginx -t
   ```

4. Check service status:
   ```bashsudo systemctl status nginx
   ```

## Rollback Procedure
If you need to rollback the changes:

1. If you have a backup, restore it:
   ```bash
   # List available backups
   ls -l /var/backups/wdp-frontend-backup-*.tar.gz
   
   # Restorethe most recent backup (adjust filename as needed)
   sudo /usr/local/bin/wdp-frontend-deploy.sh extract /var/backups/wdp-frontend-backup-YYYYMMDDHHMMSS.tar.gz /var/www/workforcedemocracyproject.org
   
   # Reload nginx
   sudo /usr/local/bin/wdp-frontend-deploy.sh reload
   ```

2. Ifno backup is available, redeploy theprevious version from your version control.

## Post-Deployment Verification
Run through the production UI smoke test checklist:

- [ ] Load https://workforcedemocracyproject.org in browser
- [ ] Verify page loadswithout errors
- [ ] Check for broken images or missing assets
- [ ] Test the new privacy-first signup flow
- [ ] Verify Local-only mode works without network calls
- [ ] Verify Sync mode properly registers users
- [ ] Check that recovery kit is displayed and required
- [ ] Verify no consoleerrors
- [ ] Confirm CSP headers are properly enforced
- [] Test on mobile devices

## AdditionalNotes
- Long cache on static assets; use hard refresh (Cmd/Ctrl+Shift+R) while testing
- The updated signup flow maintains zero-knowledge encryption principles
- Local-only mode stores all data onthe device with no network calls
- Sync mode encrypts dataclient-side before transmission
- Optional emailfield is only used for recovery file delivery (if provided)