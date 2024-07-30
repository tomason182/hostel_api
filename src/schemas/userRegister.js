const userRegisterSchema = {
  username: {
    isEmail: {
      bail: true,
      errorMessage: "username is not a valid email",
    },
  },
  password: {
    isStrongPassword: {
      options: {
        minLength: 14,
        minLowerCase: 4,
        minUppercase: 2,
        minNumbers: 2,
        minSymbols: 2,
      },
    },
    errorMessage:
      "Password should contain at least 14 characters, 4 lowercase, 2 uppercase, 2 numbers and 2 symbols ",
  },
  first_name: {
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
    optional: true,
    trim: true,
    escape: true,
    isMobilePhone: {
      options: ["any"],
      errorMessage: "Phone number must be a valid mobile phone number",
    },
  },
};

module.exports = userRegisterSchema;
