require("dotenv").config();
const {
  checkSchema,
  body,
  param,
  validationResult,
  matchedData,
} = require("express-validator");
const {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
  userCreationSchema,
  userChangePassSchema,
} = require("../schemas/userSchemas");
const conn = require("../config/db_config");
const {
  jwtTokenGenerator,
  jwtTokenValidation,
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
    .withMessage("Property name maximum length is 100 characters"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      // Extract req values
      const { username, password, firstName, propertyName } = matchedData(req);

      const userLocalID = new ObjectId().toString();
      const currUser = new User();
      await currUser.setHashPassword(password);
      const userJson = {
        userLocalID: userLocalID,
        username: username,
        hashedPassword: currUser.getHashedPassword(),
        firstName: firstName,
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

exports.finish_user_register = [
  param("token").trim().escape().isJWT().withMessage("Invalid JWT token"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }
      const token = req.params.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userLocalID = decoded.sub;
      const currUser = await deleteUserByLocalId(userLocalID);

      // create User, Property & Access Control objects
      const role = "admin"; // We assign role admin when user register
      const user = new User(currUser.username, currUser.firstName);
      user.setRole(role);
      user.setPasswordHashed(currUser.hashedPassword);

      const property = new Property(currUser.propertyName);

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
      console.log(errors.array());
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
      const userId = req.user.user_info._id;

      const client = conn.getClient();
      const result = await crudOperations.editUserProfile(
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

// @desc Edit users info
// @route PUT /api/v1/users/profile/:id
// @access Private
exports.user_edit_profile = [
  checkSchema(userUpdateSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      if (!ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("Params is not a valid mongo ID");
      }

      const userId = ObjectId.createFromHexString(req.params.id);
      const data = matchedData(req);

      const client = conn.getClient();

      const userInfo = await crudOperations.findOneUserById(
        client,
        dbname,
        userId
      );

      if (!userInfo) {
        throw new Error("Unable to find User's ID");
      }

      if (userInfo.role === "admin") {
        throw new Error(
          "Admin accounts cannot be updated here. Please go to Account Settings to delete an admin user."
        );
      }

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
      const userId = req.user.user_info._id;

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
        throw new Error("Confirm password does not match");
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

      return res.status(200).json(resultUpdate.matchedCount);
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Delete user profile
// @route   DELETE /api/v1/users/profile/
// @access  Private
exports.user_profile_delete = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      throw new Error("Param is not a valid mongo ID");
    }

    const userId = ObjectId.createFromHexString(req.params.id);
    const propertyId = req.user._id;
    const client = conn.getClient();

    const userInfo = await crudOperations.findOneUserById(
      client,
      dbname,
      userId
    );
    console.log(userInfo);

    if (!userInfo) {
      throw new Error("Unable to find User id");
    }

    if (userInfo.role === "admin") {
      throw new Error(
        "Admin accounts cannot be deleted here. Please go to Account Settings to delete an admin user."
      );
    }
    const result = await transactionsOperations.deleteUser(
      client,
      dbname,
      userId,
      propertyId
    );

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
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
