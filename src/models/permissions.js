class Permissions {
  constructor() {
    this.Permissions = [];
  }

  getPermissionByRoleName(roleName) {
    const role = roles.roles.find((role) => role.name === roleName);
    return role ? role.Permissions : [];
  }
}

module.exports = Permissions;
