module.exports = {
  apps: [
    {
      name: 'rosicatore',
      script: 'npx',
      args: 'http-server . -p 3000 -a 0.0.0.0',
      env: {
        NODE_ENV: 'development'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
