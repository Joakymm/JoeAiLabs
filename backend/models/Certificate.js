const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

certificateSchema.index({ user: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
