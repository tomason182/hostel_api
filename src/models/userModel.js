const bcrypt = require("bcrypt");

class User {
  constructor(
    username,
    first_name,
    last_name = null,
    hashed_password = null,
    googleId = null,
    isValidEmail = false
  ) {
    (this.username = username),
      (this.first_name = first_name),
      (this.last_name = last_name),
      (this.hashed_password = hashed_password),
      (this.googleId = googleId),
      (this.role = null),
      (this.profilePicture = null);
    (this.isValidEmail = isValidEmail),
      (this.lastResendEmail = Date.now()),
      (this.createdAt = new Date()), // Aca parece quue createdAt se va a actualizar cada vez que se modifique el objecto.
      (this.updatedAt = new Date());
  }

  getHashedPassword() {
    return this.hashed_password;
  }

  setPasswordHashed(hashedPassword) {
    this.hashed_password = hashedPassword;
  }

  async setHashPassword(password, saltRounds = 10) {
    try {
      this.hashed_password = await bcrypt.hash(password, saltRounds);
    } catch (err) {
      throw new Error("Error hashing the password");
    }
  }

  async comparePasswords(password, hashedPassword) {
    try {
      const result = await bcrypt.compare(password, hashedPassword);
      return result;
    } catch (err) {
      throw new Error("An Error ocurred verifying the password");
    }
  }

  setRole(role) {
    this.role = role;
  }

  setValidEmail(isValid) {
    this.isValidEmail = isValid;
  }

  setGoogleId(googleId) {
    this.googleId = googleId;
  }

  setProfilePicture(urlPicture) {
    this.profilePicture = urlPicture;
  }
}

module.exports = User;
