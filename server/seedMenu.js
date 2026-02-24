require('dotenv').config();
const mongoose = require('mongoose');
const Menu = require('./models/Menu'); // Connects to your Menu model

const sampleMenu = [
  // MONDAY
  { dayOfWeek: 'Monday', mealType: 'Breakfast', items: ['Poha', 'Jalebi', 'Tea', 'Milk'] },
  { dayOfWeek: 'Monday', mealType: 'Lunch', items: ['Rajma', 'Jeera Rice', 'Mix Veg', 'Roti', 'Salad'] },
  { dayOfWeek: 'Monday', mealType: 'Snacks', items: ['Samosa', 'Chutney', 'Tea'] },
  { dayOfWeek: 'Monday', mealType: 'Dinner', items: ['Kadhai Paneer', 'Dal Tadka', 'Roti', 'Gulab Jamun'] },
  
  // TUESDAY
  { dayOfWeek: 'Tuesday', mealType: 'Breakfast', items: ['Aloo Paratha', 'Curd', 'Pickle', 'Tea'] },
  { dayOfWeek: 'Tuesday', mealType: 'Lunch', items: ['Chole', 'Bhature', 'Rice', 'Onion Salad'] },
  { dayOfWeek: 'Tuesday', mealType: 'Snacks', items: ['Patties', 'Coffee'] },
  { dayOfWeek: 'Tuesday', mealType: 'Dinner', items: ['Mix Veg', 'Dal Fry', 'Roti', 'Rice', 'Kheer'] },

  // Add a generic fallback for other days just so they aren't empty
  { dayOfWeek: 'Wednesday', mealType: 'Lunch', items: ['Dal Makhani', 'Rice', 'Roti'] },
  { dayOfWeek: 'Thursday', mealType: 'Lunch', items: ['K कड़ी Chawal (Kadhi Rice)', 'Aloo Sabzi'] },
  { dayOfWeek: 'Friday', mealType: 'Lunch', items: ['Soyabean', 'Dal', 'Rice', 'Roti'] },
  { dayOfWeek: 'Saturday', mealType: 'Lunch', items: ['Puri', 'Aloo Sabzi', 'Boondi Raita'] },
  { dayOfWeek: 'Sunday', mealType: 'Dinner', items: ['Special Thali', 'Ice Cream'] }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Database...');

    // Clear old menus just in case
    await Menu.deleteMany(); 
    console.log('🗑️ Cleared old menu data...');

    // Insert the new sample menu
    await Menu.insertMany(sampleMenu);
    console.log('🍔 Successfully uploaded new menu!');

    process.exit(); // Stop the script
  } catch (error) {
    console.error('❌ Error uploading menu:', error);
    process.exit(1);
  }
};

seedDatabase();