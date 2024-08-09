const getPermissionByRoleName = require("../utils/permissions");

// Check if the user has the required permission for the route
exports.checkPermission = permission => {
  return (req, res, next) => {
    const userRole = req.user.access[0].role || "guess";
    const userPermission = getPermissionByRoleName(userRole);

    if (userPermission.includes(permission)) {
      return next();
    } else {
      res.status(403);
      throw new Error("Access denied");
    }
  };
};
