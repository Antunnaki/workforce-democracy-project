#!/bin/bash

# Script to set up the VPS beta environment
# Run this script on the VPS with root privileges

echo "Setting up VPS beta environment..."

# Create users and groups
echo "Creating users and groups..."
useradd --system --no-create-home --group wdp-beta
useradd --system --no-create-home --group wdp-prod

# Create directory structure for beta
echo "Creating directory structure for beta..."
mkdir -p /srv/wdp/beta/{releases,shared,current}
mkdir -p /srv/wdp/prod/{releases,shared,current}

# Set ownership and permissions
echo "Setting ownership and permissions..."
chown -R wdp-beta:wdp-beta /srv/wdp/beta
chown -R wdp-prod:wdp-prod /srv/wdp/prod
chmod -R 750 /srv/wdp/beta
chmod -R 750 /srv/wdp/prod

# Create initial environment file for beta
echo "Creating initial environment file for beta..."
cat > /srv/wdp/beta/shared/beta.env <<'EOF'
NODE_ENV=production
MODE=beta
PORT=3001
ALLOWED_ORIGINS=https://beta.workforcedemocracyproject.org
OPENSTATES_API_KEY=
DASHSCOPE_API_KEY=
LLM_MAX_TOKENS=512
LLM_TIMEOUT_MS=20000
EOF

# Set permissions for environment file
chown wdp-beta:wdp-beta /srv/wdp/beta/shared/beta.env
chmod 600 /srv/wdp/beta/shared/beta.env

# Copy systemd unit file
echo "Installing systemd unit file..."
cp wdp-backend-beta.service /etc/systemd/system/
systemctl daemon-reload

echo "VPS beta environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the API keys in /srv/wdp/beta/shared/beta.env"
echo "2. Configure Nginx server blocks for beta domains"
echo "3. Obtain TLS certificates for beta domains"
echo "4. Start the beta backend service with: systemctl start wdp-backend-beta"