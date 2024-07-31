const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const { userRegisterSchema, sanitizeBody } = require("../schemas/userSchemas");
const {
  connectToDatabase,
  usersCollection,
  closeConn,
} = require("../database/db_config");
const { pbkdf2Sync, randomBytes } = require("node:crypto");

// @desc    Create a new User
// @route   POST /api/v1/users
// @access  Public
exports.user_create = [
  sanitizeBody,
  checkSchema(userRegisterSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      // Create the user object
      const user = matchedData(req);

      await connectToDatabase();
      // Check if user exist in the database
      const userExist = await usersCollection.findOne({
        username: user.username,
      });

      // If user exist in the db, throw an error
      if (userExist !== null) {
        res.status(400);
        throw new Error("User already exist");
      }

      // Create salt and hash the password
      const salt = randomBytes(32).toString("hex");
      const hashedPassword = pbkdf2Sync(
        user.password,
        salt,
        100000,
        64,
        "sha512"
      ).toString("hex");

      const result = await usersCollection.insertOne({
        username: user.username,
        hashedPassword: hashedPassword,
        salt: salt,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
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
exports.user_auth = (req, res, next) => {
  res.status(200).json({ msg: "Authenticate a user" });
};

// @desc    Logout a user
// @route   POST /api/v1/users/logout
// @access  Private
exports.user_logout = (req, res, next) => {
  res.status(200).json({ msg: "Logout user" });
};

// @desc    Get user profile
// @route   GET /api/v1/users/profile/:id
// @access  Private
exports.user_profile_get = (req, res, next) => {
  res.status(200).json({ msg: `Get user ${req.params.id} profile` });
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
