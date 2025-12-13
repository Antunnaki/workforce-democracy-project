# CORS Update Summary

## Overview
This document summarizes the work completed to prepare for adding `https://beta-workforcedemocracyproject.netlify.app` to the beta environment's relaxed CORS policy.

## Completed Tasks

1. **Documentation and Planning**
   - Created [NGINX_CORS_UPDATE_PLAN.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/NGINX_CORS_UPDATE_PLAN.md) detailing the proposed changes
   - Updated [COORDINATION.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/COORDINATION.md) to reflect the preparation work
   - Created [UPDATE_NGINX_CORS.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/UPDATE_NGINX_CORS.sh) script documenting the server-side commands needed
   - Created [VERIFY_CORS_UPDATE.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/VERIFY_CORS_UPDATE.sh) script for post-update verification

2. **Git Operations**
   - Committed all documentation and scripts to the repository
   - Pushed changes to the remote repository

## Required Server-Side Actions

The following actions must be performed on the VPS server:

1. **SSH to the VPS server**
   ```bash
   ssh root@185.193.126.13
   ```

2. **Update Nginx Configuration**
   - Backup the current configuration
   - Modify the configuration to include the new origin in the CORS policy
   - Use the mapping approach to selectively allow origins

3. **Test and Reload Nginx**
   ```bash
   nginx -t && systemctl reload nginx
   ```

4. **Verify the Changes**
   Run the verification commands to ensure the update worked correctly:
   ```bash
   curl -sSI -H 'Origin: https://beta-workforcedemocracyproject.netlify.app' \
     https://api-beta.workforcedemocracyproject.org/health | grep -i '^access-control-'
   
   curl -sSI https://api-beta.workforcedemocracyproject.org | head -n1
   
   curl -sL https://api-beta.workforcedemocracyproject.org | head -n5
   ```

5. **Document the Results**
   - Add the verification results to `/srv/wdp/shared/changes.log`
   - Update [ops/COORDINATION.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/COORDINATION.md) with the completion details

## Security Considerations

- The update only affects the beta environment
- Production environment remains strict and does not include the beta origin
- No Basic Auth is added to the beta environment at this time
- The CORS policy continues to restrict origins to a predefined list

## Next Steps

1. Execute the server-side changes as documented in [UPDATE_NGINX_CORS.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/UPDATE_NGINX_CORS.sh)
2. Verify the changes using [VERIFY_CORS_UPDATE.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/VERIFY_CORS_UPDATE.sh)
3. Document the results in the appropriate logs