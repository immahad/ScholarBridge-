const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Define required environment variables
// We'll make JWT_SECRET and JWT_EXPIRE optional with defaults
const requiredEnvVars = [
  // We'll check these individually below
];

// Check for missing required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Set default values for JWT if not provided
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not defined in environment. Using default value for development only.');
  process.env.JWT_SECRET = 'scholarbridge-development-secret-key';
}

if (!process.env.JWT_EXPIRE) {
  console.warn('Warning: JWT_EXPIRE not defined in environment. Using default value of 30 days.');
  process.env.JWT_EXPIRE = '30d';
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
    expire: process.env.JWT_EXPIRE,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'your-app-password',
    from: process.env.EMAIL_FROM || 'noreply@scholarbridge.com'
  },
  
  // Stripe payment configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret'
  },
  
  // Frontend URL for CORS and email links
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Cache configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    host: process.env.CACHE_HOST,
    port: process.env.CACHE_PORT,
    password: process.env.CACHE_PASSWORD
  },
  
  // Feature flags
  features: {
    achPayments: process.env.FEATURE_ACH_PAYMENTS === 'true' || false
  }
}; 