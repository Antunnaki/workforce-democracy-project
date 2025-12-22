# OPERATIONS HANDOVER — Single Source of Truth (Assistant‑First)

Purpose: This document gives any AI assistant (Lingma, Junie, others) the exact operational picture to deploy, verify, roll back, and troubleshoot without losing features.

Last Updated: 2025-12-08

---

## 1) Environments and URLs
- Version A (Production)
  - Port: 3001 (behind Nginx)
  - Purpose: Stable/live. Only updated after Version B is fully verified.
- Version B (Test/Staging)
  - Port: 3002
  - Purpose: All changes deploy here first for verification.

Frontend
- Primary domain: https://workforcedemocracyproject.org
- Netlify handles static frontend deploys. Build is triggered on `git push` to `main` (see Netlify settings and `netlify.toml`).
- Frontend API base URL is set to: `https://api.workforcedemocracyproject.org` in `js/config.js`.

Backend
- Canonical base: `/var/www/workforce-democracy/`
  - Version A (prod) path: `/var/www/workforce-democracy/version-a/backend/`
  - Version B (test) path: `/var/www/workforce-democracy/version-b/backend/`
  - Some setups also keep a unified path at: `/var/www/workforce-democracy/backend/` (use the `-p` flag in `deploy.sh` to target the correct one)
- Nginx configs (check which one is active on your server):
  - `/etc/nginx/sites-enabled/workforce-backend`
  - `/etc/nginx/sites-enabled/workforce-democracy`
  - When in doubt: `ls -la /etc/nginx/sites-enabled/`

PM2
- Version A (prod) and Version B (test) run under PM2.
- Common names used in docs/scripts: `workforce-democracy-project`, `backend-b`. Confirm with `pm2 status`.

---

## 2) Core Services and Features
- Qwen AI Integration
  - Server module: `backend/ai-service-qwen.js`
  - Env vars: `DASHSCOPE_API_KEY` or `QWEN_API_KEY`, `QWEN_MODEL` (default `qwen-plus`)
  - Frontend flag: `QWEN_ENABLED: true` in `js/config.js`

- Citations and Sources (MongoDB)
  - Critical fix: v37.20.2 “Preserve MongoDB scores” — prevents valid MongoDB results being re-scored to 0.
  - Expected behavior: 10+ quality citations when combined with article archive.

- Article Scraper System (Playwright)
  - Version: v37.20.0
  - Status: BLOCKED until Chromium libraries are installed (v37.20.0.1 fix)
  - After fix + historical seeder: expect 5k+ articles indexed; queries should surface 10+ sources.

- Async Civic Chat
  - Module: `backend/civic-llm-async.js` (v37.18.11 final)
  - Endpoints: submit/status/result under `/api/civic/llm-chat/*`

- Representatives API
  - Endpoint: `/api/civic/representatives/search?zip=XXXXX`

---

## 3) Deployment Flow (no feature loss)
1. Deploy to Version B (port 3002)
   - Update files via SCP or Git pull into `/var/www/workforce-democracy/backend/`.
   - Restart Version B PM2 process.
   - Verify endpoints and logs (see Section 4).
2. Promote to Version A (port 3001)
   - Once Version B is stable, sync/copy the tested code to Version A and restart PM2.
3. Frontend
   - `git push origin main` triggers Netlify (confirm Site settings). Validate on staging/live URLs.

Scripts
- `deploy.sh` (root): SSH helper with server/path/PM2 flags; defaults updated; use `-p` to pick:
  - Version B example: `./deploy.sh -p /var/www/workforce-democracy/version-b/backend -n backend-b -H 3002`
  - Version A example: `./deploy.sh -p /var/www/workforce-democracy/version-a/backend -n workforce-democracy-project -H 3001`
- `scripts/ssh-verify.sh`: Non-destructive SSH diagnostics for connectivity/auth.

---

## 4) Verification Checklist
Backend (Version B first)
- Health: `GET /health` → `{ ok: true, model, provider }`
- Async chat: `/api/civic/llm-chat/submit` → jobId, then poll `/status` → `completed`, then `/result` → response+sources
- Representatives: `/api/civic/representatives/search?zip=10001` → reps list with `data_sources`
- Logs: Look for banners indicating v37.20.2 is loaded; confirm preserved MongoDB scores (e.g., `score: 200`).

Frontend
- Ask AI about “Mamdani’s policies”; expect numbered sections, superscripted citations, and a rich Sources list.

---

## 5) Required Environment Variables (VPS)
- `DASHSCOPE_API_KEY` or `QWEN_API_KEY`
- `QWEN_MODEL` (e.g. `qwen-plus`)
- `MONGODB_URI` (points to your MongoDB)

Confirm with (on VPS): `printenv | egrep 'DASHSCOPE|QWEN|MONGODB|PORT'`

---

## 6) Known Blockers and Fixes
- Article scraper blocked until Chromium libs installed (v37.20.0.1). After installing, re-test scraper and run the historical seeder in `screen` (2–3 hours) to reach 5k+ articles.
- If citations remain sparse: ensure v37.20.2 is deployed and logs show score preservation.

---

## 7) SSH Access & Troubleshooting
If SSH hangs before password prompt:
- Verify port 22 is open: `nc -vz 185.193.126.13 22` (on Mac)
- Ensure `PasswordAuthentication yes` in `/etc/ssh/sshd_config` and restart SSH: `systemctl restart sshd`
- Check fail2ban/firewall: `ufw status` / `iptables -L -n`
- Prefer key-based auth. Add your public key to `/root/.ssh/authorized_keys`.

Run automated diagnostics from your Mac (project root):
```
bash scripts/ssh-verify.sh root 185.193.126.13 /var/www/workforce-democracy/backend
```

---

## 8) Rollback
1. PM2: `pm2 list` → pick prior version process or restart last working build.
2. Git (if using pulls on server): `git log -n 3` → `git checkout <last_good_commit>`
3. Nginx: ensure only one active config in `sites-enabled/`; remove stale backups.

---

## 9) Machine‑Readable Memory
See `ops-memory.json` for a snapshot assistants can parse.

---

## 10) Quick Commands (Reference)
- PM2 status: `pm2 status`
- Tail logs: `pm2 logs --lines 200`
- Restart (example): `pm2 restart workforce-democracy-project`
- Health: `curl -s http://localhost:3001/health | jq .`
- Netlify build (auto): `git push origin main`

---

## 11) Credits & Cost Control
- Default cost‑control rules live in `CREDITS-GUIDELINES.md` and MUST be followed by all assistants (Lingma, Junie, others) unless the user opts out.
- For long chats, assistants should write a short session summary and reference it going forward to preserve context without reprocessing full history.
