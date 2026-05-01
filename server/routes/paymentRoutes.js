const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getBookingStatus, mockSuccess, createMealOrder, verifyMealPayment, mockMealSuccess } = require('../controllers/paymentController');

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/status', getBookingStatus);
router.post('/mock-success', mockSuccess); // DEV/DEMO only

router.post('/create-meal-order', createMealOrder);
router.post('/verify-meal', verifyMealPayment);
router.post('/mock-meal-success', mockMealSuccess);

module.exports = router;
