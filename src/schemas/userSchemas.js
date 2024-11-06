const userRegisterSchema = {
  username: {
    in: ["body"],
    isEmail: {
      bail: true,
      errorMessage: "username is not a valid email",
    },
    normalizeEmail: true,
    trim: true,
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
  firstName: {
    in: ["body"],
    notEmpty: {
      bail: true,
      errorMessage: "First name must not be empty",
    },
    trim: true,
    escape: true,
  },
  lastName: {
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
<<<<<<< HEAD
=======
    isMobilePhone: {
      options: ["any"],
      errorMessage: "Phone number must be a valid mobile phone number",
    },
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb
  },
};

const userLoginSchema = {
  username: {
    in: ["body"],
    isEmail: {
      bail: true,
      errorMessage: "username is not a valid email",
    },
    trim: true,
    normalizeEmail: true,
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
};

const userUpdateSchema = {
  firstName: {
    in: ["body"],
    notEmpty: {
      bail: true,
      errorMessage: "First name must not be empty",
    },
    trim: true,
    escape: true,
  },
  lastName: {
    in: ["body"],
    trim: true,
    escape: true,
<<<<<<< HEAD
  },
  role: {
    in: ["body"],
    trim: true,
    escape: true,
    isIn: {
      options: [["admin", "manager", "employee"]],
      errorMessage:
        "Role must be one of the followings: admin, manager, employee",
=======
    notEmpty: {
      bail: true,
      errorMessage: "Last name is required",
    },
    isAlpha: {
      errorMessage: "Last name must contain only alphabetic characters",
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb
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
  email: {
    in: ["body"],
    isEmail: {
      bail: true,
      errorMessage: "username is not a valid email",
    },
    trim: true,
    normalizeEmail: true,
  },
<<<<<<< HEAD
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
      options: value => {
        if (/\s/.test(value)) {
          throw new Error("Password should not contain white spaces");
        }
        return true;
      },
    },
    errorMessage:
      "Password should contain at least 14 characters, 4 lowercase, 2 uppercase, 2 numbers and 2 symbols ",
  },
  firstName: {
    in: ["body"],
    notEmpty: {
      bail: true,
      errorMessage: "First name must not be empty",
    },
    trim: true,
    escape: true,
  },
  lastName: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
  },
  role: {
    in: ["body"],
    trim: true,
    escape: true,
    isIn: {
      options: [["admin", "manager", "employee"]],
      errorMessage:
        "Role must be one of the followings: admin, manager, employee",
    },
  },
=======
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb
};

const userChangePassSchema = {
  currentPassword: {
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
      options: value => {
        if (/\s/.test(value)) {
          throw new Error("Password should not contain white spaces");
        }
        return true;
      },
    },
    errorMessage:
      "Password should contain at least 14 characters, 4 lowercase, 2 uppercase, 2 numbers and 2 symbols ",
  },
  newPassword: {
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
      options: value => {
        if (/\s/.test(value)) {
          throw new Error("Password should not contain white spaces");
        }
        return true;
      },
    },
    errorMessage:
      "Password should contain at least 14 characters, 4 lowercase, 2 uppercase, 2 numbers and 2 symbols ",
  },
  repeatNewPassword: {
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
      options: value => {
        if (/\s/.test(value)) {
          throw new Error("Password should not contain white spaces");
        }
        return true;
      },
    },
    errorMessage:
      "Password should contain at least 14 characters, 4 lowercase, 2 uppercase, 2 numbers and 2 symbols",
  },
};

const usernameSchema = {
  username: {
    in: ["body"],
    isEmail: {
      bail: true,
      errorMessage: "username is not a valid email",
    },
    trim: true,
    normalizeEmail: true,
  },
};

const userChangePassSchema2 = {
  newPassword: {
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
      options: value => {
        if (/\s/.test(value)) {
          throw new Error("Password should not contain white spaces");
        }
        return true;
      },
    },
    errorMessage:
      "Password should contain at least 14 characters, 4 lowercase, 2 uppercase, 2 numbers and 2 symbols ",
  },
  repeatNewPassword: {
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
      options: value => {
        if (/\s/.test(value)) {
          throw new Error("Password should not contain white spaces");
        }
        return true;
      },
    },
    errorMessage:
      "Password should contain at least 14 characters, 4 lowercase, 2 uppercase, 2 numbers and 2 symbols ",
  },
};

// Middleware to sanitize body
const sanitizeRegisterBody = function (req, res, next) {
  const allowedFields = [
    "username",
    "password",
    "firstName",
    "lastName",
    "phoneNumber",
  ];
  Object.keys(req.body).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete req.body[key];
      res.status(400);
      throw new Error("not valid body field");
    }
  });
  next();
};

const sanitizeLoginBody = function (req, res, next) {
  const allowedFields = ["username", "password"];
  Object.keys(req.body).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete req.body[key];
      res.status(400);
      throw new Error("Not valid body fields");
    }
  });
  next();
};

const sanitizeUpdateBody = function (req, res, next) {
  const allowedFields = ["firstName", "lastName", "phoneNumber", "email"];
  Object.keys(req.body).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete req.body[key];
      res.status(400);
      throw new Error("Not valid body fields");
    }
  });
  next();
};

module.exports = {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
<<<<<<< HEAD
  userCreationSchema,
  userChangePassSchema,
  userChangePassSchema2,
  usernameSchema,
=======
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb
  sanitizeRegisterBody,
  sanitizeLoginBody,
  sanitizeUpdateBody,
};
