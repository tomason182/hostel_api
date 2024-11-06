const reservationSchema = {
  guest_id: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Guest ID must be provided",
    },
    isMongoId: {
      bail: true,
      errorMessage: "Guest ID must be a valid mongoDb ID",
    },
  },
  room_type_id: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Room type ID must be provided",
    },
    isMongoId: {
      bail: true,
      errorMessage: "Room type ID must be a valid mongoDb ID",
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
    exists: {
      bail: true,
      errorMessage: "Total price must be provided",
    },
    isFloat: {
      bail: true,
      options: { min: 1 },
      errorMessage: "Total price should be a decimal number",
    },
  },
  currency: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Currency must be provided",
    },
    trim: true,
    escape: true,
  },
  reservation_status: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Reservation status should be specified",
    },
    isIn: {
      options: [["confirmed", "provisional", "canceled", "no_show"]],
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
        max: 150,
      },
      errorMessage: "Special request maximum length is 150 characters",
    },
  },
};

const updateReservationInfo = {
  id: {
    in: ["params"],
    isMongoId: {
      bail: true,
      errorMessage: "Reservation ID must be a valid mongoDB id",
    },
    exists: {
      bail: true,
      errorMessage: "Reservation ID must be provided",
    },
  },
  reservation_status: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Reservation status must be specified",
    },
    isIn: {
      options: [["confirmed", "provisional", "canceled", "no_show"]], // Can not change status of reservation marked as canceled or no_show
    },
  },
  payment_status: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Payment status must be specified",
    },
    isIn: {
      options: [["pending", "canceled", "refunded", "paid", "partial"]],
    },
  },
  total_price: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Total price must be provided",
    },
    isFloat: {
      bail: true,
      options: { min: 1 },
      errorMessage: "Total price should be a decimal number",
    },
  },
  currency: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Currency must be provided",
    },
    trim: true,
    escape: true,
  },
  booking_source: {
    in: ["body"],
    exists: {
      bail: true,
      errorMessage: "Booking source must be provided",
    },
    isIn: {
      options: [["booking.com", "hostelWorld.com", "direct"]],
    },
  },
  special_request: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
    isLength: {
      options: {
        max: 150,
      },
      errorMessage: "Special request maximum length is 150 characters",
    },
  },
};

const updateDateAndGuestSchema = {
  id: {
    in: ["params"],
    isMongoId: {
      bail: true,
      errorMessage: "Reservation ID must be a valid mongoDB id",
    },
    exists: {
      bail: true,
      errorMessage: "Reservation ID must be provided",
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
    exists: {
      bail: true,
      errorMessage: "Number of guest must be specified",
    },
    isInt: {
      bail: true,
      options: { min: 1 },
      errorMessage: "Number of guest must be a integer",
    },
  },
};

const updateReservationStatus = {
  id: {
    in: ["params"],
    isMongoId: {
      bail: true,
      errorMessage: "Param is not a valid MongoDb ID",
    },
  },
  reservation_status: {
    in: ["body"],
    isIn: {
      options: [["canceled", "no_show"]],
    },
  },
};

const updatePaymentStatus = {
  id: {
    in: ["params"],
    isMongoId: {
      bail: true,
      errorMessage: "Param is not a valid MongoDb ID",
    },
  },
  payment_status: {
    in: ["body"],
    isIn: {
      options: [["pending", "canceled", "refunded", "paid", "partial"]],
    },
  },
};

module.exports = {
  reservationSchema,
  updateReservationInfo,
  updateDateAndGuestSchema,
  updateReservationStatus,
  updatePaymentStatus,
};
