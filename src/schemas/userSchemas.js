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
  lastName: {
    in: ["body"],
    trim: true,
    escape: true,
    isAlpha: {
      errorMessage: "Last name must contain only alphabetic characters",
    },
  },
};

const userLoginSchema = {
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

const userUpdateSchema = {
  firstName: {
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
  lastName: {
    in: ["body"],
    trim: true,
    escape: true,
    isAlpha: {
      errorMessage: "Last name must contain only alphabetic characters",
    },
  },
};

const userCreationSchema = {
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
  lastName: {
    in: ["body"],
    trim: true,
    escape: true,
    isAlpha: {
      errorMessage: "Last name must contain only alphabetic characters",
    },
  },
  role: {
    in: ["body"],
    trim: true,
    isIn: {
      options: [["admin", "manager", "employee"]],
      errorMessage:
        "Role must be one of the followings: admin, manager, employee",
    },
  },
};

// Middleware to sanitize body
const sanitizeRegisterBody = function (req, res, next) {
  const allowedFields = ["username", "password", "firstName", "lastName"];
  Object.keys(req.body).forEach(key => {
    if (!allowedFields.includes(key)) {
      delete req.body[key];
      res.status(400);
      throw new Error("not valid body field");
    }
  });
  next();
};

const sanitizeCreateBody = function (req, res, next) {
  const allowedFields = [
    "username",
    "password",
    "firstName",
    "lastName",
    "role",
  ];
  Object.keys(req.body).forEach(key => {
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
  Object.keys(req.body).forEach(key => {
    if (!allowedFields.includes(key)) {
      delete req.body[key];
      res.status(400);
      throw new Error("Not valid body fields");
    }
  });
  next();
};

const sanitizeUpdateBody = function (req, res, next) {
  const allowedFields = ["firstName", "lastName"];
  Object.keys(req.body).forEach(key => {
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
  userCreationSchema,
  sanitizeRegisterBody,
  sanitizeLoginBody,
  sanitizeUpdateBody,
  sanitizeCreateBody,
};
