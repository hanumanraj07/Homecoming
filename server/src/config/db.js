const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// No standalone MongoDB is installed on this machine, so local dev uses mongodb-memory-server —
// but pointed at a fixed on-disk folder instead of a random temp directory. Despite the package
// name, it manages a real bundled mongod; giving it a stable dbPath makes the data files it
// writes survive a backend restart, which a temp dir (the default) does not. This is what was
// silently wiping every signed-up user/contact/journey on every restart.
const PERSISTENT_DB_PATH = path.join(__dirname, '..', '..', '.mongo-data');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (mongoUri.includes('localhost')) {
      console.log(`Starting local MongoDB (data persisted at ${PERSISTENT_DB_PATH})...`);
      fs.mkdirSync(PERSISTENT_DB_PATH, { recursive: true });
      const mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: PERSISTENT_DB_PATH,
          storageEngine: 'wiredTiger',
          dbName: 'homecoming',
        },
      });
      mongoUri = mongoServer.getUri('homecoming');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
