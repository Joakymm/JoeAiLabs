const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USDT' },
  status: { type: String, enum: ['pending', 'paid', 'expired', 'cancelled'], default: 'pending' },
  planType: { type: String, enum: ['monthly', 'lifetime'], required: true },
  binanceTransactionId: { type: String, default: '' },
  prepayId: { type: String, default: '' },
  mpesaReceipt: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
