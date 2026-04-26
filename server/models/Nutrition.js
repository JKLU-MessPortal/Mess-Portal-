const mongoose = require('mongoose');

const NutritionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },       // e.g. "DISH_001"
  name: { type: String, required: true },                   // e.g. "Aloo Paratha"
  calories: { type: Number, required: true },
  carbohydrate: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  free_sugar: { type: Number, default: 0 },
  fibre: { type: Number, default: 0 },
  byweight: { type: Boolean, default: false },
  byquantity: { type: Boolean, default: false },
  quantity_unit: { type: String, default: '' },
});

module.exports = mongoose.model('Nutrition', NutritionSchema);
