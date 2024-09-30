const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// require reservation controller
const reservationController = require("../../controllers/reservationController");

/// Reservation Routes ///

// @desc Create a new reservation
// @route POST /api/v1/reservations/new
// @access Private
router.post(
  "/new",
  authMiddleware,
  rbacMiddleware.checkPermission("create_reservation"),
  reservationController.reservation_create
);

// @desc Get property reservations from date range
// @router GET /api/v1/reservations/find/:from-:to
// @access Private
router.get(
  "/find/:from-:to-:full_name",
  authMiddleware,
  reservationController.reservation_get_date_range
);

module.exports = router;
