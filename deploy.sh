#!/bin/bash
set -euo pipefail

# Workforce Democracy Project Deployment Script
# Purpose: Safe, parameterized deploy helper for VPS
# Default flow: git pull in backend dir → restart PM2 app → health check

# Configuration variables
SERVER_IP="185.193.126.13"
SERVER_USER="root"
# Canonical backend path on VPS (override with -p)
PROJECT_PATH="/var/www/workforce-democracy/backend"
# PM2 process name (override with -n)
PM2_NAME="workforce-democracy-project"
# Health check port (override with -H); default 3001 = Version A (prod)
HEALTH_PORT="3001"

# Function to display usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -p, --path     Backend path on VPS (default: $PROJECT_PATH)"
    echo "  -s, --server   Server IP address (default: $SERVER_IP)"
    echo "  -u, --user     Server username (default: $SERVER_USER)"
    echo "  -n, --pm2      PM2 process name (default: $PM2_NAME)"
    echo "  -H, --health   Health check port (default: $HEALTH_PORT)"
    echo "\nExamples:"
    echo "  $0 -p /var/www/workforce-democracy/backend -n backend-b -H 3002"
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
        -n|--pm2)
            PM2_NAME="$2"
            shift 2
            ;;
        -H|--health)
            HEALTH_PORT="$2"
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

# Step 1: Pull latest code from Git
echo "=== Pulling latest code from Git ==="
execute_on_server "cd ${PROJECT_PATH} && git fetch --all && git pull --ff-only origin main"

# Step 2: Restart application with PM2
echo "=== Restarting application with PM2 ==="
execute_on_server "pm2 restart ${PM2_NAME} || ROOT_PATH=\$(dirname \"${PROJECT_PATH}\"); [ -f \"$ROOT_PATH/ecosystem.config.js\" ] && pm2 start \"$ROOT_PATH/ecosystem.config.js\" --only ${PM2_NAME} || pm2 restart all"

# Step 3: Check application status
echo "=== Checking application status ==="
execute_on_server "pm2 status"

# Step 4: Verify deployment
echo "=== Verifying deployment ==="
execute_on_server "curl -sS -X GET http://localhost:${HEALTH_PORT}/health || echo 'Health check failed'"

# End of script