#!/bin/bash

# Workforce Democracy Project - LLM Chat Fix Deployment Script
# This script fixes the LLM chat functionality issues and deploys the changes

echo "Starting LLM chat fix deployment process..."

# Configuration variables
SERVER_IP="185.193.126.13"
SERVER_USER="root"
PROJECT_PATH="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project/backend"

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

# Step 1: Pull latest code from Git
echo "=== Pulling latest code from Git ==="
execute_on_server "cd \"${PROJECT_PATH}\" && git pull origin main"

# Step 2: Update environment variables in .env file
echo "=== Updating environment variables in .env file ==="
execute_on_server "sed -i 's/DASHSCOPE_API_KEY=QWEN_API_KEY/g' \"${PROJECT_PATH}/.env\""
execute_on_server "sed -i 's/DASHSCOPE_API_URL=QWEN_API_URL/g' \"${PROJECT_PATH}/.env\""
execute_on_server "sed -i 's/QWEN_MODEL=qwen-plus/g' \"${PROJECT_PATH}/.env\""

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