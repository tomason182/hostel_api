const ratesAndAvailabilitySchema = {
  id: {
    in: ["params"],
    isMongoId: {
      bail: true,
      errorMessage: "Param is not a valid MongoID",
    },
    exists: {
      bail: true,
      errorMessage: "Reservation ID must be provided",
    },
  },
  start_date: {
    in: ["body"],
    trim: true,
    isISO8601: {
      strict: true,
      errorMessage: "Start date must be ISO8601 format",
    },
    exists: {
      bail: true,
      errorMessage: "Reservation ID must be provided",
    },
  },
  end_date: {
    in: ["body"],
    trim: true,
    isISO8601: {
      strict: true,
      errorMessage: "End date must be ISO8601 format",
    },
    exists: {
      bail: true,
      errorMessage: "Reservation ID must be provided",
    },
  },
  custom_rate: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "rate is required",
    },
    isFloat: {
      bail: true,
      errorMessage: "Rate must be a number",
    },
  },
  custom_availability: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
    isInt: {
      bail: true,
      errorMessage: "availability must be integer",
    },
  },
};

module.exports = {
  ratesAndAvailabilitySchema,
};
