const { MongoClient } = require('mongodb'); //Imports the MongoClient class from the official mongodb Node.js driver
require('dotenv').config(); //Loads environment variables from a .env file into process.env

const client = new MongoClient(process.env.MONGO_URI); //MongoDB client instance used from the MONGU_URI in env variable
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('taskmanager'); 
  }
  return db;
}

module.exports = connectDB; //connectDB can now be used in other files within the project
