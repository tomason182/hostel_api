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
    isMobilePhone: {
      options: "any",
      errorMessage: "invalid phone number",
    },
    notEmpty: {
      bail: true,
      errorMessage: "Phone number must not be empty",
    },
  },
  city: {
    in: ["body"],
    optional: true,
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Address is required",
    },
  },
  street: {
    in: ["body"],
    optional: true,
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
};
