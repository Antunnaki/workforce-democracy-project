# Ops Directory Overview

This directory contains all operational scripts and documentation for deploying and maintaining the Workforce Democracy Project website and API.

## Deployment Scripts

### Main Deployment Scripts
- [DEPLOY_FRONTEND.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/DEPLOY_FRONTEND.sh) - Main script for deploying frontend files to the production server
- [DEPLOY_MAIN_WEBSITE.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/DEPLOY_MAIN_WEBSITE.sh) - Script for deploying the main website
- [UPDATE_NGINX_CORS.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/UPDATE_NGINX_CORS.sh) - Script for updating CORS configuration in Nginx

### Helper Scripts
- [wdp-frontend-deploy-helper.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/TEMPLATES/wdp-frontend-deploy-helper.sh) - Server-side helper for secure frontend deployments
- [server-setup-complete.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/server-setup-complete.sh) - Complete setup script for the deployment helper (requires root)
- [upload-and-setup-frontend-deploy.sh](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/upload-and-setup-frontend-deploy.sh) - Script to upload deployment files to the server

## Configuration Files
- [sudoers-wdp-frontend-deploy](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/sudoers-wdp-frontend-deploy) - Sudoers configuration for secure deployments

## Documentation
- [COORDINATION.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/COORDINATION.md) - Main coordination document with status updates and changelog
- [FRONTEND_BUG_FIXES_SUMMARY.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/FRONTEND_BUG_FIXES_SUMMARY.md) - Summary of frontend bug fixes
- [FRONTEND_DEPLOYMENT_COMPLETE_SETUP.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/FRONTEND_DEPLOYMENT_COMPLETE_SETUP.md) - Complete setup guide for frontend deployment
- [FRONTEND_DEPLOYMENT_GUIDE.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/FRONTEND_DEPLOYMENT_GUIDE.md) - Comprehensive guide to frontend deployment
- [FRONTEND_API_CONFIG.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/FRONTEND_API_CONFIG.md) - Frontend API configuration documentation

## Checklists
- [CHECKLISTS/FRONTEND_DEPLOY.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/CHECKLISTS/FRONTEND_DEPLOY.md) - Quick checklist for frontend deployment
- [PROD_SMOKE_TEST_CHECKLIST.md](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/PROD_SMOKE_TEST_CHECKLIST.md) - Production smoke test checklist

## Templates
- [TEMPLATES/nginx_main_website.conf](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/TEMPLATES/nginx_main_website.conf) - Nginx configuration template for main website
- [TEMPLATES/nginx_main_website_with_csp.conf](file:///Users/acejrowski/Desktop/AG/WORKFORCE%20DEMOCRACY%20PROJECT/SITE%20FILES/Workforce%20Democracy%20Project/ops/TEMPLATES/nginx_main_website_with_csp.conf) - Nginx configuration template with CSP headers