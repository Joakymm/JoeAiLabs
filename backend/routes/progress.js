const router = require('express').Router();
const User   = require('../models/User');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const { protect } = require('../middleware/auth');

// ── GET /api/progress — full user progress summary ────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const user    = await User.findById(req.user._id);
    const modules = await Module.find({ isPublished: true }).sort('order');
    const totalLessonsAll = await Lesson.countDocuments({ isPublished: true });

    const moduleProgress = await Promise.all(
      modules.map(async (mod) => {
        const total = await Lesson.countDocuments({ moduleId: mod._id, isPublished: true });
        const done  = user.completedLessons.filter(
          (p) => p.moduleId.toString() === mod._id.toString()
        ).length;
        return {
          moduleId:    mod._id,
          title:       mod.title,
          order:       mod.order,
          emoji:       mod.emoji,
          isPremium:   mod.isPremium,
          isLocked:    mod.isPremium && !user.isPremium && user.role !== 'admin',
          total,
          done,
          progressPct: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      })
    );

    const totalCompleted = user.completedLessons.length;
    const overallPct = totalLessonsAll > 0
      ? Math.round((totalCompleted / totalLessonsAll) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalLessons:    totalLessonsAll,
        completedLessons:totalCompleted,
        overallPct,
        reputationScore: user.reputationScore,
        isPremium:       user.isPremium,
        moduleProgress,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
