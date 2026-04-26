const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const Complaint = require('../models/Complaint');

// ── Multer — save to /uploads ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } }); // 8 MB max

// ── POST /api/complaints — submit a complaint ─────────────────
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { studentId, studentName, text } = req.body;
    if (!studentId || !studentName || !text?.trim()) {
      return res.status(400).json({ success: false, message: 'studentId, studentName and text are required.' });
    }
    const complaint = await Complaint.create({
      studentId,
      studentName,
      text: text.trim(),
      image: req.file ? req.file.filename : '',
    });
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    console.error('Complaint submit error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit complaint.' });
  }
});

// ── GET /api/complaints — admin: list with search + date filter ─
// Query params:
//   search  — partial student name match (case-insensitive)
//   from    — ISO date string (inclusive start)
//   to      — ISO date string (inclusive end)
router.get('/', async (req, res) => {
  try {
    const { search, from, to } = req.query;
    const filter = {};

    if (search && search.trim()) {
      filter.studentName = { $regex: search.trim(), $options: 'i' };
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, complaints });
  } catch (err) {
    console.error('Complaint fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
  }
});

module.exports = router;
