require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const connect = require("../src/config/db_config");

// Require Errors middleware
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Require routes
const userRoutes = require("./routes/v1/userRoutes");
const propertyRoutes = require("./routes/v1/propertyRoutes");

const app = express();

require("./config/passport")(passport);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static(path.join(__dirname, "public")));
// Use routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/properties", propertyRoutes);

// Use Error middleware
app.use(notFound);
app.use(errorHandler);
module.exports = app;
