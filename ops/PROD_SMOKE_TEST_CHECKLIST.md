# Production UI Smoke Test Checklist

## Pre-requisites
- DNS propagation completed for workforcedemocracyproject.org and api.workforcedemocracyproject.org
- Production backend services running (wdp-backend-prod)
- Valid SSL certificates for both domains

## Tests to Perform

### 1. Basic Site Access
- [ ] Load https://workforcedemocracyproject.org in browser
- [ ] Verify page loads without errors
- [ ] Check for broken images or missing assets

### 2. API Connectivity
- [ ] Open browser console (F12)
- [ ] Check Network tab for API calls to https://api.workforcedemocracyproject.org
- [ ] Verify all API requests return 200 status codes
- [ ] Check for any CORS errors in console

### 3. Chat Functionality
- [ ] Navigate to chat widget/section
- [ ] Send a test message: "Who is my state representative in California?"
- [ ] Verify response is received within reasonable time (under 10 seconds)
- [ ] Check that response contains relevant content
- [ ] Verify no errors in console during chat interaction

### 4. Security Compliance
- [ ] Check that CSP headers are properly enforced
- [ ] Verify no mixed content warnings (HTTP resources on HTTPS page)
- [ ] Confirm all external resources are allowed by CSP

### 5. Performance Metrics
- [ ] Page load time under 3 seconds
- [ ] Chat response time under 10 seconds
- [ ] No JavaScript errors in console

### 6. Mobile Responsiveness
- [ ] Load site on mobile device or emulator
- [ ] Verify layout is responsive and readable
- [ ] Test chat functionality on mobile

## Troubleshooting
If any issues are found:
1. Check browser console for specific error messages
2. Verify DNS resolution with `dig` command
3. Test API endpoints directly with curl
4. Check backend service status with `systemctl status wdp-backend-prod`
5. Review nginx configuration and logs