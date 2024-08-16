const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// require Guest controller
const guestController = require("../../controllers/guestController");
const auth = require("../../middlewares/authMiddleware");

/// Guest routes ///

// @desc    Create a new Guest
// @route   POST /api/v1/guests/create
// @access  Private
router.post("/create", authMiddleware, guestController.guest_create_post);

// @desc    Get a Guest by query search
// @route   GET /api/v1/guests/find/?q=
// @access  Private
router.get("/find/", authMiddleware, guestController.guest_get_one);

// @desc    Update a Guest
// @route   PUT /api/v1/guests/:id
// @access  Private
router.put("/:id", authMiddleware, guestController.guest_update_one);

// @desc    Delete a guest
// @route   DELETE /api/v1/guests/:id
// @access  Private
router.delete("/:id", authMiddleware, guestController.guest_delete_one);

module.exports = router;
