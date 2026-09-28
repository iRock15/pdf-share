const crypto = require("crypto");

const { promisify } = require("util");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Resend } = require("resend");
const CreateError = require("../utils/createError");
const {
  generateRandomBase64,
  generateBase32,
  generateRandomCodes,
} = require("../utils/randomPlainText");
const createJWTToken = require("../utils/createJWToken");
const createCookie = require("../utils/createCookie");
const check2FAEnabled = require("../utils/check2FAEnabled");
const otpauth = require("../utils/otpauth");

const User = require("../models/userModel");
const Token = require("../models/tokenModel");

const MAX_AGE = process.env.JWT_MAX_AGE;
const COOKIE_AGE = process.env.JWT_COOKIE_EXPIRES_IN;

const PREAUTH_MAX_AGE = process.env.JWT_PREAUTH_MAX_AGE;
const PRE_AUTHCOOKIE_AGE = process.env.JWT_PREAUTH_COOKIE_EXPIRES_IN;

exports.signup = async (req, res, next) => {
  let newUser;
  let isBranNewUser = null;

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && user.isVerified)
      throw new CreateError("Email already exists", 400);

    if (user && !user.isVerified) {
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      ((user.firstName = req.body.firstName),
        (user.lastName = req.body.lastName));
      newUser = user;
      await user.save();
      await Token.findOneAndDelete({ userId: user._id });
    } else {
      isBranNewUser = true;
      newUser = await User.create(req.body);
    }
    const plainText = generateRandomBase64(12);
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainText)
      .digest("hex");

    const newEmailToken = await Token.create({
      userId: newUser._id,
      token: hashedToken,
      type: "email_token",
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    console.log(newEmailToken);

    const verifyURL = `http://localhost:5173/verify?token=${plainText}`;
    const resend = new Resend(process.env.RESEND_API);
    const { data, error } = await resend.emails.send({
      from: "WTF <onboarding@resend.dev>",
      to: ["aref.mody11@gmail.com"],
      subject: "hello world",
      html: `<strong>it works! url: ${verifyURL}</strong>`,
    });

    if (error) {
      throw new Error("Email delivery failed");
    }

    res.status(201).json({
      status: "success",
      message: [
        { user: "User created successfully" },
        { token: "Token generated successfully" },
      ],
      newUser,
    });
  } catch (error) {
    if (newUser && isBranNewUser) {
      await User.findByIdAndDelete(newUser._id);
    }
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const tokenDB = await Token.findOne({ token: hashedToken });
    if (!tokenDB) {
      throw new CreateError("Invalid or expired token", 400);
    }

    const user = await User.findByIdAndUpdate(
      tokenDB.userId,
      {
        isVerified: true,
      },
      {
        returnDocument: "after",
      },
    );
    await Token.findOneAndDelete({ token: hashedToken });

    const JWTToken = createJWTToken(user._id);
    createCookie("jwt-cookie", JWTToken, 1 * 24 * 60 * 60 * 1000, res);

    res.status(200).json({
      status: "success",
      message: "User verified successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.resendVerifyEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email)
      throw new CreateError("Please provide email you used to signup.", 400);
    const user = await User.findOne({ email });
    if (!user)
      throw new CreateError(
        "This email address has not signed up. Please sign up.",
        400,
      );
    if (user.isVerified)
      throw new CreateError(
        "This email address has already been verified.",
        400,
      );

    const plainText = generateRandomBase64(12);
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainText)
      .digest("hex");
    const verifyURL = `http://localhost:5173/verify?token=${plainText}`;
    const resend = new Resend(process.env.RESEND_API);
    const { data, error } = await resend.emails.send({
      from: "WTF <onboarding@resend.dev>",
      to: ["aref.mody11@gmail.com"],
      subject: "hello world",
      html: `<strong>it works! url: ${verifyURL}</strong>`,
    });

    if (error) {
      throw new Error("Email delivery failed");
    }

    const tokenDB = await Token.findOne({ userId: user.id });
    if (tokenDB) {
      await Token.findByIdAndDelete(tokenDB.id);
    }
    const newEmailToken = await Token.create({
      userId: user._id,
      token: hashedToken,
      type: "email_token",
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    console.log(newEmailToken);
    res.status(200).json({
      status: "success",
      message: "Verification email resent.",
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    if (!req.body.email)
      throw new CreateError("Please provide your email", 400);
    if (!req.body.password)
      throw new CreateError("Please provide your password", 400);

    const user = await User.findOne({ email: req.body.email }).select(
      "+password",
    );

    if (
      !user ||
      !(await user.correctPassword(req.body.password, user.password))
    )
      throw new CreateError("Incorrect email or password.", 401);

    if (!user.isVerified)
      throw new CreateError(
        "User unverified. Please verify your email address.",
        403,
      );

    if (!user.has2FA) {
      user.password = undefined;

      const JWTToken = createJWTToken(user._id);
      createCookie("jwt-cookie", JWTToken, 1 * 24 * 60 * 60 * 1000, res);

      res.status(200).json({
        status: "success",
        message: "User logged in successfully.",
        user,
      });
    } else {
      const preAuthJWT = createJWTToken(user._id, "2fa");
      createCookie("jwt-preauth-cookie", preAuthJWT, 5 * 60 * 1000, res);

      res.status(200).json({
        status: "success",
        message:
          "You have 2FA enabled. Please provide your 6-digit code from your authenticator app.",
        is_2fa_required: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res, next) => {
  res.clearCookie("jwt-cookie", {
    httpOnly: true,
  });
  res.clearCookie("jwt-preauth-cookie", {
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    message: "User logged out successfully.",
  });
};

exports.protect = async (req, res, next) => {
  const token = req.cookies["jwt-cookie"];
  try {
    if (!token) {
      throw new CreateError("User is not logged in. Please log in.", 401);
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRECT);
    const currentUser = await User.findById(decoded.userID);
    if (!currentUser)
      throw new CreateError(
        "User belonging to the token no longer exists",
        401,
      );
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new CreateError(
        "User recently changed password. Please log in again.",
        401,
      );
    }
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const plainText = generateRandomBase64(12);
  const hashedToken = crypto
    .createHash("sha256")
    .update(plainText)
    .digest("hex");
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({
        status: "success",
        message:
          "If an account with that email exists, we have sent a password reset link to it.",
      });

    const newPasswordToken = await Token.create({
      userId: user._id,
      token: hashedToken,
      type: "password_token",
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
    console.log(newPasswordToken);

    const verifyURL = `http://localhost:5173/reset?token=${plainText}`;
    const resend = new Resend(process.env.RESEND_API);
    const { data, error } = await resend.emails.send({
      from: "WTF <onboarding@resend.dev>",
      to: ["aref.mody11@gmail.com"],
      subject: "hello world",
      html: `<strong>it works! url: ${verifyURL}</strong>`,
    });

    if (error) {
      throw new Error("Email delivery failed");
    }

    res.status(200).json({
      status: "success",
      message:
        "If an account with that email exists, we have sent a password reset link to it.",
    });
  } catch (error) {
    await Token.findOneAndDelete({ token: hashedToken });
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (!req.body.token)
      throw new CreateError(
        "Token is missing. Please use a valid reset link.",
        400,
      );
    if (!req.body.password)
      throw new CreateError("Please provide your new password", 400);
    if (!req.body.passwordConfirm)
      throw new CreateError("Please confirm your new password", 400);

    const plainToken = req.body.token;
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    const tokenDB = await Token.findOne({ token: hashedToken });
    if (!tokenDB) throw new CreateError("Reset token expired or invalid.", 404);

    const userID = tokenDB.userId;
    const user = await User.findById(userID).select("+password");

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordChangedAt = Date.now();
    await Token.findByIdAndDelete(tokenDB._id);
    await user.save();
    res.status(200).json({
      status: "success",
      message: "Password updated successfully.",
      userEmail: user.email,
    });
  } catch (error) {
    next(error);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw new CreateError("You do not have the permission.", 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

exports.generate2FA = async (req, res, next) => {
  // endpoint is protected
  // no need to check if user is logged in
  let temp_base32;
  try {
    const user = req.user;
    const userEmail = user.email;
    const existing2FAToken = await Token.findOne({
      userId: user.id,
      type: "temp_base32",
    });
    if (!existing2FAToken) {
      temp_base32 = generateBase32();
      const new2FAToken = await Token.create({
        userId: user._id,
        token: temp_base32,
        type: "temp_base32",
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
    } else {
      temp_base32 = existing2FAToken.token;
    }
    console.log(temp_base32);
    const otpauth = `otpauth://totp/PDF%20Share:${userEmail}?secret=${temp_base32}&issuer=PDF%20Share`;
    res.status(200).json({
      status: "success",
      message: "URI successfully created.",
      otpauth,
    });
  } catch (error) {
    next(error);
  }
};

exports.verify2FA = async (req, res, next) => {
  //OTPAuth
  // endpoint is protected
  // no need to check if user is logged in
  try {
    if (req.user.has2FA)
      throw new CreateError("User already has set up 2FA.", 400);
    if (!req.body.code)
      throw new CreateError(
        "Please provide the 6-digit code from the authenticator app.",
        400,
      );
    const code = req.body.code.toString();
    const tokenDB = await Token.findOne({
      userId: req.user.id,
      type: "temp_base32",
    });
    if (!tokenDB)
      throw new CreateError(
        "Verification process expired. Please restart again.",
        400,
      );
    const temp_base32 = tokenDB.token;
    const totp = otpauth(req.user.email, temp_base32);

    let validateResult = totp.validate({ token: code, window: 1 });
    if (validateResult === null)
      throw new CreateError(
        "The 6-digit code is invalid or has expired. Please try a new code.",
        400,
      );
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        base32_2FA: temp_base32,
        has2FA: true,
      },
      {
        returnDocument: "after",
      },
    );

    await Token.findByIdAndDelete(tokenDB.id);

    const backupCodes = generateRandomCodes(10);
    user.backupCodes = backupCodes;
    console.log(backupCodes);
    console.log(user);

    await user.save();

    res.status(200).json({
      status: "success",
      message: "User successfully enabled 2FA.",
      backupCodes,
    });
  } catch (error) {
    next(error);
  }
};

exports.login2FA = async (req, res, next) => {
  // unlike the previous 2 endpints, this is before logging in. we can't protect this route
  // need to get the user from database
  try {
    if (req.cookies["jwt-cookie"])
      throw new CreateError("User is already logged in.", 404);
    const preAuthJWT = req.cookies["jwt-preauth-cookie"];
    if (!preAuthJWT)
      throw new CreateError(
        "Your session has expired. Please log in again",
        400,
      );
    const { code, type } = req.body;
    if (!type || !code)
      throw new CreateError("Please provide code and code type", 400);

    let isValid = false;
    let isBackupUsed = false;

    const decoded = await promisify(jwt.verify)(
      preAuthJWT,
      process.env.JWT_PREAUTH_SECRECT,
    );
    const userID = decoded.userID;
    const user = await User.findById(decoded.userID).select(
      "+base32_2FA +backupCodes",
    );

    if (type === "totp") {
      const code = req.body.code.toString();

      const base32 = user.base32_2FA;
      const totp = otpauth(user.email, base32);

      let validateResult = totp.validate({ token: code, window: 1 });
      if (validateResult === null)
        throw new CreateError(
          "The 6-digit code is invalid or has expired. Please try a new code.",
          400,
        );
      isValid = true;
    } else if (type === "backup") {
      const codes = user.backupCodes;
      for (let backupCode of codes) {
        if (
          (await bcrypt.compare(code, backupCode.code)) &&
          backupCode.isUsed === false
        ) {
          backupCode.isUsed = true;
          isValid = true;
          isBackupUsed = true;
          break;
        }
      }
    } else {
      throw new CreateError("Invalid 2FA type.", 400);
    }

    if (!isValid)
      throw new CreateError("Code is invalid or already been used.", 400);

    if (isBackupUsed) {
      user.markModified("backupCodes");
      await user.save({ validateModifiedOnly: true });
    }

    console.log(user.backupCodes);
    const remainingCodes = user.backupCodes.filter(
      (codeObj) => codeObj.isUsed === false,
    ).length;
    const warning =
      remainingCodes <= 3
        ? `Warning: You have ${remainingCodes} backup codes remaining. Please re-generate new codes from your profile settings!`
        : undefined;

    user.password = undefined;
    const JWTToken = createJWTToken(user._id);
    res.cookie("jwt-cookie", JWTToken, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie("jwt-preauth-cookie", {
      httpOnly: true,
    });
    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      user,
      warning,
    });
  } catch (error) {
    next(error);
  }
};

exports.regenerateBackupCodes = async (req, res, next) => {
  // protected route
  try {
    check2FAEnabled(req, res, next);
    const newPlainCodes = generateRandomCodes(10);
    const userDoc = await User.findById(req.user.id);
    userDoc.backupCodes = newPlainCodes;
    await userDoc.save();

    res.status(200).json({
      status: "success",
      message: "Regenerated new backup codes.",
      backupCodes: newPlainCodes,
      userID: userDoc.id,
    });
  } catch (error) {
    next(error);
  }
};

exports.disable2FA = async (req, res, next) => {
  // protected
  try {
    check2FAEnabled(req, res, next);
    const userDoc = await User.findById(req.user.id);
    userDoc.has2FA = false;
    userDoc.backupCodes = [];
    userDoc.base32_2FA = undefined;
    await userDoc.save({ validateModifiedOnly: true });
    res.status(200).json({
      status: "success",
      message: "User has successfully disabled 2FA",
    });
  } catch (error) {
    next(error);
  }
};

// exports.ensure2FA = (req, res, next) => {
//   if (req.user.has2FA) {
//     res.status(200).json({
//       status: "success",
//       message:
//         "You have 2FA enabled. Please provide your 6-digit code from your authenticator app.",
//       is_2fa_required: true,
//     });
//   } else next();
// };

exports.me = (req, res, next) => {
  // protected
  // const jwt = req.cookies["jwt-cookie"];
  const email = req.user.email;
  const firstName = req.user.firstName;
  const lastName = req.user.lastName;
  const isVerified = req.user.isVerified;
  const has2FA = req.user.has2FA;
  const passwordChangedAt = req.user.passwordChangedAt;

  res.status(200).json({
    firstName,
    lastName,
    email,
    passwordChangedAt,
    isVerified,
    has2FA,
    passwordChangedAt,
  });
};
