require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const logger = require("../src/utils/logger");
const passport = require("passport");
<<<<<<< HEAD
=======
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Disable console.log in production
if (process.env.NODE_ENV === "production") {
  console.log = function () {};
}
>>>>>>> logger

// Require Errors middleware
const {
  notFound,
  errorLog,
  errorHandler,
} = require("./middlewares/errorMiddleware");

// Require routes
const userRoutes = require("./routes/v1/userRoutes");
const propertyRoutes = require("./routes/v1/propertyRoutes");
<<<<<<< HEAD
const guestRoutes = require("./routes/v1/guestRoutes");
const roomTypeRoutes = require("./routes/v1/roomTypeRoutes");
const reservationRoutes = require("./routes/v1/reservationsRoutes");
const ratesAndAvailabilityRoutes = require("./routes/v1/ratesAndAvailabilityRoutes");
=======
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb

// Define a stream object with a write function for morgan to use
const stream = {
  write: message => {
    logger.info(message.trim());
  },
};

const app = express();

// Compress all response
app.use(compression());

// Set up headers
app.use(helmet());

// set rate limit
// Limit each IP to 100 request per window.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

require("./config/passport")(passport);

<<<<<<< HEAD
app.use(logger("dev"));
=======
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("combined", { stream }));
>>>>>>> logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static(path.join(__dirname, "public")));
// Use routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/properties", propertyRoutes);
<<<<<<< HEAD
app.use("/api/v1/guests", guestRoutes);
app.use("/api/v1/room-types", roomTypeRoutes);
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/rates-and-availability", ratesAndAvailabilityRoutes);
=======
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb

// Use Error middleware
app.use(notFound);
app.use(errorLog);
app.use(errorHandler);

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", reason);
});
module.exports = app;
