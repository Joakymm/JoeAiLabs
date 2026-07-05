const express = require('express');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Prompt = require('../models/Prompt');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const modules = await Module.find({ published: true }).sort({ order: 1 });
    const modIds = modules.map(m => m._id);

    const [allLessons, userProgress, totalPrompts] = await Promise.all([
      Lesson.find({ moduleId: { $in: modIds }, published: true }),
      Progress.find({ user: req.user._id }).populate('lessonId', 'title moduleId'),
      Prompt.countDocuments(),
    ]);

    const lessonsByModule = {};
    allLessons.forEach(l => {
      if (!lessonsByModule[l.moduleId.toString()]) lessonsByModule[l.moduleId.toString()] = [];
      lessonsByModule[l.moduleId.toString()].push(l);
    });

    const completedLessonIds = new Set(
      userProgress.filter(p => p.completed).map(p => p.lessonId?.toString()).filter(Boolean)
    );

    const completedCount = userProgress.filter(p => p.completed).length;
    const totalLessons = allLessons.length;
    const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const moduleCards = modules.map(mod => {
      const mid = mod._id.toString();
      const modLessons = lessonsByModule[mid] || [];
      const completedInMod = modLessons.filter(l => completedLessonIds.has(l._id.toString())).length;
      const progressPct = modLessons.length > 0 ? Math.round((completedInMod / modLessons.length) * 100) : 0;

      return {
        _id: mod._id,
        title: mod.title,
        subtitle: mod.subtitle || '',
        emoji: mod.emoji || mod.icon || '',
        color: mod.color || 'green',
        order: mod.order,
        isPremium: mod.isPremium || false,
        isLocked: (mod.isPremium || false) && !req.user.isPremium,
        lessonCount: modLessons.length,
        total: modLessons.length,
        userCompletedCount: completedInMod,
        done: completedInMod,
        progressPct,
      };
    });

    // Find next incomplete lesson
    let currentLesson = null;
    const incomplete = allLessons.find(l => !completedLessonIds.has(l._id.toString()));
    if (incomplete) {
      const parentModule = modules.find(m => m._id.toString() === incomplete.moduleId.toString());
      currentLesson = {
        _id: incomplete._id,
        title: incomplete.title,
        moduleId: incomplete.moduleId,
        moduleTitle: parentModule?.title || '',
      };
    }

    const modulesCompleted = modules.filter(mod => {
      const mid = mod._id.toString();
      const modLessons = lessonsByModule[mid] || [];
      return modLessons.length > 0 && modLessons.every(l => completedLessonIds.has(l._id.toString()));
    }).length;

    res.json({
      success: true,
      data: {
        user: {
          username: req.user.username,
          role: req.user.role,
          isPremium: req.user.isPremium,
          avatar: req.user.avatar || '',
          xp: req.user.xp || 0,
        },
        stats: {
          completedLessons: completedCount,
          totalLessons,
          overallPct,
          totalPrompts,
          reputationScore: req.user.xp || 0,
          modulesCompleted,
          xp: req.user.xp || 0,
        },
        moduleCards,
        currentLesson,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
