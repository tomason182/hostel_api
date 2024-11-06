require("dotenv").config();
const logger = require("../utils/logger");
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;
const maxPoolSize = parseInt(process.env.MONGO_POOL_SIZE) || 100;
const connectTimeoutMS = parseInt(
  process.env.MONGO_CONNECT_TIMEOUT_MS || 30000
);

class MongoConnect {
  constructor() {
    this.client = new MongoClient(uri, {
      maxPoolSize,
      connectTimeoutMS,
    });
    this.isConnected = false;
  }

  async connectClient(retries = 3) {
    try {
      await this.client.connect();
      this.isConnected = true;
      logger.info("Connected to MongoDb");
    } catch (err) {
      logger.error("Connection error:", err.message);
      if (retries > 0) {
        console.log("Retrying connection");
        setTimeout(() => this.connectClient(), 5000);
      } else {
        logger.error("Max retries reached. Could not connect to MongoDB");
      }
    }
  }

  async closeClient() {
    if (!this.isConnected) return;
    try {
      await this.client.close();
      this.isConnected = false;
      logger.log("MongoDb connection close");
    } catch (err) {
      logger.error("Error closing connection", err);
    }
  }

  getClient() {
    if (!this.isConnected) {
      this.connectClient();
    }
    return this.client;
  }
}

const connect = new MongoConnect();

module.exports = connect;
