# VPS Beta Environment Setup

This directory contains all the necessary files to set up a separate beta environment on the VPS, as recommended by Junie.

## Directory Structure

- `systemd/` - Systemd unit files for the beta backend service
- `nginx/` - Nginx configuration templates for beta domains
- `scripts/` - Setup and deployment scripts
- `configs/` - Configuration file templates

## Setup Process

1. **On the VPS (with root privileges):**
   ```bash
   # Copy the setup script to the VPS
   scp vps_beta_setup/scripts/setup-vps-beta.sh root@your-vps-ip:/tmp/
   
   # Run the setup script on the VPS
   ssh root@your-vps-ip
   chmod +x /tmp/setup-vps-beta.sh
   /tmp/setup-vps-beta.sh
   ```

2. **Update configuration files:**
   - Update API keys in `/srv/wdp/beta/shared/beta.env` on the VPS
   - Configure Nginx server blocks for the beta domains
   - Obtain TLS certificates for the beta domains

3. **Configure DNS:**
   - Add A/AAAA records for `beta.workforcedemocracyproject.org` pointing to the VPS IP
   - Add A/AAAA records for `api-beta.workforcedemocracyproject.org` pointing to the VPS IP

4. **Local deployment:**
   ```bash
   # Deploy to beta environment
   ./vps_beta_setup/scripts/rsync-deploy-enhanced.sh beta YOUR_VPS_IP
   
   # Deploy to production environment
   ./vps_beta_setup/scripts/rsync-deploy-enhanced.sh prod YOUR_VPS_IP
   ```

## Benefits of This Approach

1. **True Isolation:** Separate users, groups, and file paths for beta and production
2. **Security:** Hardened systemd units with restricted permissions
3. **Reliability:** Atomic deployments with rollback capability
4. **Maintainability:** Clear separation of concerns and documentation
5. **Cost-Effective:** Uses existing VPS infrastructure without external dependencies

## Files Included

- `systemd/wdp-backend-beta.service` - Systemd unit file for beta backend
- `configs/beta.env` - Environment configuration template for beta
- `scripts/setup-vps-beta.sh` - VPS setup script
- `scripts/rsync-deploy-enhanced.sh` - Enhanced deployment script supporting both environments

## Next Steps

1. Test the setup in a staging environment if possible
2. Update documentation in `ops/COORDINATION.md` with the new setup details
3. Train team members on the new deployment workflow
4. Gradually migrate development work to the new beta environment