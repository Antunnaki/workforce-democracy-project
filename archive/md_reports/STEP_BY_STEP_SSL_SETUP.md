# STEP BY STEP SSL SETUP FOR BETA ENVIRONMENT

This document provides detailed instructions for setting up SSL certificates for the beta environment.

## Prerequisites

1. Root access to the server (185.193.126.13)
2. The password you provided: ashred4810

## Step 1: Connect to the Server as Root

Open a terminal and connect to the server as root:

```bash
ssh root@185.193.126.13
```

Enter the password: ashred4810

## Step 2: Create the Sudoers File for the Deploy User

While connected as root, create a sudoers file to allow the deploy user to manage certificates and nginx without password prompts:

```bash
visudo -f /etc/sudoers.d/wdp-deploy-tls
```

In the editor that opens, add the following content:

```
deploy ALL=(root) NOPASSWD: \
  /usr/sbin/nginx, /usr/sbin/nginx -t, \
  /bin/systemctl reload nginx, \
  /usr/bin/certbot, /usr/bin/certbot renew, /usr/bin/certbot --nginx *
```

Save and exit the editor (typically Ctrl+X, then Y, then Enter in nano editor).

## Step 3: Issue the SSL Certificate

Run the following command to issue the SSL certificate for the beta domain:

```bash
certbot --nginx -d api-beta.workforcedemocracyproject.org
```

Follow the prompts if any appear.

## Step 4: Test and Reload Nginx

Test the Nginx configuration and reload the service:

```bash
nginx -t && systemctl reload nginx
```

## Step 5: Verify the Setup

Run these commands to verify that everything is working correctly:

```bash
# Check that the certificate was issued
certbot certificates | sed -n '1,200p'

# Test HTTP redirects (should return 301)
curl -sSI -4 http://api-beta.workforcedemocracyproject.org | head -n1
curl -sSI -6 http://api-beta.workforcedemocracyproject.org | head -n1

# Test HTTPS access (should return 200)
curl -sSI -4 https://api-beta.workforcedemocracyproject.org | head -n1
curl -sSI -6 https://api-beta.workforcedemocracyproject.org | head -n1

# Check TLS details
openssl s_client -connect api-beta.workforcedemocracyproject.org:443 -servername api-beta.workforcedemocracyproject.org -brief </dev/null | sed -n '1,15p'
```

## Step 6: Update Coordination Files

After successful completion, update the coordination files:

1. On the server, update `/srv/wdp/shared/changes.log`:
   ```bash
   echo "2025-12-11TXX:XXZ beta: issued Let's Encrypt cert for api-beta.workforcedemocracyproject.org; nginx reload OK; HTTPS health verified." >> /srv/wdp/shared/changes.log
   ```

2. Update the local repository file `ops/COORDINATION.md` with the verification results.

## Troubleshooting

If you encounter any issues:

1. **If certbot fails**: Make sure the DNS is properly configured and that both A and AAAA records point to the server.

2. **If nginx test fails**: Check the nginx configuration files for syntax errors.

3. **If HTTP tests return 404**: Verify that the nginx server blocks are correctly configured.

4. **If HTTPS tests fail with SSL errors**: Make sure the certificate was issued correctly and nginx was reloaded.

## Next Steps

After completing these steps successfully, the beta environment will be accessible via HTTPS, and the deploy user will be able to manage certificates and nginx without requiring a password.