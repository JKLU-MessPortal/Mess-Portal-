const mongoose = require('mongoose');

const PollPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  category: {
    type: String,
    enum: ['Food Quality', 'Hygiene', 'Service', 'Timing', 'Cleanliness', 'Other'],
    default: 'Other',
  },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true },
  upvotedBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Two-step resolve: admin acts first, creator confirms
  adminResolved:   { type: Boolean, default: false },
  adminResolvedAt: { type: Date, default: null },
  status:    { type: String, enum: ['active', 'resolved'], default: 'active' },
  resolvedAt:{ type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('PollPost', PollPostSchema);
