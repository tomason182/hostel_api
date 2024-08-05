const { saltGenerator, hashGenerator } = require("../utils/hash");

class User {
  constructor(username, password, firstName, lastName, phoneNumber, role) {
    (this.username = username),
      (this.salt = saltGenerator(32)),
      (this.hashedPassword = hashGenerator(password, this.salt)),
      (this.firstName = firstName),
      (this.lastName = lastName),
      (this.role = role),
      (this.contactDetails = {
        email: username,
        phoneNumber: phoneNumber || null,
      }),
      (this.createdAt = new Date()),
      (this.updatedAt = new Date());
  }
}

module.exports = User;
