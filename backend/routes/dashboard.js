const router = require('express').Router();
const User   = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Prompt = require('../models/Prompt');
const { protect } = require('../middleware/auth');

// ── GET /api/dashboard — single endpoint for dashboard page ──────────────────
router.get('/', protect, async (req, res) => {
  try {
    const user    = await User.findById(req.user._id);
    const modules = await Module.find({ isPublished: true }).sort('order');
    const totalLessonsAll = await Lesson.countDocuments({ isPublished: true });
    const totalPrompts    = await Prompt.countDocuments({ isPublished: true });

    // Build module progress cards
    const moduleCards = await Promise.all(
      modules.map(async (mod) => {
        const total = await Lesson.countDocuments({ moduleId: mod._id, isPublished: true });
        const done  = user.completedLessons.filter(
          (p) => p.moduleId.toString() === mod._id.toString()
        ).length;
        return {
          _id:         mod._id,
          order:       mod.order,
          title:       mod.title,
          subtitle:    mod.subtitle,
          emoji:       mod.emoji,
          color:       mod.color,
          isPremium:   mod.isPremium,
          isLocked:    mod.isPremium && !user.isPremium && user.role !== 'admin',
          total,
          done,
          progressPct: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      })
    );

    // Find current lesson (first incomplete in current module)
    let currentLesson = null;
    for (const card of moduleCards) {
      if (!card.isLocked && card.progressPct < 100) {
        const completedIds = user.completedLessons
          .filter((p) => p.moduleId.toString() === card._id.toString())
          .map((p) => p.lessonId.toString());
        const next = await Lesson.findOne({
          moduleId:    card._id,
          isPublished: true,
          _id:         { $nin: completedIds },
        }).sort('order').select('_id title order');
        if (next) { currentLesson = { ...next.toJSON(), moduleTitle: card.title, moduleId: card._id }; break; }
      }
    }

    const completedCount = user.completedLessons.length;
    const overallPct     = totalLessonsAll > 0 ? Math.round((completedCount / totalLessonsAll) * 100) : 0;

    res.json({
      success: true,
      data: {
        user: {
          id:              user._id,
          username:        user.username,
          fullName:        user.fullName,
          email:           user.email,
          avatar:          user.avatar,
          role:            user.role,
          isPremium:       user.isPremium,
          reputationScore: user.reputationScore,
        },
        stats: {
          completedLessons: completedCount,
          totalLessons:     totalLessonsAll,
          overallPct,
          totalPrompts,
          reputationScore:  user.reputationScore,
          modulesCompleted: moduleCards.filter((m) => m.progressPct === 100).length,
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
