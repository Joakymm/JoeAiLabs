const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 1 },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  passingScore: { type: Number, default: 70 },
  questions: [questionSchema],
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    answer: String,
    isCorrect: Boolean,
  }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  Quiz: mongoose.model('Quiz', quizSchema),
  QuizAttempt: mongoose.model('QuizAttempt', quizAttemptSchema),
};
