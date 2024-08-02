const express = require("express");
const auth = require("../../middlewares/authMiddleware");
const router = express.Router();

// Require Property controller
const property_controller = require("../../controllers/propertyController");

/// PROPERTY ROUTES ///

// Create a property
router.post("/", property_controller.property_create);

// Get a property details
router.get("/:id_property", property_controller.property_details_get);

// Update a property details
router.put("/:id_property", property_controller.property_details_update);

// Delete a property
router.delete("/:id_property", auth, property_controller.property_delete);

module.exports = router;
