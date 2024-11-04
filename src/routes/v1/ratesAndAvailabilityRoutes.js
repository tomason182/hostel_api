const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// Required Rates and Availability controller

const ratesAndAvailabilityController = require("../../controllers/ratesAndAvailabilityController");

/// RATES AND AVAILABILITY ROUTES ///

// @desc Add a new rate and availability range
// @route POST /api/v1/rates_availability/create/:id
// @access Private
router.post(
  "/create/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("create_rates_availability"),
  ratesAndAvailabilityController.rates_and_availability_new_post
);

// @desc get rates and availability for date range
// @route GET /api/v1/rates_and_availability/:from-:to
// @access Private

// @desc update rates and availability for date range
// @route PUT /api/v1/rates_availability/
// @access Private

module.exports = router;
