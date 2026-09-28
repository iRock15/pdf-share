const express = require("express");
const router = express.Router();

const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const User = require("../models/userModel");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify", authController.verifyEmail);
router.post("/resend-verify-email", authController.resendVerifyEmail);

router.get("/logout", authController.logout);

router.get(
  "/allUsers",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getAllUsers,
);

router.patch(
  "/makeAdmin",
  authController.protect,
  authController.restrictTo("admin"),
  userController.makeAdmin,
);

router.post("/forgot-password", authController.forgotPassword);
router.patch("/forgot-password", authController.resetPassword);

router.post(
  "/generate-2fa",
  authController.protect,
  authController.generate2FA,
);

router.get("/me", authController.protect, authController.me);

router.post("/verify-2fa", authController.protect, authController.verify2FA);
router.get(
  "/regenerate-backup",
  authController.protect,
  authController.regenerateBackupCodes,
);

router.get("/disable-2fa", authController.protect, authController.disable2FA);

router.post("/login-2fa", authController.login2FA);

module.exports = router;
