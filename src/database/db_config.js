require("dotenv").config();
const { MongoClient, MongoErrorLabel } = require("mongodb");
const uri = process.env.MONGO_URI;

// Create mongo client instance
const client = new MongoClient(uri);

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log(`Connected to database`);
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  }
};

module.exports = connectToDatabase;
