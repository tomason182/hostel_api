const guestSchema = {
  firstName: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "First name must not be empty",
    },
  },
  lastName: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Last name must not be empty",
    },
  },
  idNumber: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
  },
  email: {
    in: ["body"],
    isEmail: {
      bail: true,
      errorMessage: "Not a valid email address",
    },
    normalizeEmail: true,
    notEmpty: {
      bail: true,
      errorMessage: "Email address must not be empty",
    },
  },
  phoneNumber: {
    in: ["body"],
    optional: true,
    isMobilePhone: {
      options: "any",
      errorMessage: "invalid phone number",
    },
  },
  city: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
  },
  street: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
  },
  postalCode: {
    in: ["body"],
    optional: true,
    isPostalCode: {
      options: "any",
      errorMessage: "invalid postal code",
    },
  },
  countryCode: {
    in: ["body"],
    optional: true,
    isISO31661Alpha2: {
      errorMessage: "Invalid country code",
    },
  },
};

module.exports = guestSchema;
