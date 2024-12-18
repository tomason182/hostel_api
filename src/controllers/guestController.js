const guestSchema = require("../schemas/guestSchema");
const guestHelper = require("../utils/guestHelpers");
const Guest = require("../models/guestModel");
const {
  checkSchema,
  validationResult,
  matchedData,
  query,
  param,
} = require("express-validator");
const { ObjectId } = require("mongodb");
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
      const userId = req.user.user_info._id;
      const data = matchedData(req);

      const guest = new Guest(
        propertyId,
        data.firstName,
        data.lastName,
        data.idNumber || null,
        userId
      );
      guest.setContactInfo(data.email || null, data.phoneNumber || null);
      guest.setAddress(
        data.street || null,
        data.city || null,
        data.countryCode || null,
        data.postalCode || null
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

      res.status(200).json({ _id: result });
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Get an specific guest by id
// @route   GET /api/v1/guests/:id
// @access  Private
exports.guest_by_id_get = [
  param("id")
    .trim()
    .escape()
    .isMongoId()
    .withMessage("param is not a valid mongoDb ID"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const guestId = ObjectId.createFromHexString(req.params.id);

      const client = conn.getClient();

      const result = await guestHelper.findGuestById(client, dbname, guestId);

      res.status(200).json({ msg: result });
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Get an specific Guest by query search
// @route   GET /api/v1/guests/find
// @access  Private
exports.guest_get_one = [
  query("q")
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage("query should contain between 1 to 100 characters"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const query = req.query.q;
      const propertyId = req.user._id;
      const client = conn.getClient();
      let guest = null;

      if (/^[{\w-\.}]+@([\w-]+\.)+[\w]{2,4}$/.test(query)) {
        guest = await guestHelper.findGuestByEmail(
          client,
          dbname,
          propertyId,
          query
        );
      } else if (/[0-9]/.test(query)) {
        const num = query.slice(-6);
        guest = await guestHelper.findGuestByPhoneNumber(
          client,
          dbname,
          propertyId,
          num
        );
      } else {
        res.status(400);
        throw new Error("Query is not a valid email or phone number");
      }

      res.status(200).json(guest);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Update an specific guest
// @route   PUT /api/v1/guests/update/:id
// @access  Private
exports.guest_update_one = [
  param("id").trim().escape().isMongoId().withMessage("not a valid mongoId"),
  checkSchema(guestSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const client = conn.getClient();
      const data = matchedData(req);
      const userId = req.user.user_info._id;
      const propertyId = req.user._id;
      const guestId = ObjectId.createFromHexString(req.params.id);

      // Find user by email
      const guestExits = await guestHelper.findGuestByEmail(
        client,
        dbname,
        propertyId,
        data.email
      );

      if (
        guestExits !== null &&
        guestExits._id.toString() !== guestId.toString()
      ) {
        throw new Error("Email already exist");
      }

      const guest = new Guest(
        propertyId,
        data.firstName,
        data.lastName,
        data.idNumber
      );
      guest.setContactInfo(data.email, data.phoneNumber);
      guest.setAddress(
        data.street,
        data.city,
        data.countryCode,
        data.postalCode
      );
      guest.setUpdatedBy(userId);
      guest.setUpdatedAt();

      /* console.log(guest); */

      const result = await guestHelper.updateGuestInfo(
        client,
        dbname,
        guestId,
        guest
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Delete an specific guest
// @route   DELETE /api/v1/guests/:id
// @access  Private

exports.guest_delete_one = [
  param("id").trim().escape().isMongoId().withMessage("not a valid mongoId"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const client = conn.getClient();

      const guestId = ObjectId.createFromHexString(req.params.id);
      const result = await guestHelper.deleteGuest(client, dbname, guestId);

      if (result.deletedCount === 1) {
        res.status(200).json({ msg: "Successfully deleted one guest" });
      } else {
        res.status(400);
        throw new Error("Unable to delete guess. Deleted 0 documents");
      }
    } catch (err) {
      next(err);
    }
  },
];
