# Frontend API Configuration

## Environment-based API Endpoint Configuration

To ensure the frontend connects to the correct backend API, use environment variables to set the API base URL.

### Beta Environment Configuration

For the beta Netlify deployment, set the following environment variable:

```
API_BASE_URL=https://api-beta.workforcedemocracyproject.org
```

### Production Environment Configuration

For the production Netlify deployment, set the following environment variable:

```
API_BASE_URL=https://api.workforcedemocracyproject.org
```

### Implementation Example

In your frontend JavaScript code, you can use the environment variable like this:

```javascript
// Get the API base URL from environment variables or fallback to production
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.workforcedemocracyproject.org';

// Example function to make API calls
async function sendMessage(message) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/civic/llm-chat/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

### Netlify-specific Configuration

For Netlify deployments, you can set these environment variables in the Netlify dashboard under:

Site settings → Build & deploy → Environment → Environment variables

Alternatively, you can use Netlify's branch-based environment variable feature to automatically set the correct API base URL based on the branch being deployed.

### Verification

To verify that your frontend is correctly configured:

1. Deploy your site to the beta Netlify URL
2. Open the browser's developer tools
3. Go to the Network tab
4. Trigger a chat request
5. Verify that the request is being sent to `https://api-beta.workforcedemocracyproject.org`
6. Check that there are no CORS errors in the console