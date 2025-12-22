# Backend Quick Start Guide

## Environment Variables

The backend requires the following environment variables to function properly:

### Required Variables

1. `MONGODB_URI` - Connection string for MongoDB database
   - Example: `mongodb://localhost:27017/wdp`
   - Used for: User sessions and personalization features

2. `CONGRESS_API_KEY` - API key for Congress.gov
   - Get from: https://api.congress.gov/sign-up/
   - Used for: Federal bills and representatives data

3. `OPENSTATES_API_KEY` - API key for OpenStates
   - Get from: https://openstates.org/api/register/
   - Used for: State bills and legislators data

### Optional Variables

- `GROQ_API_KEY` - API key for Groq AI service
  - Used for: AI chat features

- `DASHSCOPE_API_KEY` - API key for Qwen AI service
  - Used for: AI chat features (alternative to Groq)

## Setup Instructions

1. Create a `.env` file in the backend directory
2. Add the required environment variables
3. Start the backend service:
   ```bash
   npm install
   npm start
   ```

## Deployment Commands

On the production server:

1. Edit the environment file:
   ```bash
   sudo nano /srv/wdp/shared/prod.env
   ```

2. Restart the backend service:
   ```bash
   sudo systemctl restart wdp-backend-prod
   ```

3. Check service status:
   ```bash
   sudo systemctl status wdp-backend-prod
   ```

## Health Checks

Verify the backend is running correctly:

1. Health endpoint:
   ```bash
   curl https://api.workforcedemocracyproject.org/health
   ```

2. Representative lookup:
   ```bash
   curl "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061"
   ```