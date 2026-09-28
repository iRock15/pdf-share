const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your first name."],
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name."],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address."],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin", "owner"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password."],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      function () {
        return this.isModified("password");
      },
      "Please confirm your password",
    ],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same.",
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  has2FA: {
    type: Boolean,
    default: false,
  },
  base32_2FA: {
    type: String,
    select: false,
  },
  backupCodes: {
    type: Array,
    select: false,
  },
});

userSchema.pre("save", async function () {
  // this -> current document

  // saving performance
  // when the memory has an array of new generated codes
  // when we delete codes, the array in memory is 0, thus we don't unnecessarily hash empty codes
  // this.backupCodes.length > 0
  if (this.isModified("backupCodes") && this.backupCodes.length > 0) {
    if (typeof this.backupCodes[0] === "string") {
      const salt = await bcrypt.genSalt();

      this.backupCodes = await Promise.all(
        this.backupCodes.map(async (plainTextCode) => {
          const code = await bcrypt.hash(plainTextCode, salt);
          return { code, isUsed: false };
        }),
      );
    }
  }

  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();

    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = undefined;
  }

  // next();
});

// -------------------------------------------------

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // current document
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return changedTimestamp > JWTTimestamp;
  }

  // not changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
