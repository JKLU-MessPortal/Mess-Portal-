const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  status: { 
    type: String, 
    enum: ['booked', 'cancelled', 'consumed'], 
    default: 'booked' 
  },
  excludedItems: [String], // Items the student explicitly removed
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);