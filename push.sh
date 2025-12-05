#!/bin/bash

# Script to push changes to GitHub repository
# This script guides you through the authentication process

echo "Pushing changes to GitHub repository..."

echo "Make sure you have a Personal Access Token (PAT) ready."
echo "If you don't have one, go to https://github.com/settings/tokens to create one."
echo "Choose 'Tokens (classic)' and check the 'repo' scope."

echo "When prompted for username, enter your GitHub username (e.g., Antunnaki)."
echo "When prompted for password, paste your Personal Access Token."

echo "Adding changes to staging area..."
git add .

echo "Committing changes..."
git commit -m "$(date +%Y-%m-%d_%H-%M-%S)_auto_commit" 

echo "Pushing to remote repository..."
git push -u origin main

echo "Changes pushed successfully!"