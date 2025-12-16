# Ops Coordination (source of truth)

### Status
- Environments: beta | prod
- Production API: api.workforcedemocracyproject.org → 185.193.126.13:3000
- Production CSP: Enabled with strict security policy
- Current release(beta): `/srv/wdp/current-beta` → /srv/wdp/releases/20251211173831
- Node/npm on server: v20.19.6 / 10.8.2
- App port (beta): 3001(via `PORT=3001`)
- TLS: prod ✓ (strict profile) | beta ✓ (relaxed profile active; HTTPS OK; `/→/health`)

### Verification results (post‑TLS)
#### Certbot certificates (beta + prod)
- api-beta.workforcedemocracyproject.org:ECDSA; expires 2026-03-1122:32:11Z; paths at `/etc/letsencrypt/live/api-beta.workforcedemocracyproject.org/`
- api.workforcedemocracyproject.org: ECDSA; expires 2026-03-11 01:00:12Z; pathsat `/etc/letsencrypt/live/api.workforcedemocracyproject.org/`
- workforcedemocracyproject.org: ECDSA; expires 2026-03-14; paths at `/etc/letsencrypt/live/workforcedemocracyproject.org/`

#### HTTP/HTTPS checks (beta)
```
Root redirect v4: HTTP/1.1 302 Moved Temporarily
Root redirect v6: HTTP/1.1 302 Moved Temporarily
/health v4: HTTP/1.1 200 OK/health v6: HTTP/1.1 200 OK
```

#### TLS session (OpenSSL, brief)
```
Protocol TLSv1.3; ciphersuite TLS_AES_256_GCM_SHA384; CN=api-beta.workforcedemocracyproject.org; Verification:OK```

### Team access note (prod/beta)
Ling and Junie have full local write access, terminal access (backend + frontend), and can modify local frontend files and backend code. They may push changes directly to git (docs/cleanup-20251210 branch currently in use)and run deployment/check scripts as needed.

### Done /Changelog
- 2025-12-15: Fixed syntax errors in JavaScript files (civic-representative-finder.js, chat-clean.js and main.js) that were preventing proper site functionality
- 2025-12-15: Implemented additional syntax fixes in chat-clean.js and main.js to resolve remaining parsing issues
- 2025-12-15: Updated chat-clean.js version to v37.9.15-FINAL with cache-busting query parameter
- 2025-12-15: Fixed syntax errors in civic-representative-finder.js, chat-clean.js and main.js that were causing parser errors preventing chat modal from appearing
- 2025-12-16: Added version banners to JS files for cache-busting verification
- 2025-12-16: Added smoke test code to verify file loading
- 2025-12-16: Updated script versions in index.html with timestamps to break through CDN/proxy caches
- 2025-12-16: Created timestamped copies of JS files (chat-clean, main, civic-representative-finder) with unique names to break through aggressive caching
- 2025-12-16: Updated index.html to reference the new timestamped JS files instead of using query parameters
- 2025-12-16: Added null guards to nonprofit-explorer.js to prevent errors when DOM elements are not present
- 2025-12-16: Created timestamped index.html.20251216T1000 to break through HTML caching
- 2025-12-15: Added client-side username validation to align with backend requirements
- 2025-12-15: Added UI hints and error messaging to signup form for improved user experience
- 2025-12-15: Added CSS styling for form error messages and help text
- 2025-12-15: Changed sync method from PUT to POST to fix CORS issues
- 2025-12-15: Replaced alert() with friendly recovery key modal for better user experience
- 2025-12-15: Restored floating chat widget functionality with proper container, CSS, and initialization
- 2025-12-15: Site accessibility issue resolved by removing conflicting CSP meta tag and redeploying frontend with proper permissions
- 2025-12-15: Verified site is accessible with HTTP200 response
- 2025-12-15: Confirmed JavaScript assets are loading correctly with properMIME types
- 2025-12-15: Identified issues with backend services - MongoDB not running, API keys expired for Congress.gov and OpenStates
-2025-12-15: Updated `CONGRESS_API_KEY` inbackend environment; backend restarted; Congress.gov API now returning data correctly for representative lookups. Still need valid `OPENSTATES_API_KEY` to enable state legislative data.
-2025-12-15: Updated`OPENSTATES_API_KEY` inbackend environment; backend restarted; endpoints re-verified.
- 2025-12-15: Successfully verified that both Congress.gov and OpenStates APIs are returning real data for representative lookups
-2025-12-14: Added scriptedfrontend deploy (ops/DEPLOY_FRONTEND.sh) with backup, perms, nginx reload, and optional verification.
-2025-12-14:Added Frontend Deployment Guide (ops/FRONTEND_DEPLOYMENT_GUIDE.md) covering scripted + manual steps, checks, rollback, caching,CSP.
- 2025-12-14: Added quick Frontend Deploy checklist (ops/CHECKLISTS/FRONTEND_DEPLOY.md).
- 2025-12-14: Documented privacy-first onboarding (local-only default, optional Sync/email) in codeand guides; CORS credentials policy verified for register endpoint.
- 2025-12-13: Switched to Singapore OpenAI-compatible endpoint with newinternationalAPI key. Verified successful chat response from Qwen model. Test prompt: "who is my state representative in California?" completed in 4.6s. API is now fully functional.
- 2025-12-13: Verified DashScope API integration. Confirmed API key is valid butaccounthas exhausted free tier quota. Need to disable "use free tier only" mode in DashScope console to enable paid access. Backend code isproperly configured.
- 2025-12-13: Added lightweight monitoring for beta API with5-minute health checks. Script at /usr/local/bin/wdp-beta-health-check.sh, logging to /var/log/wdp-beta-health.log, scheduled via cron. Verified health endpoint is responding correctly.
- 2025-12-13: Added https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy. Updated /etc/nginx/snippets/wdp-security-relaxed.conf and /srv/wdp/shared/beta.env. Nginx reloaded and backend restarted. Verification passed: CORS headerscorrectly returned for authorized origin and blocked for unauthorized origin.
- 2025-12-13: Completed all preparatory work for adding https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy; created documentation, scripts, and implementation plan. Server-side changes pending execution.
- 2025-12-13: Added documentationand scripts for updating beta CORS policy to includehttps://beta-workforcedemocracyproject.netlify.app;prepared deploymentplan and verification procedures.
- 2025-12-13: Preparing to add https://beta-workforcedemocracyproject.netlify.app to beta CORS relaxed policy; preparing documentation anddeployment plan.
- 2025-12-12: Beta Nginx:`/→/health` redirect live; security profile symlink active → relaxed; CORS dev origins added (localhost:3000, 127.0.0.1:3000, previewNetlify pattern); Nginx reload OK; verification passed (302→/health,200 at /health, v4+v6).
- 2025-12-11: Issued Let's Encrypt cert forbeta; Nginx reloaded; TLS verified OK (SNI/chain). Root path currently 404 by design.
- 2025-11: Successfully deployed backend with fixed syntax errors; service running on port 3001; ready for SSL certificate issuance.
- 2025-11: Preparing to enable SSL certificate forbeta environment; all prerequisites verified; awaiting rootaccess to execute certificate issuance.
- 2025-11: Created/updated coordination system; beta service healthy on port 3001; release layout normalized; lockfile deployment fixed; `/version` endpoint added; preflight checks passed for SSL issuance.

### Appendix
- Node/npm on server:`node -v; npm -v` shouldshowNode20 LTS (npm 10). Node 18 (npm 9) is acceptable but align to avoid lockfile churn.
- Rsync excludes: `.git`, `node_modules`, `.idea`, `*.iml`, `.DS_Store`.
-Version stamping example:
  ```bash
printf '{"commit":"%s","builtAt":"%s"}\n' \
    "$(git rev-parse --short HEAD 2>/dev/null || echo manual)" \
   "$(date -u +%FT%TZ)" | sudo tee /srv/wdp/current-beta/version.json>/dev/null
  ```
### Done /Changelog-2025-12-13: DNS records successfully updated in Porkbun for workforcedemocracyproject.org and api.workforcedemocracyproject.org pointing to VPS IP 185.193.126.13
- 2025-12-13: Verified DNS propagation with dig showing A record 185.193.126.13 and AAAA record 2a0a:3840:1337:126:0:b9c1:7e0d:1337- 2025-12-13: API health endpoint responding with 200 OK and proper security headers including CSP
- 2025-12-13: Chat endpoint workingcorrectly with Qwen API integration
- 2025-12-13: Both wdp-backend-prod and wdp-backend-beta services running correctly
- 2025-12-13: Production environment nowproperly configured with CSP headers and working API endpoints

- 2025-12-13: Created production health checkscript (/usr/local/bin/wdp-prod-comprehensive-health-check.sh) and added to crontab (runs every 5 minutes)
- 2025-12-13: Created frontend configuration files to distinguish between beta and production environments- 2025-12-13: CreatedproductionUIsmoketest checklist (ops/PROD_SMOKE_TEST_CHECKLIST.md)

- 2025-12-13: Created Nginx configurationtemplate for main website (ops/TEMPLATES/nginx_main_website.conf)
- 2025-12-13:Created deploymentscriptformainwebsite (ops/DEPLOY_MAIN_WEBSITE.sh)
- 2025-12-13: Configured HSTS headers for enhanced security
- 2025-12-13:Ensured proper SSL certificate coverage forboth apex and www domains
-2025-12-13: Implemented HTTP to HTTPS redirects for all traffic
- 2025-12-14: Successfully deployed main website withproper SSL certificate and security headers
- 2025-12-14:Website is now accessible at https://workforcedemocracyproject.org with all security headers properly configured
- 2025-12-14: Created updated Nginx configuration with CSP headers (ops/TEMPLATES/nginx_main_website_with_csp.conf)
- 2025-12-14: Synced completefrontend directory toserver includingconfigfiles
- 2025-12-14: Updated frontend config to guard against process.env undefined error
- 2025-12-14: Updated Nginx configuration to includewww subdomain (pending DNS setup)
- 2025-12-14: Verified proper MIME types and CSP headers for frontend files
- 2025-12-14: DNS records for www subdomainadded and propagated
- 2025-12-14: SSL certificate renewed toinclude www subdomain
-2025-12-14: Both apex and www domains fully functional with proper redirects and headers
- 2025-12-14: VerifiedCORS functionality for www origin
- 2025-12-14: Deployedmain production homepage (index.html) andallassociatedassets (CSS, JS, images)
- 2025-12-14: Removed conflicting CSP meta tag from index.html to rely onNginx headers
- 2025-12-14: Fixed file permissionsto ensure all assets are accessible
- 2025-12-14: Verified that both apex and www domains serve the complete production site with all assets loading correctly
- 2025-12-14: Fixed CORS configuration for API to properlyhandle credentials for signup flow
-2025-12-14:Updated Nginx security snippets to avoid duplicate CORS headers
- 2025-12-14: Verified that preflight and actual requests includeproper CORS headers for authorized origins
- 2025-12-14:Created server-side deployment helper and sudoers configuration forsecure,least-privilege frontend deployments
- 2025-12-14: Updated deployment scripts to use server-side helper for permissions and service management- 2025-12-14:Created comprehensive deployment verification checklist forprivacy-first signup flow
- 2025-12-14: Updated manual deployment instructions to reflect new least-privilege approach
- 2025-12-14: Installeddeployment helper on server for secure frontend file management
- 2025-12-14: Enhanced deploymenthelper with atomic deployments, backuprotation, and checksum verification
- 2025-12-14: Hardened sudoers configuration and file permissions for deployment helper
- 2025-12-14: Added logging and audittrail for all deployment operations
- 2025-12-14: Updated deployment scripts to include checksum verification for artifact integrity
- 2025-12-15: Identified missing data/voting-info.json filecausing 404 errors in voting information system
- 2025-12-15: Updated deploymentscripts to include datadirectory bydefault
- 2025-12-15: Created workaround deployment script to fix voting-info.json 404 issue
- 2025-12-15: Documented server permissionissues preventing automated data directory deployment- 2025-12-15: Fixed syntax errors in JS files (missing spaces in function declarations)
- 2025-12-15: Verified JS files are properly servedwith correct MIME types
- 2025-12-15: Confirmed nonprofit explorer hasappropriate null checks for DOM elements
-2025-12-15: Created setup script for frontend deployment helper requiring root access
- 2025-12-15: Uploaded helper script and sudoers configuration to server
- 2025-12-15: Prepared comprehensive server setup scripts anddocumentation- 2025-12-15: Created multiple deployment approaches for server administrator convenience
- 2025-12-15: Frontend deploy (JS fixes + data) via helper; verificationpassed; onboarding flowsvalidated.
- 2025-12-15: Full asset deploy (complete CSS/JS/images set) to eliminate 404s and nosniff errors; verification passed.

### Frontend DeploymentGuidelines
- Always deploy the full asset set referenced by `index.html` (css/js/images +top-level assets). Partial deploys will cause404 + nosniff errors.
- If deploy prompts for a password or fails to overwrite files, reinstall the server-side helper + sudoers (see Quick Fix).
- Default FILES set for deployment: `FILES="index.html css js images manifest.json sw.js favicon.svg data civic"`

### Backend Issues Summary
- MongoDB is not running, causing connection errors in the backend logs
- Congress.gov API is returning 403 Forbidden errors (likely expired API key)
- OpenStates APIis returning 401 Unauthorized errors (likely expired API key)
- Nonprofit API routes are properlyregistered but may not be functioning due toMongoDB dependency

### Backend prerequisites
- MongoDB available (local or managed) and `MONGODB_URI` set
- `CONGRESS_API_KEY`, `OPENSTATES_API_KEY` present in service env
- Verify `/health` after changes

### Nonprofit proxy
- Frontend calls `/api/nonprofits/*`
- CORS handled at Nginx for apex/www
- Preflight and actual checks documented

###Next Steps
1. Install and start MongoDB service on the server
2. Update API keys for Congress.gov and OpenStates services
3. Restart backend services after fixing the above issues
4. Verify that all API endpointsare working properly

###QuickFix
```
ssh-i~/.ssh/id_ed25519_njalladeploy@185.193.126.13
sudo-schmod+x/tmp/server-setup-complete.sh
/tmp/server-setup-complete.sh
```