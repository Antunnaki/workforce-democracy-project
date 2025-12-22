# Fix for Voting Info 404 Error

## Problem
The voting information system is failing to load because the `data/voting-info.json` file is missing from the server, resulting in a 404 error when the frontend tries to fetch it.

## Solution
The data directory containing the voting-info.json file needs to be deployed to the server with proper permissions.

## Manual Fix Instructions

1. Upload the data directory to the server:
   ```bash
   scp -i ~/.ssh/id_ed25519_njalla -r /path/to/local/project/data deploy@185.193.126.13:/tmp/
   ```

2. On the server, move the data directory to the correct location and set permissions:
   ```bash
   sudo mkdir -p /var/www/workforcedemocracyproject.org/data
   sudo cp -r /tmp/data/* /var/www/workforcedemocracyproject.org/data/
   sudo chown -R www-data:www-data /var/www/workforcedemocracyproject.org/data
   sudo chmod -R 755 /var/www/workforcedemocracyproject.org/data
   sudo chmod 644 /var/www/workforcedemocracyproject.org/data/voting-info.json
   ```

3. Reload nginx:
   ```bash
   sudo systemctl reload nginx
   ```

4. Verify the file is accessible:
   ```bash
   curl -I "https://workforcedemocracyproject.org/data/voting-info.json"
   ```

## Prevention
The updated deployment scripts now include the data directory by default:
- `ops/DEPLOY_FRONTEND.sh`
- `ops/DEPLOY_FRONTEND_SIMPLE.sh`

When running these scripts, the data directory will be included in the deployment package automatically.

## Testing
After applying the fix, test the voting information system by:
1. Opening the website in a browser
2. Navigating to the voting information section
3. Selecting a country to verify the data loads correctly
4. Checking the browser console for any errors