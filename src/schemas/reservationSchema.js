const reservationSchema = {
  guest_id: {
    in: ["body"],
    isMongoId: {
      bail: true,
      errorMessage: "Guest ID must be specified",
    },
  },
  guest_name: {
    in: ["body"],
    trim: true,
    escape: true,
  },
  room_type_id: {
    in: ["body"],
    isMongoId: {
      bail: true,
      errorMessage: "Room type ID must be specified",
    },
  },
  booking_source: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["booking.com", "hostelWorld.com", "direct"]],
      errorMessage:
        "Booking source must be one of: booking.com, hostelWorld, direct",
    },
  },
  check_in: {
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
  check_out: {
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
  number_of_guest: {
    in: ["body"],
    isInt: {
      bail: true,
      options: { min: 1, max: 100 },
      errorMessage: "Number of guest should be integer number",
    },
  },
  total_price: {
    in: ["body"],
    isFloat: {
      bail: true,
      options: { min: 1 },
      errorMessage: "Total price should be a decimal number",
    },
  },
  reservation_status: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Reservation status should be specified",
    },
    isIn: {
      options: [["confirmed", "provisional", "cancelled", "no_show"]],
    },
  },
  payment_status: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Payment status should be defined",
    },
    isIn: {
      options: [["pending", "canceled", "refunded", "paid", "partial"]],
    },
  },
  special_request: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
    isLength: {
      options: {
        max: 50,
      },
      errorMessage: "Special request maximum length is 50 characters",
    },
  },
};

module.exports = reservationSchema;
