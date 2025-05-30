const bcrypt = require("bcrypt");
const User = require("../model/user.model");
const { generateOtp, getOtpExpiry } = require("../utils/otp");
const transporter = require("../utils/transporter");
const crypto = require("crypto");

const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;

  if (!first_name || !last_name || !email || !password || !confirm_password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      console.log("Found existing user:", existingUser.toJSON());

      if (existingUser.is_verified) {
        return res
          .status(409)
          .json({ message: "Email already registered and verified" });
      }

      const now = new Date();
      if (now < existingUser.otp_expires_at) {
        return res
          .status(400)
          .json({ message: "OTP already sent. Please verify your email." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOtp();
      const otpExpiry = getOtpExpiry();

      console.log("Updating user with new OTP:", { otp, otpExpiry });

      await existingUser.update({
        first_name,
        last_name,
        password: hashedPassword,
        otp,
        otp_expires_at: otpExpiry,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your Email",
        text: `Your new OTP is: ${otp}`,
      });

      return res.status(200).json({ message: "New OTP sent to your email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    console.log("Creating new user with data:", {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      otp,
      otp_expiry: otpExpiry,
    });

    await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      otp,
      otp_expires_at: otpExpiry,
      is_verified: false,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Email",
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Signup error:", err); // Add full error output
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || new Date() > user.otp_expires_at) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await user.update({ is_verified: true, otp: null, otp_expires_at: null });
    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: err.message });
  }
};

// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!user.is_verified) {
//       return res
//         .status(403)
//         .json({ message: "Please verify your email first" });
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ message: "Incorrect password" });

//     res.status(200).json({ message: "Login successful" });
//   } catch (err) {
//     res.status(500).json({ message: "Login failed", error: err.message });
//   }
// };

//FORGOT PASSWORD
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!user.is_verified) {
//       return res
//         .status(403)
//         .json({ message: "Please verify your email first" });
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ message: "Incorrect password" });

//     // Generate JWT token with user id in payload
//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" } // token expires in 1 day
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token, // send token here
//       user: {
//         id: user.id,
//         email: user.email,
//         first_name: user.first_name,
//         last_name: user.last_name,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Login failed", error: err.message });
//   }
// };

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.is_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    // ✅ Set user online
    await User.update({ is_online: true }, { where: { email } });

    // Generate JWT token with user id in payload
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const resetOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.reset_otp = resetOtp;
    user.reset_otp_expires_at = resetOtpExpiry;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Your OTP for Password Reset",
      html: `<p>Your OTP is: <strong>${resetOtp}</strong></p><p>Valid for 10 minutes.</p>`,
    });

    return res.status(200).json({ message: "Reset OTP sent to email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.reset_otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP provided." });
    }

    if (new Date() > user.reset_otp_expires_at) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    await user.update({ reset_otp_verified: true });

    res.status(200).json({
      message: "OTP verified.. You can now reset your password.",
      success: true,
      email: email,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res
      .status(500)
      .json({ message: "OTP verification failed", error: err.message });
  }
};

exports.resetPasswordWithOtp = async (req, res) => {
  const { email, otp, password, confirm_password } = req.body;

  if (!email || !otp || !password || !confirm_password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Check if OTP was verified
    if (!user.reset_otp_verified) {
      return res.status(400).json({ message: "Please verify your OTP first." });
    }

    if (user.reset_otp !== otp || new Date() > user.reset_otp_expires_at) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user and clear reset OTP info
    await user.update({
      password: hashedPassword,
      reset_otp: null,
      reset_otp_expires_at: null,
      reset_otp_verified: false,
    });

    res
      .status(200)
      .json({ message: "Password reset successful.", success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    res
      .status(500)
      .json({ message: "Password reset failed", error: err.message });
  }
};

exports.resendOtpForVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    // Generate new OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user's OTP fields
    user.otp = newOtp;
    user.otp_expires_at = otpExpiry;
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Resent OTP for Email Verification",
      html: `<p>Your new OTP is: <strong>${newOtp}</strong></p><p>Valid for 10 minutes.</p>`,
    });

    return res.status(200).json({ message: "New OTP sent to your email." });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP.", error: error.message });
  }
};
