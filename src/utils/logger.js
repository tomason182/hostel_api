const winston = require("winston");
const path = require("path");

const backendLogDir = path.join(__dirname, "logs/hostel_api");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(backendLogDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(backendLogDir, "combined.log"),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
