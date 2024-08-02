const { MongoClient } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { setDb } = require("../config/db_config");

let database;
let client;
let mongod;

exports.dbConnect = async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    client = new MongoClient(uri);
    await client.connect(console.log("Connected to test db"));
    database = client.db("temp");
    setDb(database);
  } catch (err) {
    console.error(`Error connecting to test database: ${err}`);
    process.exit(1);
  }
};

exports.cleanData = async () => {
  if (database)
    try {
      await database.dropDatabase();
    } catch (err) {
      console.error("unable to drop test database");
    }
};

exports.dbDisconnect = async () => {
  try {
    await client.close();
    await mongod.stop();
    console.log("Close connection to test db");
  } catch (err) {
    console.error("Unable to close conn to test db");
    process.exit(1);
  }
};
