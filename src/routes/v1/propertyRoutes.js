const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();

// Require Property controller
const property_controller = require("../../controllers/propertyController");

/// PROPERTY ROUTES ///

// Get a property details
router.get("/", authMiddleware, property_controller.property_details_get);

// Create and update a property
router.put(
  "/update",
  authMiddleware,
  rbacMiddleware.checkPermission("update_property"),
  property_controller.property_details_update
);

module.exports = router;
