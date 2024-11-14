const { MongoClient } = require('mongodb');
require('dotenv').config();  // Load environment variables from .env file

let client;
async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
  }
  return client;
}

async function getDatabase() {
  const client = await connectToDatabase();
  return client.db('test');
}

module.exports = { getDatabase };