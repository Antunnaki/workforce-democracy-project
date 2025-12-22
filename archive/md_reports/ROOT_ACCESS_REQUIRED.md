# ROOT ACCESS REQUIRED

The following actions need to be performed by someone with root access on the server (185.193.126.13).

## 1. Create Sudoers File

Create a sudoers file to allow the `deploy` user to manage certificates and nginx without password prompts:

```bash
# As root, create the sudoers file
sudo visudo -f /etc/sudoers.d/wdp-deploy-tls
```

Add the following content to the file:
```
deploy ALL=(root) NOPASSWD: \
  /usr/sbin/nginx, /usr/sbin/nginx -t, \
  /bin/systemctl reload nginx, \
  /usr/bin/certbot, /usr/bin/certbot renew, /usr/bin/certbot --nginx *
```

Save and exit the editor.

## 2. Issue SSL Certificate

Issue the SSL certificate for the beta domain:

```bash
sudo certbot --nginx -d api-beta.workforcedemocracyproject.org
```

## 3. Test and Reload Nginx

Test the Nginx configuration and reload the service:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 4. Verification

After completing the above steps, verify that everything is working correctly:

```bash
# Certificate inventory should list api-beta.workforcedemocracyproject.org
sudo certbot certificates | sed -n '1,200p'

# HTTP should redirect to HTTPS
curl -sSI http://api-beta.workforcedemocracyproject.org | head -n1

# HTTPS should respond successfully
curl -sSI https://api-beta.workforcedemocracyproject.org | head -n1

# TLS details should show SNI match and a valid chain
openssl s_client -connect api-beta.workforcedemocracyproject.org:443 \
  -servername api-beta.workforcedemocracyproject.org -brief </dev/null | sed -n '1,15p'
```

## 5. Update Coordination Files

After successful completion, update the coordination files:

1. In `/srv/wdp/shared/changes.log`, add an entry like:
   ```
   2025-12-11TXX:XXZ beta: issued Let's Encrypt cert for api-beta.workforcedemocracyproject.org; nginx reload OK; HTTPS health verified.
   ```

2. In `ops/COORDINATION.md`, move the completed items from "Pending requests for approval" to "Done/Changelog".

3. In `/srv/wdp/shared/requests.md`, mark the requests as completed.