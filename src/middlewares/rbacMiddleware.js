const getPermissionByRoleName = require("../utils/permissions");

// Check if the user has the required permission for the route
exports.checkPermission = permission => {
  return (req, res, next) => {
    console.log(req.user.access_control.role);
    const userRole = req.user.access_control.role || "guess";
    const userPermission = getPermissionByRoleName(userRole);

    if (userPermission.includes(permission)) {
      return next();
    } else {
      res.status(403);
      throw new Error("Access denied");
    }
  };
};
