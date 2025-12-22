# Workforce Democracy Project - Deployment Summary

## Overview
This document summarizes the deployment infrastructure and processes for the Workforce Democracy Project, covering both backend and frontend components.

## Deployment Components

### 1. Backend Deployment
Located in: `backend/scripts/rsync-deploy.sh`

Features:
- Automated deployment to Scalingo-like environments (beta/prod)
- Blue/green deployment pattern with symbolic links
- Automatic service restart and status verification
- Secure SSH key-based authentication

Usage:
```bash
backend/scripts/rsync-deploy.sh beta|prod YOUR_VPS_IP
```

### 2. Frontend Deployment
Located in: `ops/DEPLOY_FRONTEND.sh`

Features:
- Key-based SSH authentication (no passwords)
- Automated packaging and secure transfer
- Backup creation before deployment
- Ownership and permission management
- Nginx reload for immediate updates
- Optional verification checks

Usage:
```bash
USER=deploy \
HOST=185.193.126.13 \
SSH_KEY=~/.ssh/id_ed25519_njalla \
DOMAIN=workforcedemocracyproject.org \
VERIFY=1 \
./ops/DEPLOY_FRONTEND.sh
```

### 3. Verification Tools
- `ops/VERIFY_DEPLOYMENT.sh` - Automated verification of both frontend and backend
- Manual checklists in `ops/CHECKLISTS/`

## Environments

### Production
- Frontend: https://workforcedemocracyproject.org
- Backend API: https://api.workforcedemocracyproject.org
- VPS IP: 185.193.126.13
- Port: 3000

### Beta
- Frontend: https://beta.workforcedemocracyproject.org (when configured)
- Backend API: https://api-beta.workforcedemocracyproject.org
- VPS IP: 185.193.126.13
- Port: 3001

## Security Considerations

1. All deployments use SSH key authentication
2. No passwords are stored or used in deployment scripts
3. CSP headers are managed by Nginx (not in HTML)
4. CORS policies are carefully controlled
5. File permissions are properly set (www-data ownership)

## Checklist-Based Approach

Both deployment types follow detailed checklists:
- `ops/CHECKLISTS/DEPLOY.md` - Combined backend/frontend checklist
- `ops/CHECKLISTS/FRONTEND_DEPLOY.md` - Frontend-specific checklist

## Rollback Procedures

1. Frontend: Restore from timestamped backups in `/var/backups/`
2. Backend: Use blue/green deployment pattern to switch back to previous release

## Recent Updates

The privacy-first signup flow has been implemented with:
- Local-only mode (default) - No network calls, all data stays on device
- Sync mode (opt-in) - Client-side encryption with optional email recovery
- Recovery Kit requirement for both modes
- Updated personalization system with local-only initialization capability

Files updated:
- `index.html` - New wizard UI
- `js/personalization-ui.js` - Wizard controller logic
- `js/personalization-system.js` - Enhanced personalization system