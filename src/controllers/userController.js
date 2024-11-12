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
  userChangePassSchema2,
  usernameSchema,
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
const transactionsOperations = require("../utils/transactions_operations");
const {
  sendConfirmationMail,
  sendResetPasswordMail,
} = require("../config/transactional_email");
const jwt = require("jsonwebtoken");
const fetchDataHelper = require("../utils/fetchDataHelper");

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
  body("acceptTerms").isBoolean().withMessage("Accept terms must be boolean"),
  body("captchaToken").trim().escape(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      if (process.env.NEW_USERS !== "accept") {
        res.status(503);
        throw new Error(
          "User registration is currently closed. Please check back soon!"
        );
      }

      // Extract req values
      const {
        username,
        password,
        firstName,
        propertyName,
        acceptTerms,
        captchaToken,
      } = matchedData(req);

      if (acceptTerms !== true) {
        throw new Error("Terms must be accepted before registration");
      }

      try {
        const response = await fetchDataHelper();
      } catch (e) {}

      const user = new User(username, firstName);
      const role = "admin";
      user.setRole(role);
      await user.setHashPassword(password);

      const property = new Property(propertyName);

      const client = conn.getClient();

      const userExist = await crudOperations.findOneUserByUsername(
        client,
        dbname,
        username
      );

      if (userExist !== null) {
        return res.status(400).json({ msg: "Username already exist" });
      }

      const result = await transactionsOperations.createUser(
        client,
        dbname,
        user,
        property
      );

      const token = jwtTokenGeneratorCE(result.userId);
      const userData = {
        username,
        firstName,
      };

      const confirmEmailLink =
        process.env.API_URL + "accounts/email-validation/" + token;
      sendConfirmationMail(userData, confirmEmailLink);
      res.status(200).json({
        msg: "Confirmation email sent",
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.finish_user_register = [
  param("token").isJWT().withMessage("Invalid JWT token"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }
      const token = req.params.token;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.sub;

      const userMongoID = ObjectId.createFromHexString(userId);
      const client = conn.getClient();

      const result = await crudOperations.validateUserEmail(
        client,
        dbname,
        userMongoID
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Resend email
// @route   POST /api/v1/users/resend-email-verification
// @access  Public
exports.resend_email_verification = [
  body("email").trim().isEmail().withMessage("Not a valid email address"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
      }

      const client = conn.getClient();

      const { email } = req.body;
      const user = await crudOperations.findOneUserByUsername(
        client,
        dbname,
        email
      );

      if (!user) {
        throw new Error("User not found");
      }

      if (user.isValidEmail === true) {
        throw new Error("Email already verified");
      }

      const waitingPeriod = 5 * 60 * 1000; // min * 60 seg/min * 1000 ms/seg

      if (Date.now() - user.lastResendEmail < waitingPeriod) {
        res.status(429);
        throw new Error("Please wait 5 minutes before requesting a new email");
      }

      await crudOperations.updateResendEmailTime(client, dbname, user._id);

      const verificationToken = jwtTokenGeneratorCE(user._id);

      const userData = {
        username: email,
        firstName: user.first_name,
      };

      const confirmEmailLink =
        process.env.API_URL + "accounts/email-validation/" + verificationToken;
      sendConfirmationMail(userData, confirmEmailLink);
      res.status(200).json({ msg: "Verification email resent" });
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

      if (role === "admin") {
        throw new Error("Admin users can not be created");
      }

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

      // Check if users list is 5 or more
      const allUser = await crudOperations.findAllPropertyUsers(
        client,
        dbname,
        propertyId
      );

      if (allUser.length >= 5) {
        res.status(403);
        throw new Error(
          "Team members creation limited reached. You can not create more than 5 team members"
        );
      }

      // create User, Property & Access Control objects
      const user = new User(username, firstName, lastName);
      user.setRole(role);
      // Aca se setea el email como valido de entrada, pero seria conveniente enviar email a usuario tipo invitacion
      user.setValidEmail(true);

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
        throw new Error(
          "We couldn't sign you in. Please check your username, password or verify your email"
        );
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
        throw new Error(
          "We couldn't sign you in. Please check your username, password or verify your email"
        );
      }

      if (user.isValidEmail === false) {
        res.status(401);
        throw new Error(
          "We couldn't sign you in. Please check your username, password or verify your email"
        );
      }

      const result = await new User().comparePasswords(
        password,
        user.hashed_password
      );

      if (!result) {
        res.status(401);
        throw new Error(
          "We couldn't sign you in. Please check your username, password or verify your email"
        );
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
  param("id").trim().isMongoId().withMessage("not a valid mongo id"),
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

      if (data.role === "admin") {
        throw new Error("Admin role can not be set up from here");
      }

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
          "Admin accounts cannot be updated here. Please go to Account Settings to edit an admin user."
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
// @route   DELETE /api/v1/users/profile/:id
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

// @desc    Delete account
// @route   DELETE /api/v1/users/account/delete/
// @access  Private
exports.delete_account = async (req, res, next) => {
  try {
    const userId = req.user.user_info._id;
    const propertyId = req.user._id;

    const client = conn.getClient();

    const userInfo = await crudOperations.findOneUserById(
      client,
      dbname,
      userId
    );

    if (!userInfo) {
      res.status(404);
      throw new Error("Unable to find User id");
    }

    if (userInfo.role !== "admin") {
      res.status(403);
      throw new Error("You do not have permission to delete the account.");
    }

    const propertyInfo = await crudOperations.findPropertyById(
      client,
      dbname,
      propertyId
    );

    if (!propertyInfo) {
      res.status(404);
      throw new Error("Unable to find property id");
    }

    const listUsersId = propertyInfo.access_control;

    const result = await transactionsOperations.deleteAccount(
      client,
      dbname,
      propertyId,
      listUsersId
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

// @desc    forgotten user password
// @route   POST /api/v1/users/reset-password/init-change-pass/
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
        throw new Error(
          "We couldn't find a matching account for the email address you entered. Please check the email address and try again."
        );
      }

      const token = jwtTokenGeneratorCE(user.username);
      const resetLink =
        process.env.API_URL + "accounts/reset-password/new/" + token;
      sendResetPasswordMail(user, resetLink);

      res.status(200).json({
        msg: "email sent",
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.finish_forgotten_user_password = [
  param("token").isJWT().withMessage("Invalid JWT token"),
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
        throw new Error("Passwords do not match");
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
