const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getBookingStatus, mockSuccess } = require('../controllers/paymentController');

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/status', getBookingStatus);
router.post('/mock-success', mockSuccess); // DEV/DEMO only

module.exports = router;
