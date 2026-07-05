const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '', maxlength: 5000 },
  mediaUrl: { type: String, default: '' },
  mediaPublicId: { type: String, default: '' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
  readAt: { type: Date },
}, { timestamps: true });

messageSchema.index({ conversationId: 1, sentAt: -1 });
messageSchema.index({ sender: 1, sentAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
