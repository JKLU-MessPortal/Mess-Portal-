const mongoose = require('mongoose');

const MealBookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date, // The date the meal is for (e.g., Tomorrow's date)
    required: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
    required: true
  },
  status: {
    type: String,
    enum: ['Booked', 'Cancelled'],
    default: 'Booked'
  }
});

// This ensures a student can only have ONE booking record per meal per day
MealBookingSchema.index({ studentId: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MealBooking', MealBookingSchema);