const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  mealType: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], 
    required: true 
  },
  items: [String], // Array of strings: ["Dal", "Rice", "Paneer"]
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Menu', MenuSchema);