# COMPLETE AI HANDOVER DOCUMENTATION
Version: December 22, 2025 (v1.1.11-UI-FIX)

## 1. SYSTEM OVERVIEW
The Workforce Democracy Project is a privacy-first civic platform. 
- **Mission**: Provide representative info, bill tracking, and empathy-forward AI assistance with original citations.
- **Privacy**: No server-side storage of user PII; client history is encrypted locally.

## 2. TECHNOLOGY STACK
- **Frontend**: HTML/CSS/Vanilla JS (Modular ES Modules). Hosted on Netlify (Beta) and Njalla VPS (Prod).
- **Backend**: Node.js/Express. Hosted on Scalingo (EU) and Njalla VPS.
- **Database**: Postgres (Scalingo) / Local SQLite/Memory.
- **AI**: Qwen 2.5 (Alibaba DashScope) / Groq (Fallback).

## 3. LATEST UPDATES (v1.1.11)
We resolved critical UI blocking issues and synchronized API keys.
- **UI Overlay Fix**: Standardized Z-index for floating elements (reduced from 2B+ to 10,000) and added `pointer-events: none` to empty containers. This prevents invisible layers from blocking homepage clicks.
- **Footer Implementation**: Added a proper `<footer>` to `index.html` and relocated the "Emergency Reset" link there for better visibility and UX.
- **API Key Restoration**: Re-implemented official Congress.gov and OpenStates keys in the backend configuration to restore real-time data lookups.
- **Cache Busting**: Incremented version to `v1.1.11` with strict query string enforcement on all assets.

## 4. DEPLOYMENT INSTRUCTIONS

### A. Security & Git (CRITICAL)
1.  **Secret Scrubbing**: Never commit `.env` files. GitHub Push Protection is active. If a push is rejected due to local history rewrites (like removing a secret), you must perform a force push:
    ```bash
    git push origin beta --force
    ```
2.  **Git Ignore**: The `.gitignore` file has been updated to exclude `archive/`, `data/`, and `.env` files.

### B. Frontend (VPS/Netlify)
1.  **Local Sync**: Run the unified deployment script (v2.0.0+):
    ```bash
    ./deploy.sh beta
    ```
    *Note: This script now excludes the `archive/` folder and uses `--delete` to remove stale remote files.*
2.  **VPS Fix**: If CORS issues persist, run the master fix on the VPS:
    ```bash
    ssh root@185.193.126.13 "bash /root/MASTER-VPS-FIX.sh"
    ```

### C. Backend (Scalingo)
1.  **Commit Changes**: Ensure all local changes are committed to the `beta` branch.
2.  **Push to GitHub**:
    ```bash
    git push origin beta --force
    ```
3.  **Scalingo Hook**: Scalingo is configured to auto-deploy when the `beta` branch is updated.

## 5. RECURRING ISSUES & SOLUTIONS
- **"No Representatives Found"**: Usually caused by upstream API keys (Congress.gov/OpenStates) being missing or expired on the server. v1.1.11 restores these keys.
- **CSP Violations**: Ensure the `_headers` file and the `<meta>` tag in `index.html` are identical. Both must allow `api-beta.workforcedemocracyproject.org`.
- **Frontend Not Updating**: Perform a **Hard Refresh** (Cmd+Shift+R). If it still shows an old version, use the "Fix Connection / Reset Cache" link in the footer.
- **Blocked Interactions**: If buttons on the homepage don't click, check for invisible overlays with high Z-index values.

## 6. MEMORY PERMANENCE LOG
- **Current Version**: v1.1.11
- **Last Verified**: Dec 22, 2024
- **Critical File**: `js/app-shell.mjs` (Control center for all modules).
- **Optimization**: Deployment script now omits `archive/` to save time.
- **Control Flags**: `window.WDP_API_BASE` and `window.WDP_MODE`.
