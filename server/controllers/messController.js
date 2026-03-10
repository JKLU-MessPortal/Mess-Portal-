const MealLog = require('../models/MealLog');
const User = require('../models/User');

exports.scanQRCode = async (req, res) => {
  try {
    const { studentId } = req.body;

    // 1. Validate the ID
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Invalid Student ID" });
    }

    // --- 🚨 FINAL BOSS SECURITY CHECK 🚨 ---
    if (student.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        message: `🚨 ACCESS DENIED: ${student.name}, your Mess Pass is BLOCKED! Contact Admin.` 
      });
    }
    // ---------------------------------------

    // 2. Determine Meal Type based on current time (Server Time)
    const currentHour = new Date().getHours();
    let mealType = "Unknown";

    if (currentHour >= 8 && currentHour < 9) mealType = "Breakfast";
    else if (currentHour >= 12 && currentHour < 14) mealType = "Lunch";
    else if (currentHour >= 17 && currentHour < 18) mealType = "Snacks";
    else if (currentHour >= 20 && currentHour < 22) mealType = "Dinner";
    else {
      return res.status(400).json({ success: false, message: "Mess is currently CLOSED." });
    }

    // 3. Check if already eaten TODAY
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const alreadyAte = await MealLog.findOne({
      studentId: studentId,
      mealType: mealType,
      scannedAt: { $gte: startOfDay } // Look for logs after midnight today
    });

    if (alreadyAte) {
      return res.status(409).json({ 
        success: false, 
        message: `❌ ALREADY ATE ${mealType}!`, 
        studentName: student.name 
      });
    }

    // 4. Mark as Eaten (Save to DB)
    await MealLog.create({
      studentId: studentId,
      mealType: mealType
    });

    return res.status(200).json({ 
      success: true, 
      message: `✅ ${mealType} Verified!`, 
      studentName: student.name 
    });

  } catch (error) {
    console.error("Scan Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};