const express = require('express');
const router = express.Router();
const Nutrition = require('../models/Nutrition');

// GET /api/nutrition — returns ALL nutrition records from MongoDB
router.get('/', async (req, res) => {
  try {
    const nutrition = await Nutrition.find({}).lean();
    res.json({ success: true, nutrition });
  } catch (error) {
    console.error('Nutrition fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch nutrition data' });
  }
});

// GET /api/nutrition/lookup?name=Dal Tadka
// Fuzzy lookup: returns the closest matching dish
router.get('/lookup', async (req, res) => {
  const query = (req.query.name || '').trim();
  if (!query) return res.status(400).json({ success: false, message: 'name query param required' });

  try {
    // 1. Exact case-insensitive match
    let dish = await Nutrition.findOne({ name: { $regex: new RegExp(`^${query}$`, 'i') } }).lean();

    // 2. Partial match — dish name contains the query
    if (!dish) {
      dish = await Nutrition.findOne({ name: { $regex: new RegExp(query, 'i') } }).lean();
    }

    if (dish) return res.json({ success: true, dish });

    return res.json({ success: false, message: 'Nutrition data not found for this item' });
  } catch (error) {
    console.error('Nutrition lookup error:', error);
    res.status(500).json({ success: false, message: 'Server error during lookup' });
  }
});

module.exports = router;
