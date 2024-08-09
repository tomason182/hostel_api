const { saltGenerator, hashGenerator } = require("../utils/hash");

class User {
  constructor(username, password, first_name, last_name, phone_number) {
    (this.username = username),
      (this.salt = saltGenerator(32)),
      (this.hashed_password = hashGenerator(password, this.salt)),
      (this.first_name = first_name),
      (this.last_name = last_name),
      (this.contact_details = {
        email: username,
        phone_number: phone_number || null,
      }),
      (this.createdAt = new Date()),
      (this.updatedAt = new Date());
  }
}

module.exports = User;
