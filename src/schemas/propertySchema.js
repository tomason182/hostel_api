const propertySchema = {
  propertyName: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Property name must not be empty",
    },
  },
  street: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Address is required",
    },
  },
  city: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Address is required",
    },
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
    isISO31661Alpha2: {
      errorMessage: "Invalid country code",
    },
    notEmpty: {
      bail: true,
      errorMessage: "Country code is required",
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
