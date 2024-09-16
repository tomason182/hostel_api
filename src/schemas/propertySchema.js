const propertySchema = {
  propertyName: {
    in: ["body"],
    notEmpty: {
      bail: true,
      errorMessage: "Property name must not be empty",
    },
    trim: true,
    escape: true,
  },
  street: {
    in: ["body"],
    optional: true,
    isLength: {
      max: 100,
      errorMessage: "Street max length is 100 characters",
    },
    trim: true,
    escape: true,
  },
  city: {
    in: ["body"],
    optional: true,
    isLength: {
      max: 100,
      errorMessage: "City max length is 100 characters",
    },
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
  phoneNumber: {
    in: ["body"],
    optional: true,
    isMobilePhone: {
      options: "any",
      errorMessage: "invalid phone number",
    },
  },
  email: {
    in: ["body"],
    optional: true,
    isEmail: {
      errorMessage: "invalid email address",
    },
    normalizeEmail: true,
  },
};

module.exports = propertySchema;
