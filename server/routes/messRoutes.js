const express = require('express');
const router = express.Router();
const { scanQRCode } = require('../controllers/messController');

// The Scanner will hit this URL: http://localhost:5000/api/mess/scan
router.post('/scan', scanQRCode);

module.exports = router;