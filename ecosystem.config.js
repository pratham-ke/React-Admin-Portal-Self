module.exports = {
  apps: [
    // Backend - Express
    {
      name: 'backend',
      script: './backend/server.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        HOST: '0.0.0.0',
        FRONTEND_URL: 'http://localhost:3000'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0',
        // FRONTEND_URL should be the origin that the browser will use to load the frontend
        // (including port). We set it to app.local so CORS will allow requests from that origin.
        FRONTEND_URL: 'http://app.local:3000'
      }
    },

    // Frontend - lightweight express static server (frontend-server.js)
    {
      name: 'frontend',
      script: './frontend-server.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
        API_BASE_URL: 'http://localhost:5000'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        // The frontend bundle expects the API to be at http://api.local:5000/api
        // If you used VITE_API_BASE_URL during build as http://api.local:5000/api, keep the same here.
        API_BASE_URL: 'http://api.local:5000/api'
      }
    }
  ]
};
