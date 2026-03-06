const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Review = require('../models/Review');

// 1. Multer Setup (Photo kahan aur kis naam se save hogi)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Jo folder aapne abhi banaya
  },
  filename: function (req, file, cb) {
    // Photo ko ek unique naam do (taaki 2 log same naam ki photo dale toh overwrite na ho)
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage: storage });

// 2. Submit Review Route (Student yahan POST request bhejega)
// 'foodImage' wo naam hai jisse frontend se photo aayegi
router.post('/submit', upload.single('foodImage'), async (req, res) => {
  try {
    const { studentId, studentName, rating, comment } = req.body;
    let imageFileName = "";

    // Agar user ne photo bheji hai, toh uska naam save kar lo
    if (req.file) {
      imageFileName = req.file.filename;
    }

    const newReview = await Review.create({
      studentId,
      studentName,
      rating: Number(rating),
      comment,
      image: imageFileName
    });

    res.status(200).json({ success: true, message: "Review submitted successfully!", review: newReview });
  } catch (error) {
    console.error("Review Upload Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit review." });
  }
});

// 3. Get All Reviews Route (Admin ko dikhane ke liye)
router.get('/all', async (req, res) => {
  try {
    // Latest reviews sabse upar aayenge (-1 matlab descending)
    const reviews = await Review.find().sort({ createdAt: -1 }); 
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews." });
  }
});

module.exports = router;