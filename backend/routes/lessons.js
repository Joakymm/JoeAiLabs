const router = require('express').Router();
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const User   = require('../models/User');
const { protect } = require('../middleware/auth');

// ── GET /api/lessons/:id — get single lesson ──────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('moduleId', 'title order isPremium');
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    // Check premium lock
    const mod = lesson.moduleId;
    if (mod.isPremium && !req.user.isPremium && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Premium content. Upgrade to access.' });
    }

    const isCompleted = req.user.completedLessons.some(
      (p) => p.lessonId.toString() === lesson._id.toString()
    );

    // Find next lesson in module
    const nextLesson = await Lesson.findOne({ moduleId: mod._id, order: lesson.order + 1, isPublished: true })
      .select('_id title order');

    res.json({ success: true, data: { lesson, isCompleted, nextLesson } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/lessons/:id/complete — mark lesson complete ─────────────────────
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    const alreadyDone = req.user.completedLessons.some(
      (p) => p.lessonId.toString() === req.params.id
    );

    if (!alreadyDone) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { completedLessons: { lessonId: lesson._id, moduleId: lesson.moduleId } },
        $inc:  { reputationScore: 10 },
      });
    }

    // Recalculate module progress for response
    const user = await User.findById(req.user._id);
    const totalLessons = await Lesson.countDocuments({ moduleId: lesson.moduleId, isPublished: true });
    const moduleCompleted = user.completedLessons.filter(
      (p) => p.moduleId.toString() === lesson.moduleId.toString()
    ).length;
    const progressPct = totalLessons > 0 ? Math.round((moduleCompleted / totalLessons) * 100) : 0;

    res.json({
      success: true,
      message: alreadyDone ? 'Already completed.' : 'Lesson marked complete! +10 rep',
      data: { progressPct, moduleCompleted, totalLessons },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
