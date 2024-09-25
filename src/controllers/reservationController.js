const reservationSchema = require("../schemas/reservationSchema");
const Reservation = require("../models/reservationModel");
const reservationHelper = require("../utils/reservationHelpers");
const {
  checkSchema,
  validationResult,
  matchedData,
  param,
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

      const result = await reservationHelper.insertNewReservation(
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

// @desc      Get property reservation by date range
// @route     GET /api/v1/reservation/:from-:to
// @access    Private
exports.reservation_get_data_range = [
  param("from")
    .trim()
    .escape()
    .isISO8601()
    .withMessage("not a valid ISO8601 date format"),
  param("to")
    .trim()
    .escape()
    .isISO8601()
    .withMessage("not a valid ISO8601 date format"),
  ,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const from = req.params.from;
      const fromYear = from.substring(0, 4);
      const fromMonth = from.substring(4, 6);
      const fromDay = from.substring(6, 8);

      const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
      fromDate.setHours(0, 0, 0, 0);
      const to = req.params.to;
    } catch (err) {}
  },
];

// @desc      Get an specific reservation
// @route     POST /api/v1/reservations/:id
// @access    Private

// @desc      Get reservations by guest name
// @route     GET /api/v1/reservations/?name=value
// @access    Private

// @desc      Get reservations by room type
// @route     GET /api/v1/reservations/:room-type
// @access    Private

// @desc      Update an specific reservation
// @route     PUT /api/v1/reservations/:id
// @access    Private

// @desc      Delete an specific reservation
// @route     DELETE /api/v1/reservations/:id
// @access    Private
