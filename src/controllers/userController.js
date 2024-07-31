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
const { pbkdf2Sync, randomBytes } = require("node:crypto");
const jwt = require("jsonwebtoken");

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
      const salt = randomBytes(32).toString("hex");
      const hashedPassword = pbkdf2Sync(
        password,
        salt,
        100000,
        64,
        "sha512"
      ).toString("hex");

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
  userLoginSchema,
  async (req, res, next) => {
    const { username, password } = matchedData(req);
    await connectToDatabase();
    const user = usersCollection.findOne({ username });
    if (user === null) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    const pswhash = pbkdf2Sync(
      password,
      user.salt,
      100000,
      64,
      "sha512"
    ).toString("hex");

    if (pswhash !== user.hashedPassword) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    const payload = { sub: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8hs",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
      sameSite: "strict",
      maxAge: 3600 * 8 * 1000, // 3600 sec/hs * 8hs * 1000 milisec/sec
    });
  },
];

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
