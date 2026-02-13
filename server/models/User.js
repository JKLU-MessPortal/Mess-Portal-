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
    required: true 
  },
  password: { 
    type: String, 
    default: "" // <--- FIXED: No longer required!
  },
  authProvider: { 
    type: String, 
    default: "local" 
  },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'mess_staff'], 
    default: 'student' 
  },
  qrToken: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);