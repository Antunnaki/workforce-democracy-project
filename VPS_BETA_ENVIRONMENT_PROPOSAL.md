# Proposal: Separate Beta and Production Environments on VPS

## Current Situation
- Production frontend and backend are deployed directly to VPS
- Netlify "beta" environment is incorrectly pointing to the production site
- This creates confusion and risk of accidentally updating production during development

## Proposed Solution
Create completely separate environments on the VPS:
1. Production environment (current, live site)
2. Beta environment (for testing new features)

## Implementation Details

### Directory Structure
```
/srv/wdp/
├── current/           # Production symlinks
├── releases/          # Production releases
│   ├── 20251211173831/
│   └── ...
├── shared/            # Production shared configs
│   ├── prod.env
│   └── ...
├── current-beta/      # Beta symlinks
├── releases-beta/     # Beta releases
│   ├── 20251216180000/
│   └── ...
└── shared-beta/       # Beta shared configs
    ├── beta.env
    └── ...
```

### Service Configuration
Separate systemd services:
- `wdp-backend-prod.service` - Production backend (port 3000)
- `wdp-backend-beta.service` - Beta backend (port 3001)

### Nginx Configuration
Separate server blocks:
- Production: `api.workforcedemocracyproject.org` → port 3000
- Beta: `api-beta.workforcedemocracyproject.org` → port 3001

### Deployment Scripts
Modify existing scripts to support both environments:
- `rsync-deploy.sh beta` - Deploy to beta environment
- `rsync-deploy.sh prod` - Deploy to production environment

### Environment Variables
Different environment files:
- Production: `/srv/wdp/shared/prod.env`
- Beta: `/srv/wdp/shared/beta.env`

With different settings:
- API_BASE URLs
- Database connections
- API keys (sandbox vs live)
- CORS origins
- Logging levels

## Benefits
1. True isolation between beta and production
2. Safe testing environment without affecting live users
3. Easy promotion from beta to production
4. Consistent with current VPS-based workflow
5. No confusion with Netlify deployment issues

## Deployment Workflow
1. Develop and test on local machine
2. Deploy to VPS beta environment using `rsync-deploy.sh beta`
3. Test thoroughly on beta environment
4. Promote to production using `rsync-deploy.sh prod`

## Migration Plan
1. Set up directory structure for beta environment
2. Configure separate systemd services
3. Update Nginx configuration for beta subdomain
4. Modify deployment scripts to support both environments
5. Test beta deployment
6. Document new workflow

## Required Actions
1. Create beta directory structure on VPS
2. Set up beta systemd service
3. Configure Nginx for beta subdomain
4. Update deployment scripts
5. Test deployment to beta environment
6. Document new procedures

This approach would provide a clean separation between beta and production environments while maintaining the familiar VPS-based deployment workflow.