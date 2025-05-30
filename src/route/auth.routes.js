const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");

router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);

// routes for password reset
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-otp", authController.verifyResetOtp);

router.post("/reset-password", authController.resetPasswordWithOtp);
// Resend OTP and verify email
router.post("/resend-otp", authController.resendOtpForVerification);
module.exports = router;
