const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// require Guest controller
const guestController = require("../../controllers/guestController");

/// Guest routes ///

// @desc    Create a new Guest
// @route   POST /api/v1/guests/create
// @access  Private
router.post("/create", authMiddleware, guestController.guest_create_post);

// @desc    Get a Guest
// @route   GET /api/v1/guests/:id
// @access  Private

// @desc    Update a Guest
// @route   PUT /api/v1/guests/:id
// @access  Private

// @desc    Delete a guest
// @route   DELETE /api/v1/guests/:id

module.exports = router;
