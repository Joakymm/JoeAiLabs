const express = require('express');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Waitlist = require('../models/Waitlist');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/binance/create-order', protect, async (req, res) => {
  try {
    const { planType } = req.body;
    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({ success: false, message: 'Invalid plan type' });
    }
    const orderId = 'BIN_' + Date.now() + '_' + req.user._id;
    const payment = await Payment.create({
      user: req.user._id,
      orderId,
      planType,
      status: 'pending',
    });
    res.json({
      success: true,
      data: {
        orderId: payment.orderId,
        qrcode: null,
        amount: planType === 'monthly' ? 15 : 150,
        currency: 'USDT',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/status/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId }).populate('user', 'username email');
    if (!payment) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/waitlist', async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const exists = await Waitlist.findOne({ email });
    if (exists) return res.json({ success: true, message: 'Already on the waitlist' });
    await Waitlist.create({ email, source });
    res.status(201).json({ success: true, message: 'Added to waitlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
