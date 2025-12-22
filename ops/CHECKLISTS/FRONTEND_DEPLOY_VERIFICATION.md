# Frontend Deployment Verification Checklist

## Pre-deployment
- [ ] Confirm correct branch (beta → Beta environment, main → Production)
- [ ] Validate locally (open `index.html` and test functionality)
- [ ] Verify CSP/CDN allowances unchanged (check `_headers` and Nginx configs)
- [ ] Package files with `tar -czf frontend-<timestamp>.tar.gz <files>`

## Deployment Process
- [ ] Upload package to server with `scp`
- [ ] Extract files to docroot using deployment helper
- [ ] Set proper ownership (`www-data:www-data`) and permissions using deployment helper
- [ ] Create backup of previous deployment
- [ ] Reload Nginx service using deployment helper

## Post-deployment Verification

### Basic Accessibility
- [ ] Apex domain loads correctly (HTTP 200): `curl -I https://workforcedemocracyproject.org`
- [ ] WWW domain loads correctly (HTTP 200): `curl -I https://www.workforcedemocracyproject.org`
- [ ] All assets load without 404 errors

### File Integrity
- [ ] JavaScript files load with correct MIME types
- [ ] CSS files load with correct MIME types
- [ ] Images load correctly

### Security Compliance
- [ ] Content Security Policy headers present
- [ ] Strict Transport Security headers present
- [ ] No mixed content warnings (HTTP resources on HTTPS page)
- [ ] All external resources are allowed by CSP

### API Integration
- [ ] CORS preflight checks pass for API endpoints
- [ ] API endpoints accessible from frontend
- [ ] Credentials properly handled in CORS requests

### Privacy-First Signup Flow
- [ ] Local-only mode functions without network calls (verify in DevTools Network tab)
- [ ] Sync mode registers users correctly with optional email
- [ ] Recovery Kit displays properly and is required for completion
- [ ] Password strength meter works for Sync mode
- [ ] Form validation works for both modes

### Browser Compatibility
- [ ] No console errors in browser
- [ ] Works in latest Chrome
- [ ] Works in latest Firefox
- [ ] Works in latest Safari
- [ ] Works on mobile devices

### Performance
- [ ] Page load time under 3 seconds
- [ ] Assets cached appropriately
- [ ] No render-blocking resources

## Rollback Readiness
- [ ] Backup file created in `/var/backups/`
- [ ] Backup file contains all necessary files
- [ ] Rollback procedure documented and tested

## Notes
- Long cache on static assets; use hard refresh while testing
- Do not paste secrets into repo or commands
- Document any issues encountered during deployment