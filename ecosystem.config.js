module.exports = {
  apps: [
    {
      name: 'ganesh-bns-web',
      script: 'npm',
      args: 'run dev',
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'ganesh-bns-tunnel',
      script: 'ssh',
      args: '-o StrictHostKeyChecking=no -p 443 -R0:localhost:3000 a.pinggy.io',
      watch: false,
      autorestart: true,
      max_restarts: 10
    }
  ]
};
