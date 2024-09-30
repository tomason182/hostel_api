const reservationSchema = require("../schemas/reservationSchema");
const Reservation = require("../models/reservationModel");
const reservationHelper = require("../utils/reservationHelpers");
const parseDateHelper = require("../utils/parseDateHelper");
const {
  checkSchema,
  validationResult,
  matchedData,
  param,
} = require("express-validator");

const conn = require("../config/db_config");
const { checkAvailability } = require("../utils/availability_helpers");

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

      const property_id = req.user._id;

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
        property_id,
        room_type_id,
        booking_source,
        number_of_guest,
        total_price,
        currency,
        reservation_status,
        payment_status,
        special_request
      );

      newReservation.setDates(check_in, check_out);

      const roomTypeId = newReservation.getRoomTypeId();

      const checkIn = parseDateHelper.parseDateWithHyphen(check_in);
      const checkOut = parseDateHelper.parseDateWithHyphen(check_out);

      const client = conn.getClient();

      const availableBeds = await checkAvailability(
        client,
        dbname,
        roomTypeId,
        checkIn,
        checkOut,
        number_of_guest
      );

      if (availableBeds === false) {
        throw new Error("No bed available for the selected dates");
      }

      newReservation.setAssignedBeds(availableBeds, number_of_guest);

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
exports.reservation_get_date_range = [
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
  param("full_name").trim().escape().optional(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const propertyId = req.user._id;
      const from = req.params.from;
      const to = req.params.to;
      const fullName = req.params.full_name;

      console.log(fullName);

      const fromDate = parseDateHelper.parseDateOnlyNumbers(from);
      const toDate = parseDateHelper.parseDateOnlyNumbers(to);

      const client = conn.getClient();

      const reservationsList =
        await reservationHelper.findReservationsByDateRange(
          client,
          dbname,
          propertyId,
          fromDate,
          toDate,
          fullName
        );

      return res.status(200).json(reservationsList);
    } catch (err) {
      next(err);
    }
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
