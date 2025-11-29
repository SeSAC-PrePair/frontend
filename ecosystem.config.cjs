module.exports = {
  apps: [{
    name: 'frontend',
    script: 'npx',
    args: 'serve -s dist -l 5174',
    interpreter: 'none',
    env: {
      NODE_ENV: 'production',
    },
  }],
};