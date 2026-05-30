const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title:    { type: String, required: true },
  certId:   { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

certificateSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
