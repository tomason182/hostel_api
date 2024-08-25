require("dotenv").config();
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const roomTypeSchema = require("../schemas/room_typeSchema");
const conn = require("../config/db_config");
const RoomType = require("../models/roomTypeModel");
const crudOperations = require("../utils/crud_operations");


// Enviroment variables
const dbname = process.env.DB_NAME;

// @desc    Create new RoomType
// @route   POST /api/v1/room-types/create
// @access  Private
exports.room_type_create = [
  checkSchema(roomTypeSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }
      
      // Brings the MongoDB client 
      const client = conn.getClient();

      // Extract req values
      const { description, type, bathroom, max_occupancy, inventory, base_rate, currency } =
        matchedData(req);

      // Check if room_type exist in the database
      const roomTypeExist = await crudOperations.findOneRoomTypeByDescription(
        client,
        dbname,
        description
      );

      // If room type exist in the db, throw an error and add one inventory
      if (roomTypeExist !== null) {
        res.status(400);
        throw new Error("Room Type already exist");
      }

      const propertyId = req.user._id; // Capturo el objeto "user" que viene en el "request" que fue 
                                       // proporcionado por la estrategia. Donde el "_id" es el de la 
                                       // propiedad porque en la estrategía se trajo todo un registro de la 
                                       // colección 'properties' perteneciente a la BD 'hostel'.

      // create RoomType object
      const roomType = new RoomType( description, type, bathroom, max_occupancy, inventory, base_rate, currency );

      roomType.setPropertyID(propertyId);

      const result =
        await crudOperations.insertNewRoomType(
          client,
          dbname,
          roomType
        );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];