#!/bin/bash
# sync-secrets.sh
# Securely sync recovered API keys to the Njalla VPS backend
# Usage: ./sync-secrets.sh

VPS_IP="185.193.126.13"
ENV_PATH="/srv/wdp/beta/current/backend/.env"

# Recovered Keys
CONGRESS_KEY="ktubRS8VFW27wabUkaV0nEFXArDI8BYpsn3xOKlr"
OPENSTATES_KEY="7234b76b-44f7-4c91-a892-aab3ecba94fd"

echo "🔐 Syncing secrets to VPS ($VPS_IP)..."

# Use ssh to update the .env file directly on the server
# This avoids committing keys to Git or syncing the whole .env file
ssh root@$VPS_IP "
    if [ ! -f $ENV_PATH ]; then
        echo 'Creating missing .env file...'
        touch $ENV_PATH
    fi
    
    # Update Congress Key
    if grep -q 'CONGRESS_API_KEY=' $ENV_PATH; then
        sed -i 's/CONGRESS_API_KEY=.*/CONGRESS_API_KEY=$CONGRESS_KEY/' $ENV_PATH
    else
        echo 'CONGRESS_API_KEY=$CONGRESS_KEY' >> $ENV_PATH
    fi
    
    # Update OpenStates Key
    if grep -q 'OPENSTATES_API_KEY=' $ENV_PATH; then
        sed -i 's/OPENSTATES_API_KEY=.*/OPENSTATES_API_KEY=$OPENSTATES_KEY/' $ENV_PATH
    else
        echo 'OPENSTATES_API_KEY=$OPENSTATES_KEY' >> $ENV_PATH
    fi
    
    echo '✅ Secrets updated in $ENV_PATH'
"

echo "🔄 Restarting Backend to apply changes..."
ssh root@$VPS_IP "
    fuser -k 3001/tcp 2>/dev/null || true
    cd /srv/wdp/beta/current && sudo -u wdp-beta /usr/bin/node backend/server.js > backend/server.log 2>&1 &
    echo '✅ Backend restarted on port 3001'
"

echo "✨ Secrets Sync Complete!"
