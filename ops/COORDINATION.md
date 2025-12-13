#Ops Coordination (source of truth)

### Status
- Environments: beta | prod
- Current release (beta): `/srv/wdp/current-beta` → /srv/wdp/releases/20251211173831
- Node/npm on server: v20.19.6 / 10.8.2
- App port (beta): 3001 (via `PORT=3001`)
- TLS: prod ✓ (strict profile) | beta ✓ (relaxed profile active; HTTPS OK; `/→/health`)

### Verification results (post‑TLS)
#### Certbot certificates (beta + prod)
- api-beta.workforcedemocracyproject.org: ECDSA; expires 2026-03-1122:32:11Z; paths at `/etc/letsencrypt/live/api-beta.workforcedemocracyproject.org/`
- api.workforcedemocracyproject.org: ECDSA; expires 2026-03-11 01:00:12Z; pathsat `/etc/letsencrypt/live/api.workforcedemocracyproject.org/`

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

### Done /Changelog
- 2025-12-13: Added lightweight monitoring for beta API with 5-minute health checks. Script at /usr/local/bin/wdp-beta-health-check.sh, logging to /var/log/wdp-beta-health.log, scheduled via cron. Verified health endpoint is responding correctly.
- 2025-12-13: Added https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy. Updated /etc/nginx/snippets/wdp-security-relaxed.conf and /srv/wdp/shared/beta.env. Nginx reloaded and backend restarted. Verification passed: CORS headers correctly returned for authorized origin and blocked for unauthorized origin.
- 2025-12-13: Completed all preparatory work for adding https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy; created documentation, scripts, and implementation plan. Server-side changes pending execution.
- 2025-12-13: Added documentation and scripts for updating beta CORS policy to include https://beta-workforcedemocracyproject.netlify.app; prepared deployment plan and verification procedures.
- 2025-12-13: Preparing to add https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy; preparing documentation and deployment plan.
- 2025-12-12: Beta Nginx: `/→/health` redirect live; security profile symlink active → relaxed; CORS dev origins added (localhost:3000, 127.0.0.1:3000, preview Netlify pattern); Nginx reload OK; verification passed (302→/health, 200 at /health, v4+v6).
- 2025-12-11: Issued Let's Encrypt cert for beta; Nginx reloaded; TLS verified OK (SNI/chain). Root path currently 404 by design.
- 2025-12-11: Successfully deployed backend with fixed syntax errors; service running on port 3001; ready for SSL certificate issuance.
- 2025-12-11: Preparing to enable SSL certificate for beta environment; all prerequisites verified; awaiting root access to execute certificate issuance.
- 2025-12-11: Created/updated coordination system; beta service healthy on port 3001; release layout normalized; lockfile deployment fixed; `/version` endpoint added; preflight checks passed for SSL issuance.

### Appendix
- Node/npm on server: `node -v; npm -v` should show Node 20 LTS (npm 10). Node 18 (npm 9) is acceptable but align to avoid lockfile churn.
- Rsync excludes: `.git`, `node_modules`, `.idea`, `*.iml`, `.DS_Store`.
- Version stamping example:
  ```bash
 printf '{"commit":"%s","builtAt":"%s"}\n' \
    "$(git rev-parse --short HEAD 2>/dev/null || echo manual)" \
    "$(date -u +%FT%TZ)" | sudo tee /srv/wdp/current-beta/version.json >/dev/null
  ```