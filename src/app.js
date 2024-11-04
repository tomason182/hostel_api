require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");

// Require Errors middleware
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

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

const app = express();

require("./config/passport")(passport);  //Importo la función de "./config/passport" y le paso como argumento
                                         // el "passport" de node_modules. En resumen aquí, le digo al "passport"
                                         // de node_modules que use la estrategia que hice yo en "./config/passport"

app.use(logger("dev"));
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
app.use(errorHandler);
module.exports = app;
