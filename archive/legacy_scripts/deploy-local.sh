#!/bin/bash

# Workforce Democracy Project - Local Deployment Script
# This script performs local deployment tasks

echo "Starting local deployment process..."

# Configuration variables
SERVER_IP="185.193.126.13"
SERVER_USER="root"
PROJECT_PATH="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project/backend"
FRONTEND_PATH="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project/js"

# Function to display usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -p, --path     Path to project directory (default: $PROJECT_PATH)"
    echo "  -s, --server   Server IP address (default: $SERVER_IP)"
    echo "  -u, --user     Server username (default: $SERVER_USER)"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -p|--path)
            PROJECT_PATH="$2"
            shift 2
            ;;
        -s|--server)
            SERVER_IP="$2"
            shift 2
            ;;
        -u|--user)
            SERVER_USER="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Function to execute commands on server
execute_on_server() {
    local command="$1"
    echo "Executing: $command"
    ssh ${SERVER_USER}@${SERVER_IP} "$command"
}

# Function to get password from user
get_password() {
    read -sp "Enter password for ${SERVER_USER}@${SERVER_IP}: " password
    echo
    echo $password
}

# Main deployment process

# Step 1: Deploy frontend files
echo "=== Deploying frontend files ==="
execute_on_server "rsync -avz \"${FRONTEND_PATH}/\" /var/www/html/js/"

# Step 2: Deploy backend files
echo "=== Deploying backend files ==="
execute_on_server "rsync -avz \"${PROJECT_PATH}/\" /var/www/html/backend/"

# Step 3: Restart application with PM2
echo "=== Restarting application with PM2 ==="
execute_on_server "pm2 restart backend"

# Step 4: Check application status
echo "=== Checking application status ==="
execute_on_server "pm2 status"

# Step 5: Verify deployment
echo "=== Verifying deployment ==="
execute_on_server "curl -X GET http://localhost:3001/health"

# End of script