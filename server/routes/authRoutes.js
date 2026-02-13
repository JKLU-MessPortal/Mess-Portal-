const express = require('express');
const router = express.Router();

// Import the function we just created
const { microsoftLogin } = require('../controllers/authController');

// Define the Route
router.post('/microsoft-login', microsoftLogin);

module.exports = router;