# Deploy checklist (beta and prod)

## Backend Deployment
- [ ] Local: `package-lock.json` committed; Node 18/20 used.
- [ ] Server: Node 20 preferred; npm ci used for installs.
- [ ] Create release dir `/srv/wdp/releases/<timestamp>`.
- [ ] `rsync -azv --delete` with excludes (`.git`, `node_modules`, `.idea`, `*.iml`, `.DS_Store`).
- [ ] `npm ci --omit=dev --no-audit --no-fund` inside release.
- [ ] `ln -sfn <release> /srv/wdp/current-<env>`.
- [ ] `sudo systemctl restart wdp-backend-<env>`; verify status/logs.
- [ ] Stamp `version.json` (commit + timestamp).
- [ ] Smoke test HTTP(S) endpoint; if beta, ensure TLS is valid.

## Frontend Deployment
- [ ] Confirm correct branch (beta → Beta environment, main → Production)
- [ ] Validate locally (open `index.html` and test functionality)
- [ ] Verify CSP/CDN allowances unchanged (check `_headers` and Nginx configs)
- [ ] Package files with `tar -czf frontend-<timestamp>.tar.gz <files>`
- [ ] Upload package to server with `scp`
- [ ] Extract files to docroot on server
- [ ] Set proper ownership (`www-data:www-data`) and permissions (755 for dirs, 644 for files)
- [ ] Create backup of previous deployment
- [ ] Reload Nginx service

## Verification
- [ ] Apex domain loads correctly (HTTP 200)
- [ ] WWW domain loads correctly (HTTP 200)
- [ ] JavaScript files load with correct MIME types
- [ ] CSS files load with correct MIME types
- [ ] All assets load without 404 errors
- [ ] Content Security Policy headers present
- [ ] Strict Transport Security headers present
- [ ] CORS preflight checks pass for API endpoints
- [ ] No console errors in browser
- [ ] Privacy-first onboarding flows work correctly
- [ ] Local-only mode functions without network calls
- [ ] Sync mode registers users correctly with optional email

## Rollback (if needed)
- [ ] Identify backup file in `/var/backups/`
- [ ] Extract backup to docroot
- [ ] Reload Nginx service
- [ ] Verify site functionality

## Notes
- Long cache on static assets; use hard refresh while testing
- Do not paste secrets into repo or commands