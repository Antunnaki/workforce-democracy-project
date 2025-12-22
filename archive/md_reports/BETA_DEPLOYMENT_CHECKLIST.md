# Beta Deployment Checklist

## Pre-deployment
- [ ] Review and test all changes locally
- [ ] Ensure all module files are updated and working
- [ ] Verify no breaking changes to existing functionality
- [ ] Confirm API endpoints are correctly configured for Beta environment

## Deployment Process
- [ ] Build/upload `frontend/` into a new release folder
- [ ] Flip `current` symlink (now allowed via sudoers)
- [ ] `curl -I` checks for:
  - [ ] `/` (should return `text/html`)
  - [ ] `/js/app-shell.mjs` (should return `application/javascript`)
  - [ ] `/css/base.css` (should return `text/css`)
  - [ ] `/config.json` (should return `application/json`)
  - [ ] `/js/env-config.mjs` (should return `application/javascript`)
- [ ] Quick browser smoke test of:
  - [ ] `index.html` (homepage with all modules)
  - [ ] `chat.html` (chat functionality)
  - [ ] `reps.html` (representatives module)
  - [ ] `dashboard.html` (dashboard module)
  - [ ] `voting.html` (voting module)
  - [ ] `jobs.html` (jobs module)

## Post-deployment Verification
- [ ] Check browser console for errors
- [ ] Verify all modules are loading and functioning
- [ ] Confirm CSP is properly enforced (no inline script errors)
- [ ] Test API connections to beta backend
  - [ ] Representatives module fetches data from Beta API
  - [ ] Dashboard module fetches data from Beta API
  - [ ] Chat module connects to Beta API
- [ ] Verify environment-specific configuration is loaded correctly
- [ ] Confirm all scripts are external (no inline scripts)
- [ ] Test UX improvements:
  - [ ] Chat module closes with Escape key
  - [ ] Chat input scrolls into view on mobile
  - [ ] Focus returns to chat button after closing modal
  - [ ] Loading states display correctly in all modules
- [ ] Document any issues or observations

## Rollback Procedure
- [ ] If issues found, flip symlink back to previous release
- [ ] Document the problem and fix
- [ ] Redeploy with fixes

## Environment-specific Configuration
- [ ] Beta site should call Beta API:
  - Frontend: `https://beta.workforcedemocracyproject.org`
  - API: `https://api-beta.workforcedemocracyproject.org`
- [ ] Production site should call Production API:
  - Frontend: `https://workforcedemocracyproject.org`
  - API: `https://api.workforcedemocracyproject.org`

## Production Promotion Plan
- [ ] Prepare a Prod `config.json` with:
  - `{"apiBase":"https://api.workforcedemocracyproject.org"}`
- [ ] Prod CSP: `connect-src 'self' https://api.workforcedemocracyproject.org`
- [ ] Build a Prod release the same way as Beta
- [ ] Deploy to `/srv/wdp/prod/releases/$STAMP/frontend` and flip the `current` symlink
- [ ] Verify on Prod:
  - `curl -I https://workforcedemocracyproject.org/` → 200; Content-Type text/html
  - Network calls to `api.workforcedemocracyproject.org` only; no CSP errors
  - Chat + Reps + Dashboard work as on Beta

## Helper Script for Release Activation
- [ ] Created helper script at `/usr/local/bin/wdp-beta-activate`
- [ ] Usage: `wdp-beta-activate /srv/wdp/beta/releases/$STAMP`
- [ ] Script automatically flips the symlink and verifies the change
- [ ] Makes future deployments faster and less error-prone