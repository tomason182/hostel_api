require("dotenv").config();
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const {
  roomTypeSchema,
  updateRoomTypeSchema,
} = require("../schemas/room_typeSchema");
const conn = require("../config/db_config");
const RoomType = require("../models/roomTypeModel");
const RatesAndAvailability = require("../models/ratesAndAvailabilityModel");
const crudOperations = require("../utils/crud_operations");
const transactionOperations = require("../utils/transactions_operations");
const { ObjectId } = require("mongodb");
const Calendar = require("../models/calendarModel");

// Environment variables
const dbname = process.env.DB_NAME;

// @desc    Create new room type
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

      const property_id = req.user._id;

      // Brings the MongoDB client
      const client = conn.getClient();

      // Extract req values
      const {
        description,
        type,
        max_occupancy,
        inventory,
        base_rate,
        currency,
      } = matchedData(req);

      // Check if room type exist in the database
      const roomTypeExist = await crudOperations.findOneRoomTypeByDescription(
        client,
        dbname,
        description,
        property_id
      );

      // If room type exist in the db, throw an error
      if (roomTypeExist !== null) {
        res.status(400);
        throw new Error("Room Type already exist");
      }

      // create roomType object
      const roomType = new RoomType(
        description,
        type,
        max_occupancy,
        inventory,
        base_rate,
        currency
      );
      const room_type_id = new ObjectId();
      roomType.setPropertyID(property_id);
      roomType.set_ID(room_type_id);
      roomType.setProducts();

      // create rates and availability Object
      const ratesAndAvailability = new RatesAndAvailability();
      ratesAndAvailability.setRoomTypeId(room_type_id);

      // create calendar
      const roomList = roomType.products.flatMap(product => product.beds);
      const calendarList = roomList.map(room_id => {
        const calendar = new Calendar();
        calendar.setId(room_id);
        return calendar;
      });

      const result = await transactionOperations.insertRoomType(
        client,
        dbname,
        roomType,
        ratesAndAvailability,
        calendarList
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Reads all room types for a property id
// @route   GET /api/v1/room-types/
// @access  Private
exports.room_types_read = async (req, res, next) => {
  try {
    const propertyId = req.user._id;

    if (propertyId === null || propertyId === undefined) {
      res.status(401);
      throw new Error("Access denied. Property id not found");
    }

    // Brings the MongoDB client
    const client = conn.getClient();

    // Brings all room types from a specific property
    const roomTypesByProperty =
      await crudOperations.findAllRoomTypesByPropertyId(
        client,
        dbname,
        propertyId
      );

    if (roomTypesByProperty === null) {
      res.status(400);
      throw new Error("No room types found that belong to this property");
    }

    return res.status(200).json(roomTypesByProperty);
  } catch (err) {
    next(err);
  }
};

// @desc    Reads a room type through its identifier.
// @route   GET /api/v1/room-types/##### string hexa desde un ObjectId #######
// @access  Private
exports.room_type_read = async (req, res, next) => {
  try {
    const capId = req.params.id;
    if (!ObjectId.isValid(capId)) {
      res.status(401);
      throw new Error(
        "The submitted id is not a hexadecimal value generated by MongoDB"
      );
    }

    const roomTypeId = ObjectId.createFromHexString(capId);
    console.log(roomTypeId);

    // Brings the MongoDB client
    const client = conn.getClient();

    // Brings the room type corresponding to the provided id
    const roomTypeFound = await crudOperations.findRoomTypeById(
      client,
      dbname,
      roomTypeId
    );

    if (roomTypeFound === null) {
      res.status(400);
      throw new Error("This room type does not exist in the Database");
    }

    return res.status(200).json(roomTypeFound);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a room type in the Database.
// @route   PUT /api/v1/room-types/update/##### string hexa desde un ObjectId #######
// @access  Private
exports.room_type_update = [
  checkSchema(updateRoomTypeSchema),
  async (req, res, next) => {
    try {
      const capId = req.params.id;
      if (!ObjectId.isValid(capId)) {
        res.status(401);
        throw new Error(
          "The submitted id is not a hexadecimal value generated by MongoDB"
        );
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const roomTypeId = ObjectId.createFromHexString(capId);
      console.log(roomTypeId);

      // Brings the MongoDB client
      const client = conn.getClient();

      // Extract req values
      const {
        description,
        type,
        bathroom,
        max_occupancy,
        inventory,
        base_rate,
        currency,
      } = matchedData(req);

      // Updates a room type based on its id
      const updatedRoomType = await crudOperations.updateRoomTypeById(
        client,
        dbname,
        roomTypeId,
        description,
        type,
        bathroom,
        max_occupancy,
        inventory,
        base_rate,
        currency
      );

      if (updatedRoomType === null) {
        res.status(400);
        throw new Error("The update could not be done");
      }

      return res.status(200).json(updatedRoomType);
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Delete a room type through its identifier.
// @route   DELETE /api/v1/room-types/##### string hexa desde un ObjectId #######
// @access  Private
exports.room_type_delete = async (req, res, next) => {
  try {
    const capId = req.params.id;
    if (!ObjectId.isValid(capId)) {
      res.status(401);
      throw new Error(
        "The submitted id is not a hexadecimal value generated by MongoDB"
      );
    }

    const roomTypeId = ObjectId.createFromHexString(capId);

    // Brings the MongoDB client
    const client = conn.getClient();

    // Delete the room type corresponding to the provided id
    const roomTypeDeletedResult = await crudOperations.deleteRoomTypeById(
      client,
      dbname,
      roomTypeId
    );

    if (roomTypeDeletedResult === null) {
      res.status(400);
      throw new Error(
        "The required room type could not be deleted because it does not exist in the Database"
      );
    }

    return res.status(200).json(roomTypeDeletedResult);
  } catch (err) {
    next(err);
  }
};
