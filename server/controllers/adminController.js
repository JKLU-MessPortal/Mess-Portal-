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

// 3. THE "UNIVERSAL MATCH" REFUND LEDGER (Matches ID, Email, OR Roll Number)
exports.getRefundLedger = async (req, res) => {
  try {
    console.log("--- STARTING UNIVERSAL MATCH ---");

    // 1. Fetch ALL cancellations
    const cancellations = await MealBooking.find({ status: 'Cancelled' });
    
    // 2. Fetch ALL users
    const allUsers = await User.find({});

    const ledger = {};

    cancellations.forEach(booking => {
      // Skip broken records
      if (!booking.studentId) return;

      const bookingRef = booking.studentId.toString();

      // 🔍 THE UNIVERSAL SEARCH 🔍
      // We look for a user who matches by ID, OR Email, OR Roll Number
      const student = allUsers.find(user => 
        user._id.toString() === bookingRef || 
        user.email === bookingRef || 
        user.rollNumber === bookingRef
      );

      // If we found the student (by any method), add to ledger
      if (student) {
        const sId = student._id.toString();

        if (!ledger[sId]) {
          ledger[sId] = {
            name: student.name,
            email: student.email,
            totalCancelled: 0,
            meals: []
          };
        }

        ledger[sId].totalCancelled++;
        
        // Format Date
        const dateStr = new Date(booking.date).toLocaleDateString('en-US', { 
          weekday: 'short', month: 'short', day: 'numeric' 
        });
        
        ledger[sId].meals.push(`${dateStr} - ${booking.mealType}`);
      }
    });

    console.log("--- FINISHED MATCHING ---");
    res.status(200).json({ success: true, ledger: Object.values(ledger) });

  } catch (error) {
    console.error("Ledger Error:", error);
    res.status(500).json({ success: false, message: "Failed to load refund ledger." });
  }
};