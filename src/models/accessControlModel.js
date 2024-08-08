class AccessControl {
  constructor(propertyId) {
    (this.propertyId = propertyId), (this.access = []);
  }

  setUserAccess(userId, role) {
    this.access.push({ user_id: userId, role: role });
  }
}

module.exports = AccessControl;
