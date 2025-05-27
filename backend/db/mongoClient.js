const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db(); // Automatically uses the DB from MONGO_URI (e.g., 'taskmanager')
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.error('MongoDB connection failed:', err);
      throw err;
    }
  }
  return db;
}

module.exports = connectDB;
