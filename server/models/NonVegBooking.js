const mongoose = require('mongoose');

const NonVegBookingSchema = new mongoose.Schema({
  studentId:   { type: String, required: true },
  studentName: { type: String, default: '' },
  studentEmail:{ type: String, default: '' },
  date:        { type: Date,   required: true },   // meal date (tomorrow)
  mealType:    { type: String, required: true },   // Breakfast / Lunch / Snacks / Dinner
  item:        { type: String, required: true },   // dish name e.g. "Chicken Curry"
  itemType:    { type: String, enum: ['egg', 'chicken'], required: true },
  price:       { type: Number, required: true },   // 30 or 120
  // Razorpay fields
  razorpayOrderId:   { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('NonVegBooking', NonVegBookingSchema);
