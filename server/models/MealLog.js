const mongoose = require('mongoose');

const MealLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Connects to your User table
    required: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MealLog', MealLogSchema);