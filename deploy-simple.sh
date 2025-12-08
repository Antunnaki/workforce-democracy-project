#!/bin/bash

# Workforce Democracy Project - Simple Deployment Script
# This script performs basic deployment tasks

echo "Starting simple deployment process..."

# Configuration variables
SERVER_IP="185.193.126.13"
SERVER_USER="root"
PROJECT_PATH="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project"

# Function to execute commands on server
execute_on_server() {
    local command="$1"
    echo "Executing on server: $command"
    ssh ${SERVER_USER}@${SERVER_IP} -p 22 "$command"
}

# Main deployment process

# Step 1: Pull latest code from Git on server
echo "=== Pulling latest code from Git ==="
execute_on_server "cd /var/www/workforce-democracy && git pull origin main"

# Step 2: Copy files using scp instead of rsync
echo "=== Deploying frontend files ==="
scp -P 22 -r "${PROJECT_PATH}/js/" ${SERVER_USER}@${SERVER_IP}:/var/www/html/

# Step 3: Copy backend files
echo "=== Deploying backend files ==="
scp -P 22 -r "${PROJECT_PATH}/backend/" ${SERVER_USER}@${SERVER_IP}:/var/www/workforce-democracy/

# Step 4: Install/update dependencies on server
echo "=== Installing/Updating dependencies ==="
execute_on_server "cd /var/www/workforce-democracy/backend && npm install"

# Step 5: Restart application with PM2
echo "=== Restarting application with PM2 ==="
execute_on_server "/opt/nodejs/bin/pm2 restart workforce-democracy-backend || /opt/nodejs/bin/pm2 start /var/www/workforce-democracy/backend/server.js --name workforce-democracy-backend"

# Step 6: Check application status
echo "=== Checking application status ==="
execute_on_server "/opt/nodejs/bin/pm2 list"

# Step 7: Verify deployment
echo "=== Verifying deployment ==="
execute_on_server "curl -s http://localhost:3000/api/civic/llm-health || curl -s http://localhost:3001/api/civic/llm-health"

echo "Deployment completed!"