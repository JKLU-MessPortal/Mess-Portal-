const express = require('express');
const router = express.Router();

const { getDashboardData, toggleMeal, getStudentHistory } = require('../controllers/dashboardController');

router.get('/data', getDashboardData);
router.post('/toggle', toggleMeal);
router.get('/history', getStudentHistory); // Now this will work!

module.exports = router;