const Role = require("../models/roleModel");
const Permissions = require("../models/permissions");

// Check if the user has the required permission for the route
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user ? req.user.role : "anonymous";
    const userPermission = new Permissions().getPermissionByRoleName(userRole);

    if (userPermission.includes(permission)) {
      return next();
    } else {
      res.status(403);
      throw new Error("Access denied");
    }
  };
};
