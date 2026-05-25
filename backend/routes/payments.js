const router = require('express').Router();
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Waitlist = require('../models/Waitlist');
const { protect } = require('../middleware/auth');
const binancePay = require('../services/binancePay');

// ── POST /api/payments/binance/create-order ─────────────────────────────────
router.post('/binance/create-order', protect, async (req, res) => {
  try {
    const { planType } = req.body;
    if (!planType || !['monthly', 'lifetime'].includes(planType)) {
      return res.status(400).json({ success: false, message: 'Invalid plan type. Choose monthly or lifetime.' });
    }

    const amount = planType === 'monthly' ? 9.99 : 29.00;
    const orderId = `JEL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const payment = await Payment.create({
      userId: req.user._id,
      orderId,
      amount,
      planType,
      currency: 'USDT',
    });

    let checkoutUrl = null;
    let qrContent = null;

    if (process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET_KEY) {
      try {
        const result = await binancePay.createOrder({ amount, orderId, planType });
        checkoutUrl = result.checkoutUrl;
        qrContent = result.qrContent;
        payment.prepayId = result.prepayId;
        await payment.save();
      } catch (err) {
        console.error('Binance order error:', err.message);
      }
    }

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        orderId,
        amount,
        planType,
        checkoutUrl,
        qrContent,
        status: payment.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/binance/webhook ──────────────────────────────────────
router.post('/binance/webhook', async (req, res) => {
  try {
    const timestamp = req.headers['binancepay-timestamp'];
    const nonce = req.headers['binancepay-nonce'];
    const signature = req.headers['binancepay-signature'];
    const payload = JSON.stringify(req.body);

    if (!binancePay.verifySignature(timestamp, nonce, payload, signature)) {
      return res.status(401).json({ success: false, message: 'Invalid signature.' });
    }

    const { bizType, data } = req.body;
    if (bizType !== 'PAY') return res.status(200).json({ returnCode: 'SUCCESS', returnMessage: null });

    const { merchantTradeNo, status, transactionId } = data;

    const payment = await Payment.findOne({ orderId: merchantTradeNo });
    if (!payment) {
      return res.status(200).json({ returnCode: 'SUCCESS', returnMessage: null });
    }

    if (payment.status === 'paid') {
      return res.status(200).json({ returnCode: 'SUCCESS', returnMessage: 'Already processed' });
    }

    if (status === 'PAID') {
      payment.status = 'paid';
      payment.binanceTransactionId = transactionId || '';
      await payment.save();

      await User.findByIdAndUpdate(payment.userId, {
        isPremium: true,
        $inc: { reputationScore: 50 },
      });

      console.log(`✅ User ${payment.userId} upgraded to premium (${payment.planType})`);
    }

    res.json({ returnCode: 'SUCCESS', returnMessage: null });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).json({ returnCode: 'SUCCESS', returnMessage: null });
  }
});

// ── GET /api/payments/status/:orderId ───────────────────────────────────────
router.get('/status/:orderId', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId, userId: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    res.json({ success: true, data: { status: payment.status, planType: payment.planType } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/simulate/mpesa ──────────────────────────────────────
// Simulated M-Pesa STK Push for Demo Purposes
router.post('/simulate/mpesa', protect, async (req, res) => {
  try {
    const { phoneNumber, amount, planType } = req.body;
    if (!phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: 'Phone and amount required.' });
    }

    const orderId = `MPESA-${Date.now()}`;
    const payment = await Payment.create({
      userId: req.user._id,
      orderId,
      amount,
      planType,
      currency: 'KES',
      status: 'pending'
    });

    // Simulate the delay of a mobile STK push
    setTimeout(async () => {
      try {
        payment.status = 'paid';
        await payment.save();
        await User.findByIdAndUpdate(payment.userId, { isPremium: true, $inc: { reputationScore: 50 } });
      } catch (err) {
        console.error('M-Pesa Simulation Background Task Error:', err.message);
      }
    }, 5000);

    res.json({
      success: true,
      message: 'STK Push sent. Please check your phone to complete the simulation.',
      data: { orderId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/simulate/airtel ─────────────────────────────────────
router.post('/simulate/airtel', protect, async (req, res) => {
  try {
    const { phoneNumber, amount, planType } = req.body;
    const orderId = `AIRTEL-${Date.now()}`;
    
    await Payment.create({
      userId: req.user._id,
      orderId,
      amount,
      planType,
      currency: 'KES',
      status: 'paid' // Simulate instant success for Airtel
    });

    await User.findByIdAndUpdate(req.user._id, { isPremium: true, $inc: { reputationScore: 50 } });

    res.json({ success: true, message: 'Airtel Money payment successful!', data: { orderId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/waitlist ─────────────────────────────────────────────
router.post('/waitlist', async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email || !source) {
      return res.status(400).json({ success: false, message: 'Email and source are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }
    if (!['mpesa', 'airtel', 'discord'].includes(source)) {
      return res.status(400).json({ success: false, message: 'Invalid source.' });
    }

    const existing = await Waitlist.findOne({ email: email.toLowerCase(), source });
    if (existing) {
      return res.json({ success: true, message: 'You are already on the list!' });
    }

    await Waitlist.create({ email, source });
    res.json({ success: true, message: 'You have been added to the waitlist! We will notify you when it launches.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
