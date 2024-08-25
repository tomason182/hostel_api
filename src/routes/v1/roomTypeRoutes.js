const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const rbacMiddleware = require("../../middlewares/rbacMiddleware");
const router = express.Router();
// Require Room Type controller
const room_type_controller = require("../../controllers/roomTypeController");


/// ROOM TYPE ROUTES ///

// Create a new room type
router.post("/create", authMiddleware, rbacMiddleware.checkPermission("create_room_type"), room_type_controller.room_type_create);


module.exports = router;