require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Require Errors middleware
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Require routes
const userRoutes = require("./routes/v1/userRoutes");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Use routes
app.use("/api/v1/users", userRoutes);

// Use Error middleware
app.use(notFound);
app.use(errorHandler);
module.exports = app;
