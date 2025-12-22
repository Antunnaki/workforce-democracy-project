# CORS Fix Instructions

According to Anthony's instructions, the following steps need to be taken to fix the CORS issue:

1. Add `https://beta-workforcedemocracyproject.netlify.app` to the API's CORS allowlist
2. Redeploy the API proxy

## Server-side Changes Required

The following environment variable needs to be updated in the backend:

```
ALLOWED_ORIGINS=https://workforcedemocracyproject.netlify.app,https://workforcedemocracyproject.org,https://www.workforcedemocracyproject.org,https://beta-workforcedemocracyproject.netlify.app
```

This should be updated in:
- Production: `wdp-api-prod` app on Scalingo
- Beta: `wdp-api-beta` app on Scalingo

After updating the environment variable, the apps need to be redeployed for the changes to take effect.

## Verification

After deployment, test the following endpoints from the beta site:
- `/health`
- `/api/personalization/session`

These should no longer show CORS errors in the browser console.