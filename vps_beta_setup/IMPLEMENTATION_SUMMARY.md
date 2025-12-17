# Implementation of VPS-Based Beta Environment

## Overview
This document describes the implementation of Junie's recommendation to move the beta environment to the VPS. This approach provides better isolation, security, and control compared to the previous Netlify-based setup.

## Implemented Components

### 1. Directory Structure
Created separate directory structures for beta and production environments:
```
/srv/wdp/
├── beta/                 # Beta environment
│   ├── releases/         # Timestamped releases
│   ├── shared/           # Shared configuration
│   └── current/          # Symlink to current release
└── prod/                 # Production environment
    ├── releases/
    ├── shared/
    └── current/
```

### 2. User and Group Isolation
- Created dedicated system users: `wdp-beta` and `wdp-prod`
- Each environment runs under its own user for true isolation
- File permissions set to restrict access between environments

### 3. Systemd Services
- Created `wdp-backend-beta.service` for the beta backend
- Hardened security settings:
  - `NoNewPrivileges=true`
  - `PrivateTmp=true`
  - `ProtectSystem=strict`
  - `ProtectHome=true`

### 4. Environment Configuration
- Created separate environment files for each environment
- Beta environment file: `/srv/wdp/beta/shared/beta.env`
- Production environment file: `/srv/wdp/prod/shared/prod.env`

### 5. Enhanced Deployment Script
- Updated `rsync-deploy-enhanced.sh` to support both environments
- Added health check verification after deployment
- Improved error handling and logging

### 6. Nginx Configuration Templates
- Created templates for beta API and frontend server blocks
- Defined security headers specific to beta environment
- Configured CORS to allow only beta frontend origin

## Deployment Process

### Local Deployment
1. Prepare code changes in local development environment
2. Deploy to beta for testing:
   ```bash
   ./vps_beta_setup/scripts/rsync-deploy-enhanced.sh beta YOUR_VPS_IP
   ```
3. Test thoroughly on beta environment
4. Deploy to production when ready:
   ```bash
   ./vps_beta_setup/scripts/rsync-deploy-enhanced.sh prod YOUR_VPS_IP
   ```

### VPS Setup
1. Copy setup script to VPS
2. Run with root privileges:
   ```bash
   chmod +x /tmp/setup-vps-beta.sh
   /tmp/setup-vps-beta.sh
   ```
3. Update API keys in `/srv/wdp/beta/shared/beta.env`
4. Configure Nginx server blocks
5. Obtain TLS certificates for beta domains

## Benefits Achieved

1. **True Environment Isolation**
   - Separate users, groups, and file paths
   - Independent systemd services
   - Distinct environment configurations

2. **Improved Security**
   - Hardened systemd units
   - Restricted file permissions
   - Environment-specific CORS policies

3. **Better Maintainability**
   - Clear directory structure
   - Atomic deployments with rollback capability
   - Comprehensive documentation

4. **Cost Reduction**
   - Eliminated Netlify dependency for beta
   - Leveraged existing VPS infrastructure
   - Simplified deployment workflow

## Next Steps

1. **DNS Configuration**
   - Add A/AAAA records for `beta.workforcedemocracyproject.org`
   - Add A/AAAA records for `api-beta.workforcedemocracyproject.org`

2. **Nginx Implementation**
   - Deploy server block configurations to VPS
   - Obtain TLS certificates for beta domains
   - Test beta frontend and API access

3. **Team Training**
   - Document new deployment workflow
   - Train team members on updated procedures
   - Update internal documentation

4. **Gradual Migration**
   - Start using beta environment for new feature development
   - Gradually migrate existing workflows
   - Decommission Netlify beta site when fully migrated

## Files Created

All implementation files are located in the `vps_beta_setup/` directory:
- `systemd/wdp-backend-beta.service` - Systemd unit file
- `configs/beta.env` - Environment configuration template
- `scripts/setup-vps-beta.sh` - VPS setup script
- `scripts/rsync-deploy-enhanced.sh` - Enhanced deployment script
- `nginx/beta-nginx-config.md` - Nginx configuration templates
- `README.md` - Setup instructions and documentation

This implementation fully addresses Junie's recommendations while maintaining compatibility with existing workflows and infrastructure.