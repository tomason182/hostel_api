const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// Require User controller
const user_controller = require("../../controllers/userController");

/// USER ROUTES ///

// Register a new user
router.post("/register", user_controller.user_register);

router.get("/confirm-email/:token", user_controller.finish_user_register);

// Create a new user
router.post(
  "/create",
  authMiddleware,
  rbacMiddleware.checkPermission("create_user"),
  user_controller.user_create
);

// Authenticate a user
router.post("/auth", user_controller.user_auth);

// Validate cookie
router.get("/validate", user_controller.user_validate);

// Logout a user
router.get("/logout", user_controller.user_logout);

// Get user profile --> hay que corregir
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

// Edit user profile
router.put(
  "/profile/edit/:id",
  authMiddleware,
  user_controller.user_edit_profile
);

// Delete user profile
router.delete(
  "/profile/delete/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("delete_profile"),
  user_controller.user_profile_delete
);

router.get("/all", authMiddleware, user_controller.user_get_all);

// Update user password
router.put(
  "/profile/change-pass/",
  authMiddleware,
  rbacMiddleware.checkPermission("update_password"),
  user_controller.user_changePasswd_put
);

// Update forgotten user password
router.post(
  "/reset-password/init-change-pass/",
  user_controller.forgotten_user_password
);

router.put(
  "/reset-password/finish-change-pass/:token",
  user_controller.finish_forgotten_user_password
);

module.exports = router;
