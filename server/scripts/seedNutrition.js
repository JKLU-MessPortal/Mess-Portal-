/**
 * One-time seeder script — uploads mess_nutrition.json to MongoDB Atlas.
 * Run once from the /server directory:
 *   node scripts/seedNutrition.js
 */

require('dotenv').config(); // loads server/.env when run from /server directory
const mongoose = require('mongoose');
const Nutrition = require('../models/Nutrition');
const data = require('../data/nutrition.json');

const seed = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    // Clear existing data so we can re-seed cleanly
    await Nutrition.deleteMany({});
    console.log('🗑️  Old nutrition data cleared.\n');

    // Bulk insert all dishes
    const inserted = await Nutrition.insertMany(data);
    console.log(`✅ Successfully seeded ${inserted.length} nutrition records to MongoDB!\n`);

    // Quick preview
    console.log('First 3 records:');
    inserted.slice(0, 3).forEach(d => {
      console.log(`  • [${d.id}] ${d.name} — ${d.calories} kcal`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
};

seed();
