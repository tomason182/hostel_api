const propertySchema = {
  propertyName: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Property name must not be empty",
    },
    isAlpha: {
      errorMessage: "Property name must contain only alphabetic characters",
    },
    street: {
      in: ["body"],
      trim: true,
      escape: true,
      notEmpty: {
        bail: true,
        errorMessage: "Address is required",
      },
      isAlphanumeric: {
        errorMessage: "Address should be alphanumeric",
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
      isAlpha: {
        errorMessage: "Address should contain alphabetic characters",
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
  },
};
