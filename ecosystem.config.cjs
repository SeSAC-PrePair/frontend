module.exports = {
  apps: [{
    name: 'frontend',
    script: 'npx',
    args: 'serve -s dist --listen 5174',
    interpreter: 'none',
    env: {
      NODE_ENV: 'production',
    },
  }],
};