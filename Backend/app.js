const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const donorRoutes = require('./routes/donorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const triggerRoutes = require('./routes/triggerRoutes');

// Initialize Express app
const app = express();

// Configure environment
const isProduction = process.env.NODE_ENV === 'production';

// Apply security middleware
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));

// Request logging
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Parse request bodies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Compress responses
app.use(compression());

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for specific endpoints or in development
    return !isProduction;
  },
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', triggerRoutes);

// Root route for API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Scholarship Management System API is running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Debug route to see all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  // Collect all routes
  app._router.stack.forEach(middleware => {
    if (middleware.route) { // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods).join(', ')
      });
    } else if (middleware.name === 'router') { // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = handler.route.path;
          const basePath = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace('$', '');
            
          routes.push({
            path: basePath + path,
            methods: Object.keys(handler.route.methods).join(', ')
          });
        }
      });
    }
  });
  
  res.status(200).json({
    success: true,
    count: routes.length,
    routes
  });
});

// Special handling for verification URLs
app.get('/verify-email/:role/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

app.get('/verification-success', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

app.get('/verification-failed', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

// Serve React frontend for all unknown (non-API) routes (SPA fallback)
app.use(express.static(path.join(__dirname, '../Frontend/dist')));
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
  } else {
    res.status(404).json({ success: false, message: 'Resource not found' });
  }
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});
 
module.exports = app;
