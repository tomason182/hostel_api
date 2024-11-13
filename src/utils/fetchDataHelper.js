const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");

function fetchDataHelper(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    // Parse the URL
    const parseUrl = new URL(url);
    const protocolModule = parseUrl.protocol === "https:" ? https : http;
    const requestOptions = {
      hostname: parseUrl.hostname,
      path: parseUrl.pathname + parseUrl.search,
      port: parseUrl.port || (parseUrl.protocol === "https:" ? 443 : 80),
      ...options, // Headers, methods, etc.
    };

    const req = protocolModule.request(requestOptions, res => {
      const { statusCode } = res;
      const contentType = res.headers["content-type"];

      let error;

      if (statusCode !== 200) {
        error = new Error(`Request Failed. Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(
          "Invalid content-type" +
            `Expected application/json but received ${contentType}`
        );
      }

      if (error) {
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        reject(error);
        return;
      }

      res.setEncoding("utf-8");

      let rawData = "";
      res.on("data", chunk => {
        console.log(`BODY: ${chunk}`);
        rawData += chunk;
      });
      res.on("end", () => {
        try {
          // Attemp to parse JSON if content-type is JSON, else raw data.
          const parsedData =
            contentType && contentType.includes("application/json")
              ? JSON.parse(rawData)
              : rawData;
          resolve(parsedData);
        } catch (e) {
          reject(new Error("Failed to parse JSON: " + e.message));
        }
      });
    });

    // Handle network errors
    req.on("error", e => {
      reject(new Error("Error on fetch: " + e.message));
    });

    if (bodyData) {
      req.write(bodyData);
    }

    // Send request
    req.end();
  });
}

module.exports = fetchDataHelper;
