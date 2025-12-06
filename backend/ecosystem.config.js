const path = require('path');

module.exports = {
  apps: [{
    name: 'backend',
    script: 'server.js',
    cwd: path.resolve(__dirname),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_file: '.env',
    // This ensures .env is loaded
    dotenv: true
  }]
};