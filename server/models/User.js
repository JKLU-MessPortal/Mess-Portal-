const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  rollNumber: {
    type: String,
    default: ''
  },
  authProvider: { 
    type: String, 
    default: "microsoft"
  },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'contractor', 'accountant'], 
    default: 'student' 
  },
  isBlocked: {
    type: Boolean,
    default: false, 
  },
  // --- Student Settings Fields ---
  dietaryPreference: {
    type: String,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Strict-Vegetarian (Jain Food)', ''],
    default: ''
  },
  residencyStatus: {
    type: String,
    enum: ['Hosteller', 'Day-Scholar', ''],
    default: ''
  },
  foodAllergies: {
    type: String,
    default: ''
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);