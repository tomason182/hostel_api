const { saltGenerator, hashGenerator } = require("../utils/hash");

class User {
  constructor(
    username,
    password,
    firstName,
    lastName,
    email,
    phoneNumber,
    role
  ) {
    (this.username = username),
      (this.salt = saltGenerator()),
      (this.hashedPassword = hashGenerator(password, this.salt)),
      (this.firstName = firstName),
      (this.lastName = lastName),
      (this.role = role),
      (this.contactDetails = {
        email: email,
        phoneNumber: phoneNumber || null,
      });
  }
}

module.exports = User;
