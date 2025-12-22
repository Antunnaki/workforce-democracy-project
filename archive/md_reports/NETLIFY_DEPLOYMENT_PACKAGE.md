# Netlify Deployment Package

## Summary

Based on Junie's directions, I've created a deployment package that can be uploaded to Netlify to serve the new modular frontend files. The current issue is that the Netlify beta site is still serving the old bundle with legacy scripts, while we've deployed the new files to the VPS.

## Files Included

The zip file `wdp_netlify_deploy.zip` contains:

1. `index.html` - Beta shell with:
   - Shell live marker ("WDP SHELL LIVE" ribbon)
   - Strict CSP policies
   - Module loader for app-shell.mjs
   - Automatic chat module mounting

2. `chat.html` - Dedicated chat module test page

3. `js/app-shell.mjs` - Module loader and central configuration

4. `js/modules/chat.mjs` - Chat module implementation

## Deployment Instructions

To deploy these files to Netlify:

1. Log in to the Netlify account for the Workforce Democracy Project
2. Go to the site settings for `beta-workforcedemocracyproject.netlify.app`
3. In the deploy settings, upload the `wdp_netlify_deploy.zip` file
4. Trigger a new deploy

## Expected Results

After deployment, the Netlify beta site should:

1. Display the "WDP SHELL LIVE" ribbon in the top-left corner
2. Show no references to legacy scripts (`chat-clean.js`, `main.js`, etc.) in View Source
3. Have no console errors related to legacy script parsing
4. Display the chat widget 💬 button on both the homepage and `/chat.html`
5. Allow the chat widget to function properly with API communication

## Next Steps

1. Deploy the zip file to Netlify
2. Test the beta site to confirm:
   - The shell is live (WDP SHELL LIVE ribbon visible)
   - No legacy scripts are loading
   - Chat widget appears and functions
3. Address any CORS issues if API communication is blocked
4. Once confirmed working, promote to production

## File Location

The zip file is located at:
`/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project/wdp_netlify_deploy.zip`

## Conclusion

This deployment package should resolve the issue of legacy scripts loading on the beta site by replacing them with the new modular architecture. Once deployed, the chat widget should appear and function correctly without the parse errors that were occurring with the legacy scripts.