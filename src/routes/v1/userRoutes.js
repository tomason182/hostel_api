const express = require("express");
const router = express.Router();

// Require User controller
const user_controller = require("../../controllers/userController");

/// USER ROUTES ///

// Create a user
router.post("/", user_controller.user_create);

module.exports = router;
