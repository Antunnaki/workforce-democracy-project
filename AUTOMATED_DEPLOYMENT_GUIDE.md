# AUTOMATED DEPLOYMENT GUIDE
Version: December 6, 2025

## OVERVIEW

This project is configured for automated deployments:
- **Frontend**: Automatically deployed to Netlify when changes are pushed to the GitHub repository
- **Backend**: Requires manual deployment to the Njalla VPS

## AUTOMATED FRONTEND DEPLOYMENT

### Prerequisites
- Git repository connected to Netlify
- Changes committed and pushed to the main branch

### Deployment Process
```bash
# Navigate to your project directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project"

# Add all changed files to git
git add .

# Commit the changes with a descriptive message
git commit -m "Fix chat assistant - Remove test backend override and update API configuration"

# Push to GitHub (this triggers Netlify auto-deployment)
git push origin main

# Netlify will automatically deploy the changes
# Deployment typically takes 1-2 minutes
```

### Verification
After pushing to GitHub:
1. Visit your Netlify dashboard
2. Check the deploy status
3. Verify deployment completed successfully
4. Test the frontend at: https://workforcedemocracyproject.netlify.app

## MANUAL BACKEND DEPLOYMENT

### Prerequisites
- SSH access to the Njalla VPS
- Backend files updated in the local repository

### Deployment Process
```bash
# SSH into your server
ssh root@185.193.126.13

# When prompted, enter password: YNWA1892LFC

# Navigate to your project directory (adjust path as needed)
cd /var/www/workforce-democracy/backend

# Pull the latest changes from GitHub
git pull origin main

# Install any new dependencies (if needed)
npm install

# Restart the services
pm2 restart workforce-democracy-a
pm2 restart workforce-democracy-b

# Check that services are running
pm2 list

# Check logs for any errors (press Ctrl+C to exit)
pm2 logs workforce-democracy-a
```

### Verification Commands
After deployment, run these verification commands:

```bash
# Check backend health
curl -X GET "https://api.workforcedemocracyproject.org/api/civic/health"

# Check AI service health
curl -X GET "https://api.workforcedemocracyproject.org/api/civic/llm-health"

# Test direct chat endpoint
curl -X POST "https://api.workforcedemocracyproject.org/api/civic/llm-chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, who are you?"}'
```

## FRONTEND VERIFICATION

1. Visit your site: https://workforcedemocracyproject.netlify.app
2. Open browser developer tools (F12 or right-click → Inspect)
3. Click on the chat widget
4. Send a test message
5. Check the Console tab for any errors
6. Check the Network tab to see if API calls are successful

## EXPECTED RESULTS

After successful deployment, you should see:

1. **No CORS errors** in the browser console
2. **No 404 errors** when the chat widget makes API calls
3. **Actual AI responses** instead of fallback messages
4. **Working chat functionality** on your live site

## TROUBLESHOOTING

### If Frontend Deployment Fails
- Check Netlify dashboard for deployment errors
- Verify Git repository is properly connected to Netlify
- Check that all files were committed and pushed

### If Backend Deployment Fails
```bash
# Check PM2 logs for detailed error information
pm2 logs workforce-democracy-a --lines 100

# Check if services are running
pm2 list

# If you need to rollback:
# git reset --hard HEAD~1
# Then redeploy

# Check nginx configuration (if needed)
sudo nginx -t
sudo systemctl reload nginx
```

### If Chat Still Not Working
1. Verify the test backend override script is commented out in `index.html`
2. Check that `CleanChat.apiBase` is set correctly in `js/chat-clean.js`
3. Confirm `getBackendUrl()` in `js/config.js` returns the production endpoint
4. Check browser console for specific error messages

## MONITORING

After deployment, monitor:
- Netlify analytics for any frontend issues
- Server logs for backend errors
- User feedback for any remaining issues

---

*This guide provides the automated deployment process for both frontend and backend components.*