const User = require("../models/User");
const jwt = require("jsonwebtoken");

/*
  Dummy OTP logic:
  Abhi OTP fixed hai (123456)
  Real OTP (SMS) baad me add hoga
*/

// SEND OTP
exports.sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "Phone number required"
    });
  }

  // Dummy OTP
  const otp = "123456";

  console.log(`OTP for ${phoneNumber} is ${otp}`);

  res.json({
    success: true,
    message: "OTP sent successfully"
  });
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  const { phoneNumber, otp, name } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({
      success: false,
      message: "Phone number and OTP required"
    });
  }

  // Dummy OTP check
  if (otp !== "123456") {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  // User find karo
  let user = await User.findOne({ phoneNumber });

  // Agar user nahi mila → create
  if (!user) {
    user = await User.create({
      phoneNumber,
      name: name || "GFS User"
    });
  }

  // JWT token generate
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || "gfssecret",
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    message: "Login successful",
    token,
    user
  });
};