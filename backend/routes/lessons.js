const express = require('express');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

const router = express.Router();

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      const User = require('../models/User');
      req.user = await User.findById(decoded.id);
    } catch {}
  }
  next();
}

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('moduleId', 'title');

    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    let isCompleted = false;
    let userProgress = [];
    if (req.user) {
      userProgress = await Progress.find({ user: req.user._id });
      const prog = userProgress.find(p => p.lessonId.toString() === lesson._id.toString());
      isCompleted = prog ? prog.completed : false;
    }

    let nextLesson = null;
    const siblings = await Lesson.find({ moduleId: lesson.moduleId, published: true }).sort({ order: 1 });
    const currentIdx = siblings.findIndex(l => l._id.toString() === lesson._id.toString());
    if (currentIdx !== -1 && currentIdx < siblings.length - 1) {
      nextLesson = { _id: siblings[currentIdx + 1]._id };
    }

    const data = {
      lesson: {
        _id: lesson._id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        content: lesson.content,
        summary: lesson.summary || '',
        duration: lesson.duration || 0,
        order: lesson.order,
        tips: lesson.tips || [],
        keyTakeaways: lesson.keyTakeaways || [],
      },
      isCompleted,
      nextLesson,
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/complete', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, lessonId: lesson._id },
      { completed: true, score: req.body.score || 0 },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: progress, message: 'Lesson marked complete!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
