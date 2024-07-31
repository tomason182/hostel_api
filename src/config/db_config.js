require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;

// Create mongo client instance
const client = new MongoClient(uri);

// Database name
const dbname = process.env.NODE_ENV === "test" ? "test" : process.env.DB_NAME;
// Data collections
const usersCollection = client.db(dbname).collection("users");

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log(`Connected to database ${dbname}`);
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
    process.exit(1);
  }
};

const closeConn = async () => {
  await client.close();
  console.log("connection Close");
};

module.exports = { connectToDatabase, usersCollection, closeConn };
