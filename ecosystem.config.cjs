module.exports = {
  apps: [
    {
      name: "diagnostico-ia-4qs",
      script: "server/index.js",
      cwd: "/home/deploy/landing-diagnostico-ia-4qs-limiter",
      env: {
        NODE_ENV: "production",
        APP_ENV: "production"
      }
    }
  ]
};
