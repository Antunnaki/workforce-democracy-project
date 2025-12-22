# Frontend Deployment Helper Setup Instructions

## Overview
This document provides instructions for setting up the frontend deployment helper on the server. This setup is required to enable automated deployment of frontend files without requiring full sudo access for the deploy user.

## Prerequisites
- Root access to the server
- The helper script and sudoers configuration must already be uploaded to `/tmp/`

## Files to be Installed
1. `/usr/local/bin/wdp-frontend-deploy-helper.sh` - The deployment helper script
2. `/etc/sudoers.d/sudoers-wdp-frontend-deploy` - Sudoers configuration for the helper

## Setup Process

### 1. Run the Setup Script
Execute the following command as root:

```bash
sudo /tmp/setup-frontend-deploy.sh
```

This script will:
- Install the sudoers configuration file
- Validate the sudoers configuration
- Install the helper script with appropriate permissions
- Create necessary log files and directories
- Test the helper script

### 2. Verify Installation
After running the setup script, verify that the installation was successful:

```bash
# Check that the helper script exists with correct permissions
ls -l /usr/local/bin/wdp-frontend-deploy-helper.sh

# Check that the sudoers file exists with correct permissions
ls -l /etc/sudoers.d/sudoers-wdp-frontend-deploy

# Test that the deploy user can run the helper
sudo -u deploy /usr/local/bin/wdp-frontend-deploy-helper.sh --help
```

Expected output should show the helper script help information without any permission errors.

### 3. Test Deployment
Once the setup is complete, test the deployment from your local machine:

```bash
USER=deploy HOST=185.193.126.13 SSH_KEY=~/.ssh/id_ed25519_njalla DOMAIN=workforcedemocracyproject.org VERIFY=1 \
FILES="index.html js/personalization-ui.js js/personalization-system.js data" \
./ops/DEPLOY_FRONTEND.sh
```

### 4. Verify Deployed Files
After successful deployment, verify that the files are accessible:

```bash
curl -I https://workforcedemocracyproject.org/
curl -I https://workforcedemocracyproject.org/js/personalization-ui.js | grep -i content-type
curl -I https://workforcedemocracyproject.org/data/voting-info.json | grep -E "HTTP/|Content-Type"
```

Expected responses:
- `HTTP/2 200` for all requests
- `content-type: application/javascript` for JS files
- `content-type: application/json` for JSON files

## Troubleshooting

### Permission Denied Errors
If you encounter permission denied errors:
1. Verify the sudoers file is correctly installed and has proper permissions (0440)
2. Verify the helper script is installed with proper permissions (0750)
3. Check that the sudoers entry matches the exact path of the helper script

### Sudo Password Prompts
If you're prompted for a password when running the helper:
1. Verify that the sudoers entry uses `NOPASSWD:`
2. Ensure there are no conflicting entries in other sudoers files
3. Check that the username in the sudoers entry matches the SSH user

### File Not Found Errors
If you get "file not found" errors:
1. Verify that the helper script is installed in the correct location
2. Check that the PATH in the sudoers entry matches the actual location of the helper script

## Security Notes
- The helper script runs with root privileges via sudo but only performs specific, limited operations
- The sudoers configuration restricts the deploy user to only run this specific helper script
- File permissions are carefully controlled to prevent unauthorized access
- All operations are logged for audit purposes