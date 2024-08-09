const roles = require("../config/roles.json");

function getPermissionByRoleName(roleName) {
  const result = roles.roles.find(role => role.name === roleName);

  return result.permissions || [];
}

module.exports = getPermissionByRoleName;
