const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId:    { type: String, required: true, unique: true },
  planType:   { type: String, enum: ['monthly', 'yearly'], required: true },
  status:     { type: String, enum: ['pending', 'paid', 'expired', 'cancelled'], default: 'pending' },
  amount:     { type: Number, default: 0 },
  currency:   { type: String, default: 'USDT' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
