require("dotenv").config();
const {
  checkSchema,
  body,
  validationResult,
  matchedData,
  param,
} = require("express-validator");
const {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
  userCreationSchema,
  userChangePassSchema,
  userChangePassSchema2,
  usernameSchema,
  sanitizeRegisterBody,
  sanitizeLoginBody,
  sanitizeUpdateBody,
  sanitizeCreateBody,
} = require("../schemas/userSchemas");
const conn = require("../config/db_config");
const {
  jwtTokenGenerator,
  jwtTokenGeneratorCE,
} = require("../utils/tokenGenerator");
const User = require("../models/userModel");
const Property = require("../models/propertyModel");
const { ObjectId } = require("mongodb");
const crudOperations = require("../utils/crud_operations");
const {
  deleteUserByLocalId,
  insertUserInLocalDB,
  deleteUserByLocalIdWithDelay,
} = require("../utils/crud_operations_local_db.js");
const transactionsOperations = require("../utils/transactions_operations");
const sendConfirmationMail = require("../config/transactional_email");
const jwt = require("jsonwebtoken");

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
    .withMessage("Property name must be specified"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const client = conn.getClient();
      // Extract req values
      const { username, password, firstName, lastName, propertyName } =
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

      let userLocalID = new ObjectId();
      userLocalID = userLocalID.toString();
      const currUser = new User();
      await currUser.setHashPassword(password);
      const userJson = {
        userLocalID: userLocalID,
        username: username,
        hashedPassword: currUser.getHashedPassword(),
        firstName: firstName,
        lastName: lastName,
        propertyName: propertyName,
      };

      await insertUserInLocalDB(userJson);
      const token = jwtTokenGeneratorCE(userJson.userLocalID);
      const confirmEmailLink = `${process.env.API_URL}/users/confirm-email/${token}`;
      sendConfirmationMail(userJson, confirmEmailLink);
      deleteUserByLocalIdWithDelay(userJson.userLocalID);
      res.status(200).json({
        msg: "The e-mail has been sent for the user to confirm their electronic mail address.",
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.finish_user_register = async (req, res, next) => {
  try {
    const token = req.params.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userLocalID = decoded.sub;
    const currUser = await deleteUserByLocalId(userLocalID);

    const client = conn.getClient();

    // create User, Property & Access Control objects
    const user = new User(
      currUser.username,
      currUser.firstName,
      currUser.lastName,
      currUser.hashedPassword
    );

    const property = new Property(currUser.propertyName);

    const property_id = new ObjectId();

    property.set_ID(property_id);

    const result =
      await transactionsOperations.insertUserPropertyAndAccessControlOnRegister(
        client,
        dbname,
        user,
        property
      );
    console.log(result);
    return res
      .status(200)
      .json({ msg: "The user has successfully registered on the website." });
  } catch (err) {
    next(err);
  }
};

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

      await user.setHashPassword(password);

      const result = await transactionsOperations.insertUserToProperty(
        client,
        dbname,
        user,
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
  checkSchema(userLoginSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
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
exports.user_changePasswd_put = [
  checkSchema(userChangePassSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }
      const { currentPassword, newPassword, repeatNewPassword } =
        matchedData(req);
      const userId = req.user.access_control[0].user_id;

      const client = conn.getClient();
      const user = await crudOperations.findOneUserById(client, dbname, userId);

      const result = await new User().comparePasswords(
        currentPassword,
        user.hashed_password
      );

      if (!result) {
        res.status(401);
        throw new Error("Invalid current password");
      }

      if (newPassword !== repeatNewPassword) {
        res.status(401);
        throw new Error(
          "The new password entered for the second time does not match the one entered for the first time."
        );
      }
      const objUser = new User();
      await objUser.setHashPassword(newPassword);
      const hashedPassword = objUser.getHashedPassword();
      const resultUpdate = await crudOperations.updateOneUserPass(
        client,
        dbname,
        userId,
        hashedPassword
      );

      return res.status(200).json({ msg: "Change password", resultUpdate });
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Delete user profile
// @route   DELETE /api/v1/users/profile/
// @access  Private
exports.user_profile_delete = (req, res, next) => {
  // Este controlador deberia eliminar cuentas creadas por el adminitrador
  // pero tambien deberia eliminar la cuenta de administrador junto con todos los
  // documentos asociados
  res.status(200).json({ msg: `Delete user ${req.params.id} profile` });
};

// @desc    forgotten user password
// @route   POST /api/v1/users/forgotten-password/init-change-pass/
// @access  Public
exports.forgotten_user_password = [
  checkSchema(usernameSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { username } = matchedData(req);
      const client = conn.getClient();
      const user = await crudOperations.findOneUserByUsername(
        client,
        dbname,
        username
      );

      if (user === null) {
        res.status(401);
        throw new Error("Invalid username");
      }

      const token = jwtTokenGeneratorCE(user.username);
      const confirmEmailLink = `${process.env.API_URL}/users/forgotten-password/continue-change-pass/${token}`;
      sendConfirmationMail(user, confirmEmailLink);

      res.status(200).json({
        msg: "An email has been sent to the user so they can continue with the password change process.",
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.continue_forgotten_user_password = [
  param(token).escape().isJWT(token),
  async (req, res, next) => {
    try {
      const errors = matchedData(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }
      const token = req.params.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const username = decoded.sub;
      const linkButton = `${process.env.API_URL}/users/forgotten-password/finish-change-pass/${token}`;

      res.status(200).json({
        username,
        linkButton,
        msg: "User enabled to change their password",
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.finish_forgotten_user_password = [
  checkSchema(userChangePassSchema2),
  async (req, res, next) => {
    try {
      const token = req.params.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const username = decoded.sub;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { newPassword, repeatNewPassword } = matchedData(req);

      if (newPassword !== repeatNewPassword) {
        res.status(401);
        throw new Error(
          "The new password entered for the second time does not match the one entered for the first time."
        );
      }

      const client = conn.getClient();
      const user = await crudOperations.findOneUserByUsername(
        client,
        dbname,
        username
      );

      if (user === null) {
        res.status(401);
        throw new Error("Invalid username");
      }

      const objUser = new User();
      await objUser.setHashPassword(newPassword);
      const hashedPassword = objUser.getHashedPassword();
      const resultUpdate = await crudOperations.updateOneUserPass(
        client,
        dbname,
        user._id,
        hashedPassword
      );

      return res.status(200).json({ msg: "Change password", resultUpdate });
    } catch (err) {
      next(err);
    }
  },
];
