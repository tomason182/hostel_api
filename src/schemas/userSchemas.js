const userRegisterSchema = {
  username: {
    in: ["body"],
    isEmail: {
      bail: true,
      errorMessage: "username is not a valid email",
    },
  },
  password: {
    in: ["body"],
    isStrongPassword: {
      options: {
        minLength: 14,
        minLowerCase: 4,
        minUppercase: 2,
        minNumbers: 2,
        minSymbols: 2,
      },
    },
    custom: {
      options: (value) => {
        if (/\s/.test(value)) {
          throw new Error("Password should not contain white spaces");
        }
        return true;
      },
    },
    errorMessage:
      "Password should contain at least 14 characters, 4 lowercase, 2 uppercase, 2 numbers and 2 symbols ",
  },
  first_name: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "First name must not be empty",
    },
    isAlpha: {
      errorMessage: "First name must contain only alphabetic characters",
    },
  },
  last_name: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Last name is required",
    },
    isAlpha: {
      errorMessage: "Last name must contain only alphabetic characters",
    },
  },
  phoneNumber: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
    isMobilePhone: {
      options: ["any"],
      errorMessage: "Phone number must be a valid mobile phone number",
    },
  },
};

// Middleware to sanitize body
const sanitizeBody = function (req, res, next) {
  const allowedFields = [
    "username",
    "password",
    "first_name",
    "last_name",
    "phoneNumber",
  ];
  Object.keys(req.body).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete req.body[key];
      res.status(400);
      throw new Error("not a valid body field");
    }
  });
  next();
};

module.exports = { userRegisterSchema, sanitizeBody };
