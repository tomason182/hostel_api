const roomTypeSchema = {
  description: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Description must not be empty",
    },
  },
  type: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Type is required",
    },
  },
  bathroom: {
    in: ["body"],
    trim: true,
    escape: true,
  },
  max_occupancy: {
    in: ["body"],
    trim: true,
    isInt: {
      bail: true,
      errorMessage: "Invalid data type. Must be integer",
    },
    notEmpty: {
      bail: true,
      errorMessage: "Maximum occupancy is required",
    },
  },
  inventory: {
    in: ["body"],
    trim: true,
    isInt: {
      bail: true,
      errorMessage: "Invalid data type. Must be integer",
    },
    notEmpty: {
      bail: true,
      errorMessage: "Inventory is required",
    },
  },
  base_rate: {
    in: ["body"],
    trim: true,
    isFloat: {
      bail: true,
      errorMessage: "Invalid data type. Must be decimal",
    },
    notEmpty: {
      bail: true,
      errorMessage: "The base rate is required",
    },
  },
  currency: {                  // desde el front se puede seleccionar con un checkpiont
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "The currency (field) must not be empty",
    },
  },
};

module.exports = roomTypeSchema;