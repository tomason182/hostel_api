const express = require("express");
const auth = require("../../middlewares/authMiddleware");
const router = express.Router();

// Require User controller
const user_controller = require("../../controllers/userController");

/// USER ROUTES ///

// Create a user
router.post("/", auth, user_controller.user_create);

// Authenticate a user
router.post("/auth", user_controller.user_auth);

// Logout a user
router.post("/logout", user_controller.user_logout);

// Get user profile
router.get("/profile/:id", auth, user_controller.user_profile_get);

// Update user profile
router.put("/profile/:id", auth, user_controller.user_profile_put);

// Delete user profile
router.delete("/profile/:id", auth, user_controller.user_profile_delete);

module.exports = router;
