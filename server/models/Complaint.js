const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  studentId:   { type: String, required: true },
  studentName: { type: String, required: true },
  text:        { type: String, required: true },
  image:       { type: String, default: '' },   // filename in /uploads
  createdAt:   { type: Date,   default: Date.now },
});

// Index for fast name search + date sort
ComplaintSchema.index({ studentName: 'text' });
ComplaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
