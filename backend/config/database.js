/**
 * DATABASE CONFIGURATION
 * This file establishes connection to MongoDB
 * ============================================
 */

// Import mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

/**
 * connectDB function - Establishes MongoDB connection
 * 
 * How it works:
 * 1. Uses async/await for asynchronous database connection
 * 2. Connects to MongoDB using URI from environment variable
 * 3. Returns connection object if successful
 * 4. Catches and logs any connection errors
 */
const connectDB = async () => {
  try {
    // Determine MongoDB URI, defaulting to the MediBook database when not provided
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Medibook';

    // mongoose.connect() - Attempts to connect to MongoDB
    // mongoURI - Uses environment variable if set, otherwise defaults to Medibook
    // useNewUrlParser & useUnifiedTopology - Use new connection methods for compatibility
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Ensure required collections exist before the app starts
    await ensureCollections(conn);

    // If connection successful, log success message with database name
    console.log(`✓ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // If connection fails, log the error and exit the application
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with error code 1
  }
};

// Ensure required MongoDB collections exist before the application starts
const ensureCollections = async (conn) => {
  const db = conn.connection.db;
  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((collection) => collection.name));
  const requiredCollections = ['users', 'appointments', 'hospitals'];

  for (const collectionName of requiredCollections) {
    if (!existingNames.has(collectionName)) {
      await db.createCollection(collectionName);
      console.log(`✓ Created MongoDB collection: ${collectionName}`);
    }
  }
};

// Export connectDB function so it can be used in server.js
module.exports = connectDB;
