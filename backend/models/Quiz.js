const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options:  [{ type: String, required: true }],
  correct:  { type: Number, required: true },
});

const quizSchema = new mongoose.Schema({
  moduleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title:      { type: String, required: true, trim: true },
  questions:  [questionSchema],
  passingScore: { type: Number, default: 70 },
  published:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
