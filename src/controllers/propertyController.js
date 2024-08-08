const propertySchema = require("../schemas/propertySchema");
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const { getDb } = require("../config/db_config");
const { ObjectId } = require("mongodb");

// @desc    get a property details
// @route   GET /api/v1/property/
// @access  Private
exports.property_details_get = async (req, res, next) => {
  try {
    const propertyId = req.user.property_id;
    if (!ObjectId.isValid(propertyId)) {
      res.status(400);
      throw new Error("Not a valid mongodb id");
    }

    const db = await getDb();
    const propertyCollection = db.collection("properties");
    const result = await propertyCollection.findOne({ _id: propertyId });

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
// @route   PUT /api/v1/property/:id_property
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
      const propId = req.user.property_id;

      const db = getDb();
      const propertyCollection = db.collection("properties");

      const filter = { _id: propId };

      const updateProperty = {
        $set: {
          property_name: data.propertyName,
          address: {
            street: data.street,
            city: data.city,
            postal_code: data.postalCode,
            country_code: data.countryCode,
          },
          contact_info: {
            phone_number: data.phoneNumber,
            email: data.email,
          },
          updatedAt: new Date(),
        },
      };

      const updatedResult = await propertyCollection.updateOne(
        filter,
        updateProperty
      );
      res.status(200).json({ msg: "Property Updated", value: updatedResult });
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Delete a property
// @route   DELETE /api/v1/property/:id_property
// @access  Private
exports.property_delete = async (req, res, next) => {
  try {
    res.status(200).json({ msg: "Update property details" });
  } catch (err) {
    next(err);
  }
};
