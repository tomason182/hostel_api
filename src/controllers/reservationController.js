const reservationSchema = require("../schemas/reservationSchema");
const Reservation = require("../models/reservationModel");
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const { ObjectId } = require("mongodb");
const conn = require("../config/db_config");

// Enviroment variables
const dbname = process.env.DB_NAME;

// @desc      Create a new reservation
// @route     POST /api/v1/reservations/create
// @access    Private

// @desc      Get an specific reservation
// @route     POST /api/v1/reservations/:id
// @access    Private

// @desc      Update an specific reservation
// @route     PUT /api/v1/reservations/:id
// @access    Private

// @desc      Delete an specific reservation
// @route     DELETE /api/v1/reservations/:id
// @access    Private
