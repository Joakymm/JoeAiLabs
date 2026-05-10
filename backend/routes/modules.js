const router = require('express').Router();
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/modules — list all modules with lesson counts ────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const modules = await Module.find({ isPublished: true }).sort('order');
    // Attach lesson count to each module
    const withCounts = await Promise.all(
      modules.map(async (mod) => {
        const count = await Lesson.countDocuments({ moduleId: mod._id, isPublished: true });
        const obj = mod.toJSON();
        obj.lessonCount = count;
        // Check if user has completed any lessons in this module
        const userCompleted = req.user.completedLessons.filter(
          (p) => p.moduleId.toString() === mod._id.toString()
        ).length;
        obj.userCompletedCount = userCompleted;
        obj.progressPct = count > 0 ? Math.round((userCompleted / count) * 100) : 0;
        // Lock check: premium modules require isPremium
        obj.isLocked = mod.isPremium && !req.user.isPremium && req.user.role !== 'admin';
        return obj;
      })
    );
    res.json({ success: true, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/modules/:id — single module with its lessons ─────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found.' });

    const isLocked = mod.isPremium && !req.user.isPremium && req.user.role !== 'admin';
    if (isLocked) return res.status(403).json({ success: false, message: 'Premium module. Upgrade to access.' });

    const lessons = await Lesson.find({ moduleId: mod._id, isPublished: true }).sort('order');
    const completedIds = new Set(req.user.completedLessons.map((p) => p.lessonId.toString()));
    const lessonsWithStatus = lessons.map((l) => ({
      ...l.toJSON(),
      isCompleted: completedIds.has(l._id.toString()),
    }));

    res.json({ success: true, data: { module: mod, lessons: lessonsWithStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/modules — admin: create module ──────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const mod = await Module.create(req.body);
    res.status(201).json({ success: true, data: mod });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
