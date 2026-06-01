// Script to initialize MongoDB collections using mongoose
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Medibook';

const requiredCollections = ['users', 'appointments'];

const ensureCollections = async (db) => {
  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((c) => c.name));

  for (const name of requiredCollections) {
    if (!existingNames.has(name)) {
      await db.createCollection(name);
      console.log(`Created collection: ${name}`);
    } else {
      console.log(`Collection already exists: ${name}`);
    }
  }
};

(async () => {
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connection successful:', conn.connection.host);
    const db = conn.connection.db;
    await ensureCollections(db);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
})();
