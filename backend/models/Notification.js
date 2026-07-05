const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow_request', 'follow_accepted', 'message', 'achievement'],
    required: true,
  },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  read: { type: Boolean, default: false },
  metadata: {
    postPreview: { type: String, maxlength: 200 },
    commentPreview: { type: String, maxlength: 200 },
    courseName: { type: String },
  },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
