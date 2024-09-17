const propertySchema = {
  propertyName: {
    in: ["body"],
    trim: true,
    escape: true,
    isLength: {
      options: {
        min: 1,
        max: 100,
      },
      errorMessage: "Property name maximum length is 100 characters",
    },
  },
  street: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
    isLength: {
      options: {
        min: 1,
        max: 100,
      },
      errorMessage: "Street maximum length is 100 characters",
    },
  },
  city: {
    in: ["body"],
    optional: true,
    isLength: {
      options: {
        min: 1,
        max: 100,
      },
      errorMessage: "City name maximum length is 100 characters",
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
