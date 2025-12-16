module.exports = {
  apps: [
    {
      name: 'ideiaerp-sync-api',
      script: 'dist/apps/api/main.js',
      instances: 1, // Single instance for API + CRON
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    // Alternative: Cluster mode (API in cluster, CRON in single instance)
    // Uncomment to use cluster mode
    /*
    {
      name: 'ideiaerp-sync-api',
      script: 'dist/apps/api/main.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    */
  ],
};



