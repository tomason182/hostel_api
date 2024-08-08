class AccessControl {
  constructor(property_id) {
    (this.property_id = property_id), (this.access = []);
  }

  setUserAccess(userId, role) {
    this.access.push({ user_id: userId, role: role });
  }
}

module.exports = AccessControl;
