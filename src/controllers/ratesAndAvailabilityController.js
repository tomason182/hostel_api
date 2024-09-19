require("dotenv").config();
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const {
  ratesAndAvailabilitySchema,
} = require("../schemas/ratesAndAvailabilitySchema");
const conn = require("../config/db_config");
const RatesAndAvailability = require("../models/ratesAndAvailabilityModel");

// Environment variable
const db = process.env.DB_NAME;

// @desc Get rates and availability for specific data range
// @routes GET /api/v1/rates_availability/:from-:to
// @access Private

exports.rates_availability_get = async (req, res, next) => {
  try {
  } catch (err) {}
};
