const express = require('express');
const router = express.Router();

// Import the functions from the controller
const { microsoftLogin, getSettings, updateSettings } = require('../controllers/authController');

// Define the Routes
router.post('/microsoft-login', microsoftLogin);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;