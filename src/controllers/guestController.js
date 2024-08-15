const guestSchema = require("../schemas/guestSchema");
const crudOperations = require("../utils/crud_operations");
const Guest = require("../models/guestModel");
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const conn = require("../config/db_config");

// Environment variables
const dbname = process.env.DB_NAME;

// @desc    Create a new Guest
// @route   POST /api/v1/guests/create
// @access  Private
exports.guest_create_post = [
  checkSchema(guestSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const propertyId = req.user._id;
      const userId = req.user.access_control[0].user_id;
      const data = matchedData(req);

      const guest = new Guest(
        propertyId,
        data.firstName,
        data.lastName,
        data.genre,
        userId
      );
      guest.setContactInfo(data.email, data.phoneNumber),
        guest.setAddress(
          data.street,
          data.city,
          data.countryCode,
          data.postalCode
        );

      const client = conn.getClient();

      const guestExits = await crudOperations.findGuestByEmail(
        client,
        dbname,
        propertyId,
        data.email
      );

      if (guestExits !== null) {
        res.status(400);
        throw new Error(`Guest with email: ${data.email} already exist`);
      }

      const result = await crudOperations.insertNewGuest(client, dbname, guest);

      res.status(200).json({ msg: result });
    } catch (err) {
      next(err);
    }
  },
];
