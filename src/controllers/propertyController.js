// @desc    Create a property
// @route   POST /api/v1/property
// @access  Private
exports.property_create = async (req, res, next) => {
  try {
    res.status(200).json({ msg: "Create a property" });
  } catch (err) {
    next(err);
  }
};

// @desc    get a property details
// @route   GET /api/v1/property/:id_property
// @access  Private
exports.property_create = async (req, res, next) => {
  try {
    res.status(200).json({ msg: "Get property details" });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a property details
// @route   PUT /api/v1/property/:id_property
// @access  Private
exports.property_create = async (req, res, next) => {
  try {
    res.status(200).json({ msg: "Update property details" });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a property
// @route   DELETE /api/v1/property/:id_property
// @access  Private
exports.property_create = async (req, res, next) => {
  try {
    res.status(200).json({ msg: "Update property details" });
  } catch (err) {
    next(err);
  }
};
