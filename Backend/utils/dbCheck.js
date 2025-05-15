const mongoose = require('mongoose');

/**
 * Utility to check database connection and collection status
 */
const checkDatabaseConnection = async () => {
  try {
    // Check if connected
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Current state:', mongoose.connection.readyState);
      return {
        connected: false,
        error: 'Database not connected',
        readyState: mongoose.connection.readyState
      };
    }

    // Check connection details
    const connectionDetails = {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: await mongoose.connection.db.listCollections().toArray()
    };

    console.log('Database connection information:', {
      connected: true,
      host: connectionDetails.host,
      databaseName: connectionDetails.name,
      collectionsCount: connectionDetails.collections.length,
      collections: connectionDetails.collections.map(c => c.name)
    });

    // Check Scholarship collection
    const Scholarship = mongoose.model('Scholarship');
    const scholarshipCount = await Scholarship.countDocuments();
    
    console.log(`Scholarship collection contains ${scholarshipCount} documents`);
    
    // Get a sample scholarship if any exist
    if (scholarshipCount > 0) {
      const sample = await Scholarship.findOne().lean();
      console.log('Sample scholarship:', sample);
    }

    return {
      connected: true,
      databaseName: connectionDetails.name,
      collections: connectionDetails.collections.map(c => c.name),
      scholarshipCount
    };
  } catch (error) {
    console.error('Error checking database connection:', error);
    return {
      connected: false,
      error: error.message
    };
  }
};

module.exports = {
  checkDatabaseConnection
}; 