const crypto = require("crypto");

const hashed = (hashingType, plainText, digest) => {
  return crypto.createHash("sha256").update(plainText).digest("hex");
};

// .createHash("sha256")
//     .update(plainText)
//     .digest("hex");

module.exports = hashed;
