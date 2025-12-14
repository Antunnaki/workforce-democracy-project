#Ops Coordination (source of truth)

### Status
- Environments: beta | prod
- Production API: api.workforcedemocracyproject.org → 185.193.126.13:3000
- Production CSP: Enabled with strict security policy
- Current release (beta): `/srv/wdp/current-beta` → /srv/wdp/releases/20251211173831
- Node/npm on server: v20.19.6 / 10.8.2
- App port (beta): 3001 (via `PORT=3001`)
- TLS: prod ✓ (strict profile) | beta ✓ (relaxed profile active; HTTPS OK; `/→/health`)

### Verification results (post‑TLS)
#### Certbot certificates (beta + prod)
- api-beta.workforcedemocracyproject.org: ECDSA; expires 2026-03-1122:32:11Z; paths at `/etc/letsencrypt/live/api-beta.workforcedemocracyproject.org/`
- api.workforcedemocracyproject.org: ECDSA; expires 2026-03-11 01:00:12Z; pathsat `/etc/letsencrypt/live/api.workforcedemocracyproject.org/`
- workforcedemocracyproject.org: ECDSA; expires 2026-03-13; paths at `/etc/letsencrypt/live/workforcedemocracyproject.org/`

#### HTTP/HTTPS checks (beta)
```
Root redirect v4: HTTP/1.1 302 Moved Temporarily
Root redirect v6: HTTP/1.1 302 Moved Temporarily
/health v4: HTTP/1.1 200 OK
/health v6: HTTP/1.1 200 OK
```

#### TLS session (OpenSSL, brief)
```
Protocol TLSv1.3; ciphersuite TLS_AES_256_GCM_SHA384; CN=api-beta.workforcedemocracyproject.org; Verification: OK
```

### Team access note (prod/beta)
Ling and Junie have full local write access, terminal access (backend + frontend), and can modify local frontend files and backend code. They may push changes directly to git (docs/cleanup-20251210 branch currently in use) and run deployment/check scripts as needed.

### Done /Changelog
- 2025-12-13: Switched to Singapore OpenAI-compatible endpoint with new international API key. Verified successful chat response from Qwen model. Test prompt: "who is my state representative in California?" completed in 4.6s. API is now fully functional.
- 2025-12-13: Verified DashScope API integration. Confirmed API key is valid but account has exhausted free tier quota. Need to disable "use free tier only" mode in DashScope console to enable paid access. Backend code is properly configured.
- 2025-12-13: Added lightweight monitoring for beta API with 5-minute health checks. Script at /usr/local/bin/wdp-beta-health-check.sh, logging to /var/log/wdp-beta-health.log, scheduled via cron. Verified health endpoint is responding correctly.
- 2025-12-13: Added https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy. Updated /etc/nginx/snippets/wdp-security-relaxed.conf and /srv/wdp/shared/beta.env. Nginx reloaded and backend restarted. Verification passed: CORS headers correctly returned for authorized origin and blocked for unauthorized origin.
- 2025-12-13: Completed all preparatory work for adding https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy; created documentation, scripts, and implementation plan. Server-side changes pending execution.
- 2025-12-13: Added documentation and scripts for updating beta CORS policy to include https://beta-workforcedemocracyproject.netlify.app; prepared deployment plan and verification procedures.
- 2025-12-13: Preparing to add https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy; preparing documentation and deployment plan.
- 2025-12-12: Beta Nginx: `/→/health` redirect live; security profile symlink active → relaxed; CORS dev origins added (localhost:3000, 127.0.0.1:3000, preview Netlify pattern); Nginx reload OK; verification passed (302→/health, 200 at /health, v4+v6).
- 2025-12-11: Issued Let's Encrypt cert for beta; Nginx reloaded; TLS verified OK (SNI/chain). Root path currently 404 by design.
- 2025-11: Successfully deployed backend with fixed syntax errors; service running on port 3001; ready for SSL certificate issuance.
- 2025-11: Preparing to enable SSL certificate for beta environment; all prerequisites verified; awaiting root access to execute certificate issuance.
- 2025-11: Created/updated coordination system; beta service healthy on port 3001; release layout normalized; lockfile deployment fixed; `/version` endpoint added; preflight checks passed for SSL issuance.

### Appendix
- Node/npm on server: `node -v; npm -v` should show Node 20 LTS (npm 10). Node 18 (npm 9) is acceptable but align to avoid lockfile churn.
- Rsync excludes: `.git`, `node_modules`, `.idea`, `*.iml`, `.DS_Store`.
- Version stamping example:
  ```bash
 printf '{"commit":"%s","builtAt":"%s"}\n' \
    "$(git rev-parse --short HEAD 2>/dev/null || echo manual)" \
    "$(date -u +%FT%TZ)" | sudo tee /srv/wdp/current-beta/version.json >/dev/null
  ```
### Done /Changelog
- 2025-12-13: DNS records successfully updated in Porkbun for workforcedemocracyproject.org and api.workforcedemocracyproject.org pointing to VPS IP 185.193.126.13
- 2025-12-13: Verified DNS propagation with dig showing A record 185.193.126.13 and AAAA record 2a0a:3840:1337:126:0:b9c1:7e0d:1337
- 2025-12-13: API health endpoint responding with 200 OK and proper security headers including CSP
- 2025-12-13: Chat endpoint working correctly with Qwen API integration
- 2025-12-13: Both wdp-backend-prod and wdp-backend-beta services running correctly
- 2025-12-13: Production environment now properly configured with CSP headers and working API endpoints

- 2025-12-13: Created production health check script (/usr/local/bin/wdp-prod-comprehensive-health-check.sh) and added to crontab (runs every 5 minutes)
- 2025-12-13: Created frontend configuration files to distinguish between beta and production environments
- 2025-12-13: Created production UI smoke test checklist (ops/PROD_SMOKE_TEST_CHECKLIST.md)

- 2025-12-13: Created Nginx configuration template for main website (ops/TEMPLATES/nginx_main_website.conf)
- 2025-12-13: Created deployment script for main website (ops/DEPLOY_MAIN_WEBSITE.sh)
- 2025-12-13: Configured HSTS headers for enhanced security
- 2025-12-13: Ensured proper SSL certificate coverage for both apex and www domains
- 2025-12-13: Implemented HTTP to HTTPS redirects for all traffic
- 2025-12-14: Successfully deployed main website with proper SSL certificate and security headers
- 2025-12-14: Website is now accessible at https://workforcedemocracyproject.org with all security headers properly configured
- 2025-12-14: Created updated Nginx configuration with CSP headers (ops/TEMPLATES/nginx_main_website_with_csp.conf)
- 2025-12-14: Synced complete frontend directory to server including config files
- 2025-12-14: Updated frontend config to guard against process.env undefined error
- 2025-12-14: Updated Nginx configuration to include www subdomain (pending DNS setup)
- 2025-12-14: Verified proper MIME types and CSP headers for frontend files