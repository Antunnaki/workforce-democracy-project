# Nginx CORS Configuration Update Plan

## Objective
Add `https://beta-workforcedemocracyproject.netlify.app` to the beta environment's relaxed CORS policy while maintaining security boundaries between beta and production environments.

## Current State
The beta environment (`api-beta.workforcedemocracyproject.org`) currently has a relaxed CORS policy that allows:
- `localhost:3000`
- `127.0.0.1:3000`
- Preview Netlify pattern

## Proposed Changes
Update the Nginx configuration on the server to explicitly include `https://beta-workforcedemocracyproject.netlify.app` in the allowed origins for the beta environment.

## Implementation Steps

1. SSH to the VPS server
2. Edit the Nginx configuration file for the beta environment
3. Update the CORS headers to include the new origin
4. Test the configuration
5. Reload Nginx
6. Verify the changes with curl commands
7. Document the changes

## Updated Configuration Example

```
# Add mapping for CORS origins
map "$http_origin" $cors_origin {
    default "";
    "~^https://workforcedemocracyproject\.org$" "https://workforcedemocracyproject.org";
    "~^https://www\.workforcedemocracyproject\.org$" "https://www.workforcedemocracyproject.org";
    "~^https://workforcedemocracyproject\.netlify\.app$" "https://workforcedemocracyproject.netlify.app";
    "~^https://beta-workforcedemocracyproject\.netlify\.app$" "https://beta-workforcedemocracyproject.netlify.app";
    "http://localhost:3000" "http://localhost:3000";
    "http://127.0.0.1:3000" "http://127.0.0.1:3000";
}

# In the location block
location / {
    # ... existing proxy settings ...
    
    # CORS Headers
    add_header 'Access-Control-Allow-Origin' $cors_origin always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
    add_header 'Access-Control-Max-Age' '86400' always;
    
    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Max-Age' '86400' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' '0';
        return 204;
    }
}
```

## Verification Commands

After deploying the changes, run these commands to verify:

```bash
# Test CORS headers with the new origin
curl -sSI -H 'Origin: https://beta-workforcedemocracyproject.netlify.app' \
  https://api-beta.workforcedemocracyproject.org/health | grep -i '^access-control-'

# Test redirect
curl -sSI https://api-beta.workforcedemocracyproject.org | head -n1

# Test health endpoint
curl -sL https://api-beta.workforcedemocracyproject.org | head -n5
```

## Notes
- Production environment must remain strict and not include the beta origin
- No Basic Auth will be added to beta environment at this time
- Changes will be logged in both `ops/COORDINATION.md` and `/srv/wdp/shared/changes.log`