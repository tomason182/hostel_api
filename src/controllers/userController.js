require("dotenv").config();
const {
  checkSchema,
  body,
  validationResult,
  matchedData,
} = require("express-validator");
const {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
  userCreationSchema,
} = require("../schemas/userSchemas");
const conn = require("../config/db_config");
const {
  jwtTokenGenerator,
  jwtTokenValidation,
} = require("../utils/tokenGenerator");
const User = require("../models/userModel");
const Property = require("../models/propertyModel");
const { ObjectId } = require("mongodb");
const crudOperations = require("../utils/crud_operations");
const transactionsOperations = require("../utils/transactions_operations");

// Enviroment variables
const dbname = process.env.DB_NAME;

// @desc    Register new User
// @route   POST /api/v1/users/register
// @access  Public
exports.user_register = [
  checkSchema(userRegisterSchema),
  body("propertyName")
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage("Property name maximum length is 100 characters"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      // Extract req values
      const { username, password, firstName, propertyName } = matchedData(req);

      // create User, Property & Access Control objects
      const role = "admin"; // We assign role admin when user register
      const user = new User(username, firstName);
      user.setRole(role);
      console.log(user);

      await user.setHashPassword(password);

      const property = new Property(propertyName);

      const property_id = new ObjectId();

      property.set_ID(property_id);

      const client = conn.getClient();

      const result = await transactionsOperations.createUser(
        client,
        dbname,
        user,
        property
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
  checkSchema(userCreationSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { username, password, firstName, lastName, role } =
        matchedData(req);

      const propertyId = req.user._id;

      // Check if user exist in the database
      const client = conn.getClient();
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
      if (!ObjectId.isValid(req.user._id)) {
        return res.status(400).json({ error: "invalid propertyId" });
      }

      // create User, Property & Access Control objects
      const user = new User(username, firstName, lastName);
      user.setRole(role);

      await user.setHashPassword(password);

      const result = await transactionsOperations.insertUserToProperty(
        client,
        dbname,
        user,
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
  checkSchema(userLoginSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(401);
        throw new Error("Invalid username or password");
      }
      const { username, password } = matchedData(req);

      const client = conn.getClient();
      const user = await crudOperations.findOneUserByUsername(
        client,
        dbname,
        username
      );
      if (user === null) {
        res.status(401);
        throw new Error("Invalid username or password");
      }

      const result = await new User().comparePasswords(
        password,
        user.hashed_password
      );

      if (!result) {
        res.status(401);
        throw new Error("Invalid username or password");
      }

      jwtTokenGenerator(res, user._id);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Validate log in
// @route   GET  /api/v1/users/validate
// @access  Private
exports.user_validate = (req, res, next) => {
  const signedCookie = req.signedCookies["jwt"];

  try {
    const validateToken = jwtTokenValidation(signedCookie);
    if (validateToken === false) {
      res.status(401);
      throw new Error("Invalid token");
    }

    return res.status(200).json({ validateToken });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout a user
// @route   GET /api/v1/users/logout
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
  console.log(userProfile);
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
  checkSchema(userUpdateSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const data = matchedData(req);
      const userId = req.user.access_control[0].user_id;

      const client = conn.getClient();
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

// @desc Get all property users
// @route GET /api/v1/users/all
// @access Private
exports.user_get_all = async (req, res, next) => {
  try {
    const propertyId = req.user._id;

    const client = conn.getClient();

    const usersList = await crudOperations.findAllPropertyUsers(
      client,
      dbname,
      propertyId
    );

    res.status(200).json({ msg: usersList });
  } catch (err) {
    next(err);
  }
};
