const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  order:       { type: Number, required: true, unique: true },
  title:       { type: String, required: true, trim: true },
  subtitle:    { type: String, default: '' },
  description: { type: String, required: true },
  emoji:       { type: String, default: '📚' },
  isPremium:   { type: Boolean, default: false },  // modules 4-6 are premium
  color:       { type: String, default: 'green' }, // 'green' | 'yellow' | 'blue'
  estimatedHours: { type: Number, default: 2 },
  tags:        [{ type: String }],
  isPublished: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Module', moduleSchema);
