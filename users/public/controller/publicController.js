const USER_MODEL = require("../../../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendOtpEmail } = require("../../../congif/email/authController");

// --------------------------------------
// Helper: Generate Token + Set Cookie
// --------------------------------------
const sendToken = (user, res) => {
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.SECRET_STRING,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // change to true in production (HTTPS)
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// --------------------------------------
// Public Route
// --------------------------------------
const publicPage = (req, res) => {
  return res.json({ message: "This is my public router" });
};

// --------------------------------------
// Register
// --------------------------------------
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // console.log(name, email, password);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await USER_MODEL.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists! Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const otpExpiry = Date.now() + 5 * 60 * 1000;

    await USER_MODEL.create({
      name,
      email,
      role: "user",
      favourites: [],
      bookedTickets: [],
      password: hashedPassword,
      isVerified: false,
      otp: hashedOtp,
      otpExpiry,
      otpAttempts: 0,
    });

    await sendOtpEmail({
      email,
      name,
      otp,
    });

    return res.status(201).json({
      success: true,
      message: "User registered. Please verify OTP sent to email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------
// Login
// --------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔥 Include otp + otpExpiry since we use them
    const user = await USER_MODEL.findOne({ email }).select(
      "+password +otp +otpExpiry +otpAttempts",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist! Register first",
      });
    }

    // ✅ STEP 1: Check password FIRST
    const isMatchPassword = await bcrypt.compare(password, user.password);

    if (!isMatchPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ STEP 2: Check verification AFTER password is correct
    if (!user.isVerified) {
      // If OTP expired → regenerate
      if (!user.otpExpiry || user.otpExpiry < Date.now()) {
        const newOtp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = crypto
          .createHash("sha256")
          .update(newOtp)
          .digest("hex");

        user.otp = hashedOtp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        user.otpAttempts = 0;

        await user.save();

        await sendOtpEmail({
          email: user.email,
          name: user.name,
          otp: newOtp,
        });

        return res.status(403).json({
          success: false,
          message: "OTP expired. New OTP sent to email.",
          requiresOtp: true,
        });
      }

      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
        requiresOtp: true,
      });
    }

    // ✅ STEP 3: Verified user → login
    sendToken(user, res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------
// Get Current User
// --------------------------------------
const me = async (req, res) => {
  try {
    const user = await USER_MODEL.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------
// Logout
// --------------------------------------
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// --------------------------------------
// Verify OTP + Auto Login
// --------------------------------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await USER_MODEL.findOne({ email }).select("+otp +password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (user.otpAttempts >= 5) {
      return res.status(403).json({
        success: false,
        message: "Too many failed attempts",
      });
    }

    const hashedInputOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (hashedInputOtp !== user.otp) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ Mark verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;

    await user.save();

    // 🔥 AUTO LOGIN after verification
    sendToken(user, res);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  publicPage,
  register,
  login,
  me,
  logout,
  verifyOtp,
};
