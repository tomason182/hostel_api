const express = require("express");
const auth = require("../../middlewares/authMiddleware");
const router = express.Router();

// Require User controller
const user_controller = require("../../controllers/userController");

/// USER ROUTES ///

<<<<<<< HEAD
// Register a new user
router.post("/register", user_controller.user_register);

router.get("/confirm-email/:token", user_controller.finish_user_register);

// Resend email
router.post(
  "/resend-email-verification",
  user_controller.resend_email_verification
);

// Create a new user
router.post(
  "/create",
  authMiddleware,
  rbacMiddleware.checkPermission("create_user"),
  user_controller.user_create
);
=======
// Create a user
router.post("/", user_controller.user_create);
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb

// Authenticate a user
router.post("/auth", user_controller.user_auth);

// Validate cookie
router.get("/validate", user_controller.user_validate);

<<<<<<< HEAD
// Logout a user
router.get("/logout", user_controller.user_logout);

// Get user profile
router.get("/profile/", authMiddleware, user_controller.user_profile_get);
=======
// Get user profile
router.get("/profile/", auth, user_controller.user_profile_get);
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb

// Update user profile
router.put("/profile/", auth, user_controller.user_profile_put);

// Edit user profile
router.put(
  "/profile/edit/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("edit_profile"),
  user_controller.user_edit_profile
);

// Delete user profile
<<<<<<< HEAD
router.delete(
  "/profile/delete/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("delete_profile"),
  user_controller.user_profile_delete
);
=======
router.delete("/profile/:id", auth, user_controller.user_profile_delete);
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb

// Delete account
router.delete(
  "/accounts/delete/",
  authMiddleware,
  rbacMiddleware.checkPermission("delete_account"),
  user_controller.delete_account
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
