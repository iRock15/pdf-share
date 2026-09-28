const check2FAEnabled = (req, res, next) => {
  try {
    if (!req.user.has2FA)
      throw new CreateError("User does not have 2FA enabled.", 400);
  } catch (error) {
    next(error);
  }
};

module.exports = check2FAEnabled;
