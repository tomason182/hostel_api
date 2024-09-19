const roomTypeSchema = {
  description: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Description must not be empty",
    },
    isLength: {
      options: {
        min: 1,
        max: 100,
      },
      errorMessage: "Room type name maximum length is 100 characters",
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
    isIn: {
      options: [["private", "dorm"]],
      errorMessage: "room type must be private or dorm",
    },
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
  currency: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "The currency (field) must not be empty",
    },
  },
};

const updateRoomTypeSchema = {
  description: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "Description must not be empty",
    },
    isLength: {
      options: {
        min: 1,
        max: 100,
      },
      errorMessage: "Room type name maximum length is 100 characters",
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
    isIn: {
      options: [["private", "dorm"]],
      errorMessage: "room type must be private or dorm",
    },
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
  currency: {
    in: ["body"],
    trim: true,
    escape: true,
    notEmpty: {
      bail: true,
      errorMessage: "The currency (field) must not be empty",
    },
  },
};

// Middleware to sanitize body
const sanitizeCreateBody = function (req, res, next) {
  const allowedFields = [
    "description",
    "type",
    "bathroom",
    "max_occupancy",
    "inventory",
    "base_rate",
    "currency",
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

const sanitizeUpdateBody = function (req, res, next) {
  const allowedFields = [
    "description",
    "type",
    "bathroom",
    "max_occupancy",
    "inventory",
    "base_rate",
    "currency",
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

module.exports = {
  roomTypeSchema,
  updateRoomTypeSchema,
  sanitizeCreateBody,
  sanitizeUpdateBody,
};

// ###################################################################################
// ##############         roomTypeSchema  =  updateRoomTypeSchema     ################
// ##############                         Y                           ################
// ##############     sanitizeCreateBody  =  sanitizeUpdateBody       ################
// ##############                                                     ################
// ##############       CUALQUIER COSA QUE EN EL FUTURO HAGAMOS       ################
// ##############         COSAS DIFERENTES CON AMBOS ESQUEMAS         ################
// ###################################################################################
