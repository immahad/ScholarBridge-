require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const config = require('./config/env');

// Set up MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
};

// Connect to MongoDB using local connection by default
mongoose.connect(config.db.uri, mongoOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB database at:', config.db.uri);
    startServer();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Create HTTP server
const server = http.createServer(app);

// Start the server
function startServer() {
  const PORT = config.port || 5000;
  
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM signal (e.g. Heroku shutdown)
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

// Export server for testing purposes
module.exports = server;
