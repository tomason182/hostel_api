const { pbkdf2Sync, randomBytes } = require("node:crypto");

exports.saltGenerator = (size) => {
  return randomBytes(size).toString("hex");
};

exports.hashGenerator = (passwd, salt) => {
  return pbkdf2Sync(passwd, salt, 100000, 64, "sha-512").toString("hex");
};
