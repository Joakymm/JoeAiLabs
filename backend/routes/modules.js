const express = require('express');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Optional auth: attach user if token provided, but don't block
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

router.get('/', optionalAuth, async (req, res) => {
  try {
    const modules = await Module.find({ published: true }).sort({ order: 1 });
    const modIds = modules.map(m => m._id);

    const lessonCounts = await Lesson.aggregate([
      { $match: { moduleId: { $in: modIds } } },
      { $group: { _id: '$moduleId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    lessonCounts.forEach(l => { countMap[l._id.toString()] = l.count; });

    let userProgress = [];
    if (req.user) {
      const allLessons = await Lesson.find({ moduleId: { $in: modIds } });
      const lessonIds = allLessons.map(l => l._id);
      userProgress = await Progress.find({ user: req.user._id, lessonId: { $in: lessonIds }, completed: true });
    }
    const completedLessonIds = new Set(userProgress.map(p => p.lessonId.toString()));

    const allLessonsByModule = {};
    if (req.user) {
      const all = await Lesson.find({ moduleId: { $in: modIds } });
      all.forEach(l => {
        if (!allLessonsByModule[l.moduleId.toString()]) allLessonsByModule[l.moduleId.toString()] = [];
        allLessonsByModule[l.moduleId.toString()].push(l);
      });
    }

    const data = modules.map(mod => {
      const mid = mod._id.toString();
      const lessonCount = countMap[mid] || 0;
      const modLessons = allLessonsByModule[mid] || [];
      const completedInMod = modLessons.filter(l => completedLessonIds.has(l._id.toString())).length;
      const progressPct = lessonCount > 0 ? Math.round((completedInMod / lessonCount) * 100) : 0;

      return {
        _id: mod._id,
        title: mod.title,
        subtitle: mod.subtitle || '',
        description: mod.description,
        emoji: mod.emoji || mod.icon || '',
        color: mod.color || 'green',
        order: mod.order,
        isPremium: mod.isPremium || false,
        isPublished: mod.isPublished || mod.published || false,
        estimatedHours: mod.estimatedHours || 0,
        lessonCount,
        userCompletedCount: completedInMod,
        progressPct,
        isLocked: false,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

    const lessons = await Lesson.find({ moduleId: mod._id, published: true }).sort({ order: 1 });

    let userProgress = [];
    if (req.user) {
      userProgress = await Progress.find({
        user: req.user._id,
        lessonId: { $in: lessons.map(l => l._id) },
      });
    }
    const completedMap = {};
    userProgress.forEach(p => { completedMap[p.lessonId.toString()] = p.completed; });

    const lessonsWithProgress = lessons.map(l => ({
      _id: l._id,
      moduleId: l.moduleId,
      title: l.title,
      content: l.content,
      summary: l.summary || '',
      duration: l.duration || 0,
      order: l.order,
      isCompleted: completedMap[l._id.toString()] || false,
      tips: l.tips || [],
      keyTakeaways: l.keyTakeaways || [],
    }));

    res.json({
      success: true,
      data: {
        module: {
          _id: mod._id,
          title: mod.title,
          subtitle: mod.subtitle || '',
          description: mod.description,
          emoji: mod.emoji || mod.icon || '',
          color: mod.color || 'green',
          order: mod.order,
          isPremium: mod.isPremium || false,
          estimatedHours: mod.estimatedHours || 0,
          lessonCount: lessons.length,
        },
        lessons: lessonsWithProgress,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
