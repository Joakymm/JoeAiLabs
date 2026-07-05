const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
}, { timestamps: true });

bookmarkSchema.index({ user: 1, prompt: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
