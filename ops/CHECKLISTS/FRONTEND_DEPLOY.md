# Frontend Deploy — Quick Checklist (prod/beta)

- [ ] Prep: Confirm you’re on the correct branch (beta → Beta, main → Prod)
- [ ] Build/validate locally (optional for static): open `index.html` and test wizard
- [ ] Confirm CSP/CDN allowances unchanged (see `_headers` and `ops/TEMPLATES/nginx_main_website.conf`)

Deployment (scripted)
- [ ] Export env: `USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org`
- [ ] Run: `VERIFY=1 ./ops/DEPLOY_FRONTEND.sh`
- [ ] For broader changes: set `FILES="index.html js css images sw.js manifest.json"`

Verification
- [ ] Apex 200: `curl -I https://workforcedemocracyproject.org | head -n1` → HTTP/2 200
- [ ] WWW 200: `curl -I https://www.workforcedemocracyproject.org | head -n1`
- [ ] JS MIME: `curl -I https://workforcedemocracyproject.org/js/personalization-ui.js | grep -i content-type` → application/javascript
- [ ] Headers: `curl -I https://workforcedemocracyproject.org | grep -Ei "content-security|strict-transport"`
- [ ] CORS preflight OK for register (Origin apex)

Functional (browser, private window)
- [ ] Local‑only flow: no network calls until Complete; Recovery Kit required
- [ ] Sync flow: username+passphrase (+ optional email) → register OK; recovery shows
- [ ] No console errors; assets 200; CSP OK; no meta CSP conflicts

Rollback (if needed)
- [ ] List backups: `ls -l /var/backups/wdp-frontend-backup-*.tar.gz | tail -n5`
- [ ] Restore previous backup to docroot; reload Nginx

Notes
- Long cache on static assets; use hard refresh while testing
- Do not paste secrets into repo or commands
