const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
}, { _id: false });

const ChatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text','image','file'], default: 'text' },
  attachments: [AttachmentSchema],
}, { timestamps: true });

ChatMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
