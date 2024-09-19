const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// Required Rates and Availability controller

/// RATES AND AVAILABILITY ROUTES ///

// @desc get rates and availability for date range
// @route GET /api/v1/rates_and_availability/:from-:to
// @access Private

// @desc update rates and availability for date range
// @route PUT /api/v1/rates_availability/
// @access Private
