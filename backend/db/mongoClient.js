const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db(); // Uses the DB name from the URI (e.g., 'taskmanager')
      console.log('✅ MongoDB connected successfully');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err);
      throw err;
    }
  }
  return db;
}

module.exports = connectDB;
