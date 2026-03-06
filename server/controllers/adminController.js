const User = require('../models/User'); 
const Menu = require('../models/Menu');
const MealBooking = require('../models/MealBooking');
const Notice = require('../models/Notice');

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