const express = require('express');
const router = express.Router();

// Import the functions from the controller
const { microsoftLogin, getSettings, updateSettings, me, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
// Define the Routes
router.post('/microsoft-login', microsoftLogin);
router.get('/settings', authenticateToken, getSettings);
router.put('/settings', authenticateToken, updateSettings);
router.get('/me', authenticateToken, me);
router.post('/logout', logout);

module.exports = router;