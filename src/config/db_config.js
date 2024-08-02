require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;

// Create mongo client instance
const client = new MongoClient(uri);
let db = null;

// Database name
const dbname = process.env.DB_NAME;
// Data collections
// const usersCollection = client.db(dbname).collection("users");

const connectToDatabase = async () => {
  try {
    if (db) return;
    await client.connect();
    db = client.db(dbname);
    console.log(`Connected to database ${dbname}`);
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
    process.exit(1);
  }
};

const setDb = (database) => {
  db = database;
};

const getDd = () => db;

const closeConn = async () => {
  try {
    await client.close();
    console.log("connection Close");
  } catch (err) {
    console.error("Unable to close conn to database");
    process.exit(1);
  }
};

module.exports = { connectToDatabase, closeConn, setDb, getDd };
