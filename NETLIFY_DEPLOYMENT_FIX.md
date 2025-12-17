# Fixing Netlify Deployment for Beta Environment

## Current Issue
The Netlify "beta" site is incorrectly configured and is updating the production site instead of maintaining a separate beta environment.

## Solution Options

### Option 1: Correct Netlify Configuration
1. Create a dedicated branch for beta deployments (e.g., `beta` or `develop`)
2. Configure Netlify to deploy from this branch
3. Set up proper domain mapping:
   - Production: workforcedemocracyproject.netlify.app → main branch
   - Beta: beta-workforcedemocracyproject.netlify.app → beta branch

### Option 2: Manual Deployment Process
1. Continue using the `docs/cleanup-20251210` branch for development
2. Manually deploy to beta using drag-and-drop when needed
3. Keep production deployments separate (through VPS)

## Recommended Approach

### Immediate Fix
1. Create a new branch specifically for beta:
   ```bash
   git checkout -b beta
   git push origin beta
   ```

2. In Netlify:
   - Go to Site settings → Build & Deploy
   - Change "Production branch" to `beta`
   - Set publish directory to `.`
   - Leave build command empty (static site)

3. For ongoing development:
   - Develop on feature branches
   - Merge to `beta` for beta testing
   - Merge to `main` for production releases

### File Structure for Beta
Ensure the following files are at the root of the repository:
```
index.html              # Beta landing page with modular shell
chat.html               # Dedicated chat test page
js/
├── app-shell.20251216.mjs      # App shell module
└── modules/
    └── chat.20251216.mjs       # Chat module
```

## Deployment Commands
```bash
# Create and switch to beta branch
git checkout -b beta

# Push beta branch
git push origin beta

# Deploy changes to beta
git add .
git commit -m "Update beta deployment"
git push origin beta
```

## Verification Steps
After deployment:
1. Visit https://beta-workforcedemocracyproject.netlify.app
2. Confirm "WDP SHELL LIVE" banner is visible
3. Check browser console for legacy script errors (should be none)
4. Test chat widget functionality
5. Verify API connectivity (CORS should be configured)

## Long-term Benefits
1. Clear separation between beta and production
2. Automated deployment through Git
3. Reduced risk of accidental production updates
4. Easier testing and QA process
5. Consistent with standard development practices