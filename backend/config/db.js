const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database, with fallback to an in-memory database if offline.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/instainvoice';
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary MongoDB connection failed: ${error.message}`);
    console.log('Attempting to fall back to in-memory MongoDB database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB Server started at: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`In-memory MongoDB connection failed: ${fallbackError.message}`);
      process.exit(1); // Exit process with failure
    }
  }
};

module.exports = connectDB;

