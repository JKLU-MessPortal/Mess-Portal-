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
  authProvider: { 
    type: String, 
    default: "microsoft" // 'local' ki jagah default microsoft kar diya
  },
  role: { 
    type: String, 
    // 🚨 ADMIN DASHBOARD WALE ROLES MATCH KAR DIYE 🚨
    enum: ['student', 'admin', 'contractor', 'accountant'], 
    default: 'student' 
  },
  isBlocked: {
    type: Boolean,
    default: false, 
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);