const User = require('../models/User');
const HostellerRegistry = require('../models/HostellerRegistry');

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

    // Check Hosteller Registry to determine residency status
    const isRegisteredHosteller = await HostellerRegistry.findOne({ email: email.toLowerCase() });
    const residencyStatus = isRegisteredHosteller ? 'Hosteller' : 'Day-Scholar';

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new student:", name);
      user = await User.create({
        name: name,
        email: email,
        rollNumber: isRegisteredHosteller ? isRegisteredHosteller.rollNumber : (rollNumber || email.split('@')[0]),
        authProvider: "microsoft",
        role: "student",
        residencyStatus,
      });
    } else {
      // Refresh residency status on every login so registry changes take immediate effect
      // Use $set with strict:false to bypass enum validation for existing invalid values,
      // then re-fetch the full fresh document so the returned role is always current.
      await User.findByIdAndUpdate(
        user._id,
        { $set: { residencyStatus } },
        { returnDocument: 'before', strict: false }
      );
      // Re-fetch the user so we always return the LATEST data from DB (including role changes)
      user = await User.findById(user._id);
    }

    res.status(200).json({
      success: true,
      message: 'Login Successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        residencyStatus: user.residencyStatus,
        dietaryPreference: user.dietaryPreference || '',
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

// --- 3. Get Student Settings ---
exports.getSettings = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ message: 'studentId is required.' });

    const user = await User.findById(studentId).select('name email rollNumber dietaryPreference residencyStatus foodAllergies');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ success: true, settings: user });
  } catch (error) {
    console.error('getSettings Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// --- 4. Update Student Settings ---
// NOTE: name (Microsoft OAuth), rollNumber and residencyStatus (admin-controlled) are intentionally excluded.
exports.updateSettings = async (req, res) => {
  try {
    const { studentId, dietaryPreference, foodAllergies } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required.' });

    const updatedUser = await User.findByIdAndUpdate(
      studentId,
      { dietaryPreference, foodAllergies },
      { returnDocument: 'after', runValidators: true }
    ).select('name email rollNumber dietaryPreference residencyStatus foodAllergies');

    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ success: true, message: 'Settings saved successfully!', user: updatedUser });
  } catch (error) {
    console.error('updateSettings Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
