const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const messRoutes = require('./routes/messRoutes');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- 1. IMPORT YOUR ROUTES HERE ---
const authRoutes = require('./routes/authRoutes'); 

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:3000", // Allow your React Frontend
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
app.use(express.json());

// 2. Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); 
  }
};

connectDB();

// --- 3. USE YOUR ROUTES HERE ---
// This tells the server: "If a URL starts with /api/auth, go to authRoutes"
app.use('/api/auth', authRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);


// Simple Test Route
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({ 
    message: "Welcome to the JKLU Mess Portal API!", 
    database_status: dbStatus 
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});