const express = require('express');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/module/:moduleId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ moduleId: req.params.moduleId, published: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found for this module' });
    const sanitized = {
      _id: quiz._id,
      moduleId: quiz.moduleId,
      title: quiz.title,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
      })),
    };
    res.json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:quizId/submit', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ success: false, message: 'Invalid answers' });
    }
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    const result = await QuizResult.create({
      user: req.user._id,
      quizId: quiz._id,
      answers,
      score,
      passed,
    });
    res.json({ success: true, data: { score, passed, total: quiz.questions.length, correct } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
