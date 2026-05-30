function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      matrix[i][j] = b[i-1] === a[j-1] ? matrix[i-1][j-1] : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
  return matrix[b.length][a.length];
}

const router = require('express').Router();
const { Quiz, QuizAttempt } = require('../models/Quiz');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── GET /api/quizzes/module/:moduleId ──
// Get the published quiz for a module, stripped of correct answers
router.get('/module/:moduleId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ moduleId: req.params.moduleId, isPublished: true });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this module.' });
    }

    // Strip correctAnswer from questions so users can't cheat via devtools
    const strippedQuestions = quiz.questions.map(q => {
      const qObj = q.toObject();
      delete qObj.correctAnswer;
      return qObj;
    });

    const quizObj = quiz.toObject();
    quizObj.questions = strippedQuestions;

    // Find the latest attempt by the current user
    const lastAttempt = await QuizAttempt.findOne({ userId: req.user._id, quizId: quiz._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizObj,
      lastAttempt: lastAttempt || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/quizzes/:quizId/submit ──
// Submit answers for a quiz, evaluate, and award reputation points
router.post('/:quizId/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, answer }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required.' });
    }

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    let earnedPoints = 0;
    let totalPoints = 0;
    const processedAnswers = [];

    // Create lookup map of questions to secure O(1) performance
    const questionMap = new Map();
    quiz.questions.forEach(q => {
      questionMap.set(q._id.toString(), q);
      totalPoints += q.points || 1;
    });

    // Evaluate user answers
    answers.forEach(ans => {
      const q = questionMap.get(ans.questionId);
      if (q) {
        const normalize = (s) => s.trim().toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        const userAns = normalize(ans.answer || '');
        const correctAns = normalize(q.correctAnswer || '');
        let isCorrect = userAns === correctAns;
        // Fuzzy: check if one contains the other (for longer answers)
        if (!isCorrect && userAns.length > 3 && correctAns.length > 3) {
          if (userAns.includes(correctAns) || correctAns.includes(userAns)) {
            isCorrect = true;
          }
        }
        // Levenshtein distance for shorter answers (< 50 chars)
        if (!isCorrect && userAns.length < 50 && correctAns.length < 50) {
          const dist = levenshteinDistance(userAns, correctAns);
          const maxLen = Math.max(userAns.length, correctAns.length);
          if (maxLen > 0 && dist / maxLen < 0.3) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          earnedPoints += q.points || 1;
        }

        processedAnswers.push({
          questionId: q._id,
          answer: ans.answer || '',
          isCorrect
        });
      }
    });

    // Handle questions not submitted (skipped)
    quiz.questions.forEach(q => {
      const answered = answers.some(ans => ans.questionId === q._id.toString());
      if (!answered) {
        processedAnswers.push({
          questionId: q._id,
          answer: '',
          isCorrect: false
        });
      }
    });

    // Calculate score
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Check if user has already passed this quiz before to avoid double reputation awards
    const alreadyPassed = await QuizAttempt.exists({
      userId: req.user._id,
      quizId: quiz._id,
      passed: true
    });

    // Create the quiz attempt log
    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      quizId: quiz._id,
      answers: processedAnswers,
      score,
      totalPoints,
      passed
    });

    // If passed and never passed before, award +50 reputation points
    let repAdded = 0;
    if (passed && !alreadyPassed) {
      repAdded = 50;
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { reputationScore: repAdded }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        attempt,
        quiz, // Returned to allow user to review correct answers side-by-side
        repAdded
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
