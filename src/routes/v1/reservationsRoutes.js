const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// require reservation controller
const reservationController = require("../../controllers/reservationController");

/// Reservation Routes ///

// @desc Create a new reservation
// @route POST /api/v1/reservations/create
// @access Private
router.post(
  "/create",
  authMiddleware,
  rbacMiddleware,
  reservationController.reservation_create
);
