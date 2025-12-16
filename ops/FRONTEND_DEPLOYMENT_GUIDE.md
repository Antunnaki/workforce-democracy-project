# Frontend Deployment Guide (VPS)

Purpose: Provide a safe, repeatable process for deploying the static frontend to the VPS with key‑based SSH. This guide covers quick deploys, manual steps, verification, rollback, and future improvements.

## Prerequisites
- SSH access to the VPS with a key (no passwords). Example key: `~/.ssh/id_ed25519_njalla`.
- Remote document root: `/var/www/workforcedemocracyproject.org`
- Nginx configured for apex + www with CSP/HSTS (see `ops/TEMPLATES/nginx_main_website.conf`).
- Do not commit or paste secrets into the repo.

## Option A — Quick deploy using the script (recommended)
Use the helper script that packages selected files, uploads, backs up remote files, deploys, sets secure perms, and reloads Nginx.

Command:
```bash
# First run only (or after pulling the repo) — make the script executable
chmod +x ./ops/DEPLOY_FRONTEND.sh

USER=deploy \
HOST=185.193.126.13 \
SSH_KEY=~/.ssh/id_ed25519_njalla \
DOMAIN=workforcedemocracyproject.org \
VERIFY=1 \
./ops/DEPLOY_FRONTEND.sh
```

Defaults (can be overridden):
- `DOCROOT=/var/www/workforcedemocracyproject.org`
- `FILES="index.html js/personalization-ui.js js/personalization-system.js"`

Deploy more assets (full sync example):
```bash
FILES="index.html js css images sw.js manifest.json" \
USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org VERIFY=1 \
./ops/DEPLOY_FRONTEND.sh
```

What the script does:
1. Creates a timestamped tarball locally of the specified files.
2. Uploads to `~/tmp` on the VPS via scp.
3. Backs up the current remote files that match your set (to `/var/backups/wdp-frontend-backup-<ts>.tar.gz`).
4. Extracts into the docroot.
5. Sets ownership `www-data:www-data` and safe perms (dirs 755, files 644).
6. Validates and reloads Nginx.
7. Optionally runs HEAD checks for the key JS files.

Security note: This process uses key-based SSH only — no passwords.

## Option B — Manual deploy (step-by-step)
If you prefer direct commands:
```bash
# 1) Package locally
tar -czf frontend-update.tar.gz index.html js/personalization-ui.js js/personalization-system.js

# 2) Upload
scp -i ~/.ssh/id_ed25519_njalla frontend-update.tar.gz deploy@185.193.126.13:/tmp/

# 3) Apply on the server (do not paste your private key; run via your terminal)
ssh -i ~/.ssh/id_ed25519_njalla deploy@185.193.126.13 <<'EOF'
  set -e
  DOCROOT=/var/www/workforcedemocracyproject.org
  TS=$(date -u +%Y%m%d%H%M%S)
  sudo mkdir -p /var/backups "$DOCROOT"
  cd "$DOCROOT"
  # Backup (ignore missing files)
  sudo tar -czf /var/backups/wdp-frontend-backup-$TS.tar.gz \
    --ignore-failed-read index.html \
    --ignore-failed-read js/personalization-ui.js \
    --ignore-failed-read js/personalization-system.js
  # Extract
  sudo tar -xzf /tmp/frontend-update.tar.gz -C "$DOCROOT"
  # Ownership/perms
  sudo chown -R www-data:www-data "$DOCROOT"
  sudo find "$DOCROOT" -type d -exec chmod 755 {} +
  sudo find "$DOCROOT" -type f -exec chmod 644 {} +
  # Cleanup + reload
  rm /tmp/frontend-update.tar.gz
  sudo nginx -t && sudo systemctl reload nginx
EOF

# 4) Local cleanup
rm -f frontend-update.tar.gz
```

## Post‑deploy verification
Run these from your laptop:
```bash
curl -I https://workforcedemocracyproject.org/ | head -n1
curl -I https://workforcedemocracyproject.org/js/personalization-ui.js | grep -i "content-type"
curl -I https://www.workforcedemocracyproject.org/ | head -n1

# Headers
curl -I https://workforcedemocracyproject.org | grep -Ei "content-security|strict-transport"

# CORS preflight (example endpoint)
curl -i -X OPTIONS \
  https://api.workforcedemocracyproject.org/api/personalization/register \
  -H 'Origin: https://workforcedemocracyproject.org' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

In the browser (private window or hard refresh):
- Test Local‑only flow: choose Local‑only → passphrase → Recovery Kit → Complete. DevTools → Network should show no requests during Step 0/1.
- Test Sync flow: choose Sync → username + passphrase (+ optional email) → register → Recovery Kit. Confirm CORS headers.

## Rollback
If a deploy causes problems:
1. SSH to server and list backups:
   ```bash
   ls -l /var/backups/wdp-frontend-backup-*.tar.gz | tail -n 5
   ```
2. Restore the previous backup (example):
   ```bash
   sudo tar -xzf /var/backups/wdp-frontend-backup-<previous>.tar.gz -C /var/www/workforcedemocracyproject.org
   sudo systemctl reload nginx
   ```

## Caching & CSP notes
- Nginx sets long cache for static assets (js/css/images) with `immutable`. Use hard refresh (`Cmd/Ctrl+Shift+R`) during testing.
- HTML is not long‑cached; updates should appear on next load.
- CSP is served by Nginx. Avoid `<meta http-equiv="Content-Security-Policy">` duplicates in HTML to prevent conflicts.

## Future improvements
- Add a CI job (GitHub Actions) to run `ops/DEPLOY_FRONTEND.sh` with repository/environment secrets for non‑interactive deploys.
- Add asset versioning to break client caches automatically when JS/CSS change (e.g., `main.<hash>.js`).
- Expand health monitoring to include `www` host path checks for key files.

## Access reminder (policy)
Ling and Junie have full local write access and terminal access (backend + frontend). They may push changes directly (feature branches → PR) and run deployment/check scripts as needed. See `ops/COORDINATION.md` for current status and logs paths.

---

## Appendix: Privacy-first onboarding (for reference)
- Local-only by default: no network calls, no cookies; data encrypted client-side and stored locally.
- Sync optional: username + passphrase, optional email for one-time recovery delivery; payload is end-to-end encrypted before upload.
- Recovery Kit: show a 12-word (or hex) phrase; require acknowledgment and allow file download.
- CORS (API): allow-credentials with an exact `Access-Control-Allow-Origin` for apex and www; include `Vary: Origin`.
- Relevant files: `index.html` (wizard markup), `js/personalization-ui.js` (UI flow), `js/personalization-system.js` (crypto + register/localOnlyInit), `js/crypto-utils.js` (WebCrypto helpers).
