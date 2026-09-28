const jwt = require("jsonwebtoken");

const createJWTToken = (userID, type = "login") => {
  if (type === "login") {
    return jwt.sign({ userID }, process.env.JWT_SECRECT, {
      expiresIn: 1 * 24 * 60 * 60,
    });
  } else if (type === "2fa") {
    return jwt.sign({ userID }, process.env.JWT_PREAUTH_SECRECT, {
      expiresIn: 5 * 60,
    });
  }
};

module.exports = createJWTToken;
