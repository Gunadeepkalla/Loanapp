const config = {
  // For development
  development: {
    API_URL: 'http://localhost:5000/api',
  },
  // For production
  production: {
    API_URL: 'https://your-production-api.com/api',
  },
};

// Determine the environment
const env = process.env.NODE_ENV || 'development';

// Export the config for current environment
export default config[env];