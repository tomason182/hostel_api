const logger = require("../utils/logger");

// Error middleware for not found URL's
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorLog = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let msg = err.message;

  res.status(statusCode).json({
    msg,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorLog,
  errorHandler,
};
