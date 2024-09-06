const { ObjectId } = require("mongodb");

const reservationSchema = {
  guestId: {
    in: ["params"],
    isMongoId: {
      bail: true,
      errorMessage: "Guest ID must be specified",
    },
    customSanitizer: value => {
      ObjectId.isValid(value) ? ObjectId.createFromHexString(value) : value;
    },
  },
  roomTypeId: {
    in: ["params"],
    isMongoId: {
      bail: true,
      errorMessage: "Room type ID must be specified",
    },
    customSanitizer: value => {
      ObjectId.isValid(value) ? ObjectId.createFromHexString(value) : value;
    },
  },
  bookingSource: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["Booking.com", "HostelWorld.com", "other"]],
      errorMessage:
        "Booking source must be one of: Booking.com, HostelWorld, other",
    },
  },
  checkIn: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Check in date must be specified",
    },
    isISO8601: {
      strict: true,
      errorMessage: "Check in date must be ISO8601 format",
    },
  },
  checkOut: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Check out date must be specified",
    },
    isISO8601: {
      strict: true,
      errorMessage: "Check out date must be ISO8601 format",
    },
  },
  numberOfGuest: {
    in: ["body"],
    isInt: {
      bail: true,
      options: { min: 1, max: 1000 },
      errorMessage: "Number of guest should be integer number",
    },
  },
  reservations_status: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Reservation status should be specified",
    },
    isIn: {
      options: [["confirm", "provisional", "cancelled", "no_show"]],
    },
  },
  paymentStatus: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Payment status should be defined",
    },
    isIn: {
      options: [["pending", "canceled", "refunded", "paid", "partial"]],
    },
  },
  specialRequest: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
  },
};

module.exports = reservationSchema;
