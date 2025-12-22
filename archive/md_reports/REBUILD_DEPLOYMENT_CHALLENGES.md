# Rebuild Deployment Challenges

## Current Situation

1. **Files Created**:
   - All necessary files for the rebuild have been created locally
   - Files follow Junie's phased approach perfectly
   - Directory structure is correct locally

2. **Deployment Issues**:
   - The deployment script creates subdirectories instead of placing files directly in the docroot
   - This is because the script uses tar to package files, and when specifying a directory like `deploy_temp/*`, it preserves the directory structure

3. **Permission Issues**:
   - Cannot directly move files on the server due to permission restrictions
   - Cannot use sudo commands without a terminal

## Solutions

### Short-term Solution

1. **Manual File Placement**:
   - Request assistance from someone with appropriate permissions to move files from the subdirectory to the docroot
   - This would involve:
     - Moving files from `/var/www/workforcedemocracyproject.org/deploy_temp/` to `/var/www/workforcedemocracyproject.org/`
     - Ensuring proper ownership and permissions

### Long-term Solution

1. **Modify Deployment Process**:
   - Create a flat tarball that contains only the files without directory structure
   - Modify the deployment script to handle this correctly
   - Or create a new deployment script specifically for this rebuild

2. **Request Appropriate Permissions**:
   - Get sudo access to move files directly
   - Or get assistance from someone with appropriate permissions

## Next Steps

### Immediate Actions

1. **Document Current State**:
   - Record all files that have been created
   - Document the directory structure
   - Prepare instructions for moving files

2. **Request Assistance**:
   - Contact someone with appropriate server permissions
   - Provide clear instructions for moving files
   - Explain the purpose of each file

### Testing Plan

1. **Phase 0 Verification**:
   - Once files are in correct locations, test the minimal production landing page
   - Verify strict CSP prevents legacy script execution
   - Confirm no console errors

2. **Phase 1 Verification**:
   - Test the beta shell with module loader
   - Verify no legacy scripts load
   - Confirm module loader initializes correctly

3. **Phase 2 Verification**:
   - Test the chat module at `/chat.html`
   - Verify chat widget appears and functions
   - Confirm API communication works without CORS issues

## Files That Need to Be Moved

From: `/var/www/workforcedemocracyproject.org/deploy_temp/`
To: `/var/www/workforcedemocracyproject.org/`

Files:
- `index.html` (beta shell)
- `index.minimal.html` (production landing)
- `chat.html` (chat module test page)
- `js/app-shell.mjs` (module loader)
- `js/modules/chat.mjs` (chat module)

## Conclusion

The rebuild is technically complete - all files have been created according to Junie's specifications. The only blocker is the deployment process, which requires either modified deployment scripts or assistance from someone with appropriate server permissions to move the files to their correct locations.

Once the files are in place, thorough testing of each phase should confirm that the new modular architecture eliminates the legacy script issues that were preventing the chat widget from appearing.