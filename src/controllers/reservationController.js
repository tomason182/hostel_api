const {
  reservationSchema,
  updateReservationInfo,
  updateDateAndGuestSchema,
  updateReservationStatus,
  updatePaymentStatus,
} = require("../schemas/reservationSchema");
const Reservation = require("../models/reservationModel");
const reservationHelper = require("../utils/reservationHelpers");
const parseDateHelper = require("../utils/parseDateHelper");
const availability_helpers = require("../utils/availability_helpers");
const crudOperations = require("../utils/crud_operations");
const {
  checkSchema,
  validationResult,
  matchedData,
  param,
} = require("express-validator");
const { ObjectId } = require("mongodb");

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

      if (checkOut < checkIn) {
        throw new Error("Check out can not be less than check in");
      }

      const client = conn.getClient();

      const isAvailable = await availability_helpers.checkAvailability(
        client,
        dbname,
        roomTypeId,
        checkIn,
        checkOut,
        number_of_guest
      );

      if (isAvailable === false) {
        throw new Error("No bed available for the selected dates");
      }

      // Si hay cama disponible creamos la reserva. Sin asignarle todavia una cama.
      const result = await reservationHelper.insertNewReservation(
        client,
        dbname,
        newReservation
      );

      await availability_helpers.bedsAssignment(
        client,
        dbname,
        roomTypeId,
        newReservation
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Get property reservations from date range - Simple query
// @route   GET /api/v1/reservations/simple/:from-:to
// @access  Private
exports.reservations_get_date_range_simple = [
  param("from")
    .trim()
    .escape()
    .isISO8601()
    .withMessage("Not a valid ISO8601 date format"),
  param("to")
    .trim()
    .escape()
    .isISO8601()
    .withMessage("Not a valid ISO8601 date format"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json(errors);
      }

      const propertyId = req.user._id;
      const from = req.params.from;
      const to = req.params.to;

      const fromDate = parseDateHelper.parseDateOnlyNumbers(from);
      const toDate = parseDateHelper.parseDateOnlyNumbers(to);

      if (fromDate > toDate) {
        throw new Error("Dates are in reverse order");
      }

      const client = conn.getClient();

      const reservationList =
        await reservationHelper.findReservationByDateRangeSimple(
          client,
          dbname,
          propertyId,
          fromDate,
          toDate
        );

      return res.status(200).json(reservationList);
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

      const fromDate = parseDateHelper.parseDateOnlyNumbers(from);
      const toDate = parseDateHelper.parseDateOnlyNumbers(to);

      if (fromDate > toDate) {
        throw new Error("Dates are in reverse order");
      }

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
        console.log(reservationsList);

      return res.status(200).json(reservationsList);
    } catch (err) {
      next(err);
    }
  },
];

// @desc      Update reservation dates & guest
// @route     PUT /api/v1/reservations/dates-and-guest/:id
// @access    Private
exports.reservation_dates_and_numberOfGuest_update = [
  checkSchema(updateDateAndGuestSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const propertyId = req.user._id;
      const reservationId = ObjectId.createFromHexString(req.params.id);

      const { check_in, check_out, number_of_guest } = matchedData(req);

      const checkIn = parseDateHelper.parseDateWithHyphen(check_in);
      const checkOut = parseDateHelper.parseDateWithHyphen(check_out);

      if (checkOut < checkIn) {
        throw new Error("Check in can not be greater than check out");
      }

      const client = conn.getClient();

      const reservationResult =
        await reservationHelper.findReservationByIdSimple(
          client,
          dbname,
          propertyId,
          reservationId
        );

      if (!reservationResult) {
        throw new Error("Reservation id not found");
      }

      const roomTypeId = reservationResult.room_type_id;

      const UpdatedReservationResult =
        await reservationHelper.updateReservationDatesAndGuest(
          client,
          dbname,
          propertyId,
          reservationId,
          roomTypeId,
          checkIn,
          checkOut,
          number_of_guest
        );

      const updatedReservation =
        await reservationHelper.findReservationByIdSimple(
          client,
          dbname,
          propertyId,
          reservationId
        );

      console.log(updatedReservation);

      await availability_helpers.bedsAssignment(
        client,
        dbname,
        roomTypeId,
        updatedReservation
      );

      return res.status(200).json(UpdatedReservationResult);
    } catch (err) {
      next(err);
    }
  },
];

// @desc      Update reservation status
// @route     PUT /api/v1/reservations/status/:id
// @access    Private
exports.reservations_update_status_put = [
  checkSchema(updateReservationStatus),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const propertyId = req.user._id;
      const { id, reservation_status } = matchedData(req);

      const reservationId = ObjectId.createFromHexString(id);

      const client = conn.getClient();
      const result = await reservationHelper.handleReservationStatus(
        client,
        dbname,
        propertyId,
        reservationId,
        reservation_status
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc      Update reservation payment status
// @route     PUT /api/v1/reservations/payment_status/:id
// @access    Private
exports.reservation_update_payment_put = [
  checkSchema(updatePaymentStatus),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const propertyId = req.user._id;

      const { id, payment_status } = matchedData(req);
      const reservationId = ObjectId.createFromHexString(id);
      const client = conn.getClient();

      const result = await reservationHelper.handleReservationPaymentStatus(
        client,
        dbname,
        propertyId,
        reservationId,
        payment_status
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc      Update an specific reservation
// @route     PUT /api/v1/reservations/:id
// @access    Private
exports.reservation_update_info_put = [
  checkSchema(updateReservationInfo),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const propertyId = req.user._id;

      const { id, ...data } = matchedData(req);

      const reservationId = ObjectId.createFromHexString(id);
      const client = conn.getClient();
      const result = await reservationHelper.updateReservationInfo(
        client,
        dbname,
        propertyId,
        reservationId,
        data
      );

      return res.status(200).json(`${result.modifiedCount} document updated`);
    } catch (err) {
      next(err);
    }
  },
];

// @desc      Get an specific reservation
// @route     GET /api/v1/reservations/:id
// @access    Private
exports.reservation_find_by_id_get = [
  param("id")
    .trim()
    .escape()
    .isMongoId()
    .withMessage("Param is not a valid mongoID"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(200).json(errors.array());
      }

      const propertyId = req.user._id;
      const id = req.params.id;
      const reservationId = ObjectId.createFromHexString(id);

      const client = conn.getClient();
      const result = await reservationHelper.findReservationById(
        client,
        dbname,
        propertyId,
        reservationId
      );

      return res.status(200).json(result[0]);
    } catch (err) {
      next(err);
    }
  },
];

// @desc      Update reservations bed
// @route     GET /api/v1/reservations/check-in/assign-beds
// @access    Private
exports.reservations_assign_beds_put = async (req, res, next) => {
  try {
    const propertyId = req.user._id;

    const client = conn.getClient();
    const year = new Date().getUTCFullYear();
    const month = new Date().getMonth();
    const day = new Date().getDate();
    const today = new Date(year, month, day);

    // Obtener los tipos de cuarto de la propiedad
    const roomTypes = await crudOperations.findAllRoomTypesByPropertyId(
      client,
      dbname,
      propertyId
    );

    // traemos todas las reservas que caigan en el rango de hoy.
    const reservationsList =
      await reservationHelper.findReservationByDateRangeSimple(
        client,
        dbname,
        propertyId,
        today,
        today
      );

    // Asignarmos las camas a las reservas que no tienen asignacion.
    const response = availability_helpers.bedsAssignment(
      client,
      dbname,
      roomTypes,
      reservationsList
    );

    return res.status(200).json(response.msg);
  } catch (err) {
    next(err);
  }
};

// @desc      Get the latest 10 reservations
// @route     GET /api/v1/reservations/last-10-reservations
// @access    Private
exports.last_10_reservations = async (req, res, next) => {
    try {
      const propertyId = req.user._id;

      const client = conn.getClient();
      const result = await reservationHelper.findLast10Reservations(
        client,
        dbname,
        propertyId
      );

      console.log(result);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };


// @desc      Get reservations by guest name
// @route     GET /api/v1/reservations/?name=value
// @access    Private

// @desc      Get reservations by room type
// @route     GET /api/v1/reservations/:room-type
// @access    Private

// @desc      Delete an specific reservation
// @route     DELETE /api/v1/reservations/:id
// @access    Private
