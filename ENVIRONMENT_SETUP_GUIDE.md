# Environment Setup and Deployment Guide

## Overview
This document explains the two options for setting up proper beta and production environments:
1. Using Netlify with proper branch configuration
2. Creating separate environments on the VPS

## Option 1: Netlify-Based Beta Environment

### Current Status
The Netlify "beta" site is incorrectly configured and points to the production site.

### Fix Implementation
1. Created separate branches for beta and production:
   - `beta` branch for beta environment
   - `main` branch for production environment

2. Files for deployment:
   - `index.html` - Beta landing page with modular shell
   - `chat.html` - Dedicated chat test page
   - `js/app-shell.20251216.mjs` - App shell module
   - `js/modules/chat.20251216.mjs` - Chat module

3. Deployment package creation:
   ```bash
   ./scripts/create-netlify-beta-package.sh
   ```

4. Manual deployment:
   - Log in to Netlify dashboard
   - Select beta site
   - Drag and drop the generated zip file

### Benefits
- Automated deployment through Git
- Clear separation of environments
- Standard development practices

## Option 2: VPS-Based Separate Environments

Detailed in: `VPS_BETA_ENVIRONMENT_PROPOSAL.md`

### Benefits
- True isolation between beta and production
- Safe testing environment
- Familiar VPS-based workflow
- No dependency on external services

## Recommendation
Use Option 1 (Netlify) for frontend development and testing, as it provides:
1. Quick deployment and testing
2. Easy rollback capabilities
3. No infrastructure changes required
4. Automatic SSL and CDN benefits

Use Option 2 (VPS) for backend development that requires closer integration with the production environment.

## Next Steps
1. Decide on preferred approach
2. Implement chosen solution
3. Test deployment process
4. Update documentation
5. Train team members on new workflow

## Files Created
- `VPS_BETA_ENVIRONMENT_PROPOSAL.md` - Detailed proposal for VPS-based solution
- `NETLIFY_DEPLOYMENT_FIX.md` - Instructions for fixing Netlify deployment
- `scripts/create-netlify-beta-package.sh` - Script to create deployment packages