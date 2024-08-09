require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;
const poolSize = parseInt(process.env.MONGO_POOL_SIZE) || 10;
const connectTimeoutMS = parseInt(
  process.env.MONGO_CONNECT_TIMEOUT_MS || 30000
);

class Connect {
  constructor() {
    this.client = new MongoClient(uri, {
      poolSize,
      connectTimeoutMS,
    });
    this.isConnected = false;
  }

  async connectClient() {
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log("Connected to MongoDb");
    } catch (err) {
      console.error("Connection error:", err);
      setTimeout(() => this.connectClient(), 5000);
    }
  }

  async closeClient() {
    try {
      await this.client.close();
      this.isConnected = false;
    } catch (err) {
      console.error("Error closing connection", err);
    }
  }

  getClient() {
    if (!this.isConnected) {
      throw new Error("Client is not connected");
    }
    return this.client;
  }
}

const connect = new Connect();

module.exports = connect;
