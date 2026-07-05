const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [Number],
  score:   { type: Number, required: true },
  passed:  { type: Boolean, default: false },
}, { timestamps: true });

quizResultSchema.index({ user: 1, quizId: 1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
