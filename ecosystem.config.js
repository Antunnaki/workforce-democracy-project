module.exports = {
  apps: [
    {
      name: 'wdp-a',
      script: 'server.js',
      cwd: '/var/www/workforce-democracy/version-a/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_file: '.env',
      dotenv: true
    },
    {
      name: 'wdp-b',
      script: 'server.js',
      cwd: '/var/www/workforce-democracy/version-b/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      env_file: '.env',
      dotenv: true
    }
  ]
};
