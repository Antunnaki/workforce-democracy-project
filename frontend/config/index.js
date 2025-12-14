// Dynamic configuration loader
// This would typically be replaced during build process with the appropriate environment config

// For now, we'll export a function that determines which config to use
import betaConfig from './beta.js';
import prodConfig from './production.js';

function getConfig() {
  // In a real implementation, this would be determined by environment variables
  // For now, we'll default to production but allow override for development
  const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
  const isBeta = window.location.hostname.includes('beta') || 
                 window.location.hostname === 'localhost' ||
                 isDev;
                 
  return isBeta ? betaConfig : prodConfig;
}

export default getConfig();