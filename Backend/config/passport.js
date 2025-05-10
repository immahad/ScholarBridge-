const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const config = require('./env');

/**
 * JWT Strategy Configuration
 * This strategy authenticates users based on JWT tokens in the Authorization header
 */
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
  issuer: 'scholarship-management-system',
  audience: 'sms-users'
};

/**
 * Initialize Passport Configuration
 * @param {Object} app - Express application
 */
const initializePassport = (app) => {
  // JWT Strategy for token-based authentication
  passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Find user by ID from JWT payload
      const user = await User.findById(payload.userId).select('-password');
      
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      
      if (!user.isActive) {
        return done(null, false, { message: 'User account is deactivated' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
  
  // Initialize Passport
  app.use(passport.initialize());
};

module.exports = initializePassport; 