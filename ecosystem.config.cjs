module.exports = {
  apps: [{
    name: 'stx-freelance',
    script: './dist/server/index.js',  // Correct path to the built server file
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
