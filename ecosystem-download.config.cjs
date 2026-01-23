module.exports = {
  apps: [
    {
      name: 'download-server',
      script: 'python3',
      args: '-m http.server 9000 --directory /home/user',
      cwd: '/home/user',
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
