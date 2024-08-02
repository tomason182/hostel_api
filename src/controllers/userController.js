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
  sanitizeRegisterBody,
  sanitizeLoginBody,
  sanitizeUpdateBody,
} = require("../schemas/userSchemas");
const { getDb } = require("../config/db_config");
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

      // Extract req values
      const { username, password, firstName, lastName, phoneNumber } =
        matchedData(req);

      // Check if user exist in the database
      const db = getDb();
      const usersCollection = await db.collection("users");
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

      // Create the User object according to db structure

      const User = {
        username: username,
        hashedPassword: hashedPassword,
        salt: salt,
        firstName: firstName,
        lastName: lastName,
        contactDetails: {
          email: username,
          phoneNumber: phoneNumber,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(User);

      return res
        .status(200)
        .json({ msg: `User created id: ${result.insertedId}` });
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

      // Get database and collection
      const db = getDb();
      const usersCollection = db.collection("users");
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

      const { firstName, lastName, phoneNumber, email } = matchedData(req);

      const filter = { _id: req.user._id };

      const updateUser = {
        $set: {
          firstName: firstName,
          lastName: lastName,
          contactDetails: {
            phoneNumber: phoneNumber,
            email: email,
          },
          updatedAt: new Date(),
        },
      };

      const db = getDb();
      const usersCollection = db.collection("users");

      const result = await usersCollection.updateOne(filter, updateUser);

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
