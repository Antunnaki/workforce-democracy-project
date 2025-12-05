module.exports = {
  apps: [{
    name: 'backend',
    script: 'server.js',
    cwd: '/var/www/workforce-democracy/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    env_file: '.env',
    // This ensures .env is loaded
    dotenv: true
  }]
};
