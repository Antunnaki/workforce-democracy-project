# CORS Configuration for Workforce Democracy Project

## Overview
This document explains the CORS configuration implemented for the Workforce Democracy Project API to properly handle cross-origin requests with credentials.

## Problem
The signup flow was failing because:
1. The frontend was sending requests with `credentials: 'include'`
2. The API was not returning the required `Access-Control-Allow-Credentials: true` header
3. The `Access-Control-Allow-Origin` header was not reflecting the exact origin

This caused browsers to block the response, preventing the signup wizard from proceeding.

## Solution
We implemented CORS handling at the Nginx level (reverse proxy) rather than in the Express application. This approach provides better control and avoids potential conflicts.

## Implementation Details

### Nginx Configuration
The updated configuration in `/etc/nginx/sites-available/wdp-backend.conf` includes:

1. **Origin Mapping**:
```nginx
map $http_origin $cors_origin {
    ~^https://workforcedemocracyproject\.org$         $http_origin;
    ~^https://www\.workforcedemocracyproject\.org$    $http_origin;
    default ""; # anything else not allowed
}

map $http_origin $cors_credentials {
    ~^https://(www\.)?workforcedemocracyproject\.org$  "true";
    default "false";
}
```

2. **CORS Headers**:
```nginx
add_header Vary "Origin" always;
add_header Access-Control-Allow-Origin $cors_origin always;
add_header Access-Control-Allow-Credentials $cors_credentials always;
add_header Access-Control-Allow-Methods "GET,POST,OPTIONS" always;
add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
add_header Access-Control-Max-Age 86400 always;
```

3. **Preflight Handling**:
```nginx
if ($request_method = OPTIONS) {
    return 204;
}
```

### Security Snippet
We created a separate security snippet (`/etc/nginx/snippets/wdp-security-strict-no-cors.conf`) that includes all security headers except CORS headers to avoid duplication.

## Key Points

1. **Exact Origin Matching**: When `Access-Control-Allow-Credentials: true` is used, `Access-Control-Allow-Origin` must be the exact origin (not `*`).

2. **Vary Header**: The `Vary: Origin` header ensures that caches don't mix responses across different origins.

3. **Allowed Origins**: Only `https://workforcedemocracyproject.org` and `https://www.workforcedemocracyproject.org` are allowed to make credentialed requests.

4. **Credentials Flag**: Credentials are only allowed for the specified origins, protecting against unauthorized cross-origin access.

## Testing
To verify the configuration works correctly:

1. **Preflight Request**:
```bash
curl -i -X OPTIONS \
  https://api.workforcedemocracyproject.org/api/personalization/register \
  -H 'Origin: https://workforcedemocracyproject.org' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

2. **Actual Request Header Check**:
```bash
curl -I https://api.workforcedemocracyproject.org/api/personalization/register \
  -H 'Origin: https://workforcedemocracyproject.org'
```

Both should return the proper CORS headers:
- `Access-Control-Allow-Origin: https://workforcedemocracyproject.org`
- `Access-Control-Allow-Credentials: true`

## Privacy Considerations
As requested, no cookies are being used. All user data remains on the client side (localStorage) as per the project's privacy requirements. The CORS configuration only enables the necessary communication between the frontend and backend for the signup process to work correctly.

## Maintenance
When adding new domains or subdomains that need to access the API:
1. Update the origin mapping in the Nginx configuration
2. Test the changes thoroughly
3. Reload Nginx: `sudo systemctl reload nginx`