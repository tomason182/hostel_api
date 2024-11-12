const http = require("node:http");

function fetchDataHelper(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
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
          const parsedData = JSON.parse(rawData);
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

    // Send request
    req.end();
  });
}
