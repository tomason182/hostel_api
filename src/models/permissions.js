const roles = require("../config/roles.json");

class Permissions {
  constructor() {
    this.Permissions = [];
  }

  getPermissionByRoleName(roleName) {
    const role = roles.roles.find((role) => role.name === roleName);
    return role ? role.permissions : [];
  }
}

module.exports = Permissions;
