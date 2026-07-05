const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed:{ type: Boolean, default: false },
  score:    { type: Number, default: 0 },
}, { timestamps: true });

progressSchema.index({ user: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
