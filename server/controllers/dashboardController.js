const Menu = require('../models/Menu');
const MealBooking = require('../models/MealBooking');

// The fixed monthly limits set by the Mess Contractor
const MONTHLY_LIMITS = {
  Breakfast: 5,
  Lunch: 3,
  Snacks: 3,
  Dinner: 5
};

exports.getDashboardData = async (req, res) => {
  try {
    const { studentId } = req.query; // Now we check WHICH student is asking
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowName = days[tomorrow.getDay()];

    // Fetch Menus
    const todayMenu = await Menu.find({ dayOfWeek: todayName });
    const tomorrowMenu = await Menu.find({ dayOfWeek: tomorrowName });
    const fullMenu = await Menu.find({}); 

    // Calculate this student's Monthly Skip Stats
    let skipStats = {};
    let tomorrowBookings = [];

    if (studentId) {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Get all cancellations for this month
      for (const mealType of Object.keys(MONTHLY_LIMITS)) {
        const usedSkips = await MealBooking.countDocuments({
          studentId: studentId,
          mealType: mealType,
          status: 'Cancelled',
          date: { $gte: startOfMonth }
        });
        
        skipStats[mealType] = {
          limit: MONTHLY_LIMITS[mealType],
          used: usedSkips,
          remaining: MONTHLY_LIMITS[mealType] - usedSkips
        };
      }

      // Check what the student has already skipped for tomorrow
      tomorrow.setHours(0,0,0,0);
      tomorrowBookings = await MealBooking.find({
        studentId: studentId,
        date: tomorrow
      });
    }

    res.status(200).json({ 
      success: true, 
      todayName,
      tomorrowName,
      todayMenu, 
      tomorrowMenu,
      fullMenu,
      skipStats,
      tomorrowBookings
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.toggleMeal = async (req, res) => {
  try {
    const { studentId, date, mealType, status } = req.body;

    // If student is trying to cancel, check the limits first!
    if (status === 'Cancelled') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);

      const usedSkips = await MealBooking.countDocuments({
        studentId: studentId,
        mealType: mealType,
        status: 'Cancelled',
        date: { $gte: startOfMonth }
      });

      if (usedSkips >= MONTHLY_LIMITS[mealType]) {
        return res.status(400).json({ 
          success: false, 
          message: `Limit Reached! You have already skipped ${MONTHLY_LIMITS[mealType]} ${mealType}s this month.` 
        });
      }
    }

    // If safe, save to database
    const booking = await MealBooking.findOneAndUpdate(
      { studentId, date: new Date(date).setHours(0,0,0,0), mealType },
      { status },
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      message: `${mealType} has been successfully ${status === 'Cancelled' ? 'Skipped' : 'Added Back'}!`,
      booking 
    });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
};
exports.getStudentHistory = async (req, res) => {
  try {
    const { studentId } = req.query;
    
    // Find all bookings for this student, sorted by newest date first
    const history = await MealBooking.find({ studentId }).sort({ date: -1 });
    
    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ success: false, message: "Failed to load history" });
  }
};