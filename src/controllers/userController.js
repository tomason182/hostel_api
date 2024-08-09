require("dotenv").config();
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
  userCreationSchema,
  sanitizeRegisterBody,
  sanitizeLoginBody,
  sanitizeUpdateBody,
  sanitizeCreateBody,
} = require("../schemas/userSchemas");
const { getClient } = require("../config/db_config");
const { jwtTokenGenerator } = require("../utils/tokenGenerator");
const User = require("../models/userModel");
const Property = require("../models/propertyModel");
const AccessControl = require("../models/accessControlModel");
const { ObjectId } = require("mongodb");
const hashGenerator = require("../utils/hash").hashGenerator;
const crudOperations = require("../utils/crud_operations");
const transactionsOperations = require("../utils/transactions_operations");

// Enviroment variables
const dbname = process.env.DB_NAME;

// @desc    Register new User
// @route   POST /api/v1/users/register
// @access  Public
exports.user_register = [
  sanitizeRegisterBody,
  checkSchema(userRegisterSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const client = getClient();
      console.log(`Client is: ${client}`);
      // Extract req values
      const { username, password, firstName, lastName, phoneNumber } =
        matchedData(req);

      // Check if user exist in the database
      const userExist = await crudOperations.findOneUserByUsername(
        client,
        dbname,
        username
      );

      // If user exist in the db, throw an error
      if (userExist !== null) {
        res.status(400);
        throw new Error("User already exist");
      }

      // create User, Property & Access Control objects
      const user = new User(
        username,
        password,
        firstName,
        lastName,
        phoneNumber
      );

      const property = new Property(
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );

      const accessControl = new AccessControl();

      const result =
        await transactionsOperations.insertUserPropertyAndAccessControlOnRegister(
          client,
          dbname,
          user,
          property,
          accessControl
        );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Create a new User
// @route   POST /api/v1/users/create
// @access  Private
// @role    admin, manager
exports.user_create = [
  sanitizeCreateBody,
  checkSchema(userCreationSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { username, password, firstName, lastName, phoneNumber, role } =
        matchedData(req);

      const propertyId = req.user.property_id;

      // Check if user exist in the database
      const client = getClient();
      const userExist = await crudOperations.findOneUserByUsername(
        client,
        dbname,
        username
      );

      // If user exist in the db, throw an error
      if (userExist !== null) {
        res.status(400);
        throw new Error("User already exist");
      }
      // Check if propertyId is valid
      if (!ObjectId.isValid(req.user.property_id)) {
        return res.status(400).json({ error: "invalid propertyId" });
      }

      const newUser = new User(
        username,
        password,
        firstName,
        lastName,
        phoneNumber
      );

      const result = await transactionsOperations.insertUserToProperty(
        client,
        dbname,
        newUser,
        role,
        propertyId
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Authenticate a user
// @route   POST /api/v1/users/auth
// @access  Public
exports.user_auth = [
  sanitizeLoginBody,
  checkSchema(userLoginSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }
      const { username, password } = matchedData(req);

      const client = getClient();
      const user = await crudOperations.findOneUser(client, dbname, username);
      if (user === null) {
        res.status(401);
        throw new Error("Invalid username or password");
      }

      const passwdHash = hashGenerator(password, user.salt);

      if (passwdHash !== user.hashedPassword) {
        res.status(401);
        throw new Error("Invalid username or password");
      }

      jwtTokenGenerator(res, user._id);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Logout a user
// @route   POST /api/v1/users/logout
// @access  Private
exports.user_logout = (req, res, next) => {
  return res
    .cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
      sameSite: "strict",
      maxAge: 0,
    })
    .status(200)
    .json({ msg: "User logout" });
};

// @desc    Get user profile
// @route   GET /api/v1/users/profile/
// @access  Private
exports.user_profile_get = (req, res, next) => {
  const userProfile = req.user;
  if (!userProfile) {
    res.status(400);
    throw new Error("User does not exist");
  }

  return res.status(200).json({ msg: userProfile });
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile/
// @access  Private
exports.user_profile_put = [
  sanitizeUpdateBody,
  checkSchema(userUpdateSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const data = matchedData(req);

      const userId = req.user._id;

      const client = getClient();
      const result = await crudOperations.updateOneUser(
        client,
        dbname,
        userId,
        data
      );

      return res.status(200).json({
        msg: `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount}`,
      });
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Update password
// @route   PUT /api/v1/users/profile/change-password
// @access  Private
exports.user_changePasswd_put = (req, res, next) => {
  res.status(200).json({ msg: "Change password" });
};

// @desc    Delete user profile
// @route   DELETE /api/v1/users/profile/
// @access  Private
exports.user_profile_delete = (req, res, next) => {
  // Este controlador deberia eliminar cuentas creadas por el adminitrador
  // pero tambien deberia eliminar la cuenta de administrador junto con todos los
  // documentos asociados
  res.status(200).json({ msg: `Delete user ${req.params.id} profile` });
};
