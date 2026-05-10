const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  source: { type: String, enum: ['mpesa', 'airtel', 'discord'], required: true },
}, { timestamps: true });

waitlistSchema.index({ email: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
