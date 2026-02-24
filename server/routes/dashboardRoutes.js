const express = require('express');
const router = express.Router();
const { getDashboardData, toggleMeal } = require('../controllers/dashboardController');

// URL: http://localhost:5000/api/dashboard/data
router.get('/data', getDashboardData);

// URL: http://localhost:5000/api/dashboard/toggle
router.post('/toggle', toggleMeal);

module.exports = router;