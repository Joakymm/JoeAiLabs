const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  subtitle:       { type: String, default: '' },
  description:    { type: String, default: '' },
  icon:           { type: String, default: '' },
  emoji:          { type: String, default: '' },
  color:          { type: String, default: '#6366f1' },
  order:          { type: Number, default: 0 },
  published:      { type: Boolean, default: false },
  isPublished:    { type: Boolean, default: false },
  isPremium:      { type: Boolean, default: false },
  estimatedHours: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
