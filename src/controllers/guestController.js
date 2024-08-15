const guestSchema = require("../schemas/guestSchema");
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const conn = require("../config/db_config");

// Environment variables
const dbname = process.env.DB_NAME;

// @desc    Create a new Guest
// @route   POST /api/v1/guests/create
// @access  Private
exports.guest_create_post = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};
