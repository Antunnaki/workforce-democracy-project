#!/bin/bash

# Workforce Democracy Project - Basic Deployment Script
# This script performs basic deployment tasks

echo "Starting basic deployment process..."

# Configuration variables
SERVER_IP="185.193.126.13"
SERVER_USER="root"

# Function to execute commands on server
execute_on_server() {
    local command="$1"
    echo "Executing: $command"
    ssh ${SERVER_USER}@${SERVER_IP} "$command"
}

# Main deployment process

# Step 1: Pull latest code from Git
echo "=== Pulling latest code from Git ==="
execute_on_server "cd /var/www/html/backend && git pull origin main"

# Step 2: Deploy frontend files
echo "=== Deploying frontend files ==="
execute_on_server "rsync -avz /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project/js/ /var/www/html/js/"

# Step 3: Deploy backend files
echo "=== Deploying backend files ==="
execute_on_server "rsync -avz /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project/backend/ /var/www/html/backend/"

# Step 4: Restart application with PM2
echo "=== Restarting application with PM2 ==="
execute_on_server "pm2 restart backend"

# Step 5: Check application status
echo "=== Checking application status ==="
execute_on_server "pm2 status"

# Step 6: Verify deployment
echo "=== Verifying deployment ==="
execute_on_server "curl -X GET http://localhost:3001/health"

# End of script