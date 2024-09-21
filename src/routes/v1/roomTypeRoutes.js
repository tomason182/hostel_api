const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const {
  sanitizeCreateBody,
  sanitizeUpdateBody,
} = require("../../schemas/room_typeSchema");
const router = express.Router();
// Require Room Type controller
const room_type_controller = require("../../controllers/roomTypeController");

/// ROOM TYPE ROUTES ///

// Create a new room type
router.post(
  "/create",
  authMiddleware,
  rbacMiddleware.checkPermission("create_room_type"),
  sanitizeCreateBody,
  room_type_controller.room_type_create
);
// Read room types
router.get(
  "/",
  authMiddleware,
  rbacMiddleware.checkPermission("read_room_type"),
  room_type_controller.room_types_read
);
router.get(
  "/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("read_room_type"),
  room_type_controller.room_type_read
);
// Update room types
router.put(
  "/update/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("update_room_type"),
  sanitizeUpdateBody,
  room_type_controller.room_type_update
);
// Delete a room type
router.delete(
  "/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("delete_room_type"),
  room_type_controller.room_type_delete
);

module.exports = router;
