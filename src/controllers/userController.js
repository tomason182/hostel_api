const { checkSchema, validationResult } = require("express-validator");
const { userRegisterSchema, sanitizeBody } = require("../schemas/userSchemas");

// @desc    Create a new User
// @route   POST /api/v1/users
// @access  Public
exports.user_create = [
  sanitizeBody,
  checkSchema(userRegisterSchema),
  (req, res, next) => {
    console.log(req.body);
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      return res.status(200).json({ msg: "Create user" });
    } catch (err) {
      next(err);
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
