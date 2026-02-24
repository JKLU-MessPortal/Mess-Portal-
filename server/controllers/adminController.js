const Menu = require('../models/Menu');
const MealBooking = require('../models/MealBooking');
const User = require('../models/User'); // NEW: We bring in the User database!

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

    const stats = { Breakfast: 0, Lunch: 0, Snacks: 0, Dinner: 0 };
    cancellations.forEach(booking => {
      if (stats[booking.mealType] !== undefined) {
        stats[booking.mealType]++;
      }
    });

    res.status(200).json({ success: true, stats, totalSaved: cancellations.length });
  } catch (error) {
    console.error("Headcount Error:", error);
    res.status(500).json({ success: false, message: "Failed to load stats." });
  }
};

// 3. BULLETPROOF REFUND LEDGER
exports.getRefundLedger = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    // Find all cancellations
    const cancellations = await MealBooking.find({
      status: 'Cancelled',
      date: { $gte: startOfMonth }
    });

    const ledger = {};

    // Loop through them and manually fetch the student's name
    for (let booking of cancellations) {
      const sId = booking.studentId;

      // If we haven't seen this student yet, look them up in the User database
      if (!ledger[sId]) {
        let studentName = "Unknown Student";
        let studentEmail = "No Email Found";

        try {
          // Manually grab the name and email
          const studentUser = await User.findById(sId);
          if (studentUser) {
            studentName = studentUser.name;
            studentEmail = studentUser.email;
          }
        } catch (err) {
          console.log("Could not find user details for ID:", sId);
        }

        ledger[sId] = {
          name: studentName,
          email: studentEmail,
          totalCancelled: 0,
          meals: []
        };
      }

      // Add the cancelled meal to their list
      ledger[sId].totalCancelled++;
      const dateStr = new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      ledger[sId].meals.push(`${dateStr} - ${booking.mealType}`);
    }

    res.status(200).json({ success: true, ledger: Object.values(ledger) });
  } catch (error) {
    console.error("Ledger Error:", error);
    res.status(500).json({ success: false, message: "Failed to load refund ledger." });
  }
};