const router = require('express').Router();
const crypto = require('crypto');
const User = require('../models/User');
const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const { protect } = require('../middleware/auth');

// ── GET /api/certificates ──────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id }).populate('moduleId', 'title').sort('-issuedAt');
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/certificates/generate/:moduleId ───────────────────────────────
router.post('/generate/:moduleId', protect, async (req, res) => {
  try {
    const mod = await Module.findById(req.params.moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found.' });

    const existing = await Certificate.findOne({ userId: req.user._id, moduleId: req.params.moduleId });
    if (existing) return res.json({ success: true, data: existing, message: 'Certificate already exists.' });

    const lessonCount = mod.lessons?.length || 0;
    const user = await User.findById(req.user._id);
    const completedInModule = user.completedLessons.filter(
      l => l.moduleId.toString() === req.params.moduleId
    ).length;

    if (completedInModule < lessonCount) {
      return res.status(400).json({
        success: false,
        message: `Complete all ${lessonCount} lessons in this module first (${completedInModule}/${lessonCount}).`,
      });
    }

    const certId = `JEL-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const cert = await Certificate.create({
      userId: req.user._id,
      moduleId: req.params.moduleId,
      title: `${mod.title} — Completion Certificate`,
      certId,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { reputationScore: 25 } });

    res.status(201).json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/certificates/verify/:certId ────────────────────────────────────
router.get('/verify/:certId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certId: req.params.certId })
      .populate('userId', 'username fullName')
      .populate('moduleId', 'title');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
