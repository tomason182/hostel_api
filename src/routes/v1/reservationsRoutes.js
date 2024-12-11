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

// @desc    Get property reservations from date range - Simple query
// @route   GET /api/v1/reservations/simple/:from-:to
// @access  Private
router.get(
  "/simple/:from-:to",
  authMiddleware,
  reservationController.reservations_get_date_range_simple
);

// @desc Get property reservations from date range
// @router GET /api/v1/reservations/find/:from-:to
// @access Private
router.get(
  "/find/:from-:to-:full_name",
  authMiddleware,
  reservationController.reservation_get_date_range
);

// @desc Get reservation by id
// @router GET /api/v1/reservations/find/:id
router.get(
  "/find-by-id/:id",
  authMiddleware,
  reservationController.reservation_find_by_id_get
);

// @desc      Update reservation status
// @route     PUT /api/v1/reservations/status/:id
// @access    Private
router.put(
  "/status/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("update_reservation_status"),
  reservationController.reservations_update_status_put
);

// @desc    Update reservation payment status
// @route   PUT /api/v1/reservations/payment_status/:id
// @access  Private
router.put(
  "/payment_status/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("update_reservation_payment"),
  reservationController.reservation_update_payment_put
);

// @desc    Update reservation info
// @route   PUT /api/v1/reservations/update/:id
// @access  Private
router.put(
  "/update/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("update_reservation_info"),
  reservationController.reservation_update_info_put
);

// @desc    Update reservation date and guest
// @route   PUT /api/v1/reservations/update-dates-guest/:id
// @access  Private
router.put(
  "/update-dates-guest/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("update_reservation_date_guest"),
  reservationController.reservation_dates_and_numberOfGuest_update
);

// @desc      Update reservations bed
// @route     GET /api/v1/reservations/check-in/assign-beds
// @access    Private
router.get(
  "/check-in/assign-beds",
  authMiddleware,
  reservationController.reservations_assign_beds_put
);

// @desc      Find the latest 10 reservations
// @route     GET /api/v1/reservations/last-10-reservations
router.get(
  "/last-10-reservations",
  authMiddleware,
  reservationController.last_10_reservations
);

module.exports = router;
