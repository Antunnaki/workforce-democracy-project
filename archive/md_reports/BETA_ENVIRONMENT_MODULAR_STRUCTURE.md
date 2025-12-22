# Beta Environment Modular Structure

## Overview
This document describes the new modular structure for the beta environment on the VPS, as recommended by Junie. The structure follows a modular ES module architecture with strict CSP/CORS policies.

## Directory Structure
```
/srv/wdp/beta/current/frontend/
├── index.html                  # Main homepage
├── chat.html                   # Chat test page
├── reps.html                   # Representatives test page
├── dashboard.html              # Dashboard test page
├── voting.html                 # Voting information test page
├── jobs.html                   # Jobs test page
└── js/
    ├── modules/
    │   ├── chat.mjs            # Chat module
    │   ├── representatives.mjs  # Representatives module
    │   ├── dashboard.mjs        # Dashboard module
    │   ├── voting.mjs           # Voting module
    │   └── jobs.mjs            # Jobs module
    └── test-api.js             # API test script
```

## Module Descriptions

### Chat Module (`js/modules/chat.mjs`)
- Tests API connectivity to the beta backend
- Verifies health endpoint functionality
- Provides basic chat functionality testing

### Representatives Module (`js/modules/representatives.mjs`)
- Tests representatives finder functionality
- Connects to `/api/civic/representatives/search` endpoint
- Validates CORS configuration

### Dashboard Module (`js/modules/dashboard.mjs`)
- Tests dashboard/bills functionality
- Verifies data loading and display
- Ensures proper module isolation

### Voting Module (`js/modules/voting.mjs`)
- Tests voting information functionality
- Validates data retrieval from backend
- Confirms proper error handling

### Jobs Module (`js/modules/jobs.mjs`)
- Tests jobs section functionality
- Verifies job listing and filtering
- Ensures mobile responsiveness

## HTML Test Pages
Each module has a corresponding HTML test page that imports and mounts the module. This allows for isolated testing before integrating into the main homepage.

## Integration Plan
1. Test each module individually on its respective test page
2. Verify API connectivity and CORS configuration
3. Ensure no console errors or warnings
4. Integrate modules into the main homepage (`index.html`)
5. Perform end-to-end testing of the integrated solution

## Security Features
- Strict CSP policy: `default-src 'self'`, `script-src 'self'`
- CORS restricted to only allow `https://beta.workforcedemocracyproject.org`
- No third-party script loads
- All fetches directed to `https://api-beta.workforcedemocracyproject.org`

## Next Steps
1. Test each module individually in the browser
2. Verify all API endpoints are functional
3. Address any console errors or warnings
4. Begin integrating modules into the main homepage
5. Perform comprehensive QA testing

This modular structure provides a clean, maintainable approach to developing and testing new features in isolation before promoting them to production.