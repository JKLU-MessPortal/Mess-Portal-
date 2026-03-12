const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes'); 
const reviewRoutes = require('./routes/reviewRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const messRoutes = require('./routes/messRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // Updated to match your Vite frontend port
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
app.use(express.json());

// Allow Frontend to access the 'uploads' folder for photos
app.use('/uploads', express.static('uploads')); 

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};

connectDB();

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

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
  console.log(`Server is running on http://localhost:${PORT}`);
});