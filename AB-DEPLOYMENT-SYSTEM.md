#Workforce Democracy Project Deployment System

## Overview

This document outlines the deployment system for the Workforce Democracy Project, including both production and testing environments.

## Environment Configuration

### Production Environment
- **Domain**: https://workforcedemocracyproject.org
- **Backend**: Version A (Production) running on port 3000
- **Frontend**: Live site hosted at workforcedemocracyproject.org

### Testing Environment
- **Domain**: https://workforcedemocracyproject.netlify.app
- **Backend**: Version B (Development) running on port 3001
- **Frontend**: Test site hosted atworkforcedemocracyproject.netlify.app

## Deployment Workflow

1. **Development**: Make changes to the codebase locally
2. **Testing**: Deploy to Netlify test environment (https://workforcedemocracyproject.netlify.app)
3. **Validation**: Test functionality in the Netlify environment
4. **Production**: Once validated, deploy to production (https://workforcedemocracyproject.org)

## Key Features

- **Dual Backend System**: Version A (Production) and Version B (Development) run simultaneously
- **Environment Detection**: Frontend automatically detects which backend to connect to based on domain
- **Zero Downtime**: Changes can be tested without affecting the live site
- **Backup System**: Netlify provides a complete backup of the site for testing

## Technical Details

### Backend Ports
- **Version A (Production)**: Port 3000
- **Version B (Development)**: Port 3001

### Environment Detection Logic

The frontend uses the following logic to determine which backend to connect to:

```javascript
function getBackendUrl() {
    // For Netlify testing environment
    if (window.location.hostname.includes('netlify.app') || 
        window.location.hostname === 'localhost') {
        // Connect toVersion B (Development) on port 3001
        return 'http://185.193.126.13:3001';
    } else {
        // Production environment - connect to Version A on port 3000
        return 'http://185.193.126.13:3000';
    }
}
```

## Usage Instructions

To use the testing environment:
1. Deploy your updated files to Netlify
2. Visit https://workforcedemocracyproject.netlify.app
3. Test all functionality
4. Verify that the site connects to the development backend (port 3001)

To deploy to production:
1. Confirm all changes are working in the test environment
2. Deploy the same files to the production domain
3. Verify the site is functioning correctly at https://workforcedemocracyproject.org
