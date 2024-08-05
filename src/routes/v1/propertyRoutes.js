const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// Require Property controller
const property_controller = require("../../controllers/propertyController");

/// PROPERTY ROUTES ///

// Create a property
router.post(
  "/create",
  authMiddleware,
  rbacMiddleware.checkPermission("create_property"),
  property_controller.property_create
);

// Get a property details
router.get("/:id", authMiddleware, property_controller.property_details_get);

// Update a property details
router.put(
  "/:id",
  authMiddleware,
  rbacMiddleware.checkPermission("update_property"),
  property_controller.property_details_update
);

// Delete a property
router.delete(
  "/:id_property",
  authMiddleware,
  property_controller.property_delete
);

module.exports = router;
