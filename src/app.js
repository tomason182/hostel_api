require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const cors = require("cors");

// Require Errors middleware
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Require routes
const userRoutes = require("./routes/v1/userRoutes");
const propertyRoutes = require("./routes/v1/propertyRoutes");
const guestRoutes = require("./routes/v1/guestRoutes");
const roomTypeRoutes = require("./routes/v1/roomTypeRoutes");

const app = express();

require("./config/passport")(passport);

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static(path.join(__dirname, "public")));

// Use routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/guests", guestRoutes);
app.use("/api/v1/room-types", roomTypeRoutes);

// Use Error middleware
app.use(notFound);
app.use(errorHandler);
module.exports = app;
