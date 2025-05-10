const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Define required environment variables, but make MONGO_URI optional
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_EXPIRE'
];

// Check for missing required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Export all environment variables in a structured way
module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship_management'
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '30d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@scholarshipmanagementsystem.com'
  },
  
  // Frontend URL for CORS and email links
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Cache configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    host: process.env.CACHE_HOST,
    port: process.env.CACHE_PORT,
    password: process.env.CACHE_PASSWORD
  }
}; 