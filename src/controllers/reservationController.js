const reservationSchema = require("../schemas/reservationSchema");
const Reservation = require("../models/reservationModel");
const reservationHelper = require("../utils/reservationHelpers");
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");

const conn = require("../config/db_config");

// Enviroment variables
const dbname = process.env.DB_NAME;

// @desc      Create a new reservation
// @route     POST /api/v1/reservations/create
// @access    Private
exports.reservation_create = [
  checkSchema(reservationSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const propertyId = req.user._id;

      const {
        guest_id,
        room_type_id,
        booking_source,
        check_in,
        check_out,
        number_of_guest,
        total_price,
        currency,
        reservation_status,
        payment_status,
        special_request,
      } = matchedData(req);

      const newReservation = new Reservation(
        propertyId,
        guest_id,
        room_type_id,
        booking_source,
        check_in,
        check_out,
        number_of_guest,
        total_price,
        currency,
        reservation_status,
        payment_status,
        special_request
      );

      const client = conn.getClient();

      const result = reservationHelper.insertNewReservation(
        client,
        dbname,
        newReservation
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc      Get an specific reservation
// @route     POST /api/v1/reservations/:id
// @access    Private

// @desc      Update an specific reservation
// @route     PUT /api/v1/reservations/:id
// @access    Private

// @desc      Delete an specific reservation
// @route     DELETE /api/v1/reservations/:id
// @access    Private
