require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;

// Create mongo client instance
const client = new MongoClient(uri);

// Database information
const dbname = process.env_DB_NAME;
const collection_names = ["users", "properties", "access_control"];

const usersCollection = client.db(dbname).collection(collection_names[0]);

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log(`Connected to database`);
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
    process.exit(1);
  }
};

module.exports = { connectToDatabase, usersCollection };
