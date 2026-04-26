const Razorpay = require('razorpay');
const crypto = require('crypto');
const NonVegBooking = require('../models/NonVegBooking');

// Pricing rules
const EGG_KEYWORDS = ['egg', 'omelette', 'omlette', 'boiled egg', 'anda', 'bhurji'];
const isEggItem = (name) => EGG_KEYWORDS.some(kw => name.toLowerCase().includes(kw));

const getPrice = (itemName) => isEggItem(itemName) ? 30 : 120;
const getItemType = (itemName) => isEggItem(itemName) ? 'egg' : 'chicken';

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// Creates a Razorpay order and saves a pending NonVegBooking
exports.createOrder = async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, date, mealType, item } = req.body;
    if (!studentId || !date || !mealType || !item) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if already booked for this slot
    const existing = await NonVegBooking.findOne({
      studentId,
      date: new Date(date),
      mealType,
      item,
      status: 'paid'
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already booked this non-veg item.' });
    }

    const price = getPrice(item);
    const itemType = getItemType(item);
    const amountPaise = price * 100; // Razorpay uses paise

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `nv_${String(studentId).slice(-8)}_${Date.now().toString().slice(-10)}`,
      notes: { studentId, mealType, item, date }
    });

    // Save pending booking
    const booking = await NonVegBooking.create({
      studentId, studentName, studentEmail,
      date: new Date(date),
      mealType, item, itemType, price,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      bookingId: booking._id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
  }
};

// POST /api/payment/verify
// Verifies Razorpay signature and marks booking as paid
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await NonVegBooking.findByIdAndUpdate(bookingId, { status: 'failed' });
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Mark as paid
    await NonVegBooking.findByIdAndUpdate(bookingId, {
      razorpayPaymentId,
      razorpaySignature,
      status: 'paid'
    });

    res.json({ success: true, message: 'Payment verified! Non-veg meal booked successfully.' });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
  }
};

// GET /api/payment/status?studentId=X&date=Y&mealType=Z
exports.getBookingStatus = async (req, res) => {
  try {
    const { studentId, date } = req.query;
    if (!studentId || !date) return res.status(400).json({ success: false });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await NonVegBooking.find({
      studentId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'paid'
    });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// POST /api/payment/mock-success  (DEV/DEMO ONLY)
// Bypasses Razorpay — directly creates a paid booking for testing
exports.mockSuccess = async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, date, mealType, item } = req.body;
    if (!studentId || !date || !mealType || !item) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Prevent duplicate
    const existing = await NonVegBooking.findOne({
      studentId, date: new Date(date), mealType, item, status: 'paid'
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already booked.' });
    }

    const price = getPrice(item);
    const itemType = getItemType(item);

    await NonVegBooking.create({
      studentId, studentName: studentName || 'Test User',
      studentEmail: studentEmail || '',
      date: new Date(date), mealType, item, itemType, price,
      razorpayOrderId:   `mock_order_${Date.now()}`,
      razorpayPaymentId: `mock_pay_${Date.now()}`,
      razorpaySignature: 'mock_signature',
      status: 'paid'
    });

    res.json({ success: true, message: 'Mock payment successful! Booking confirmed.' });
  } catch (error) {
    console.error('mockSuccess error:', error);
    res.status(500).json({ success: false, message: 'Mock payment failed' });
  }
};
