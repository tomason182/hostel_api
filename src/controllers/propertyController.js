require("dotenv").config();
const propertySchema = require("../schemas/propertySchema");
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const conn = require("../config/db_config");
const crudOperations = require("../utils/crud_operations");
const { ObjectId } = require("mongodb");

// Environment variables
const dbname = process.env.DB_NAME;

// @desc    get a property details
// @route   GET /api/v1/property/
// @access  Private
exports.property_details_get = async (req, res, next) => {
  try {
    const propertyId = req.user._id; // _id representa id de la propiedad, porque passport busca en la coleccion properties.
    if (!ObjectId.isValid(propertyId)) {
      res.status(400);
      throw new Error("Not a valid mongodb id");
    }

    const client = conn.getClient();
    const result = await crudOperations.findPropertyById(
      client,
      dbname,
      propertyId
    );

    if (result === null) {
      res.status(400);
      throw new Error("property not found");
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a property details
// @route   PUT /api/v1/properties/
// @access  Private
exports.property_details_update = [
  checkSchema(propertySchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const data = matchedData(req);
      const propId = req.user._id;

      const client = conn.getClient();
      const updatedResult = await crudOperations.updatePropertyInfo(
        client,
        dbname,
        propId,
        data
      );
      res.status(200).json({
        msg: `${updatedResult.matchedCount} document(s) match the filter. Updated ${updatedResult.modifiedCount} document(s)`,
      });
    } catch (err) {
      next(err);
    }
  },
];
