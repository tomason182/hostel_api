const guestSchema = require("../schemas/guestSchema");
const guestHelper = require("../utils/guestHelpers");
const Guest = require("../models/guestModel");
const {
  checkSchema,
  validationResult,
  matchedData,
  query,
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

      const guestExits = await guestHelper.findGuestByEmail(
        client,
        dbname,
        propertyId,
        data.email
      );

      if (guestExits !== null) {
        res.status(400);
        throw new Error(`Guest with email: ${data.email} already exist`);
      }

      const result = await guestHelper.insertNewGuest(client, dbname, guest);

      res.status(200).json({ msg: result });
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Get an specific Guest
// @route   GET /api/v1/guests/:query
// @access  Private
exports.guest_get_one = [
  query("q").trim().escape().isLength({ min: 1, max: 50 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ msg: "query should contain between 1 to 50 characters" });
      }

      const query = req.query.q;
      const propertyId = req.user._id;
      const client = conn.getClient();
      let guest = null;
      switch (query) {
        // Check if the query is a valid email address
        case /^[{\w-\.}]+@([\w-]+\.)+[\w]{2,4}$/:
          guest = guestHelper.findGuestByEmail(
            client,
            dbname,
            propertyId,
            query
          );
          break;
        case /[0-9]/:
          // if the query contains numbers we suppose that is a phone number search
          // We take the last 6 number to make the search
          const num = query.slice(-6);
          guest = guestHelper.findGuestByPhoneNumber(
            client,
            dbname,
            propertyId,
            num
          );
          break;
        default:
          res.status(400);
          throw new Error("Query is not a valid email or phone number");
      }

      if (guest === null) {
        res.status(400);
        throw new Error("guest not found");
      }

      res.status(200).json(guest);
    } catch (err) {
      next(err);
    }
  },
];
