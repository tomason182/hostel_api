const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// Require User controller
const user_controller = require("../../controllers/userController");

/// USER ROUTES ///

// Register a new user
router.post("/register", user_controller.user_register);

// Create a new user
router.post(
  "/create",
  authMiddleware,
  rbacMiddleware.checkPermission("create_user"),
  user_controller.user_create
);

// Authenticate a user
router.post("/auth", user_controller.user_auth);

// Logout a user
router.post("/logout", user_controller.user_logout);

// Get user profile
router.get(
  "/profile/",
  authMiddleware,
  rbacMiddleware.checkPermission("read_profile"),
  user_controller.user_profile_get
);

// Update user profile
router.put(
  "/profile/",
  authMiddleware,
  rbacMiddleware.checkPermission("update_profile"),
  user_controller.user_profile_put
);

// Delete user profile
router.delete(
  "/profile/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("delete_profile"),
  user_controller.user_profile_delete
);

module.exports = router;
