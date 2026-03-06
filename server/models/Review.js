const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // 1 se 5 stars
  comment: { type: String, required: true },
  image: { type: String, default: "" }, // Image ka naam (agar upload hui toh)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);