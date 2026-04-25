/**
 * One-time fix script: Updates Sarvesh's role from 'controller' → 'student'
 * Run with: node fixRole.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function fixRole() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Use native driver to bypass Mongoose enum validation entirely
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find Sarvesh first
    const sarvesh = await usersCollection.findOne({ name: /sarvesh/i });

    if (!sarvesh) {
      console.log('❌ User "Sarvesh" not found. Try searching by email instead.');
      console.log('\n🔍 Listing all users with non-student roles:');
      const nonStudents = await usersCollection.find({ role: { $ne: 'student' } }).toArray();
      nonStudents.forEach(u => console.log(`  - ${u.name} | ${u.email} | role: ${u.role}`));
    } else {
      console.log(`\n🔍 Found: ${sarvesh.name} | ${sarvesh.email} | Current role: ${sarvesh.role}`);

      const result = await usersCollection.updateOne(
        { _id: sarvesh._id },
        { $set: { role: 'student' } }
      );

      if (result.modifiedCount === 1) {
        console.log(`✅ SUCCESS: Sarvesh's role has been updated to "student"!`);
        console.log('👉 Ask Sarvesh to log out and log back in for the change to take effect on the frontend.');
      } else {
        console.log('⚠️  No changes made. Role may already be "student".');
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
  }
}

fixRole();
