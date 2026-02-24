const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  dayOfWeek: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  mealType: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
    required: true 
  },
  items: { 
    type: [String], // Example: ["Rajma", "Rice", "Roti", "Salad"]
    required: true 
  }
});

module.exports = mongoose.model('Menu', MenuSchema);