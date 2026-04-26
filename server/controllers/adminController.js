const User = require('../models/User'); 
const Menu = require('../models/Menu');
const MealBooking = require('../models/MealBooking');
const Notice = require('../models/Notice');
const HostellerRegistry = require('../models/HostellerRegistry');


// 1. Update the Menu
exports.updateMenu = async (req, res) => {
  try {
    const { dayOfWeek, mealType, items } = req.body;
    const updatedMenu = await Menu.findOneAndUpdate(
      { dayOfWeek, mealType },
      { items },
      { new: true, upsert: true } 
    );
    res.status(200).json({ success: true, message: `${mealType} for ${dayOfWeek} updated!`, menu: updatedMenu });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update menu." });
  }
};

// 2. Get Tomorrow's Cancellation Headcount
exports.getHeadcount = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0,0,0,0);

    const cancellations = await MealBooking.find({
      date: tomorrow,
      status: 'Cancelled'
    });

    // Get total hostellers count from User collection for accurate analytics
    const totalHostellers = await User.countDocuments({ residencyStatus: 'Hosteller' });

    const stats = { Breakfast: 0, Lunch: 0, Snacks: 0, Dinner: 0 };
    cancellations.forEach(booking => {
      if (stats[booking.mealType] !== undefined) {
        stats[booking.mealType]++;
      }
    });

    res.status(200).json({ 
      success: true, 
      stats, 
      totalHostellers,
      totalSaved: cancellations.length 
    });
  } catch (error) {
    console.error("Headcount Error:", error);
    res.status(500).json({ success: false, message: "Failed to load stats." });
  }
};

// 3. Get Refund Ledger (Real-World Match Version)
exports.getRefundLedger = async (req, res) => {
  try {
    // 1. Database se saari cancellations aur saare users ka data nikalo
    const cancellations = await MealBooking.find({ status: 'Cancelled' });
    const allUsers = await User.find({}); // Ye sabhi bachon ke asli naam layega

    const ledger = {};

    cancellations.forEach(booking => {
      let rawId = booking.studentId ? booking.studentId.toString().trim() : "Unknown_ID";

      // 2. Booking ID ko Asli User Database se Match karo (Naam aur Email nikalne ke liye)
      const student = allUsers.find(user => 
        user._id.toString() === rawId || 
        user.email === rawId || 
        user.rollNumber === rawId
      );

      // 3. Ledger mein student ki details save karo
      if (!ledger[rawId]) {
        ledger[rawId] = {
          // 🚨 YE HAI MAGIC: Agar student mila toh uska naam aur email show karo!
          name: student ? student.name : `Unlinked Account (ID: ${rawId})`,
          email: student ? student.email : "Email unavailable",
          totalCancelled: 0,
          meals: []
        };
      }

      ledger[rawId].totalCancelled++;
      const dateStr = new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      });
      ledger[rawId].meals.push(`${dateStr} - ${booking.mealType}`);
    });

    // 4. Frontend ko Real Data bhej do
    res.status(200).json({ success: true, ledger: Object.values(ledger) });

  } catch (error) {
    console.error("Ledger Error:", error);
    res.status(500).json({ success: false, message: "Failed to load ledger." });
  }
};

// 4. Update Global Notice (Admin Power)
exports.updateNotice = async (req, res) => {
  try {
    await Notice.deleteMany({});
    const newNotice = await Notice.create({ message: req.body.message });
    res.status(200).json({ success: true, message: "Notice updated!", notice: newNotice });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notice." });
  }
};

exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findOne(); 
    res.status(200).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get notice." });
  }
};

// --- 🚨 FINAL BOSS FEATURES 🚨 ---

// 5. Get All Students List
exports.getAllStudents = async (req, res) => {
  try {
    // Sirf students ko nikalega, admin ya contractor ko block list mein nahi dikhayega
    const students = await User.find({ role: 'student' }).select('-password');
    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 6. Toggle Student Block Status
exports.toggleBlockStatus = async (req, res) => {
  try {
    const { studentId, isBlocked } = req.body; 

    // Database mein student ko update karo
    const updatedStudent = await User.findByIdAndUpdate(
      studentId, 
      { isBlocked: isBlocked }, 
      { new: true } 
    ).select('-password');

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const statusMsg = isBlocked ? "Blocked 🚫" : "Unblocked ✅";
    res.status(200).json({ 
      success: true, 
      message: `Student successfully ${statusMsg}`, 
      student: updatedStudent 
    });

  } catch (error) {
    console.error("Error toggling block status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ──────────────────────────────────────────────
// 7. Get All Registered Hostellers
// ──────────────────────────────────────────────
exports.getHostellers = async (req, res) => {
  try {
    const hostellers = await HostellerRegistry.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, hostellers });
  } catch (error) {
    console.error("getHostellers Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ──────────────────────────────────────────────
// 8. Register a New Hosteller
// ──────────────────────────────────────────────
exports.registerHosteller = async (req, res) => {
  try {
    const { email, rollNumber, addedBy } = req.body;

    if (!email || !rollNumber) {
      return res.status(400).json({ success: false, message: "Email and Roll Number are required." });
    }

    if (!email.endsWith('@jklu.edu.in')) {
      return res.status(400).json({ success: false, message: "Only @jklu.edu.in emails are allowed." });
    }

    // Upsert: if already exists, update rollNumber; otherwise create new
    const entry = await HostellerRegistry.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), rollNumber, addedBy: addedBy || 'admin' },
      { new: true, upsert: true, runValidators: true }
    );

    // If the student has already logged in before, update their residencyStatus too
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { residencyStatus: 'Hosteller', rollNumber }
    );

    res.status(200).json({ success: true, message: `✅ ${email} registered as Hosteller.`, entry });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "This email is already registered as a Hosteller." });
    }
    console.error("registerHosteller Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ──────────────────────────────────────────────
// 9. De-register a Hosteller (by email)
// ──────────────────────────────────────────────
exports.deregisterHosteller = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const deleted = await HostellerRegistry.findOneAndDelete({ email: email.toLowerCase() });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Email not found in Hosteller registry." });
    }

    // Update the student's residency status to Day-Scholar if they exist
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { residencyStatus: 'Day-Scholar' }
    );

    res.status(200).json({ success: true, message: `🗑️ ${email} removed from Hosteller registry.` });
  } catch (error) {
    console.error("deregisterHosteller Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ──────────────────────────────────────────────
// 10. Update a User's Role (Admin Only)
// ──────────────────────────────────────────────
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ success: false, message: "userId and role are required." });
    }

    const validRoles = ['student', 'admin', 'contractor', 'accountant', 'controller'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true, strict: false }
    ).select('name email role');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: `✅ Role updated to "${role}" for ${updatedUser.name}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("updateUserRole Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};