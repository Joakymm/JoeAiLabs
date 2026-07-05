const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email:  { type: String, required: true, lowercase: true, trim: true },
  source: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
