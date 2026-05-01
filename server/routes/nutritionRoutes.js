const express = require('express');
const router = express.Router();
const Nutrition = require('../models/Nutrition');

// ── Simple JS fuzzy scorer ────────────────────────────────────
// Returns a 0-1 score for how well `needle` matches `haystack`.
function fuzzyScore(needle, haystack) {
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (h.includes(n)) return 1;               // substring → top score
  let score = 0, ni = 0;
  for (let hi = 0; hi < h.length && ni < n.length; hi++) {
    if (h[hi] === n[ni]) { score++; ni++; }
  }
  return ni === n.length ? score / h.length : 0;
}

// GET /api/nutrition — returns ALL records
router.get('/', async (req, res) => {
  try {
    const nutrition = await Nutrition.find({}).lean();
    res.json({ success: true, nutrition });
  } catch (error) {
    console.error('Nutrition fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch nutrition data' });
  }
});

// GET /api/nutrition/search?q=alo&nonVeg=true  — fuzzy search, up to 10 results
router.get('/search', async (req, res) => {
  const q      = (req.query.q      || '').trim();
  const nonVeg =  req.query.nonVeg === 'true';
  if (!q) return res.json({ success: true, dishes: [] });
  try {
    // Broad candidate pull: name contains any word of the query
    const words = q.split(/\s+/).filter(Boolean);
    const regexParts = words.map(w => new RegExp(w, 'i'));
    const filter = { $or: regexParts.map(r => ({ name: r })) };

    // Restrict to non-veg dishes when requested
    if (nonVeg) {
      filter.name = { $regex: /chicken|egg|mutton|omlette|omelette/i };
    }

    const candidates = await Nutrition.find(filter).lean();

    // Score + sort
    const scored = candidates
      .map(d => ({ ...d, _score: fuzzyScore(q, d.name) }))
      .filter(d => d._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);

    res.json({ success: true, dishes: scored });
  } catch (error) {
    console.error('Nutrition search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// GET /api/nutrition/lookup?name=Dal Tadka  (kept for backward compat)
router.get('/lookup', async (req, res) => {
  const query = (req.query.name || '').trim();
  if (!query) return res.status(400).json({ success: false, message: 'name query param required' });
  try {
    let dish = await Nutrition.findOne({ name: { $regex: new RegExp(`^${query}$`, 'i') } }).lean();
    if (!dish) dish = await Nutrition.findOne({ name: { $regex: new RegExp(query, 'i') } }).lean();
    if (dish) return res.json({ success: true, dish });
    return res.json({ success: false, message: 'Nutrition data not found for this item' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during lookup' });
  }
});

// POST /api/nutrition — save a custom dish to the database
router.post('/', async (req, res) => {
  try {
    const { id, name, calories, carbohydrate, protein, fat, free_sugar, fibre, byweight, byquantity, quantity_unit } = req.body;
    if (!name || calories == null) {
      return res.status(400).json({ success: false, message: 'name and calories are required.' });
    }
    // Generate an ID if not provided
    const count = await Nutrition.countDocuments();
    const dishId = id || `DISH_CUSTOM_${String(count + 1).padStart(3, '0')}`;

    // Upsert — if same name already exists, update it
    const dish = await Nutrition.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { id: dishId, name, calories, carbohydrate: carbohydrate ?? 0, protein: protein ?? 0,
        fat: fat ?? 0, free_sugar: free_sugar ?? 0, fibre: fibre ?? 0,
        byweight: byweight ?? false, byquantity: byquantity ?? true,
        quantity_unit: quantity_unit || 'per serving' },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, dish });
  } catch (error) {
    console.error('Nutrition save error:', error);
    res.status(500).json({ success: false, message: 'Failed to save dish.' });
  }
});

module.exports = router;
