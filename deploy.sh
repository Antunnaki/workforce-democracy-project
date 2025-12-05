#!/bin/bash

# Simple deployment script for Workforce Democracy Project

echo "Starting deployment process..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null
then
    echo "Netlify CLI could not be found. Installing..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

echo "Deployment completed!"