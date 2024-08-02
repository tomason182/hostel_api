const propertySchema = require("../schemas/propertySchema");
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const { getDd } = require("../config/db_config");

// @desc    Create a property
// @route   POST /api/v1/property
// @access  Private
exports.property_create = [
  checkSchema(propertySchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const {
        propertyName,
        street,
        city,
        postalCode,
        countryCode,
        phoneNumber,
        email,
      } = matchedData(req);
      const userId = req.user._id;

      const Property = {
        property_name: propertyName,
        address: [
          {
            street: street,
            city: city,
            postal_code: postalCode,
            country_code: countryCode,
          },
        ],
        contact_info: {
          phone_number: phoneNumber,
          email: email,
        },
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const db = getDd();
      const propertyCollection = db.collection("properties");

      const result = await propertyCollection.insertOne(Property);

      if (result) {
        res
          .status(200)
          .json({ msg: "Property created successfully", value: result });
      } else {
        res.status(400);
        throw new Error(
          "An error occurred when trying to insert a new property"
        );
      }
    } catch (err) {
      next(err);
    }
  },
];

// @desc    get a property details
// @route   GET /api/v1/property/:id_property
// @access  Private
exports.property_details_get = async (req, res, next) => {
  try {
    res.status(200).json({ msg: "Get property details" });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a property details
// @route   PUT /api/v1/property/:id_property
// @access  Private
exports.property_details_update = async (req, res, next) => {
  try {
    res.status(200).json({ msg: "Update property details" });
  } catch (err) {
    next(err);
  }
};

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
