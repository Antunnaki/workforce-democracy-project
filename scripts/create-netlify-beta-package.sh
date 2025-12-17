#!/bin/bash

# Script to create a deployment package for Netlify beta environment

echo "Creating Netlify beta deployment package..."

# Remove old package if exists
rm -f ../netlify_beta_deploy.zip

# Create new package with required files at root level
zip -j ../netlify_beta_deploy.zip \
    ../index.html \
    ../chat.html \
    ../js/app-shell.20251216.mjs \
    ../js/modules/chat.20251216.mjs

echo "Netlify beta deployment package created: netlify_beta_deploy.zip"
echo "Package contents:"
unzip -l ../netlify_beta_deploy.zip

echo ""
echo "To deploy:"
echo "1. Log in to Netlify dashboard"
echo "2. Select the beta site (beta-workforcedemocracyproject.netlify.app)"
echo "3. Go to Deploys tab"
echo "4. Drag and drop netlify_beta_deploy.zip to the deployment area"
echo "5. Wait for deployment to complete"
echo "6. Test the beta site"