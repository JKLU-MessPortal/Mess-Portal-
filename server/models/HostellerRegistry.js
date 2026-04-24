const mongoose = require('mongoose');

// This registry acts as the "hosteller whitelist".
// If a student's email is here, they are automatically marked as a Hosteller on login.
const HostellerRegistrySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
  },
  addedBy: {
    type: String,  // Admin's email who added this entry
    default: 'admin',
  },
}, { timestamps: true });

module.exports = mongoose.model('HostellerRegistry', HostellerRegistrySchema);
