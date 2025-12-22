# COMPLETE AI HANDOVER DOCUMENTATION
Version: December 22, 2025 (v1.1.12-CSP-FIX)

## 1. SYSTEM OVERVIEW
The Workforce Democracy Project is a privacy-first civic platform. 
- **Mission**: Provide representative info, bill tracking, and empathy-forward AI assistance with original citations.
- **Privacy**: No server-side storage of user PII; client history is encrypted locally.

## 2. TECHNOLOGY STACK
- **Frontend**: HTML/CSS/Vanilla JS (Modular ES Modules). Hosted on Netlify (Beta) and Njalla VPS (Prod).
- **Backend**: Node.js/Express. Hosted on Scalingo (EU) and Njalla VPS.
- **Database**: Postgres (Scalingo) / Local SQLite/Memory.
- **AI**: Qwen 2.5 (Alibaba DashScope) / Groq (Fallback).

## 3. LATEST UPDATES (v1.1.12)
We resolved persistent 'Fallback' data issues and synchronized the security policies.
- **Secret Sync Protocol**: Created `sync-secrets.sh` to securely inject API keys (Congress/OpenStates) into the VPS without committing them to Git.
- **CSP Consolidation**: Removed the meta-tag CSP from `index.html` to eliminate conflicts with Nginx headers.
- **Image Policy**: Broadened `img-src` in `MASTER-VPS-FIX.sh` to allow `via.placeholder.com` and generic `https:` sources for representative photos.
- **UI Overlay Fix**: Standardized Z-index for floating elements (10,000) and added `pointer-events: none` to empty containers.
- **Version Sync**: Incremented to `v1.1.12` across all critical modules.

## 4. DEPLOYMENT INSTRUCTIONS

### A. Security & Git (CRITICAL)
1.  **Secret Sync**: If API keys are missing on the VPS, run the dedicated sync script:
    ```bash
    ./sync-secrets.sh
    ```
2.  **Secret scrubbing**: Never commit `.env` files. GitHub Push Protection is active. If a push is rejected, perform a force push:
    ```bash
    git push origin beta --force
    ```

### B. Frontend (VPS/Netlify)
1.  **Local Sync**: Run the unified deployment script (v2.0.0+):
    ```bash
    ./deploy.sh beta
    ```
2.  **VPS Fix**: If CSP or CORS issues persist, run the master fix on the VPS:
    ```bash
    ssh root@185.193.126.13 "bash /root/MASTER-VPS-FIX.sh"
    ```

### C. Backend (Scalingo)
1.  **Commit Changes**: Ensure all local changes are committed to the `beta` branch.
2.  **Push to GitHub**:
    ```bash
    git push origin beta --force
    ```

## 5. RECURRING ISSUES & SOLUTIONS
- **"No Representatives Found"**: Usually caused by upstream API keys missing on the server. v1.1.12 provides `sync-secrets.sh` to fix this.
- **Blocked Interactions**: Buttons not clicking? Check for invisible overlays with high Z-index. Standard is 10,000.
- **Broken Photos**: If representative photos show placeholders, ensure the CSP allows the source domain.

## 6. MEMORY PERMANENCE LOG
- **Current Version**: v1.1.12
- **Last Verified**: Dec 22, 2024
- **Critical File**: `js/app-shell.mjs` (Initialization logic).
- **Control Flags**: `window.WDP_API_BASE` and `window.WDP_MODE`.
