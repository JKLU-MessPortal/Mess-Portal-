const User = require('../models/User');

// --- 1. Microsoft Login Logic ---
exports.microsoftLogin = async (req, res) => {
  try {
    const { name, email, rollNumber } = req.body;

    // Security Check
    if (!email.endsWith('@jklu.edu.in')) {
      return res.status(403).json({ 
        message: 'Access Denied: Please use your official JKLU Outlook ID.' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new student:", name);
      user = await User.create({
        name: name,
        email: email,
        rollNumber: rollNumber || email.split('@')[0], 
        password: "", // No password for Microsoft users
        authProvider: "microsoft",
        role: "student"
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login Successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- 2. Regular Register Logic (Optional, keeping it just in case) ---
exports.registerUser = async (req, res) => {
    res.status(200).json({ message: "Manual registration disabled for now." });
};