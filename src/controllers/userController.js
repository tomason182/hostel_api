require("dotenv").config();
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const {
  userRegisterSchema,
  userLoginSchema,
  sanitizeRegisterBody,
  sanitizeLoginBody,
} = require("../schemas/userSchemas");
const {
  connectToDatabase,
  usersCollection,
  closeConn,
} = require("../config/db_config");
const { saltGenerator, hashGenerator } = require("../utils/hash");
const { jwtTokenGenerator } = require("../utils/tokenGenerator");

// @desc    Create a new User
// @route   POST /api/v1/users
// @access  Public
exports.user_create = [
  sanitizeRegisterBody,
  checkSchema(userRegisterSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      // Create the user object
      const { username, password, firstName, lastName, phoneNumber } =
        matchedData(req);

      await connectToDatabase();
      // Check if user exist in the database
      const userExist = await usersCollection.findOne({
        username,
      });

      // If user exist in the db, throw an error
      if (userExist !== null) {
        res.status(400);
        throw new Error("User already exist");
      }

      // Create salt and hash the password
      const salt = saltGenerator(32);
      const hashedPassword = hashGenerator(password, salt);

      const result = await usersCollection.insertOne({
        username,
        hashedPassword,
        salt,
        firstName,
        lastName,
        phoneNumber,
      });

      return res
        .status(200)
        .json({ msg: `User created id: ${result.insertedId}` });
    } catch (err) {
      next(err);
    } finally {
      await closeConn();
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
      await connectToDatabase();
      const user = await usersCollection.findOne({ username });
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
// @route   GET /api/v1/users/profile/:id
// @access  Private
exports.user_profile_get = (req, res, next) => {
  res.status(200).json({ msg: `Get user profile` });
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile/:id
// @access  Private
exports.user_profile_put = (req, res, next) => {
  res.status(200).json({ msg: `Update user ${req.params.id} profile` });
};

// @desc    Delete user profile
// @route   DELETE /api/v1/users/profile/:id
// @access  Private
exports.user_profile_delete = (req, res, next) => {
  res.status(200).json({ msg: `Delete user ${req.params.id} profile` });
};
